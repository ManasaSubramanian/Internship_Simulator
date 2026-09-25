// Click dispatcher (data-act / data-arg) and boot.
(function () {
  const U = IS.util;
  const E = IS.engine;
  const ui = IS.ui;
  const st = () => IS.state.get();

  const HOW_TO = `
    <p><b>Your goal:</b> complete all <b>10 internships</b> and earn a full-time offer. Each internship uses a different technology: JavaScript → Python → Data Science → C++ → Linux → SQL → Web → Machine Learning → DevOps → a full-stack capstone.</p>
    <h3>🎤 Interviews</h3>
    <ul><li>Before each internship you interview: a <b>behavioral round</b> (STAR-style questions + a written answer) and a <b>technical round</b> (concept questions + a timed live problem).</li>
    <li>Score 70+ on each round to get the offer. Didn't pass? You get <b>interview training</b> (lessons + practice). Finish it and retry as often as you like; each training adds a prep bonus.</li>
    <li>A <b>return offer</b> at the end of an internship moves you to the next one and waives its behavioral round. No offer? Reapply for the same internship.</li></ul>
    <h3>🏢 The studio</h3>
    <ul><li><b>Click the floor</b> to walk, or use <b>WASD / arrow keys</b>. Walk up to people and objects and press <b>E</b> (or click them) to interact. The bar at the bottom walks you to key places.</li>
    <li>Badge in with <b>Marcus</b> at security to start your day. Your <b>computer</b> is at your desk: To-Do list, mail, calendar, HR portal and team directory.</li>
    <li>Talk to your <b>mentor</b> and fellow interns for help, your <b>manager</b> for feedback and extensions, <b>Gus</b> for coffee, <b>Lena</b> for IT, and <b>Rosa</b> for awards.</li></ul>
    <h3>⏱️ Time & pay</h3>
    <ul><li>Each internship is <b>100 hours</b>: 3 hours a day (9:00 AM – 12:00 PM) for 33 days, plus a 1-hour final day for reviews and the awards ceremony.</li>
    <li>Paid hourly (the rate rises with each internship), every <b>Friday</b>, after taxes. Leaving early means fewer paid hours.</li></ul>
    <h3>📋 Work & deadlines</h3>
    <ul><li>Log <b>focus time</b> on an assignment, do the work, then submit. Everything is graded with a visible rubric.</li>
    <li>Late work: <b>−10% per workday</b> and a <b>$10</b> pay adjustment. More than 2 workdays late = <b>missed</b> (0% and another $25). Ask for an extension <i>before</i> the deadline.</li></ul>
    <h3>📚 Learning Center</h3>
    <ul><li>Open it with <b>📚</b> in the office, the <b>Learn</b> app on your computer, or from home and the career center. Every internship has beginner lessons, plus career skills.</li>
    <li>Each topic explains the idea in plain words, walks through a code example line by line, then gives you <b>3 practice problems</b> that loop. Stuck? Use the hint, or peek at the solution after one try.</li>
    <li>Assignments list related lessons under <b>Get help</b>. Studying is free and doesn't use work time.</li></ul>
    <h3>💾 Saving</h3>
    <ul><li>The game saves automatically in this browser. The <b>💾 Export save</b> button (bottom-left, on every screen) downloads a backup file. Load it with ☰ Menu → Import save.</li></ul>
    <h3>🛍️ Spending</h3>
    <ul><li>Studio Store (lobby): outfits, hats, accessories and desk upgrades. Café: energy. From home: outings and trips for morale.</li></ul>`;

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
          ui.render();
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
    a.download = 'internship-simulator-save.json';
    a.click();
    setTimeout(() => URL.revokeObjectURL(a.href), 1000);
  }

  function restart() {
    ui.modal({
      title: 'Start a new career?',
      html: '<p>This permanently deletes your progress in this browser. Export a save first if you want to keep it.</p>',
      buttons: [{ label: 'Cancel', cls: 'ghost' }, { label: 'Delete & restart', cls: 'danger', onClick: (c) => { c(); IS.state.clear(); IS.home.resetDraft(); ui.setScreen('title'); } }],
    });
  }

  function menu() {
    ui.modal({
      title: '☰ Menu',
      html: '<p>Progress saves automatically in this browser. Export a save file to back it up or move it to another device.</p>',
      buttons: [
        { label: '❓ How to play', onClick: (c) => { c(); showHelp(); } },
        { label: '💾 Export save', onClick: (c) => { c(); exportSave(); } },
        { label: '📂 Import save', onClick: (c) => { c(); importSave(); } },
        { label: '🗑️ New career', cls: 'danger', onClick: (c) => { c(); restart(); } },
        { label: 'Close', cls: 'primary' },
      ],
    });
  }

  const spot = (k) => IS.office.SPOTS[k];
  const W = IS.workspace.actions;

  const actions = {
    help: showHelp,
    menu,
    newGame: () => ui.setScreen('creator'),
    toTitle: () => ui.setScreen('title'),
    continue: () => { if (IS.state.load()) ui.render(); else ui.toast('No save found', 'bad'); },
    importSave,
    exportSave,
    restart,
    draftLook: (arg) => {
      const [k, v] = arg.split('|');
      IS.home.draft().look[k] = v;
      ui.render();
    },
    startGame: () => {
      const d = IS.home.draft();
      const name = (d.name || '').trim();
      if (!name) return ui.toast('Please enter your name.', 'bad');
      IS.state.newGame({ name, school: (d.school || '').trim() || 'State University', major: (d.major || '').trim() || 'Computer Science', look: Object.assign({}, d.look) });
      IS.home.resetDraft();
      ui.render();
      setTimeout(() => ui.modal({ title: `Welcome, ${U.esc(name)}! ✨`, html: '<p>Your application for your first internship is in. First step: the interview.</p>' + HOW_TO, wide: true, buttons: [{ label: 'Let\'s go!', cls: 'gold' }] }), 50);
    },
    // office & day
    travel: (k) => {
      const [x, y] = spot(k);
      IS.office.walkTo(x, y, () => {
        if (k === 'desk') ui.interact('desk');
        else if (k === 'exit') ui.interact('door');
      });
    },
    openComputer: () => {
      const [x, y] = spot('desk');
      IS.office.walkTo(x, y, () => ui.interact('desk'));
    },
    closeComputer: () => ui.closeComputer(),
    goToWork: () => ui.goToWork(),
    outings: () => IS.computer.storeModal(['experience']),
    shopOnline: () => IS.computer.storeModal(['outfit', 'hat', 'accessory', 'desk']),
    wardrobe: () => IS.home.wardrobe(),
    awards: () => IS.computer.awardsModal(),
    // computer apps
    app: (arg) => {
      const [app, a] = String(arg).split('|');
      ui.setApp(app, a);
    },
    todoTab: (t) => { IS.computer.local.todoTab = t; ui.render(); },
    hrTab: (t) => { IS.computer.local.hrTab = t; ui.render(); },
    openMail: (id) => {
      const m = st().job.inbox.find((x) => x.id === id);
      if (m) m.read = true;
      IS.computer.local.openMail = IS.computer.local.openMail === id ? null : id;
      IS.state.save();
      ui.render();
    },
    readAll: () => { st().job.inbox.forEach((m) => { m.read = true; }); ui.after(); },
    // workspace
    work: (arg) => {
      const [id, m] = arg.split('|');
      const r = E.workOn(id, +m);
      if (r) ui.toast(`⏱️ Worked ${r.used} min → +${Math.round(r.gained)} min of progress`, 'good');
      ui.after();
    },
    runTests: (id) => W.runTests(id),
    runSql: (id) => W.runSql(id),
    runWeb: (id) => W.runWeb(id),
    runYaml: (id) => W.runYaml(id),
    resetCode: (id) => W.resetCode(id),
    resetShell: (id) => W.resetShell(id),
    submit: (id) => W.submit(id),
    learn: (arg) => { const [t, topic] = String(arg || '').split('|'); IS.learn.open(t || null, topic || null); },
    taskHelp: (arg) => { const [kind, id] = arg.split('|'); W.help(kind, id); },
    slideAdd: (id) => W.slideAdd(id),
    slideDel: (arg) => { const [id, i] = arg.split('|'); W.slideDel(id, +i); },
    slideMove: (arg) => { const [id, i, d] = arg.split('|'); W.slideMove(id, +i, +d); },
  };
  Object.keys(IS.interview.actions).forEach((k) => { actions[k] = IS.interview.actions[k]; });

  document.addEventListener('click', (e) => {
    const el = e.target.closest('[data-act]');
    if (!el || el.disabled) return;
    if (el.classList.contains('mail') && e.target.closest('button') && e.target.closest('button') !== el) return;
    const fn = actions[el.dataset.act];
    if (fn) {
      e.preventDefault();
      e.stopPropagation();
      fn(el.dataset.arg);
    }
  });
  document.addEventListener('keydown', (e) => {
    if ((e.key === 'Enter' || e.key === ' ') && e.target.matches('.item-row[data-act]')) {
      e.preventDefault();
      e.target.click();
    }
    if (e.key === 'Escape' && ui.overlay() && !document.querySelector('.modal-back') && !document.querySelector('.stage')) ui.closeComputer();
  });
  window.addEventListener('resize', () => { if (IS.office.isMounted()) IS.office.refresh(); });

  // Always-visible save button (every screen, including the Learning Center and ceremonies).
  const fab = document.createElement('button');
  fab.id = 'save-fab';
  fab.type = 'button';
  fab.title = 'Export save: download your progress as a file. (The game also saves automatically in this browser.)';
  fab.setAttribute('aria-label', 'Export save');
  fab.innerHTML = '<span class="ic">💾</span><span class="lbl">Export save</span>';
  fab.addEventListener('click', () => {
    if (!st()) return ui.toast('Start a career first. There\'s nothing to save yet.', 'bad');
    exportSave();
    ui.toast('💾 Save file downloaded. Import it any time from ☰ Menu.', 'good');
  });
  document.body.appendChild(fab);
  const syncFab = () => { fab.hidden = !st(); };
  setInterval(syncFab, 800);

  IS.state.load();
  ui.render();
  syncFab();
})();
