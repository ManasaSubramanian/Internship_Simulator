// SQL runner: real SQLite (sql.js / WebAssembly) loaded from the jsDelivr CDN
// on first use. Each SQL task is checked against two databases: the one you
// can see, and a hidden one with different rows (so hard-coding won't pass).
(function (root) {
  const CDN = 'https://cdn.jsdelivr.net/npm/sql.js@1.10.3/dist/';
  let SQLp = null;

  function load() {
    if (SQLp) return SQLp;
    SQLp = new Promise((resolve) => {
      const done = () => root.initSqlJs({ locateFile: (f) => CDN + f }).then((SQL) => resolve({ SQL })).catch((e) => resolve({ error: String(e) }));
      if (root.initSqlJs) return done();
      const s = document.createElement('script');
      s.src = CDN + 'sql-wasm.js';
      s.onload = done;
      s.onerror = () => resolve({ error: 'Could not load SQLite. SQL tasks need an internet connection the first time.' });
      document.head.appendChild(s);
    });
    SQLp.then((r) => { if (r.error) SQLp = null; });
    return SQLp;
  }

  // Run one query against a fresh database. Returns { columns, rows } or { error }.
  function exec(SQL, schema, seed, query) {
    const db = new SQL.Database();
    try {
      db.run(schema);
      db.run(seed);
    } catch (e) {
      db.close();
      return { error: 'Seed error: ' + e.message };
    }
    try {
      const res = db.exec(query);
      const last = res[res.length - 1];
      return last ? { columns: last.columns, rows: last.values } : { columns: [], rows: [] };
    } catch (e) {
      return { error: e.message };
    } finally {
      db.close();
    }
  }

  function normRow(r) {
    return r.map((v) => (typeof v === 'number' ? Math.round(v * 1e6) / 1e6 : v));
  }

  function sameResult(got, want, ordered) {
    if (got.error) return false;
    if (got.columns.length !== want.columns.length) return false;
    if (got.rows.length !== want.rows.length) return false;
    const a = got.rows.map(normRow).map((r) => JSON.stringify(r));
    const b = want.rows.map(normRow).map((r) => JSON.stringify(r));
    if (!ordered) {
      a.sort();
      b.sort();
    }
    return a.every((x, i) => x === b[i]);
  }

  // expected: [{columns, rows}] one per seed (precomputed from the reference query).
  function grade(SQL, db, task, query, expected) {
    const results = db.seeds.map((seed, i) => {
      const got = exec(SQL, db.schema, seed, query);
      if (got.error) return { pass: false, got: 'SQL error: ' + got.error };
      const pass = sameResult(got, expected[i], task.ordered);
      return { pass, got: got.rows.length + ' row' + (got.rows.length === 1 ? '' : 's') + ' × ' + got.columns.length + ' col' + (pass ? '' : ` (expected ${expected[i].rows.length} × ${expected[i].columns.length}${task.ordered ? ', in order' : ''})`) };
    });
    return { results, logs: [] };
  }

  async function run(task, query, db, expected, onlyPreview) {
    const r = await load();
    if (r.error) return { error: r.error, logs: [] };
    const preview = exec(r.SQL, db.schema, db.seeds[0], query);
    if (onlyPreview) return { preview };
    const out = grade(r.SQL, db, task, query, expected);
    out.preview = preview;
    return out;
  }

  const api = { run, load, exec, sameResult, grade, label: 'SQLite (sql.js)' };
  if (typeof module !== 'undefined' && module.exports) module.exports = api;
  if (root.IS) {
    root.IS.runners = root.IS.runners || {};
    root.IS.runners.sql = api;
  }
})(typeof window !== 'undefined' ? window : globalThis);
