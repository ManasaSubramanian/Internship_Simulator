// Internship 7: Front-End Web (HTML/CSS/JS), Guest App Engineering.
// Tasks are real pages rendered in an iframe and checked through the DOM.
(function () {
  const W = IS.runners && IS.runners.web ? IS.runners.web.wait : (ms) => new Promise((r) => setTimeout(r, ms));
  const txt = (el) => (el ? el.textContent.replace(/\s+/g, ' ').trim() : '');
  const $ = (doc, s) => doc.querySelector(s);
  const $$ = (doc, s) => Array.from(doc.querySelectorAll(s));
  const shown = (el) => !!el && !el.hidden && el.style.display !== 'none' && !el.closest('[hidden]');
  function labelFor(doc, input) {
    if (!input) return null;
    if (input.id && $(doc, `label[for="${input.id}"]`)) return $(doc, `label[for="${input.id}"]`);
    return input.closest('label');
  }
  const key = (win, el, k) => el.dispatchEvent(new win.KeyboardEvent('keydown', { key: k, bubbles: true }));
  const typeInto = (win, el, v) => { el.value = v; el.dispatchEvent(new win.Event('input', { bubbles: true })); };
  function lum(hex) {
    const n = parseInt(hex.replace('#', '').replace(/^(.)(.)(.)$/, '$1$1$2$2$3$3'), 16);
    const c = [(n >> 16) & 255, (n >> 8) & 255, n & 255].map((v) => { v /= 255; return v <= 0.03928 ? v / 12.92 : Math.pow((v + 0.055) / 1.055, 2.4); });
    return 0.2126 * c[0] + 0.7152 * c[1] + 0.0722 * c[2];
  }
  const contrast = (a, b) => { const x = lum(a); const y = lum(b); return (Math.max(x, y) + 0.05) / (Math.min(x, y) + 0.05); };
  function ruleColors(doc, sel) {
    const css = $$(doc, 'style').map((s) => s.textContent).join('\n');
    const m = css.match(new RegExp(sel.replace('.', '\\.') + '\\s*\\{([^}]*)\\}'));
    if (!m) return null;
    const color = (m[1].match(/(?:^|;|\s)color\s*:\s*(#[0-9a-fA-F]{3,6})/) || [])[1];
    const bg = (m[1].match(/background(?:-color)?\s*:\s*(#[0-9a-fA-F]{3,6})/) || [])[1];
    return color && bg ? { color, bg } : null;
  }
  const page = (body, head) => `<!doctype html>\n<html>\n<head>\n  <meta charset="utf-8">\n  <title>Guest App</title>\n${head || ''}</head>\n<body>\n${body}\n</body>\n</html>\n`;

  IS.addCharacters({
    claire: {
      name: 'Claire Dubois', title: 'Manager, Guest App Engineering', role: 'Manager',
      bio: 'Claire\'s app is in millions of guests\' pockets. She tests every release with a screen reader and a cracked phone.',
      look: { skin: '#f1d0b5', hair: 'bob', hairColor: '#4a2e1c', eyes: '#5a3a22', top: 'button', topColor: '#c2593f', bottom: 'pants', bottomColor: '#2b2622', shoes: 'flats', accessory: 'glasses' },
      chat: ['If it doesn\'t work with a keyboard, it doesn\'t work.', 'Guests use our app in the sun, one-handed, holding a churro. Design for that.', 'Security bugs in the front end are still security bugs.'],
    },
    ayo: {
      name: 'Ayo Balogun', title: 'Senior Front-End Engineer (your mentor)', role: 'Mentor',
      bio: 'Ayo has shipped web apps since tables were used for layout. Now evangelizes semantic HTML to anyone who will listen.',
      look: { skin: '#6b4029', hair: 'short', hairColor: '#1c1714', eyes: '#3b2618', facial: 'beard', top: 'varsity', topColor: '#3e6b48', bottom: 'pants', bottomColor: '#2b2622', shoes: 'sneakers' },
      chat: ['Use a <button> for buttons. I will say this until I retire.', 'textContent for text, innerHTML for trouble.', 'The best JavaScript is the JavaScript you didn\'t need to write.'],
    },
    bea: {
      name: 'Bea Lindgren', title: 'Front-End Intern', role: 'Intern', reliability: 0.9,
      bio: 'Pixel-perfect and patient. Tests every page at 200% zoom.',
      look: { skin: '#f8e1cf', hair: 'long', hairColor: '#e3cf9c', eyes: '#6b6f5c', top: 'sweater', topColor: '#d99a2b', bottom: 'skirt', bottomColor: '#5a4636', shoes: 'boots' },
      chat: ['I turned on a screen reader for the first time and immediately found five bugs.'],
    },
    jin: {
      name: 'Jin Park', title: 'Web Engineering Intern', role: 'Intern', reliability: 0.6,
      bio: 'Knows every new framework. Occasionally forgets the old deadline.',
      look: { skin: '#e7bf9c', hair: 'curly', hairColor: '#1c1714', eyes: '#3b2618', top: 'hoodie', topColor: '#6b3a2e', bottom: 'pants', bottomColor: '#2b2622', shoes: 'sneakers', accessory: 'headphones' },
      chat: ['What if we rewrote the whole app in a framework that came out yesterday?'],
    },
    selin: {
      name: 'Selin Aydın', title: 'Accessibility Engineering Intern', role: 'Intern', reliability: 0.95,
      bio: 'Accessibility specialist who can recite WCAG success criteria by number.',
      look: { skin: '#d9a57c', hair: 'wavy', hairColor: '#2f2019', eyes: '#3b2618', top: 'blazer', topColor: '#6f8f5e', bottom: 'pants', bottomColor: '#2b2622', shoes: 'loafers', accessory2: 'earrings' },
      chat: ['WCAG 1.4.3: contrast minimum 4.5 to 1. I have it on a mug.'],
    },
    hugo: {
      name: 'Hugo Fontaine', title: 'Mobile QA Intern', role: 'Intern', reliability: 0.7,
      bio: 'Owns forty phones, most of them older than he is. Breaks everything, lovingly.',
      look: { skin: '#c68b5f', hair: 'buzz', hairColor: '#2f2019', eyes: '#3b2618', facial: 'stubble', top: 'tee', topColor: '#8a6d4b', bottom: 'shorts', bottomColor: '#4b5a3a', shoes: 'sneakers', hat: 'cap' },
      chat: ['I tested on a phone from 2016. It cried, but it loaded.'],
    },
  });

  const webTask = (o) => Object.assign({ type: 'web', kind: 'individual', category: 'Coding' }, o);

  IS.registerTrack({
    id: 'web', n: 7, icon: '🌐', lang: 'web', langLabel: 'HTML / CSS / JS', rate: 36,
    title: 'Front-End Engineering Intern', team: 'Guest App Engineering',
    blurb: 'Build the web side of the guest app: semantic HTML, accessible forms and dialogs, DOM scripting, and front-end security. Every page is rendered and checked like a real browser test.',
    skills: ['Semantic HTML', 'Accessibility (WCAG)', 'DOM & events', 'Front-end security'],
    channel: 'guest-app', lab: { name: 'Device Lab', art: 'web' },
    cast: { manager: 'claire', mentor: 'ayo', interns: ['bea', 'jin', 'selin', 'hugo'] },
    groups: { g1: { name: 'Wait Board Web Widget', members: ['bea', 'jin'] }, g2: { name: 'Guest App Booking Flow', members: ['selin', 'hugo'] } },
    incident: 'Guests tapping "Pay" twice on slow phones are being charged twice.',
    scenario: { conflictA: 'a live demo on real phones', conflictB: 'a clickable prototype video', delay: 'the booking API isn\'t deployed to staging yet', delayFix: 'a mock API with sample responses' },
    tasks: [
      {
        id: 'q1', type: 'quiz', title: 'Guest Accessibility Standards', from: 'rosa', day: 1, due: { day: 1, minute: 180 }, effort: 20, kind: 'individual', category: 'Training',
        brief: '<p>Everything in the guest app must be usable by every guest. Pass the accessibility standards check (80%+).</p>',
        hints: ['Keyboard access, text alternatives, contrast, labels.'],
        wiki: '<b>WCAG essentials:</b> text alternatives, 4.5:1 contrast, keyboard operability, visible focus, labeled form controls.',
        peer: { who: 'selin', text: 'Every answer here is on my mug. Just saying.' },
        questions: [
          { q: 'A clickable <div> with an onclick handler is a problem because:', options: ['It is slower', 'Keyboard and screen-reader users can\'t use it like a real button', 'Divs can\'t be clicked', 'It is fine'], answer: 1 },
          { q: 'Placeholder text in an input is:', options: ['A fine replacement for a label', 'Not a label, because it disappears when typing and is often low contrast', 'Required by law', 'Only for passwords'], answer: 1 },
          { q: 'Minimum contrast for normal body text (WCAG AA):', options: ['2:1', '3:1', '4.5:1', '7:1 only'], answer: 2 },
          { q: 'A decorative background image should have:', options: ['Detailed alt text', 'alt="" (empty) so screen readers skip it', 'No alt attribute at all', 'The file name as alt'], answer: 1 },
          { q: 'A modal dialog should:', options: ['Trap nothing', 'Be announced as a dialog and closable with Escape', 'Only close by reloading', 'Hide the close button'], answer: 1 },
        ],
      },
      IS.T.intro({ channel: 'guest-app', team: 'Guest App Engineering', teamKey: 'front-end' }),
      webTask({
        id: 'h1', title: 'Semantic Wait Time Card', from: 'mentor', day: 2, due: { day: 3, minute: 180 }, effort: 60,
        brief: '<p>Rebuild this "div soup" card with semantic HTML. It needs a <code>&lt;main&gt;</code> containing: an <code>&lt;h2&gt;</code> "Galaxy Coaster", a <code>&lt;p class="wait"&gt;</code> with "25 min", a real <code>&lt;button&gt;</code> "Join Virtual Queue", and the image with meaningful <code>alt</code> text.</p>',
        starter: page('  <div class="title">Galaxy Coaster</div>\n  <div>25 min</div>\n  <div class="btn">Join Virtual Queue</div>\n  <img src="coaster.png">'),
        checks: [
          { label: 'An <h2> says "Galaxy Coaster"', fn: (d) => txt($(d, 'h2')) === 'Galaxy Coaster' },
          { label: 'A <p class="wait"> shows 25 min', fn: (d) => /25\s*min/.test(txt($(d, 'p.wait'))) },
          { label: 'A real <button> says "Join Virtual Queue"', fn: (d) => $$(d, 'button').some((b) => txt(b) === 'Join Virtual Queue') },
          { label: 'The image has meaningful alt text', hidden: true, fn: (d) => { const i = $(d, 'img'); return !!i && (i.getAttribute('alt') || '').trim().length > 5; } },
          { label: 'Content is inside <main>', hidden: true, fn: (d) => !!$(d, 'main h2') && !!$(d, 'main button') },
        ],
        hints: ['<main><h2>…</h2><p class="wait">25 min</p><button type="button">…</button></main>', 'alt should describe the image: "Galaxy Coaster rocket car climbing the lift hill".'],
        wiki: '<b>Semantic HTML:</b> headings for structure, buttons for actions, alt text for images, landmarks like main.',
        peer: { who: 'bea', text: 'Screen readers let people jump between headings. Divs are invisible to that.' },
      }),
      webTask({
        id: 'h2', title: 'Accessible Signup Form', from: 'manager', day: 3, due: { day: 4, minute: 180 }, effort: 60,
        brief: '<p>Build the "Park Updates" signup form: a <b>name</b> field and an <b>email</b> field (<code>type="email"</code>), each with a visible <code>&lt;label&gt;</code> linked to it, both <code>required</code>, and a submit <code>&lt;button type="submit"&gt;</code>, all inside a <code>&lt;form&gt;</code>.</p>',
        starter: page('  <h1>Park Updates</h1>\n  <input placeholder="Name">\n  <input placeholder="Email">\n  <div>Sign up</div>'),
        checks: [
          { label: 'A <form> exists', fn: (d) => !!$(d, 'form') },
          { label: 'An email input (type="email") has a linked label', fn: (d) => { const i = $(d, 'form input[type="email"]'); return !!labelFor(d, i); } },
          { label: 'A name input has a linked label', fn: (d) => $$(d, 'form input:not([type="email"])').some((i) => /name/i.test(txt(labelFor(d, i)))) },
          { label: 'Both inputs are required', hidden: true, fn: (d) => { const ins = $$(d, 'form input'); return ins.length >= 2 && ins.every((i) => i.required); } },
          { label: 'A submit button', hidden: true, fn: (d) => !!$(d, 'form button[type="submit"]') || !!$(d, 'form input[type="submit"]') },
        ],
        hints: ['<label for="email">Email</label> <input id="email" type="email" required>', 'The label\'s for must match the input\'s id.'],
        wiki: '<b>Forms:</b> every input needs a programmatic label; type="email" gives mobile keyboards an @ key.',
        peer: { who: 'selin', text: 'Placeholders are not labels. They vanish when you type!' },
      }),
      {
        id: 'r1', type: 'review', title: 'Code Review: Ticket Promo Page', from: 'mentor', day: 3, due: { day: 5, minute: 120 }, effort: 40, kind: 'individual', category: 'Code Review',
        brief: '<p>Review this promo page snippet before it ships to millions of guests.</p>',
        code: `<div class="btn" onclick="buy()">Buy tickets</div>
<img src="castle.jpg">
<input placeholder="Email">
<script>
  const name = location.hash.slice(1);
  document.getElementById('greeting').innerHTML = 'Hi ' + name;
</script>`,
        issues: [
          { text: 'A div with onclick isn\'t focusable or announced as a button. Use a <button>.', real: true },
          { text: 'The image has no alt text.', real: true },
          { text: 'The email input has no label (placeholder isn\'t a label).', real: true },
          { text: 'innerHTML with data from the URL is an XSS hole. Use textContent.', real: true },
          { text: 'Scripts are only allowed inside <head>.', real: false },
          { text: 'IDs cannot contain lowercase letters.', real: false },
          { text: 'Inline styles would make this faster.', real: false },
        ],
        keywords: ['button', 'keyboard', 'alt', 'label', 'xss', 'innerhtml', 'textcontent', 'inject'],
        hints: ['Try navigating with only the Tab key.', 'What if the URL is #<img src=x onerror=alert(1)>?'],
        wiki: '<b>Front-end security:</b> never put untrusted data into innerHTML.',
        peer: { who: 'hugo', text: 'I opened it with a screen reader. It said "clickable clickable image." That\'s it.' },
      },
      IS.T.standup({ day: 4, terms: ['html', 'form', 'label', 'review', 'accessib', 'button'] }),
      webTask({
        id: 'h3', bugfix: true, title: 'Bug Fix: Open/Closed Toggle Does Nothing', from: 'manager', day: 4, due: { day: 5, minute: 180 }, effort: 45,
        brief: '<p>🐞 <b>APP-301:</b> The ride status toggle for cast members does nothing. Fix the script: clicking <code>#toggle</code> should switch <code>#status</code> between "Open" and "Closed" and set the button\'s <code>aria-pressed</code> to "true" when closed, "false" when open.</p>',
        starter: page('  <main>\n    <p>Status: <span id="status">Open</span></p>\n    <button id="toggle" type="button" aria-pressed="false">Toggle</button>\n  </main>\n  <script>\n    const btn = document.getElementById(\'toggle\');\n    const status = document.getElementById(\'status\');\n    btn.addEventListner(\'click\', () => {\n      status.innerHTML = status.textContent === \'Open\' ? \'Closed\' : \'Open\';\n    });\n  </script>'),
        checks: [
          { label: 'Starts as "Open"', fn: (d) => txt($(d, '#status')) === 'Open' },
          { label: 'One click → "Closed" and aria-pressed="true"', fn: (d) => { $(d, '#toggle').click(); return txt($(d, '#status')) === 'Closed' && $(d, '#toggle').getAttribute('aria-pressed') === 'true'; } },
          { label: 'Second click → "Open" and aria-pressed="false"', fn: (d) => { $(d, '#toggle').click(); return txt($(d, '#status')) === 'Open' && $(d, '#toggle').getAttribute('aria-pressed') === 'false'; } },
        ],
        hints: ['Look very closely at addEventListner.', 'Use textContent to set text, and setAttribute(\'aria-pressed\', …).'],
        wiki: '<b>DOM:</b> typos in method names throw TypeErrors. Check the browser console first.',
        peer: { who: 'jin', text: 'The console literally says "addEventListner is not a function." Read the console!' },
      }),
      IS.T.designDoc({ id: 'w-design1', title: 'Wait Board Web Widget', day: 6, due: { day: 8, minute: 120 }, group: 'g1',
        brief: 'Your team builds an embeddable widget that lists open rides by wait time on park web pages.',
        terms: ['render', 'list', 'sort', 'accessib', 'refresh', 'api', 'closed'], termsNeeded: 4 }),
      webTask({
        id: 'h4', kind: 'group', group: 'g1', title: 'Wait Board: Render the List', from: 'manager', day: 6, due: { day: 8, minute: 180 }, effort: 75,
        brief: '<p>Your part of the widget. Using the <code>rides</code> array in the script, render one <code>&lt;li&gt;</code> per <b>open</b> ride into <code>&lt;ul id="board"&gt;</code>, sorted by wait (shortest first), with text exactly like <code>Sky Tram — 10 min</code>.</p>',
        starter: page('  <main>\n    <h1>Wait Times</h1>\n    <ul id="board"></ul>\n  </main>\n  <script>\n    const rides = [\n      { name: \'Galaxy Coaster\', wait: 45, open: true },\n      { name: \'Sky Tram\', wait: 10, open: true },\n      { name: \'Haunted Manor\', wait: 30, open: false },\n      { name: \'River Rapids\', wait: 25, open: true },\n    ];\n    // TODO: render open rides, shortest wait first\n  </script>'),
        checks: [
          { label: 'Three <li> items (closed ride excluded)', fn: (d) => $$(d, '#board li').length === 3 },
          { label: 'Sorted by wait, formatted "Name — N min"', fn: (d) => $$(d, '#board li').map(txt).join('|') === 'Sky Tram — 10 min|River Rapids — 25 min|Galaxy Coaster — 45 min' },
          { label: 'Uses textContent / createElement (no HTML strings)', hidden: true, fn: (d) => !/innerHTML/.test($$(d, 'script').map((s) => s.textContent).join('')) },
        ],
        hints: ['rides.filter(r => r.open).sort((a, b) => a.wait - b.wait)', 'const li = document.createElement(\'li\'); li.textContent = `${r.name} — ${r.wait} min`;', 'board.appendChild(li)'],
        wiki: '<b>DOM:</b> createElement + textContent + appendChild is the safe way to render data.',
        peer: { who: 'bea', text: 'Copy the em dash — exactly. The checks compare text.' },
      }),
      webTask({
        id: 'h5', title: 'Fix the Low-Contrast Notice', from: 'mentor', day: 7, due: { day: 9, minute: 120 }, effort: 45,
        brief: '<p>The <code>.notice</code> banner uses light gray text on a light gray background. Change its CSS <code>color</code> and <code>background</code> (hex values) so the contrast ratio is at least <b>4.5:1</b>. Keep the notice visible and keep its text.</p>',
        starter: page('  <main>\n    <p class="notice">Fireworks start at 9:00 PM tonight!</p>\n  </main>', '  <style>\n    .notice { color: #aaaaaa; background: #dddddd; padding: 12px; }\n  </style>\n'),
        checks: [
          { label: '.notice still shows the fireworks text', fn: (d) => /Fireworks start at 9:00 PM/.test(txt($(d, '.notice'))) },
          { label: '.notice defines hex color and background', fn: (d) => !!ruleColors(d, '.notice') },
          { label: 'Contrast ratio ≥ 4.5:1', fn: (d) => { const c = ruleColors(d, '.notice'); return !!c && contrast(c.color, c.bg) >= 4.5; } },
        ],
        hints: ['Dark text on a light background: color: #2a211b; background: #fbf6ee;', 'WebAIM\'s contrast formula compares relative luminance.'],
        wiki: '<b>WCAG 1.4.3:</b> 4.5:1 for normal text, 3:1 for large text.',
        peer: { who: 'selin', text: '#aaa on #ddd is about 1.6:1. Basically invisible in sunlight.' },
      }),
      {
        id: 'q2', type: 'quiz', title: 'Web Fundamentals', from: 'mentor', day: 8, due: { day: 8, minute: 180 }, effort: 20, kind: 'individual', category: 'Training',
        brief: '<p>Ayo\'s web fundamentals check.</p>',
        hints: ['textContent vs innerHTML; event bubbling; HTTP codes.'],
        wiki: '<b>Web basics:</b> the DOM is a tree; events bubble up; 4xx = client error, 5xx = server error.',
        peer: { who: 'jin', text: 'The event delegation question is fun.' },
        questions: [
          { q: 'Which is safe for inserting untrusted text?', options: ['innerHTML', 'textContent', 'document.write', 'outerHTML'], answer: 1 },
          { q: 'HTTP 404 means:', options: ['Server error', 'Not found', 'OK', 'Redirect'], answer: 1 },
          { q: 'Event delegation means:', options: ['One listener on a parent handles events from many children', 'Deleting events', 'Only using onclick', 'A CSS feature'], answer: 0 },
          { q: 'Which element is best for navigation links?', options: ['<div>', '<nav>', '<span>', '<b>'], answer: 1 },
          { q: 'In the CSS box model, padding is:', options: ['Outside the border', 'Between content and border', 'The border itself', 'Margin'], answer: 1 },
        ],
      },
      IS.T.groupDemo({ day: 8, due: { day: 10, minute: 150 }, project: 'Wait Board Web Widget', terms: ['render', 'sort', 'open', 'wait', 'accessib', 'list'],
        failQ: 'What happens if the wait-time API fails in the guest\'s browser?', failBest: 'The widget keeps the last list with an "updated 5 min ago" note, and retries in the background without freezing the page.' }),
      IS.T.midpoint({ terms: ['html', 'accessib'] }),
      webTask({
        id: 'h6', title: 'Live Search Filter', from: 'mentor', day: 11, due: { day: 12, minute: 180 }, effort: 75,
        brief: '<p>Make <code>#search</code> filter the attraction list as the guest types: on each <code>input</code> event, hide every <code>li</code> whose text doesn\'t contain the query (case-insensitive) by setting its <code>hidden</code> property. An empty query shows everything.</p>',
        starter: page('  <main>\n    <label for="search">Search attractions</label>\n    <input id="search" type="search">\n    <ul id="list">\n      <li>Galaxy Coaster</li>\n      <li>Sky Tram</li>\n      <li>River Rapids</li>\n      <li>Castle Carousel</li>\n    </ul>\n  </main>\n  <script>\n    // TODO: filter as the guest types\n  </script>'),
        checks: [
          { label: 'Typing "ca" shows only Castle Carousel', fn: (d, w) => { typeInto(w, $(d, '#search'), 'ca'); return $$(d, '#list li').filter(shown).map(txt).join('|') === 'Castle Carousel'; } },
          { label: 'Case-insensitive: "SKY" shows Sky Tram', fn: (d, w) => { typeInto(w, $(d, '#search'), 'SKY'); return $$(d, '#list li').filter(shown).map(txt).join('|') === 'Sky Tram'; } },
          { label: 'Clearing the box shows all four', hidden: true, fn: (d, w) => { typeInto(w, $(d, '#search'), ''); return $$(d, '#list li').filter(shown).length === 4; } },
          { label: '"er" matches Galaxy Coaster and River Rapids', hidden: true, fn: (d, w) => { typeInto(w, $(d, '#search'), 'er'); return $$(d, '#list li').filter(shown).map(txt).join('|') === 'Galaxy Coaster|River Rapids'; } },
        ],
        hints: ['search.addEventListener(\'input\', () => { … })', 'li.hidden = !li.textContent.toLowerCase().includes(q)'],
        wiki: '<b>DOM:</b> the hidden property removes an element from the page and from screen readers.',
        peer: { who: 'bea', text: 'Lowercase both sides before comparing.' },
      }),
      webTask({
        id: 'h7', bugfix: true, title: 'Bug Fix: XSS in the Guest Greeting', from: 'manager', day: 12, due: { day: 13, minute: 180 }, effort: 45,
        brief: '<p>🐞 <b>SEC-114:</b> Security found that <code>greet(name)</code> renders guest names with innerHTML, so a crafted name runs code. Fix <code>greet</code> so <code>#greeting</code> shows <code>Welcome, NAME!</code> as plain text. Keep <code>greet</code> on <code>window</code>.</p>',
        starter: page('  <main>\n    <h1 id="greeting"></h1>\n  </main>\n  <script>\n    window.greet = function (name) {\n      document.getElementById(\'greeting\').innerHTML = \'Welcome, \' + name + \'!\';\n    };\n    greet(\'Guest\');\n  </script>'),
        checks: [
          { label: 'greet("Ada") shows "Welcome, Ada!"', fn: (d, w) => { w.greet('Ada'); return txt($(d, '#greeting')) === 'Welcome, Ada!'; } },
          { label: 'A malicious name does not create elements', fn: (d, w) => { w.greet('<img src=x onerror="window.hacked=1">'); return !$(d, '#greeting img') && txt($(d, '#greeting')).includes('<img'); } },
          { label: 'No innerHTML left in the script', hidden: true, fn: (d) => !/innerHTML/.test($$(d, 'script').map((s) => s.textContent).join('')) },
        ],
        hints: ['Replace innerHTML with textContent.'],
        wiki: '<b>XSS:</b> cross-site scripting runs attacker code in your guests\' browsers. textContent never parses HTML.',
        peer: { who: 'selin', text: 'One word change. Huge security win.' },
      }),
      IS.T.email({ day: 13, due: { day: 13, minute: 180 }, to: 'Theo Park', toTitle: 'Show Producer', subject: 'App Release Delay',
        brief: 'The XSS fix means the guest app release with the new parade page moves by one day.',
        terms: ['release', 'security', 'fix', 'test', 'date', 'sorry|apolog'] }),
      {
        id: 'r2', type: 'review', title: 'Code Review: Scroll Effects', from: 'intern3', day: 13, due: { day: 14, minute: 180 }, effort: 45, kind: 'individual', category: 'Code Review',
        brief: '<p>Selin asks you to review a scroll effect that also refreshes wait times.</p>',
        code: `window.addEventListener('scroll', () => {
  document.querySelectorAll('.ride').forEach((el) => {
    el.style.top = el.offsetTop + 1 + 'px';
  });
  fetch('/api/waits').then((r) => r.json()).then(render);
});`,
        issues: [
          { text: 'A network request fires on every scroll event, hundreds per second. Poll on an interval instead.', real: true },
          { text: 'Reading offsetTop and writing style.top inside the loop causes layout thrashing (jank).', real: true },
          { text: 'No throttling/debouncing of the scroll handler.', real: true },
          { text: 'No error handling on fetch, so failures are silently ignored.', real: true },
          { text: 'Arrow functions can\'t be event listeners.', real: false },
          { text: 'NodeList has no forEach method.', real: false },
          { text: 'fetch requires jQuery.', real: false },
        ],
        keywords: ['fetch', 'scroll', 'throttle', 'debounce', 'layout', 'thrash', 'error', 'catch', 'interval'],
        hints: ['How many times does a scroll event fire per second?', 'What happens when you read layout and write styles alternately?'],
        wiki: '<b>Performance:</b> batch DOM reads and writes; throttle scroll handlers; never fetch per frame.',
        peer: { who: 'hugo', text: 'My 2016 phone got hot enough to fry an egg on this page.' },
      },
      webTask({
        id: 'h8', optional: true, title: '⭐ Stretch: Keyboard-Accessible Switch', from: 'mentor', day: 14, due: { day: 17, minute: 180 }, effort: 60,
        brief: '<p><b>Optional stretch.</b> Make the custom <code>#notify</code> switch fully accessible: <code>role="switch"</code>, <code>tabindex="0"</code>, and <code>aria-checked</code> toggling between "true"/"false" on click, <b>Enter</b> and <b>Space</b>.</p>',
        starter: page('  <main>\n    <div id="notify" class="switch">Ride alerts</div>\n  </main>\n  <script>\n    // TODO\n  </script>'),
        checks: [
          { label: 'Has role="switch" and tabindex="0"', fn: (d) => $(d, '#notify').getAttribute('role') === 'switch' && $(d, '#notify').getAttribute('tabindex') === '0' },
          { label: 'Starts with aria-checked="false"', fn: (d) => $(d, '#notify').getAttribute('aria-checked') === 'false' },
          { label: 'Click toggles aria-checked', fn: (d) => { $(d, '#notify').click(); const ok = $(d, '#notify').getAttribute('aria-checked') === 'true'; $(d, '#notify').click(); return ok; } },
          { label: 'Enter and Space toggle it', hidden: true, fn: (d, w) => { const el = $(d, '#notify'); key(w, el, 'Enter'); const a = el.getAttribute('aria-checked'); key(w, el, ' '); return a === 'true' && el.getAttribute('aria-checked') === 'false'; } },
        ],
        hints: ['Set the attributes in HTML.', 'keydown: if (e.key === \'Enter\' || e.key === \' \') { e.preventDefault(); toggle(); }'],
        wiki: '<b>ARIA:</b> custom widgets need a role, focusability and keyboard support. Native elements get it for free.',
        peer: { who: 'selin', text: 'Or… use <button aria-pressed>. But the stretch asks for a switch!' },
      }),
      IS.T.designDoc({ id: 'w-design2', title: 'Guest App Booking Flow', day: 16, due: { day: 17, minute: 180 }, group: 'g2', minWords: 180, metrics: true,
        brief: 'The capstone: an accessible booking flow with a confirmation dialog, input validation and double-submit protection.',
        terms: ['dialog', 'validation', 'keyboard', 'screen reader', 'double', 'payment', 'mock api', 'mobile'], termsNeeded: 5 }),
      webTask({
        id: 'h9', kind: 'group', group: 'g2', title: 'Capstone: Accessible Confirmation Dialog', from: 'manager', day: 16, due: { day: 19, minute: 180 }, effort: 90,
        brief: '<p>Build the booking confirmation dialog: clicking <code>#open</code> shows <code>#dialog</code> (<code>role="dialog"</code>, <code>aria-modal="true"</code>, <code>aria-labelledby</code> pointing at its heading). <code>#close</code> or the <b>Escape</b> key hides it again. Start hidden.</p>',
        starter: page('  <main>\n    <button id="open" type="button">Book Dining</button>\n    <div id="dialog">\n      <h2 id="dlg-title">Confirm your reservation</h2>\n      <button id="close" type="button">Close</button>\n    </div>\n  </main>\n  <script>\n    // TODO\n  </script>'),
        checks: [
          { label: 'Dialog starts hidden', fn: (d) => !shown($(d, '#dialog')) },
          { label: 'Has role="dialog", aria-modal="true", aria-labelledby → heading', fn: (d) => { const g = $(d, '#dialog'); return g.getAttribute('role') === 'dialog' && g.getAttribute('aria-modal') === 'true' && !!d.getElementById(g.getAttribute('aria-labelledby') || '_'); } },
          { label: '#open shows it, #close hides it', fn: (d) => { $(d, '#open').click(); const a = shown($(d, '#dialog')); $(d, '#close').click(); return a && !shown($(d, '#dialog')); } },
          { label: 'Escape closes it', hidden: true, fn: (d, w) => { $(d, '#open').click(); key(w, d, 'Escape'); key(w, $(d, '#dialog'), 'Escape'); return !shown($(d, '#dialog')); } },
        ],
        hints: ['Add hidden to the dialog in HTML, then dialog.hidden = false / true.', 'document.addEventListener(\'keydown\', e => { if (e.key === \'Escape\') … })'],
        wiki: '<b>Dialogs:</b> announce with role="dialog", label it, and always allow Escape to close.',
        peer: { who: 'selin', text: 'aria-labelledby="dlg-title" connects the dialog to its heading.' },
      }),
      webTask({
        id: 'h10', kind: 'group', group: 'g2', title: 'Capstone: Party Size Validation', from: 'intern3', day: 18, due: { day: 20, minute: 180 }, effort: 75,
        brief: '<p>On every <code>input</code> event, validate <code>#party</code>: if the value is not a whole number from 1 to 12, put the message <code>Party size must be 1–12</code> in <code>#party-error</code>; otherwise clear it. The input must reference the message with <code>aria-describedby</code>, and the message element needs <code>aria-live="polite"</code>.</p>',
        starter: page('  <main>\n    <label for="party">Party size</label>\n    <input id="party" type="number">\n    <p id="party-error"></p>\n  </main>\n  <script>\n    // TODO\n  </script>'),
        checks: [
          { label: 'aria-describedby and aria-live are set', fn: (d) => $(d, '#party').getAttribute('aria-describedby') === 'party-error' && $(d, '#party-error').getAttribute('aria-live') === 'polite' },
          { label: '0 shows the error', fn: (d, w) => { typeInto(w, $(d, '#party'), '0'); return txt($(d, '#party-error')) === 'Party size must be 1–12'; } },
          { label: '4 clears the error', fn: (d, w) => { typeInto(w, $(d, '#party'), '4'); return txt($(d, '#party-error')) === ''; } },
          { label: '13 and 2.5 show the error', hidden: true, fn: (d, w) => { typeInto(w, $(d, '#party'), '13'); const a = txt($(d, '#party-error')) !== ''; typeInto(w, $(d, '#party'), '2.5'); return a && txt($(d, '#party-error')) !== ''; } },
        ],
        hints: ['const n = Number(input.value); const ok = Number.isInteger(n) && n >= 1 && n <= 12;', 'err.textContent = ok ? \'\' : \'Party size must be 1–12\';'],
        wiki: '<b>Validation:</b> live regions announce errors to screen-reader users as they appear.',
        peer: { who: 'hugo', text: 'Someone tried a party of 400 in testing. Probably a school trip.' },
      }),
      webTask({
        id: 'h11', urgent: true, bugfix: true, title: '🚨 URGENT: Double Charges on Pay', from: 'manager', day: 22, due: { day: 22, minute: 120 }, effort: 40,
        brief: '<p>🚨 <b>SEV-2:</b> On slow phones guests tap <b>Pay</b> twice and get charged twice. By <b>11:00 AM</b>, make <code>#pay</code> charge only once: after the first click, disable the button (and change its text to <code>Processing…</code>). <code>window.charge()</code> records each charge in <code>window.charges</code>.</p>',
        starter: page('  <main>\n    <button id="pay" type="button">Pay $129</button>\n  </main>\n  <script>\n    window.charges = 0;\n    window.charge = function () { window.charges += 1; };\n    document.getElementById(\'pay\').addEventListener(\'click\', () => {\n      window.charge();\n    });\n  </script>'),
        checks: [
          { label: 'Double click charges once', fn: (d, w) => { $(d, '#pay').click(); $(d, '#pay').click(); return w.charges === 1; } },
          { label: 'Button is disabled and says "Processing…"', fn: (d) => $(d, '#pay').disabled && txt($(d, '#pay')) === 'Processing…' },
        ],
        hints: ['In the handler: if (btn.disabled) return; btn.disabled = true; btn.textContent = \'Processing…\'; charge();'],
        wiki: '<b>Payments:</b> guard against double submission on the client AND use idempotency keys on the server.',
        peer: { who: 'hugo', text: 'Support has 40 tickets about double charges. Please hurry. 😬' },
      }),
      IS.T.postmortem({ title: 'Double Charges on Pay', day: 22, due: { day: 23, minute: 180 }, terms: ['double', 'click|tap', 'disabled', 'idempot', 'test', 'monitor|alert'] }),
      webTask({
        id: 'h12', kind: 'group', group: 'g2', title: 'Capstone: Friendly Wait Formatter', from: 'intern4', day: 24, due: { day: 26, minute: 180 }, effort: 60,
        brief: '<p>Add <code>window.formatWait(minutes)</code>: 0 → <code>Walk right on!</code>, 1 → <code>1 min</code>, under 60 → <code>N min</code>, 60 or more → <code>H hr</code> or <code>H hr M min</code> (e.g. 65 → <code>1 hr 5 min</code>, 120 → <code>2 hr</code>). Also render <code>formatWait(65)</code> into <code>#sample</code>.</p>',
        starter: page('  <main>\n    <p id="sample"></p>\n  </main>\n  <script>\n    // TODO: window.formatWait = function (minutes) { … };\n  </script>'),
        checks: [
          { label: '#sample shows "1 hr 5 min"', fn: (d) => txt($(d, '#sample')) === '1 hr 5 min' },
          { label: '0, 1 and 25 format correctly', fn: (d, w) => typeof w.formatWait === 'function' && w.formatWait(0) === 'Walk right on!' && w.formatWait(1) === '1 min' && w.formatWait(25) === '25 min' },
          { label: '60, 120 and 185 format correctly', hidden: true, fn: (d, w) => w.formatWait(60) === '1 hr' && w.formatWait(120) === '2 hr' && w.formatWait(185) === '3 hr 5 min' },
        ],
        hints: ['const h = Math.floor(m / 60), r = m % 60;', 'Build the string from parts: [h + \' hr\', r + \' min\'].'],
        wiki: '<b>UX writing:</b> "1 hr 5 min" reads faster than "65 minutes" at a glance.',
        peer: { who: 'bea', text: 'Singular vs plural isn\'t needed here: it\'s "min" and "hr" either way.' },
      }),
      IS.T.status({ day: 25, terms: ['capstone', 'payment', 'postmortem', 'dialog', 'accessib', 'demo'] }),
      IS.T.readme({ day: 26, due: { day: 28, minute: 180 }, project: 'Guest App Booking Flow', terms: ['dialog', 'validation', 'formatwait', 'accessib', 'mock api', 'browser'] }),
      IS.T.finalPres({ project: 'Guest App Booking Flow', terms: ['booking', 'dialog', 'accessib', 'keyboard', 'guest', 'payment', 'mobile'], questions: [
        { who: 'harriet', q: 'How does this change the experience for a guest using a screen reader?', options: [
          { text: 'Every step is announced: the dialog, the errors as they happen, and the payment status. A blind guest can book dinner alone, start to finish.', pts: 10 },
          { text: 'It looks nicer.', pts: 2 },
          { text: 'Screen reader users can call guest services.', pts: 0 },
          { text: 'We\'ll add that later.', pts: 1 }] },
        { who: 'harriet', q: 'How do you prevent charging guests twice?', options: [
          { text: 'The button disables on first tap, and the server uses an idempotency key, so even a retry can\'t double-charge.', pts: 10 },
          { text: 'We tell guests not to double-tap.', pts: 0 },
          { text: 'We refund later.', pts: 3 },
          { text: 'Faster servers.', pts: 2 }] },
        { who: 'manager', q: 'How did you test it?', options: [
          { text: 'Automated DOM tests for every interaction, keyboard-only walkthroughs, a screen reader, and Hugo\'s oldest phones.', pts: 10 },
          { text: 'I clicked around.', pts: 3 },
          { text: 'It works on my laptop.', pts: 1 },
          { text: 'QA will test it.', pts: 2 }] },
        { who: 'mentor', q: 'Why not use innerHTML to render faster?', options: [
          { text: 'textContent and createElement can\'t execute injected markup. The speed difference is negligible, but the security risk isn\'t.', pts: 10 },
          { text: 'innerHTML is deprecated.', pts: 2 },
          { text: 'We should use it.', pts: 0 },
          { text: 'It doesn\'t matter.', pts: 1 }] },
      ] }),
      IS.T.selfEval({ day: 30, due: { day: 31, minute: 180 }, terms: ['html', 'capstone', 'accessib', 'team', 'security', 'deadline'] }),
    ],
    interview: {
      coding: [
        { id: 'i-web1', type: 'web', title: 'Accessible Gallery',
          brief: '<p>Put the three images in an unordered list (<code>&lt;ul&gt;</code> with one <code>&lt;li&gt;</code> each) and give every image meaningful <code>alt</code> text.</p>',
          starter: page('  <main>\n    <img src="castle.jpg">\n    <img src="coaster.jpg">\n    <img src="parade.jpg">\n  </main>'),
          checks: [
            { label: 'Images are inside ul > li', fn: (d) => $$(d, 'ul > li img').length === 3 },
            { label: 'Every image has alt text', fn: (d) => $$(d, 'img').length === 3 && $$(d, 'img').every((i) => (i.getAttribute('alt') || '').trim().length > 3) },
          ] },
        { id: 'i-web2', type: 'web', title: 'Click Counter',
          brief: '<p>Clicking <code>#add</code> should increase the number in <code>#count</code> by 1 each time (it starts at 0).</p>',
          starter: page('  <main>\n    <p>Guests: <span id="count">0</span></p>\n    <button id="add" type="button">Add guest</button>\n  </main>\n  <script>\n  </script>'),
          checks: [
            { label: 'Three clicks → 3', fn: (d) => { $(d, '#add').click(); $(d, '#add').click(); $(d, '#add').click(); return txt($(d, '#count')) === '3'; } },
          ] },
        { id: 'i-web3', type: 'web', title: 'Labeled Input',
          brief: '<p>Give the phone input a visible label "Phone number" linked with <code>for</code>/<code>id</code>, and make it <code>type="tel"</code>.</p>',
          starter: page('  <main>\n    <input placeholder="Phone number">\n  </main>'),
          checks: [
            { label: 'type="tel"', fn: (d) => !!$(d, 'input[type="tel"]') },
            { label: 'Linked label says "Phone number"', fn: (d) => /phone number/i.test(txt(labelFor(d, $(d, 'input[type="tel"]')))) },
          ] },
      ],
      concepts: [
        { q: 'Which element should a clickable action use?', options: ['<div>', '<span>', '<button>', '<a> without href'], answer: 2 },
        { q: 'textContent vs innerHTML: which parses HTML?', options: ['textContent', 'innerHTML', 'Both', 'Neither'], answer: 1 },
        { q: 'What does event.preventDefault() do?', options: ['Stops the browser\'s default action', 'Deletes the event', 'Stops all JavaScript', 'Reloads the page'], answer: 0 },
        { q: 'aria-live="polite" is used to:', options: ['Style text', 'Announce dynamic changes to screen readers', 'Make text polite', 'Hide content'], answer: 1 },
        { q: 'Which CSS property controls text color?', options: ['background', 'color', 'font', 'fill'], answer: 1 },
        { q: 'const x = [1, 2, 3].filter(n => n > 1) gives:', options: ['[2, 3]', '[1]', '2', 'true'], answer: 0 },
        { q: 'What does HTTP status 500 mean?', options: ['Not found', 'Server error', 'Success', 'Unauthorized'], answer: 1 },
        { q: 'Why does alt text matter?', options: ['SEO only', 'Screen reader users need it to understand images', 'It makes images load faster', 'It doesn\'t'], answer: 1 },
      ],
    },
    training: {
      lessons: [
        { title: 'Semantic, accessible HTML', html: '<pre>&lt;main&gt;\n  &lt;h1&gt;Park Updates&lt;/h1&gt;\n  &lt;label for="email"&gt;Email&lt;/label&gt;\n  &lt;input id="email" type="email" required&gt;\n  &lt;button type="submit"&gt;Sign up&lt;/button&gt;\n&lt;/main&gt;</pre><p>Real elements give you keyboard support and screen-reader names for free.</p>' },
        { title: 'DOM scripting', html: '<pre>const btn = document.getElementById(\'add\');\nbtn.addEventListener(\'click\', () =&gt; {\n  count.textContent = Number(count.textContent) + 1;\n});</pre>' },
        { title: 'Security & state', html: '<p>Use <code>textContent</code> for data, never <code>innerHTML</code>. Disable buttons during async work. Validate on input and announce errors with <code>aria-live</code>.</p>' },
      ],
    },
  });
})();
