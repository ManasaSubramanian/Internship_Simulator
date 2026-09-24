// UI shell: routing, top bar, modals, toasts, dialogue scenes, ceremonies,
// and the end-of-day flow. Views live in views.js / workspace.js.
IS.ui = (function () {
  const U = IS.util;
  const E = () => IS.engine;
  const st = () => IS.state.get();
  let route = { name: 'desk', arg: null };
  let busy = false; // true while a scene/ceremony modal is open

  const NAV = [
    { id: 'desk', icon: '🏠', label: 'My Desk' },
    { id: 'tasks', icon: '📋', label: 'Task Board' },
    { id: 'inbox', icon: '📬', label: 'Inbox' },
    { id: 'team', icon: '👥', label: 'Team' },
    { id: 'store', icon: '🛍️', label: 'Store & Café' },
    { id: 'profile', icon: '🧑‍🎨', label: 'Profile & Style' },
    { id: 'report', icon: '📊', label: 'Report Card' },
    { id: 'awards', icon: '🏆', label: 'Awards' },
    { id: 'pay', icon: '💵', label: 'Paystubs' },
  ];

  function $(sel) {
    return document.querySelector(sel);
  }

  // ── Toasts & modals ─────────────────────────────────────
  function toast(msg, kind) {
    const root = $('#toast-root');
    if (!root) return;
    const el = document.createElement('div');
    el.className = 'toast ' + (kind || '');
    el.textContent = msg;
    root.appendChild(el);
    while (root.children.length > 3) root.firstChild.remove();
    setTimeout(() => el.remove(), 4200);
  }

  // opts: {title, html, wide, buttons: [{label, cls, onClick(close)}], onMount(el, close), locked}
  function modal(opts) {
    const back = document.createElement('div');
    back.className = 'modal-back';
    back.innerHTML = `<div class="modal ${opts.wide ? 'wide' : ''}" role="dialog" aria-modal="true">
      ${opts.title ? `<h2>${opts.title}</h2>` : ''}<div class="modal-body">${opts.html || ''}</div>
      <div class="modal-actions"></div></div>`;
    const close = () => {
      back.remove();
      if (opts.onClose) opts.onClose();
    };
    const actions = back.querySelector('.modal-actions');
    (opts.buttons || [{ label: 'Close', cls: 'primary' }]).forEach((b) => {
      const btn = document.createElement('button');
      btn.className = 'btn ' + (b.cls || '');
      btn.innerHTML = b.label;
      btn.onclick = () => (b.onClick ? b.onClick(close) : close());
      actions.appendChild(btn);
    });
    if (!opts.locked) {
      back.addEventListener('click', (e) => {
        if (e.target === back) close();
      });
    }
    $('#modal-root').appendChild(back);
    if (opts.onMount) opts.onMount(back.querySelector('.modal'), close);
    return close;
  }

  function confetti(n) {
    const bits = ['✨', '🎉', '⭐', '🎊', '💫', '🌟'];
    for (let i = 0; i < (n || 40); i++) {
      const c = document.createElement('div');
      c.className = 'confetti';
      c.textContent = bits[i % bits.length];
      c.style.left = Math.random() * 100 + 'vw';
      c.style.animationDuration = 2 + Math.random() * 2.5 + 's';
      c.style.animationDelay = Math.random() * 0.8 + 's';
      document.body.appendChild(c);
      setTimeout(() => c.remove(), 5500);
    }
  }

  // ── Routing & rendering ─────────────────────────────────
  function go(name, arg) {
    route = { name, arg: arg == null ? null : arg };
    render();
    window.scrollTo(0, 0);
  }

  function render() {
    const app = $('#app');
    const s = st();
    if (!s) {
      app.innerHTML = route.name === 'creator' ? IS.views.creator() : IS.views.title();
      if (route.name === 'creator') IS.views.mount.creator();
      return;
    }
    if (s.over && !['end', 'report', 'awards', 'profile', 'pay', 'task', 'inbox'].includes(route.name)) route = { name: 'end', arg: null };
    if (route.name === 'end') {
      app.innerHTML = IS.views.end();
      return;
    }
    const view = IS.views[route.name] || IS.views.desk;
    const unread = s.inbox.filter((m) => !m.read).length;
    app.innerHTML = `<div class="shell">
      ${topbar(s)}
      <nav class="sidebar" aria-label="Main">
        <div class="me">${IS.avatar.forCharacter('player', 44)}<div><div style="font-weight:800">${U.esc(s.player.name)}</div><div class="small muted">SWE Intern</div></div></div>
        ${NAV.map((n) => `<button class="nav-btn ${route.name === n.id || (route.name === 'task' && n.id === 'tasks') ? 'active' : ''}" data-act="go" data-arg="${n.id}">
          <span class="ico">${n.icon}</span><span class="lbl">${n.label}</span>${n.id === 'inbox' && unread ? `<span class="badge">${unread}</span>` : ''}</button>`).join('')}
        <button class="nav-btn" data-act="help"><span class="ico">❓</span><span class="lbl">How to Play</span></button>
        <button class="nav-btn" data-act="menu"><span class="ico">⚙️</span><span class="lbl">Save / Menu</span></button>
      </nav>
      <main class="main" id="main">${view(route.arg)}</main>
    </div>`;
    if (IS.views.mount && IS.views.mount[route.name]) IS.views.mount[route.name](route.arg);
  }

  function topbar(s) {
    const pending = s.period.days.reduce((a, d) => a + d.pay, 0) + (s.clockedIn ? s.minute / 60 * s.rate : 0);
    return `<header class="topbar">
      <div class="brand"><span class="spark">✦</span> Imagineer Intern</div>
      <div class="stat"><span class="k">Week ${U.weekOf(s.day)} · Day ${s.day}/30</span><span class="v">${U.weekday(s.day)}</span></div>
      <div class="stat"><span class="k">${s.clockedIn ? 'On the clock' : 'Off the clock'}</span><span class="v clock">${s.clockedIn ? '🕘 ' + U.clock(s.minute) : '🌙 Off'}</span></div>
      <div class="stat"><span class="k">Energy</span><div class="bar energy"><span style="width:${s.energy}%"></span></div></div>
      <div class="stat"><span class="k">Morale</span><div class="bar morale"><span style="width:${s.morale}%"></span></div></div>
      <div class="spacer"></div>
      <div class="stat"><span class="k">Wallet</span><span class="v" style="color:var(--gold-2)">${U.money(s.wallet)}</span></div>
      <div class="stat"><span class="k">Unpaid earnings</span><span class="v">${U.money(pending)}</span></div>
      ${s.over
        ? `<button class="btn gold small" data-act="go" data-arg="end">🎓 Results</button>`
        : s.clockedIn
          ? `<button class="btn danger small" data-act="clockOut">⏏ Clock out</button>`
          : `<button class="btn gold small" data-act="clockIn">⏱ Clock in</button>`}
    </header>`;
  }

  // Run an engine action, then refresh and handle consequences.
  function after(opts) {
    IS.state.save();
    render();
    flushCeremonies(() => {
      const s = st();
      if (s && s.clockedIn && s.minute >= U.DAY_LENGTH && !busy) {
        busy = true;
        modal({
          title: '🕛 12:00 PM: Shift over!',
          html: `<p>That's your 3 hours for today. Time to clock out.</p>`,
          locked: true,
          buttons: [{ label: 'Clock out', cls: 'gold', onClick: (close) => { close(); busy = false; endDay(); } }],
        });
      } else if (opts && opts.then) opts.then();
    });
  }

  // ── Day flow ────────────────────────────────────────────
  function startDay() {
    const s = st();
    if (s.clockedIn || busy) return;
    const scenes = E().clockIn();
    render();
    toast(`⏱ Clocked in: ${U.weekday(s.day)}, Day ${s.day}`, 'good');
    playScenes(scenes, () => {
      const newTasks = IS.tasks.filter((t) => t.day === s.day);
      if (newTasks.length) toast(`📌 ${newTasks.length} new assignment${newTasks.length > 1 ? 's' : ''} on your Task Board`, 'gold');
      after({ then: () => { if (s.day === E().LAST_DAY) endDay(); } });
    });
  }

  function confirmClockOut() {
    const s = st();
    const left = U.DAY_LENGTH - s.minute;
    if (left <= 0) return endDay();
    modal({
      title: 'Clock out early?',
      html: `<p>It's ${U.clock(s.minute)}. You still have <b>${left} minutes</b> of paid time left today. Leaving early means fewer paid hours (${U.money(left / 60 * s.rate)} less), and deadlines keep ticking.</p>`,
      buttons: [{ label: 'Keep working', cls: 'ghost' }, { label: 'Clock out anyway', cls: 'danger', onClick: (c) => { c(); endDay(); } }],
    });
  }

  function endDay() {
    const sum = E().clockOut();
    if (!sum) return;
    render();
    // Present any spot award before the paystub that includes its bonus.
    flushCeremonies(() => showDaySummary(sum));
  }

  function showDaySummary(sum) {
    const s = st();
    const stub = sum.paystub;
    let html = `<div class="grid grid-2">
      <div class="kpi card flat"><div class="v">${(sum.minutes / 60).toFixed(2)} h</div><div class="k">Hours worked</div></div>
      <div class="kpi card flat"><div class="v" style="color:var(--gold-2)">${U.money(sum.pay)}</div><div class="k">Earned today (gross)</div></div></div>`;
    if (sum.early) html += `<p class="small muted" style="margin-top:10px">You clocked out early, so you were only paid for the time you worked.</p>`;
    const dueSoon = IS.tasks.filter((t) => s.tasks[t.id] && s.tasks[t.id].status === 'assigned')
      .sort((a, b) => E().dueAbs(a) - E().dueAbs(b)).slice(0, 3);
    if (dueSoon.length && !s.over) {
      html += `<h3 style="margin-top:14px">Coming up</h3>` + dueSoon.map((t) => `<div class="row small"><span>${IS.views.icon(t)}</span><b>${U.esc(t.title)}</b><span class="muted">due ${U.dueLabel(E().effectiveDue(t))}</span></div>`).join('');
    }
    if (stub) html += `<h3 style="margin-top:16px">💵 Payday! Week ${stub.week}</h3>` + IS.views.stubTable(stub);
    const weekend = U.isFriday(sum.day) && !s.over;
    if (weekend) html += `<p style="margin-top:12px">🌴 <b>It's the weekend!</b> Rest restores morale. Visit <b>Store &amp; Café → Outings &amp; Trips</b> to spend your paycheck on something fun.</p>`;
    busy = true;
    modal({
      title: `${weekend ? '🎉 End of Week ' + U.weekOf(sum.day) : '🌙 End of Day ' + sum.day}`,
      html,
      locked: true,
      buttons: [{ label: s.over ? 'See my internship results →' : weekend ? 'Enjoy the weekend' : 'Head home', cls: 'primary', onClick: (c) => { c(); busy = false; if (s.over) go('end'); else after(); } }],
    });
  }

  // ── Scenes ──────────────────────────────────────────────
  function playScenes(list, done) {
    const queue = list.slice();
    busy = true;
    const next = () => {
      const sc = queue.shift();
      if (!sc) {
        busy = false;
        done && done();
        return;
      }
      if (sc === 'CEREMONY') IS.ceremony.finals(next);
      else playScene(sc, next);
    };
    next();
  }

  function speakerHtml(who, text) {
    const s = st();
    const isMe = who === 'player';
    const c = isMe ? { name: s.player.name, title: 'You' } : IS.characters[who] || { name: '', title: '' };
    return `<div class="dialog-line ${isMe ? 'me' : ''}">${IS.avatar.forCharacter(who, 54)}
      <div><div class="who">${U.esc(c.name)}<small>${U.esc(c.title || '')}</small></div><div class="bubble">${U.esc(text)}</div></div></div>`;
  }

  function playScene(scene, done) {
    const s = st();
    const steps = scene.steps.slice();
    let log;
    let actions;
    const close = modal({
      title: scene.title,
      html: `<div class="scene-place">${scene.place || ''}</div><div class="scene-log"></div>`,
      locked: true,
      buttons: [],
      onMount: (el) => {
        log = el.querySelector('.scene-log');
        actions = el.querySelector('.modal-actions');
      },
    });
    const text = (t) => (typeof t === 'function' ? t(s) : t);
    const scroll = () => {
      const m = log.closest('.modal');
      m.scrollTop = m.scrollHeight;
    };

    function finish() {
      if (scene.time) E().spend(scene.time);
      if (scene.effects) E().applyEffects(scene.effects);
      if (scene.after === 'risingStar') E().grantAward('rising_star', 'Midpoint review');
      close();
      render();
      flushCeremonies(done);
    }

    function step() {
      actions.innerHTML = '';
      const st2 = steps.shift();
      if (!st2) return finish();
      if (st2.choices) {
        const wrap = document.createElement('div');
        wrap.style.width = '100%';
        st2.choices.forEach((ch) => {
          const b = document.createElement('button');
          b.className = 'btn choice';
          b.textContent = '💬 ' + ch.text;
          b.onclick = () => {
            log.insertAdjacentHTML('beforeend', speakerHtml('player', ch.text));
            E().applyEffects(ch.effects);
            const replies = ch.reply ? (Array.isArray(ch.reply) ? ch.reply : [ch.reply]) : [];
            steps.unshift(...replies);
            scroll();
            step();
          };
          wrap.appendChild(b);
        });
        actions.appendChild(wrap);
        scroll();
        return;
      }
      log.insertAdjacentHTML('beforeend', speakerHtml(st2.who, text(st2.text)));
      scroll();
      const b = document.createElement('button');
      b.className = 'btn primary';
      b.textContent = steps.length ? 'Continue ▸' : 'Done';
      b.onclick = step;
      actions.appendChild(b);
      b.focus();
    }
    step();
  }

  // ── Ceremonies (achievements, spot awards, rising star) ─
  function flushCeremonies(done) {
    const s = st();
    if (!s || !s.pendingCeremonies.length) {
      done && done();
      return;
    }
    const c = s.pendingCeremonies.shift();
    IS.state.save();
    const a = IS.awards.byId(c.id);
    const wasBusy = busy;
    busy = true;
    const cont = () => {
      busy = wasBusy;
      render();
      flushCeremonies(done);
    };
    if (c.id === 'spot' || c.id === 'rising_star') {
      IS.ceremony.honor(a, c, cont);
      return;
    }
    confetti(24);
    modal({
      title: '🏅 Achievement Unlocked!',
      html: `<div class="center"><div class="trophy-big">${a.icon}</div><h2>${a.name}</h2><p class="muted">${a.desc}</p></div>`,
      buttons: [{ label: 'Nice!', cls: 'gold', onClick: (cl) => { cl(); cont(); } }],
      locked: true,
    });
  }

  function isBusy() {
    return busy;
  }

  return { render, go, toast, modal, confetti, after, startDay, confirmClockOut, endDay, playScenes, playScene, speakerHtml, flushCeremonies, isBusy, route: () => route };
})();
