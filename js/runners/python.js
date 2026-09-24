// Python runner: real CPython (Pyodide/WebAssembly) in a Web Worker, loaded from
// the jsDelivr CDN on first use (needs internet). numpy/pandas load on demand
// when your code imports them. The worker is killed and rebuilt on timeouts.
(function (root) {
  const CDN = 'https://cdn.jsdelivr.net/pyodide/v0.26.4/full/';
  const RUN_TIMEOUT = 6000;
  const LOAD_TIMEOUT = 120000;

  // Python-side harness. Globals __code, __fn, __tests are set before running.
  const HARNESS = [
    'import json, io, sys, math',
    'def __norm(v):',
    '    try:',
    '        import numpy as _np',
    '        if isinstance(v, _np.generic): return __norm(v.item())',
    '        if isinstance(v, _np.ndarray): return __norm(v.tolist())',
    '    except Exception: pass',
    '    if hasattr(v, "to_dict") and hasattr(v, "columns"): return __norm(v.to_dict(orient="list"))',
    '    if hasattr(v, "to_dict") and hasattr(v, "index"): return __norm(v.to_dict())',
    '    if hasattr(v, "tolist"): return __norm(v.tolist())',
    '    if isinstance(v, (list, tuple)): return [__norm(x) for x in v]',
    '    if isinstance(v, dict): return {str(k): __norm(x) for k, x in v.items()}',
    '    if isinstance(v, set): return sorted(__norm(x) for x in v)',
    '    if isinstance(v, float) and (math.isnan(v) or math.isinf(v)): return str(v)',
    '    return v',
    'def __run():',
    '    buf = io.StringIO()',
    '    old = sys.stdout',
    '    sys.stdout = buf',
    '    ns = {"__name__": "solution"}',
    '    try:',
    '        exec(__code, ns)',
    '    except Exception as e:',
    '        sys.stdout = old',
    '        return {"error": type(e).__name__ + ": " + str(e), "logs": buf.getvalue().splitlines()[:50]}',
    '    fn = ns.get(__fn)',
    '    if not callable(fn):',
    '        sys.stdout = old',
    '        return {"error": "Could not find a function named " + __fn + ". Did you rename it?", "logs": []}',
    '    results = []',
    '    for t in json.loads(__tests):',
    '        try:',
    '            results.append({"ok": True, "got": __norm(fn(*t["args"]))})',
    '        except Exception as e:',
    '            results.append({"ok": False, "err": type(e).__name__ + ": " + str(e)})',
    '    sys.stdout = old',
    '    return {"results": results, "logs": buf.getvalue().splitlines()[:50]}',
    'json.dumps(__run(), default=str)',
  ].join('\n');

  function deepEqual(a, b) {
    return root.IS && root.IS.runners && root.IS.runners.javascript
      ? root.IS.runners.javascript.deepEqual(a, b)
      : JSON.stringify(a) === JSON.stringify(b);
  }
  function show(v) {
    return v === undefined ? 'None' : JSON.stringify(v);
  }

  // Turn the raw harness output into the shared {results:[{pass, got}], logs, error} shape.
  function finish(raw, tests) {
    if (raw.error) return { error: raw.error, logs: raw.logs || [] };
    return {
      logs: raw.logs || [],
      results: raw.results.map((r, i) => (r.ok
        ? { pass: deepEqual(r.got, tests[i].expected), got: show(r.got) }
        : { pass: false, got: 'raised ' + r.err })),
    };
  }

  const WORKER_SRC = [
    'importScripts("' + CDN + 'pyodide.js");',
    'let py = null;',
    'const ready = loadPyodide({ indexURL: "' + CDN + '" }).then((p) => { py = p; self.postMessage({ ready: true }); }).catch((e) => self.postMessage({ ready: false, error: String(e) }));',
    'self.onmessage = async (e) => {',
    '  const d = e.data;',
    '  try { await ready; } catch (err) {}',
    '  if (!py) { self.postMessage({ id: d.id, raw: { error: "The Python runtime could not load. Python tasks need an internet connection the first time." } }); return; }',
    '  try { await py.loadPackagesFromImports(d.code); } catch (err) {}',
    '  try {',
    '    py.globals.set("__code", d.code); py.globals.set("__fn", d.fnName); py.globals.set("__tests", JSON.stringify(d.tests));',
    '    self.postMessage({ id: d.id, raw: JSON.parse(py.runPython(d.harness)) });',
    '  } catch (err) { self.postMessage({ id: d.id, raw: { error: String(err).split("\\n").slice(-2).join(" ") } }); }',
    '};',
  ].join('\n');

  let worker = null;
  let readyP = null;
  let seq = 0;
  const pending = {};

  function boot() {
    if (readyP) return readyP;
    readyP = new Promise((resolve) => {
      try {
        worker = new Worker(URL.createObjectURL(new Blob([WORKER_SRC], { type: 'text/javascript' })));
      } catch (e) {
        resolve({ ok: false, error: 'This browser blocked the Python worker: ' + e.message });
        return;
      }
      const t = setTimeout(() => resolve({ ok: false, error: 'Loading Python timed out. Check your internet connection.' }), LOAD_TIMEOUT);
      worker.onmessage = (e) => {
        const d = e.data;
        if ('ready' in d) {
          clearTimeout(t);
          resolve(d.ready ? { ok: true } : { ok: false, error: 'Could not load Python: ' + d.error });
          return;
        }
        const p = pending[d.id];
        if (p) {
          delete pending[d.id];
          p(d.raw);
        }
      };
      worker.onerror = (e) => {
        clearTimeout(t);
        resolve({ ok: false, error: 'Python worker error: ' + (e.message || 'unknown') });
      };
    });
    return readyP;
  }

  function reset() {
    if (worker) worker.terminate();
    worker = null;
    readyP = null;
  }

  async function run(code, fnName, tests) {
    const r = await boot();
    if (!r.ok) {
      reset();
      return { error: r.error, logs: [] };
    }
    return new Promise((resolve) => {
      const id = ++seq;
      const timer = setTimeout(() => {
        delete pending[id];
        reset();
        resolve({ error: 'Time limit exceeded (' + RUN_TIMEOUT / 1000 + 's). Is there an infinite loop?', logs: [] });
      }, RUN_TIMEOUT);
      pending[id] = (raw) => {
        clearTimeout(timer);
        resolve(finish(raw, tests));
      };
      worker.postMessage({ id, code, fnName, tests, harness: HARNESS });
    });
  }

  const api = { run, HARNESS, finish, warmUp: boot, label: 'Python 3 (Pyodide)' };
  if (typeof module !== 'undefined' && module.exports) module.exports = api;
  if (root.IS) {
    root.IS.runners = root.IS.runners || {};
    root.IS.runners.python = api;
  }
})(typeof window !== 'undefined' ? window : globalThis);
