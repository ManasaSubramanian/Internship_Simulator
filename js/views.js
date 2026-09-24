// Page renderers. Each returns an HTML string; interactive elements use
// data-act / data-arg attributes handled in main.js.
IS.views = (function () {
  const U = IS.util;
  const E = () => IS.engine;
  const st = () => IS.state.get();
  const V = {};
  V.local = { taskTab: 'open', storeTab: 'cafe', openMail: null };
  V.mount = {};

  const TYPE_ICON = { coding: '💻', quiz: '📝', review: '🔍', written: '✍️', presentation: '🎤' };
  const TYPE_LABEL = { coding: 'Coding', quiz: 'Training', review: 'Code Review', written: 'Writing', presentation: 'Presentation' };

  V.icon = (t) => (t.urgent ? '🚨' : TYPE_ICON[t.type]);
  V.typeLabel = (t) => TYPE_LABEL[t.type];

  V.gradeBadge = (score) => `<span class="grade ${U.gradeClass(score)}">${U.letter(score)} · ${score}%</span>`;

  V.statusPill = function (t) {
    const r = st().tasks[t.id];
    if (!r) return '<span class="pill">Locked</span>';
    if (r.status === 'graded') return V.gradeBadge(r.score);
    if (r.status === 'missed') return '<span class="pill bad">Missed · 0%</span>';
    if (r.status === 'expired') return '<span class="pill">Closed</span>';
    if (r.late) return '<span class="pill bad">⚠️ Late</span>';
    const left = E().dueAbs(t) - E().now();
    if (left <= U.DAY_LENGTH) return '<span class="pill warn">Due soon</span>';
    return '<span class="pill accent">Open</span>';
  };

  function relLabel(v) {
    if (v >= 85) return '🌟 Champion';
    if (v >= 70) return '💙 Trusted';
    if (v >= 55) return '🙂 Friendly';
    if (v >= 40) return '👋 Acquaintance';
    return '😬 Strained';
  }

  V.stubTable = function (stub) {
    return `<table class="stub">
      <tr><td>Hours worked (${stub.hours.toFixed(2)} h × ${U.money(stub.rate)}/h)</td><td>${U.money(stub.gross)}</td></tr>
      ${stub.bonusItems.map((b) => `<tr><td>🎁 ${U.esc(b.label)}</td><td style="color:var(--good)">+${U.money(b.amount)}</td></tr>`).join('')}
      <tr><td>Taxes &amp; withholding (12.65%)</td><td>−${U.money(stub.taxes)}</td></tr>
      ${stub.deductionItems.map((d) => `<tr><td>⚠️ ${U.esc(d.label)}</td><td style="color:var(--bad)">−${U.money(d.amount)}</td></tr>`).join('')}
      <tr><td><b>Net pay deposited</b></td><td><b style="color:var(--gold-2)">${U.money(stub.net)}</b></td></tr></table>
      ${stub.net === 0 && stub.deductions > 0 ? '<p class="small" style="color:var(--bad)">Adjustments exceeded this week\'s earnings. Your paycheck was reduced to $0.</p>' : ''}`;
  };

  // ── Title & creator ─────────────────────────────────────
  V.title = function () {
    const has = IS.state.hasSave();
    return `<div class="title-screen"><div class="title-card">
      <div class="castle">🏰</div>
      <div class="logo">Imagineer Intern<br>Simulator</div>
      <p class="muted" style="font-size:1.1rem">Six weeks as a Software Engineering Intern on the Ride Systems team.<br>Ship code. Hit deadlines. Get paid. Win awards.</p>
      <div class="features">
        <div class="feature">💻 <b>Real coding tasks</b>: write JavaScript, run tests, get graded</div>
        <div class="feature">⏰ <b>Deadlines &amp; pay</b>: $24/hr, 3 hrs a day, late work costs you</div>
        <div class="feature">👥 <b>Group projects</b>: teammates, conflict, team health</div>
        <div class="feature">🎤 <b>Live presentations</b>: build a deck, face tough Q&amp;A</div>
        <div class="feature">🙋 <b>Ask for help</b>: mentor, fellow interns, wiki, extensions</div>
        <div class="feature">🛍️ <b>Store</b>: outfits, desk gear, coffee, movies and trips</div>
        <div class="feature">🏆 <b>Awards</b>: spot awards, Rising Star and a full awards night</div>
        <div class="feature">📊 <b>Report card</b>, paystubs and a return-offer decision</div>
      </div>
      <div class="row" style="justify-content:center">
        ${has ? '<button class="btn gold big" data-act="continue">▶ Continue internship</button>' : ''}
        <button class="btn ${has ? '' : 'gold'} big" data-act="newGame">✨ New internship</button>
        <button class="btn ghost" data-act="importSave">📂 Import save</button>
      </div>
      <p class="disclaimer">Fan-made educational simulation. Not affiliated with, sponsored or endorsed by The Walt Disney Company. All characters are fictional.</p>
    </div></div>`;
  };

  V.draft = null;
  V.creator = function () {
    const d = V.draft || (V.draft = { name: '', school: '', major: 'Computer Science', avatar: { skin: IS.avatar.SKINS[3], hair: 'short', hairColor: '#2b1a10', shirtColor: '#3b82f6' } });
    const av = Object.assign({}, d.avatar, { outfit: 'tee' });
    const sw = (key, list) => `<div class="swatches">${list.map((c) => `<button class="swatch ${d.avatar[key] === c ? 'sel' : ''}" style="background:${c}" data-act="draftAvatar" data-arg="${key}|${c}" aria-label="${key} ${c}"></button>`).join('')}</div>`;
    return `<div class="creator">
      <div class="stack">
        <div class="avatar-preview">${IS.avatar.svg(av, 220)}</div>
        <p class="small muted center">You can unlock outfits, hats and accessories in the store.</p>
      </div>
      <div class="card">
        <h2>Create your intern</h2>
        <label class="field"><span>Name</span><input type="text" id="c-name" maxlength="24" placeholder="Your name" value="${U.esc(d.name)}"></label>
        <label class="field"><span>University</span><input type="text" id="c-school" maxlength="40" placeholder="e.g. Arizona State University" value="${U.esc(d.school)}"></label>
        <label class="field"><span>Major</span><input type="text" id="c-major" maxlength="40" value="${U.esc(d.major)}"></label>
        <label class="field"><span>Skin tone</span>${sw('skin', IS.avatar.SKINS)}</label>
        <label class="field"><span>Hair style</span><div class="chips">${IS.avatar.HAIR_STYLES.map((h) => `<button class="chip ${d.avatar.hair === h ? 'sel' : ''}" data-act="draftAvatar" data-arg="hair|${h}">${h}</button>`).join('')}</div></label>
        <label class="field"><span>Hair color</span>${sw('hairColor', IS.avatar.HAIR_COLORS)}</label>
        <label class="field"><span>Shirt color</span>${sw('shirtColor', IS.avatar.SHIRT_COLORS)}</label>
        <div class="row" style="justify-content:space-between;margin-top:8px">
          <button class="btn ghost" data-act="toTitle">← Back</button>
          <button class="btn gold big" data-act="startGame">Start my internship ✨</button>
        </div>
      </div></div>`;
  };
  V.mount.creator = function () {
    ['name', 'school', 'major'].forEach((k) => {
      const el = document.getElementById('c-' + k);
      if (el) el.addEventListener('input', () => { V.draft[k] = el.value; });
    });
  };

  // ── Desk ────────────────────────────────────────────────
  function openTasksSorted() {
    const s = st();
    return IS.tasks.filter((t) => s.tasks[t.id] && s.tasks[t.id].status === 'assigned')
      .sort((a, b) => E().dueAbs(a) - E().dueAbs(b));
  }

  V.taskRow = function (t) {
    const s = st();
    const r = s.tasks[t.id];
    const open = r && r.status === 'assigned';
    const due = E().effectiveDue(t);
    const pct = open ? Math.round(r.progress / t.effort * 100) : 100;
    return `<div class="task-row ${t.urgent && open ? 'urgent' : ''}" data-act="openTask" data-arg="${t.id}" role="button" tabindex="0">
      <div class="ico">${V.icon(t)}</div>
      <div><div class="t">${U.esc(t.title)}</div>
        <div class="small muted">${V.typeLabel(t)} · ${t.kind === 'group' ? '👥 Group' : '🧑 Individual'}${t.optional ? ' · ⭐ Optional' : ''} · from ${IS.characters[t.from].short} · due ${U.dueLabel(due)}</div>
        ${open ? `<div class="bar" style="margin-top:6px;max-width:260px"><span style="width:${pct}%"></span></div>` : ''}</div>
      <div>${V.statusPill(t)}</div></div>`;
  };

  V.deskScene = function () {
    const s = st();
    const next = openTasksSorted()[0];
    const screen = !s.clockedIn
      ? `> Workstation locked 🔒<br>> Clock in to begin Day ${s.day}`
      : next
        ? `> ${U.clock(s.minute)}<br>> NEXT DUE:<br>> ${U.esc(next.title.slice(0, 26))}<br>> ${U.dueLabel(E().effectiveDue(next)).replace(/\(Day \d+\) /, '')}<br>> productivity ${Math.round(E().productivity() * 100)}%`
        : `> ${U.clock(s.minute)}<br>> All caught up ✨<br>> inbox zero-ish`;
    return `<div class="desk-scene ${s.clockedIn && s.minute > 120 ? 'pm' : ''}">
      <div class="window"></div>
      <div class="poster">✦<br>RIDE SYSTEMS<br>SOFTWARE<br>✦</div>
      <div class="desk"></div>
      <div class="stand"></div>
      <div class="monitor">${screen}</div>
      <div class="me-at-desk">${IS.avatar.forCharacter('player', 150, { mood: s.morale < 30 ? 'sad' : 'happy' })}</div>
      <div class="items">${s.desk.map((id) => `<span title="${U.esc(IS.store.byId(id).name)}">${IS.store.byId(id).emoji}</span>`).join('')}</div>
    </div>`;
  };

  V.desk = function () {
    const s = st();
    const open = openTasksSorted();
    const g = E().gradeSummary();
    const isMonday = (s.day - 1) % 5 === 0;
    const startCard = !s.clockedIn ? `<div class="card" style="border-color:var(--gold)">
        <div class="spread"><div>
          <h2>${s.day === 1 ? '🎉 Your first day!' : isMonday ? '☀️ Welcome back from the weekend!' : '☀️ Good morning!'}</h2>
          <p class="muted">${U.weekday(s.day)}, Week ${U.weekOf(s.day)} (Day ${s.day} of 30). Your shift is 9:00 AM – 12:00 PM (3 paid hours at ${U.money(s.rate)}/hr).</p>
          ${open.length ? `<p>You have <b>${open.length}</b> open assignment${open.length > 1 ? 's' : ''}. Next due: <b>${U.esc(open[0].title)}</b>, ${U.dueLabel(E().effectiveDue(open[0]))}.</p>` : ''}
        </div><button class="btn gold big" data-act="clockIn">⏱ Clock in</button></div></div>` : '';
    const todayCard = s.clockedIn ? `<div class="card">
        <h3>🕘 Today</h3>
        <div class="grid grid-3" style="margin-bottom:10px">
          <div class="kpi"><div class="v">${U.clock(s.minute)}</div><div class="k">Current time</div></div>
          <div class="kpi"><div class="v">${E().remaining()}m</div><div class="k">Left in shift</div></div>
          <div class="kpi"><div class="v">${Math.round(E().productivity() * 100)}%</div><div class="k">Productivity</div></div>
        </div>
        <p class="small muted">Productivity depends on energy, morale and your desk setup. Low on energy? Grab a coffee or take a walk.</p>
        <div class="row">
          <button class="btn" data-act="walk">🚶 Walk around the lot (10 min)</button>
          <button class="btn" data-act="go" data-arg="store|cafe">☕ Studio Café</button>
          <button class="btn" data-act="go" data-arg="team">💬 Chat with the team</button>
        </div></div>` : '';
    const recent = s.inbox.slice(0, 3);
    return `<div class="page-title"><h1>My Desk</h1><span class="pill">${U.esc(s.player.school || 'Intern')} · ${U.esc(s.player.major || '')}</span></div>
      <div class="stack">
        ${startCard}
        ${V.deskScene()}
        ${todayCard}
        <div class="grid grid-2">
          <div class="card"><div class="spread"><h3>📋 Up next</h3><button class="btn small ghost" data-act="go" data-arg="tasks">All tasks →</button></div>
            <div class="stack">${open.slice(0, 4).map(V.taskRow).join('') || '<p class="muted">Nothing open right now. ✨</p>'}</div></div>
          <div class="card"><div class="spread"><h3>📬 Inbox</h3><button class="btn small ghost" data-act="go" data-arg="inbox">Open inbox →</button></div>
            ${recent.map((m) => `<div class="row small" style="margin-bottom:8px">${IS.avatar.forCharacter(m.from, 30)}<div><b>${U.esc(m.subject)}</b><div class="muted">${IS.characters[m.from].short} · Day ${m.day}</div></div></div>`).join('') || '<p class="muted">No mail yet.</p>'}
            <div class="grid grid-3" style="margin-top:12px">
              <div class="kpi"><div class="v">${g.count ? U.letter(g.avg) : '—'}</div><div class="k">Avg grade</div></div>
              <div class="kpi"><div class="v">${g.count}</div><div class="k">Graded</div></div>
              <div class="kpi"><div class="v">${s.awards.length}</div><div class="k">Awards</div></div>
            </div></div>
        </div>
      </div>`;
  };

  // ── Tasks ───────────────────────────────────────────────
  V.tasks = function () {
    const s = st();
    const tab = V.local.taskTab;
    const visible = IS.tasks.filter((t) => s.tasks[t.id]);
    const lists = {
      open: visible.filter((t) => s.tasks[t.id].status === 'assigned').sort((a, b) => E().dueAbs(a) - E().dueAbs(b)),
      done: visible.filter((t) => s.tasks[t.id].status !== 'assigned').sort((a, b) => (s.tasks[b.id].submittedAbs || 0) - (s.tasks[a.id].submittedAbs || 0)),
      group: visible.filter((t) => t.kind === 'group'),
    };
    const list = lists[tab];
    const upcoming = IS.tasks.filter((t) => !s.tasks[t.id]).length;
    return `<div class="page-title"><h1>Task Board</h1><span class="muted small">${upcoming} more assignments will be handed out later in the internship</span></div>
      <div class="tabs">
        <button class="tab ${tab === 'open' ? 'active' : ''}" data-act="taskTab" data-arg="open">Open (${lists.open.length})</button>
        <button class="tab ${tab === 'done' ? 'active' : ''}" data-act="taskTab" data-arg="done">Submitted &amp; closed (${lists.done.length})</button>
        <button class="tab ${tab === 'group' ? 'active' : ''}" data-act="taskTab" data-arg="group">👥 Group projects (${lists.group.length})</button>
      </div>
      <div class="stack">${list.map(V.taskRow).join('') || '<p class="muted">Nothing here yet.</p>'}</div>
      <div class="card flat" style="margin-top:18px"><h3>ℹ️ How deadlines work</h3>
        <p class="small muted">Each assignment needs a certain amount of <b>focus time</b> logged before you can submit. Late work loses <b>10% per workday</b> and costs a <b>${U.money(E().LATE_FEE)}</b> pay adjustment. After two workdays late it's marked <b>missed</b> (0% and another ${U.money(E().MISSED_FEE)}). Ask Maya for an extension <i>before</i> the deadline if you need one.</p></div>`;
  };

  // ── Inbox ───────────────────────────────────────────────
  V.inbox = function () {
    const s = st();
    return `<div class="page-title"><h1>Inbox</h1><button class="btn small" data-act="readAll">Mark all read</button></div>
      ${s.inbox.map((m) => {
        const c = IS.characters[m.from];
        const openM = V.local.openMail === m.id;
        return `<div class="mail ${m.read ? '' : 'unread'}" data-act="openMail" data-arg="${m.id}">
          ${IS.avatar.forCharacter(m.from, 44)}
          <div><div class="subj">${U.esc(m.subject)}</div><div class="small muted">${U.esc(c.name)} · ${U.esc(c.title)}</div>
            ${openM ? `<div class="body">${U.esc(m.body)}</div>${m.taskId ? `<button class="btn small primary" style="margin-top:8px" data-act="openTask" data-arg="${m.taskId}">Open assignment →</button>` : ''}` : ''}</div>
          <div class="small muted">Day ${m.day}<br>${U.clock(m.minute)}</div></div>`;
      }).join('') || '<p class="muted">Empty inbox.</p>'}`;
  };

  // ── Team ────────────────────────────────────────────────
  V.team = function () {
    const s = st();
    const groups = [
      { id: 'g1', name: 'Queue Time Display Board', members: ['jordan', 'sam'], start: 6 },
      { id: 'g2', name: 'Guest Flow Optimizer (Capstone)', members: ['priya', 'tyler'], start: 16 },
    ];
    return `<div class="page-title"><h1>Team</h1><span class="small muted">Chatting takes 10 minutes. Relationships affect feedback, extensions, group work and awards.</span></div>
      <h3>👥 Group projects</h3>
      <div class="grid grid-2" style="margin-bottom:18px">${groups.map((g) => {
        const gs = s.groups[g.id];
        const started = s.day >= g.start;
        return `<div class="card flat"><div class="spread"><b>${g.name}</b>${gs.grade != null ? V.gradeBadge(gs.grade) : started ? '<span class="pill accent">In progress</span>' : `<span class="pill">Starts Day ${g.start}</span>`}</div>
          <div class="row" style="margin:8px 0">${IS.avatar.forCharacter('player', 36)}${g.members.map((m) => IS.avatar.forCharacter(m, 36)).join('')}<span class="small muted">You, ${g.members.map((m) => IS.characters[m].short).join(', ')}</span></div>
          <div class="small">Team health: <b>${gs.health}%</b></div><div class="bar good"><span style="width:${gs.health}%"></span></div></div>`;
      }).join('')}</div>
      <div class="grid grid-2">${IS.TEAM.concat(['harriet', 'gus']).map((id) => {
        const c = IS.characters[id];
        const v = s.rel[id];
        return `<div class="card flat person">
          <div class="avatar-wrap">${IS.avatar.forCharacter(id, 76)}</div>
          <div style="flex:1"><div class="spread"><b>${c.name}</b><span class="pill">${c.role}</span></div>
            <div class="small muted">${c.title}</div>
            <p class="small" style="margin:6px 0">${c.bio}</p>
            <div class="spread small"><span>${relLabel(v)}</span><span class="muted">${v}/100</span></div>
            <div class="bar"><span style="width:${v}%"></span></div>
            <button class="btn small" style="margin-top:8px" data-act="chat" data-arg="${id}" ${s.clockedIn ? '' : 'disabled'}>💬 Chat${s.chattedToday[id] ? ' again' : ''}</button></div></div>`;
      }).join('')}</div>`;
  };

  // ── Store ───────────────────────────────────────────────
  V.store = function () {
    const s = st();
    const tab = V.local.storeTab;
    const cat = IS.store.categories.find((c) => c.id === tab);
    const note = {
      cafe: s.clockedIn ? 'Open now! Café treats take a few minutes of your shift.' : '☕ The café is only open while you\'re on the clock.',
      experience: s.clockedIn ? '🎟️ Outings happen after work. Clock out to book one.' : 'Evenings and weekends are yours. Treat yourself!',
      desk: 'Desk items are displayed on your desk and some boost productivity or morale.',
      outfit: 'Wearables show on your avatar everywhere, including on stage at awards.',
      hat: 'Wearables show on your avatar everywhere.', accessory: 'Wearables show on your avatar everywhere.',
    }[tab];
    const items = IS.store.items.filter((i) => i.cat === tab && i.price > 0);
    return `<div class="page-title"><h1>Store &amp; Café</h1><span class="pill gold">Wallet: ${U.money(s.wallet)}</span></div>
      <div class="tabs">${IS.store.categories.map((c) => `<button class="tab ${tab === c.id ? 'active' : ''}" data-act="storeTab" data-arg="${c.id}">${c.icon} ${c.label}</button>`).join('')}</div>
      <p class="muted">${note}</p>
      <div class="grid grid-3">${items.map((it) => {
        const owned = s.owned.includes(it.id);
        const consumable = ['cafe', 'experience'].includes(it.cat);
        const equipped = it.cat === 'desk' ? s.desk.includes(it.id) : s.equipped[it.cat] === it.id;
        let btn;
        if (owned && !consumable) btn = `<button class="btn small" data-act="equip" data-arg="${it.id}">${equipped ? (it.cat === 'desk' ? 'Remove from desk' : 'Take off') : (it.cat === 'desk' ? 'Put on desk' : 'Wear')}</button>`;
        else btn = `<button class="btn small ${s.wallet >= it.price ? 'gold' : ''}" data-act="buy" data-arg="${it.id}" ${s.wallet >= it.price ? '' : 'disabled'}>Buy</button>`;
        return `<div class="card flat item"><div class="spread"><span class="emoji">${it.emoji}</span><span class="price">${U.money(it.price)}</span></div>
          <b>${U.esc(it.name)}</b><span class="small muted">${U.esc(it.desc)}</span>
          <div class="spread">${owned && !consumable ? `<span class="pill good">Owned${equipped ? ' · in use' : ''}</span>` : '<span></span>'}${btn}</div></div>`;
      }).join('')}</div>
      <p class="small muted" style="margin-top:14px">${cat.icon} Tip: your paycheck lands every Friday. Watch out for late-work adjustments!</p>`;
  };

  // ── Profile ─────────────────────────────────────────────
  V.profile = function () {
    const s = st();
    const a = s.player.avatar;
    const sw = (key, list) => `<div class="swatches">${list.map((c) => `<button class="swatch ${a[key] === c ? 'sel' : ''}" style="background:${c}" data-act="setAvatar" data-arg="${key}|${c}" aria-label="${key}"></button>`).join('')}</div>`;
    const wearables = s.owned.map((id) => IS.store.byId(id)).filter((i) => ['outfit', 'hat', 'accessory'].includes(i.cat));
    const deskItems = s.owned.map((id) => IS.store.byId(id)).filter((i) => i.cat === 'desk');
    return `<div class="page-title"><h1>Profile &amp; Style</h1></div>
      <div class="grid grid-2">
        <div class="card"><div class="avatar-preview">${IS.avatar.forCharacter('player', 220)}</div>
          <h2 class="center" style="margin-top:10px">${U.esc(s.player.name)}</h2>
          <p class="center muted">Software Engineering Intern · Ride Systems<br>${U.esc(s.player.school)} · ${U.esc(s.player.major)}</p></div>
        <div class="card"><h3>🎨 Look</h3>
          <label class="field"><span>Skin tone</span>${sw('skin', IS.avatar.SKINS)}</label>
          <label class="field"><span>Hair style</span><div class="chips">${IS.avatar.HAIR_STYLES.map((h) => `<button class="chip ${a.hair === h ? 'sel' : ''}" data-act="setAvatar" data-arg="hair|${h}">${h}</button>`).join('')}</div></label>
          <label class="field"><span>Hair color</span>${sw('hairColor', IS.avatar.HAIR_COLORS)}</label>
          <label class="field"><span>Classic tee color</span>${sw('shirtColor', IS.avatar.SHIRT_COLORS)}</label>
          <h3>👕 Wardrobe</h3>
          <div class="chips">${wearables.map((i) => {
            const on = s.equipped[i.cat] === i.id;
            return `<button class="chip ${on ? 'sel' : ''}" data-act="equip" data-arg="${i.id}">${i.emoji} ${U.esc(i.name)}</button>`;
          }).join('')}</div>
          <p class="small muted">Buy more in the store. Click a worn hat or accessory to take it off.</p>
          <h3>🖥️ Desk items</h3>
          <div class="chips">${deskItems.map((i) => `<button class="chip ${s.desk.includes(i.id) ? 'sel' : ''}" data-act="equip" data-arg="${i.id}">${i.emoji} ${U.esc(i.name)}</button>`).join('') || '<span class="small muted">No desk items yet.</span>'}</div>
        </div>
      </div>
      <div class="card" style="margin-top:16px"><h3>📔 Summer scrapbook</h3>
        ${s.scrapbook.slice().reverse().map((m) => `<div class="row small" style="margin-bottom:6px"><span>${m.emoji || '📸'}</span><span class="muted">Day ${m.day}</span><span>${U.esc(m.text)}</span></div>`).join('')}</div>`;
  };

  // ── Report card ─────────────────────────────────────────
  V.report = function () {
    const s = st();
    const g = E().gradeSummary();
    const cats = ['Coding', 'Code Review', 'Communication', 'Design', 'Presentation', 'Training'];
    const rows = IS.tasks.filter((t) => s.tasks[t.id] && s.tasks[t.id].status !== 'assigned');
    return `<div class="page-title"><h1>Report Card</h1></div>
      <div class="grid grid-3" style="margin-bottom:16px">
        <div class="card kpi"><div class="v">${g.count ? U.letter(g.avg) : '—'}</div><div class="k">Overall (${g.count ? Math.round(g.avg) + '%' : 'no grades yet'})</div></div>
        <div class="card kpi"><div class="v">${s.stats.lateCount}</div><div class="k">Late submissions</div></div>
        <div class="card kpi"><div class="v">${s.stats.missedCount}</div><div class="k">Missed</div></div>
        <div class="card kpi"><div class="v">${s.stats.helpAsked}</div><div class="k">Times asked for help</div></div>
      </div>
      <div class="card" style="margin-bottom:16px"><h3>By category</h3>
        ${cats.map((c) => {
          const x = E().gradeSummary((t) => t.category === c);
          return `<div class="spread small"><span>${c}</span><span>${x.count ? V.gradeBadge(Math.round(x.avg)) : '<span class="muted">—</span>'}</span></div>
            <div class="bar" style="margin:4px 0 10px"><span style="width:${x.avg}%"></span></div>`;
        }).join('')}
        <div class="spread small"><span>👥 Group project: Display Board</span><span>${s.groups.g1.grade != null ? V.gradeBadge(s.groups.g1.grade) : '<span class="muted">—</span>'}</span></div>
        <div class="spread small" style="margin-top:6px"><span>👥 Group project: Capstone</span><span>${s.groups.g2.grade != null ? V.gradeBadge(s.groups.g2.grade) : '<span class="muted">—</span>'}</span></div>
      </div>
      <div class="card"><h3>All graded work</h3>
        <table class="breakdown"><tr><th>Assignment</th><th>Type</th><th>Submitted</th><th>Grade</th></tr>
        ${rows.map((t) => {
          const r = s.tasks[t.id];
          return `<tr data-act="openTask" data-arg="${t.id}" style="cursor:pointer"><td>${V.icon(t)} ${U.esc(t.title)}</td><td>${V.typeLabel(t)}</td>
            <td>${r.status === 'graded' ? 'Day ' + r.submittedDay + (r.daysLate ? ` <span class="pill bad">${r.daysLate}d late</span>` : '') + (r.early ? ' <span class="pill good">early</span>' : '') : r.status}</td><td>${V.statusPill(t)}</td></tr>`;
        }).join('') || '<tr><td colspan="4" class="muted">Nothing graded yet.</td></tr>'}</table></div>`;
  };

  // ── Awards ──────────────────────────────────────────────
  V.awards = function () {
    const s = st();
    const count = (id) => s.awards.filter((a) => a.id === id).length;
    const trophy = (a) => {
      const n = count(a.id);
      return `<div class="trophy ${n ? '' : 'locked'}"><div class="ic">${a.icon}</div><div><b>${a.name}</b>${n > 1 ? ` <span class="pill gold">×${n}</span>` : ''}
        <div class="small muted">${a.desc}</div>${a.metric ? `<div class="small muted">Judged on: ${a.metric}</div>` : ''}</div></div>`;
    };
    return `<div class="page-title"><h1>Awards</h1><span class="pill gold">🏆 ${s.awards.length} earned</span></div>
      <h3>🎖️ Honors (presented live)</h3><div class="grid grid-2" style="margin-bottom:18px">${IS.awards.honors.map(trophy).join('')}</div>
      <h3>🏆 Summer Intern Awards (Day 30 ceremony)</h3>
      <p class="small muted">You compete against Jordan, Sam, Priya and Tyler. Winners are decided by your actual performance.</p>
      <div class="grid grid-2" style="margin-bottom:18px">${IS.awards.finals.map(trophy).join('')}</div>
      <h3>🏅 Achievements</h3><div class="grid grid-2">${IS.awards.achievements.map(trophy).join('')}</div>`;
  };

  // ── Pay ─────────────────────────────────────────────────
  V.pay = function () {
    const s = st();
    const p = s.period;
    const gross = p.days.reduce((a, d) => a + d.pay, 0);
    const total = s.paystubs.reduce((a, x) => a + x.net, 0);
    return `<div class="page-title"><h1>Paystubs</h1><span class="pill gold">${U.money(s.rate)}/hr · 3 hrs/day · paid Fridays</span></div>
      <div class="grid grid-3" style="margin-bottom:16px">
        <div class="card kpi"><div class="v">${U.money(total)}</div><div class="k">Total net pay so far</div></div>
        <div class="card kpi"><div class="v">${U.money(gross)}</div><div class="k">This period (gross, so far)</div></div>
        <div class="card kpi"><div class="v">${U.money(p.deductions.reduce((a, d) => a + d.amount, 0))}</div><div class="k">Pending adjustments</div></div>
      </div>
      ${p.deductions.length ? `<div class="card flat" style="margin-bottom:16px"><h3>⚠️ Adjustments on your next check</h3>${p.deductions.map((d) => `<div class="spread small"><span>${U.esc(d.label)}</span><span style="color:var(--bad)">−${U.money(d.amount)}</span></div>`).join('')}</div>` : ''}
      <div class="grid grid-2">${s.paystubs.slice().reverse().map((stub) => `<div class="card"><h3>💵 Week ${stub.week}</h3>${V.stubTable(stub)}</div>`).join('') || '<p class="muted">Your first paycheck arrives Friday of Week 1.</p>'}</div>`;
  };

  // ── End screen ──────────────────────────────────────────
  V.end = function () {
    const s = st();
    const r = E().finalResult();
    const earned = s.paystubs.reduce((a, x) => a + x.net, 0);
    const hours = s.paystubs.reduce((a, x) => a + x.hours, 0);
    const offer = { offer: ['🎉 Return offer extended!', 'good'], maybe: ['🤝 No offer this year, but strong reference', 'warn'], none: ['No return offer', 'bad'] }[r.offer];
    const wins = s.awards.filter((a) => IS.awards.byId(a.id));
    return `<div class="main" style="margin:0 auto">
      <div class="center" style="margin:20px 0"><div class="castle">🎓</div><h1 class="logo">Internship Complete!</h1>
        <p class="muted">${U.esc(s.player.name)} · Software Engineering Intern · Ride Systems Software</p>
        <span class="pill ${offer[1]}" style="font-size:1rem;padding:6px 14px">${offer[0]}</span></div>
      <div class="grid grid-3" style="margin-bottom:16px">
        <div class="card kpi"><div class="v">${U.letter(r.overall)}</div><div class="k">Final grade (${Math.round(r.overall)}%)</div></div>
        <div class="card kpi"><div class="v">${U.money(earned)}</div><div class="k">Take-home pay</div></div>
        <div class="card kpi"><div class="v">${hours.toFixed(1)} h</div><div class="k">Hours worked</div></div>
        <div class="card kpi"><div class="v">${wins.length}</div><div class="k">Awards</div></div>
      </div>
      <div class="grid grid-2">
        <div class="card"><h3>🏆 Trophy shelf</h3>${wins.map((w) => { const a = IS.awards.byId(w.id); return `<div class="row small" style="margin-bottom:6px"><span style="font-size:1.4rem">${a.icon}</span><b>${a.name}</b><span class="muted">Day ${w.day}</span></div>`; }).join('') || '<p class="muted">No awards this time.</p>'}</div>
        <div class="card"><h3>🤝 Relationships</h3>${IS.TEAM.map((id) => `<div class="spread small"><span>${IS.characters[id].name}</span><span>${relLabel(s.rel[id])}</span></div>`).join('')}</div>
      </div>
      <div class="card" style="margin-top:16px"><h3>📔 Scrapbook</h3>${s.scrapbook.map((m) => `<div class="row small" style="margin-bottom:5px"><span>${m.emoji || '📸'}</span><span class="muted">Day ${m.day}</span><span>${U.esc(m.text)}</span></div>`).join('')}</div>
      <div class="row" style="justify-content:center;margin:20px 0">
        <button class="btn" data-act="go" data-arg="report">📊 Full report card</button>
        <button class="btn" data-act="exportSave">💾 Export save</button>
        <button class="btn gold" data-act="restart">✨ Start a new internship</button>
      </div></div>`;
  };

  return V;
})();
