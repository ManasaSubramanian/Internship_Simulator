// Career center: applications, interviews (behavioral + technical), results,
// and the training center you must complete after an unsuccessful interview.
IS.interview = (function () {
  const U = IS.util;
  const st = () => IS.state.get();
  const PASS = 70;
  const CODE_MINUTES = 20;
  let timerId = null;
  let practiceShell = {};

  const track = () => IS.trackAt(st().career.level);

  function iv() {
    const s = st();
    if (!s.interview || s.interview.level !== s.career.level) {
      const prev = s.career.history.filter((h) => h.level === s.career.level).length;
      s.interview = {
        level: s.career.level, attempt: 1, trainings: 0, stage: 'invite', waived: s.career.returnOffer && s.career.level > 0,
        prevAttemptsThisLevel: prev, answers: {}, lessonsRead: [], practice: {},
      };
      pick(s.interview);
      IS.state.save();
    }
    return s.interview;
  }

  // Choose this attempt's questions (different each attempt).
  function pick(I) {
    const rnd = U.seeded(st().seed + I.level * 1009 + I.attempt * 131);
    const t = IS.trackAt(I.level);
    I.behav = U.shuffle(IS.behavioral.questions.map((_, i) => i), rnd).slice(0, 5);
    I.concepts = U.shuffle(t.interview.concepts.map((_, i) => i), rnd).slice(0, 4);
    I.coding = (I.attempt - 1) % t.interview.coding.length;
    I.answers = { behav: [], concepts: [], free: '', code: null };
    I.scores = null;
    I.codeStarted = null;
  }

  const bonus = (I) => Math.min(15, I.trainings * 5);
  const problem = (I) => track().interview.coding[I.coding];

  // ── Screens ─────────────────────────────────────────────
  function render() {
    const s = st();
    const I = iv();
    clearInterval(timerId);
    switch (I.stage) {
      case 'behavioral': return room(behavioral(I));
      case 'free': return room(freeResponse(I));
      case 'concepts': return room(concepts(I));
      case 'coding': return room(coding(I));
      case 'result': return room(result(I));
      case 'training': return room(training(I));
      default: return IS.home.careerCenter(invite(I));
    }
  }

  function room(inner) {
    return `<div class="screen interview-room"><div class="interview-inner">${inner}</div></div>`;
  }

  function interviewer(id, text, mood) {
    const c = IS.characters[id];
    return `<div class="row" style="align-items:flex-end;flex-wrap:nowrap;gap:16px;margin-bottom:14px">
      <div style="flex:none">${IS.people.of(id, { height: 330, mood })}</div>
      <div class="panel" style="flex:1"><div class="small muted" style="font-weight:800">${U.esc(c.name)} · ${U.esc(c.title)}</div><div style="font-size:1.08rem;margin-top:4px">${text}</div></div></div>`;
  }

  function invite(I) {
    const t = track();
    const s = st();
    const again = I.attempt > 1 || I.prevAttemptsThisLevel > 0;
    return `<div class="panel">
      <div class="small muted" style="font-weight:900;letter-spacing:.8px;text-transform:uppercase">Application · Internship ${t.n} of 10</div>
      <h1 style="margin:4px 0">${t.icon} ${U.esc(t.title)}</h1>
      <p style="font-size:1.05rem"><b>${U.esc(t.team)}</b> · ${U.esc(t.langLabel)} · ${U.money(t.rate)}/hr · 100 hours (3 hrs/day)</p>
      <p>${U.esc(t.blurb)}</p>
      <div class="chips" style="margin-bottom:12px">${t.skills.map((k) => `<span class="pill">${U.esc(k)}</span>`).join('')}</div>
      ${I.waived ? `<div class="panel soft" style="margin-bottom:12px">🎉 <b>You have a return offer!</b> The behavioral round is waived. You only need to pass a <b>${U.esc(t.langLabel)} technical skills check</b> with ${U.esc(IS.characters[t.cast.mentor].name)}.</div>` : ''}
      ${again ? `<div class="panel soft" style="margin-bottom:12px">🔁 Attempt #${I.attempt}${I.trainings ? ` · Training completed ${I.trainings}× (prep bonus +${bonus(I)} points on each round)` : ''}. The questions will be different this time.</div>` : ''}
      <h3>How the interview works</h3>
      <ol class="small">${I.waived ? '' : `<li><b>Behavioral round</b> with ${U.esc(IS.characters[t.cast.manager].name)}: 5 questions + one written answer.</li>`}
        <li><b>Technical round</b> with ${U.esc(IS.characters[t.cast.mentor].name)}: 4 concept questions + a ${CODE_MINUTES}-minute live ${U.esc(t.langLabel)} problem.</li>
        <li>You need <b>${PASS}+</b> on each round. Not this time? You'll get <b>training</b>, then you can try again as many times as you need.</li></ol>
      <div class="row" style="margin-top:14px"><button class="btn gold big" data-act="ivStart">Start the interview →</button><button class="btn" data-act="ivStudy">📚 Study first (training center)</button></div></div>`;
  }

  function progressDots(n, total) {
    return `<div class="row small muted" style="margin-bottom:8px">${Array.from({ length: total }, (_, i) => `<span style="width:10px;height:10px;border-radius:50%;background:${i < n ? 'var(--terracotta)' : 'var(--sand)'};display:inline-block"></span>`).join('')}</div>`;
  }

  function behavioral(I) {
    const k = I.answers.behav.length;
    const Q = IS.behavioral.questions[I.behav[k]];
    const t = track();
    const rnd = U.seeded(st().seed + k * 17 + I.attempt);
    const opts = U.shuffle(Q.options.map((o, i) => Object.assign({ i }, o)), rnd);
    return `<div class="scene-place" style="color:var(--terracotta);font-weight:900;font-size:.8rem;letter-spacing:1px">BEHAVIORAL ROUND · QUESTION ${k + 1} OF 5</div>${progressDots(k, 6)}
      ${interviewer(t.cast.manager, U.esc(Q.q), 'neutral')}
      <div class="panel">${opts.map((o) => `<button class="btn choice" data-act="ivBehav" data-arg="${o.i}">💬 ${U.esc(o.text)}</button>`).join('')}</div>`;
  }

  function freeResponse(I) {
    const t = track();
    return `<div class="scene-place" style="color:var(--terracotta);font-weight:900;font-size:.8rem;letter-spacing:1px">BEHAVIORAL ROUND · LAST QUESTION</div>${progressDots(5, 6)}
      ${interviewer(t.cast.manager, U.esc(IS.behavioral.freeResponse.q), 'happy')}
      <div class="panel"><textarea id="iv-free" style="min-height:180px" placeholder="Be specific: what excites you, what you bring, what you want to learn…">${U.esc(I.answers.free)}</textarea>
      <div class="spread" style="margin-top:8px"><span class="small muted" id="iv-wc">${U.words(I.answers.free).length} words</span><button class="btn gold" data-act="ivFree">Submit answer →</button></div></div>`;
  }

  function concepts(I) {
    const t = track();
    const k = I.answers.concepts.length;
    const Q = t.interview.concepts[I.concepts[k]];
    return `<div class="scene-place" style="color:var(--terracotta);font-weight:900;font-size:.8rem;letter-spacing:1px">TECHNICAL ROUND · CONCEPT ${k + 1} OF 4</div>${progressDots(k, 5)}
      ${interviewer(t.cast.mentor, U.esc(Q.q), 'neutral')}
      <div class="panel">${Q.options.map((o, i) => `<button class="btn choice" data-act="ivConcept" data-arg="${i}">${U.esc(o)}</button>`).join('')}</div>`;
  }

  // ── Problem editor shared by the interview and training practice ──
  function problemEditor(p, code, idPrefix) {
    const kind = p.type || 'coding';
    let editor;
    if (kind === 'terminal') {
      editor = `<div class="terminal" id="${idPrefix}-term" style="height:260px"><div id="${idPrefix}-out">${U.esc(p.motd || 'Simulated Linux shell. Type help.')}\n\n</div><div style="display:flex"><span class="ps1" id="${idPrefix}-ps1">intern@showctl:~$ </span><input id="${idPrefix}-in" autocomplete="off" spellcheck="false"></div></div>
        <div class="objective-list" id="${idPrefix}-obj" style="margin-top:10px"></div>`;
    } else {
      editor = `<textarea class="editor" id="${idPrefix}-code" spellcheck="false" style="min-height:220px">${U.esc(code)}</textarea>` +
        (kind === 'web' ? `<iframe class="preview-frame" id="${idPrefix}-preview" sandbox="allow-scripts allow-same-origin" style="height:200px;margin-top:8px" title="Preview"></iframe>` : '') +
        (kind === 'sql' ? `<details style="margin-top:8px"><summary class="small" style="cursor:pointer;font-weight:800">📚 Database schema</summary><pre style="white-space:pre-wrap">${U.esc(track().db.schema.replace(/;\s*/g, ';\n'))}</pre></details>` : '');
    }
    return `<div class="brief" style="margin-bottom:10px">${p.brief}</div>${editor}
      <div class="row" style="margin-top:8px">${kind === 'terminal' ? '' : `<button class="btn small primary" data-act="ivRun" data-arg="${idPrefix}">▶ Run visible tests</button>`}</div>
      <div id="${idPrefix}-results"></div>`;
  }

  function runProblem(p, code, shell, which, previewEl) {
    const kind = p.type || 'coding';
    const all = which === 'all';
    if (kind === 'coding') return IS.runners[p.lang].run(code, p.fnName, all ? p.tests.concat(p.hidden || []) : p.tests);
    if (kind === 'sql') return IS.runners.sql.run(p, code, track().db, IS.sqlExpected[track().id][p.id]);
    if (kind === 'web') return IS.runners.web.run(p, code, previewEl, all ? 'all' : 'visible');
    if (kind === 'config') return Promise.resolve(IS.runners.yaml.grade(all ? p : Object.assign({}, p, { checks: p.checks.filter((c) => !c.hidden) }), code));
    if (kind === 'terminal') return Promise.resolve(IS.runners.shell.grade(p, shell));
    return Promise.resolve({ error: 'Unknown problem type' });
  }

  function resultsList(run) {
    if (run.error) return `<div class="test fail">⚠️ ${U.esc(run.error)}</div>`;
    const passed = run.results.filter((r) => r.pass).length;
    return `<div class="spread" style="margin:8px 0"><b>Results</b><span class="pill ${passed === run.results.length ? 'good' : 'bad'}">${passed}/${run.results.length}</span></div>` +
      run.results.map((r, i) => `<div class="test ${r.pass ? 'pass' : 'fail'}">${r.pass ? '✅' : '❌'} ${U.esc(r.label || 'Test #' + (i + 1))} <span class="muted">${r.pass ? '' : U.esc(r.got || '')}</span></div>`).join('');
  }

  function coding(I) {
    const t = track();
    const p = problem(I);
    if (!I.codeStarted) I.codeStarted = Date.now();
    if (I.answers.code == null) I.answers.code = p.starter || '';
    IS.state.save();
    return `<div class="scene-place" style="color:var(--terracotta);font-weight:900;font-size:.8rem;letter-spacing:1px">TECHNICAL ROUND · LIVE ${U.esc(t.langLabel.toUpperCase())} PROBLEM</div>
      <div class="row" style="align-items:flex-start;flex-wrap:nowrap;gap:14px;margin:10px 0">
        <div style="flex:none">${IS.people.portrait(t.cast.mentor, 90)}</div>
        <div class="panel" style="flex:1"><div class="spread"><b>${U.esc(IS.characters[t.cast.mentor].name)}</b><span class="timer" id="iv-timer" style="color:var(--terracotta)">--:--</span></div>
          <div>Take your time and think out loud. Edge cases count. Hidden tests run when you submit. <b>${p.title}</b></div></div></div>
      <div class="panel">${problemEditor(p, I.answers.code, 'iv')}
        <div class="spread" style="margin-top:10px"><span class="small muted">Submitting ends the interview.</span><button class="btn gold" data-act="ivSubmitCode">Submit solution →</button></div></div>`;
  }

  function result(I) {
    const t = track();
    const sc = I.scores;
    const passed = sc.passed;
    const b = bonus(I);
    const weak = [];
    if (!I.waived && sc.behavioral < PASS) weak.push('behavioral answers (use STAR: specific situation, your actions, measurable results)');
    if (sc.concepts < 75) weak.push(`${t.langLabel} fundamentals`);
    if (sc.code < 70) weak.push('the live problem (test edge cases and read the spec carefully)');
    const letter = passed
      ? `<h1>🎉 Offer letter</h1><p>Dear ${U.esc(st().player.name)},</p><p>We're delighted to offer you the role of <b>${U.esc(t.title)}</b> on <b>${U.esc(t.team)}</b>: 100 hours at <b>${U.money(t.rate)}/hour</b>, 3 hours a day. Your manager will be ${U.esc(IS.characters[t.cast.manager].name)} and your mentor ${U.esc(IS.characters[t.cast.mentor].name)}.</p><p>Welcome aboard!<br>— Rosa Alvarez, University Programs</p>`
      : `<h1>📨 Interview result</h1><p>Dear ${U.esc(st().player.name)},</p><p>Thank you for interviewing for <b>${U.esc(t.title)}</b>. We aren't able to move forward this time, but we'd love to see you try again. We've enrolled you in our <b>interview training program</b>. Complete it and you can reapply right away.</p><p>Areas to focus on: ${weak.map(U.esc).join('; ') || 'overall consistency'}.</p><p>— Rosa Alvarez, University Programs</p>`;
    return `<div class="row" style="align-items:flex-end;flex-wrap:nowrap;gap:16px"><div style="flex:none">${IS.people.of('rosa', { height: 220, mood: passed ? 'happy' : 'neutral' })}</div>
      <div class="panel" style="flex:1">${letter}
      <table class="tbl" style="margin:10px 0"><tr><th>Round</th><th class="num">Score</th><th class="num">Needed</th></tr>
        <tr><td>Behavioral${I.waived ? ' (waived: return offer)' : ` (5 questions ${Math.round(sc.behavMc)}%, written ${Math.round(sc.free)}%)`}</td><td class="num">${Math.round(sc.behavioral)}</td><td class="num">${PASS}</td></tr>
        <tr><td>Technical (concepts ${Math.round(sc.concepts)}%, live problem ${Math.round(sc.code)}%)</td><td class="num">${Math.round(sc.technical)}</td><td class="num">${PASS}</td></tr>
        ${b ? `<tr><td colspan="3" class="small muted">Includes +${b} prep bonus from ${I.trainings} completed training${I.trainings > 1 ? 's' : ''}.</td></tr>` : ''}</table>
      ${passed ? `<button class="btn gold big" data-act="ivAccept">Accept & start Day 1 →</button>` : `<button class="btn primary big" data-act="ivTrain">Start training →</button>`}</div></div>`;
  }

  function training(I) {
    const t = track();
    const lessons = IS.behavioral.lessons.map((l, i) => Object.assign({ key: 'b' + i }, l)).concat(t.training.lessons.map((l, i) => Object.assign({ key: 't' + i }, l)));
    const practice = t.interview.coding.map((p, i) => ({ p, i })).filter((x) => x.i !== I.coding);
    const done = (x) => I.practice[x.i] && (I.practice[x.i].passed || I.practice[x.i].tries >= 2);
    const allRead = lessons.every((l) => I.lessonsRead.includes(l.key));
    const allPractice = practice.every(done);
    return `<div class="row" style="align-items:flex-end;flex-wrap:nowrap;gap:16px;margin-bottom:12px"><div style="flex:none">${IS.people.of(t.cast.mentor, { height: 170 })}</div>
      <div class="panel" style="flex:1"><h1 style="margin:0">📚 Interview Training Center</h1><p style="margin:6px 0 0">Read every lesson and complete the practice problems (pass each, or give it two honest tries). Finishing training adds a <b>+5 prep bonus</b> to each interview round (up to +15).</p></div></div>
      <h2>Lessons</h2>${lessons.map((l) => `<div class="lesson ${I.lessonsRead.includes(l.key) ? 'done' : ''}"><h3>${I.lessonsRead.includes(l.key) ? '✅ ' : ''}${U.esc(l.title)}</h3>${l.html}
        ${I.lessonsRead.includes(l.key) ? '' : `<button class="btn small sage" data-act="ivRead" data-arg="${l.key}">Mark as read</button>`}</div>`).join('')}
      <h2>Practice problems (${U.esc(t.langLabel)})</h2>${practice.map((x) => `<div class="lesson"><div class="spread"><h3 style="margin:0">${done(x) ? '✅ ' : ''}${U.esc(x.p.title)}</h3><span class="pill">${I.practice[x.i] ? (I.practice[x.i].passed ? 'Passed' : I.practice[x.i].tries + ' tr' + (I.practice[x.i].tries === 1 ? 'y' : 'ies')) : 'Not started'}</span></div>
        ${problemEditor(x.p, (I.practice[x.i] && I.practice[x.i].code) || x.p.starter || '', 'pr' + x.i)}
        <button class="btn small gold" style="margin-top:8px" data-act="ivPractice" data-arg="${x.i}">Check my solution (all tests)</button></div>`).join('')}
      <div class="panel" style="margin-top:12px"><div class="spread"><span>${allRead ? '✅' : '⬜'} Lessons · ${allPractice ? '✅' : '⬜'} Practice</span>
        <button class="btn gold big" data-act="ivFinishTraining" ${allRead && allPractice ? '' : 'disabled'}>Complete training & reapply →</button></div></div>`;
  }

  // ── Mount & actions ─────────────────────────────────────
  function mountProblem(p, prefix, getCode, setCode) {
    const kind = p.type || 'coding';
    if (kind === 'terminal') {
      const key = prefix;
      if (!practiceShell[key]) practiceShell[key] = IS.runners.shell.create(p.fs);
      const sh = practiceShell[key];
      const out = document.getElementById(prefix + '-out');
      const input = document.getElementById(prefix + '-in');
      const obj = document.getElementById(prefix + '-obj');
      const drawObj = () => { obj.innerHTML = p.objectives.map((o) => { let ok = false; try { ok = o.check(sh); } catch (e) { ok = false; } return `<div class="obj ${ok ? 'done' : ''}">${ok ? '✅' : '⬜'} ${U.esc(o.text)}</div>`; }).join(''); };
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
      });
      return;
    }
    const ta = document.getElementById(prefix + '-code');
    ta.addEventListener('input', () => setCode(ta.value));
    ta.addEventListener('keydown', (e) => {
      if (e.key === 'Tab') {
        e.preventDefault();
        ta.setRangeText('    '.slice(p.lang === 'python' ? 0 : 2), ta.selectionStart, ta.selectionEnd, 'end');
        setCode(ta.value);
      }
    });
  }

  function mount() {
    const s = st();
    const I = s.interview;
    if (!I) return;
    if (I.stage === 'free') {
      const ta = document.getElementById('iv-free');
      ta.addEventListener('input', () => { I.answers.free = ta.value; document.getElementById('iv-wc').textContent = U.words(ta.value).length + ' words'; });
    }
    if (I.stage === 'coding') {
      const p = problem(I);
      mountProblem(p, 'iv', () => I.answers.code, (v) => { I.answers.code = v; IS.state.save(); });
      const tick = () => {
        const left = Math.max(0, CODE_MINUTES * 60 - Math.floor((Date.now() - I.codeStarted) / 1000));
        const el = document.getElementById('iv-timer');
        if (!el) { clearInterval(timerId); return; }
        el.textContent = Math.floor(left / 60) + ':' + String(left % 60).padStart(2, '0');
        el.classList.toggle('low', left <= 60);
        if (left <= 0) {
          clearInterval(timerId);
          IS.ui.toast('⏰ Time\'s up! Submitting your solution.', 'bad');
          actions.ivSubmitCode();
        }
      };
      tick();
      timerId = setInterval(tick, 1000);
    }
    if (I.stage === 'training') {
      track().interview.coding.forEach((p, i) => {
        if (i === I.coding) return;
        I.practice[i] = I.practice[i] || { tries: 0, passed: false, code: p.starter || '' };
        mountProblem(p, 'pr' + i, () => I.practice[i].code, (v) => { I.practice[i].code = v; IS.state.save(); });
      });
    }
  }

  function codeScore(run) {
    if (run.error || !run.results.length) return 0;
    return 100 * run.results.filter((r) => r.pass).length / run.results.length;
  }

  function finishInterview(I, codePct) {
    const t = track();
    const b = bonus(I);
    const mc = I.waived ? 100 : 100 * I.answers.behav.reduce((a, x) => a + x, 0) / 50;
    const free = I.waived ? 100 : IS.grading.written({ rubric: IS.behavioral.freeResponse.rubric }, I.answers.free).score;
    const behavioral = I.waived ? 100 : U.clamp(0.75 * mc + 0.25 * free + b, 0, 100);
    const conceptPct = 100 * I.answers.concepts.filter((a, k) => a === t.interview.concepts[I.concepts[k]].answer).length / I.concepts.length;
    const technical = U.clamp(0.4 * conceptPct + 0.6 * codePct + b, 0, 100);
    const passed = behavioral >= PASS && technical >= PASS;
    I.scores = { behavMc: mc, free, behavioral, concepts: conceptPct, code: codePct, technical, passed };
    I.stage = 'result';
    st().lifetime.interviews++;
    IS.state.save();
    IS.ui.render();
    if (passed) IS.ui.confetti(60);
  }

  const actions = {
    ivStart() {
      const I = iv();
      I.stage = I.waived ? 'concepts' : 'behavioral';
      IS.state.save();
      IS.ui.render();
    },
    ivStudy() {
      const I = iv();
      I.stage = 'training';
      I.voluntary = true;
      IS.state.save();
      IS.ui.render();
    },
    ivBehav(i) {
      const I = iv();
      const Q = IS.behavioral.questions[I.behav[I.answers.behav.length]];
      I.answers.behav.push(Q.options[+i].pts);
      if (I.answers.behav.length >= 5) I.stage = 'free';
      IS.state.save();
      IS.ui.render();
    },
    ivFree() {
      const I = iv();
      if (U.words(I.answers.free).length < 10) return IS.ui.toast('Write a real answer first. Aim for 50+ words.', 'bad');
      I.stage = 'concepts';
      IS.state.save();
      IS.ui.render();
    },
    ivConcept(i) {
      const I = iv();
      I.answers.concepts.push(+i);
      if (I.answers.concepts.length >= 4) I.stage = 'coding';
      IS.state.save();
      IS.ui.render();
    },
    ivRun(prefix) {
      const I = iv();
      const t = track();
      const isPractice = prefix.startsWith('pr');
      const idx = isPractice ? +prefix.slice(2) : I.coding;
      const p = t.interview.coding[idx];
      const code = isPractice ? I.practice[idx].code : I.answers.code;
      const out = document.getElementById(prefix + '-results');
      out.innerHTML = '<p class="muted">Running…</p>';
      runProblem(p, code, practiceShell[prefix], 'visible', document.getElementById(prefix + '-preview')).then((run) => { out.innerHTML = resultsList(run); });
    },
    ivSubmitCode() {
      const I = iv();
      const p = problem(I);
      clearInterval(timerId);
      const out = document.getElementById('iv-results');
      if (out) out.innerHTML = '<p class="muted">Grading…</p>';
      runProblem(p, I.answers.code, practiceShell.iv, 'all', document.getElementById('iv-preview')).then((run) => {
        delete practiceShell.iv;
        finishInterview(I, codeScore(run));
      });
    },
    ivAccept() {
      const s = st();
      const I = iv();
      if (!s.career.history.length && !s.awards.some((a) => a.id === 'hired')) IS.engine.grantAward('hired', 'First interview passed');
      if (I.attempt > 1 || I.prevAttemptsThisLevel > 0) IS.engine.grantAward('persistent', 'Passed on attempt #' + I.attempt);
      IS.engine.startJob(s.career.level);
      practiceShell = {};
      IS.ui.render();
      setTimeout(() => IS.ui.flushCeremonies(() => IS.ui.toast('Welcome! Walk to the security desk and badge in with Marcus.', 'gold')), 100);
    },
    ivTrain() {
      const I = iv();
      I.stage = 'training';
      I.voluntary = false;
      IS.state.save();
      IS.ui.render();
    },
    ivRead(key) {
      const I = iv();
      if (!I.lessonsRead.includes(key)) I.lessonsRead.push(key);
      IS.state.save();
      const y = document.querySelector('.screen') && document.querySelector('.screen').scrollTop;
      IS.ui.render();
      if (y != null && document.querySelector('.screen')) document.querySelector('.screen').scrollTop = y;
    },
    ivPractice(i) {
      const I = iv();
      const p = track().interview.coding[+i];
      const rec = I.practice[+i];
      const out = document.getElementById('pr' + i + '-results');
      out.innerHTML = '<p class="muted">Checking…</p>';
      runProblem(p, rec.code, practiceShell['pr' + i], 'all', document.getElementById('pr' + i + '-preview')).then((run) => {
        rec.tries++;
        if (!run.error && run.results.every((r) => r.pass)) rec.passed = true;
        IS.state.save();
        out.innerHTML = resultsList(run) + (rec.passed ? '<p><b>✅ Passed!</b></p>' : rec.tries >= 2 ? '<p class="small">Two honest tries count as complete. Review the lesson and keep practicing!</p>' : '');
        const y = document.querySelector('.screen').scrollTop;
        const html = out.innerHTML;
        IS.ui.render();
        document.querySelector('.screen').scrollTop = y;
        const again = document.getElementById('pr' + i + '-results');
        if (again) again.innerHTML = html;
      });
    },
    ivFinishTraining() {
      const I = iv();
      I.trainings++;
      if (!I.voluntary || I.scores) I.attempt++;
      I.lessonsRead = [];
      I.practice = {};
      practiceShell = {};
      I.stage = 'invite';
      pick(I);
      IS.state.save();
      IS.ui.render();
      IS.ui.toast(`📚 Training complete! Prep bonus: +${bonus(I)} on each round.`, 'good');
    },
  };

  return { render, mount, actions, PASS };
})();
