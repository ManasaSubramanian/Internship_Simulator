// Staged award ceremonies: weekly/midpoint honors and the final awards night.
IS.ceremony = (function () {
  const U = IS.util;
  const st = () => IS.state.get();

  function stage(html) {
    let el = document.getElementById('stage');
    if (!el) {
      el = document.createElement('div');
      el.id = 'stage';
      el.className = 'stage';
      document.body.appendChild(el);
    }
    el.innerHTML = `<div class="spotlight"></div><div class="stage-inner">${html}</div>`;
    el.scrollTop = 0;
    return el;
  }

  function closeStage() {
    const el = document.getElementById('stage');
    if (el) el.remove();
  }

  function who(id) {
    return id === 'player' ? st().player.name : IS.characters[id].name;
  }

  function bind(el, handlers) {
    el.querySelectorAll('[data-c]').forEach((b) => {
      b.onclick = () => handlers[b.dataset.c](b.dataset.v);
    });
  }

  const SPEECHES = [
    { text: 'Thank the team: "I couldn\'t have done any of this without Dev, Maya, and my fellow interns."', morale: 6, reaction: 'Warm applause. Dev gives you a thumbs-up from the back.' },
    { text: 'Crack a joke: "I\'d like to thank caffeine, and whoever invented Ctrl+Z."', morale: 8, reaction: 'Big laughs! Sam is wheezing.' },
    { text: 'Keep it heartfelt: "I dreamed about working here since I was a kid. Thank you for making it real."', morale: 10, reaction: 'A few people dab their eyes. Rosa is beaming.' },
  ];

  function speech(el, onDone) {
    const box = el.querySelector('.speech');
    box.innerHTML = `<h3>🎤 Your acceptance speech</h3>` + SPEECHES.map((sp, i) =>
      `<button class="btn choice" data-c="pick" data-v="${i}">${U.esc(sp.text)}</button>`).join('');
    bind(box, {
      pick: (i) => {
        const sp = SPEECHES[+i];
        IS.engine.applyEffects({ morale: sp.morale });
        box.innerHTML = `<p class="applause">👏👏👏</p><p>${sp.reaction}</p><button class="btn gold" data-c="done">Continue</button>`;
        bind(box, { done: onDone });
      },
    });
  }

  // Maya (spot award) or Rosa (rising star) presents a single honor.
  function honor(a, c, done) {
    const presenter = a.id === 'spot' ? 'maya' : 'rosa';
    const intro = a.id === 'spot'
      ? 'Before everyone logs off for the weekend, one quick thing. Every Friday we recognize someone whose work really sparkled this week…'
      : 'Every summer, we recognize interns who are off to an exceptional start at the midpoint…';
    const el = stage(`<div class="center">
      <p class="scene-place">${a.id === 'spot' ? '🎉 Friday Team Huddle' : '🌟 Intern Program All-Hands'}</p>
      ${IS.ui.speakerHtml(presenter, intro)}
      <div class="envelope" style="margin:20px 0">✉️</div>
      <div class="reveal"><button class="btn gold big" data-c="open">Open the envelope</button></div>
    </div>`);
    bind(el, {
      open: () => {
        IS.ui.confetti(60);
        const r = el.querySelector('.reveal');
        el.querySelector('.envelope').remove();
        r.innerHTML = `<div class="trophy-big">${a.icon}</div><h1>${a.name}</h1>
          <h2 style="color:var(--gold-2)">${U.esc(st().player.name)}!</h2>
          <p class="muted">${U.esc(c.note || '')}</p>
          ${a.id === 'spot' ? '<p>🎁 A <b>$50 bonus</b> has been added to this week\'s paycheck.</p>' : ''}
          <div class="audience">${['jordan', 'sam', 'priya', 'tyler', 'dev'].map((id) => `<div class="seat">${IS.avatar.forCharacter(id, 48, { mood: 'wow' })}<div>👏</div></div>`).join('')}</div>
          <div class="speech card flat" style="margin-top:16px;text-align:left"></div>`;
        speech(r, () => {
          closeStage();
          done();
        });
      },
    });
  }

  // The final awards night.
  function finals(done) {
    const result = IS.engine.finalResult();
    const cats = result.categories;
    let i = -1;
    const wins = cats.filter((c) => c.winner === 'player');

    function intro() {
      const el = stage(`<div class="center">
        <p class="scene-place">🎭 Main Screening Room · Summer Intern Awards</p>
        <div class="castle">🏰</div>
        <h1 class="logo">Summer Intern Awards</h1>
        ${IS.ui.speakerHtml('rosa', 'Welcome, everyone, to the Summer Intern Awards! Six weeks, five incredible interns, and seven awards. Nominees are based on everyone\'s actual work this summer. Let\'s get started!')}
        <div class="audience">${['harriet', 'maya', 'dev', 'jordan', 'sam', 'priya', 'tyler'].map((id) => `<div class="seat">${IS.avatar.forCharacter(id, 52)}<div>${IS.characters[id].short}</div></div>`).join('')}</div>
        <p style="margin-top:20px"><button class="btn gold big" data-c="next">Begin the ceremony ✨</button></p></div>`);
      bind(el, { next });
    }

    function next() {
      i++;
      if (i >= cats.length) return outro();
      const c = cats[i];
      const a = IS.awards.byId(c.id);
      const el = stage(`<div class="center">
        <p class="scene-place">Award ${i + 1} of ${cats.length}</p>
        <div style="font-size:3rem">${a.icon}</div>
        <h1>${a.name}</h1>
        <p class="muted">${a.desc} <br><span class="small">Judged on: ${a.metric}</span></p>
        <h3 style="margin-top:14px">The nominees are…</h3>
        <div class="nominees">${c.nominees.map((n) => `<div class="nominee" data-id="${n.id}">${IS.avatar.forCharacter(n.id, 70)}<div><b>${U.esc(who(n.id))}</b></div></div>`).join('')}</div>
        <div class="envelope">✉️</div>
        <div class="reveal" style="margin-top:12px"><button class="btn gold big" data-c="open">And the award goes to…</button></div></div>`);
      bind(el, { open: () => reveal(el, c, a) });
    }

    function reveal(el, c, a) {
      el.querySelector('.reveal').innerHTML = '<p class="muted">🥁 Drumroll…</p>';
      setTimeout(() => {
        el.querySelector('.envelope').remove();
        el.querySelectorAll('.nominee').forEach((n) => n.classList.add(n.dataset.id === c.winner ? 'win' : 'lose'));
        const mine = c.winner === 'player';
        const you = c.all.find((n) => n.id === 'player');
        const winnerScore = c.all[0].score;
        const r = el.querySelector('.reveal');
        if (mine) {
          IS.ui.confetti(80);
          r.innerHTML = `<div class="trophy-big">🏆</div><h1 style="color:var(--gold-2)">${U.esc(st().player.name)}!</h1>
            <p>Your score: <b>${you.score.toFixed(1)}</b>, the highest in the cohort.</p>
            <div class="speech card flat" style="text-align:left;margin-top:12px"></div>`;
          speech(r, next);
        } else {
          const w = IS.characters[c.winner];
          r.innerHTML = `<h2>${U.esc(w.name)}!</h2>
            <p class="muted">${U.esc(w.short)} scored ${winnerScore.toFixed(1)}. Your score: ${you.score.toFixed(1)} (${you.score >= winnerScore - 5 ? 'so close!' : 'something to aim for next time'}).</p>
            <p class="applause">👏👏</p>
            <button class="btn primary" data-c="next">Cheer for ${U.esc(w.short)} and continue</button>`;
          bind(r, { next });
        }
      }, 1400);
    }

    function outro() {
      const el = stage(`<div class="center">
        <div class="castle">🎆</div>
        <h1>That's a wrap!</h1>
        ${IS.ui.speakerHtml('rosa', wins.length
          ? `Congratulations to all of our winners, and to ${st().player.name} for taking home ${wins.length} award${wins.length > 1 ? 's' : ''}!`
          : `Congratulations to all our winners, and thank you ${st().player.name} for an amazing summer. Every one of you should be proud.`)}
        <div class="row" style="justify-content:center;margin:14px 0">${wins.map((c) => { const a = IS.awards.byId(c.id); return `<span class="pill gold">${a.icon} ${a.name}</span>`; }).join('') || '<span class="muted">No trophies this time, but plenty of experience.</span>'}</div>
        <button class="btn gold big" data-c="done">Continue to the farewell party 🎈</button></div>`);
      bind(el, { done: () => { closeStage(); done(); } });
    }

    intro();
  }

  return { honor, finals };
})();
