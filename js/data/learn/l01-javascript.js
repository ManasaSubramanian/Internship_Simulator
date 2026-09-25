// Learning Center: JavaScript from zero (internship 1).
IS.learnData = IS.learnData || {};
(function () {
  const js = (o) => Object.assign({ type: 'coding', lang: 'javascript' }, o);
  IS.learnData.javascript = [
    {
      id: 'functions', icon: '📦', title: 'Your first function: values, variables and return',
      summary: 'What a program is, how to store values in variables, and how a function takes inputs and gives back an answer.',
      tags: ['function', 'return', 'variable', 'const', 'string', 'number'],
      words: `<p>A <b>program</b> is a list of instructions the computer follows exactly, top to bottom. JavaScript is the language that runs in every web browser, and it's also used on servers and in apps.</p>
        <p>Programs work with <b>values</b>. The most common kinds are:</p>
        <ul><li><b>Numbers</b> like <code>42</code> or <code>3.5</code>. You can do math with them: <code>+ - * /</code>.</li>
        <li><b>Strings</b> (text), always wrapped in quotes: <code>"Galaxy Coaster"</code>. Joining strings with <code>+</code> glues them together: <code>"Hi " + "there"</code> becomes <code>"Hi there"</code>.</li>
        <li><b>Booleans</b>: just <code>true</code> or <code>false</code>.</li></ul>
        <p>A <b>variable</b> is a labeled box that holds a value so you can use it later. You make one with <code>const</code> (the box's value won't change) or <code>let</code> (it can change later).</p>
        <p>A <b>function</b> is a small machine with a name. You give it inputs (called <b>parameters</b>), it runs the instructions inside its curly braces <code>{ }</code>, and <code>return</code> hands the answer back out. Every practice problem in this game asks you to finish a function.</p>
        <div class="analogy">🧃 <b>Think of a juice machine:</b> the parameters are the fruit you put in, the code inside is the blending, and <code>return</code> is the juice that comes out. Without <code>return</code>, nothing comes out (JavaScript gives back <code>undefined</code>).</div>`,
      terms: [['value', 'A piece of data: a number, a string of text, true/false…'], ['variable', 'A named box holding a value. <code>const</code> = fixed, <code>let</code> = changeable.'], ['function', 'Named, reusable instructions. Takes inputs, gives back a result.'], ['parameter', 'An input name listed in the parentheses of a function.'], ['return', 'Sends a value back out of the function and stops it.'], ['//', 'Starts a comment: a note for humans that the computer ignores.']],
      example: {
        lang: 'javascript',
        intro: 'A function that builds a welcome message for a guest:',
        code: `function greet(name) {
  const message = "Welcome, " + name + "!";
  return message;
}

// Using (calling) the function:
greet("Maya");`,
        output: '"Welcome, Maya!"',
        steps: [
          { lines: [1], text: '<code>function</code> starts a new function named <code>greet</code>. Inside the parentheses, <code>name</code> is its one input (a parameter). The <code>{</code> opens the body.' },
          { lines: [2], text: 'Creates a variable <code>message</code>. It glues three strings together with <code>+</code>: <code>"Welcome, "</code>, whatever <code>name</code> holds, and <code>"!"</code>.' },
          { lines: [3], text: '<code>return</code> sends <code>message</code> back to whoever called the function.' },
          { lines: [4], text: 'The <code>}</code> closes the function body.' },
          { lines: [6], text: 'A comment (starts with <code>//</code>). The computer skips it.' },
          { lines: [7], text: '<b>Calling</b> the function: <code>name</code> becomes <code>"Maya"</code> for this run, so the result is <code>"Welcome, Maya!"</code>.' },
        ],
      },
      practice: [
        js({ id: 'L-js-double', title: 'Double it', fnName: 'double',
          brief: '<p>Finish <code>double(n)</code> so it <b>returns</b> the number times 2. Example: <code>double(4)</code> → <code>8</code>.</p>',
          starter: 'function double(n) {\n  // return n times 2\n}\n',
          tests: [{ args: [4], expected: 8 }, { args: [0], expected: 0 }], hidden: [{ args: [-3], expected: -6 }],
          hint: 'Multiplication uses <code>*</code>. The whole body can be one line: <code>return n * 2;</code>',
          solution: 'function double(n) {\n  return n * 2;\n}' }),
        js({ id: 'L-js-fullname', title: 'Full name', fnName: 'fullName',
          brief: '<p>Finish <code>fullName(first, last)</code> so it returns the first and last name joined by a single space. Example: <code>fullName("Ada", "Lovelace")</code> → <code>"Ada Lovelace"</code>.</p>',
          starter: 'function fullName(first, last) {\n  \n}\n',
          tests: [{ args: ['Ada', 'Lovelace'], expected: 'Ada Lovelace' }, { args: ['Walt', 'D'], expected: 'Walt D' }], hidden: [{ args: ['', 'Solo'], expected: ' Solo' }],
          hint: 'Glue three strings with <code>+</code>: first, a space <code>" "</code>, and last.',
          solution: 'function fullName(first, last) {\n  return first + " " + last;\n}' }),
        js({ id: 'L-js-total', title: 'Ticket total', fnName: 'ticketTotal',
          brief: '<p>A family buys several tickets at the same price. Finish <code>ticketTotal(price, quantity)</code> so it returns the total cost. Example: <code>ticketTotal(129, 3)</code> → <code>387</code>.</p>',
          starter: 'function ticketTotal(price, quantity) {\n  const total = 0; // fix this line\n  return total;\n}\n',
          tests: [{ args: [129, 3], expected: 387 }, { args: [50, 1], expected: 50 }], hidden: [{ args: [99, 0], expected: 0 }],
          hint: 'Set <code>total</code> to <code>price * quantity</code> instead of 0.',
          solution: 'function ticketTotal(price, quantity) {\n  const total = price * quantity;\n  return total;\n}' }),
      ],
    },
    {
      id: 'if-else', icon: '🔀', title: 'Making decisions with if / else',
      summary: 'How programs choose between options by comparing values.',
      tags: ['if', 'else', 'compare', 'boolean', 'condition'],
      words: `<p>Programs often need to choose: <i>is this guest tall enough? is the wait long?</i> You do that with <b>if</b>.</p>
        <p>First you need a <b>comparison</b>, a question whose answer is <code>true</code> or <code>false</code>:</p>
        <ul><li><code>a &gt; b</code> greater than, <code>a &lt; b</code> less than</li>
        <li><code>a &gt;= b</code> greater than or equal, <code>a &lt;= b</code> less than or equal</li>
        <li><code>a === b</code> equal (three equals signs!), <code>a !== b</code> not equal</li></ul>
        <p>Then <code>if (comparison) { … }</code> runs the code in the braces only when the comparison is <code>true</code>. Add <code>else { … }</code> for what to do otherwise, and <code>else if (…)</code> to check more cases in order. The computer checks from top to bottom and runs <b>only the first</b> branch that is true.</p>
        <p>You can combine questions: <code>&amp;&amp;</code> means "and" (both must be true), <code>||</code> means "or" (at least one is true).</p>
        <div class="analogy">🚦 <b>Like a ride attendant:</b> "If you're at least 48 inches, go ahead. Otherwise, please step aside."</div>`,
      terms: [['condition', 'A true/false question, like <code>height &gt;= 48</code>.'], ['===', 'Checks if two values are equal. (A single <code>=</code> stores a value instead!)'], ['else if', 'Another condition checked only if the ones above were false.'], ['&&, ||', '"and" and "or" for combining conditions.']],
      example: {
        lang: 'javascript',
        intro: 'Describe a ride\'s wait time in words:',
        code: `function waitLabel(minutes) {
  if (minutes < 15) {
    return "Short";
  } else if (minutes < 45) {
    return "Medium";
  } else {
    return "Long";
  }
}

waitLabel(30);`,
        output: '"Medium"',
        steps: [
          { lines: [1], text: 'A function with one input, <code>minutes</code>.' },
          { lines: [2, 3], text: 'First question: is <code>minutes</code> less than 15? For 30, the answer is <b>false</b>, so line 3 is skipped.' },
          { lines: [4, 5], text: 'Next question (only asked because the first was false): is it less than 45? 30 &lt; 45 is <b>true</b>, so it returns <code>"Medium"</code> and the function stops.' },
          { lines: [6, 7], text: '<code>else</code> catches everything that didn\'t match above (45 or more). Not reached this time.' },
          { lines: [11], text: 'Calling with 30 gives <code>"Medium"</code>.' },
        ],
      },
      practice: [
        js({ id: 'L-js-adult', title: 'Adult ticket?', fnName: 'isAdult',
          brief: '<p>Finish <code>isAdult(age)</code>: return <code>true</code> if age is 18 or older, otherwise <code>false</code>.</p>',
          starter: 'function isAdult(age) {\n  \n}\n',
          tests: [{ args: [20], expected: true }, { args: [10], expected: false }], hidden: [{ args: [18], expected: true }, { args: [17], expected: false }],
          hint: 'Use <code>&gt;=</code> so that exactly 18 counts. You can even write <code>return age &gt;= 18;</code> because the comparison is already true or false!',
          solution: 'function isAdult(age) {\n  if (age >= 18) {\n    return true;\n  } else {\n    return false;\n  }\n}' }),
        js({ id: 'L-js-price', title: 'Ticket price by age', fnName: 'ticketPrice',
          brief: '<p>Finish <code>ticketPrice(age)</code>. Children under 3 are free (<code>0</code>), ages 3 to 9 pay <code>99</code>, and everyone 10 or older pays <code>129</code>.</p>',
          starter: 'function ticketPrice(age) {\n  \n}\n',
          tests: [{ args: [2], expected: 0 }, { args: [5], expected: 99 }, { args: [30], expected: 129 }], hidden: [{ args: [3], expected: 99 }, { args: [9], expected: 99 }, { args: [10], expected: 129 }],
          hint: 'Check the smallest group first: <code>if (age &lt; 3)</code>, then <code>else if (age &lt; 10)</code>, then <code>else</code>.',
          solution: 'function ticketPrice(age) {\n  if (age < 3) {\n    return 0;\n  } else if (age < 10) {\n    return 99;\n  } else {\n    return 129;\n  }\n}' }),
        js({ id: 'L-js-ride', title: 'Can they ride?', fnName: 'canRide',
          brief: '<p>Finish <code>canRide(height, withAdult)</code>. Guests 48 inches or taller can ride. Guests from 40 up to (but not including) 48 inches can ride <b>only</b> if <code>withAdult</code> is <code>true</code>. Anyone shorter than 40 can\'t ride.</p>',
          starter: 'function canRide(height, withAdult) {\n  \n}\n',
          tests: [{ args: [50, false], expected: true }, { args: [44, true], expected: true }, { args: [44, false], expected: false }], hidden: [{ args: [39, true], expected: false }, { args: [48, false], expected: true }, { args: [40, true], expected: true }],
          hint: 'First <code>if (height &gt;= 48) return true;</code> then <code>if (height &gt;= 40 &amp;&amp; withAdult) return true;</code> and finally <code>return false;</code>',
          solution: 'function canRide(height, withAdult) {\n  if (height >= 48) {\n    return true;\n  }\n  if (height >= 40 && withAdult) {\n    return true;\n  }\n  return false;\n}' }),
      ],
    },
    {
      id: 'arrays-loops', icon: '🔁', title: 'Lists and loops (arrays)',
      summary: 'Store many values in one list and visit each one with a loop.',
      tags: ['array', 'loop', 'for', 'length', 'list', 'sum', 'count'],
      words: `<p>An <b>array</b> is a list of values in order, written in square brackets: <code>[25, 10, 45]</code>. Each item has a position number called an <b>index</b>, and counting starts at <b>0</b>: in that list, <code>waits[0]</code> is 25 and <code>waits[2]</code> is 45. <code>waits.length</code> tells you how many items there are (3).</p>
        <p>A <b>loop</b> repeats code. The friendliest loop is <code>for (const w of waits) { … }</code>, which means "for each item in <code>waits</code>, call it <code>w</code> and run the code in the braces".</p>
        <p>A very common pattern is the <b>accumulator</b>: start a variable at a beginning value (like <code>0</code>), then update it once per item inside the loop. After the loop finishes, the variable holds the answer. That's how you add things up, count things, or find the biggest item.</p>
        <div class="analogy">🧺 <b>Like counting apples in a basket:</b> start at zero, pick up each apple one at a time, and add one to your count. When the basket is empty, you know the total.</div>`,
      terms: [['array', 'An ordered list of values: <code>[1, 2, 3]</code>.'], ['index', 'An item\'s position, starting from 0.'], ['.length', 'How many items an array has.'], ['loop', 'Code that repeats, once for each item.'], ['accumulator', 'A variable you update on every loop pass to build up the answer.']],
      example: {
        lang: 'javascript',
        intro: 'Add up all the wait times in a list:',
        code: `function totalWait(waits) {
  let total = 0;
  for (const w of waits) {
    total = total + w;
  }
  return total;
}

totalWait([25, 10, 45]);`,
        output: '80',
        steps: [
          { lines: [2], text: 'The accumulator starts at 0. We use <code>let</code> because it will change.' },
          { lines: [3], text: 'The loop visits each item. First <code>w</code> is 25, then 10, then 45.' },
          { lines: [4], text: 'Each pass adds the current item: total goes 0 → 25 → 35 → 80. (<code>total += w</code> is a shortcut for the same thing.)' },
          { lines: [5], text: 'The loop ends when there are no more items.' },
          { lines: [6], text: 'Return the finished total. For an empty list, the loop never runs and we return 0, which makes sense.' },
        ],
      },
      practice: [
        js({ id: 'L-js-sum', title: 'Add them all up', fnName: 'sumAll',
          brief: '<p>Finish <code>sumAll(nums)</code> to return the sum of every number in the array. An empty array sums to <code>0</code>.</p>',
          starter: 'function sumAll(nums) {\n  let total = 0;\n  // loop over nums and add each one\n  return total;\n}\n',
          tests: [{ args: [[1, 2, 3]], expected: 6 }, { args: [[]], expected: 0 }], hidden: [{ args: [[10, -4, 4]], expected: 10 }],
          hint: '<code>for (const n of nums) { total += n; }</code>',
          solution: 'function sumAll(nums) {\n  let total = 0;\n  for (const n of nums) {\n    total += n;\n  }\n  return total;\n}' }),
        js({ id: 'L-js-countover', title: 'Count long waits', fnName: 'countOver',
          brief: '<p>Finish <code>countOver(waits, limit)</code> to return <b>how many</b> waits are greater than <code>limit</code>.</p>',
          starter: 'function countOver(waits, limit) {\n  \n}\n',
          tests: [{ args: [[10, 50, 30, 60], 40], expected: 2 }, { args: [[], 5], expected: 0 }], hidden: [{ args: [[40, 40], 40], expected: 0 }, { args: [[41], 40], expected: 1 }],
          hint: 'Start <code>let count = 0;</code> and inside the loop use <code>if (w &gt; limit) count++;</code>',
          solution: 'function countOver(waits, limit) {\n  let count = 0;\n  for (const w of waits) {\n    if (w > limit) {\n      count++;\n    }\n  }\n  return count;\n}' }),
        js({ id: 'L-js-biggest', title: 'Find the biggest', fnName: 'biggest',
          brief: '<p>Finish <code>biggest(nums)</code> to return the largest number. If the array is empty, return <code>null</code> (JavaScript\'s "nothing here" value).</p>',
          starter: 'function biggest(nums) {\n  \n}\n',
          tests: [{ args: [[3, 9, 2]], expected: 9 }, { args: [[]], expected: null }], hidden: [{ args: [[-5, -2, -9]], expected: -2 }, { args: [[7]], expected: 7 }],
          hint: 'Handle empty first: <code>if (nums.length === 0) return null;</code>. Then start with <code>let best = nums[0];</code> and replace it whenever you see something bigger. (Starting at 0 would be wrong for all-negative lists!)',
          solution: 'function biggest(nums) {\n  if (nums.length === 0) {\n    return null;\n  }\n  let best = nums[0];\n  for (const n of nums) {\n    if (n > best) {\n      best = n;\n    }\n  }\n  return best;\n}' }),
      ],
    },
    {
      id: 'objects', icon: '🗂️', title: 'Objects: grouping related data',
      summary: 'Keep everything about one thing (like a ride) together with named properties.',
      tags: ['object', 'property', 'key', 'ride'],
      words: `<p>Sometimes one thing has several facts: a ride has a <i>name</i>, a <i>wait</i>, and whether it's <i>open</i>. An <b>object</b> keeps those facts together, each under a name called a <b>key</b> (or property):</p>
        <p><code>const ride = { name: "Sky Tram", wait: 10, open: true };</code></p>
        <p>You read a property with a dot: <code>ride.name</code> is <code>"Sky Tram"</code>, <code>ride.wait</code> is <code>10</code>. You can change one the same way: <code>ride.wait = 15;</code></p>
        <p>Real data is usually an <b>array of objects</b>, like a list of rides. You loop over the array, and for each object you read the properties you need.</p>
        <div class="analogy">🪪 <b>Like an ID card:</b> one card, several labeled fields (name, photo, birthday). An array of objects is a stack of cards.</div>`,
      terms: [['object', 'A group of named values in curly braces: <code>{ key: value }</code>.'], ['key / property', 'The name of one value inside an object.'], ['dot notation', '<code>ride.name</code> reads the <code>name</code> property.']],
      example: {
        lang: 'javascript',
        intro: 'Build a list of the names of open rides:',
        code: `function openRideNames(rides) {
  const names = [];
  for (const ride of rides) {
    if (ride.open) {
      names.push(ride.name);
    }
  }
  return names;
}

openRideNames([
  { name: "Sky Tram", wait: 10, open: true },
  { name: "Haunted Manor", wait: 30, open: false },
]);`,
        output: '["Sky Tram"]',
        steps: [
          { lines: [2], text: 'Start with an empty array that will collect the answers.' },
          { lines: [3], text: 'Loop over the rides. Each <code>ride</code> is one object.' },
          { lines: [4], text: '<code>ride.open</code> is already <code>true</code> or <code>false</code>, so it can be the condition directly.' },
          { lines: [5], text: '<code>.push(…)</code> adds an item to the end of an array. We add just the ride\'s name.' },
          { lines: [8], text: 'Return the collected names.' },
          { lines: [11, 12, 13, 14], text: 'Calling it with two ride objects: only Sky Tram is open.' },
        ],
      },
      practice: [
        js({ id: 'L-js-label', title: 'Ride label', fnName: 'rideLabel',
          brief: '<p>Finish <code>rideLabel(ride)</code>. Given a ride object like <code>{ name: "Sky Tram", wait: 10 }</code>, return <code>"Sky Tram (10 min)"</code>.</p>',
          starter: 'function rideLabel(ride) {\n  \n}\n',
          tests: [{ args: [{ name: 'Sky Tram', wait: 10 }], expected: 'Sky Tram (10 min)' }], hidden: [{ args: [{ name: 'Galaxy Coaster', wait: 0 }], expected: 'Galaxy Coaster (0 min)' }],
          hint: '<code>return ride.name + " (" + ride.wait + " min)";</code>',
          solution: 'function rideLabel(ride) {\n  return ride.name + " (" + ride.wait + " min)";\n}' }),
        js({ id: 'L-js-totalwait', title: 'Total wait of a plan', fnName: 'planMinutes',
          brief: '<p>Finish <code>planMinutes(rides)</code> to return the sum of every ride\'s <code>wait</code> property.</p>',
          starter: 'function planMinutes(rides) {\n  \n}\n',
          tests: [{ args: [[{ name: 'A', wait: 10 }, { name: 'B', wait: 25 }]], expected: 35 }, { args: [[]], expected: 0 }], hidden: [{ args: [[{ name: 'C', wait: 5 }]], expected: 5 }],
          hint: 'An accumulator loop again, but add <code>ride.wait</code> instead of the whole object.',
          solution: 'function planMinutes(rides) {\n  let total = 0;\n  for (const ride of rides) {\n    total += ride.wait;\n  }\n  return total;\n}' }),
        js({ id: 'L-js-find', title: 'Find a ride by name', fnName: 'findWait',
          brief: '<p>Finish <code>findWait(rides, name)</code> to return the <code>wait</code> of the ride with that name, or <code>-1</code> if no ride has that name.</p>',
          starter: 'function findWait(rides, name) {\n  \n}\n',
          tests: [{ args: [[{ name: 'A', wait: 10 }, { name: 'B', wait: 25 }], 'B'], expected: 25 }, { args: [[{ name: 'A', wait: 10 }], 'Z'], expected: -1 }], hidden: [{ args: [[], 'A'], expected: -1 }],
          hint: 'Inside the loop: <code>if (ride.name === name) return ride.wait;</code>. After the loop (nothing found): <code>return -1;</code>',
          solution: 'function findWait(rides, name) {\n  for (const ride of rides) {\n    if (ride.name === name) {\n      return ride.wait;\n    }\n  }\n  return -1;\n}' }),
      ],
    },
    {
      id: 'array-helpers', icon: '🪄', title: 'Array helpers: filter, map and sort',
      summary: 'Built-in shortcuts for keeping, transforming and ordering items in a list.',
      tags: ['filter', 'map', 'sort', 'arrow', 'callback'],
      words: `<p>Loops work for everything, but three built-in helpers make common jobs shorter. Each one takes a small function describing what to do with <b>one item</b>:</p>
        <ul><li><code>list.filter(fn)</code> <b>keeps</b> only the items where <code>fn</code> returns true.</li>
        <li><code>list.map(fn)</code> <b>transforms</b> every item and gives back a new list of the results.</li>
        <li><code>list.sort(compare)</code> puts items <b>in order</b>. For numbers use <code>(a, b) =&gt; a - b</code> (smallest first). Careful: <code>sort</code> changes the original array, so copy it first with <code>[...list]</code> if you still need the original.</li></ul>
        <p>The small functions are usually written as <b>arrow functions</b>: <code>(w) =&gt; w &lt; 20</code> means "take <code>w</code>, give back <code>w &lt; 20</code>". It's just a shorter way to write a function.</p>
        <div class="analogy">🍪 <b>Like a cookie factory line:</b> <code>filter</code> removes broken cookies, <code>map</code> adds icing to each one, and <code>sort</code> lines them up by size.</div>`,
      terms: [['arrow function', 'A short function: <code>(x) =&gt; x * 2</code>.'], ['filter', 'Keeps items that pass a test.'], ['map', 'Turns each item into something new.'], ['sort', 'Orders items. Changes the original array!'], ['[...list]', 'Makes a copy of an array.']],
      example: {
        lang: 'javascript',
        intro: 'Get labels for short waits, shortest first:',
        code: `const waits = [45, 10, 25, 5];

const short = waits.filter((w) => w < 30);
const sorted = [...short].sort((a, b) => a - b);
const labels = sorted.map((w) => w + " min");

labels;`,
        output: '["5 min", "10 min", "25 min"]',
        steps: [
          { lines: [1], text: 'Our starting list of wait times.' },
          { lines: [3], text: '<code>filter</code> keeps waits under 30: <code>[10, 25, 5]</code>. 45 is dropped.' },
          { lines: [4], text: 'Copy the list (<code>[...short]</code>) and sort it smallest first: <code>[5, 10, 25]</code>. The compare function returns a negative number when <code>a</code> should come first.' },
          { lines: [5], text: '<code>map</code> turns each number into a label: <code>["5 min", "10 min", "25 min"]</code>.' },
          { lines: [7], text: 'The final result. The original <code>waits</code> list is unchanged.' },
        ],
      },
      practice: [
        js({ id: 'L-js-filter', title: 'Keep the short waits', fnName: 'shortWaits',
          brief: '<p>Finish <code>shortWaits(waits)</code> to return a new array with only the waits <b>under 20</b>, in the same order.</p>',
          starter: 'function shortWaits(waits) {\n  \n}\n',
          tests: [{ args: [[5, 30, 15, 20]], expected: [5, 15] }, { args: [[]], expected: [] }], hidden: [{ args: [[25, 40]], expected: [] }],
          hint: '<code>return waits.filter((w) =&gt; w &lt; 20);</code>',
          solution: 'function shortWaits(waits) {\n  return waits.filter((w) => w < 20);\n}' }),
        js({ id: 'L-js-map', title: 'Make labels', fnName: 'toLabels',
          brief: '<p>Finish <code>toLabels(waits)</code> to turn each number into a string like <code>"5 min"</code>. Example: <code>[5, 12]</code> → <code>["5 min", "12 min"]</code>.</p>',
          starter: 'function toLabels(waits) {\n  \n}\n',
          tests: [{ args: [[5, 12]], expected: ['5 min', '12 min'] }, { args: [[]], expected: [] }], hidden: [{ args: [[0]], expected: ['0 min'] }],
          hint: '<code>return waits.map((w) =&gt; w + " min");</code>',
          solution: 'function toLabels(waits) {\n  return waits.map((w) => w + " min");\n}' }),
        js({ id: 'L-js-sort', title: 'Shortest line first', fnName: 'byWait',
          brief: '<p>Finish <code>byWait(rides)</code>. Each ride is <code>{ name, wait }</code>. Return the ride <b>names</b> sorted from shortest to longest wait. Don\'t change the original array.</p>',
          starter: 'function byWait(rides) {\n  \n}\n',
          tests: [{ args: [[{ name: 'A', wait: 30 }, { name: 'B', wait: 5 }, { name: 'C', wait: 15 }]], expected: ['B', 'C', 'A'] }, { args: [[]], expected: [] }], hidden: [{ args: [[{ name: 'X', wait: 1 }]], expected: ['X'] }],
          hint: 'Copy, sort by <code>a.wait - b.wait</code>, then <code>map</code> to names: <code>[...rides].sort((a, b) =&gt; a.wait - b.wait).map((r) =&gt; r.name)</code>',
          solution: 'function byWait(rides) {\n  return [...rides].sort((a, b) => a.wait - b.wait).map((r) => r.name);\n}' }),
      ],
    },
  ];
})();
