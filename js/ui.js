// UI shell: screen routing, HUD, dialogue box, interactions with people and
// objects in the office, the day flow, modals, toasts and ceremonies.
IS.ui = (function () {
  const U = IS.util;
  const E = () => IS.engine;
  const st = () => IS.state.get();
  let screen = 'title'; // title | creator (when no save)
  let overlay = null; // { kind: 'computer', app, arg }
  let busy = false;

  const $ = (sel) => document.querySelector(sel);

  // ── Toasts, modals, confetti ───────────────────────────
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

  function modal(opts) {
    const back = document.createElement('div');
    back.className = 'modal-back';
    back.innerHTML = `<div class="modal ${opts.wide ? 'wide' : ''}" role="dialog" aria-modal="true">${opts.title ? `<h2>${opts.title}</h2>` : ''}<div class="modal-body">${opts.html || ''}</div><div class="modal-actions"></div></div>`;
    let closed = false;
    const close = () => {
      if (closed) return;
      closed = true;
      back.remove();
      IS.office.pause(!!overlay || busy || !!$('.dialog') || !!$('.modal-back'));
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
    if (!opts.locked) back.addEventListener('click', (e) => { if (e.target === back) close(); });
    $('#modal-root').appendChild(back);
    IS.office.pause(true);
    if (opts.onMount) opts.onMount(back.querySelector('.modal'), close);
    return close;
  }

  function confetti(n) {
    const bits = ['✨', '🎉', '⭐', '🎊', '🌟', '🏵️'];
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

  // ── Rendering ──────────────────────────────────────────
  function render() {
    const app = $('#app');
    const s = st();
    if (!s) {
      IS.office.unmount();
      app.innerHTML = screen === 'creator' ? IS.home.creator() : IS.home.title();
      if (screen === 'creator') IS.home.mountCreator();
      return;
    }
    if (s.career.phase === 'done') {
      IS.office.unmount();
      app.innerHTML = IS.home.careerDone();
      return;
    }
    if (!s.job) {
      IS.office.unmount();
      app.innerHTML = IS.interview.render();
      IS.interview.mount();
      return;
    }
    if (s.job.atHome) {
      IS.office.unmount();
      app.innerHTML = IS.home.render();
      return;
    }
    // Office mode: keep the world mounted; re-render only the layers.
    if (!IS.office.isMounted()) {
      app.innerHTML = '<div class="office" id="office"></div><div id="hud-layer"></div><div id="overlay-layer"></div><div id="dialog-layer"></div>';
      IS.office.mount($('#office'));
    } else {
      IS.office.refresh();
    }
    $('#hud-layer').innerHTML = hud(s);
    const ol = $('#overlay-layer');
    if (overlay && overlay.kind === 'computer') {
      ol.innerHTML = IS.computer.render(overlay.app, overlay.arg);
      IS.computer.mount(overlay.app, overlay.arg);
    } else {
      ol.innerHTML = '';
    }
    IS.office.pause(!!overlay || busy || !!$('.dialog') || !!$('.modal-back'));
  }

  function objective(s) {
    const j = s.job;
    if (!j.clockedIn) return 'Badge in with Marcus at the security desk to start Day ' + j.day;
    if (j.minute >= E().dayLen()) return 'Your shift is over. Head to the exit to clock out.';
    const unread = j.inbox.filter((m) => !m.read).length;
    const open = E().tasks().filter((t) => j.tasks[t.id] && j.tasks[t.id].status === 'assigned').sort((a, b) => E().dueAbs(a) - E().dueAbs(b));
    if (open.length && open[0].urgent) return '🚨 Urgent: fix "' + open[0].title + '" at your desk';
    if (unread) return `You have ${unread} unread email${unread > 1 ? 's' : ''}. Check your computer.`;
    if (open.length) return `Next due: ${open[0].title} (${U.dueLabel(E().effectiveDue(open[0])).replace(/ \(Day \d+\)/, '')})`;
    return 'All caught up! Chat with the team, grab a coffee, or help out.';
  }

  function hud(s) {
    const j = s.job;
    const t = E().track();
    const pending = j.period.days.reduce((a, d) => a + d.pay, 0) + (j.clockedIn ? j.minute / 60 * j.rate : 0);
    const hours = (j.day - 1) * 3 + (j.clockedIn ? j.minute / 60 : 0);
    const travel = [['lobby', '🏛️ Lobby'], ['cafe', '☕ Café'], ['desk', '💻 My desk'], ['mentor', '🧑‍🏫 Mentor'], ['it', '🛠️ IT'], ['manager', '📋 Manager'], ['conference', '🗣️ Conference'], ['lab', '🔧 Lab'], ['exit', '🚪 Exit']];
    const unread = j.inbox.filter((m) => !m.read).length;
    return `<div class="hud">
        <div class="chipbox">
          <div><div class="k">Internship ${t.n}/10 · ${U.esc(t.langLabel)}</div><div class="v">Day ${j.day}/34 · ${U.weekday(j.day)}</div></div>
          <div><div class="k">${j.clockedIn ? 'On the clock' : 'Not badged in'}</div><div class="v">🕘 ${j.clockedIn ? U.clock(j.minute) : '—'}</div></div>
          <div class="hide-sm"><div class="k">Hours</div><div class="v">${hours.toFixed(1)} / 100</div></div>
          <div><div class="k">Energy</div><div class="bar energy"><span style="width:${j.energy}%"></span></div></div>
          <div><div class="k">Morale</div><div class="bar morale"><span style="width:${j.morale}%"></span></div></div>
        </div>
        <div class="spacer"></div>
        <div class="chipbox">
          <div><div class="k">Wallet</div><div class="v" style="color:var(--gold-2)">${U.money(s.wallet)}</div></div>
          <div class="hide-sm"><div class="k">Unpaid</div><div class="v">${U.money(pending)}</div></div>
          <button class="btn small gold" data-act="openComputer" title="Your computer is at your desk">💻${unread ? ' ' + unread : ''}</button>
          <button class="btn small dark" data-act="help" title="How to play">?</button>
          <button class="btn small dark" data-act="menu" title="Menu">☰</button>
        </div>
      </div>
      <div class="objective">${U.esc(objective(s))}</div>
      <div class="travel">${travel.map(([k, l]) => `<button data-act="travel" data-arg="${k}">${l}${k === 'desk' && unread ? '<span class="dot"></span>' : ''}</button>`).join('')}</div>
      <div class="keys-hint">Click to walk · WASD / arrows · E to interact</div>`;
  }

  function after(opts) {
    IS.state.save();
    render();
    flushCeremonies(() => {
      const s = st();
      if (s && s.job && s.job.clockedIn && s.job.minute >= E().dayLen() && !busy) {
        busy = true;
        modal({
          title: `🕛 ${U.clock(E().dayLen())}: Shift over!`,
          html: `<p>That's your ${E().dayLen() / 60} hour${E().dayLen() > 60 ? 's' : ''} for today. Time to clock out.</p>`,
          locked: true,
          buttons: [{ label: 'Clock out', cls: 'gold', onClick: (close) => { close(); busy = false; endDay(); } }],
        });
      } else if (opts && opts.then) opts.then();
    });
  }

  // ── Dialogue box ───────────────────────────────────────
  function portraitHtml(id, size, mood) {
    return `<div class="portrait">${IS.people.portrait(id, size || 88, mood)}</div>`;
  }

  function who(id) {
    if (id === 'player') return { name: st().player.name, title: 'You' };
    const c = IS.characters[id];
    return { name: c.name, title: c.title };
  }

  function lineHtml(id, text) {
    const w = who(id);
    return `<div class="line ${id === 'player' ? 'me' : ''}"><div class="mini">${IS.people.portrait(id, 46)}</div><div><div class="small" style="font-weight:900">${U.esc(w.name)}</div><div class="bubble">${U.esc(text)}</div></div></div>`;
  }

  // A simple talk box: {id, text, place, options: [{label, cls, onClick(close)}]}
  function talk(o) {
    closeDialog();
    const w = who(o.id);
    const el = document.createElement('div');
    el.className = 'dialog';
    el.innerHTML = `<div class="head">${portraitHtml(o.id, 88)}<div style="flex:1;min-width:0">${o.place ? `<div class="place">${U.esc(o.place)}</div>` : ''}<div class="who">${U.esc(w.name)}<small>${U.esc(w.title)}</small></div><div class="text">${o.html || U.esc(o.text)}</div></div></div><div class="actions"></div>`;
    const actions = el.querySelector('.actions');
    const close = () => {
      el.remove();
      IS.office.pause(!!overlay || busy);
    };
    (o.options || [{ label: 'Bye!', cls: 'primary' }]).forEach((b) => {
      const btn = document.createElement('button');
      btn.className = 'btn ' + (b.cls || '');
      btn.innerHTML = b.label;
      btn.disabled = !!b.disabled;
      btn.onclick = () => (b.onClick ? b.onClick(close) : close());
      actions.appendChild(btn);
    });
    ($('#dialog-layer') || document.body).appendChild(el);
    IS.office.pause(true);
    return close;
  }
  function closeDialog() {
    document.querySelectorAll('.dialog').forEach((d) => d.remove());
  }

  // ── Scenes ─────────────────────────────────────────────
  function playScenes(list, done) {
    const queue = list.slice();
    busy = true;
    const next = () => {
      const sc = queue.shift();
      if (!sc) {
        busy = false;
        IS.office.pause(!!overlay);
        if (done) done();
        return;
      }
      if (sc === 'CEREMONY') IS.ceremony.finals(next);
      else playScene(sc, next);
    };
    next();
  }

  function playScene(scene, done) {
    closeDialog();
    const steps = scene.steps.slice();
    const el = document.createElement('div');
    el.className = 'dialog';
    el.innerHTML = `<div class="place">${U.esc(scene.place || '')}</div><h3 style="margin:2px 0 6px">${U.esc(scene.title)}</h3><div class="log"></div><div class="actions"></div>`;
    ($('#dialog-layer') || document.body).appendChild(el);
    IS.office.pause(true);
    const log = el.querySelector('.log');
    const actions = el.querySelector('.actions');
    const scroll = () => { el.scrollTop = el.scrollHeight; };
    const text = (t) => (typeof t === 'function' ? t() : t);

    function finish() {
      el.remove();
      if (scene.time) E().spend(scene.time);
      if (scene.effects) E().applyEffects(scene.effects);
      if (scene.after === 'risingStar') E().grantAward('rising_star', 'Midpoint review');
      render();
      flushCeremonies(done);
    }
    function step() {
      actions.innerHTML = '';
      const sp = steps.shift();
      if (!sp) return finish();
      if (sp.choices) {
        const wrap = document.createElement('div');
        wrap.style.width = '100%';
        sp.choices.forEach((ch) => {
          const b = document.createElement('button');
          b.className = 'btn choice';
          b.textContent = '💬 ' + ch.text;
          b.onclick = () => {
            log.insertAdjacentHTML('beforeend', lineHtml('player', ch.text));
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
      log.insertAdjacentHTML('beforeend', lineHtml(E().resolve(sp.who), text(sp.text)));
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

  // ── Interactions in the office ─────────────────────────
  function openTasksList() {
    const j = st().job;
    return E().tasks().filter((t) => j.tasks[t.id] && j.tasks[t.id].status === 'assigned');
  }

  function pickTask(id, title, fn) {
    const list = openTasksList();
    if (!list.length) return talk({ id, text: 'You don\'t have any open assignments right now. Nice!' });
    talk({
      id, text: title,
      options: list.map((t) => ({ label: `${IS.computer.icon(t)} ${U.esc(t.title)}`, cls: 'choice', onClick: (c) => { c(); fn(t); } })).concat([{ label: 'Never mind', cls: 'ghost' }]),
    });
  }

  function interact(id) {
    const s = st();
    const j = s.job;
    if (busy) return;
    if (id === 'door') {
      if (j.clockedIn) return confirmClockOut();
      return talk({ id: 'marcus', place: '🚪 Exit', text: 'Heading out already? You haven\'t badged in today. Come see me at the desk to start your shift.', options: [
        { label: 'Go home for now', cls: 'ghost', onClick: (c) => { c(); j.atHome = true; after(); } },
        { label: 'Badge in', cls: 'gold', onClick: (c) => { c(); startDay(); } }] });
    }
    if (id === 'desk') return openComputer();
    if (id === 'store') return IS.computer.storeModal(['outfit', 'hat', 'accessory', 'desk']);
    if (id === 'trophies') return IS.computer.awardsModal();
    if (id === 'conference') return conferenceInfo();
    if (id === 'lab') return talk({ id: E().cast().interns[3], place: '🔧 ' + E().track().lab.name, text: `This is the ${E().track().lab.name}. It's where the real-world side of our work gets tested. Ask me anything!`, options: [
      { label: '💬 Chat (10 min)', onClick: (c) => { c(); chatWith(E().cast().interns[3]); } }, { label: 'Bye!', cls: 'ghost' }] });
    if (IS.characters[id]) return talkMenu(id);
  }

  function chatWith(id) {
    const r = E().chat(id);
    talk({ id, text: r.text, options: [{ label: 'Thanks!', cls: 'primary', onClick: (c) => { c(); after(); } }] });
  }

  function talkMenu(id) {
    const s = st();
    const j = s.job;
    const c = E().cast();
    const on = j.clockedIn;
    const opts = [];
    const greet = on ? U.pick(['Hey! What\'s up?', 'Hi! Need something?', 'Oh hey, good to see you.', 'What can I do for you?']) : 'Morning! Don\'t forget to badge in.';
    if (id === 'marcus' && !on) {
      return talk({ id, place: '🛂 Security desk', text: `Good morning, ${s.player.name}! Day ${j.day}. Badge on the reader and you're in.`, options: [
        { label: '🪪 Badge in & start my shift', cls: 'gold', onClick: (cl) => { cl(); startDay(); } }, { label: 'Not yet', cls: 'ghost' }] });
    }
    opts.push({ label: '💬 Chat (10 min)', disabled: !on, onClick: (cl) => { cl(); chatWith(id); } });
    if (id === c.mentor) opts.unshift({ label: '🧑‍🏫 Ask for help with a task (15 min)', cls: 'primary', disabled: !on, onClick: (cl) => { cl(); pickTask(id, 'Sure! Which one are you working on?', (t) => helpResult(E().askMentor(t.id), t)); } });
    if (c.interns.includes(id)) {
      opts.unshift({ label: '🙋 Ask for help with a task (10 min)', cls: 'primary', disabled: !on, onClick: (cl) => { cl(); pickTask(id, 'Happy to help if I can. Which one?', (t) => helpResult(E().askPeer(t.id, id), t)); } });
      opts.push({ label: '☕ Coffee run together ($6, 15 min)', disabled: !on || s.wallet < 6, onClick: (cl) => { cl(); coffeeWith(id); } });
    }
    if (id === c.manager) {
      opts.unshift({ label: '📅 Ask for an extension', disabled: !on, onClick: (cl) => { cl(); pickTask(id, 'Which assignment do you need more time on?', (t) => { const r = E().requestExtension(t.id); talk({ id, text: r.text }); after(); }); } });
      opts.unshift({ label: '📈 How am I doing? (5 min)', cls: 'primary', disabled: !on, onClick: (cl) => { cl(); howAmIDoing(); } });
    }
    if (id === 'gus') opts.unshift({ label: '☕ Order something', cls: 'primary', disabled: !on, onClick: (cl) => { cl(); IS.computer.storeModal(['cafe']); } });
    if (id === 'lena') opts.unshift({ label: '🛠️ Tune up my laptop (10 min)', cls: 'primary', disabled: !on, onClick: (cl) => { cl(); const r = E().itHelp(); talk({ id, text: r.text }); after(); } });
    if (id === 'rosa') opts.unshift({ label: '🏆 Awards & career history', cls: 'primary', onClick: (cl) => { cl(); IS.computer.awardsModal(); } });
    opts.push({ label: 'Bye!', cls: 'ghost' });
    talk({ id, text: greet, options: opts });
  }

  function helpResult(r, t) {
    const j = st().job;
    const rec = j.tasks[t.id];
    rec.helpLog = rec.helpLog || [];
    rec.helpLog.push({ who: r.who || null, text: r.text || '', html: r.html || null });
    talk({ id: r.who || E().cast().mentor, html: r.html || U.esc(r.text), options: [{ label: 'Thanks!', cls: 'primary', onClick: (c) => { c(); after(); } }] });
  }

  function coffeeWith(id) {
    const s = st();
    s.wallet -= 6;
    E().applyEffects({ energy: 12, morale: 4, rel: { [id]: 5 }, networking: 0 });
    E().spend(15);
    talk({ id, text: U.pick(['This was nice. We should do it more often.', 'Okay I needed that. Thanks for the coffee!', 'Real talk: I was nervous about my presentation. Talking helped.']), options: [{ label: '☕ Anytime', cls: 'primary', onClick: (c) => { c(); after(); } }] });
  }

  function howAmIDoing() {
    const g = E().gradeSummary();
    const j = st().job;
    E().spend(5);
    const mgr = E().cast().manager;
    let text;
    if (!g.count) text = 'Nothing graded yet. Focus on your first deliverables and ask for help early.';
    else text = `You're averaging ${Math.round(g.avg)}% (${U.letter(g.avg)}) across ${g.count} graded assignment${g.count > 1 ? 's' : ''}, with ${j.stats.lateCount} late. ` +
      (g.avg >= 88 && !j.stats.lateCount ? 'That\'s return-offer territory. Keep it up.' : g.avg >= 80 ? 'Solid. Tighten up edge cases and communication.' : 'We need to see improvement. Use your mentor and ask for extensions before deadlines.');
    talk({ id: mgr, text, options: [{ label: 'Thanks for the feedback', cls: 'primary', onClick: (c) => { c(); after(); } }] });
  }

  function conferenceInfo() {
    const j = st().job;
    const pres = E().tasks().filter((t) => t.type === 'presentation');
    modal({
      title: '🗣️ Conference Room',
      html: `<p>Presentations happen here. When you submit a presentation from your computer, you'll present live on stage.</p>` +
        pres.map((t) => `<div class="spread small" style="margin-bottom:6px"><span>🎤 <b>${U.esc(t.title)}</b></span><span>${j.tasks[t.id] ? IS.computer.statusPill(t) : '<span class="pill">Day ' + t.day + '</span>'} · due ${U.dueLabel(t.due)}</span></div>`).join(''),
      buttons: [{ label: 'Open calendar', onClick: (c) => { c(); openComputer('calendar'); } }, { label: 'Close', cls: 'primary' }],
    });
  }

  // ── Computer overlay ───────────────────────────────────
  function openComputer(app, arg) {
    overlay = { kind: 'computer', app: app || 'todo', arg: arg == null ? null : arg };
    closeDialog();
    render();
  }
  function closeComputer() {
    overlay = null;
    render();
  }
  function setApp(app, arg) {
    overlay = { kind: 'computer', app, arg: arg == null ? null : arg };
    render();
    const a = document.querySelector('.app');
    if (a) a.scrollTop = 0;
  }

  // ── Day flow ───────────────────────────────────────────
  function startDay() {
    const s = st();
    const j = s.job;
    if (j.clockedIn || busy) return;
    const scenes = E().clockIn();
    IS.office.setPos(360, 640);
    render();
    toast(`🪪 Badged in: ${U.weekday(j.day)}, Day ${j.day}`, 'good');
    playScenes(scenes, () => {
      const newTasks = E().tasks().filter((t) => t.day === j.day);
      if (newTasks.length) toast(`📌 ${newTasks.length} new assignment${newTasks.length > 1 ? 's' : ''}. Check your computer.`, 'gold');
      after({ then: () => { if (j.day === U.LAST_DAY) endDay(); } });
    });
  }

  function confirmClockOut() {
    const j = st().job;
    const left = E().dayLen() - j.minute;
    if (left <= 0) return endDay();
    modal({
      title: 'Clock out early?',
      html: `<p>It's ${U.clock(j.minute)}. You have <b>${left} minutes</b> of paid time left today. Leaving early means ${U.money(left / 60 * j.rate)} less, and deadlines keep ticking.</p>`,
      buttons: [{ label: 'Keep working', cls: 'ghost' }, { label: 'Clock out anyway', cls: 'danger', onClick: (c) => { c(); endDay(); } }],
    });
  }

  function endDay() {
    overlay = null;
    const sum = E().clockOut();
    if (!sum) return;
    render();
    flushCeremonies(() => showDaySummary(sum));
  }

  function showDaySummary(sum) {
    const s = st();
    const j = s.job;
    let html = `<div class="grid grid-2"><div class="kpi"><div class="v">${(sum.minutes / 60).toFixed(2)} h</div><div class="k">Hours worked</div></div><div class="kpi"><div class="v">${U.money(sum.pay)}</div><div class="k">Earned today (gross)</div></div></div>`;
    if (sum.early) html += `<p class="small muted" style="margin-top:10px">You clocked out early, so you were paid only for the time you worked.</p>`;
    const dueSoon = E().tasks().filter((t) => j.tasks[t.id] && j.tasks[t.id].status === 'assigned').sort((a, b) => E().dueAbs(a) - E().dueAbs(b)).slice(0, 3);
    if (dueSoon.length && !sum.over) html += `<h3 style="margin-top:14px">Coming up</h3>` + dueSoon.map((t) => `<div class="row small"><span>${IS.computer.icon(t)}</span><b>${U.esc(t.title)}</b><span class="muted">due ${U.dueLabel(E().effectiveDue(t))}</span></div>`).join('');
    if (sum.paystub) html += `<h3 style="margin-top:16px">💵 Payday! Week ${sum.paystub.week}</h3>` + IS.computer.stubTable(sum.paystub);
    const weekend = U.isFriday(sum.day) && !sum.over;
    if (weekend) html += `<p style="margin-top:12px">🌴 <b>It's the weekend!</b> Plan an outing from home to recharge your morale.</p>`;
    busy = true;
    modal({
      title: sum.over ? '🎓 Internship complete!' : weekend ? '🎉 End of Week ' + U.weekOf(sum.day) : '🌙 End of Day ' + sum.day,
      html,
      locked: true,
      buttons: [{ label: sum.over ? 'See my results →' : 'Head home', cls: 'primary', onClick: (c) => {
        c();
        busy = false;
        if (sum.over) {
          const r = E().finishJob();
          IS.home.showResults(r);
        } else {
          j.atHome = true;
          after();
        }
      } }],
    });
  }

  function goToWork() {
    const j = st().job;
    j.atHome = false;
    st().pos = { x: 140, y: 640 };
    render();
  }

  // ── Ceremonies ─────────────────────────────────────────
  function flushCeremonies(done) {
    const s = st();
    if (!s || !s.pendingCeremonies.length) {
      if (done) done();
      return;
    }
    const c = s.pendingCeremonies.shift();
    IS.state.save();
    const a = IS.awards.byId(c.id);
    const wasBusy = busy;
    busy = true;
    const cont = () => {
      busy = wasBusy;
      if (st() && st().job && !st().job.atHome) IS.office.refresh();
      flushCeremonies(done);
    };
    if (c.id === 'spot' || c.id === 'rising_star') return IS.ceremony.honor(a, c, cont);
    confetti(24);
    modal({
      title: '🏅 Achievement Unlocked!',
      html: `<div class="center"><div class="trophy-big">${a.icon}</div><h2>${a.name}</h2><p class="muted">${a.desc}</p></div>`,
      buttons: [{ label: 'Nice!', cls: 'gold', onClick: (cl) => { cl(); cont(); } }],
      locked: true,
    });
  }

  return {
    render, toast, modal, confetti, after, talk, closeDialog, playScenes, playScene, interact, lineHtml, portraitHtml,
    openComputer, closeComputer, setApp, startDay, confirmClockOut, endDay, goToWork, flushCeremonies,
    setScreen: (sc) => { screen = sc; render(); },
    overlay: () => overlay,
    isBusy: () => busy,
  };
})();
