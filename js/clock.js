// Real-time work clock. While you're badged in, one real minute is one work
// minute (a workday is 60 of them). Focus time only goes to the assignment
// that's open on your computer, and the clock pauses when you're away: the tab
// is hidden or there's been no typing, clicking or mouse movement for 2 minutes.
IS.clock = (function () {
  const IDLE_MS = 120000;
  const MINUTE_MS = 60000;
  let lastActive = Date.now();
  let last = Date.now();
  let acc = 0;
  let lastFocus = null;
  const st = () => IS.state.get();
  const E = () => IS.engine;

  ['keydown', 'mousedown', 'mousemove', 'wheel', 'touchstart', 'input'].forEach((ev) =>
    document.addEventListener(ev, () => { lastActive = Date.now(); }, { passive: true, capture: true }));

  function status() {
    const s = st();
    const j = s && s.job;
    if (!j || !j.clockedIn || j.atHome) return 'off';
    if (j.minute >= E().dayLen()) return 'over';
    if (document.hidden) return 'hidden';
    if (Date.now() - lastActive > IDLE_MS) return 'idle';
    return 'running';
  }

  // The assignment you're working on right now (open on your computer).
  function activeTask() {
    const ov = IS.ui.overlay && IS.ui.overlay();
    if (!ov || ov.kind !== 'computer' || ov.app !== 'task') return null;
    const r = st().job.tasks[ov.arg];
    return r && r.status === 'assigned' ? ov.arg : null;
  }

  function passMinutes(n, focusId) {
    let ended = false;
    for (let i = 0; i < n && !ended; i++) {
      ended = E().passMinute(focusId);
      if (focusId) lastFocus = focusId;
    }
    IS.state.save();
    if (ended) {
      acc = 0;
      IS.ui.after();
    }
    return ended;
  }

  function tick() {
    const nowMs = Date.now();
    const dt = Math.min(5000, nowMs - last);
    last = nowMs;
    const now = status();
    if (now === 'running') {
      acc += dt;
      while (acc >= MINUTE_MS && status() === 'running') {
        acc -= MINUTE_MS;
        passMinutes(1, activeTask());
      }
    }
    paint(now);
  }

  // Update the live bits of the screen without re-rendering (so typing isn't interrupted).
  function paint(now) {
    const s = st();
    const j = s && s.job;
    if (!j) return;
    const set = (key, fn) => document.querySelectorAll(`[data-live="${key}"]`).forEach(fn);
    set('clock', (el) => { el.textContent = j.clockedIn ? IS.util.clock(j.minute) : '—'; });
    set('hours', (el) => { el.textContent = E().hoursWorked().toFixed(1) + ' / ' + E().TOTAL_HOURS; });
    set('energy', (el) => { el.style.width = j.energy + '%'; });
    const label = { running: '', idle: '⏸ Paused: you\'ve been away 2 min. Move the mouse or type to resume.', hidden: '⏸ Paused while the game is in the background', over: '🕙 Shift over. Head to the exit to clock out.', off: '' }[now];
    set('clockstate', (el) => { el.textContent = label; el.hidden = !label; });
    const id = activeTask();
    set('focus', (el) => {
      const task = E().taskById(el.dataset.task);
      const r = task && j.tasks[task.id];
      if (!r) return;
      const pct = Math.min(100, Math.round(r.progress / task.effort * 100));
      const bar = el.querySelector('.bar span');
      if (bar) bar.style.width = pct + '%';
      const txt = el.querySelector('.focus-text');
      if (txt) txt.textContent = `${Math.floor(r.progress)} / ${task.effort} min of focus time`;
      const hint = el.querySelector('.focus-hint');
      if (hint) {
        hint.textContent = r.status !== 'assigned' ? '' : pct >= 100 ? '✅ Enough focus time. Submit when your work is ready.'
          : id === task.id && now === 'running' ? `⏱️ Working… (${Math.round(E().productivity() * 100)}% productivity). Focus time grows every minute this task stays open.`
            : now === 'running' ? 'Open this task to put time into it.' : 'Clock paused.';
      }
    });
    set('submit', (el) => {
      const can = E().canSubmit(el.dataset.task);
      el.setAttribute('aria-disabled', can.ok ? 'false' : 'true');
      el.style.opacity = can.ok ? '' : '.55';
      const why = document.querySelector(`[data-live="submitwhy"][data-task="${el.dataset.task}"]`);
      if (why && !can.ok) why.textContent = can.why;
    });
  }

  // Testing shortcut: jump the clock forward (focus goes to the open or last task).
  function skip(mins) {
    const s = st();
    const j = s && s.job;
    if (!j || !j.clockedIn) return IS.ui.toast('Badge in first, then you can skip ahead.', 'bad');
    const left = E().dayLen() - j.minute;
    const n = Math.min(mins, left);
    if (n <= 0) return IS.ui.toast('The shift is already over.', 'bad');
    passMinutes(n, activeTask() || lastFocus);
    IS.ui.toast(`🧪 Skipped ${n} min → ${IS.util.clock(j.minute)}`, 'gold');
    IS.ui.after();
  }

  function reset() { acc = 0; last = Date.now(); lastActive = Date.now(); }

  setInterval(tick, 1000);
  return { status, skip, reset, activeTask, paint: () => paint(status()) };
})();
