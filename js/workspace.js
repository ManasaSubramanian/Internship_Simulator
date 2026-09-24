// The assignment workspace: brief, deliverable editor per task type, focus time,
// help options, submission and graded results. Also the live presentation stage.
(function () {
  const U = IS.util;
  const V = IS.views;
  const E = () => IS.engine;
  const st = () => IS.state.get();

  let saveTimer = null;
  function saveSoon() {
    clearTimeout(saveTimer);
    saveTimer = setTimeout(() => IS.state.save(), 400);
  }

  function ensureDraft(task, r) {
    if (r.draft != null) return r.draft;
    if (task.type === 'coding') r.draft = task.starter;
    else if (task.type === 'quiz') r.draft = { answers: {} };
    else if (task.type === 'review') r.draft = { picks: [], comment: '' };
    else if (task.type === 'written') r.draft = '';
    else if (task.type === 'presentation') r.draft = { slides: [{ type: 'title', text: '' }] };
    return r.draft;
  }

  function dueCountdown(task) {
    const left = E().dueAbs(task) - E().now();
    if (left < 0) return '<span class="pill bad">Overdue</span>';
    const days = Math.floor(left / U.DAY_LENGTH);
    const mins = left % U.DAY_LENGTH;
    return `<span class="pill ${left <= U.DAY_LENGTH ? 'warn' : ''}">⏳ ${days ? days + ' workday' + (days > 1 ? 's' : '') + ' ' : ''}${Math.floor(mins / 60)}h ${Math.round(mins % 60)}m of work time left</span>`;
  }

  // ── Deliverable editors ─────────────────────────────────
  function codingEditor(task, r) {
    return `<div class="card"><div class="spread"><h3>💻 Editor: <code>${task.fnName}</code></h3>
        <div class="row"><button class="btn small ghost" data-act="resetCode" data-arg="${task.id}">↺ Reset</button>
        <button class="btn small primary" data-act="runTests" data-arg="${task.id}">▶ Run visible tests${st().clockedIn ? ' (1 min)' : ''}</button></div></div>
      <textarea class="editor" id="ws-code" spellcheck="false" aria-label="Code editor">${U.esc(r.draft)}</textarea>
      <p class="small muted">Visible tests: ${task.tests.length}. Hidden tests run on submit: ${task.hidden.length}. Grading: 85% tests, 15% code quality (no leftover console.log, a comment explaining your approach, const/let instead of var).</p>
      <div id="ws-results">${r.lastRun ? runHtml(task, r.lastRun, task.tests) : ''}</div></div>`;
  }

  function runHtml(task, run, tests) {
    if (run.error) return `<div class="test fail">⚠️ ${U.esc(run.error)}</div>`;
    const passed = run.results.filter((x) => x.pass).length;
    return `<div class="spread" style="margin:8px 0"><b>Results</b><span class="pill ${passed === run.results.length ? 'good' : 'bad'}">${passed}/${run.results.length} passing</span></div>` +
      run.results.map((res, i) => {
        const t = tests[i];
        const hidden = i >= task.tests.length && tests.length > task.tests.length;
        return `<div class="test ${res.pass ? 'pass' : 'fail'}">${res.pass ? '✅' : '❌'} <div>${hidden
          ? 'Hidden test #' + (i - task.tests.length + 1)
          : `${task.fnName}(${t.args.map((a) => U.esc(JSON.stringify(a))).join(', ')})<br>expected ${U.esc(JSON.stringify(t.expected))}${res.pass ? '' : ', got ' + U.esc(res.got)}`}</div></div>`;
      }).join('') + (run.logs && run.logs.length ? `<div class="console">${run.logs.map(U.esc).join('\n')}</div>` : '');
  }

  function quizEditor(task, r) {
    return `<div class="card"><h3>📝 Questions</h3>${task.questions.map((q, i) => `<div class="quiz-q"><b>${i + 1}. ${U.esc(q.q)}</b>
      ${q.options.map((o, j) => `<label class="opt"><input type="radio" name="q${i}" data-quiz="${i}" value="${j}" ${r.draft.answers[i] === j ? 'checked' : ''}> <span>${U.esc(o)}</span></label>`).join('')}</div>`).join('')}</div>`;
  }

  function reviewEditor(task, r) {
    return `<div class="card"><h3>🔍 Pull request diff</h3><pre>${U.esc(task.code)}</pre>
      <h3 style="margin-top:14px">Flag the real problems</h3>
      ${task.issues.map((iss, i) => `<label class="check-item"><input type="checkbox" data-pick="${i}" ${r.draft.picks.includes(i) ? 'checked' : ''}> <span>${U.esc(iss.text)}</span></label>`).join('')}
      <label class="field" style="margin-top:12px"><span>Review comment (be specific and kind)</span>
        <textarea id="ws-comment" placeholder="e.g. Thanks for this! A few things to consider before merging…">${U.esc(r.draft.comment)}</textarea></label></div>`;
  }

  function writtenEditor(task, r) {
    const n = U.words(r.draft).length;
    return `<div class="card"><div class="spread"><h3>✍️ Your draft</h3><span class="pill" id="ws-wc">${n} / ${task.rubric.minWords}+ words</span></div>
      <p class="small muted">Reviewers look for: ${task.rubric.sections.map((s) => '<b>' + s.label + '</b>').join(' · ')}. Headings help!</p>
      <textarea id="ws-text" style="min-height:300px" placeholder="Start writing…">${U.esc(r.draft)}</textarea></div>`;
  }

  function presEditor(task, r) {
    const slides = r.draft.slides;
    return `<div class="card"><div class="spread"><h3>🎞️ Deck builder</h3><span class="pill">${slides.length} slides · target ${task.slideRange[0]}–${task.slideRange[1]}</span></div>
      <p class="small muted">Pick a slide type and write 1–3 short bullets for each (one per line, 8–60 words per slide). Then submit to present live.</p>
      ${slides.map((sl, i) => `<div class="slide-edit"><div class="num">${i + 1}</div>
        <select data-slide-type="${i}" aria-label="Slide ${i + 1} type">${IS.slideTypes.map((t) => `<option value="${t.id}" ${sl.type === t.id ? 'selected' : ''}>${t.icon} ${t.label}</option>`).join('')}</select>
        <textarea data-slide-text="${i}" placeholder="${U.esc((IS.slideTypes.find((t) => t.id === sl.type) || {}).tip || '')}">${U.esc(sl.text)}</textarea>
        <div class="ctrl"><button class="btn small ghost" data-act="slideMove" data-arg="${task.id}|${i}|-1" title="Move up">▲</button>
          <button class="btn small ghost" data-act="slideMove" data-arg="${task.id}|${i}|1" title="Move down">▼</button>
          <button class="btn small ghost" data-act="slideDel" data-arg="${task.id}|${i}" title="Delete">✕</button></div></div>`).join('')}
      <button class="btn" data-act="slideAdd" data-arg="${task.id}">＋ Add slide</button></div>`;
  }

  // ── Graded view ─────────────────────────────────────────
  function gradedView(task, r) {
    if (r.status === 'missed') return `<div class="card" style="border-color:var(--bad)"><h2>❌ Missed</h2><p>This assignment was more than two workdays late and was marked as missed (0%). A pay adjustment was applied.</p></div>`;
    if (r.status === 'expired') return `<div class="card"><h2>Closed</h2><p>This optional stretch task closed without a submission. No penalty.</p></div>`;
    const sub = r.submission || {};
    let body = '';
    if (task.type === 'coding') {
      body = `<h3>Your code</h3><pre>${U.esc(sub.code)}</pre>` + (sub.run ? runHtml(task, sub.run, task.tests.concat(task.hidden)) : '');
    } else if (task.type === 'quiz') {
      body = task.questions.map((q, i) => `<p><b>${i + 1}. ${U.esc(q.q)}</b><br>${sub.answers[i] === q.answer ? '✅' : '❌'} ${U.esc(q.options[sub.answers[i]] || '(no answer)')}${sub.answers[i] === q.answer ? '' : `<br><span class="muted">Correct: ${U.esc(q.options[q.answer])}</span>`}</p>`).join('');
    } else if (task.type === 'review') {
      body = `<h3>Issues</h3>` + task.issues.map((iss, i) => {
        const picked = sub.picks.includes(i);
        const mark = iss.real ? (picked ? '✅ found' : '⚠️ missed') : (picked ? '❌ false alarm' : '✔️ correctly ignored');
        return `<div class="small" style="margin-bottom:4px">${mark}: ${U.esc(iss.text)}</div>`;
      }).join('') + `<h3 style="margin-top:10px">Your comment</h3><pre style="white-space:pre-wrap">${U.esc(sub.comment)}</pre>`;
    } else if (task.type === 'written') {
      body = `<h3>Your submission</h3><pre style="white-space:pre-wrap">${U.esc(sub.text)}</pre>`;
    } else if (task.type === 'presentation') {
      body = `<h3>Your deck</h3>` + sub.slides.map((sl, i) => {
        const t = IS.slideTypes.find((x) => x.id === sl.type);
        return `<div class="small" style="margin-bottom:6px"><b>${i + 1}. ${t.icon} ${t.label}</b><div class="muted" style="white-space:pre-wrap">${U.esc(sl.text)}</div></div>`;
      }).join('');
    }
    return `<div class="card"><div class="row" style="gap:18px">
        <div class="big-grade ${U.gradeClass(r.score)}">${U.letter(r.score)}</div>
        <div><h2 style="margin:0">${r.score}%</h2>
          <div class="small muted">Submitted ${U.weekday(r.submittedDay)} (Day ${r.submittedDay}) at ${U.clock(r.submittedMinute)}${r.early ? ' · 🐦 a full day early' : ''}</div>
          ${r.penalty ? `<div class="small" style="color:var(--bad)">Raw score ${r.rawScore}% − ${r.penalty}% late penalty (${r.daysLate} workday${r.daysLate > 1 ? 's' : ''} late)</div>` : ''}</div></div>
      <table class="breakdown" style="margin-top:14px"><tr><th>Rubric</th><th></th><th class="num">Points</th></tr>
        ${r.breakdown.map((b) => `<tr><td>${U.esc(b.label)}</td><td class="muted small">${U.esc(b.note)}</td><td class="num">${b.earned}${b.max ? ' / ' + b.max : ''}</td></tr>`).join('')}</table>
      ${(r.notes || []).length ? `<h3 style="margin-top:14px">Reviewer notes</h3><ul>${r.notes.map((n) => `<li>${U.esc(n)}</li>`).join('')}</ul>` : ''}
      </div><div class="card" style="margin-top:14px">${body}</div>`;
  }

  // ── Side panel ──────────────────────────────────────────
  function sidePanel(task, r) {
    const s = st();
    const on = s.clockedIn;
    const pct = Math.min(100, Math.round(r.progress / task.effort * 100));
    const can = E().canSubmit(task.id);
    const peer = IS.characters[task.peer.who];
    const log = (r.helpLog || []).slice().reverse();
    return `<div class="ws-side">
      <div class="card"><h3>⏱️ Focus time</h3>
        <div class="spread small"><span>${Math.floor(r.progress)} / ${task.effort} min logged</span><span>${pct}%</span></div>
        <div class="bar"><span style="width:${pct}%"></span></div>
        <p class="small muted" style="margin-top:6px">${on ? `At ${Math.round(E().productivity() * 100)}% productivity, 30 min of work logs ${Math.round(30 * E().productivity())} min.` : 'Clock in to log work time.'}</p>
        <div class="row">${[15, 30, 60].map((m) => `<button class="btn small" data-act="work" data-arg="${task.id}|${m}" ${on && pct < 100 ? '' : 'disabled'}>Work ${m}m</button>`).join('')}</div></div>
      <div class="card"><h3>🙋 Get help</h3>
        <div class="stack">
          <button class="btn small" data-act="taskHelp" data-arg="mentor|${task.id}" ${on ? '' : 'disabled'} style="width:100%">🧑‍🏫 Ask Dev (mentor) · 15m <span class="muted">(${r.hintsUsed}/${task.hints.length} hints)</span></button>
          <button class="btn small" data-act="taskHelp" data-arg="peer|${task.id}" ${on ? '' : 'disabled'} style="width:100%">🧑‍🤝‍🧑 Ask ${peer.short} · 10m</button>
          <button class="btn small" data-act="taskHelp" data-arg="wiki|${task.id}" ${on ? '' : 'disabled'} style="width:100%">📚 Search the wiki · 5m</button>
          ${E().hasDuck() ? `<button class="btn small" data-act="taskHelp" data-arg="duck|${task.id}" ${on && s.duckDay !== s.day ? '' : 'disabled'} style="width:100%">🦆 Rubber duck debug · 5m (1/day)</button>` : ''}
          <button class="btn small ghost" data-act="taskHelp" data-arg="extension|${task.id}" ${on && !r.extRequested ? '' : 'disabled'} style="width:100%">📅 Ask Maya for an extension · 5m</button>
        </div>
        ${log.length ? `<div class="help-log" style="margin-top:10px">${log.map((h) => `<div class="help-msg">${h.who ? IS.avatar.forCharacter(h.who, 30) : '<span style="font-size:1.3rem">📚</span>'}<div>${h.html || U.esc(h.text)}</div></div>`).join('')}</div>` : ''}
      </div>
      <div class="card" style="border-color:${can.ok ? 'var(--gold)' : 'var(--line)'}"><h3>📤 Submit</h3>
        <p class="small muted">${can.ok ? (task.type === 'presentation' ? 'Ready? Submitting takes you on stage to present live.' : 'Submitting is final and takes 5 minutes. Double-check your work!') : U.esc(can.why)}</p>
        <button class="btn gold" style="width:100%" data-act="submit" data-arg="${task.id}" ${can.ok ? '' : 'disabled'}>${task.type === 'presentation' ? '🎤 Present now' : 'Submit for grading'}</button></div>
    </div>`;
  }

  V.task = function (id) {
    const s = st();
    const task = IS.taskById(id);
    const r = s.tasks[id];
    if (!task || !r) return '<p>Task not found.</p>';
    const c = IS.characters[task.from];
    const open = r.status === 'assigned';
    if (open) ensureDraft(task, r);
    const editor = !open ? gradedView(task, r) : {
      coding: codingEditor, quiz: quizEditor, review: reviewEditor, written: writtenEditor, presentation: presEditor,
    }[task.type](task, r);
    return `<div class="page-title"><button class="btn small ghost" data-act="go" data-arg="tasks">← Task Board</button>${V.statusPill(task)}</div>
      <div class="${open ? 'ws' : ''}"><div class="stack" style="min-width:0">
        <div class="card"><div class="row" style="align-items:flex-start;gap:14px">
          <div style="font-size:2.2rem">${V.icon(task)}</div>
          <div style="flex:1;min-width:0"><h2>${U.esc(task.title)}</h2>
            <div class="row small"><span class="pill">${V.typeLabel(task)}</span><span class="pill">${task.kind === 'group' ? '👥 Group' : '🧑 Individual'}</span>${task.optional ? '<span class="pill gold">⭐ Optional stretch</span>' : ''}
              <span class="pill">📅 Due ${U.dueLabel(E().effectiveDue(task))}</span>${r.extDays ? '<span class="pill good">Extended +1 day</span>' : ''}${open ? dueCountdown(task) : ''}</div>
            <div class="row small muted" style="margin-top:8px">${IS.avatar.forCharacter(task.from, 28)} Assigned by ${c.name}, ${c.title}</div></div></div>
          <div class="brief" style="margin-top:12px">${task.brief}</div></div>
        ${editor}
      </div>${open ? sidePanel(task, r) : ''}</div>`;
  };

  V.mount.task = function (id) {
    const s = st();
    const task = IS.taskById(id);
    const r = s.tasks[id];
    if (!task || !r || r.status !== 'assigned') return;
    const code = document.getElementById('ws-code');
    if (code) {
      code.addEventListener('input', () => { r.draft = code.value; saveSoon(); });
      code.addEventListener('keydown', (e) => {
        if (e.key === 'Tab') {
          e.preventDefault();
          const a = code.selectionStart;
          code.setRangeText('  ', a, code.selectionEnd, 'end');
          r.draft = code.value;
        }
      });
    }
    const text = document.getElementById('ws-text');
    if (text) {
      text.addEventListener('input', () => {
        r.draft = text.value;
        const wc = document.getElementById('ws-wc');
        if (wc) wc.textContent = U.words(text.value).length + ' / ' + task.rubric.minWords + '+ words';
        saveSoon();
      });
    }
    const comment = document.getElementById('ws-comment');
    if (comment) comment.addEventListener('input', () => { r.draft.comment = comment.value; saveSoon(); });
    document.querySelectorAll('[data-pick]').forEach((el) => el.addEventListener('change', () => {
      const i = +el.dataset.pick;
      r.draft.picks = r.draft.picks.filter((x) => x !== i);
      if (el.checked) r.draft.picks.push(i);
      saveSoon();
    }));
    document.querySelectorAll('[data-quiz]').forEach((el) => el.addEventListener('change', () => {
      r.draft.answers[+el.dataset.quiz] = +el.value;
      saveSoon();
    }));
    document.querySelectorAll('[data-slide-type]').forEach((el) => el.addEventListener('change', () => {
      r.draft.slides[+el.dataset.slideType].type = el.value;
      saveSoon();
    }));
    document.querySelectorAll('[data-slide-text]').forEach((el) => el.addEventListener('input', () => {
      r.draft.slides[+el.dataset.slideText].text = el.value;
      saveSoon();
    }));
  };

  // ── Actions used by main.js ─────────────────────────────
  IS.work = {
    runTests(id) {
      const s = st();
      const task = IS.taskById(id);
      const r = s.tasks[id];
      const out = document.getElementById('ws-results');
      if (out) out.innerHTML = '<p class="muted">Running tests…</p>';
      if (s.clockedIn) E().spend(1);
      IS.codeRunner.run(r.draft, task.fnName, task.tests).then((run) => {
        r.lastRun = run;
        IS.state.save();
        IS.ui.after();
      });
    },

    submit(id) {
      const s = st();
      const task = IS.taskById(id);
      const r = s.tasks[id];
      const can = E().canSubmit(id);
      if (!can.ok) return IS.ui.toast(can.why, 'bad');
      const finish = (result, submission) => {
        const rec = E().submit(id, result, submission);
        IS.ui.toast(`${task.title}: ${U.letter(rec.score)} (${rec.score}%)`, rec.score >= 80 ? 'good' : 'bad');
        if (rec.score >= 95) IS.ui.confetti(30);
        IS.ui.after();
      };
      const confirmThen = (fn) => IS.ui.modal({
        title: 'Submit for grading?',
        html: `<p>Submitting <b>${U.esc(task.title)}</b> is final. It takes 5 minutes of your shift.</p>`,
        buttons: [{ label: 'Keep editing', cls: 'ghost' }, { label: 'Submit', cls: 'gold', onClick: (c) => { c(); fn(); } }],
      });
      if (task.type === 'coding') {
        confirmThen(() => {
          const all = task.tests.concat(task.hidden);
          IS.codeRunner.run(r.draft, task.fnName, all).then((run) => {
            finish(IS.grading.coding(task, r.draft, run), { code: r.draft, run });
          });
        });
      } else if (task.type === 'quiz') {
        const unanswered = task.questions.filter((_, i) => r.draft.answers[i] == null).length;
        if (unanswered) return IS.ui.toast(`Answer all questions first (${unanswered} left).`, 'bad');
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
          html: `<p>You'll present <b>${slides.length} slides</b> live to ${task.audience.map((a) => IS.characters[a].short).join(', ')}, handle a surprise or two, then answer questions. <b>Each question has a 25-second timer.</b></p>`,
          buttons: [{ label: 'Not yet', cls: 'ghost' }, { label: 'Take the stage', cls: 'gold', onClick: (c) => { c(); IS.present.live(task, slides, (live) => {
            const extra = { outfitBonus: s.equipped.outfit === 'blazer' ? 3 : 0 };
            if (task.group) extra.health = s.groups[task.group].health;
            finish(IS.grading.presentation(task, slides, live, extra), { slides, live });
          }); } }],
        });
      }
    },

    help(kind, id) {
      const r = st().tasks[id];
      let res;
      if (kind === 'mentor') res = E().askMentor(id);
      else if (kind === 'peer') res = E().askPeer(id);
      else if (kind === 'wiki') res = E().searchWiki(id);
      else if (kind === 'duck') res = E().askDuck(id);
      else if (kind === 'extension') {
        const x = E().requestExtension(id);
        IS.ui.toast('📅 ' + x.text, x.ok ? 'good' : 'bad');
        res = { who: 'maya', text: 'Extension request: ' + x.text };
      }
      if (res) {
        r.helpLog = r.helpLog || [];
        r.helpLog.push({ who: res.who || null, text: res.text || '', html: res.html || null });
      }
      IS.ui.after();
    },

    slideAdd(id) {
      const r = st().tasks[id];
      if (r.draft.slides.length >= 12) return IS.ui.toast('That\'s plenty of slides.', 'bad');
      r.draft.slides.push({ type: 'problem', text: '' });
      IS.ui.after();
    },
    slideDel(id, i) {
      const r = st().tasks[id];
      if (r.draft.slides.length <= 1) return;
      r.draft.slides.splice(i, 1);
      IS.ui.after();
    },
    slideMove(id, i, d) {
      const sl = st().tasks[id].draft.slides;
      const j = i + d;
      if (j < 0 || j >= sl.length) return;
      [sl[i], sl[j]] = [sl[j], sl[i]];
      IS.ui.after();
    },
    resetCode(id) {
      IS.ui.modal({
        title: 'Reset code?', html: '<p>This replaces your code with the original starter code.</p>',
        buttons: [{ label: 'Cancel', cls: 'ghost' }, { label: 'Reset', cls: 'danger', onClick: (c) => { c(); st().tasks[id].draft = IS.taskById(id).starter; IS.ui.after(); } }],
      });
    },
  };

  // ── Live presentation stage ─────────────────────────────
  IS.present = (function () {
    const OPENINGS = [
      { text: 'Open with a quick guest story that shows the problem.', pts: 10, react: 'Heads nod. You have the room.' },
      { text: 'Read the title slide out loud, word for word.', pts: 3, react: 'A few people glance at their laptops.' },
      { text: 'Apologize for being nervous and not very prepared.', pts: 2, react: 'Maya gives you an encouraging smile, but the energy dips.' },
      { text: 'Skip the intro and jump straight into the code.', pts: 5, react: 'Dev is into it. Rosa looks a little lost.' },
    ];
    const MIDS = [
      { setup: 'You notice confused faces during a technical slide.', options: [
        { text: 'Pause and explain it with a simple analogy.', pts: 10, react: '"Oh! That makes sense," says Rosa.' },
        { text: 'Speed up to get through it.', pts: 3, react: 'The confusion spreads.' },
        { text: '"This is probably too technical for some of you."', pts: 0, react: 'Oof. The room gets chilly.' },
        { text: 'Keep going exactly as rehearsed.', pts: 5, react: 'You get through it. Some people are still lost.' }] },
      { setup: 'Your laptop freezes in the middle of a slide!', options: [
        { text: 'Stay calm, crack a light joke, and keep going from memory while it restarts.', pts: 10, react: 'Laughter, then genuine admiration. Very smooth.' },
        { text: 'Panic and apologize repeatedly.', pts: 2, react: 'Everyone feels the stress.' },
        { text: 'Ask everyone to wait silently while it reboots.', pts: 4, react: 'Three very long minutes pass.' },
        { text: 'Skip straight to Q&A.', pts: 5, react: 'Efficient, but you skipped your best material.' }] },
    ];
    const Q_SECONDS = 25;

    function shuffle(arr, rnd) {
      const a = arr.slice();
      for (let i = a.length - 1; i > 0; i--) {
        const j = Math.floor(rnd() * (i + 1));
        [a[i], a[j]] = [a[j], a[i]];
      }
      return a;
    }

    function live(task, slides, done) {
      const s = st();
      const rnd = U.seeded(s.seed + task.id.charCodeAt(1) * 977 + s.day);
      const mid = MIDS[Math.floor(rnd() * MIDS.length)];
      const midAt = Math.max(1, Math.floor(slides.length / 2));
      const result = { opening: 0, mid: 0, answers: [] };
      const team = task.group ? (task.group === 'g1' ? ['jordan', 'sam'] : ['priya', 'tyler']) : [];
      let el;
      let timer = null;

      function frame(inner) {
        if (!el) {
          el = document.createElement('div');
          el.className = 'stage';
          document.body.appendChild(el);
        }
        el.innerHTML = `<div class="spotlight"></div><div class="stage-inner">
          <div class="spread"><span class="scene-place">🎤 ${U.esc(task.title)}</span>${team.length ? `<span class="row small">${IS.avatar.forCharacter('player', 30)}${team.map((m) => IS.avatar.forCharacter(m, 30)).join('')} on stage</span>` : ''}</div>
          ${inner}
          <div class="audience">${task.audience.map((a) => `<div class="seat">${IS.avatar.forCharacter(a, 56)}<div>${IS.characters[a].short}</div></div>`).join('')}</div></div>`;
        el.scrollTop = 0;
        return el;
      }
      function on(sel, fn) {
        el.querySelectorAll(sel).forEach((b) => { b.onclick = () => fn(b); });
      }

      function opening() {
        frame(`<h2 style="margin-top:14px">You're up! How do you open?</h2>
          ${OPENINGS.map((o, i) => `<button class="btn choice" data-i="${i}">${U.esc(o.text)}</button>`).join('')}`);
        on('[data-i]', (b) => {
          const o = OPENINGS[+b.dataset.i];
          result.opening = o.pts;
          react(o.react, () => slide(0));
        });
      }

      function react(text, next) {
        frame(`<div class="card flat" style="margin-top:16px"><p>${U.esc(text)}</p><button class="btn primary" data-go>Continue ▸</button></div>`);
        on('[data-go]', next);
      }

      function slide(i) {
        if (i >= slides.length) return qna(0);
        if (i === midAt && !result.midDone) return midEvent(i);
        const sl = slides[i];
        const t = IS.slideTypes.find((x) => x.id === sl.type);
        const lines = sl.text.split('\n').map((x) => x.trim()).filter(Boolean);
        const speaker = team.length && i % 3 === 2 ? team[(i / 3 | 0) % team.length] : null;
        frame(`<div class="slide-view" style="margin-top:14px"><h2>${t.icon} ${t.label}</h2>
            ${lines.length ? `<ul>${lines.map((l) => `<li>${U.esc(l)}</li>`).join('')}</ul>` : '<p style="color:#94a3b8"><i>(This slide is blank…)</i></p>'}
            <span class="slide-num">${i + 1} / ${slides.length}</span></div>
          ${speaker ? `<p class="small muted" style="margin-top:8px">${IS.characters[speaker].short} presents this slide${s.groups[task.group].health >= 70 ? ' and nails the handoff.' : '… and the handoff is a bit awkward.'}</p>` : ''}
          <p style="margin-top:12px"><button class="btn primary" data-go>${i + 1 < slides.length ? 'Next slide ▸' : 'Open the floor for questions ▸'}</button></p>`);
        on('[data-go]', () => slide(i + 1));
      }

      function midEvent(i) {
        result.midDone = true;
        frame(`<h2 style="margin-top:14px">⚡ ${U.esc(mid.setup)}</h2>
          ${mid.options.map((o, k) => `<button class="btn choice" data-k="${k}">${U.esc(o.text)}</button>`).join('')}`);
        on('[data-k]', (b) => {
          const o = mid.options[+b.dataset.k];
          result.mid = o.pts;
          react(o.react, () => slide(i));
        });
      }

      function qna(q) {
        if (q >= task.questions.length) return wrap();
        const Q = task.questions[q];
        const opts = shuffle(Q.options, rnd);
        let left = Q_SECONDS;
        frame(`<div class="spread" style="margin-top:14px"><h3>🙋 Question ${q + 1} of ${task.questions.length}</h3><span class="timer" id="qt">${left}s</span></div>
          ${IS.ui.speakerHtml(Q.who, Q.q)}
          ${opts.map((o, k) => `<button class="btn choice" data-k="${k}">${U.esc(o.text)}</button>`).join('')}`);
        const answer = (pts, msg) => {
          clearInterval(timer);
          result.answers.push(pts);
          const mood = pts >= 8 ? '😊 Great answer.' : pts >= 4 ? '🙂 OK answer.' : '😬 That didn\'t land.';
          react(msg || mood, () => qna(q + 1));
        };
        on('[data-k]', (b) => answer(opts[+b.dataset.k].pts));
        timer = setInterval(() => {
          left--;
          const t = document.getElementById('qt');
          if (t) {
            t.textContent = left + 's';
            if (left <= 5) t.classList.add('low');
          }
          if (left <= 0) answer(0, '⏰ You froze and ran out of time. "Let\'s take that offline," you say.');
        }, 1000);
      }

      function wrap() {
        IS.ui.confetti(30);
        frame(`<div class="center" style="margin-top:20px"><p class="applause">👏👏👏</p><h2>Thank you!</h2>
          <p class="muted">The audience applauds. Grading your deck, delivery and answers…</p>
          <button class="btn gold big" data-go>See my grade</button></div>`);
        on('[data-go]', () => {
          el.remove();
          done(result);
        });
      }

      opening();
    }

    return { live };
  })();
})();
