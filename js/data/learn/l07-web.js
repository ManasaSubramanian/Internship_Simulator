// Learning Center: web pages from zero (internship 7). Practice pages are
// rendered in a sandboxed frame and checked through the DOM.
(function () {
  IS.learnData = IS.learnData || {};
  const txt = (el) => (el ? el.textContent.replace(/\s+/g, ' ').trim() : '');
  const $ = (d, s) => d.querySelector(s);
  const $$ = (d, s) => Array.from(d.querySelectorAll(s));
  const shown = (el) => !!el && !el.hidden && el.style.display !== 'none';
  // Value of a CSS property inside a <style> rule for exactly this selector.
  function decl(d, sel, prop) {
    const css = $$(d, 'style').map((s) => s.textContent).join('\n');
    const esc = sel.replace(/[.#]/g, '\\$&');
    const m = css.match(new RegExp('(^|[}\\s])' + esc + '\\s*\\{([^}]*)\\}'));
    if (!m) return null;
    const v = m[2].match(new RegExp('(^|;|\\s)' + prop + '\\s*:\\s*([^;]+)'));
    return v ? v[2].trim().toLowerCase() : null;
  }
  const page = (body, head) => `<!doctype html>\n<html lang="en">\n<head>\n  <meta charset="utf-8">\n  <title>Practice</title>\n${head || ''}</head>\n<body>\n${body}\n</body>\n</html>\n`;
  const web = (o) => Object.assign({ type: 'web' }, o);

  IS.learnData.web = [
    {
      id: 'html', icon: '🧱', title: 'HTML: the structure of a page',
      summary: 'Every web page is built from HTML elements: headings, paragraphs, lists, links and images.',
      tags: ['html', 'element', 'tag', 'heading', 'paragraph', 'list', 'img', 'alt', 'semantic', 'main', 'button'],
      words: `<p>Web pages are made from three languages that work together: <b>HTML</b> (the structure and content), <b>CSS</b> (the look) and <b>JavaScript</b> (the behavior). HTML comes first.</p>
        <p>HTML is made of <b>elements</b>. Most have an opening <b>tag</b> and a closing tag with a slash, with content between: <code>&lt;h1&gt;Park Hours&lt;/h1&gt;</code>. Common ones:</p>
        <ul><li><code>&lt;h1&gt;</code> … <code>&lt;h6&gt;</code>: headings, biggest to smallest.</li>
        <li><code>&lt;p&gt;</code>: a paragraph.</li>
        <li><code>&lt;ul&gt;</code>: a bulleted list, with one <code>&lt;li&gt;</code> ("list item") per bullet.</li>
        <li><code>&lt;a href="map.html"&gt;Park map&lt;/a&gt;</code>: a link. <code>href</code> is an <b>attribute</b>, extra information inside the opening tag.</li>
        <li><code>&lt;img src="castle.png" alt="Castle at sunset"&gt;</code>: an image. It has no closing tag. The <code>alt</code> text describes it for people using screen readers.</li>
        <li><code>&lt;button&gt;</code>: something to click.</li></ul>
        <p>Elements <b>nest</b> inside each other like boxes in boxes: the <code>&lt;li&gt;</code>s go inside the <code>&lt;ul&gt;</code>. Using the element that matches the meaning (a real <code>&lt;button&gt;</code>, a real heading) is called <b>semantic HTML</b>. It makes pages work with keyboards and screen readers.</p>
        <div class="analogy">🏠 <b>Like the frame of a house:</b> HTML is the walls and rooms, CSS is the paint and furniture, and JavaScript is the electricity that makes things happen.</div>`,
      terms: [['element', 'A piece of a page: <code>&lt;p&gt;text&lt;/p&gt;</code>.'], ['tag', 'The <code>&lt;p&gt;</code> and <code>&lt;/p&gt;</code> markers.'], ['attribute', 'Extra info in a tag: <code>href="…"</code>, <code>alt="…"</code>.'], ['alt text', 'A description of an image for people who can\'t see it.']],
      example: {
        lang: 'html',
        code: `<main>
  <h1>Park Hours</h1>
  <p>Open daily, 9 AM to 10 PM.</p>
  <ul>
    <li>Sky Tram</li>
    <li>Galaxy Coaster</li>
  </ul>
  <a href="map.html">See the park map</a>
</main>`,
        steps: [
          { lines: [1, 9], text: '<code>&lt;main&gt;</code> wraps the page\'s main content. Everything else is nested inside it.' },
          { lines: [2], text: 'The biggest heading: the page title a visitor sees first.' },
          { lines: [3], text: 'A paragraph of normal text.' },
          { lines: [4, 5, 6, 7], text: 'A bulleted list with two items. Each <code>&lt;li&gt;</code> is nested inside the <code>&lt;ul&gt;</code>.' },
          { lines: [8], text: 'A link. Clicking the words "See the park map" opens <code>map.html</code>.' },
        ],
      },
      practice: [
        web({ id: 'L-web-first', title: 'Your first page',
          brief: '<p>Inside <code>&lt;body&gt;</code>, add an <code>&lt;h1&gt;</code> that says <b>Park Hours</b> and a <code>&lt;p&gt;</code> that includes the text <b>9 AM</b>.</p>',
          starter: page('  <!-- add your heading and paragraph here -->'),
          checks: [
            { label: 'An <h1> says "Park Hours"', fn: (d) => txt($(d, 'h1')) === 'Park Hours' },
            { label: 'A <p> mentions 9 AM', fn: (d) => $$(d, 'p').some((p) => /9 AM/.test(txt(p))) },
          ],
          hint: '<code>&lt;h1&gt;Park Hours&lt;/h1&gt;</code> and <code>&lt;p&gt;We open at 9 AM.&lt;/p&gt;</code>',
          solution: page('  <h1>Park Hours</h1>\n  <p>We open at 9 AM every day.</p>') }),
        web({ id: 'L-web-list', title: 'A list of rides',
          brief: '<p>Add a bulleted list (<code>&lt;ul&gt;</code>) with exactly three items: <b>Sky Tram</b>, <b>Galaxy Coaster</b> and <b>River Rapids</b>.</p>',
          starter: page('  <h1>Rides</h1>'),
          checks: [
            { label: 'A <ul> with exactly 3 <li> items', fn: (d) => $$(d, 'ul > li').length === 3 },
            { label: 'The items are the three rides', fn: (d) => $$(d, 'ul > li').map(txt).sort().join('|') === 'Galaxy Coaster|River Rapids|Sky Tram' },
          ],
          hint: '<code>&lt;ul&gt;&lt;li&gt;Sky Tram&lt;/li&gt; … &lt;/ul&gt;</code>. Each ride gets its own <code>&lt;li&gt;</code>.',
          solution: page('  <h1>Rides</h1>\n  <ul>\n    <li>Sky Tram</li>\n    <li>Galaxy Coaster</li>\n    <li>River Rapids</li>\n  </ul>') }),
        web({ id: 'L-web-linkimg', title: 'A link and a described image',
          brief: '<p>Add a link to <code>map.html</code> with the text <b>Park map</b>, and an image with <code>src="castle.png"</code> and meaningful <code>alt</code> text (at least a few words).</p>',
          starter: page('  <h1>Welcome</h1>\n  <img src="castle.png">'),
          checks: [
            { label: 'A link to map.html says "Park map"', fn: (d) => $$(d, 'a').some((a) => a.getAttribute('href') === 'map.html' && txt(a) === 'Park map') },
            { label: 'The castle image has alt text', fn: (d) => { const i = $(d, 'img[src="castle.png"]'); return !!i && (i.getAttribute('alt') || '').trim().length >= 8; } },
          ],
          hint: '<code>&lt;a href="map.html"&gt;Park map&lt;/a&gt;</code> and <code>&lt;img src="castle.png" alt="The castle lit up at night"&gt;</code>',
          solution: page('  <h1>Welcome</h1>\n  <img src="castle.png" alt="The castle lit up at night">\n  <a href="map.html">Park map</a>') }),
      ],
    },
    {
      id: 'css', icon: '🎨', title: 'CSS: making it look good',
      summary: 'Pick elements with selectors and give them colors, sizes and spacing.',
      tags: ['css', 'style', 'selector', 'class', 'color', 'background', 'font', 'contrast'],
      words: `<p><b>CSS</b> describes how HTML looks. You write <b>rules</b>, usually inside a <code>&lt;style&gt;</code> element in the page\'s <code>&lt;head&gt;</code>. A rule has a <b>selector</b> (which elements) and <b>declarations</b> (what to change) inside curly braces:</p>
        <p><code>h1 { color: #c2593f; font-size: 32px; }</code></p>
        <p>Each declaration is <code>property: value;</code>. Three kinds of selectors cover most needs:</p>
        <ul><li><b>Element</b>: <code>h1</code> styles every <code>&lt;h1&gt;</code>.</li>
        <li><b>Class</b>: <code>.notice</code> (with a dot) styles every element with <code>class="notice"</code>. Many elements can share a class.</li>
        <li><b>ID</b>: <code>#title</code> (with a hash) styles the one element with <code>id="title"</code>.</li></ul>
        <p>Colors are often written as <b>hex codes</b> like <code>#c2593f</code>: a <code>#</code> and six characters (two each for red, green and blue). Always keep enough <b>contrast</b> between text and background so everyone can read it.</p>
        <div class="analogy">👗 <b>Like a dress code:</b> "everyone wears red" (element selector), "the band wears gold" (class), "the bride wears white" (id).</div>`,
      terms: [['rule', '<code>selector { property: value; }</code>'], ['selector', 'Which elements a rule applies to.'], ['class / .name', 'A reusable label; select it with a dot.'], ['id / #name', 'A unique label; select it with a hash.'], ['hex color', '<code>#rrggbb</code>, like <code>#c2593f</code>.']],
      example: {
        lang: 'html',
        code: `<style>
  h1 { color: #c2593f; }
  .notice { background: #f6e3bf; padding: 12px; }
</style>

<h1>Fireworks Tonight</h1>
<p class="notice">Show starts at 9:00 PM.</p>`,
        steps: [
          { lines: [1, 4], text: 'The <code>&lt;style&gt;</code> element holds the CSS rules.' },
          { lines: [2], text: 'Every <code>&lt;h1&gt;</code> gets a warm terracotta text color.' },
          { lines: [3], text: 'Anything with <code>class="notice"</code> gets a light gold background and 12 pixels of padding (space inside the box).' },
          { lines: [7], text: 'This paragraph has the class, so the <code>.notice</code> rule applies to it.' },
        ],
      },
      practice: [
        web({ id: 'L-web-color', title: 'Color the heading',
          brief: '<p>Add a CSS rule so every <code>h1</code> has <code>color: #c2593f</code>.</p>',
          starter: page('  <h1>Park News</h1>', '  <style>\n    /* your rule here */\n  </style>\n'),
          checks: [{ label: 'h1 { color: #c2593f }', fn: (d) => decl(d, 'h1', 'color') === '#c2593f' }],
          hint: 'Inside the style element: <code>h1 { color: #c2593f; }</code>',
          solution: page('  <h1>Park News</h1>', '  <style>\n    h1 { color: #c2593f; }\n  </style>\n') }),
        web({ id: 'L-web-class', title: 'Style a class',
          brief: '<p>Give the paragraph the class <code>notice</code>, and add a <code>.notice</code> rule that sets a <code>background</code> color.</p>',
          starter: page('  <p>Parade at 3 PM!</p>', '  <style>\n  </style>\n'),
          checks: [
            { label: 'The paragraph has class="notice"', fn: (d) => !!$(d, 'p.notice') },
            { label: '.notice sets a background', fn: (d) => !!(decl(d, '.notice', 'background') || decl(d, '.notice', 'background-color')) },
          ],
          hint: '<code>&lt;p class="notice"&gt;</code> and <code>.notice { background: #f6e3bf; }</code>',
          solution: page('  <p class="notice">Parade at 3 PM!</p>', '  <style>\n    .notice { background: #f6e3bf; }\n  </style>\n') }),
        web({ id: 'L-web-id', title: 'Size by id',
          brief: '<p>Give the heading <code>id="title"</code> and add a <code>#title</code> rule with <code>font-size: 32px</code>.</p>',
          starter: page('  <h1>Galaxy Coaster</h1>', '  <style>\n  </style>\n'),
          checks: [
            { label: 'The h1 has id="title"', fn: (d) => !!$(d, 'h1#title') },
            { label: '#title { font-size: 32px }', fn: (d) => decl(d, '#title', 'font-size') === '32px' },
          ],
          hint: '<code>&lt;h1 id="title"&gt;</code> and <code>#title { font-size: 32px; }</code>',
          solution: page('  <h1 id="title">Galaxy Coaster</h1>', '  <style>\n    #title { font-size: 32px; }\n  </style>\n') }),
      ],
    },
    {
      id: 'dom', icon: '🧩', title: 'JavaScript on the page: the DOM',
      summary: 'Use JavaScript to find elements on the page and change their text.',
      tags: ['dom', 'getelementbyid', 'queryselector', 'textcontent', 'createelement', 'appendchild', 'innerhtml', 'render'],
      words: `<p>When a browser loads HTML, it builds a tree of objects called the <b>DOM</b> (Document Object Model). JavaScript can read and change that tree, and the page updates instantly.</p>
        <p>Scripts go in a <code>&lt;script&gt;</code> element, usually at the end of the <code>&lt;body&gt;</code> so the elements above already exist. Key tools:</p>
        <ul><li><code>document.getElementById('status')</code>: find the element with <code>id="status"</code>.</li>
        <li><code>document.querySelector('.notice')</code>: find the first element matching a CSS selector. <code>querySelectorAll</code> finds all of them.</li>
        <li><code>el.textContent = 'Open'</code>: set the text inside an element.</li>
        <li><code>document.createElement('li')</code> makes a new element and <code>list.appendChild(li)</code> puts it on the page.</li>
        <li><code>el.hidden = true</code> hides an element.</li></ul>
        <p>Use <code>textContent</code> for text. <code>innerHTML</code> treats text as HTML, which lets attackers inject code if the text came from a user.</p>
        <div class="analogy">🎭 <b>Like a stage crew:</b> the HTML sets the stage, and JavaScript is the crew that can swap props, change signs and turn lights on and off during the show.</div>`,
      terms: [['DOM', 'The page as a tree of objects JavaScript can change.'], ['getElementById', 'Find one element by its id.'], ['textContent', 'The text inside an element (safe to set).'], ['createElement / appendChild', 'Make a new element / add it to the page.']],
      example: {
        lang: 'html',
        code: `<p>Status: <span id="status">Loading…</span></p>
<ul id="rides"></ul>
<script>
  document.getElementById('status').textContent = 'Open';
  const list = document.getElementById('rides');
  for (const name of ['Sky Tram', 'Galaxy Coaster']) {
    const li = document.createElement('li');
    li.textContent = name;
    list.appendChild(li);
  }
</script>`,
        steps: [
          { lines: [1, 2], text: 'The HTML: a status span that says "Loading…" and an empty list.' },
          { lines: [4], text: 'Find the span by id and replace its text with "Open".' },
          { lines: [5], text: 'Grab the empty list so we can add to it.' },
          { lines: [6, 7, 8, 9], text: 'For each ride name: create an <code>&lt;li&gt;</code>, set its text, and append it to the list.' },
        ],
      },
      practice: [
        web({ id: 'L-web-status', title: 'Update the status',
          brief: '<p>Use JavaScript to change the text of <code>#status</code> from "Loading…" to <b>Open</b>.</p>',
          starter: page('  <p>Status: <span id="status">Loading…</span></p>\n  <script>\n    // change the status text here\n  </script>'),
          checks: [{ label: '#status says "Open"', fn: (d) => txt($(d, '#status')) === 'Open' }],
          hint: '<code>document.getElementById(\'status\').textContent = \'Open\';</code>',
          solution: page('  <p>Status: <span id="status">Loading…</span></p>\n  <script>\n    document.getElementById(\'status\').textContent = \'Open\';\n  </script>') }),
        web({ id: 'L-web-render', title: 'Build a list from data',
          brief: '<p>Add one <code>&lt;li&gt;</code> to <code>#snacks</code> for each item in the <code>snacks</code> array, in order.</p>',
          starter: page('  <ul id="snacks"></ul>\n  <script>\n    const snacks = [\'Churro\', \'Pretzel\', \'Popcorn\'];\n    // add an li for each snack\n  </script>'),
          checks: [{ label: 'Three items: Churro, Pretzel, Popcorn', fn: (d) => $$(d, '#snacks li').map(txt).join('|') === 'Churro|Pretzel|Popcorn' }],
          hint: 'Loop over <code>snacks</code>; for each, <code>createElement(\'li\')</code>, set <code>textContent</code>, and <code>appendChild</code>.',
          solution: page('  <ul id="snacks"></ul>\n  <script>\n    const snacks = [\'Churro\', \'Pretzel\', \'Popcorn\'];\n    const list = document.getElementById(\'snacks\');\n    for (const s of snacks) {\n      const li = document.createElement(\'li\');\n      li.textContent = s;\n      list.appendChild(li);\n    }\n  </script>') }),
        web({ id: 'L-web-hide', title: 'Hide closed rides',
          brief: '<p>Each ride has <code>data-open="yes"</code> or <code>"no"</code>. Use JavaScript to hide (<code>hidden = true</code>) every <code>li</code> whose <code>data-open</code> is <code>"no"</code>.</p>',
          starter: page('  <ul>\n    <li data-open="yes">Sky Tram</li>\n    <li data-open="no">Haunted Manor</li>\n    <li data-open="yes">River Rapids</li>\n  </ul>\n  <script>\n    // hide the closed rides\n  </script>'),
          checks: [
            { label: 'Haunted Manor is hidden', fn: (d) => !shown($$(d, 'li').find((l) => txt(l) === 'Haunted Manor')) },
            { label: 'The open rides stay visible', fn: (d) => $$(d, 'li[data-open="yes"]').every(shown) },
          ],
          hint: '<code>document.querySelectorAll(\'li\').forEach((li) =&gt; { li.hidden = li.dataset.open === \'no\'; });</code>',
          solution: page('  <ul>\n    <li data-open="yes">Sky Tram</li>\n    <li data-open="no">Haunted Manor</li>\n    <li data-open="yes">River Rapids</li>\n  </ul>\n  <script>\n    document.querySelectorAll(\'li\').forEach((li) => {\n      li.hidden = li.dataset.open === \'no\';\n    });\n  </script>') }),
      ],
    },
    {
      id: 'events', icon: '👆', title: 'Events: reacting to clicks and typing',
      summary: 'Run code when the user clicks a button or types in a box.',
      tags: ['event', 'click', 'addeventlistener', 'input', 'toggle', 'button', 'keydown', 'aria-pressed'],
      words: `<p>Pages come alive when they react to people. The browser fires an <b>event</b> whenever something happens: a click, a key press, typing in a box, the page finishing loading.</p>
        <p>You <b>listen</b> for an event with <code>addEventListener</code>, giving it the event name and a function to run each time it happens:</p>
        <p><code>button.addEventListener('click', () =&gt; { … });</code></p>
        <p>Useful events: <code>'click'</code> for buttons, <code>'input'</code> fires every time the text in an input box changes (read it with <code>box.value</code>), <code>'keydown'</code> for key presses.</p>
        <p>Often the function updates a variable (the page\'s <b>state</b>, like a counter) and then updates the page to match.</p>
        <p>Avoid the old style <code>&lt;button onclick="…"&gt;</code> in HTML. Keeping behavior in the script is easier to maintain and safer.</p>
        <div class="analogy">🛎️ <b>Like a hotel front-desk bell:</b> you tell the clerk "whenever the bell rings, come help". The clerk doesn\'t stand there staring. They wait for the event.</div>`,
      terms: [['event', 'Something that happens: click, input, keydown…'], ['addEventListener', 'Run a function whenever an event happens.'], ['.value', 'The text inside an input box.'], ['state', 'Data your page remembers, like a count.']],
      example: {
        lang: 'html',
        code: `<button id="add" type="button">+1 guest</button>
<p>Guests: <span id="count">0</span></p>
<script>
  let count = 0;
  document.getElementById('add').addEventListener('click', () => {
    count = count + 1;
    document.getElementById('count').textContent = count;
  });
</script>`,
        steps: [
          { lines: [1, 2], text: 'A button and a place to show the count.' },
          { lines: [4], text: 'The state: a variable that remembers the count between clicks.' },
          { lines: [5], text: 'Listen for clicks on the button. The arrow function runs on every click.' },
          { lines: [6, 7], text: 'Add one, then show the new number on the page.' },
        ],
      },
      practice: [
        web({ id: 'L-web-counter', title: 'Guest counter',
          brief: '<p>Make each click on <code>#add</code> increase the number shown in <code>#count</code> by one.</p>',
          starter: page('  <button id="add" type="button">+1</button>\n  <p>Guests: <span id="count">0</span></p>\n  <script>\n    // listen for clicks here\n  </script>'),
          checks: [
            { label: 'Starts at 0', fn: (d) => txt($(d, '#count')) === '0' },
            { label: 'Two clicks → 2', fn: (d) => { $(d, '#add').click(); $(d, '#add').click(); return txt($(d, '#count')) === '2'; } },
          ],
          hint: 'Copy the example\'s pattern: a <code>let count = 0;</code> and a click listener that adds one and updates the text.',
          solution: page('  <button id="add" type="button">+1</button>\n  <p>Guests: <span id="count">0</span></p>\n  <script>\n    let count = 0;\n    document.getElementById(\'add\').addEventListener(\'click\', () => {\n      count = count + 1;\n      document.getElementById(\'count\').textContent = count;\n    });\n  </script>') }),
        web({ id: 'L-web-toggle', title: 'Open / closed switch',
          brief: '<p>Clicking <code>#toggle</code> should switch the text of <code>#status</code> between <b>Open</b> and <b>Closed</b>.</p>',
          starter: page('  <p>Ride is <span id="status">Open</span></p>\n  <button id="toggle" type="button">Switch</button>\n  <script>\n  </script>'),
          checks: [
            { label: 'One click → Closed', fn: (d) => { $(d, '#toggle').click(); return txt($(d, '#status')) === 'Closed'; } },
            { label: 'Another click → Open', fn: (d) => { $(d, '#toggle').click(); return txt($(d, '#status')) === 'Open'; } },
          ],
          hint: 'In the click handler: <code>status.textContent = status.textContent === \'Open\' ? \'Closed\' : \'Open\';</code> (the <code>? :</code> is a short if/else).',
          solution: page('  <p>Ride is <span id="status">Open</span></p>\n  <button id="toggle" type="button">Switch</button>\n  <script>\n    const status = document.getElementById(\'status\');\n    document.getElementById(\'toggle\').addEventListener(\'click\', () => {\n      status.textContent = status.textContent === \'Open\' ? \'Closed\' : \'Open\';\n    });\n  </script>') }),
        web({ id: 'L-web-typing', title: 'Live greeting',
          brief: '<p>As the guest types their name in <code>#name</code>, <code>#greeting</code> should show <b>Hello, NAME!</b> (listen for the <code>input</code> event).</p>',
          starter: page('  <label for="name">Your name</label>\n  <input id="name">\n  <p id="greeting">Hello!</p>\n  <script>\n  </script>'),
          checks: [{ label: 'Typing "Ada" shows "Hello, Ada!"', fn: (d, w) => { const i = $(d, '#name'); i.value = 'Ada'; i.dispatchEvent(new w.Event('input', { bubbles: true })); return txt($(d, '#greeting')) === 'Hello, Ada!'; } }],
          hint: '<code>name.addEventListener(\'input\', () =&gt; { greeting.textContent = \'Hello, \' + name.value + \'!\'; });</code>',
          solution: page('  <label for="name">Your name</label>\n  <input id="name">\n  <p id="greeting">Hello!</p>\n  <script>\n    const box = document.getElementById(\'name\');\n    box.addEventListener(\'input\', () => {\n      document.getElementById(\'greeting\').textContent = \'Hello, \' + box.value + \'!\';\n    });\n  </script>') }),
      ],
    },
  ];
})();
