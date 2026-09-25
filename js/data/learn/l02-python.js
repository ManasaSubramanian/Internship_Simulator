// Learning Center: Python from zero (internship 2).
IS.learnData = IS.learnData || {};
(function () {
  const py = (o) => Object.assign({ type: 'coding', lang: 'python' }, o);
  IS.learnData.python = [
    {
      id: 'basics', icon: '🐍', title: 'Python basics: functions, variables and f-strings',
      summary: 'How Python code is laid out, how to store values, and how to write a function that returns an answer.',
      tags: ['def', 'return', 'variable', 'f-string', 'indent', 'string'],
      words: `<p><b>Python</b> is a programming language known for being easy to read. It's used for websites, data analysis, automation and AI.</p>
        <p>Like any language, it works with <b>values</b>: numbers (<code>42</code>, <code>3.5</code>), <b>strings</b> of text in quotes (<code>"Sky Tram"</code>), and <code>True</code> / <code>False</code> (capitalized in Python). You store a value in a <b>variable</b> just by naming it: <code>wait = 25</code>.</p>
        <p>A <b>function</b> is a named set of steps. You start it with <code>def</code>, give it a name and inputs (parameters) in parentheses, and end the line with a colon <code>:</code>. The lines that belong to the function are <b>indented</b> (pushed right by 4 spaces). In Python, indentation isn't just style; it's how Python knows which lines are inside the function. <code>return</code> sends the answer back.</p>
        <p>An <b>f-string</b> is an easy way to put values into text: put <code>f</code> before the quotes and wrap variables in curly braces: <code>f"Wait: {wait} min"</code> becomes <code>"Wait: 25 min"</code>.</p>
        <div class="analogy">📋 <b>Like a recipe card:</b> the title line (<code>def make_tea(cups):</code>) names the recipe and its ingredients, and the indented lines underneath are the steps.</div>`,
      terms: [['def', 'Starts a function definition.'], ['indentation', 'Spaces at the start of a line. Python uses it to group lines into blocks.'], ['return', 'Sends a value back from a function.'], ['f-string', '<code>f"Hi {name}"</code>: text with values plugged in.'], ['#', 'Starts a comment that Python ignores.']],
      example: {
        lang: 'python',
        intro: 'A function that describes a ride\'s wait:',
        code: `def describe(ride, wait):
    minutes = wait + 5  # add walking time
    return f"{ride}: about {minutes} min"

describe("Sky Tram", 10)`,
        output: '"Sky Tram: about 15 min"',
        steps: [
          { lines: [1], text: '<code>def</code> starts a function named <code>describe</code> with two inputs. The colon means "the body comes next".' },
          { lines: [2], text: 'Indented, so it\'s inside the function. Creates a variable <code>minutes</code>. Everything after <code>#</code> is a comment for humans.' },
          { lines: [3], text: 'An f-string builds the text by plugging in <code>ride</code> and <code>minutes</code>, and <code>return</code> sends it back.' },
          { lines: [5], text: 'Not indented, so it\'s outside the function: this line <b>calls</b> it with <code>"Sky Tram"</code> and <code>10</code>.' },
        ],
      },
      practice: [
        py({ id: 'L-py-triple', title: 'Triple it', fnName: 'triple',
          brief: '<p>Finish <code>triple(n)</code> so it returns <code>n</code> times 3.</p>',
          starter: 'def triple(n):\n    # return n times 3\n    pass\n',
          tests: [{ args: [4], expected: 12 }, { args: [0], expected: 0 }], hidden: [{ args: [-2], expected: -6 }],
          hint: '<code>pass</code> means "do nothing". Replace it with <code>return n * 3</code> (keep the 4-space indent).',
          solution: 'def triple(n):\n    return n * 3' }),
        py({ id: 'L-py-welcome', title: 'Welcome message', fnName: 'welcome',
          brief: '<p>Finish <code>welcome(name)</code> to return <code>"Welcome, NAME!"</code>. Example: <code>welcome("Rosa")</code> → <code>"Welcome, Rosa!"</code>.</p>',
          starter: 'def welcome(name):\n    pass\n',
          tests: [{ args: ['Rosa'], expected: 'Welcome, Rosa!' }], hidden: [{ args: ['Gus'], expected: 'Welcome, Gus!' }],
          hint: 'Use an f-string: <code>return f"Welcome, {name}!"</code>',
          solution: 'def welcome(name):\n    return f"Welcome, {name}!"' }),
        py({ id: 'L-py-area', title: 'Queue area', fnName: 'area',
          brief: '<p>A queue area is a rectangle. Finish <code>area(width, length)</code> to return width times length.</p>',
          starter: 'def area(width, length):\n    result = 0\n    return result\n',
          tests: [{ args: [3, 4], expected: 12 }, { args: [10, 1], expected: 10 }], hidden: [{ args: [0, 9], expected: 0 }],
          hint: 'Change the middle line to <code>result = width * length</code>.',
          solution: 'def area(width, length):\n    result = width * length\n    return result' }),
      ],
    },
    {
      id: 'if-elif', icon: '🔀', title: 'Decisions: if, elif and else',
      summary: 'Let your code choose what to do based on conditions.',
      tags: ['if', 'elif', 'else', 'condition', 'boolean', 'and', 'or'],
      words: `<p>Programs often need to pick between options. Python uses <code>if</code>, <code>elif</code> (short for "else if") and <code>else</code>.</p>
        <p>Each <code>if</code> and <code>elif</code> has a <b>condition</b>, a question that is <code>True</code> or <code>False</code>. Comparisons: <code>&lt;</code>, <code>&gt;</code>, <code>&lt;=</code>, <code>&gt;=</code>, <code>==</code> (equal: two equals signs) and <code>!=</code> (not equal). Combine them with the plain English words <code>and</code>, <code>or</code> and <code>not</code>.</p>
        <p>Python checks the conditions <b>from top to bottom</b> and runs only the <b>first</b> block that is true. <code>else</code> (no condition) catches everything left over. Every line ends with a colon, and the lines inside each branch are indented.</p>
        <p>The <code>%</code> operator gives the <b>remainder</b> after division: <code>7 % 2</code> is <code>1</code>, and <code>8 % 2</code> is <code>0</code>. It's the easy way to check if a number is even.</p>
        <div class="analogy">🚪 <b>Like a hallway of doors:</b> you try the first door; if it's locked, you try the next; <code>else</code> is the door at the end that's always open.</div>`,
      terms: [['condition', 'A True/False question like <code>age &gt;= 18</code>.'], ['==', 'Equality check. A single <code>=</code> stores a value instead.'], ['elif', 'Another condition, checked only if the ones above were False.'], ['%', 'Remainder: <code>10 % 3</code> is 1.']],
      example: {
        lang: 'python',
        intro: 'Turn a test score into a letter grade:',
        code: `def letter(score):
    if score >= 90:
        return "A"
    elif score >= 80:
        return "B"
    else:
        return "C or below"

letter(84)`,
        output: '"B"',
        steps: [
          { lines: [2, 3], text: 'Is 84 ≥ 90? <b>False</b>, so Python skips the indented line 3.' },
          { lines: [4, 5], text: 'Is 84 ≥ 80? <b>True</b>, so it returns <code>"B"</code> and the function ends.' },
          { lines: [6, 7], text: 'The <code>else</code> would handle anything under 80. Not reached this time.' },
          { lines: [9], text: 'Calling with 84 gives <code>"B"</code>. Order matters: if the 80 check came first, a 95 would wrongly get a B!' },
        ],
      },
      practice: [
        py({ id: 'L-py-even', title: 'Even or odd?', fnName: 'is_even',
          brief: '<p>Finish <code>is_even(n)</code>: return <code>True</code> if n is even, otherwise <code>False</code>.</p>',
          starter: 'def is_even(n):\n    pass\n',
          tests: [{ args: [4], expected: true }, { args: [7], expected: false }], hidden: [{ args: [0], expected: true }, { args: [-3], expected: false }],
          hint: 'A number is even when <code>n % 2 == 0</code>. You can return that comparison directly.',
          solution: 'def is_even(n):\n    return n % 2 == 0' }),
        py({ id: 'L-py-label', title: 'Crowd level', fnName: 'crowd_level',
          brief: '<p>Finish <code>crowd_level(guests)</code>: fewer than 1000 guests → <code>"quiet"</code>, fewer than 5000 → <code>"busy"</code>, otherwise <code>"packed"</code>.</p>',
          starter: 'def crowd_level(guests):\n    pass\n',
          tests: [{ args: [500], expected: 'quiet' }, { args: [3000], expected: 'busy' }, { args: [9000], expected: 'packed' }], hidden: [{ args: [1000], expected: 'busy' }, { args: [5000], expected: 'packed' }],
          hint: '<code>if guests &lt; 1000:</code> … <code>elif guests &lt; 5000:</code> … <code>else:</code> …',
          solution: 'def crowd_level(guests):\n    if guests < 1000:\n        return "quiet"\n    elif guests < 5000:\n        return "busy"\n    else:\n        return "packed"' }),
        py({ id: 'L-py-fastpass', title: 'Express lane', fnName: 'express_ok',
          brief: '<p>Finish <code>express_ok(has_pass, minutes_early)</code>. A guest may use the express lane if they have a pass (<code>has_pass</code> is <code>True</code>) <b>and</b> arrive no more than 10 minutes early (<code>minutes_early &lt;= 10</code>).</p>',
          starter: 'def express_ok(has_pass, minutes_early):\n    pass\n',
          tests: [{ args: [true, 5], expected: true }, { args: [false, 5], expected: false }, { args: [true, 30], expected: false }], hidden: [{ args: [true, 10], expected: true }],
          hint: '<code>return has_pass and minutes_early &lt;= 10</code>',
          solution: 'def express_ok(has_pass, minutes_early):\n    return has_pass and minutes_early <= 10' }),
      ],
    },
    {
      id: 'lists-loops', icon: '🔁', title: 'Lists and for loops',
      summary: 'Keep many values in a list and handle each one with a loop.',
      tags: ['list', 'for', 'loop', 'len', 'sum', 'count', 'append'],
      words: `<p>A <b>list</b> holds values in order inside square brackets: <code>waits = [25, 10, 45]</code>. Positions (called <b>indexes</b>) start at <b>0</b>, so <code>waits[0]</code> is 25. <code>len(waits)</code> gives the number of items (3).</p>
        <p>A <b>for loop</b> runs the indented block once for each item: <code>for w in waits:</code> means "take each item in turn, call it <code>w</code>".</p>
        <p>The <b>accumulator pattern</b> solves lots of problems: create a variable before the loop (a total of <code>0</code>, a count of <code>0</code>, or an empty list <code>[]</code>), update it inside the loop, and return it after. Add to a list with <code>.append(item)</code>.</p>
        <p>An empty list is a special case to think about. For "find the smallest" there is no answer, so we return <code>None</code>, Python's "nothing here" value.</p>
        <div class="analogy">🎟️ <b>Like a ticket-taker:</b> guests pass one at a time, and the ticket-taker clicks a counter for each one. At closing time, the counter holds the day's total.</div>`,
      terms: [['list', 'Ordered values in <code>[ ]</code>.'], ['index', 'Position number, starting at 0.'], ['len()', 'How many items are in a list.'], ['for … in …', 'Repeat a block for each item.'], ['None', 'Python\'s "no value" marker.']],
      example: {
        lang: 'python',
        intro: 'Collect every wait that is longer than a limit:',
        code: `def long_waits(waits, limit):
    result = []
    for w in waits:
        if w > limit:
            result.append(w)
    return result

long_waits([25, 10, 45], 20)`,
        output: '[25, 45]',
        steps: [
          { lines: [2], text: 'Start with an empty list to collect the answers.' },
          { lines: [3], text: 'Loop: <code>w</code> will be 25, then 10, then 45.' },
          { lines: [4, 5], text: 'Only keep items over the limit: 25 ✔, 10 ✘, 45 ✔.' },
          { lines: [6], text: 'Return after the loop (not indented under <code>for</code>), otherwise we\'d stop after the first item!' },
        ],
      },
      practice: [
        py({ id: 'L-py-total', title: 'Total guests', fnName: 'total',
          brief: '<p>Finish <code>total(nums)</code> to return the sum of the list, using a loop. (An empty list totals <code>0</code>.)</p>',
          starter: 'def total(nums):\n    result = 0\n    # loop and add each number\n    return result\n',
          tests: [{ args: [[1, 2, 3]], expected: 6 }, { args: [[]], expected: 0 }], hidden: [{ args: [[5, -5, 10]], expected: 10 }],
          hint: '<code>for n in nums:</code> then (indented) <code>result = result + n</code>.',
          solution: 'def total(nums):\n    result = 0\n    for n in nums:\n        result = result + n\n    return result' }),
        py({ id: 'L-py-countlong', title: 'Count long names', fnName: 'count_long',
          brief: '<p>Finish <code>count_long(words, n)</code> to return how many words have <b>more than</b> <code>n</code> letters. <code>len("Tram")</code> is 4.</p>',
          starter: 'def count_long(words, n):\n    pass\n',
          tests: [{ args: [['Sky', 'Coaster', 'Tram'], 3], expected: 2 }, { args: [[], 2], expected: 0 }], hidden: [{ args: [['abc'], 3], expected: 0 }],
          hint: 'Start <code>count = 0</code>; inside the loop: <code>if len(w) &gt; n: count += 1</code>.',
          solution: 'def count_long(words, n):\n    count = 0\n    for w in words:\n        if len(w) > n:\n            count += 1\n    return count' }),
        py({ id: 'L-py-smallest', title: 'Smallest value', fnName: 'smallest',
          brief: '<p>Finish <code>smallest(nums)</code> to return the smallest number, or <code>None</code> for an empty list. Try it with a loop (not the built-in <code>min</code>).</p>',
          starter: 'def smallest(nums):\n    pass\n',
          tests: [{ args: [[4, 1, 9]], expected: 1 }, { args: [[]], expected: null }], hidden: [{ args: [[-2, -8]], expected: -8 }, { args: [[5]], expected: 5 }],
          hint: '<code>if not nums: return None</code>. Then <code>best = nums[0]</code> and replace it when you see something smaller.',
          solution: 'def smallest(nums):\n    if not nums:\n        return None\n    best = nums[0]\n    for n in nums:\n        if n < best:\n            best = n\n    return best' }),
      ],
    },
    {
      id: 'dicts', icon: '📒', title: 'Dictionaries: look things up by name',
      summary: 'Store pairs of keys and values so you can find a value instantly by its key.',
      tags: ['dict', 'dictionary', 'key', 'get', 'count', 'tally'],
      words: `<p>A <b>dictionary</b> ("dict") stores <b>key → value</b> pairs in curly braces: <code>menu = {"coffee": 3, "churro": 5}</code>. You look up a value by its key: <code>menu["churro"]</code> is <code>5</code>.</p>
        <p>Asking for a key that doesn't exist causes an error. The safe way is <code>menu.get("tea", 0)</code>, which returns <code>0</code> (or whatever default you give) when the key is missing. Check if a key exists with <code>"tea" in menu</code>.</p>
        <p>You add or change a value with <code>menu["tea"] = 2</code>. A classic use is <b>counting</b>: loop over items and do <code>counts[item] = counts.get(item, 0) + 1</code>. The first time you see an item, its count starts from 0.</p>
        <p>Loop over a dict's keys with <code>for key in counts:</code>, or over keys and values together with <code>for key, value in counts.items():</code>.</p>
        <div class="analogy">📖 <b>Like a real dictionary:</b> you don't read every page to find a word, you jump straight to it. The word is the key and the definition is the value.</div>`,
      terms: [['dict', 'Key → value pairs in <code>{ }</code>.'], ['key', 'The name you look up by (often a string).'], ['.get(key, default)', 'Safe lookup that returns the default if the key is missing.'], ['.items()', 'Gives (key, value) pairs for looping.']],
      example: {
        lang: 'python',
        intro: 'Count how many times each ride was requested:',
        code: `def tally(rides):
    counts = {}
    for r in rides:
        counts[r] = counts.get(r, 0) + 1
    return counts

tally(["Tram", "Coaster", "Tram"])`,
        output: '{"Tram": 2, "Coaster": 1}',
        steps: [
          { lines: [2], text: 'Start with an empty dictionary.' },
          { lines: [3], text: 'Loop over each requested ride.' },
          { lines: [4], text: 'First "Tram": <code>.get</code> finds nothing, gives 0, so counts["Tram"] = 1. Then "Coaster" = 1. The second "Tram" finds 1 and stores 2.' },
          { lines: [5], text: 'Return the finished tallies.' },
        ],
      },
      practice: [
        py({ id: 'L-py-price', title: 'Menu lookup', fnName: 'price_of',
          brief: '<p>Finish <code>price_of(menu, item)</code> to return the item\'s price from the <code>menu</code> dict, or <code>0</code> if it isn\'t on the menu.</p>',
          starter: 'def price_of(menu, item):\n    return menu[item]\n',
          tests: [{ args: [{ coffee: 3, churro: 5 }, 'churro'], expected: 5 }, { args: [{ coffee: 3 }, 'tea'], expected: 0 }], hidden: [{ args: [{}, 'x'], expected: 0 }],
          hint: 'The starter crashes on missing items. Use <code>menu.get(item, 0)</code>.',
          solution: 'def price_of(menu, item):\n    return menu.get(item, 0)' }),
        py({ id: 'L-py-tally', title: 'Count snacks', fnName: 'count_items',
          brief: '<p>Finish <code>count_items(items)</code> to return a dict counting how many times each item appears.</p>',
          starter: 'def count_items(items):\n    counts = {}\n    return counts\n',
          tests: [{ args: [['coffee', 'churro', 'coffee']], expected: { coffee: 2, churro: 1 } }, { args: [[]], expected: {} }], hidden: [{ args: [['a']], expected: { a: 1 } }],
          hint: 'Inside a loop: <code>counts[x] = counts.get(x, 0) + 1</code>',
          solution: 'def count_items(items):\n    counts = {}\n    for x in items:\n        counts[x] = counts.get(x, 0) + 1\n    return counts' }),
        py({ id: 'L-py-top', title: 'Most popular', fnName: 'most_popular',
          brief: '<p>Finish <code>most_popular(counts)</code>. Given a dict like <code>{"Tram": 4, "Coaster": 9}</code>, return the key with the <b>largest</b> value. If there\'s a tie, return the key that comes first alphabetically. An empty dict → <code>None</code>.</p>',
          starter: 'def most_popular(counts):\n    pass\n',
          tests: [{ args: [{ Tram: 4, Coaster: 9 }], expected: 'Coaster' }, { args: [{}], expected: null }], hidden: [{ args: [{ b: 3, a: 3 }], expected: 'a' }],
          hint: 'Track <code>best = None</code>. For each <code>key, value in counts.items()</code>, replace best if it\'s None, if the value is bigger, or if the value ties and the key is alphabetically smaller (<code>key &lt; best</code>).',
          solution: 'def most_popular(counts):\n    best = None\n    for key, value in counts.items():\n        if best is None or value > counts[best] or (value == counts[best] and key < best):\n            best = key\n    return best' }),
      ],
    },
  ];
})();
