// Learning Center: full-stack foundations for the capstone (internship 10).
IS.learnData = IS.learnData || {};
(function () {
  const js = (o) => Object.assign({ type: 'coding', lang: 'javascript' }, o);
  const q = (o) => Object.assign({ type: 'sql', ordered: true, starter: '-- Write your query below\n' }, o);
  IS.learnData.capstone = [
    {
      id: 'full-stack', icon: '🏗️', title: 'How a web app fits together: APIs and JSON',
      summary: 'The browser, the server and the database each have a job. JSON is how they talk.',
      tags: ['api', 'json', 'http', 'server', 'frontend', 'backend', 'request', 'route'],
      words: `<p>A modern app like "Park Pal" has three main layers:</p>
        <ol><li><b>Frontend</b> (the browser or phone app): what the guest sees and taps. Usually HTML, CSS and JavaScript.</li>
        <li><b>Backend</b> (the server, or <b>API</b>): receives requests, checks them, runs the logic, and answers. Could be JavaScript, Python, and more.</li>
        <li><b>Database</b>: stores the data permanently. Queried with SQL.</li></ol>
        <p>When a guest opens their plan, the app sends an <b>HTTP request</b> like <code>GET /guest/42/plan</code> to the API. The API asks the database, then replies with data in <b>JSON</b> format, which looks just like a JavaScript object written as text: <code>{"name": "Sky Tram", "wait": 10}</code>.</p>
        <p>In JavaScript, <code>JSON.parse(text)</code> turns JSON text into a real object, and <code>JSON.stringify(obj)</code> turns an object into JSON text. Extra details for a request are often sent as a <b>query string</b> on the URL: <code>/rides?land=Frontier&amp;open=true</code>.</p>
        <div class="analogy">🍽️ <b>Like a restaurant:</b> the frontend is the dining room, the API is the waiter who takes orders and checks them, and the database is the kitchen\'s pantry. JSON is the order ticket they pass back and forth.</div>`,
      terms: [['frontend / backend', 'What users see / the server behind it.'], ['API', 'The set of requests a server answers, like <code>GET /rides</code>.'], ['JSON', 'Text format for data: <code>{"key": "value"}</code>.'], ['JSON.parse / stringify', 'Text → object / object → text.'], ['query string', '<code>?a=1&amp;b=2</code> after a URL.']],
      example: {
        lang: 'javascript',
        intro: 'The frontend receives JSON text from the API and uses it:',
        code: `const text = '{"name": "Sky Tram", "wait": 10}';
const ride = JSON.parse(text);

const label = ride.name + " (" + ride.wait + " min)";

const reply = JSON.stringify({ ok: true, label: label });`,
        output: '{"ok":true,"label":"Sky Tram (10 min)"}',
        steps: [
          { lines: [1], text: 'This is what arrives over the network: just text that happens to be JSON.' },
          { lines: [2], text: '<code>JSON.parse</code> turns it into a real object so we can read <code>ride.name</code> and <code>ride.wait</code>.' },
          { lines: [4], text: 'Use the data like any object.' },
          { lines: [6], text: '<code>JSON.stringify</code> turns an object back into text, ready to send.' },
        ],
      },
      practice: [
        js({ id: 'L-cap-parse', title: 'Read an API response', fnName: 'rideName',
          brief: '<p>Finish <code>rideName(json)</code>. It receives JSON text like <code>\'{"name":"Sky Tram","wait":10}\'</code>. Return the ride\'s name.</p>',
          starter: 'function rideName(json) {\n  return json.name;\n}\n',
          tests: [{ args: ['{"name":"Sky Tram","wait":10}'], expected: 'Sky Tram' }], hidden: [{ args: ['{"wait":5,"name":"Pirate Lagoon"}'], expected: 'Pirate Lagoon' }],
          hint: 'The input is text, not an object. Parse it first: <code>JSON.parse(json).name</code>',
          solution: 'function rideName(json) {\n  const ride = JSON.parse(json);\n  return ride.name;\n}' }),
        js({ id: 'L-cap-json', title: 'Build a JSON reply', fnName: 'toJson',
          brief: '<p>Finish <code>toJson(name, wait)</code> to return JSON text for an object with those two keys, in that order. Example: <code>toJson("A", 5)</code> → <code>\'{"name":"A","wait":5}\'</code>.</p>',
          starter: 'function toJson(name, wait) {\n  return "";\n}\n',
          tests: [{ args: ['A', 5], expected: '{"name":"A","wait":5}' }], hidden: [{ args: ['Sky Tram', 0], expected: '{"name":"Sky Tram","wait":0}' }],
          hint: '<code>return JSON.stringify({ name: name, wait: wait });</code>',
          solution: 'function toJson(name, wait) {\n  return JSON.stringify({ name: name, wait: wait });\n}' }),
        js({ id: 'L-cap-query', title: 'Build a query string', fnName: 'buildQuery',
          brief: '<p>Finish <code>buildQuery(params)</code>. Turn an object like <code>{ land: "Frontier", open: true }</code> into <code>"land=Frontier&amp;open=true"</code> (keys in the object\'s order, joined by <code>&amp;</code>). An empty object gives <code>""</code>.</p>',
          starter: 'function buildQuery(params) {\n  \n}\n',
          tests: [{ args: [{ land: 'Frontier', open: true }], expected: 'land=Frontier&open=true' }, { args: [{}], expected: '' }], hidden: [{ args: [{ page: 2 }], expected: 'page=2' }],
          hint: '<code>Object.keys(params)</code> gives the keys. <code>map</code> each key to <code>key + "=" + params[key]</code>, then <code>.join("&amp;")</code>.',
          solution: 'function buildQuery(params) {\n  return Object.keys(params).map((k) => k + "=" + params[k]).join("&");\n}' }),
      ],
    },
    {
      id: 'validation', icon: '🛡️', title: 'Validating input',
      summary: 'Never trust data from outside. Check it before you use it.',
      tags: ['validate', 'validation', 'input', 'trim', 'parse', 'malformed', 'defensive', 'regex'],
      words: `<p>Data that comes from outside your code (forms, sensors, other services, URLs) can be <b>missing, messy or malicious</b>. A guest might type "  ada  " with spaces, "ten" instead of 10, or a party size of −3. A sensor might send "GC:" with no number.</p>
        <p><b>Validation</b> means checking input and rejecting (or cleaning) anything that doesn\'t fit the rules, <b>before</b> it reaches your logic or database. The server must always validate, even if the frontend checks too, because anyone can send requests directly to an API.</p>
        <p>Handy JavaScript tools:</p>
        <ul><li><code>s.trim()</code> removes spaces at both ends.</li>
        <li><code>Number.isInteger(n)</code> checks for a whole number.</li>
        <li>A <b>regular expression</b> (regex) describes a text pattern: <code>/^\\d\\d:\\d\\d$/</code> means "start, two digits, a colon, two digits, end". <code>pattern.test(s)</code> returns true or false.</li></ul>
        <div class="analogy">🚪 <b>Like a bouncer at the door:</b> check every ticket before anyone gets in. It\'s much harder to find the problem once they\'re inside.</div>`,
      terms: [['validation', 'Checking input against rules.'], ['trim()', 'Remove spaces at the start and end.'], ['regex', 'A text pattern, like <code>/^\\d+$/</code>.'], ['\\d', 'Any digit (in a regex).'], ['^ … $', 'Start … end of the text (in a regex).']],
      example: {
        lang: 'javascript',
        intro: 'Check a party size from a booking form:',
        code: `function validPartySize(n) {
  if (!Number.isInteger(n)) {
    return false;
  }
  return n >= 1 && n <= 10;
}

validPartySize(4);    // true
validPartySize(2.5);  // false
validPartySize(0);    // false`,
        steps: [
          { lines: [2, 3, 4], text: 'Reject anything that isn\'t a whole number: text, decimals, missing values. <code>!</code> means "not".' },
          { lines: [5], text: 'Then check the allowed range: 1 to 10 people.' },
          { lines: [8, 9, 10], text: 'Good input passes; everything else is rejected before it can cause trouble.' },
        ],
      },
      practice: [
        js({ id: 'L-cap-party', title: 'Valid party size', fnName: 'validPartySize',
          brief: '<p>Finish <code>validPartySize(n)</code> like the example: <code>true</code> only for whole numbers from 1 to 10.</p>',
          starter: 'function validPartySize(n) {\n  return true;\n}\n',
          tests: [{ args: [4], expected: true }, { args: [0], expected: false }, { args: [2.5], expected: false }], hidden: [{ args: ['4'], expected: false }, { args: [10], expected: true }, { args: [11], expected: false }],
          hint: 'Type the example out yourself. Note that the text "4" is not a number!',
          solution: 'function validPartySize(n) {\n  if (!Number.isInteger(n)) {\n    return false;\n  }\n  return n >= 1 && n <= 10;\n}' }),
        js({ id: 'L-cap-name', title: 'Clean a name', fnName: 'cleanName',
          brief: '<p>Finish <code>cleanName(s)</code>: remove spaces at both ends. If nothing is left, return <code>null</code>.</p>',
          starter: 'function cleanName(s) {\n  return s;\n}\n',
          tests: [{ args: ['  Ada  '], expected: 'Ada' }, { args: ['   '], expected: null }], hidden: [{ args: ['Gus'], expected: 'Gus' }, { args: [''], expected: null }],
          hint: '<code>const t = s.trim();</code> then <code>return t === "" ? null : t;</code>',
          solution: 'function cleanName(s) {\n  const t = s.trim();\n  if (t === "") {\n    return null;\n  }\n  return t;\n}' }),
        js({ id: 'L-cap-time', title: 'Valid time', fnName: 'validTime',
          brief: '<p>Finish <code>validTime(s)</code>: <code>true</code> for times written <code>"HH:MM"</code> with hours 00–23 and minutes 00–59, otherwise <code>false</code>.</p>',
          starter: 'function validTime(s) {\n  return s.includes(":");\n}\n',
          tests: [{ args: ['09:30'], expected: true }, { args: ['24:00'], expected: false }, { args: ['9:30'], expected: false }], hidden: [{ args: ['23:59'], expected: true }, { args: ['12:60'], expected: false }, { args: ['ab:cd'], expected: false }],
          hint: 'First check the shape with <code>/^\\d\\d:\\d\\d$/.test(s)</code>. Then split on ":" and check the numbers: <code>Number(h) &lt;= 23 &amp;&amp; Number(m) &lt;= 59</code>.',
          solution: 'function validTime(s) {\n  if (!/^\\d\\d:\\d\\d$/.test(s)) {\n    return false;\n  }\n  const [h, m] = s.split(":");\n  return Number(h) <= 23 && Number(m) <= 59;\n}' }),
      ],
    },
    {
      id: 'left-join', icon: '🧷', title: 'Finding what\'s missing: LEFT JOIN',
      summary: 'Keep every row from one table, even when there\'s no match in the other.',
      tags: ['left join', 'join', 'null', 'missing', 'sql', 'without', 'anti-join', 'count'],
      words: `<p>A normal <code>JOIN</code> (an "inner join") only keeps rows that have a match in <b>both</b> tables. That\'s a problem when you want to find what\'s <b>missing</b>, like "guests who haven\'t bought a ticket". Those guests have no match, so an inner join drops them!</p>
        <p><code>LEFT JOIN</code> keeps <b>every</b> row from the left (first) table. When there\'s no match on the right, the right side\'s columns are filled with <code>NULL</code>.</p>
        <ul><li>To find rows with <b>no</b> match, add <code>WHERE right_table.id IS NULL</code>. This is called an <b>anti-join</b>.</li>
        <li>To count matches <b>including zero</b>, use <code>COUNT(right_table.id)</code>. COUNT of a column skips NULLs, so unmatched rows count as 0 (<code>COUNT(*)</code> would wrongly count 1).</li></ul>
        <div class="analogy">📋 <b>Like a class attendance sheet:</b> list every student (the left table), then write the date they turned in homework next to their name. Blank spaces show who hasn\'t turned it in.</div>`,
      terms: [['LEFT JOIN', 'Keep all left rows; fill missing right values with NULL.'], ['IS NULL', 'Check for a missing value.'], ['anti-join', 'LEFT JOIN + WHERE right.id IS NULL: rows with no match.'], ['COUNT(column)', 'Counts non-NULL values only.']],
      example: {
        lang: 'sql',
        intro: 'Guests with no reservations at all:',
        code: `SELECT g.guest_id, g.first_name
FROM guests g
LEFT JOIN reservations r ON r.guest_id = g.guest_id
WHERE r.res_id IS NULL
ORDER BY g.guest_id;`,
        steps: [
          { lines: [2], text: 'The left table: every guest.' },
          { lines: [3], text: 'Attach their reservations. Guests without any still appear, with NULLs in the <code>r</code> columns.' },
          { lines: [4], text: 'Keep only the rows where no reservation was found.' },
          { lines: [5], text: 'Sort by id.' },
        ],
      },
      practice: [
        q({ id: 'L-cap-sql1', title: 'Reservations per ride (including zero)',
          brief: '<p>Return <code>name, reservations</code>: the number of reservations for <b>every</b> attraction (0 if none), ordered by name.</p>',
          hint: 'FROM attractions a LEFT JOIN reservations r ON … GROUP BY a.name, with COUNT(r.res_id).',
          solution: '-- Reservations per attraction, including zero\nSELECT a.name, COUNT(r.res_id) AS reservations\nFROM attractions a\nLEFT JOIN reservations r ON r.attraction_id = a.attraction_id\nGROUP BY a.name\nORDER BY a.name;' }),
        q({ id: 'L-cap-sql2', title: 'Ratings per guest',
          brief: '<p>Return <code>guest_id, ratings</code>: how many ratings each guest has written, for <b>every</b> guest (0 if none), ordered by guest_id.</p>',
          hint: 'FROM guests g LEFT JOIN ratings r ON r.guest_id = g.guest_id, then COUNT(r.rating_id).',
          solution: '-- Ratings per guest, including zero\nSELECT g.guest_id, COUNT(r.rating_id) AS ratings\nFROM guests g\nLEFT JOIN ratings r ON r.guest_id = g.guest_id\nGROUP BY g.guest_id\nORDER BY g.guest_id;' }),
        q({ id: 'L-cap-sql3', title: 'Never reserved',
          brief: '<p>Return <code>guest_id, last_name</code> for guests with <b>no reservations</b>, ordered by guest_id.</p>',
          hint: 'The example, returning last_name instead of first_name.',
          solution: '-- Guests with no reservations\nSELECT g.guest_id, g.last_name\nFROM guests g\nLEFT JOIN reservations r ON r.guest_id = g.guest_id\nWHERE r.res_id IS NULL\nORDER BY g.guest_id;' }),
      ],
    },
    {
      id: 'sets-maps', icon: '⚡', title: 'Fast lookups with Set and Map (the idea behind caching)',
      summary: 'Remember what you\'ve already seen or computed, so you don\'t do the same work twice.',
      tags: ['set', 'map', 'cache', 'lru', 'duplicate', 'dedupe', 'unique', 'lookup', 'performance'],
      words: `<p>Checking "have I seen this before?" by scanning a whole list gets slow as the list grows. JavaScript has two structures built for instant lookups:</p>
        <ul><li><b>Set</b>: a collection of <b>unique</b> values. <code>seen.add(x)</code> adds, <code>seen.has(x)</code> checks, <code>seen.size</code> counts. Adding something twice has no effect.</li>
        <li><b>Map</b>: like an object, pairs of <b>key → value</b>: <code>cache.set(key, value)</code>, <code>cache.get(key)</code>, <code>cache.has(key)</code>. A Map also remembers the order keys were added.</li></ul>
        <p>This is the idea behind a <b>cache</b>: remember the answer to an expensive question (like a slow database query) the first time you compute it, and reuse it the next time the same question is asked. A request answered from the cache is a <b>cache hit</b>; one that needs real work is a <b>miss</b>. Caches are why busy APIs stay fast.</p>
        <div class="analogy">🧠 <b>Like remembering a friend\'s phone number:</b> the first time you look it up in your contacts (slow); after that you just know it (fast).</div>`,
      terms: [['Set', 'Unique values with instant <code>has()</code>.'], ['Map', 'Key → value pairs with instant <code>get()</code>.'], ['cache', 'Saved answers you can reuse.'], ['hit / miss', 'Found in the cache / had to do the work.']],
      example: {
        lang: 'javascript',
        intro: 'Remove duplicates while keeping the original order:',
        code: `function dedupe(items) {
  const seen = new Set();
  const out = [];
  for (const x of items) {
    if (!seen.has(x)) {
      seen.add(x);
      out.push(x);
    }
  }
  return out;
}

dedupe(["Tram", "Coaster", "Tram"]);`,
        output: '["Tram", "Coaster"]',
        steps: [
          { lines: [2], text: 'An empty Set to remember what we\'ve seen.' },
          { lines: [4, 5], text: 'For each item: have we seen it? <code>has</code> answers instantly, even for huge lists.' },
          { lines: [6, 7], text: 'New item: remember it and keep it. "Tram" the second time is skipped.' },
          { lines: [10], text: 'Return the unique items in their original order.' },
        ],
      },
      practice: [
        js({ id: 'L-cap-unique', title: 'Count unique guests', fnName: 'uniqueCount',
          brief: '<p>Finish <code>uniqueCount(ids)</code> to return how many <b>different</b> values are in the list.</p>',
          starter: 'function uniqueCount(ids) {\n  return ids.length;\n}\n',
          tests: [{ args: [[1, 2, 2, 3, 1]], expected: 3 }, { args: [[]], expected: 0 }], hidden: [{ args: [['a', 'a']], expected: 1 }],
          hint: '<code>return new Set(ids).size;</code>',
          solution: 'function uniqueCount(ids) {\n  return new Set(ids).size;\n}' }),
        js({ id: 'L-cap-repeat', title: 'First repeat', fnName: 'firstRepeat',
          brief: '<p>Finish <code>firstRepeat(items)</code> to return the first item that appears for the <b>second</b> time as you read left to right, or <code>null</code> if nothing repeats.</p>',
          starter: 'function firstRepeat(items) {\n  return null;\n}\n',
          tests: [{ args: [['a', 'b', 'c', 'b', 'a']], expected: 'b' }, { args: [['x', 'y']], expected: null }], hidden: [{ args: [[]], expected: null }, { args: [[7, 7]], expected: 7 }],
          hint: 'Loop with a Set: if <code>seen.has(x)</code>, return x; otherwise <code>seen.add(x)</code>.',
          solution: 'function firstRepeat(items) {\n  const seen = new Set();\n  for (const x of items) {\n    if (seen.has(x)) {\n      return x;\n    }\n    seen.add(x);\n  }\n  return null;\n}' }),
        js({ id: 'L-cap-hits', title: 'Cache hits', fnName: 'cacheHits',
          brief: '<p>An API caches every answer forever. Finish <code>cacheHits(requests)</code> to return how many requests were <b>hits</b> (asked before). Example: <code>["a","b","a","a"]</code> → 2.</p>',
          starter: 'function cacheHits(requests) {\n  return 0;\n}\n',
          tests: [{ args: [['a', 'b', 'a', 'a']], expected: 2 }, { args: [['x', 'y', 'z']], expected: 0 }], hidden: [{ args: [[]], expected: 0 }],
          hint: 'Count 1 every time <code>cache.has(r)</code> is already true; otherwise add it to the cache (a Set or Map).',
          solution: 'function cacheHits(requests) {\n  const cache = new Set();\n  let hits = 0;\n  for (const r of requests) {\n    if (cache.has(r)) {\n      hits++;\n    } else {\n      cache.add(r);\n    }\n  }\n  return hits;\n}' }),
      ],
    },
  ];
})();
