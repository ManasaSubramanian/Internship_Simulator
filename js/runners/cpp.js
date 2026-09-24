// C++ runner: the JSCPP interpreter (vendor/jscpp.js, bundled locally so it
// works offline). JSCPP supports C-style C++: functions, arrays, char strings,
// <iostream>, <cmath>, <cstring>, <cstdlib>, <iomanip>. No STL containers.
// Each test compiles your functions plus a small main() that prints a result.
(function (root) {
  const TIMEOUT = 5000;
  const HEADER = '#include <iostream>\n#include <cmath>\n#include <cstring>\n#include <cstdlib>\nusing namespace std;\n';

  // A test is { call: 'expr', expected } or { main: 'statements', expected } or { call, bool: true }.
  function program(code, t) {
    let body = t.main;
    if (!body) body = t.bool ? `cout << ((${t.call}) ? "true" : "false") << endl;` : `cout << (${t.call}) << endl;`;
    const pre = /#include\s*<iostream>/.test(code) ? '' : HEADER;
    return pre + code + '\n\nint main() {\n' + (t.setup || '') + '\n' + body + '\nreturn 0;\n}\n';
  }

  // Compare outputs token by token; numbers match within a small tolerance.
  function sameOutput(got, expected) {
    const a = String(got).trim().split(/\s+/);
    const b = String(expected).trim().split(/\s+/);
    if (a.length !== b.length) return false;
    return a.every((x, i) => {
      const nx = Number(x);
      const ny = Number(b[i]);
      if (x !== '' && b[i] !== '' && !isNaN(nx) && !isNaN(ny)) return Math.abs(nx - ny) < 1e-4;
      return x === b[i];
    });
  }

  function runCore(JSCPP, data) {
    if (/\bint\s+main\s*\(/.test(data.code)) return { error: 'Remove your main() function. The grader supplies its own main() for each test.', logs: [] };
    let compileError = null;
    const results = data.tests.map((t) => {
      if (compileError) return { pass: false, got: 'not run' };
      let out = '';
      try {
        JSCPP.run(program(data.code, t), '', { stdio: { write: (s) => { out += s; } } });
        return { pass: sameOutput(out, t.expected), got: JSON.stringify(out.trim()) };
      } catch (e) {
        const msg = String(e.message || e).split('\n')[0];
        if (/^\d+:\d+/.test(msg) && !/runtime/i.test(msg)) compileError = msg;
        return { pass: false, got: 'error: ' + msg };
      }
    });
    if (compileError) return { error: 'Compile error (line numbers include the grader\'s #include lines): ' + compileError, logs: [] };
    return { results, logs: [] };
  }

  let loading = null;
  function loadLib() {
    if (root.IS_JSCPP_FACTORY) return Promise.resolve(true);
    if (loading) return loading;
    loading = new Promise((resolve) => {
      const s = document.createElement('script');
      s.src = 'vendor/jscpp.js';
      s.onload = () => resolve(true);
      s.onerror = () => resolve(false);
      document.head.appendChild(s);
    });
    return loading;
  }

  async function run(code, fnName, tests) {
    const ok = await loadLib();
    if (!ok) return { error: 'Could not load the C++ interpreter (vendor/jscpp.js).', logs: [] };
    const data = { code, tests };
    return new Promise((resolve) => {
      let worker;
      try {
        const src = 'self.window = self;\nconst JSCPP = (' + root.IS_JSCPP_FACTORY.toString() + ')();\n' +
          program.toString() + '\n' + sameOutput.toString() + '\n' + runCore.toString() + '\nconst HEADER = ' + JSON.stringify(HEADER) + ';\n' +
          'self.onmessage = (e) => self.postMessage(runCore(JSCPP, e.data));';
        worker = new Worker(URL.createObjectURL(new Blob([src], { type: 'text/javascript' })));
      } catch (e) {
        resolve(runCore(root.IS_JSCPP_FACTORY(), data));
        return;
      }
      const timer = setTimeout(() => {
        worker.terminate();
        resolve({ error: 'Time limit exceeded (' + TIMEOUT / 1000 + 's). Is there an infinite loop?', logs: [] });
      }, TIMEOUT);
      worker.onmessage = (e) => {
        clearTimeout(timer);
        worker.terminate();
        resolve(e.data);
      };
      worker.onerror = (e) => {
        clearTimeout(timer);
        worker.terminate();
        if (e.preventDefault) e.preventDefault();
        resolve({ error: 'Runtime error: ' + (e.message || 'unknown'), logs: [] });
      };
      worker.postMessage(data);
    });
  }

  const api = { run, runCore, program, sameOutput, label: 'C++ (JSCPP interpreter)' };
  if (typeof module !== 'undefined' && module.exports) module.exports = api;
  if (root.IS) {
    root.IS.runners = root.IS.runners || {};
    root.IS.runners.cpp = api;
  }
})(typeof window !== 'undefined' ? window : globalThis);
