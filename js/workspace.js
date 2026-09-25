// The assignment workspace inside your computer: brief, the right editor for
// each task type (code in JS/Python/C++, SQL, terminal, web page, YAML config,
// quiz, code review, writing, slide deck), focus time, help and submission.
IS.workspace = (function () {
  const U = IS.util;
  const E = () => IS.engine;
  const st = () => IS.state.get();
  const shells = {}; // live shell objects per task id

  let saveTimer = null;
  const saveSoon = () => {
    clearTimeout(saveTimer);
    saveTimer = setTimeout(() => IS.state.save(), 400);
  };

  const LANG_NAME = { javascript: 'JavaScript', python: 'Python 3', cpp: 'C++' };

  function ensureDraft(task, r) {
    if (r.draft != null) return r.draft;
    if (['coding', 'sql', 'web', 'config'].includes(task.type)) r.draft = task.starter;
    else if (task.type === 'quiz') r.draft = { answers: {} };
    else if (task.type === 'review') r.draft = { picks: [], comment: '' };
    else if (task.type === 'written') r.draft = '';
    else if (task.type === 'presentation') r.draft = { slides: [{ type: 'title', text: '' }] };
    else if (task.type === 'terminal') r.draft = null;
    return r.draft;
  }

  function shellFor(task, r) {
    if (shells[task.id]) return shells[task.id];
    const sh = IS.runners.shell.create(task.fs);
    if (r && r.draft) {
      try { sh.restore(r.draft); } catch (e) { /* start fresh */ }
    }
    shells[task.id] = sh;
    return sh;
  }

  function dueCountdown(task) {
    const left = E().dueAbs(task) - E().now();
    if (left < 0) return '<span class="pill bad">Overdue</span>';
    const days = Math.floor(left / U.DAY_LENGTH);
    const mins = left % U.DAY_LENGTH;
    return `<span class="pill ${left <= U.DAY_LENGTH ? 'warn' : ''}">⏳ ${days ? days + ' workday' + (days > 1 ? 's' : '') + ' ' : ''}${Math.floor(mins / 60)}h ${Math.round(mins % 60)}m of work time left</span>`;
  }

  // ── Results rendering (shared) ──────────────────────────
  function resultsHtml(task, run, visibleCount) {
    if (!run) return '';
    if (run.error) return `<div class="test fail">⚠️ ${U.esc(run.error)}</div>`;
    const passed = run.results.filter((x) => x.pass).length;
    const tests = task.type === 'coding' ? task.tests.concat(task.hidden || []) : null;
    return `<div class="spread" style="margin:8px 0"><b>Results</b><span class="pill ${passed === run.results.length ? 'good' : 'bad'}">${passed}/${run.results.length} passing</span></div>` +
      run.results.map((res, i) => {
        let label;
        if (res.label) label = (res.hidden ? '🔒 Hidden check: ' : '') + U.esc(res.label) + (res.pass ? '' : ` <span class="muted">(${U.esc(res.got)})</span>`);
        else if (task.type === 'sql') label = (i === 0 ? 'Visible database' : 'Hidden database') + ': ' + U.esc(res.got);
        else if (i >= visibleCount) label = 'Hidden test #' + (i - visibleCount + 1) + (res.pass ? '' : '');
        else {
          const t = tests[i];
          const call = t.call ? t.call : `${task.fnName}(${(t.args || []).map((a) => JSON.stringify(a)).join(', ')})`;
          label = `${U.esc(call)}<br>expected ${U.esc(t.expected !== undefined ? JSON.stringify(t.expected) : '')}${res.pass ? '' : ', got ' + U.esc(res.got)}`;
        }
        return `<div class="test ${res.pass ? 'pass' : 'fail'}">${res.pass ? '✅' : '❌'} <div>${label}</div></div>`;
      }).join('') + (run.logs && run.logs.length ? `<div class="console">${run.logs.map(U.esc).join('\n')}</div>` : '');
  }

  function tableHtml(res) {
    if (!res) return '';
    if (res.error) return `<div class="test fail">⚠️ ${U.esc(res.error)}</div>`;
    if (!res.columns.length) return '<p class="muted small">Query ran. No rows returned.</p>';
    return `<div style="overflow-x:auto"><table class="tbl"><tr>${res.columns.map((c) => `<th>${U.esc(c)}</th>`).join('')}</tr>${res.rows.slice(0, 50).map((r) => `<tr>${r.map((v) => `<td>${U.esc(v === null ? 'NULL' : v)}</td>`).join('')}</tr>`).join('')}</table></div>` +
      `<p class="small muted">${res.rows.length} row${res.rows.length === 1 ? '' : 's'}${res.rows.length > 50 ? ' (showing 50)' : ''}</p>`;
  }

  // ── Editors ─────────────────────────────────────────────
  function codingEditor(task, r) {
    const lang = task.lang || 'javascript';
    const note = lang === 'python' ? 'Runs real Python 3 in your browser. The first run downloads Python (~10 MB) and needs internet.'
      : lang === 'cpp' ? 'C-style C++ (arrays, char strings, &lt;cmath&gt;, &lt;cstring&gt;). No STL containers. Don\'t write main(); the grader adds one.' : '';
    return `<div class="panel"><div class="spread"><h3 style="margin:0">💻 ${LANG_NAME[lang]}: <code>${U.esc(task.fnName)}</code></h3>
        <div class="row"><button class="btn small ghost" data-act="resetCode" data-arg="${task.id}">↺ Reset</button>
        <button class="btn small primary" data-act="runTests" data-arg="${task.id}">▶ Run visible tests${st().job.clockedIn ? ' (1 min)' : ''}</button></div></div>
      ${note ? `<p class="small muted" style="margin:6px 0">${note}</p>` : ''}
      <textarea class="editor" id="ws-code" spellcheck="false" aria-label="Code editor" style="margin-top:8px">${U.esc(r.draft)}</textarea>
      <p class="small muted">Visible tests: ${task.tests.length}. Hidden tests on submit: ${(task.hidden || []).length}. Grading: 85% tests, 15% code quality.</p>
      <div id="ws-results">${r.lastRun ? resultsHtml(task, r.lastRun, task.tests.length) : ''}</div></div>`;
  }

  function sqlEditor(task, r) {
    const db = task.db || E().track().db;
    return `<div class="panel"><div class="spread"><h3 style="margin:0">🗄️ SQL editor</h3>
        <div class="row"><button class="btn small ghost" data-act="resetCode" data-arg="${task.id}">↺ Reset</button><button class="btn small primary" data-act="runSql" data-arg="${task.id}">▶ Run query</button></div></div>
      <details style="margin:8px 0"><summary class="small" style="cursor:pointer;font-weight:800">📚 Database schema</summary><pre style="white-space:pre-wrap">${U.esc(db.schema.replace(/;\s*/g, ';\n'))}</pre></details>
      <textarea class="editor" id="ws-code" spellcheck="false" style="min-height:180px">${U.esc(r.draft)}</textarea>
      <p class="small muted">Your query is graded on the visible database <b>and</b> a hidden one with different rows${task.ordered ? ', and row order matters' : ''}. Uses SQLite (loads from the internet the first time).</p>
      <div id="ws-results">${r.lastPreview ? tableHtml(r.lastPreview) : ''}</div></div>`;
  }

  function terminalEditor(task, r) {
    const sh = shellFor(task, r);
    const hist = sh.history.slice(-60).map((h) => `<span class="ps1">${U.esc(h.prompt || 'intern@showctl')}</span>${U.esc(h.cmd)}\n${U.esc(h.out)}`).join('');
    return `<div class="panel"><div class="spread"><h3 style="margin:0">⌨️ Terminal</h3><button class="btn small ghost" data-act="resetShell" data-arg="${task.id}">↺ Reset machine</button></div>
      <p class="small muted" style="margin:6px 0">Type <code>help</code> for commands and <code>man grep</code> for details. Pipes, redirection and wildcards work.</p>
      <div class="terminal" id="ws-term"><div id="ws-term-out">${U.esc(task.motd || 'Welcome to showctl-01 (simulated Linux).')}\n\n${hist}</div><div style="display:flex;gap:0"><span class="ps1" id="ws-ps1">${U.esc(sh.prompt())}</span><input id="ws-term-in" autocomplete="off" spellcheck="false" aria-label="Shell input"></div></div>
      <h3 style="margin-top:12px">Objectives</h3><div class="objective-list" id="ws-obj">${objectivesHtml(task, sh)}</div></div>`;
  }

  function objectivesHtml(task, sh) {
    return task.objectives.map((o) => {
      let ok = false;
      try { ok = !!o.check(sh); } catch (e) { ok = false; }
      return `<div class="obj ${ok ? 'done' : ''}">${ok ? '✅' : '⬜'} ${U.esc(o.text)}</div>`;
    }).join('');
  }

  function webEditor(task, r) {
    return `<div class="panel"><div class="spread"><h3 style="margin:0">🌐 index.html</h3>
        <div class="row"><button class="btn small ghost" data-act="resetCode" data-arg="${task.id}">↺ Reset</button><button class="btn small primary" data-act="runWeb" data-arg="${task.id}">▶ Preview &amp; run checks</button></div></div>
      <textarea class="editor" id="ws-code" spellcheck="false" style="margin-top:8px;min-height:260px">${U.esc(r.draft)}</textarea>
      <h3 style="margin-top:10px">Preview</h3><iframe class="preview-frame" id="ws-preview" sandbox="allow-scripts allow-same-origin" title="Page preview"></iframe>
      <p class="small muted">Visible checks: ${task.checks.filter((c) => !c.hidden).length}. Hidden checks on submit: ${task.checks.filter((c) => c.hidden).length}.</p>
      <div id="ws-results">${r.lastRun ? resultsHtml(task, r.lastRun, 99) : ''}</div></div>`;
  }

  function configEditor(task, r) {
    return `<div class="panel"><div class="spread"><h3 style="margin:0">⚙️ ${U.esc(task.filename || 'config.yaml')}</h3>
        <div class="row"><button class="btn small ghost" data-act="resetCode" data-arg="${task.id}">↺ Reset</button><button class="btn small primary" data-act="runYaml" data-arg="${task.id}">▶ Validate</button></div></div>
      <textarea class="editor" id="ws-code" spellcheck="false" style="margin-top:8px;min-height:240px">${U.esc(r.draft)}</textarea>
      <div id="ws-results">${r.lastRun ? resultsHtml(task, r.lastRun, 99) : ''}</div></div>`;
  }

  function quizEditor(task, r) {
    return `<div class="panel"><h3>📝 Questions</h3>${task.questions.map((q, i) => `<div class="quiz-q"><b>${i + 1}. ${U.esc(q.q)}</b>
      ${q.options.map((o, j) => `<label class="opt"><input type="radio" name="q${i}" data-quiz="${i}" value="${j}" ${r.draft.answers[i] === j ? 'checked' : ''}> <span>${U.esc(o)}</span></label>`).join('')}</div>`).join('')}</div>`;
  }

  function reviewEditor(task, r) {
    return `<div class="panel"><h3>🔍 Pull request diff</h3><pre>${U.esc(task.code)}</pre>
      <h3 style="margin-top:14px">Flag the real problems</h3>
      ${task.issues.map((iss, i) => `<label class="check-item"><input type="checkbox" data-pick="${i}" ${r.draft.picks.includes(i) ? 'checked' : ''}> <span>${U.esc(iss.text)}</span></label>`).join('')}
      <label class="field" style="margin-top:12px"><span>Review comment (specific and kind)</span><textarea id="ws-comment" placeholder="Thanks for this! A few things to consider before merging…">${U.esc(r.draft.comment)}</textarea></label></div>`;
  }

  function writtenEditor(task, r) {
    return `<div class="panel"><div class="spread"><h3 style="margin:0">✍️ Your draft</h3><span class="pill" id="ws-wc">${U.words(r.draft).length} / ${task.rubric.minWords}+ words</span></div>
      <p class="small muted">Reviewers look for: ${task.rubric.sections.map((s) => '<b>' + s.label + '</b>').join(' · ')}. Headings help!</p>
      <textarea id="ws-text" style="min-height:320px" placeholder="Start writing…">${U.esc(r.draft)}</textarea></div>`;
  }

  function presEditor(task, r) {
    const slides = r.draft.slides;
    return `<div class="panel"><div class="spread"><h3 style="margin:0">🎞️ Deck builder</h3><span class="pill">${slides.length} slides · target ${task.slideRange[0]}–${task.slideRange[1]}</span></div>
      <p class="small muted">Pick a slide type and write 1–3 short bullets for each (one per line, 8–60 words per slide). Submit to present live.</p>
      ${slides.map((sl, i) => `<div class="slide-edit"><div class="num">${i + 1}</div>
        <select data-slide-type="${i}" aria-label="Slide ${i + 1} type">${IS.slideTypes.map((t) => `<option value="${t.id}" ${sl.type === t.id ? 'selected' : ''}>${t.icon} ${t.label}</option>`).join('')}</select>
        <textarea data-slide-text="${i}" placeholder="${U.esc((IS.slideTypes.find((t) => t.id === sl.type) || {}).tip || '')}">${U.esc(sl.text)}</textarea>
        <div class="ctrl"><button class="btn small ghost" data-act="slideMove" data-arg="${task.id}|${i}|-1" title="Move up">▲</button><button class="btn small ghost" data-act="slideMove" data-arg="${task.id}|${i}|1" title="Move down">▼</button><button class="btn small ghost" data-act="slideDel" data-arg="${task.id}|${i}" title="Delete">✕</button></div></div>`).join('')}
      <button class="btn" data-act="slideAdd" data-arg="${task.id}">＋ Add slide</button></div>`;
  }

  // ── Graded view ─────────────────────────────────────────
  function gradedView(task, r) {
    if (r.status === 'missed') return `<div class="panel"><h2>❌ Missed</h2><p>More than two workdays late, so this was marked missed (0%) and a pay adjustment was applied.</p></div>`;
    if (r.status === 'expired') return `<div class="panel"><h2>Closed</h2><p>This optional stretch task closed without a submission. No penalty.</p></div>`;
    const sub = r.submission || {};
    let body = '';
    if (['coding', 'sql', 'web', 'config'].includes(task.type)) body = `<h3>Your ${task.type === 'sql' ? 'query' : task.type === 'web' ? 'page' : task.type === 'config' ? 'config' : 'code'}</h3><pre>${U.esc(sub.code)}</pre>` + (sub.run ? resultsHtml(task, sub.run, task.type === 'coding' ? task.tests.length : 99) : '');
    else if (task.type === 'terminal') body = `<h3>Objectives</h3>` + (sub.run ? resultsHtml(task, sub.run, 99) : '') + `<h3>Your commands</h3><pre>${U.esc((sub.commands || []).join('\n'))}</pre>`;
    else if (task.type === 'quiz') body = task.questions.map((q, i) => `<p><b>${i + 1}. ${U.esc(q.q)}</b><br>${sub.answers[i] === q.answer ? '✅' : '❌'} ${U.esc(q.options[sub.answers[i]] || '(no answer)')}${sub.answers[i] === q.answer ? '' : `<br><span class="muted">Correct: ${U.esc(q.options[q.answer])}</span>`}</p>`).join('');
    else if (task.type === 'review') body = task.issues.map((iss, i) => { const p = sub.picks.includes(i); return `<div class="small" style="margin-bottom:4px">${iss.real ? (p ? '✅ found' : '⚠️ missed') : (p ? '❌ false alarm' : '✔️ correctly ignored')}: ${U.esc(iss.text)}</div>`; }).join('') + `<h3 style="margin-top:10px">Your comment</h3><pre style="white-space:pre-wrap">${U.esc(sub.comment)}</pre>`;
    else if (task.type === 'written') body = `<h3>Your submission</h3><pre style="white-space:pre-wrap">${U.esc(sub.text)}</pre>`;
    else if (task.type === 'presentation') body = `<h3>Your deck</h3>` + sub.slides.map((sl, i) => { const t = IS.slideTypes.find((x) => x.id === sl.type); return `<div class="small" style="margin-bottom:6px"><b>${i + 1}. ${t.icon} ${t.label}</b><div class="muted" style="white-space:pre-wrap">${U.esc(sl.text)}</div></div>`; }).join('');
    return `<div class="panel"><div class="row" style="gap:18px"><div class="big-grade ${U.gradeClass(r.score)}">${U.letter(r.score)}</div>
        <div><h2 style="margin:0">${r.score}%</h2><div class="small muted">Submitted ${U.weekday(r.submittedDay)} (Day ${r.submittedDay}) at ${U.clock(r.submittedMinute)}${r.early ? ' · 🐦 a full day early' : ''}</div>
        ${r.penalty ? `<div class="small" style="color:var(--bad)">Raw ${r.rawScore}% − ${r.penalty}% late penalty (${r.daysLate} workday${r.daysLate > 1 ? 's' : ''} late)</div>` : ''}</div></div>
      <table class="tbl" style="margin-top:14px"><tr><th>Rubric</th><th></th><th class="num">Points</th></tr>${r.breakdown.map((b) => `<tr><td>${U.esc(b.label)}</td><td class="muted small">${U.esc(b.note)}</td><td class="num">${b.earned}${b.max ? ' / ' + b.max : ''}</td></tr>`).join('')}</table>
      ${(r.notes || []).length ? `<h3 style="margin-top:14px">Reviewer notes</h3><ul>${r.notes.map((n) => `<li>${U.esc(n)}</li>`).join('')}</ul>` : ''}</div>
      <div class="panel" style="margin-top:14px">${body}</div>`;
  }

  // ── Side panel ──────────────────────────────────────────
  function sidePanel(task, r) {
    const j = st().job;
    const on = j.clockedIn;
    const pct = Math.min(100, Math.round(r.progress / task.effort * 100));
    const can = E().canSubmit(task.id);
    const peer = IS.characters[task.peer.who];
    const mentor = IS.characters[E().cast().mentor];
    const log = (r.helpLog || []).slice().reverse();
    const related = IS.learn.related(task, E().track().id, 2);
    return `<div class="ws-side">
      <div class="panel"><h3>⏱️ Focus time</h3>
        <div class="spread small"><span>${Math.floor(r.progress)} / ${task.effort} min logged</span><span>${pct}%</span></div><div class="bar"><span style="width:${pct}%"></span></div>
        <p class="small muted" style="margin-top:6px">${on ? `At ${Math.round(E().productivity() * 100)}% productivity, 30 min of work logs ${Math.round(30 * E().productivity())} min.` : 'Badge in to log work time.'}</p>
        <div class="row">${[15, 30, 60].map((m) => `<button class="btn small" data-act="work" data-arg="${task.id}|${m}" ${on && pct < 100 ? '' : 'disabled'}>Work ${m}m</button>`).join('')}</div></div>
      <div class="panel"><h3>🙋 Get help</h3><div class="stack">
        <button class="btn small block" data-act="taskHelp" data-arg="mentor|${task.id}" ${on ? '' : 'disabled'}>💬 Message ${U.esc(mentor.short)} (mentor) · 15m <span class="muted">${r.hintsUsed}/${task.hints.length}</span></button>
        <button class="btn small block" data-act="taskHelp" data-arg="peer|${task.id}" ${on ? '' : 'disabled'}>💬 Message ${U.esc(peer.short)} · 10m</button>
        <button class="btn small block" data-act="taskHelp" data-arg="wiki|${task.id}" ${on ? '' : 'disabled'}>📚 Search the wiki · 5m</button>
        ${E().hasDuck() ? `<button class="btn small block" data-act="taskHelp" data-arg="duck|${task.id}" ${on && j.duckDay !== j.day ? '' : 'disabled'}>🦆 Rubber duck · 5m (1/day)</button>` : ''}
        <button class="btn small block ghost" data-act="taskHelp" data-arg="extension|${task.id}" ${on && !r.extRequested ? '' : 'disabled'}>📅 Ask for an extension · 5m</button></div>
        ${related.length ? `<div class="related"><div class="small" style="font-weight:900;margin:10px 0 6px">📖 Learn the concepts (free, no time used)</div>${related.map((x) => `<button class="btn small block ghost" data-act="learn" data-arg="${x.trackId}|${x.t.id}">${x.t.icon || '📘'} ${U.esc(x.t.title)}</button>`).join('')}</div>` : `<button class="btn small block ghost" style="margin-top:8px" data-act="learn">📖 Open the Learning Center</button>`}
        <p class="small muted" style="margin:8px 0 0">Tip: you can also walk over and ask people in person.</p>
        ${log.length ? `<div style="margin-top:10px;max-height:280px;overflow-y:auto">${log.map((h) => `<div class="help-msg">${h.who ? `<span style="border-radius:8px;overflow:hidden;line-height:0;flex:none">${IS.people.portrait(h.who, 30)}</span>` : '<span style="font-size:1.3rem">📚</span>'}<div>${h.html || U.esc(h.text)}</div></div>`).join('')}</div>` : ''}</div>
      <div class="panel" ${can.ok ? 'style="box-shadow:0 0 0 3px var(--gold), var(--shadow)"' : ''}><h3>📤 Submit</h3>
        <p class="small muted">${can.ok ? (task.type === 'presentation' ? 'Ready? Submitting takes you on stage to present live.' : 'Submitting is final and takes 5 minutes.') : U.esc(can.why)}</p>
        <button class="btn gold block" data-act="submit" data-arg="${task.id}" ${can.ok ? '' : 'disabled'}>${task.type === 'presentation' ? '🎤 Present now' : 'Submit for grading'}</button></div></div>`;
  }

  function render(id) {
    const j = st().job;
    const task = E().taskById(id);
    const r = j.tasks[id];
    if (!task || !r) return '<p>Task not found.</p>';
    const c = IS.characters[task.from];
    const open = r.status === 'assigned';
    if (open) ensureDraft(task, r);
    const ed = !open ? gradedView(task, r) : {
      coding: codingEditor, sql: sqlEditor, terminal: terminalEditor, web: webEditor, config: configEditor,
      quiz: quizEditor, review: reviewEditor, written: writtenEditor, presentation: presEditor,
    }[task.type](task, r);
    return `<div class="app-title"><button class="btn small ghost" data-act="app" data-arg="todo">← To-Do</button>${IS.computer.statusPill(task)}</div>
      <div class="${open ? 'ws' : ''}"><div class="stack" style="min-width:0">
        <div class="panel"><div class="row" style="align-items:flex-start;gap:14px;flex-wrap:nowrap"><div style="font-size:2.2rem">${IS.computer.icon(task)}</div>
          <div style="flex:1;min-width:0"><h2>${U.esc(task.title)}</h2>
            <div class="row small"><span class="pill">${IS.computer.typeLabel(task)}</span><span class="pill">${task.kind === 'group' ? '👥 Group' : '🧑 Individual'}</span>${task.optional ? '<span class="pill gold">⭐ Optional stretch</span>' : ''}
              <span class="pill">📅 Due ${U.dueLabel(E().effectiveDue(task))}</span>${r.extDays ? '<span class="pill good">Extended +1 day</span>' : ''}${open ? dueCountdown(task) : ''}</div>
            <div class="row small muted" style="margin-top:8px"><span style="border-radius:8px;overflow:hidden;line-height:0">${IS.people.portrait(task.from, 28)}</span> Assigned by ${U.esc(c.name)}, ${U.esc(c.title)}</div></div></div>
          <div class="brief" style="margin-top:12px">${task.brief}</div></div>
        ${ed}</div>${open ? sidePanel(task, r) : ''}</div>`;
  }

  function mount(id) {
    const j = st().job;
    const task = E().taskById(id);
    const r = j && j.tasks[id];
    if (!task || !r || r.status !== 'assigned') return;
    const code = document.getElementById('ws-code');
    if (code) {
      code.addEventListener('input', () => { r.draft = code.value; saveSoon(); });
      code.addEventListener('keydown', (e) => {
        if (e.key === 'Tab') {
          e.preventDefault();
          code.setRangeText(task.lang === 'python' ? '    ' : '  ', code.selectionStart, code.selectionEnd, 'end');
          r.draft = code.value;
        }
      });
    }
    const text = document.getElementById('ws-text');
    if (text) text.addEventListener('input', () => {
      r.draft = text.value;
      const wc = document.getElementById('ws-wc');
      if (wc) wc.textContent = U.words(text.value).length + ' / ' + task.rubric.minWords + '+ words';
      saveSoon();
    });
    const comment = document.getElementById('ws-comment');
    if (comment) comment.addEventListener('input', () => { r.draft.comment = comment.value; saveSoon(); });
    document.querySelectorAll('[data-pick]').forEach((el) => el.addEventListener('change', () => {
      const i = +el.dataset.pick;
      r.draft.picks = r.draft.picks.filter((x) => x !== i);
      if (el.checked) r.draft.picks.push(i);
      saveSoon();
    }));
    document.querySelectorAll('[data-quiz]').forEach((el) => el.addEventListener('change', () => { r.draft.answers[+el.dataset.quiz] = +el.value; saveSoon(); }));
    document.querySelectorAll('[data-slide-type]').forEach((el) => el.addEventListener('change', () => { r.draft.slides[+el.dataset.slideType].type = el.value; saveSoon(); }));
    document.querySelectorAll('[data-slide-text]').forEach((el) => el.addEventListener('input', () => { r.draft.slides[+el.dataset.slideText].text = el.value; saveSoon(); }));
    const term = document.getElementById('ws-term');
    if (term) {
      const input = document.getElementById('ws-term-in');
      const sh = shellFor(task, r);
      const hist = sh.history.map((h) => h.cmd);
      let hi = hist.length;
      term.scrollTop = term.scrollHeight;
      term.addEventListener('click', () => input.focus());
      input.focus();
      input.addEventListener('keydown', (e) => {
        if (e.key === 'ArrowUp') { e.preventDefault(); if (hi > 0) input.value = hist[--hi] || ''; return; }
        if (e.key === 'ArrowDown') { e.preventDefault(); input.value = hist[++hi] || ''; if (hi > hist.length) hi = hist.length; return; }
        if (e.key !== 'Enter') return;
        e.preventDefault();
        const cmd = input.value;
        const prompt = sh.prompt();
        const res = cmd.trim() ? sh.exec(cmd) : { out: '' };
        if (cmd.trim()) sh.history[sh.history.length - 1].prompt = prompt;
        r.draft = sh.snapshot();
        saveSoon();
        const outEl = document.getElementById('ws-term-out');
        if (res.clear) outEl.innerHTML = '';
        else outEl.insertAdjacentHTML('beforeend', `<span class="ps1">${U.esc(prompt)}</span>${U.esc(cmd)}\n${U.esc(res.out)}`);
        document.getElementById('ws-ps1').textContent = sh.prompt();
        input.value = '';
        hist.push(cmd);
        hi = hist.length;
        term.scrollTop = term.scrollHeight;
        document.getElementById('ws-obj').innerHTML = objectivesHtml(task, sh);
      });
    }
  }

  // ── Actions ─────────────────────────────────────────────
  function runnerRun(task, code, which) {
    const all = which === 'all';
    if (task.type === 'coding') return IS.runners[task.lang].run(code, task.fnName, all ? task.tests.concat(task.hidden || []) : task.tests);
    if (task.type === 'sql') return IS.runners.sql.run(task, code, task.db || E().track().db, IS.sqlExpected[E().track().id][task.id]);
    if (task.type === 'web') return IS.runners.web.run(task, code, document.getElementById('ws-preview'), all ? 'all' : 'visible');
    if (task.type === 'config') {
      const g = IS.runners.yaml.grade(all ? task : Object.assign({}, task, { checks: task.checks.filter((c) => !c.hidden) }), code);
      return Promise.resolve(g);
    }
    if (task.type === 'terminal') return Promise.resolve(IS.runners.shell.grade(task, shellFor(task, st().job.tasks[task.id])));
    return Promise.resolve({ error: 'Unknown task type' });
  }

  function showRunning(msg) {
    const out = document.getElementById('ws-results');
    if (out) out.innerHTML = `<p class="muted">${msg}</p>`;
  }

  const actions = {
    runTests(id) {
      const j = st().job;
      const task = E().taskById(id);
      const r = j.tasks[id];
      showRunning(task.lang === 'python' ? 'Running Python… (the first run downloads the Python runtime)' : 'Running tests…');
      if (j.clockedIn) E().spend(1);
      runnerRun(task, r.draft, 'visible').then((run) => { r.lastRun = run; IS.state.save(); IS.ui.after(); });
    },
    runSql(id) {
      const task = E().taskById(id);
      const r = st().job.tasks[id];
      showRunning('Running query…');
      IS.runners.sql.run(task, r.draft, task.db || E().track().db, null, true).then((res) => {
        r.lastPreview = res.error ? { error: res.error } : res.preview;
        IS.state.save();
        IS.ui.after();
      });
    },
    runWeb(id) {
      const task = E().taskById(id);
      const r = st().job.tasks[id];
      showRunning('Rendering and checking…');
      runnerRun(task, r.draft, 'visible').then((run) => {
        r.lastRun = run;
        IS.state.save();
        const out = document.getElementById('ws-results');
        if (out) out.innerHTML = resultsHtml(task, run, 99);
      });
    },
    runYaml(id) {
      const task = E().taskById(id);
      const r = st().job.tasks[id];
      runnerRun(task, r.draft, 'visible').then((run) => { r.lastRun = run; IS.state.save(); IS.ui.after(); });
    },
    resetShell(id) {
      IS.ui.modal({ title: 'Reset the machine?', html: '<p>This restores every file to its original state and clears your command history.</p>', buttons: [{ label: 'Cancel', cls: 'ghost' }, { label: 'Reset', cls: 'danger', onClick: (c) => { c(); delete shells[id]; st().job.tasks[id].draft = null; IS.ui.after(); } }] });
    },
    resetCode(id) {
      IS.ui.modal({ title: 'Reset to the starter?', html: '<p>This replaces your work with the original starter.</p>', buttons: [{ label: 'Cancel', cls: 'ghost' }, { label: 'Reset', cls: 'danger', onClick: (c) => { c(); const r = st().job.tasks[id]; r.draft = E().taskById(id).starter; r.lastRun = null; r.lastPreview = null; IS.ui.after(); } }] });
    },
    submit(id) {
      const s = st();
      const j = s.job;
      const task = E().taskById(id);
      const r = j.tasks[id];
      const can = E().canSubmit(id);
      if (!can.ok) return IS.ui.toast(can.why, 'bad');
      const finish = (result, submission) => {
        const rec = E().submit(id, result, submission);
        IS.ui.toast(`${task.title}: ${U.letter(rec.score)} (${rec.score}%)`, rec.score >= 80 ? 'good' : 'bad');
        if (rec.score >= 95) IS.ui.confetti(30);
        IS.ui.after();
      };
      const confirmThen = (fn) => IS.ui.modal({
        title: 'Submit for grading?', html: `<p>Submitting <b>${U.esc(task.title)}</b> is final and takes 5 minutes of your shift.</p>`,
        buttons: [{ label: 'Keep working', cls: 'ghost' }, { label: 'Submit', cls: 'gold', onClick: (c) => { c(); fn(); } }],
      });
      if (['coding', 'sql', 'web', 'config'].includes(task.type)) {
        confirmThen(() => {
          showRunning('Grading…');
          runnerRun(task, r.draft, 'all').then((run) => {
            const out = { results: run.results || [], error: run.error, logs: run.logs };
            finish(IS.grading.coding(task, r.draft, out), { code: r.draft, run: out });
          });
        });
      } else if (task.type === 'terminal') {
        confirmThen(() => {
          const sh = shellFor(task, r);
          const run = IS.runners.shell.grade(task, sh);
          finish(IS.grading.coding(task, '', run), { run, commands: sh.history.map((h) => h.cmd) });
        });
      } else if (task.type === 'quiz') {
        const left = task.questions.filter((_, i) => r.draft.answers[i] == null).length;
        if (left) return IS.ui.toast(`Answer all questions first (${left} left).`, 'bad');
        const answers = task.questions.map((_, i) => r.draft.answers[i]);
        confirmThen(() => finish(IS.grading.quiz(task, answers), { answers }));
      } else if (task.type === 'review') {
        confirmThen(() => finish(IS.grading.review(task, r.draft.picks, r.draft.comment), { picks: r.draft.picks.slice(), comment: r.draft.comment }));
      } else if (task.type === 'written') {
        confirmThen(() => finish(IS.grading.written(task, r.draft), { text: r.draft }));
      } else if (task.type === 'presentation') {
        const slides = r.draft.slides.map((x) => ({ type: x.type, text: x.text }));
        IS.ui.modal({
          title: '🎤 Ready to present?',
          html: `<p>You'll present <b>${slides.length} slides</b> live to ${task.audience.map((a) => IS.characters[a].short).join(', ')}, handle a surprise, then answer questions. <b>Each question has a 25-second timer.</b></p>`,
          buttons: [{ label: 'Not yet', cls: 'ghost' }, { label: 'Take the stage', cls: 'gold', onClick: (c) => { c(); IS.present.live(task, slides, (live) => {
            const outfit = IS.store.byId(s.equipped.outfit);
            const extra = { outfitBonus: (outfit && outfit.effect && outfit.effect.presentation) || 0 };
            if (task.group) extra.health = j.groups[task.group].health;
            finish(IS.grading.presentation(task, slides, live, extra), { slides, live });
          }); } }],
        });
      }
    },
    help(kind, id) {
      const r = st().job.tasks[id];
      let res;
      if (kind === 'mentor') res = E().askMentor(id);
      else if (kind === 'peer') res = E().askPeer(id);
      else if (kind === 'wiki') res = E().searchWiki(id);
      else if (kind === 'duck') res = E().askDuck(id);
      else if (kind === 'extension') {
        const x = E().requestExtension(id);
        IS.ui.toast('📅 ' + x.text, x.ok ? 'good' : 'bad');
        res = { who: E().cast().manager, text: 'Extension request: ' + x.text };
      }
      if (res) {
        r.helpLog = r.helpLog || [];
        r.helpLog.push({ who: res.who || null, text: res.text || '', html: res.html || null });
      }
      IS.ui.after();
    },
    slideAdd(id) {
      const r = st().job.tasks[id];
      if (r.draft.slides.length >= 12) return IS.ui.toast('That\'s plenty of slides.', 'bad');
      r.draft.slides.push({ type: 'problem', text: '' });
      IS.ui.after();
    },
    slideDel(id, i) {
      const r = st().job.tasks[id];
      if (r.draft.slides.length > 1) r.draft.slides.splice(i, 1);
      IS.ui.after();
    },
    slideMove(id, i, d) {
      const sl = st().job.tasks[id].draft.slides;
      const k = i + d;
      if (k >= 0 && k < sl.length) [sl[i], sl[k]] = [sl[k], sl[i]];
      IS.ui.after();
    },
  };

  return { render, mount, actions, resultsHtml, tableHtml, LANG_NAME, dropShell: (id) => { delete shells[id]; } };
})();

