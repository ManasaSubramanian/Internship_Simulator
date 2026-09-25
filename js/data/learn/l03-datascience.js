// Learning Center: data science basics in Python (internship 3).
IS.learnData = IS.learnData || {};
(function () {
  const py = (o) => Object.assign({ type: 'coding', lang: 'python' }, o);
  IS.learnData.datascience = [
    {
      id: 'averages', icon: '📏', title: 'Summarizing numbers: mean, median and range',
      summary: 'Describe a whole column of numbers with one or two honest numbers.',
      tags: ['mean', 'average', 'median', 'range', 'round', 'statistic'],
      words: `<p>Data science starts with a simple question: <i>"What does this pile of numbers look like?"</i> Three summaries answer it:</p>
        <ul><li><b>Mean</b> (the everyday "average"): add everything up and divide by how many there are. <code>sum(xs) / len(xs)</code>.</li>
        <li><b>Median</b>: sort the numbers and take the <b>middle</b> one. With an even count there are two middles, so you average them. The median isn't pulled around by a few extreme values.</li>
        <li><b>Range</b>: biggest minus smallest. It tells you how spread out the data is.</li></ul>
        <p>Why two kinds of "middle"? Imagine wait times of 5, 5, 10 and 180 minutes (one ride broke down). The mean is 50 minutes, which describes nobody's experience. The median is 7.5 minutes, much closer to what most guests felt.</p>
        <p>Python helpers you'll use: <code>sum()</code>, <code>len()</code>, <code>sorted()</code> (returns a sorted copy), <code>max()</code>, <code>min()</code>, and <code>round(x, 2)</code> to keep 2 decimal places. <code>//</code> divides and drops the decimals: <code>7 // 2</code> is 3.</p>
        <div class="analogy">👟 <b>Lining people up by height:</b> the median is the person standing in the middle of the line. One very tall visitor doesn't change who's in the middle, but it does raise the average height.</div>`,
      terms: [['mean', 'Sum ÷ count.'], ['median', 'The middle value once sorted.'], ['outlier', 'An unusually large or small value.'], ['round(x, 2)', 'Rounds to 2 decimal places.'], ['//', 'Whole-number division: <code>9 // 2</code> is 4.']],
      example: {
        lang: 'python',
        intro: 'Find the median wait time:',
        code: `def median(xs):
    s = sorted(xs)
    n = len(s)
    mid = n // 2
    if n % 2 == 1:
        return s[mid]
    return (s[mid - 1] + s[mid]) / 2

median([10, 180, 5, 5])`,
        output: '7.5',
        steps: [
          { lines: [2], text: 'Sort a copy: <code>[5, 5, 10, 180]</code>.' },
          { lines: [3, 4], text: 'n is 4, so <code>mid = 4 // 2 = 2</code>.' },
          { lines: [5, 6], text: 'Odd count? Then the single middle item is at index <code>mid</code>. Here 4 is even, so skip.' },
          { lines: [7], text: 'Even count: average the two middle items at indexes 1 and 2: (5 + 10) / 2 = 7.5.' },
        ],
      },
      practice: [
        py({ id: 'L-ds-mean', title: 'Mean wait', fnName: 'mean',
          brief: '<p>Finish <code>mean(xs)</code> to return the average rounded to 2 decimals. For an empty list return <code>None</code> (you can\'t divide by zero).</p>',
          starter: 'def mean(xs):\n    return sum(xs) / len(xs)\n',
          tests: [{ args: [[10, 20, 40]], expected: 23.33 }, { args: [[]], expected: null }], hidden: [{ args: [[5]], expected: 5 }],
          hint: 'Add <code>if not xs: return None</code> at the top, and wrap the division in <code>round(…, 2)</code>.',
          solution: 'def mean(xs):\n    if not xs:\n        return None\n    return round(sum(xs) / len(xs), 2)' }),
        py({ id: 'L-ds-median', title: 'Median guests', fnName: 'median',
          brief: '<p>Finish <code>median(xs)</code>. Sort, then return the middle value (or the average of the two middle values for an even count). Empty → <code>None</code>.</p>',
          starter: 'def median(xs):\n    pass\n',
          tests: [{ args: [[3, 1, 2]], expected: 2 }, { args: [[4, 1, 3, 2]], expected: 2.5 }], hidden: [{ args: [[]], expected: null }, { args: [[7]], expected: 7 }],
          hint: 'Follow the example above, plus an empty-list check at the top.',
          solution: 'def median(xs):\n    if not xs:\n        return None\n    s = sorted(xs)\n    mid = len(s) // 2\n    if len(s) % 2 == 1:\n        return s[mid]\n    return (s[mid - 1] + s[mid]) / 2' }),
        py({ id: 'L-ds-range', title: 'Spread of waits', fnName: 'spread',
          brief: '<p>Finish <code>spread(xs)</code> to return the biggest value minus the smallest. Empty → <code>0</code>.</p>',
          starter: 'def spread(xs):\n    pass\n',
          tests: [{ args: [[10, 45, 20]], expected: 35 }, { args: [[]], expected: 0 }], hidden: [{ args: [[5]], expected: 0 }],
          hint: '<code>return max(xs) - min(xs)</code>, after checking for an empty list.',
          solution: 'def spread(xs):\n    if not xs:\n        return 0\n    return max(xs) - min(xs)' }),
      ],
    },
    {
      id: 'cleaning', icon: '🧹', title: 'Cleaning messy data',
      summary: 'Real data has blanks, typos and impossible values. Clean it before you trust it.',
      tags: ['clean', 'none', 'missing', 'invalid', 'try', 'except', 'float', 'filter'],
      words: `<p>Data from sensors, forms and spreadsheets is almost never perfect. Common problems:</p>
        <ul><li><b>Missing values</b>, shown in Python as <code>None</code>.</li>
        <li><b>Impossible values</b>, like a wait time of −5 or 9999 minutes.</li>
        <li><b>Wrong types</b>, like the text <code>"12"</code> instead of the number 12, or <code>"n/a"</code>.</li></ul>
        <p>If you calculate before cleaning, your answers will be wrong, and nobody may notice! Cleaning usually means building a new list that keeps only the good values.</p>
        <p>A <b>list comprehension</b> is a one-line way to build a filtered list: <code>[x for x in xs if x is not None]</code> reads as "x, for each x in xs, if x is not None".</p>
        <p>To convert text to a number, use <code>float("12.5")</code>. If the text isn't a number, Python raises an error. You can <b>catch</b> that error with <code>try:</code> / <code>except ValueError:</code> and skip the bad value instead of crashing.</p>
        <div class="analogy">🥕 <b>Like washing vegetables before cooking:</b> you throw out the bad ones first, or the whole dish suffers.</div>`,
      terms: [['None', 'Missing value.'], ['is not None', 'The correct way to check that something isn\'t missing.'], ['list comprehension', '<code>[x for x in xs if …]</code>: build a filtered list in one line.'], ['try / except', 'Attempt something that might fail and handle the failure.']],
      example: {
        lang: 'python',
        intro: 'Turn messy text readings into numbers, skipping the junk:',
        code: `def to_numbers(texts):
    result = []
    for t in texts:
        try:
            result.append(float(t))
        except ValueError:
            pass  # not a number: skip it
    return result

to_numbers(["12", "n/a", "7.5"])`,
        output: '[12.0, 7.5]',
        steps: [
          { lines: [2, 3], text: 'An empty result list, and a loop over each piece of text.' },
          { lines: [4, 5], text: '<code>try:</code> attempts the conversion. "12" becomes 12.0 and is appended.' },
          { lines: [6, 7], text: '"n/a" can\'t be converted, so Python raises a <code>ValueError</code>. We catch it and <code>pass</code> (do nothing), so it\'s skipped.' },
          { lines: [8], text: 'Return only the clean numbers.' },
        ],
      },
      practice: [
        py({ id: 'L-ds-drop', title: 'Drop the blanks', fnName: 'drop_missing',
          brief: '<p>Finish <code>drop_missing(xs)</code> to return a new list without any <code>None</code> values (keep the order). Note: <code>0</code> is a real value; keep it!</p>',
          starter: 'def drop_missing(xs):\n    pass\n',
          tests: [{ args: [[5, null, 7]], expected: [5, 7] }, { args: [[null]], expected: [] }], hidden: [{ args: [[0, null, 0]], expected: [0, 0] }],
          hint: '<code>return [x for x in xs if x is not None]</code>. Using <code>if x</code> would wrongly drop zeros.',
          solution: 'def drop_missing(xs):\n    return [x for x in xs if x is not None]' }),
        py({ id: 'L-ds-valid', title: 'Keep valid waits', fnName: 'valid_waits',
          brief: '<p>Finish <code>valid_waits(xs)</code>. Keep only values that are not <code>None</code> and are between 0 and 300 (inclusive).</p>',
          starter: 'def valid_waits(xs):\n    pass\n',
          tests: [{ args: [[10, -5, null, 400, 300]], expected: [10, 300] }, { args: [[]], expected: [] }], hidden: [{ args: [[0]], expected: [0] }],
          hint: 'Check None first: <code>x is not None and 0 &lt;= x &lt;= 300</code>. Python lets you chain comparisons like that.',
          solution: 'def valid_waits(xs):\n    return [x for x in xs if x is not None and 0 <= x <= 300]' }),
        py({ id: 'L-ds-convert', title: 'Text to numbers', fnName: 'to_numbers',
          brief: '<p>Finish <code>to_numbers(texts)</code> to convert each string to a float, skipping anything that isn\'t a number.</p>',
          starter: 'def to_numbers(texts):\n    return [float(t) for t in texts]\n',
          tests: [{ args: [['12', 'n/a', '7.5']], expected: [12, 7.5] }, { args: [[]], expected: [] }], hidden: [{ args: [['abc', '']], expected: [] }],
          hint: 'The starter crashes on "n/a". Use a loop with <code>try</code> / <code>except ValueError</code> like the example.',
          solution: 'def to_numbers(texts):\n    result = []\n    for t in texts:\n        try:\n            result.append(float(t))\n        except ValueError:\n            pass\n    return result' }),
      ],
    },
    {
      id: 'grouping', icon: '🧺', title: 'Grouping and totals',
      summary: 'Answer "for each category, how much?" questions with a dictionary.',
      tags: ['group', 'total', 'by', 'category', 'dict', 'aggregate', 'per'],
      words: `<p>Many data questions sound like <i>"For each land, how many guests?"</i> or <i>"For each ride, what's the average rating?"</i>. That's called <b>grouping</b>.</p>
        <p>Data often comes as a list of <b>rows</b>, where each row is a dict: <code>{"land": "Frontier", "guests": 120}</code>. To group, you keep a dict where each <b>key is a group</b> (the land) and the <b>value is the running total</b> for that group:</p>
        <p><code>totals[row["land"]] = totals.get(row["land"], 0) + row["guests"]</code></p>
        <p>For an <b>average per group</b>, you need two running numbers per group (a sum and a count), then divide at the end. A tidy way: keep one dict for sums and another for counts.</p>
        <div class="analogy">📬 <b>Like sorting mail into pigeonholes:</b> one hole per land. Each letter (row) goes into its hole, and at the end you count what's in each one.</div>`,
      terms: [['row', 'One record, here a dict of fields.'], ['group / category', 'The field you group by, like land.'], ['aggregate', 'A summary per group: total, count, average…']],
      example: {
        lang: 'python',
        intro: 'Total guests per land:',
        code: `def guests_by_land(rows):
    totals = {}
    for row in rows:
        land = row["land"]
        totals[land] = totals.get(land, 0) + row["guests"]
    return totals

guests_by_land([
    {"land": "Frontier", "guests": 120},
    {"land": "Tomorrow", "guests": 80},
    {"land": "Frontier", "guests": 30},
])`,
        output: '{"Frontier": 150, "Tomorrow": 80}',
        steps: [
          { lines: [2], text: 'One dict of running totals, empty at first.' },
          { lines: [4], text: 'Which pigeonhole does this row belong in?' },
          { lines: [5], text: 'Add this row\'s guests to that land\'s total (starting at 0 the first time).' },
          { lines: [8, 9, 10, 11, 12], text: 'Frontier gets 120 + 30 = 150; Tomorrow gets 80.' },
        ],
      },
      practice: [
        py({ id: 'L-ds-countby', title: 'Count per land', fnName: 'count_by_land',
          brief: '<p>Finish <code>count_by_land(rows)</code> to return how many rows belong to each land (each row has a <code>"land"</code> key).</p>',
          starter: 'def count_by_land(rows):\n    pass\n',
          tests: [{ args: [[{ land: 'A' }, { land: 'B' }, { land: 'A' }]], expected: { A: 2, B: 1 } }, { args: [[]], expected: {} }], hidden: [{ args: [[{ land: 'Z' }]], expected: { Z: 1 } }],
          hint: '<code>counts[row["land"]] = counts.get(row["land"], 0) + 1</code>',
          solution: 'def count_by_land(rows):\n    counts = {}\n    for row in rows:\n        counts[row["land"]] = counts.get(row["land"], 0) + 1\n    return counts' }),
        py({ id: 'L-ds-sumby', title: 'Revenue per ticket type', fnName: 'revenue_by_type',
          brief: '<p>Each row looks like <code>{"type": "1-Day", "price": 129}</code>. Finish <code>revenue_by_type(rows)</code> to return total price per type.</p>',
          starter: 'def revenue_by_type(rows):\n    pass\n',
          tests: [{ args: [[{ type: '1-Day', price: 129 }, { type: 'Hopper', price: 179 }, { type: '1-Day', price: 100 }]], expected: { '1-Day': 229, Hopper: 179 } }], hidden: [{ args: [[]], expected: {} }],
          hint: 'Same pattern as the example, adding <code>row["price"]</code>.',
          solution: 'def revenue_by_type(rows):\n    totals = {}\n    for row in rows:\n        totals[row["type"]] = totals.get(row["type"], 0) + row["price"]\n    return totals' }),
        py({ id: 'L-ds-avgby', title: 'Average rating per ride', fnName: 'avg_by_ride',
          brief: '<p>Rows look like <code>{"ride": "Tram", "stars": 4}</code>. Finish <code>avg_by_ride(rows)</code> to return each ride\'s average stars, rounded to 1 decimal.</p>',
          starter: 'def avg_by_ride(rows):\n    pass\n',
          tests: [{ args: [[{ ride: 'Tram', stars: 4 }, { ride: 'Tram', stars: 5 }, { ride: 'Coaster', stars: 3 }]], expected: { Tram: 4.5, Coaster: 3 } }], hidden: [{ args: [[{ ride: 'X', stars: 1 }, { ride: 'X', stars: 2 }, { ride: 'X', stars: 2 }]], expected: { X: 1.7 } }, { args: [[]], expected: {} }],
          hint: 'Keep <code>sums</code> and <code>counts</code> dicts. At the end: <code>{r: round(sums[r] / counts[r], 1) for r in sums}</code>.',
          solution: 'def avg_by_ride(rows):\n    sums, counts = {}, {}\n    for row in rows:\n        r = row["ride"]\n        sums[r] = sums.get(r, 0) + row["stars"]\n        counts[r] = counts.get(r, 0) + 1\n    return {r: round(sums[r] / counts[r], 1) for r in sums}' }),
      ],
    },
    {
      id: 'percentages', icon: '📈', title: 'Percentages and change over time',
      summary: 'Compare numbers fairly with percentages, shares and percent change.',
      tags: ['percent', 'percentage', 'change', 'share', 'rate', 'ratio'],
      words: `<p>Raw numbers can mislead. "500 complaints" sounds bad, unless there were 5 million guests. <b>Percentages</b> make things comparable.</p>
        <ul><li><b>Percent of a whole:</b> <code>part / whole * 100</code>. 30 out of 120 is 25%.</li>
        <li><b>Percent change:</b> <code>(new - old) / old * 100</code>. Going from 80 to 100 is +25%; from 100 to 80 is −20%. (Notice these aren't mirror images!)</li>
        <li><b>Share of a total:</b> each group's value divided by the sum of all groups, times 100. The shares add up to about 100%.</li></ul>
        <p>Watch out for <b>dividing by zero</b>. If the whole is 0, or the old value is 0, the math breaks. Decide on a sensible answer (like <code>0.0</code> or <code>None</code>) and check for it first.</p>
        <div class="analogy">🍕 <b>Like slices of pizza:</b> "3 slices" means little until you know whether the pizza had 4 slices or 12.</div>`,
      terms: [['percent', 'Out of 100: <code>part / whole * 100</code>.'], ['percent change', '<code>(new − old) / old * 100</code>.'], ['share', 'A group\'s part of the total, as a percent.']],
      example: {
        lang: 'python',
        intro: 'How much did attendance change?',
        code: `def pct_change(old, new):
    if old == 0:
        return None
    change = (new - old) / old * 100
    return round(change, 1)

pct_change(80, 100)`,
        output: '25.0',
        steps: [
          { lines: [2, 3], text: 'Guard against dividing by zero first: there\'s no meaningful percent change from 0.' },
          { lines: [4], text: '(100 − 80) / 80 × 100 = 25.' },
          { lines: [5], text: 'Round to one decimal for a clean report.' },
        ],
      },
      practice: [
        py({ id: 'L-ds-pct', title: 'Percent of guests', fnName: 'percent',
          brief: '<p>Finish <code>percent(part, whole)</code> to return <code>part / whole * 100</code> rounded to 1 decimal. If <code>whole</code> is 0, return <code>0.0</code>.</p>',
          starter: 'def percent(part, whole):\n    return part / whole * 100\n',
          tests: [{ args: [30, 120], expected: 25 }, { args: [1, 3], expected: 33.3 }], hidden: [{ args: [5, 0], expected: 0 }],
          hint: 'Check <code>if whole == 0: return 0.0</code> first, then <code>round(…, 1)</code>.',
          solution: 'def percent(part, whole):\n    if whole == 0:\n        return 0.0\n    return round(part / whole * 100, 1)' }),
        py({ id: 'L-ds-change', title: 'Percent change', fnName: 'pct_change',
          brief: '<p>Finish <code>pct_change(old, new)</code> like the example: percent change rounded to 1 decimal, <code>None</code> if <code>old</code> is 0.</p>',
          starter: 'def pct_change(old, new):\n    pass\n',
          tests: [{ args: [80, 100], expected: 25 }, { args: [100, 80], expected: -20 }], hidden: [{ args: [0, 5], expected: null }, { args: [3, 4], expected: 33.3 }],
          hint: 'Guard, compute, round. It\'s three lines.',
          solution: 'def pct_change(old, new):\n    if old == 0:\n        return None\n    return round((new - old) / old * 100, 1)' }),
        py({ id: 'L-ds-share', title: 'Share of total', fnName: 'shares',
          brief: '<p>Finish <code>shares(counts)</code>. Given <code>{"A": 30, "B": 10}</code>, return each key\'s percent of the total, rounded to 1: <code>{"A": 75.0, "B": 25.0}</code>. If the total is 0, every share is <code>0.0</code>.</p>',
          starter: 'def shares(counts):\n    pass\n',
          tests: [{ args: [{ A: 30, B: 10 }], expected: { A: 75, B: 25 } }, { args: [{}], expected: {} }], hidden: [{ args: [{ A: 0, B: 0 }], expected: { A: 0, B: 0 } }, { args: [{ A: 1, B: 2 }], expected: { A: 33.3, B: 66.7 } }],
          hint: '<code>total = sum(counts.values())</code>, then build <code>{k: round(v / total * 100, 1) for k, v in counts.items()}</code>, handling total 0.',
          solution: 'def shares(counts):\n    total = sum(counts.values())\n    if total == 0:\n        return {k: 0.0 for k in counts}\n    return {k: round(v / total * 100, 1) for k, v in counts.items()}' }),
      ],
    },
  ];
})();
