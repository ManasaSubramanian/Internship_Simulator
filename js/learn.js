// Learning Center: beginner-friendly lessons for every internship.
// Each topic explains the idea in plain words, walks through a code example
// line by line, and ends with up to three practice problems that loop.
// Content lives in js/data/learn/*.js as IS.learnData[trackId] = [topic, …].
IS.learn = (function () {
  const U = IS.util;
  const st = () => IS.state.get();
  let view = null; // { trackId, topicId }
  let lastRun = null; // { key, html } so results survive re-renders

  const CAREER = { id: 'career', n: 0, icon: '🤝', langLabel: 'Career skills' };
  const LANG = { javascript: 'JavaScript', python: 'Python', cpp: 'C++', sql: 'SQL', html: 'HTML', css: 'CSS', bash: 'Bash', yaml: 'YAML', text: '' };

  const data = () => IS.learnData || {};
  const topics = (trackId) => data()[trackId] || [];
  const topic = (trackId, id) => topics(trackId).find((t) => t.id === id) || null;
  const trackInfo = (trackId) => (trackId === 'career' ? CAREER : IS.tracks.find((t) => t && t.id === trackId));
  const trackList = () => [CAREER].concat(IS.tracks.filter(Boolean)).filter((t) => topics(t.id).length);
  const key = (trackId, id) => trackId + '/' + id;

  function progress() {
    const s = st();
    if (!s) return { seen: {}, solved: {}, idx: {}, drafts: {}, tries: {} };
    s.learn = s.learn || {};
    ['seen', 'solved', 'idx', 'drafts', 'tries'].forEach((k) => { s.learn[k] = s.learn[k] || {}; });
    return s.learn;
  }
  const solvedList = (k) => progress().solved[k] || [];
  const topicComplete = (trackId, id) => solvedList(key(trackId, id)).length > 0;

  function defaultTrack() {
    const s = st();
    if (s && s.job) return IS.tracks[s.job.level].id;
    if (s) return (IS.tracks[s.career.level] || IS.tracks[0]).id;
    return IS.tracks[0].id;
  }

  // ── Public: open / close ────────────────────────────────
  function open(trackId, topicId) {
    const tid = trackId && topics(trackId).length ? trackId : defaultTrack();
    view = { trackId: tid, topicId: topicId && topic(tid, topicId) ? topicId : null };
    render();
  }

  function close() {
    const root = document.getElementById('learn-root');
    if (root) root.remove();
    view = null;
    IS.state.save();
    // Refresh the screen underneath (training checklists may have changed).
    if (st()) IS.ui.render();
  }

  const isOpen = () => !!view;

  // ── Rendering ───────────────────────────────────────────
  function codeBlock(ex) {
    const lines = ex.code.replace(/\n$/, '').split('\n');
    return `<div class="code-lines" data-code>${lines.map((l, i) => `<div class="cl" data-line="${i + 1}"><span class="ln">${i + 1}</span><code>${U.esc(l) || ' '}</code></div>`).join('')}</div>`;
  }

  function exampleHtml(t) {
    const ex = t.example;
    if (!ex) return '';
    return `<section class="lsec"><h2>🧩 ${ex.heading || 'See it in code'}${ex.lang && LANG[ex.lang] ? ` <span class="pill">${LANG[ex.lang]}</span>` : ''}</h2>
      ${ex.intro ? `<p>${ex.intro}</p>` : ''}
      ${codeBlock(ex)}
      ${ex.output ? `<div class="out-label">What it produces</div><pre class="out">${U.esc(ex.output)}</pre>` : ''}
      <h3 style="margin-top:14px">Step by step</h3>
      <p class="small muted" style="margin-top:0">Point at (or tap) a step to highlight its lines.</p>
      <ol class="steps">${ex.steps.map((s, i) => `<li data-step="${i}" data-lines="${(s.lines || []).join(',')}" tabindex="0">${s.lines && s.lines.length ? `<span class="pill gold">Line${s.lines.length > 1 ? 's' : ''} ${s.lines.length > 2 ? s.lines[0] + '–' + s.lines[s.lines.length - 1] : s.lines.join(' & ')}</span> ` : ''}${s.text}</li>`).join('')}</ol></section>`;
  }

  function practiceHtml(trackId, t) {
    const P = IS.problem;
    const k = key(trackId, t.id);
    const n = t.practice.length;
    const i = (progress().idx[k] || 0) % n;
    const p = t.practice[i];
    const solved = solvedList(k);
    const draftKey = k + '#' + i;
    const draft = progress().drafts[draftKey] != null ? progress().drafts[draftKey] : (p.starter || '');
    const tries = progress().tries[draftKey] || 0;
    const kind = P.kindOf(p);
    const runLabel = kind === 'choice' ? '✔ Check my answer' : kind === 'terminal' ? '✔ Check objectives' : kind === 'sql' ? '▶ Run & check my query' : '▶ Run & check';
    const sol = p.solution == null ? '' : kind === 'choice' ? `<p><b>Answer:</b> ${U.esc(p.options[p.answer])}</p>${p.explain ? `<div class="explain">${p.explain}</div>` : ''}`
      : `<pre>${U.esc(Array.isArray(p.solution) ? p.solution.join('\n') : p.solution)}</pre>${p.why ? `<p class="small">${p.why}</p>` : ''}`;
    const prev = lastRun && lastRun.key === draftKey ? lastRun.html : '';
    return `<section class="lsec practice"><div class="spread"><h2 style="margin:0">✍️ Your turn: practice</h2>
        <div class="pdots">${t.practice.map((_, j) => `<button class="pdot ${j === i ? 'on' : ''} ${solved.includes(j) ? 'ok' : ''}" data-l="goto" data-v="${j}" aria-label="Problem ${j + 1}">${solved.includes(j) ? '✓' : j + 1}</button>`).join('')}</div></div>
      <p class="small muted" style="margin:4px 0 10px">Problem ${i + 1} of ${n}. The problems loop, so after the last one you can start again from the first.</p>
      <h3 style="margin:0 0 6px">${solved.includes(i) ? '✅ ' : ''}${U.esc(p.title)}</h3>
      <div class="brief">${p.brief}</div>
      ${P.note(p) ? `<p class="small muted" style="margin:8px 0">${P.note(p)}</p>` : ''}
      <div style="margin-top:10px">${P.editor(p, draft, 'lp', { trackId: p.trackId || trackId, db: dbFor(trackId, p) })}</div>
      <div class="row" style="margin-top:10px">
        <button class="btn primary" data-l="run">${runLabel}</button>
        ${p.hint ? '<button class="btn" data-l="hint">💡 Hint</button>' : ''}
        ${p.solution != null ? `<button class="btn" data-l="solution" ${tries ? '' : 'disabled title="Give it one try first"'}>👀 Show solution</button>` : ''}
        ${kind !== 'choice' && kind !== 'terminal' ? '<button class="btn ghost" data-l="reset">↺ Start over</button>' : ''}
        ${kind === 'terminal' ? '<button class="btn ghost" data-l="resetShell">↺ Reset machine</button>' : ''}
        <button class="btn gold" data-l="next" style="margin-left:auto">${i === n - 1 ? '🔁 Back to problem 1' : 'Next problem →'}</button></div>
      <div id="lp-hint" hidden class="explain">💡 ${Array.isArray(p.hint) ? p.hint.join('<br>💡 ') : p.hint || ''}</div>
      <div id="lp-solution" hidden class="solution-box"><div class="out-label">One possible solution</div>${sol}</div>
      <div id="lp-results">${prev}</div></section>`;
  }

  function dbFor(trackId, p) {
    if (P_type(p) !== 'sql') return null;
    const t = IS.tracks.find((x) => x && x.id === (p.trackId || trackId));
    return (t && t.db) || (IS.sqlData && { schema: IS.sqlData.schema, seeds: [] });
  }
  const P_type = (p) => p.type || 'coding';

  function topicHtml(trackId, t) {
    const list = topics(trackId);
    const idx = list.indexOf(t);
    return `<article class="topic">
      <div class="crumb small muted">${U.esc(trackInfo(trackId).langLabel)} · Topic ${idx + 1} of ${list.length}</div>
      <h1>${t.icon || '📘'} ${U.esc(t.title)}</h1>
      <p class="lead">${U.esc(t.summary)}</p>
      <section class="lsec"><h2>💡 The idea in plain words</h2>${t.words}
        ${t.terms && t.terms.length ? `<h3>Words to know</h3><dl class="terms">${t.terms.map(([a, b]) => `<dt>${U.esc(a)}</dt><dd>${b}</dd>`).join('')}</dl>` : ''}</section>
      ${exampleHtml(t)}
      ${practiceHtml(trackId, t)}
      <div class="row" style="justify-content:space-between;margin-top:14px">
        ${idx > 0 ? `<button class="btn" data-l="topic" data-v="${list[idx - 1].id}">← ${U.esc(list[idx - 1].title)}</button>` : '<span></span>'}
        ${idx < list.length - 1 ? `<button class="btn gold" data-l="topic" data-v="${list[idx + 1].id}">${U.esc(list[idx + 1].title)} →</button>` : `<button class="btn" data-l="home">All topics</button>`}</div>
    </article>`;
  }

  function homeHtml(trackId) {
    const tr = trackInfo(trackId);
    const list = topics(trackId);
    return `<div class="topic"><h1>${tr.icon} ${U.esc(tr.langLabel)}</h1>
      <p class="lead">${trackId === 'career' ? 'The people skills every internship needs: interviews, writing, code reviews and presenting.' : 'Start at topic 1 if this is new to you. Each topic builds on the one before it.'}</p>
      <div class="grid grid-2">${list.map((t, i) => {
        const done = topicComplete(trackId, t.id);
        return `<button class="topic-card ${done ? 'done' : ''}" data-l="topic" data-v="${t.id}"><span class="n">${done ? '✅' : i + 1}</span><span><b>${t.icon || ''} ${U.esc(t.title)}</b><br><span class="small muted">${U.esc(t.summary)}</span><br><span class="small">${solvedList(key(trackId, t.id)).length}/${t.practice.length} practice problems solved</span></span></button>`;
      }).join('')}</div></div>`;
  }

  function render() {
    if (!view) return;
    let root = document.getElementById('learn-root');
    if (!root) {
      root = document.createElement('div');
      root.id = 'learn-root';
      root.className = 'learn';
      root.setAttribute('role', 'dialog');
      root.setAttribute('aria-label', 'Learning Center');
      document.body.appendChild(root);
      root.addEventListener('click', onClick);
      root.addEventListener('mouseover', onHover);
      root.addEventListener('focusin', onHover);
    }
    const { trackId, topicId } = view;
    const t = topicId && topic(trackId, topicId);
    if (t) progress().seen[key(trackId, t.id)] = 1;
    const tracks = trackList();
    const s = st();
    const unlocked = (tr) => tr.id === 'career' || !s || tr.n - 1 <= (s.job ? s.job.level : s.career.level);
    root.innerHTML = `<div class="learn-top"><div class="learn-title">📚 Learning Center</div>
        <label class="small learn-pick">Subject <select data-l="track">${tracks.map((tr) => `<option value="${tr.id}" ${tr.id === trackId ? 'selected' : ''}>${tr.id === 'career' ? '' : tr.n + '. '}${U.esc(tr.langLabel)}${unlocked(tr) ? '' : ' (preview)'}</option>`).join('')}</select></label>
        <button class="btn" data-l="close">✕ Close</button></div>
      <div class="learn-body"><nav class="learn-side" aria-label="Topics">
          <button class="side-item ${t ? '' : 'on'}" data-l="home">🏠 All topics</button>
          ${topics(trackId).map((x, i) => `<button class="side-item ${t === x ? 'on' : ''}" data-l="topic" data-v="${x.id}">${topicComplete(trackId, x.id) ? '✅' : `<span class="num">${i + 1}</span>`} ${U.esc(x.title)}</button>`).join('')}</nav>
        <main class="learn-main" id="learn-main">${t ? topicHtml(trackId, t) : homeHtml(trackId)}</main></div>`;
    root.querySelector('[data-l="track"]').addEventListener('change', (e) => { view = { trackId: e.target.value, topicId: null }; lastRun = null; render(); });
    if (t) mountPractice(trackId, t);
    IS.office.pause(true);
  }

  function current() {
    const { trackId, topicId } = view;
    const t = topic(trackId, topicId);
    const k = key(trackId, t.id);
    const i = (progress().idx[k] || 0) % t.practice.length;
    return { trackId, t, k, i, p: t.practice[i], draftKey: k + '#' + i };
  }

  function mountPractice() {
    const c = current();
    const draft = progress().drafts[c.draftKey] != null ? progress().drafts[c.draftKey] : (c.p.starter || '');
    IS.problem.mount(c.p, 'lp', draft, (v) => { progress().drafts[c.draftKey] = v; saveSoon(); });
  }

  let saveTimer = null;
  function saveSoon() {
    clearTimeout(saveTimer);
    saveTimer = setTimeout(() => IS.state.save(), 400);
  }

  function scrollMain(top) {
    const m = document.getElementById('learn-main');
    if (m) m.scrollTop = top == null ? 0 : top;
  }

  // ── Events ──────────────────────────────────────────────
  function onHover(e) {
    const li = e.target.closest && e.target.closest('[data-step]');
    const root = document.getElementById('learn-root');
    if (!root) return;
    root.querySelectorAll('.cl.hl').forEach((x) => x.classList.remove('hl'));
    root.querySelectorAll('[data-step].on').forEach((x) => x.classList.remove('on'));
    if (!li) return;
    li.classList.add('on');
    (li.dataset.lines || '').split(',').filter(Boolean).forEach((n) => {
      const el = root.querySelector(`.cl[data-line="${n}"]`);
      if (el) el.classList.add('hl');
    });
  }

  function onClick(e) {
    const b = e.target.closest('[data-l]');
    if (!b || b.tagName === 'SELECT') return;
    const act = b.dataset.l;
    const v = b.dataset.v;
    const m = document.getElementById('learn-main');
    const y = m ? m.scrollTop : 0;
    if (act === 'close') return close();
    if (act === 'home') { view.topicId = null; lastRun = null; render(); return scrollMain(0); }
    if (act === 'topic') { view.topicId = v; lastRun = null; render(); return scrollMain(0); }
    const c = current();
    if (act === 'goto' || act === 'next') {
      progress().idx[c.k] = act === 'goto' ? +v : (c.i + 1) % c.t.practice.length;
      lastRun = null;
      IS.state.save();
      render();
      const pr = document.querySelector('.learn .practice');
      if (pr && m) document.getElementById('learn-main').scrollTop = pr.offsetTop - 12;
      return;
    }
    if (act === 'hint') { const h = document.getElementById('lp-hint'); h.hidden = !h.hidden; return; }
    if (act === 'solution') { const h = document.getElementById('lp-solution'); h.hidden = !h.hidden; return; }
    if (act === 'reset') { delete progress().drafts[c.draftKey]; lastRun = null; render(); return scrollMain(y); }
    if (act === 'resetShell') { IS.problem.resetShell('lp'); delete progress().drafts[c.draftKey]; lastRun = null; render(); return scrollMain(y); }
    if (act === 'run') {
      const out = document.getElementById('lp-results');
      out.innerHTML = '<p class="muted">Checking…</p>';
      const code = progress().drafts[c.draftKey] != null ? progress().drafts[c.draftKey] : (c.p.starter || '');
      b.disabled = true;
      const test = IS.util.hasTestCode(code);
      const running = test ? Promise.resolve({ results: [{ pass: true, label: '🧪 Auto-passed with the test code' }] })
        : IS.problem.run(c.p, code, 'lp', 'all', { trackId: c.p.trackId || c.trackId, db: dbFor(c.trackId, c.p) });
      running.then((r) => {
        const ok = IS.problem.passedAll(r);
        progress().tries[c.draftKey] = (progress().tries[c.draftKey] || 0) + 1;
        if (ok) {
          const list = progress().solved[c.k] = solvedList(c.k);
          if (!list.includes(c.i)) list.push(c.i);
        }
        if (IS.interview && IS.interview.noteProgress && !r.error) IS.interview.noteProgress(c.trackId, c.t.id, ok);
        IS.state.save();
        lastRun = { key: c.draftKey, html: IS.problem.results(r) + (ok ? `<div class="win">🎉 Solved! ${c.t.practice.length > 1 ? 'Try the next problem to lock it in.' : ''}</div>` : '<p class="small muted">Not yet. Read the failing checks, use the hint, and try again. You can peek at the solution now.</p>') };
        const yy = document.getElementById('learn-main').scrollTop;
        render();
        scrollMain(yy);
        if (ok) IS.ui.toast('✅ Practice problem solved!', 'good');
      });
    }
  }

  // ── Related lessons for a work task (simple tag matching) ───
  function related(task, trackId, n) {
    const text = [task.title, task.brief, task.wiki, (task.hints || []).join(' ')].join(' ').toLowerCase();
    const score = (t) => (t.tags || []).reduce((a, tag) => a + (text.includes(tag.toLowerCase()) ? 1 : 0), 0);
    const pool = topics(trackId).map((t) => ({ trackId, t, s: score(t) }));
    const career = { written: 'writing', review: 'code-review', presentation: 'presenting' }[task.type];
    if (career && topic('career', career)) pool.push({ trackId: 'career', t: topic('career', career), s: 99 });
    return pool.filter((x) => x.s > 0).sort((a, b) => b.s - a.s).slice(0, n || 2);
  }

  return { open, close, isOpen, topics, topic, related, render, CAREER };
})();