// ── Live presentation stage ─────────────────────────────────
IS.present = (function () {
  const U = IS.util;
  const st = () => IS.state.get();
  const OPENINGS = [
    { text: 'Open with a quick guest story that shows the problem.', pts: 10, react: 'Heads nod. You have the room.' },
    { text: 'Read the title slide out loud, word for word.', pts: 3, react: 'A few people glance at their laptops.' },
    { text: 'Apologize for being nervous and not very prepared.', pts: 2, react: 'Encouraging smiles, but the energy dips.' },
    { text: 'Skip the intro and jump straight into the technical details.', pts: 5, react: 'The engineers are into it. Everyone else looks lost.' },
  ];
  const MIDS = [
    { setup: 'You notice confused faces during a technical slide.', options: [
      { text: 'Pause and explain it with a simple analogy.', pts: 10, react: '"Oh! That makes sense," someone says.' },
      { text: 'Speed up to get through it.', pts: 3, react: 'The confusion spreads.' },
      { text: '"This is probably too technical for some of you."', pts: 0, react: 'Oof. The room gets chilly.' },
      { text: 'Keep going exactly as rehearsed.', pts: 5, react: 'You get through it. Some people are still lost.' }] },
    { setup: 'Your laptop freezes in the middle of a slide!', options: [
      { text: 'Stay calm, crack a light joke, keep going from memory while it restarts.', pts: 10, react: 'Laughter, then real admiration. Very smooth.' },
      { text: 'Panic and apologize repeatedly.', pts: 2, react: 'Everyone feels the stress.' },
      { text: 'Ask everyone to wait silently while it reboots.', pts: 4, react: 'Three very long minutes pass.' },
      { text: 'Skip straight to Q&A.', pts: 5, react: 'Efficient, but you skipped your best material.' }] },
  ];
  const Q_SECONDS = 25;

  function speaker(id, text) {
    const c = IS.characters[id];
    return `<div class="speaker"><div class="mini">${IS.people.portrait(id, 64)}</div><div><div class="who">${U.esc(c.name)}<small>${U.esc(c.title)}</small></div><div class="bubble">${U.esc(text)}</div></div></div>`;
  }

  function live(task, slides, done) {
    const s = st();
    const rnd = U.seeded(s.seed + task.id.length * 977 + s.job.day);
    const mid = MIDS[Math.floor(rnd() * MIDS.length)];
    const midAt = Math.max(1, Math.floor(slides.length / 2));
    const result = { opening: 0, mid: 0, answers: [] };
    const team = task.group ? E2().track().groups[task.group].members : [];
    let el;
    let timer = null;
    function E2() { return IS.engine; }

    function frame(inner) {
      if (!el) {
        el = document.createElement('div');
        el.className = 'stage';
        document.body.appendChild(el);
      }
      el.innerHTML = `<div class="spotlight"></div><div class="stage-inner">
        <div class="spread"><span class="scene-place">🎤 ${U.esc(task.title)}</span><span class="row" style="align-items:flex-end">${['player'].concat(team).map((m) => IS.people.of(m, { height: 110 })).join('')}</span></div>
        ${inner}
        <div class="audience">${task.audience.map((a) => `<div class="seat">${IS.people.portrait(a, 70)}<div>${IS.characters[a].short}</div></div>`).join('')}</div></div>`;
      el.scrollTop = 0;
    }
    const on = (sel, fn) => el.querySelectorAll(sel).forEach((b) => { b.onclick = () => fn(b); });
    function react(text, next) {
      frame(`<div class="panel" style="margin-top:16px"><p>${U.esc(text)}</p><button class="btn primary" data-go>Continue ▸</button></div>`);
      on('[data-go]', next);
    }
    function opening() {
      frame(`<h2 style="margin-top:14px">You're up! How do you open?</h2>${OPENINGS.map((o, i) => `<button class="btn choice" data-i="${i}">${U.esc(o.text)}</button>`).join('')}`);
      on('[data-i]', (b) => { const o = OPENINGS[+b.dataset.i]; result.opening = o.pts; react(o.react, () => slide(0)); });
    }
    function slide(i) {
      if (i >= slides.length) return qna(0);
      if (i === midAt && !result.midDone) return midEvent(i);
      const sl = slides[i];
      const t = IS.slideTypes.find((x) => x.id === sl.type);
      const lines = sl.text.split('\n').map((x) => x.trim()).filter(Boolean);
      const sp = team.length && i % 3 === 2 ? team[(i / 3 | 0) % team.length] : null;
      frame(`<div class="slide-view" style="margin-top:14px"><h2>${t.icon} ${t.label}</h2>${lines.length ? `<ul>${lines.map((l) => `<li>${U.esc(l)}</li>`).join('')}</ul>` : '<p class="muted"><i>(This slide is blank…)</i></p>'}<span class="slide-num">${i + 1} / ${slides.length}</span></div>
        ${sp ? `<p class="small muted" style="margin-top:8px">${IS.characters[sp].short} presents this slide${s.job.groups[task.group].health >= 70 ? ' and nails the handoff.' : '… and the handoff is a bit awkward.'}</p>` : ''}
        <p style="margin-top:12px"><button class="btn primary" data-go>${i + 1 < slides.length ? 'Next slide ▸' : 'Open the floor for questions ▸'}</button></p>`);
      on('[data-go]', () => slide(i + 1));
    }
    function midEvent(i) {
      result.midDone = true;
      frame(`<h2 style="margin-top:14px">⚡ ${U.esc(mid.setup)}</h2>${mid.options.map((o, k) => `<button class="btn choice" data-k="${k}">${U.esc(o.text)}</button>`).join('')}`);
      on('[data-k]', (b) => { const o = mid.options[+b.dataset.k]; result.mid = o.pts; react(o.react, () => slide(i)); });
    }
    function qna(q) {
      if (q >= task.questions.length) return wrap();
      const Q = task.questions[q];
      const opts = U.shuffle(Q.options, rnd);
      let left = Q_SECONDS;
      frame(`<div class="spread" style="margin-top:14px"><h3>🙋 Question ${q + 1} of ${task.questions.length}</h3><span class="timer" id="qt">${left}s</span></div>
        ${speaker(Q.who, Q.q)}${opts.map((o, k) => `<button class="btn choice" data-k="${k}">${U.esc(o.text)}</button>`).join('')}`);
      const answer = (pts, msg) => {
        clearInterval(timer);
        result.answers.push(pts);
        react(msg || (pts >= 8 ? '😊 Great answer.' : pts >= 4 ? '🙂 OK answer.' : '😬 That didn\'t land.'), () => qna(q + 1));
      };
      on('[data-k]', (b) => answer(opts[+b.dataset.k].pts));
      timer = setInterval(() => {
        left--;
        const tEl = document.getElementById('qt');
        if (tEl) { tEl.textContent = left + 's'; if (left <= 5) tEl.classList.add('low'); }
        if (left <= 0) answer(0, '⏰ You froze and ran out of time. "Let\'s take that offline," you say.');
      }, 1000);
    }
    function wrap() {
      IS.ui.confetti(30);
      frame(`<div class="center" style="margin-top:20px"><p class="applause">👏👏👏</p><h2>Thank you!</h2><p class="muted">The audience applauds. Grading your deck, delivery and answers…</p><button class="btn gold big" data-go>See my grade</button></div>`);
      on('[data-go]', () => { el.remove(); done(result); });
    }
    opening();
  }

  return { live, speaker };
})();
