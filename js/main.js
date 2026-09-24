// Click dispatcher (data-act / data-arg) and boot.
(function () {
  const U = IS.util;
  const E = IS.engine;
  const ui = IS.ui;
  const V = IS.views;
  const st = () => IS.state.get();

  const HOW_TO = `
    <p><b>Your job:</b> survive and thrive through a 6-week (30 workday) internship as a Software Engineering Intern on the Ride Systems Software team.</p>
    <h3>⏱️ Time &amp; pay</h3>
    <ul><li>Each workday is <b>9:00 AM – 12:00 PM</b> (3 paid hours at <b>$24/hr</b>). Clock in to start, and the shift ends automatically at noon.</li>
    <li>Everything takes time: meetings, working, asking for help, coffee runs, chats.</li>
    <li>Paychecks land every <b>Friday</b> (after taxes). Clocking out early means fewer paid hours.</li></ul>
    <h3>📋 Assignments</h3>
    <ul><li>Tasks arrive in your inbox and Task Board: <b>coding</b> (write real JavaScript that is tested), <b>code reviews</b>, <b>writing</b>, <b>training quizzes</b>, and <b>presentations</b>, both individual and group.</li>
    <li>Log enough <b>focus time</b> (Work 15/30/60m) before submitting. Energy and morale affect how productive that time is.</li>
    <li>Everything is graded against a rubric, and you'll see the full breakdown.</li></ul>
    <h3>⚠️ Deadlines</h3>
    <ul><li>Late work: <b>−10% per workday</b> and a <b>$10</b> pay adjustment. More than 2 workdays late = <b>missed</b> (0% and another $25).</li>
    <li>Ask Maya for an <b>extension before</b> the deadline. Good relationships and a clean record help.</li></ul>
    <h3>🙋 Help</h3>
    <ul><li>Ask <b>Dev</b> (mentor) for hints, ask a <b>fellow intern</b>, or <b>search the wiki</b>. Asking for help never lowers your grade, and it counts toward the Curious Mind award.</li></ul>
    <h3>👥 Group projects</h3>
    <ul><li>Your choices in meetings and conflicts change <b>team health</b>, which affects your group grade and presentations.</li></ul>
    <h3>🛍️ Store</h3>
    <ul><li>Buy outfits and accessories, desk upgrades (some boost productivity), café treats (energy, only while clocked in), and outings or trips (morale, only after work).</li></ul>
    <h3>🏆 Awards</h3>
    <ul><li>Unlock achievements, earn weekly <b>Pixie Dust Spot Awards</b> ($50 bonus), the midpoint <b>Rising Star</b>, and compete in the final <b>Summer Intern Awards</b> ceremony. Then find out if you get a return offer!</li></ul>`;

  function showHelp() {
    ui.modal({ title: '❓ How to play', html: HOW_TO, wide: true, buttons: [{ label: 'Got it!', cls: 'primary' }] });
  }

  function importSave() {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = 'application/json,.json';
    input.onchange = () => {
      const f = input.files[0];
      if (!f) return;
      f.text().then((txt) => {
        try {
          IS.state.importJSON(txt);
          ui.toast('Save imported!', 'good');
          ui.go('desk');
        } catch (e) {
          ui.toast('Could not import: ' + e.message, 'bad');
        }
      });
    };
    input.click();
  }

  function exportSave() {
    const blob = new Blob([IS.state.exportJSON()], { type: 'application/json' });
    const a = document.createElement('a');
    a.href = URL.createObjectURL(blob);
    a.download = 'imagineer-intern-save-day' + st().day + '.json';
    a.click();
    setTimeout(() => URL.revokeObjectURL(a.href), 1000);
  }

  function menu() {
    ui.modal({
      title: '⚙️ Save & menu',
      html: `<p>Your progress saves automatically in this browser. You can also export a save file to keep it safe or move it to another device.</p>`,
      buttons: [
        { label: '💾 Export save', onClick: (c) => { c(); exportSave(); } },
        { label: '📂 Import save', onClick: (c) => { c(); importSave(); } },
        { label: '🗑️ Restart internship', cls: 'danger', onClick: (c) => { c(); restart(); } },
        { label: 'Close', cls: 'primary' },
      ],
    });
  }

  function restart() {
    ui.modal({
      title: 'Start over?',
      html: '<p>This permanently deletes your current internship progress in this browser. Export a save first if you want to keep it.</p>',
      buttons: [{ label: 'Cancel', cls: 'ghost' }, { label: 'Delete & restart', cls: 'danger', onClick: (c) => { c(); IS.state.clear(); V.draft = null; ui.go('title'); } }],
    });
  }

  const actions = {
    go: (arg) => {
      const [name, sub] = String(arg).split('|');
      if (name === 'store' && sub) V.local.storeTab = sub;
      ui.go(name);
    },
    help: showHelp,
    menu,
    newGame: () => ui.go('creator'),
    toTitle: () => ui.go('title'),
    continue: () => {
      if (IS.state.load()) ui.go('desk');
      else ui.toast('No save found', 'bad');
    },
    importSave,
    exportSave,
    restart,
    draftAvatar: (arg) => {
      const [k, v] = arg.split('|');
      V.draft.avatar[k] = v;
      ui.render();
    },
    startGame: () => {
      const d = V.draft;
      const name = (d.name || '').trim();
      if (!name) return ui.toast('Please enter your name.', 'bad');
      IS.state.newGame({ name, school: (d.school || '').trim() || 'State University', major: (d.major || '').trim() || 'Computer Science', avatar: Object.assign({}, d.avatar) });
      V.draft = null;
      ui.go('desk');
      setTimeout(() => ui.modal({
        title: `Welcome, ${U.esc(name)}! ✨`,
        html: `<p>You just accepted a <b>Software Engineering Internship</b> on the Ride Systems Software team. Your first day starts now.</p>` + HOW_TO,
        wide: true,
        buttons: [{ label: 'Let\'s go! Clock in →', cls: 'gold', onClick: (c) => { c(); ui.startDay(); } }],
      }), 50);
    },
    clockIn: () => ui.startDay(),
    clockOut: () => ui.confirmClockOut(),
    openTask: (id) => ui.go('task', id),
    taskTab: (t) => { V.local.taskTab = t; ui.render(); },
    storeTab: (t) => { V.local.storeTab = t; ui.render(); },
    openMail: (id) => {
      const m = st().inbox.find((x) => x.id === id);
      if (m) m.read = true;
      V.local.openMail = V.local.openMail === id ? null : id;
      IS.state.save();
      ui.render();
    },
    readAll: () => {
      st().inbox.forEach((m) => { m.read = true; });
      ui.after();
    },
    walk: () => {
      if (!st().clockedIn) return;
      E.applyEffects({ energy: 8, morale: 2 });
      E.spend(10);
      ui.toast('🚶 A lap around the lot. Palm trees, sunshine, a glimpse of a castle spire. +energy', 'good');
      ui.after();
    },
    chat: (id) => {
      const res = E.chat(id);
      ui.modal({ title: '💬 ' + IS.characters[id].name, html: ui.speakerHtml(id, res.text), buttons: [{ label: 'Thanks!', cls: 'primary', onClick: (c) => { c(); ui.after(); } }] });
    },
    buy: (id) => {
      const res = E.buy(id);
      ui.toast(res.text, res.ok ? 'good' : 'bad');
      ui.after();
    },
    equip: (id) => {
      E.equip(id);
      ui.after();
    },
    setAvatar: (arg) => {
      const [k, v] = arg.split('|');
      st().player.avatar[k] = v;
      ui.after();
    },
    work: (arg) => {
      const [id, m] = arg.split('|');
      const res = E.workOn(id, +m);
      if (res) ui.toast(`⏱️ Worked ${res.used} min → +${Math.round(res.gained)} min of progress`, 'good');
      ui.after();
    },
    runTests: (id) => IS.work.runTests(id),
    resetCode: (id) => IS.work.resetCode(id),
    submit: (id) => IS.work.submit(id),
    taskHelp: (arg) => {
      const [kind, id] = arg.split('|');
      IS.work.help(kind, id);
    },
    slideAdd: (id) => IS.work.slideAdd(id),
    slideDel: (arg) => {
      const [id, i] = arg.split('|');
      IS.work.slideDel(id, +i);
    },
    slideMove: (arg) => {
      const [id, i, d] = arg.split('|');
      IS.work.slideMove(id, +i, +d);
    },
  };

  document.addEventListener('click', (e) => {
    const el = e.target.closest('[data-act]');
    if (!el || el.disabled) return;
    // Don't let clicks inside an open mail's body re-toggle it (except its buttons).
    if (el.classList.contains('mail') && e.target.closest('button') && e.target.closest('button') !== el) return;
    const fn = actions[el.dataset.act];
    if (fn) {
      e.preventDefault();
      fn(el.dataset.arg);
    }
  });
  document.addEventListener('keydown', (e) => {
    if ((e.key === 'Enter' || e.key === ' ') && e.target.matches('.task-row[data-act]')) {
      e.preventDefault();
      e.target.click();
    }
  });

  // Boot: resume a save if one exists, otherwise show the title screen.
  if (IS.state.load()) {
    const s = st();
    // A shift that was interrupted by closing the tab just continues.
    ui.go(s.over ? 'end' : 'desk');
  } else {
    ui.go('title');
  }
})();
