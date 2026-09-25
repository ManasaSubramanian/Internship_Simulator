// Shared practice-problem kit: editor markup, mounting, running and results.
// Used by the interview's live problem and by the Learning Center.
// Problem types: coding (javascript | python | cpp), sql, web, config (YAML),
// terminal (simulated shell) and choice (multiple choice with explanations).
// ctx: { trackId, db } tells SQL problems which database and expected results to use.
IS.problem = (function () {
  const U = IS.util;
  const shells = {};

  const kindOf = (p) => p.type || 'coding';

  function editor(p, code, prefix, ctx) {
    const kind = kindOf(p);
    let body;
    if (kind === 'choice') {
      body = `<div class="choice-list" id="${prefix}-choices">${p.options.map((o, i) => `<label class="opt"><input type="radio" name="${prefix}-opt" value="${i}" ${String(code) === String(i) ? 'checked' : ''}> <span>${U.esc(o)}</span></label>`).join('')}</div>`;
    } else if (kind === 'terminal') {
      body = `<div class="terminal" id="${prefix}-term" style="height:240px"><div id="${prefix}-out">${U.esc(p.motd || 'Simulated Linux shell. Type help to list commands.')}\n\n</div><div style="display:flex"><span class="ps1" id="${prefix}-ps1">intern@showctl:~$ </span><input id="${prefix}-in" autocomplete="off" spellcheck="false" aria-label="Shell input"></div></div>
        <div class="objective-list" id="${prefix}-obj" style="margin-top:10px"></div>`;
    } else {
      const db = kind === 'sql' && ctx && ctx.db;
      body = `<textarea class="editor" id="${prefix}-code" spellcheck="false" aria-label="Code editor" style="min-height:200px">${U.esc(code)}</textarea>` +
        (kind === 'web' ? `<iframe class="preview-frame" id="${prefix}-preview" sandbox="allow-scripts allow-same-origin" style="height:200px;margin-top:8px" title="Preview"></iframe>` : '') +
        (db ? `<details style="margin-top:8px"><summary class="small" style="cursor:pointer;font-weight:800">📚 Database tables (click to open)</summary><pre style="white-space:pre-wrap">${U.esc(db.schema.replace(/;\s*/g, ';\n'))}</pre></details>` : '');
    }
    return body;
  }

  function note(p) {
    const kind = kindOf(p);
    if (kind === 'coding' && p.lang === 'python') return 'Runs real Python in your browser. The first run downloads Python (about 10 MB).';
    if (kind === 'coding' && p.lang === 'cpp') return 'Write only the function. The checker adds main() for you.';
    if (kind === 'sql') return 'Runs on a real SQLite database (downloaded the first time).';
    if (kind === 'terminal') return 'Type a command and press Enter. The objectives tick off as you complete them.';
    return '';
  }

  // Wire up inputs. setCode(value) is called whenever the answer changes.
  function mount(p, prefix, code, setCode) {
    const kind = kindOf(p);
    if (kind === 'choice') {
      document.querySelectorAll(`input[name="${prefix}-opt"]`).forEach((r) => r.addEventListener('change', () => setCode(r.value)));
      return;
    }
    if (kind === 'terminal') {
      if (!shells[prefix]) shells[prefix] = IS.runners.shell.create(p.fs);
      const sh = shells[prefix];
      const out = document.getElementById(prefix + '-out');
      const input = document.getElementById(prefix + '-in');
      const drawObj = () => {
        document.getElementById(prefix + '-obj').innerHTML = p.objectives.map((o) => {
          let ok = false;
          try { ok = !!o.check(sh); } catch (e) { ok = false; }
          return `<div class="obj ${ok ? 'done' : ''}">${ok ? '✅' : '⬜'} ${U.esc(o.text)}</div>`;
        }).join('');
      };
      sh.history.forEach((h) => out.insertAdjacentHTML('beforeend', `<span class="ps1">$ </span>${U.esc(h.cmd)}\n${U.esc(h.out)}`));
      document.getElementById(prefix + '-ps1').textContent = sh.prompt();
      drawObj();
      input.addEventListener('keydown', (e) => {
        if (e.key !== 'Enter') return;
        const cmd = input.value;
        const prompt = sh.prompt();
        const r = cmd.trim() ? sh.exec(cmd) : { out: '' };
        if (r.clear) out.innerHTML = '';
        else out.insertAdjacentHTML('beforeend', `<span class="ps1">${U.esc(prompt)}</span>${U.esc(cmd)}\n${U.esc(r.out)}`);
        document.getElementById(prefix + '-ps1').textContent = sh.prompt();
        input.value = '';
        out.parentElement.scrollTop = out.parentElement.scrollHeight;
        drawObj();
        setCode(sh.history.map((h) => h.cmd));
      });
      return;
    }
    const ta = document.getElementById(prefix + '-code');
    ta.addEventListener('input', () => setCode(ta.value));
    ta.addEventListener('keydown', (e) => {
      if (e.key === 'Tab') {
        e.preventDefault();
        ta.setRangeText(p.lang === 'python' ? '    ' : '  ', ta.selectionStart, ta.selectionEnd, 'end');
        setCode(ta.value);
      }
    });
  }

  // which: 'visible' (only visible tests) or 'all' (visible + hidden).
  function run(p, code, prefix, which, ctx) {
    const kind = kindOf(p);
    const all = which === 'all';
    const preview = document.getElementById(prefix + '-preview');
    if (kind === 'choice') {
      if (code == null || code === '') return Promise.resolve({ error: 'Pick an answer first.' });
      const pass = +code === p.answer;
      return Promise.resolve({ results: [{ pass, label: pass ? 'Correct!' : 'Not quite.', got: '' }], explain: p.explain });
    }
    if (kind === 'coding') return IS.runners[p.lang].run(code, p.fnName, all ? p.tests.concat(p.hidden || []) : p.tests);
    if (kind === 'sql') {
      const exp = IS.sqlExpected && IS.sqlExpected[ctx.trackId] && IS.sqlExpected[ctx.trackId][p.id];
      if (!exp) return Promise.resolve({ error: 'Expected results are missing for this problem.' });
      return IS.runners.sql.run(p, code, ctx.db, exp);
    }
    if (kind === 'web') return IS.runners.web.run(p, code, preview, all ? 'all' : 'visible');
    if (kind === 'config') return Promise.resolve(IS.runners.yaml.grade(all ? p : Object.assign({}, p, { checks: p.checks.filter((c) => !c.hidden) }), code));
    if (kind === 'terminal') {
      if (!shells[prefix]) shells[prefix] = IS.runners.shell.create(p.fs);
      return Promise.resolve(IS.runners.shell.grade(p, shells[prefix]));
    }
    return Promise.resolve({ error: 'Unknown problem type' });
  }

  const passedAll = (r) => !r.error && r.results.length > 0 && r.results.every((x) => x.pass);

  function results(r) {
    if (r.error) return `<div class="test fail">⚠️ ${U.esc(r.error)}</div>`;
    const passed = r.results.filter((x) => x.pass).length;
    return `<div class="spread" style="margin:8px 0"><b>Results</b><span class="pill ${passed === r.results.length ? 'good' : 'bad'}">${passed}/${r.results.length}</span></div>` +
      r.results.map((x, i) => `<div class="test ${x.pass ? 'pass' : 'fail'}">${x.pass ? '✅' : '❌'} ${U.esc(x.label || 'Test #' + (i + 1))} <span class="muted">${x.pass ? '' : U.esc(x.got || '')}</span></div>`).join('') +
      (r.explain ? `<div class="explain">${r.explain}</div>` : '');
  }

  function resetShell(prefix) { delete shells[prefix]; }
  function clearShells() { Object.keys(shells).forEach((k) => delete shells[k]); }

  return { editor, note, mount, run, results, passedAll, resetShell, clearShells, kindOf };
})();
