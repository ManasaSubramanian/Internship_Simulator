// JavaScript runner: runs player code against test cases. In the browser the code executes in a
// Web Worker so an infinite loop can be killed; in Node (tests) it runs inline.
(function (root) {
  function deepEqual(a, b) {
    if (typeof a === 'number' && typeof b === 'number') {
      if (Number.isNaN(a) && Number.isNaN(b)) return true;
      return Math.abs(a - b) < 1e-6;
    }
    if (a === b) return true;
    if (a === null || b === null || typeof a !== 'object' || typeof b !== 'object') return false;
    if (Array.isArray(a) !== Array.isArray(b)) return false;
    if (Array.isArray(a)) {
      if (a.length !== b.length) return false;
      for (let i = 0; i < a.length; i++) if (!deepEqual(a[i], b[i])) return false;
      return true;
    }
    const ka = Object.keys(a);
    const kb = Object.keys(b);
    if (ka.length !== kb.length) return false;
    for (const k of ka) {
      if (!Object.prototype.hasOwnProperty.call(b, k) || !deepEqual(a[k], b[k])) return false;
    }
    return true;
  }

  function show(v) {
    if (v === undefined) return 'undefined';
    if (typeof v === 'number' && !Number.isFinite(v)) return String(v);
    try {
      return JSON.stringify(v);
    } catch (e) {
      return String(v);
    }
  }

  function runCore(data) {
    const logs = [];
    const fakeConsole = {
      log: function () {
        if (logs.length < 50) logs.push(Array.prototype.map.call(arguments, show).join(' '));
      },
    };
    fakeConsole.error = fakeConsole.warn = fakeConsole.info = fakeConsole.log;
    let fn;
    try {
      fn = new Function('console', '"use strict";\n' + data.code +
        '\n;return typeof ' + data.fnName + ' === "function" ? ' + data.fnName + ' : undefined;')(fakeConsole);
    } catch (err) {
      return { error: err.name + ': ' + err.message, logs: logs };
    }
    if (!fn) return { error: 'Could not find a function named ' + data.fnName + '. Did you rename it?', logs: logs };
    const results = data.tests.map(function (t) {
      try {
        const args = JSON.parse(JSON.stringify(t.args));
        const got = fn.apply(null, args);
        return { pass: deepEqual(got, t.expected), got: show(got) };
      } catch (err) {
        return { pass: false, got: 'threw ' + err.name + ': ' + err.message };
      }
    });
    return { results: results, logs: logs };
  }

  const TIMEOUT_MS = 2500;
  let workerUrl = null;

  function getWorkerUrl() {
    if (workerUrl) return workerUrl;
    const src = [deepEqual.toString(), show.toString(), runCore.toString(),
      'self.onmessage = function (e) { self.postMessage(runCore(e.data)); };'].join('\n');
    workerUrl = URL.createObjectURL(new Blob([src], { type: 'text/javascript' }));
    return workerUrl;
  }

  function run(code, fnName, tests) {
    const data = { code: code, fnName: fnName, tests: tests };
    return new Promise(function (resolve) {
      let worker;
      try {
        worker = new Worker(getWorkerUrl());
      } catch (e) {
        // Some browsers block blob workers on file:// pages. Fall back to inline.
        resolve(runCore(data));
        return;
      }
      const timer = setTimeout(function () {
        worker.terminate();
        resolve({ error: 'Time limit exceeded (' + TIMEOUT_MS / 1000 + 's). Is there an infinite loop?', logs: [] });
      }, TIMEOUT_MS);
      worker.onmessage = function (e) {
        clearTimeout(timer);
        worker.terminate();
        resolve(e.data);
      };
      worker.onerror = function (e) {
        clearTimeout(timer);
        worker.terminate();
        e.preventDefault && e.preventDefault();
        resolve({ error: 'Runtime error: ' + (e.message || 'unknown'), logs: [] });
      };
      worker.postMessage(data);
    });
  }

  const api = { run: run, runCore: runCore, deepEqual: deepEqual, show: show };
  if (typeof module !== 'undefined' && module.exports) module.exports = api;
  if (root.IS) {
    root.IS.runners = root.IS.runners || {};
    root.IS.runners.javascript = api;
    root.IS.codeRunner = api;
  }
})(typeof window !== 'undefined' ? window : globalThis);
