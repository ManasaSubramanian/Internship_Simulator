// Your work computer: a little desktop OS with apps. Opened from your desk.
IS.computer = (function () {
  const U = IS.util;
  const E = () => IS.engine;
  const st = () => IS.state.get();
  const local = { todoTab: 'open', hrTab: 'pay', openMail: null };

  const TYPE_ICON = { coding: '💻', quiz: '📝', review: '🔍', written: '✍️', presentation: '🎤', sql: '🗄️', terminal: '⌨️', web: '🌐', config: '⚙️' };
  const TYPE_LABEL = { coding: 'Coding', quiz: 'Training', review: 'Code Review', written: 'Writing', presentation: 'Presentation', sql: 'SQL', terminal: 'Terminal', web: 'Web', config: 'Config' };
  const icon = (t) => (t.urgent ? '🚨' : t.daily ? '🎫' : TYPE_ICON[t.type]);
  const typeLabel = (t) => (t.type === 'coding' ? ({ javascript: 'JavaScript', python: 'Python', cpp: 'C++' }[t.lang] || 'Coding') : TYPE_LABEL[t.type]);
  const gradeBadge = (score) => `<span class="grade ${U.gradeClass(score)}">${U.letter(score)} · ${score}%</span>`;

  function statusPill(t) {
    const r = st().job.tasks[t.id];
    if (!r) return '<span class="pill">Not assigned yet</span>';
    if (r.status === 'graded') return gradeBadge(r.score);
    if (r.status === 'missed') return '<span class="pill bad">Missed · 0%</span>';
    if (r.status === 'expired') return '<span class="pill">Closed</span>';
    if (r.late) return '<span class="pill bad">⚠️ Late</span>';
    if (E().dueAbs(t) - E().now() <= U.DAY_LENGTH) return '<span class="pill warn">Due soon</span>';
    return '<span class="pill gold">Open</span>';
  }

  function stubTable(stub) {
    return `<table class="tbl">
      <tr><td>Hours worked (${stub.hours.toFixed(2)} h × ${U.money(stub.rate)}/h)</td><td class="num">${U.money(stub.gross)}</td></tr>
      ${stub.bonusItems.map((b) => `<tr><td>🎁 ${U.esc(b.label)}</td><td class="num" style="color:var(--good)">+${U.money(b.amount)}</td></tr>`).join('')}
      <tr><td>Taxes &amp; withholding (12.65%)</td><td class="num">−${U.money(stub.taxes)}</td></tr>
      ${stub.deductionItems.map((d) => `<tr><td>⚠️ ${U.esc(d.label)}</td><td class="num" style="color:var(--bad)">−${U.money(d.amount)}</td></tr>`).join('')}
      <tr><td><b>Net pay deposited</b></td><td class="num"><b>${U.money(stub.net)}</b></td></tr></table>
      ${stub.net === 0 && stub.deductions > 0 ? '<p class="small" style="color:var(--bad)">Adjustments exceeded this week\'s earnings. Your paycheck was reduced to $0.</p>' : ''}`;
  }

  function taskRow(t) {
    const j = st().job;
    const r = j.tasks[t.id];
    const open = r && r.status === 'assigned';
    const pct = open ? Math.round(r.progress / t.effort * 100) : 100;
    return `<div class="item-row ${t.urgent && open ? 'urgent' : ''} ${open ? '' : 'done'}" data-act="app" data-arg="task|${t.id}" role="button" tabindex="0">
      <div class="ic">${icon(t)}</div>
      <div style="min-width:0"><div class="t">${U.esc(t.title)}</div>
        <div class="small muted">${typeLabel(t)} · ${t.kind === 'group' ? '👥 Group' : '🧑 Individual'}${t.optional ? ' · ⭐ Optional' : ''} · from ${IS.characters[t.from].short} · due ${U.dueLabel(E().effectiveDue(t))}</div>
        ${open ? `<div class="bar" style="margin-top:6px;max-width:240px"><span style="width:${pct}%"></span></div>` : ''}</div>
      <div>${statusPill(t)}</div></div>`;
  }

  // ── Apps ────────────────────────────────────────────────
  const apps = {};

  apps.todo = function () {
    const j = st().job;
    const vis = E().tasks().filter((t) => j.tasks[t.id]);
    const lists = {
      open: vis.filter((t) => j.tasks[t.id].status === 'assigned').sort((a, b) => E().dueAbs(a) - E().dueAbs(b)),
      done: vis.filter((t) => j.tasks[t.id].status !== 'assigned').sort((a, b) => (j.tasks[b.id].submittedAbs || 0) - (j.tasks[a.id].submittedAbs || 0)),
      group: vis.filter((t) => t.kind === 'group'),
    };
    const tab = local.todoTab;
    const upcoming = E().tasks().filter((t) => !j.tasks[t.id]).length;
    return `<div class="app-title"><h2>✅ To-Do</h2><span class="small muted">${upcoming} more assignments arrive later</span></div>
      <div class="tabs">
        <button class="tab ${tab === 'open' ? 'active' : ''}" data-act="todoTab" data-arg="open">Open (${lists.open.length})</button>
        <button class="tab ${tab === 'done' ? 'active' : ''}" data-act="todoTab" data-arg="done">Submitted &amp; closed (${lists.done.length})</button>
        <button class="tab ${tab === 'group' ? 'active' : ''}" data-act="todoTab" data-arg="group">👥 Group (${lists.group.length})</button>
      </div>
      <div class="stack">${lists[tab].map(taskRow).join('') || '<p class="muted">Nothing here yet.</p>'}</div>
      <div class="panel soft" style="margin-top:16px"><b>How deadlines work:</b> <span class="small">put in enough <b>focus time</b> (real minutes with the task open) before submitting. Late work loses <b>10% per workday</b> plus a <b>${U.money(E().LATE_FEE)}</b> pay adjustment. After two workdays it's <b>missed</b> (0%, another ${U.money(E().MISSED_FEE)}). Ask your manager for an extension <i>before</i> the deadline.</span></div>`;
  };

  apps.mail = function () {
    const j = st().job;
    return `<div class="app-title"><h2>📬 Mail</h2><button class="btn small" data-act="readAll">Mark all read</button></div>
      <div class="stack">${j.inbox.map((m) => {
        const c = IS.characters[m.from];
        const open = local.openMail === m.id;
        return `<div class="item-row mail ${m.read ? '' : 'unread'}" data-act="openMail" data-arg="${m.id}" style="grid-template-columns:48px 1fr auto">
          <div style="border-radius:12px;overflow:hidden;line-height:0;background:#efe0c6">${IS.people.portrait(m.from, 48)}</div>
          <div style="min-width:0"><div class="t">${m.read ? '' : '● '}${U.esc(m.subject)}</div><div class="small muted">${U.esc(c.name)} · ${U.esc(c.title)}</div>
            ${open ? `<div class="body">${U.esc(m.body)}</div>${m.taskId ? `<button class="btn small primary" style="margin-top:8px" data-act="app" data-arg="task|${m.taskId}">Open assignment →</button>` : ''}` : ''}</div>
          <div class="small muted">Day ${m.day}<br>${U.clock(m.minute)}</div></div>`;
      }).join('') || '<p class="muted">Empty inbox.</p>'}</div>`;
  };

  apps.calendar = function () {
    const j = st().job;
    const special = { 1: 'Onboarding', 5: '1:1 with manager', 6: 'Group kickoff', 10: 'Group demo', 15: 'Midpoint showcase', 16: 'Midpoint review · Capstone kickoff', 22: 'On-call week', 33: 'Final presentation', 34: 'Final review & Awards (1 hr)' };
    let h = `<div class="app-title"><h2>📅 Calendar</h2><span class="small muted">34 workdays · 1 hour each (9–10 AM)</span></div><div class="cal">`;
    for (let d = 1; d <= U.LAST_DAY; d++) {
      const dues = E().tasks().filter((t) => E().effectiveDue(t).day === d && j.tasks[t.id]);
      h += `<div class="d ${d === j.day ? 'today' : ''} ${d < j.day ? 'past' : ''}"><div class="n">W${U.weekOf(d)} ${U.weekday(d).slice(0, 3)} · Day ${d}</div>
        ${special[d] ? `<div class="ev meet">🗓️ ${special[d]}</div>` : ''}${U.isFriday(d) ? '<div class="ev">💵 Payday</div>' : ''}
        ${dues.map((t) => `<div class="ev due" data-act="app" data-arg="task|${t.id}" style="cursor:pointer">${icon(t)} ${U.esc(t.title.length > 26 ? t.title.slice(0, 25) + '…' : t.title)}</div>`).join('')}</div>`;
    }
    return h + '</div>';
  };

  apps.hr = function () {
    const s = st();
    const j = s.job;
    const tab = local.hrTab;
    let body = '';
    if (tab === 'pay') {
      const gross = j.period.days.reduce((a, d) => a + d.pay, 0);
      body = `<div class="grid grid-3" style="margin-bottom:14px">
        <div class="kpi"><div class="v">${U.money(j.rate)}</div><div class="k">Hourly rate</div></div>
        <div class="kpi"><div class="v">${U.money(j.paystubs.reduce((a, x) => a + x.net, 0))}</div><div class="k">Net paid this internship</div></div>
        <div class="kpi"><div class="v">${U.money(gross)}</div><div class="k">This period (gross)</div></div>
        <div class="kpi"><div class="v">${U.money(j.period.deductions.reduce((a, d) => a + d.amount, 0))}</div><div class="k">Pending adjustments</div></div></div>
        <div class="grid grid-2">${j.paystubs.slice().reverse().map((x) => `<div class="panel"><h3>💵 Week ${x.week}</h3>${stubTable(x)}</div>`).join('') || '<p class="muted">Your first paycheck arrives Friday.</p>'}</div>`;
    } else {
      const g = E().gradeSummary();
      const cats = ['Coding', 'Code Review', 'Communication', 'Design', 'Presentation', 'Training'];
      const rows = E().tasks().filter((t) => j.tasks[t.id] && j.tasks[t.id].status !== 'assigned');
      body = `<div class="grid grid-3" style="margin-bottom:14px">
        <div class="kpi"><div class="v">${g.count ? U.letter(g.avg) : '—'}</div><div class="k">Overall ${g.count ? Math.round(g.avg) + '%' : ''}</div></div>
        <div class="kpi"><div class="v">${j.stats.lateCount}</div><div class="k">Late</div></div>
        <div class="kpi"><div class="v">${j.stats.missedCount}</div><div class="k">Missed</div></div>
        <div class="kpi"><div class="v">${j.stats.helpAsked}</div><div class="k">Asked for help</div></div></div>
        <div class="panel" style="margin-bottom:14px">${cats.map((c) => {
          const x = E().gradeSummary((t) => t.category === c);
          return `<div class="spread small"><span>${c}</span>${x.count ? gradeBadge(Math.round(x.avg)) : '<span class="muted">—</span>'}</div><div class="bar" style="margin:4px 0 10px"><span style="width:${x.avg}%"></span></div>`;
        }).join('')}
        ${['g1', 'g2'].map((g2) => `<div class="spread small"><span>👥 ${U.esc(E().track().groups[g2].name)}</span>${j.groups[g2].grade != null ? gradeBadge(j.groups[g2].grade) : '<span class="muted">—</span>'}</div>`).join('')}</div>
        <table class="tbl"><tr><th>Assignment</th><th>Type</th><th>Submitted</th><th>Grade</th></tr>${rows.map((t) => {
          const r = j.tasks[t.id];
          return `<tr data-act="app" data-arg="task|${t.id}" style="cursor:pointer"><td>${icon(t)} ${U.esc(t.title)}</td><td>${typeLabel(t)}</td><td>${r.status === 'graded' ? 'Day ' + r.submittedDay + (r.daysLate ? ` <span class="pill bad">${r.daysLate}d late</span>` : '') + (r.early ? ' <span class="pill good">early</span>' : '') : r.status}</td><td>${statusPill(t)}</td></tr>`;
        }).join('') || '<tr><td colspan="4" class="muted">Nothing graded yet.</td></tr>'}</table>`;
    }
    return `<div class="app-title"><h2>💼 HR Portal</h2></div>
      <div class="tabs"><button class="tab ${tab === 'pay' ? 'active' : ''}" data-act="hrTab" data-arg="pay">💵 Paystubs</button><button class="tab ${tab === 'report' ? 'active' : ''}" data-act="hrTab" data-arg="report">📊 Report card</button></div>${body}`;
  };

  function relLabel(v) {
    if (v >= 85) return '🌟 Champion';
    if (v >= 70) return '🤝 Trusted';
    if (v >= 55) return '🙂 Friendly';
    if (v >= 40) return '👋 Acquaintance';
    return '😬 Strained';
  }

  apps.team = function () {
    const s = st();
    const j = s.job;
    const t = E().track();
    const people = E().team().concat(IS.RECURRING);
    return `<div class="app-title"><h2>👥 Team Directory</h2><span class="small muted">Walk over to anyone in the office to talk.</span></div>
      <div class="grid grid-2" style="margin-bottom:16px">${['g1', 'g2'].map((g) => {
        const gs = j.groups[g];
        const start = g === 'g1' ? 6 : 16;
        return `<div class="panel"><div class="spread"><b>${U.esc(t.groups[g].name)}</b>${gs.grade != null ? gradeBadge(gs.grade) : j.day >= start ? '<span class="pill gold">In progress</span>' : `<span class="pill">Starts Day ${start}</span>`}</div>
          <div class="row" style="margin:8px 0">${['player'].concat(t.groups[g].members).map((m) => `<span style="border-radius:10px;overflow:hidden;line-height:0;background:#efe0c6">${IS.people.portrait(m, 40)}</span>`).join('')}</div>
          <div class="small">Team health: <b>${gs.health}%</b></div><div class="bar good"><span style="width:${gs.health}%"></span></div></div>`;
      }).join('')}</div>
      <div class="grid grid-2">${people.map((id) => {
        const c = IS.characters[id];
        const v = E().rel(id);
        return `<div class="panel row" style="align-items:flex-start;flex-wrap:nowrap"><div style="border-radius:14px;overflow:hidden;line-height:0;background:#efe0c6;flex:none">${IS.people.portrait(id, 74)}</div>
          <div style="flex:1;min-width:0"><div class="spread"><b>${U.esc(c.name)}</b><span class="pill">${U.esc(c.role)}</span></div><div class="small muted">${U.esc(c.title)}</div>
          <p class="small" style="margin:6px 0">${U.esc(c.bio)}</p><div class="spread small"><span>${relLabel(v)}</span><span class="muted">${v}/100</span></div><div class="bar"><span style="width:${v}%"></span></div></div></div>`;
      }).join('')}</div>`;
  };

  apps.career = function () {
    const s = st();
    return `<div class="app-title"><h2>🎓 Career</h2></div>${careerHtml(s)}`;
  };

  function careerHtml(s) {
    const cur = s.job ? s.job.level : s.career.level;
    return `<div class="track-list" style="margin-bottom:14px">${IS.tracks.map((t, i) => {
      const done = s.career.history.filter((h) => h.level === i);
      const best = done.find((h) => h.offer === 'offer');
      return `<div class="track-card ${i === cur ? 'cur' : ''} ${i > cur && !best ? 'locked' : ''}"><div class="n">Internship ${t.n}</div><b>${t.icon} ${U.esc(t.langLabel)}</b><div class="small muted">${U.esc(t.team)}</div>
        <div class="small">${best ? `✅ Offer · ${U.letter(best.grade)}` : done.length ? `${done.length} attempt${done.length > 1 ? 's' : ''}` : i === cur ? '▶ Current' : '🔒'}</div></div>`;
    }).join('')}</div>
      <h3>History</h3>${s.career.history.length ? `<table class="tbl"><tr><th>#</th><th>Internship</th><th>Grade</th><th>Offer</th><th>Earned</th></tr>${s.career.history.map((h) => `<tr><td>${h.level + 1}</td><td>${U.esc(h.title)} · ${U.esc(h.team)}</td><td>${U.letter(h.grade)} (${h.grade}%)</td><td>${h.offer === 'offer' ? '✅ Return offer' : '—'}</td><td class="num">${U.money(h.earned)}</td></tr>`).join('')}</table>` : '<p class="muted">Your first internship is in progress.</p>'}
      <div class="grid grid-3" style="margin-top:14px"><div class="kpi"><div class="v">${U.money(s.lifetime.earned)}</div><div class="k">Career earnings</div></div><div class="kpi"><div class="v">${s.lifetime.hours.toFixed(0)} h</div><div class="k">Career hours</div></div><div class="kpi"><div class="v">${s.awards.length}</div><div class="k">Awards</div></div></div>`;
  }

  // ── Render ──────────────────────────────────────────────
  const DOCK = [
    ['todo', '✅', 'To-Do'], ['mail', '📬', 'Mail'], ['calendar', '📅', 'Calendar'], ['hr', '💼', 'HR'], ['team', '👥', 'Team'], ['career', '🎓', 'Career'],
  ];

  function render(app, arg) {
    const s = st();
    const j = s.job;
    const unread = j.inbox.filter((m) => !m.read).length;
    const open = E().tasks().filter((t) => j.tasks[t.id] && j.tasks[t.id].status === 'assigned').length;
    const body = app === 'task' ? IS.workspace.render(arg) : apps[app]();
    return `<div class="computer"><div class="monitor"><div class="screen-os">
      <nav class="dock" aria-label="Apps">${DOCK.map(([id, ic, l]) => `<button class="${app === id || (app === 'task' && id === 'todo') ? 'active' : ''}" data-act="app" data-arg="${id}"><span class="ic">${ic}</span>${l}${id === 'mail' && unread ? `<span class="badge">${unread}</span>` : ''}${id === 'todo' && open ? `<span class="badge">${open}</span>` : ''}</button>`).join('')}
        <button data-act="learn"><span class="ic">📚</span>Learn</button>
        <div class="sep"></div><button data-act="closeComputer" title="Stand up from your desk"><span class="ic">🚶</span>Stand up</button></nav>
      <main class="app" id="app-pane">${body}</main></div>
      <div class="monitor-foot"><span>🕘 ${j.clockedIn ? `<span data-live="clock">${U.clock(j.minute)}</span>` : 'Not badged in'} · Day ${j.day}/34 <span data-live="clockstate" hidden style="color:var(--gold-2)"></span></span><span>⚡ ${Math.round(j.energy)} · 🙂 ${Math.round(j.morale)} · productivity ${Math.round(E().productivity() * 100)}%</span></div></div></div>`;
  }

  function mount(app, arg) {
    if (app === 'task') IS.workspace.mount(arg);
  }

  // ── Modals opened from the office ─────────────────────
  function storeModal(cats) {
    let tab = cats[0];
    const body = () => {
      const s = st();
      const items = IS.store.items.filter((i) => i.cat === tab && i.price > 0);
      const j = s.job;
      const note = { cafe: j && j.clockedIn ? 'Treats take a few minutes of your shift.' : 'Badge in first. The café serves people on the clock.', experience: 'Evenings and weekends are yours. Treat yourself!' }[tab] || 'Wearables show on your character everywhere. Desk items appear on your desk.';
      return `<div class="spread" style="margin-bottom:10px"><div class="tabs" style="margin:0">${cats.map((c) => { const cc = IS.store.categories.find((x) => x.id === c); return `<button class="tab ${tab === c ? 'active' : ''}" data-store-tab="${c}">${cc.icon} ${cc.label}</button>`; }).join('')}</div><span class="pill gold">Wallet: ${U.money(s.wallet)}</span></div>
        <p class="small muted">${note}</p>
        <div class="grid grid-3">${items.map((it) => {
          const owned = s.owned.includes(it.id);
          const cons = ['cafe', 'experience'].includes(it.cat);
          const inUse = it.cat === 'desk' ? s.desk.includes(it.id) : s.equipped[it.cat] === it.id;
          const btn = owned && !cons ? `<button class="btn small" data-equip="${it.id}">${inUse ? (it.cat === 'desk' ? 'Remove' : 'Take off') : (it.cat === 'desk' ? 'Put on desk' : 'Wear')}</button>`
            : `<button class="btn small ${s.wallet >= it.price ? 'gold' : ''}" data-buy="${it.id}" ${s.wallet >= it.price ? '' : 'disabled'}>Buy ${U.money(it.price)}</button>`;
          return `<div class="panel soft" style="display:flex;flex-direction:column;gap:6px"><div class="spread"><span style="font-size:2rem">${it.emoji}</span>${owned && !cons ? `<span class="pill good">Owned${inUse ? ' · in use' : ''}</span>` : ''}</div><b>${U.esc(it.name)}</b><span class="small muted">${U.esc(it.desc)}</span><div style="margin-top:auto">${btn}</div></div>`;
        }).join('')}</div>`;
    };
    IS.ui.modal({
      title: cats.includes('cafe') ? '☕ Studio Café' : cats.includes('experience') ? '🎟️ Outings & Trips' : '🛍️ Studio Store', wide: true, html: body(),
      buttons: [{ label: 'Done', cls: 'primary', onClick: (c) => { c(); IS.ui.after(); } }],
      onMount: (m, closeModal) => {
        const wire = () => {
          m.querySelectorAll('[data-store-tab]').forEach((b) => { b.onclick = () => { tab = b.dataset.storeTab; m.querySelector('.modal-body').innerHTML = body(); wire(); }; });
          m.querySelectorAll('[data-buy]').forEach((b) => { b.onclick = () => {
            const it = IS.store.byId(b.dataset.buy);
            // Café orders play out in the office: order at the counter, sit, enjoy.
            if (it.cat === 'cafe' && IS.office.isMounted()) { closeModal(); IS.ui.cafeBreak(it, null); return; }
            const r = E().buy(b.dataset.buy); IS.ui.toast(r.text, r.ok ? 'good' : 'bad'); m.querySelector('.modal-body').innerHTML = body(); wire(); if (IS.office.isMounted()) IS.office.refresh(); }; });
          m.querySelectorAll('[data-equip]').forEach((b) => { b.onclick = () => { E().equip(b.dataset.equip); m.querySelector('.modal-body').innerHTML = body(); wire(); if (IS.office.isMounted()) IS.office.refresh(); }; });
        };
        wire();
      },
    });
  }

  function awardsModal() {
    const s = st();
    const count = (id) => s.awards.filter((a) => a.id === id).length;
    const trophy = (a) => {
      const n = count(a.id);
      return `<div class="trophy ${n ? '' : 'locked'}"><div class="ic">${a.icon}</div><div><b>${a.name}</b>${n > 1 ? ` <span class="pill gold">×${n}</span>` : ''}<div class="small muted">${a.desc}</div>${a.metric ? `<div class="small muted">Judged on: ${a.metric}</div>` : ''}</div></div>`;
    };
    IS.ui.modal({
      title: '🏆 Hall of Fame', wide: true,
      html: `<h3>🎖️ Honors (presented live)</h3><div class="grid grid-2" style="margin-bottom:16px">${IS.awards.honors.map(trophy).join('')}</div>
        <h3>🏆 Awards Night (Day 34 of every internship)</h3><p class="small muted">You compete against your intern cohort. Winners are decided by actual performance.</p><div class="grid grid-2" style="margin-bottom:16px">${IS.awards.finals.map(trophy).join('')}</div>
        <h3>🏅 Career achievements</h3><div class="grid grid-2" style="margin-bottom:16px">${IS.awards.achievements.map(trophy).join('')}</div>
        <h3>🎓 Career</h3>${careerHtml(s)}`,
    });
  }

  return { render, mount, icon, typeLabel, statusPill, gradeBadge, stubTable, storeModal, awardsModal, careerHtml, local };
})();
