// Screens outside the office: title, character creator, your apartment in the
// evening, the career center (between internships), results and the ending.
IS.home = (function () {
  const U = IS.util;
  const st = () => IS.state.get();
  const P = () => IS.people;
  let draft = null;

  function title() {
    const has = IS.state.hasSave();
    const lineup = ['rosa', 'marcus', 'gus', 'ava', 'harriet', 'theo', 'lena'];
    return `<div class="screen title-screen"><div class="title-card">
      <div class="title-lineup">${lineup.map((id, i) => P().svg(IS.characters[id].look, { height: i === 3 ? 200 : 170 + (i % 2) * 12 })).join('')}</div>
      <div class="logo">Internship<br>Simulator</div>
      <p class="muted" style="font-size:1.1rem">Ten internships. Ten technologies. One dream job.<br>Interview, walk the studio, ship real code, hit deadlines, get paid, win awards.</p>
      <div class="features">
        <div class="feature">🎤 <b>Interviews</b>: behavioral + live technical rounds. Retry with training.</div>
        <div class="feature">🏢 <b>Walk the studio</b>: badge in, find your desk, talk to 15+ people.</div>
        <div class="feature">💻 <b>Real code</b>: JavaScript, Python, C++, SQL, Bash, HTML/CSS, YAML.</div>
        <div class="feature">⏱️ <b>34 real-time workdays</b>: one focused hour a day, hourly pay, deadlines that cost you.</div>
        <div class="feature">👥 <b>Group projects</b>, code reviews and live presentations.</div>
        <div class="feature">🛍️ <b>Store</b>: outfits, desk upgrades, coffee, movies and trips.</div>
        <div class="feature">🏆 <b>Awards night</b> every internship, plus return offers.</div>
        <div class="feature">🎓 <b>Career path</b>: JS → Python → Data Science → C++ → Linux → …</div>
      </div>
      <div class="row" style="justify-content:center">
        ${has ? '<button class="btn gold big" data-act="continue">▶ Continue career</button>' : ''}
        <button class="btn ${has ? 'dark' : 'gold'} big" data-act="newGame">✨ New career</button>
        <button class="btn ghost" style="color:var(--paper)" data-act="importSave">📂 Import save</button>
      </div>
      <p class="disclaimer">Fan-made educational simulation. Not affiliated with, sponsored or endorsed by The Walt Disney Company. All characters are fictional.</p>
    </div></div>`;
  }

  // ── Character creator / wardrobe ─────────────────────────
  function lookControls(look, act) {
    const sw = (key, list) => `<div class="swatches">${list.map((c) => `<button class="swatch ${look[key] === c ? 'sel' : ''}" style="background:${c}" data-act="${act}" data-arg="${key}|${c}" aria-label="${key} ${c}"></button>`).join('')}</div>`;
    const chips = (key, list) => `<div class="chips">${list.map((v) => `<button class="chip ${(look[key] || 'none') === v ? 'sel' : ''}" data-act="${act}" data-arg="${key}|${v}">${v}</button>`).join('')}</div>`;
    return `<label class="field"><span>Skin tone</span>${sw('skin', P().SKINS)}</label>
      <label class="field"><span>Hair style</span>${chips('hair', P().HAIR_STYLES)}</label>
      <label class="field"><span>Hair color</span>${sw('hairColor', P().HAIR_COLORS)}</label>
      <label class="field"><span>Eye color</span>${sw('eyes', P().EYE_COLORS)}</label>
      <label class="field"><span>Facial hair</span>${chips('facial', P().FACIAL)}</label>
      <label class="field"><span>Build</span>${chips('build', P().BUILDS)}</label>
      <label class="field"><span>Classic tee color</span>${sw('topColor', P().TOP_COLORS)}</label>
      <label class="field"><span>Bottoms</span>${chips('bottom', P().BOTTOMS)}</label>
      <label class="field"><span>Bottoms color</span>${sw('bottomColor', P().BOTTOM_COLORS)}</label>
      <label class="field"><span>Shoes</span>${chips('shoes', P().SHOES)}</label>`;
  }

  function creator() {
    const d = draft || (draft = { name: '', school: '', major: 'Computer Science', look: { skin: P().SKINS[3], hair: 'short', hairColor: '#2f2019', eyes: P().EYE_COLORS[1], facial: 'none', build: 'average', top: 'tee', topColor: '#c2593f', bottom: 'pants', bottomColor: '#5a4636', shoes: 'sneakers' } });
    return `<div class="screen creator-screen"><div class="creator">
      <div class="stack"><div class="preview-stage">${P().svg(d.look, { height: 380 })}</div>
        <div class="row" style="justify-content:center">${['happy', 'neutral', 'wow'].map((m) => `<span style="border-radius:14px;overflow:hidden;line-height:0;background:#efe0c6">${P().svg(d.look, { mode: 'portrait', height: 84, mood: m })}</span>`).join('')}</div>
        <p class="small muted center">Unlock outfits, hats and accessories in the Studio Store.</p></div>
      <div class="panel"><h1>Create your intern</h1>
        <label class="field"><span>Name</span><input type="text" id="c-name" maxlength="24" placeholder="Your name" value="${U.esc(d.name)}"></label>
        <div class="grid grid-2"><label class="field"><span>University</span><input type="text" id="c-school" maxlength="40" placeholder="e.g. Arizona State University" value="${U.esc(d.school)}"></label>
        <label class="field"><span>Major</span><input type="text" id="c-major" maxlength="40" value="${U.esc(d.major)}"></label></div>
        ${lookControls(d.look, 'draftLook')}
        <div class="spread" style="margin-top:8px"><button class="btn ghost" data-act="toTitle">← Back</button><button class="btn gold big" data-act="startGame">Apply for my first internship →</button></div></div></div></div>`;
  }

  function mountCreator() {
    ['name', 'school', 'major'].forEach((k) => {
      const el = document.getElementById('c-' + k);
      if (el) el.addEventListener('input', () => { draft[k] = el.value; });
    });
  }

  function wardrobe() {
    const s = st();
    const body = () => {
      const wear = s.owned.map((id) => IS.store.byId(id)).filter((i) => ['outfit', 'hat', 'accessory'].includes(i.cat));
      return `<div class="creator" style="margin:0;max-width:none"><div class="preview-stage" style="min-height:360px">${P().svg(IS.state.playerLook(), { height: 340 })}</div>
        <div><h3>👕 Wearing</h3><div class="chips" style="margin-bottom:14px">${wear.map((i) => `<button class="chip ${s.equipped[i.cat] === i.id ? 'sel' : ''}" data-wear="${i.id}">${i.emoji} ${U.esc(i.name)}</button>`).join('')}</div>
        <h3>🎨 Look</h3>${lookControls(s.player.look, 'wlook')}</div></div>`;
    };
    IS.ui.modal({
      title: '🪞 Mirror & wardrobe', wide: true, html: body(),
      buttons: [{ label: 'Looking good!', cls: 'primary', onClick: (c) => { c(); IS.state.save(); IS.ui.render(); } }],
      onMount: (m) => {
        const wire = () => {
          m.querySelectorAll('[data-wear]').forEach((b) => { b.onclick = () => { IS.engine.equip(b.dataset.wear); m.querySelector('.modal-body').innerHTML = body(); wire(); }; });
          m.querySelectorAll('[data-act="wlook"]').forEach((b) => { b.onclick = (e) => { e.stopPropagation(); const [k, v] = b.dataset.arg.split('|'); s.player.look[k] = v === 'none' ? 'none' : v; m.querySelector('.modal-body').innerHTML = body(); wire(); }; });
        };
        wire();
      },
    });
  }

  // ── Apartment (evenings) ─────────────────────────────────
  function apartmentFigure() {
    return `<div class="home-figure"><div class="window" style="position:relative"><div class="sun" style="left:40px;top:70px;background:#f6d08a"></div><div class="hills"></div></div>
      ${P().svg(IS.state.playerLook(), { height: 330 })}</div>`;
  }

  function render() {
    const s = st();
    const j = s.job;
    const t = IS.engine.track();
    const lastStub = j.paystubs[j.paystubs.length - 1];
    const weekend = (j.day - 1) % 5 === 0 && j.day > 1;
    const open = IS.engine.tasks().filter((x) => j.tasks[x.id] && j.tasks[x.id].status === 'assigned').length;
    return `<div class="screen home"><div class="home-inner">${apartmentFigure()}
      <div class="stack">
        <div class="panel"><div class="small muted" style="font-weight:900;letter-spacing:.8px;text-transform:uppercase">🏠 Home · Internship ${t.n}: ${U.esc(t.team)}</div>
          <h1 style="margin:4px 0">${weekend ? '🌴 Weekend' : '🌙 Evening'}, ${U.esc(s.player.name)}</h1>
          <p>Next up: <b>${U.weekday(j.day)}, Day ${j.day} of 34</b>. ${open ? `You have <b>${open}</b> open assignment${open > 1 ? 's' : ''} waiting on your work computer.` : 'Nothing open right now.'}</p>
          <div class="grid grid-3" style="margin-bottom:12px"><div class="kpi"><div class="v">${U.money(s.wallet)}</div><div class="k">Wallet</div></div><div class="kpi"><div class="v">${Math.round(j.morale)}</div><div class="k">Morale</div></div><div class="kpi"><div class="v">${IS.engine.hoursWorked().toFixed(1)} / ${IS.engine.TOTAL_HOURS}</div><div class="k">Hours so far</div></div></div>
          <div class="row"><button class="btn gold big" data-act="goToWork">🌅 Go to work (Day ${j.day})</button>
            <button class="btn" data-act="learn">📚 Study (Learning Center)</button>
            <button class="btn" data-act="outings">🎟️ Plan an outing</button><button class="btn" data-act="wardrobe">🪞 Mirror & wardrobe</button>
            <button class="btn" data-act="shopOnline">🛍️ Shop online</button><button class="btn" data-act="awards">🏆 Career & awards</button></div></div>
        ${lastStub ? `<div class="panel"><h3>💵 Latest paycheck (Week ${lastStub.week})</h3>${IS.computer.stubTable(lastStub)}</div>` : ''}
        <div class="panel"><h3>📔 Scrapbook</h3>${s.scrapbook.slice(-8).reverse().map((m) => `<div class="row small" style="margin-bottom:6px"><span>${m.emoji || '📸'}</span><span class="muted">${m.level != null ? 'Internship ' + (m.level + 1) + (m.day ? ', Day ' + m.day : '') : ''}</span><span>${U.esc(m.text)}</span></div>`).join('')}</div>
      </div></div></div>`;
  }

  // ── Career center (between internships / interviews) ─────
  function careerCenter(inner) {
    const s = st();
    return `<div class="screen home"><div class="home-inner">${apartmentFigure()}
      <div class="stack"><div class="spread"><h1 style="margin:0">🎓 Career Center</h1><div class="row"><span class="pill gold">Wallet ${U.money(s.wallet)}</span>
        <button class="btn small" data-act="learn">📚 Learn</button><button class="btn small" data-act="wardrobe">🪞 Wardrobe</button><button class="btn small" data-act="shopOnline">🛍️ Shop</button><button class="btn small" data-act="outings">🎟️ Outings</button><button class="btn small dark" data-act="menu">☰</button></div></div>
        ${inner}
        <div class="panel"><h3>Your career path</h3>${IS.computer.careerHtml(s)}</div></div></div></div>`;
  }

  // ── Results after an internship ─────────────────────────
  function showResults(r) {
    const s = st();
    const h = s.career.history[s.career.history.length - 1];
    const t = IS.trackAt(h.level);
    const won = s.awards.filter((a) => a.level === h.level);
    const next = s.career.phase === 'done' ? null : IS.trackAt(s.career.level);
    const offer = { offer: ['🎉 Return offer!', 'good'], maybe: ['🤝 No offer this time (strong reference)', 'warn'], none: ['No return offer', 'bad'] }[r.offer];
    const el = document.createElement('div');
    el.className = 'stage';
    el.innerHTML = `<div class="spotlight"></div><div class="stage-inner center">
      <div class="scene-place">Internship ${t.n} of 10 complete · ${U.esc(t.team)}</div>
      <div style="margin:10px 0">${P().svg(IS.state.playerLook(), { height: 260, mood: r.offer === 'offer' ? 'happy' : 'neutral' })}</div>
      <h1 style="color:var(--gold-2)">${U.letter(r.overall)} · ${Math.round(r.overall)}%</h1>
      <p><span class="pill ${offer[1]}" style="font-size:1rem;padding:6px 14px">${offer[0]}</span></p>
      <div class="grid grid-3" style="margin:14px 0;color:var(--ink)"><div class="kpi"><div class="v">${U.money(h.earned)}</div><div class="k">Take-home pay</div></div><div class="kpi"><div class="v">${h.hours.toFixed(1)} h</div><div class="k">Hours worked</div></div><div class="kpi"><div class="v">${won.length}</div><div class="k">Awards</div></div></div>
      <p>${won.map((a) => `<span class="pill gold" style="margin:2px">${IS.awards.byId(a.id).icon} ${IS.awards.byId(a.id).name}</span>`).join('') || '<span class="muted">No trophies this time.</span>'}</p>
      <p class="muted" style="margin-top:14px">${s.career.phase === 'done' ? 'That was the final internship!' : r.offer === 'offer' ? `Next: <b>Internship ${next.n}: ${U.esc(next.title)} · ${U.esc(next.langLabel)}</b>. Your return offer waives the behavioral round.` : `You can reapply for <b>${U.esc(t.title)}</b>. You'll need to interview again.`}</p>
      <button class="btn gold big" id="res-continue">Continue →</button></div>`;
    document.body.appendChild(el);
    if (r.offer === 'offer') IS.ui.confetti(80);
    el.querySelector('#res-continue').onclick = () => {
      el.remove();
      if (s.career.phase === 'done') IS.engine.grantAward('full_time', 'All 10 internships complete');
      IS.ui.render();
      IS.ui.flushCeremonies();
    };
  }

  function careerDone() {
    const s = st();
    return `<div class="screen title-screen"><div class="title-card">
      <div class="title-lineup">${P().svg(IS.state.playerLook(), { height: 260 })}${['rosa', 'harriet'].map((id) => P().svg(IS.characters[id].look, { height: 230 })).join('')}</div>
      <div class="logo">Full-Time Imagineer!</div>
      <p style="font-size:1.1rem">${U.esc(s.player.name)}, you completed all 10 internships and earned a full-time offer.</p>
      <div class="grid grid-3" style="margin:16px 0;color:var(--ink)"><div class="kpi"><div class="v">${U.money(s.lifetime.earned)}</div><div class="k">Career earnings</div></div><div class="kpi"><div class="v">${s.lifetime.hours.toFixed(0)} h</div><div class="k">Hours worked</div></div><div class="kpi"><div class="v">${s.awards.length}</div><div class="k">Awards</div></div><div class="kpi"><div class="v">${s.lifetime.interviews}</div><div class="k">Interviews</div></div></div>
      <div class="panel" style="text-align:left">${IS.computer.careerHtml(s)}</div>
      <div class="row" style="justify-content:center;margin-top:16px"><button class="btn gold" data-act="awards">🏆 Hall of Fame</button><button class="btn" data-act="exportSave">💾 Export save</button><button class="btn dark" data-act="restart">✨ Start a new career</button></div></div></div>`;
  }

  return { title, creator, mountCreator, wardrobe, render, careerCenter, showResults, careerDone, draft: () => draft, resetDraft: () => { draft = null; } };
})();
