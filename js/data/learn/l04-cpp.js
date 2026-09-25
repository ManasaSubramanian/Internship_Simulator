// Learning Center: C++ from zero (internship 4). The in-game C++ runs C-style
// code (functions, arrays, char strings), so the lessons stick to that.
IS.learnData = IS.learnData || {};
(function () {
  const cpp = (o) => Object.assign({ type: 'coding', lang: 'cpp', fnName: undefined }, o);
  IS.learnData.cpp = [
    {
      id: 'types-functions', icon: '🧱', title: 'Types and functions',
      summary: 'In C++ every value has a declared type. Learn int, double, bool and how to write a function.',
      tags: ['int', 'double', 'bool', 'type', 'function', 'return', 'division'],
      words: `<p><b>C++</b> is a fast language used where speed and control matter: games, robots, animatronic figures, engines. It's stricter than JavaScript or Python: you must say what <b>type</b> every value is.</p>
        <ul><li><code>int</code>: whole numbers like <code>-3</code>, <code>0</code>, <code>90</code>.</li>
        <li><code>double</code>: numbers with decimals like <code>2.5</code>.</li>
        <li><code>bool</code>: <code>true</code> or <code>false</code>.</li>
        <li><code>char</code>: a single character like <code>'A'</code> (single quotes).</li></ul>
        <p>A function starts with the type it <b>returns</b>, then its name, then its inputs, each with a type: <code>int add(int a, int b)</code>. Every statement ends with a semicolon <code>;</code>, and code blocks live inside <code>{ }</code>.</p>
        <p>⚠️ <b>Integer division:</b> when you divide two <code>int</code>s, C++ throws away the decimals. <code>7 / 2</code> is <code>3</code>, not 3.5. The remainder is available with <code>%</code>: <code>7 % 2</code> is <code>1</code>. To get decimals, use <code>double</code>s: <code>7.0 / 2</code> is <code>3.5</code>.</p>
        <div class="analogy">🏷️ <b>Like labeled storage bins:</b> a bin labeled "whole numbers" can't hold 2.5. C++ checks every label before your program even runs, which catches many mistakes early.</div>`,
      terms: [['type', 'What kind of value something is: int, double, bool, char…'], ['int', 'Whole number.'], ['double', 'Number with decimals.'], [';', 'Ends a statement. Forgetting it is the most common C++ error!'], ['integer division', '<code>int / int</code> drops the decimals.']],
      example: {
        lang: 'cpp',
        intro: 'Convert seconds into whole minutes and leftover seconds:',
        code: `int wholeMinutes(int seconds) {
  return seconds / 60;
}

int leftoverSeconds(int seconds) {
  return seconds % 60;
}

// wholeMinutes(150) gives 2, leftoverSeconds(150) gives 30`,
        output: '2 and 30',
        steps: [
          { lines: [1], text: 'Returns an <code>int</code>, is named <code>wholeMinutes</code>, and takes one <code>int</code> called <code>seconds</code>.' },
          { lines: [2], text: 'Integer division: 150 / 60 is 2.5, but the decimals are dropped, giving <b>2</b>. The semicolon ends the statement.' },
          { lines: [5, 6], text: '<code>%</code> gives the remainder: 150 − 2×60 = <b>30</b>.' },
          { lines: [9], text: 'A comment starts with <code>//</code>. The two functions together turn 150 seconds into "2 min 30 s".' },
        ],
      },
      practice: [
        cpp({ id: 'L-cpp-double', title: 'Double it', brief: '<p>Finish <code>int doubleIt(int n)</code> to return n times 2.</p>',
          starter: 'int doubleIt(int n) {\n  return 0; // fix me\n}\n',
          tests: [{ call: 'doubleIt(4)', expected: '8' }, { call: 'doubleIt(-3)', expected: '-6' }], hidden: [{ call: 'doubleIt(0)', expected: '0' }],
          hint: '<code>return n * 2;</code>. Don\'t forget the semicolon.',
          solution: 'int doubleIt(int n) {\n  return n * 2;\n}' }),
        cpp({ id: 'L-cpp-avg', title: 'Average of two', brief: '<p>Finish <code>double average2(double a, double b)</code> to return the average of a and b (with decimals).</p>',
          starter: 'double average2(double a, double b) {\n  return 0;\n}\n',
          tests: [{ call: 'average2(3, 4)', expected: '3.5' }, { call: 'average2(10, 20)', expected: '15' }], hidden: [{ call: 'average2(-2, 2)', expected: '0' }],
          hint: '<code>return (a + b) / 2;</code>. Because a and b are doubles, the decimals are kept.',
          solution: 'double average2(double a, double b) {\n  return (a + b) / 2;\n}' }),
        cpp({ id: 'L-cpp-minutes', title: 'Minutes in a show', brief: '<p>Finish <code>int showMinutes(int seconds)</code> to return the number of <b>whole</b> minutes, rounding <b>up</b> if there are leftover seconds (a 61-second show needs a 2-minute slot).</p>',
          starter: 'int showMinutes(int seconds) {\n  return seconds / 60;\n}\n',
          tests: [{ call: 'showMinutes(120)', expected: '2' }, { call: 'showMinutes(61)', expected: '2' }], hidden: [{ call: 'showMinutes(0)', expected: '0' }, { call: 'showMinutes(59)', expected: '1' }],
          hint: 'If <code>seconds % 60</code> is not 0, add 1 to <code>seconds / 60</code>.',
          solution: 'int showMinutes(int seconds) {\n  int m = seconds / 60;\n  if (seconds % 60 != 0) {\n    m = m + 1;\n  }\n  return m;\n}' }),
      ],
    },
    {
      id: 'control', icon: '🔁', title: 'Decisions and loops',
      summary: 'Use if/else to choose and for loops to repeat.',
      tags: ['if', 'else', 'for', 'loop', 'while', 'condition'],
      words: `<p><b>if / else</b> works like in most languages: <code>if (condition) { … } else { … }</code>. Conditions use <code>&lt; &gt; &lt;= &gt;= == !=</code>, and you combine them with <code>&amp;&amp;</code> (and), <code>||</code> (or) and <code>!</code> (not).</p>
        <p>The classic C++ <b>for loop</b> has three parts inside the parentheses, separated by semicolons:</p>
        <p><code>for (int i = 1; i &lt;= 5; i++) { … }</code></p>
        <ol><li><b>Start:</b> <code>int i = 1</code> creates a counter.</li>
        <li><b>Keep going while:</b> <code>i &lt;= 5</code> is checked before each pass.</li>
        <li><b>Step:</b> <code>i++</code> adds 1 to the counter after each pass.</li></ol>
        <p>So the body runs with i = 1, 2, 3, 4, 5, then stops. Combined with an accumulator variable (like <code>int total = 0;</code>), loops let you add, multiply or count.</p>
        <div class="analogy">🏃 <b>Like running laps:</b> start at lap 1, keep running while you're at lap 5 or less, and add one after every lap.</div>`,
      terms: [['i++', 'Adds 1 to i.'], ['for (start; while; step)', 'The three parts of a counting loop.'], ['&&, ||, !', 'and, or, not.'], ['accumulator', 'A variable updated every pass to build the answer.']],
      example: {
        lang: 'cpp',
        intro: 'Add up the numbers from 1 to n:',
        code: `int sumTo(int n) {
  int total = 0;
  for (int i = 1; i <= n; i++) {
    total = total + i;
  }
  return total;
}

// sumTo(4) is 1 + 2 + 3 + 4 = 10`,
        output: '10',
        steps: [
          { lines: [2], text: 'An accumulator starting at 0.' },
          { lines: [3], text: 'Counter i starts at 1, runs while i ≤ n, and increases by 1 each time.' },
          { lines: [4], text: 'Each pass adds i: total goes 1, 3, 6, 10.' },
          { lines: [6], text: 'After the loop, return the total. For n = 0 the loop never runs, so we return 0.' },
        ],
      },
      practice: [
        cpp({ id: 'L-cpp-max', title: 'Bigger of two', brief: '<p>Finish <code>int maxOf(int a, int b)</code> to return the larger number.</p>',
          starter: 'int maxOf(int a, int b) {\n  return a;\n}\n',
          tests: [{ call: 'maxOf(3, 9)', expected: '9' }, { call: 'maxOf(7, 2)', expected: '7' }], hidden: [{ call: 'maxOf(-4, -1)', expected: '-1' }, { call: 'maxOf(5, 5)', expected: '5' }],
          hint: '<code>if (a &gt; b) { return a; } else { return b; }</code>',
          solution: 'int maxOf(int a, int b) {\n  if (a > b) {\n    return a;\n  } else {\n    return b;\n  }\n}' }),
        cpp({ id: 'L-cpp-fact', title: 'Factorial', brief: '<p>Finish <code>int factorial(int n)</code>: multiply 1 × 2 × … × n. By definition, <code>factorial(0)</code> is 1.</p>',
          starter: 'int factorial(int n) {\n  int result = 0;\n  return result;\n}\n',
          tests: [{ call: 'factorial(4)', expected: '24' }, { call: 'factorial(1)', expected: '1' }], hidden: [{ call: 'factorial(0)', expected: '1' }, { call: 'factorial(6)', expected: '720' }],
          hint: 'Start <code>result</code> at <b>1</b> (multiplying by 0 always gives 0!), then loop i from 1 to n doing <code>result = result * i;</code>.',
          solution: 'int factorial(int n) {\n  int result = 1;\n  for (int i = 1; i <= n; i++) {\n    result = result * i;\n  }\n  return result;\n}' }),
        cpp({ id: 'L-cpp-evens', title: 'Count even numbers', brief: '<p>Finish <code>int countEvens(int n)</code> to return how many even numbers there are from 1 to n (inclusive).</p>',
          starter: 'int countEvens(int n) {\n  return n;\n}\n',
          tests: [{ call: 'countEvens(10)', expected: '5' }, { call: 'countEvens(3)', expected: '1' }], hidden: [{ call: 'countEvens(0)', expected: '0' }, { call: 'countEvens(1)', expected: '0' }],
          hint: 'Loop i from 1 to n, and <code>if (i % 2 == 0) count++;</code>',
          solution: 'int countEvens(int n) {\n  int count = 0;\n  for (int i = 1; i <= n; i++) {\n    if (i % 2 == 0) {\n      count++;\n    }\n  }\n  return count;\n}' }),
      ],
    },
    {
      id: 'arrays', icon: '📊', title: 'Arrays: many values in a row',
      summary: 'Store sensor readings in an array and loop over them with an index.',
      tags: ['array', 'index', 'length', 'readings', 'sensor', 'max', 'sum'],
      words: `<p>An <b>array</b> is a row of values of the same type, stored side by side: <code>int readings[4] = {3, 8, 1, 6};</code> The number in brackets is how many items it holds.</p>
        <p>Items are numbered from <b>0</b>: <code>readings[0]</code> is 3 and <code>readings[3]</code> is 6. There is no <code>readings[4]</code>. Reading past the end is a serious bug in C++, because the language doesn't stop you.</p>
        <p>A plain C-style array doesn't know its own length. So functions take the array <b>and</b> its length: <code>int sumArray(int a[], int n)</code>. Then you loop with an index from 0 up to (but not including) n:</p>
        <p><code>for (int i = 0; i &lt; n; i++) { … a[i] … }</code></p>
        <div class="analogy">📦 <b>Like numbered lockers in a row:</b> you walk from locker 0 to the last one and check each. If you try locker number n, you're opening someone else's locker.</div>`,
      terms: [['array', 'Fixed-size row of same-type values.'], ['a[i]', 'The item at index i (starting at 0).'], ['i < n', 'The loop stops before n, because the last index is n − 1.']],
      example: {
        lang: 'cpp',
        intro: 'Find the index of the biggest reading:',
        code: `int indexOfMax(int a[], int n) {
  int best = 0;
  for (int i = 1; i < n; i++) {
    if (a[i] > a[best]) {
      best = i;
    }
  }
  return best;
}

// a = {3, 8, 1, 6}: indexOfMax(a, 4) is 1`,
        output: '1',
        steps: [
          { lines: [1], text: 'Takes the array and its length n.' },
          { lines: [2], text: 'Assume item 0 is the biggest so far. We store its <b>index</b>, not its value.' },
          { lines: [3], text: 'Check the rest, from index 1 up to n − 1.' },
          { lines: [4, 5], text: 'Found a bigger one? Remember its index. 8 at index 1 beats 3; 1 and 6 don\'t beat 8.' },
          { lines: [8], text: 'Return index 1.' },
        ],
      },
      practice: [
        cpp({ id: 'L-cpp-sum', title: 'Sum the readings', brief: '<p>Finish <code>int sumArray(int a[], int n)</code> to return the sum of the first n items.</p>',
          starter: 'int sumArray(int a[], int n) {\n  int total = 0;\n  return total;\n}\n',
          tests: [{ setup: 'int a[3] = {2, 4, 6};', call: 'sumArray(a, 3)', expected: '12' }, { setup: 'int a[2] = {-1, 1};', call: 'sumArray(a, 2)', expected: '0' }], hidden: [{ setup: 'int a[4] = {5, 5, 5, 5};', call: 'sumArray(a, 4)', expected: '20' }],
          hint: '<code>for (int i = 0; i &lt; n; i++) { total += a[i]; }</code>',
          solution: 'int sumArray(int a[], int n) {\n  int total = 0;\n  for (int i = 0; i < n; i++) {\n    total += a[i];\n  }\n  return total;\n}' }),
        cpp({ id: 'L-cpp-neg', title: 'Count faults', brief: '<p>A sensor reports a negative number when it faults. Finish <code>int countNegative(int a[], int n)</code> to count the negative readings.</p>',
          starter: 'int countNegative(int a[], int n) {\n  return 0;\n}\n',
          tests: [{ setup: 'int a[4] = {3, -1, 0, -7};', call: 'countNegative(a, 4)', expected: '2' }, { setup: 'int a[2] = {-2, -2};', call: 'countNegative(a, 2)', expected: '2' }], hidden: [{ setup: 'int a[3] = {0, 1, 2};', call: 'countNegative(a, 3)', expected: '0' }],
          hint: 'Loop over the array with a counter, and <code>if (a[i] &lt; 0) count++;</code>',
          solution: 'int countNegative(int a[], int n) {\n  int count = 0;\n  for (int i = 0; i < n; i++) {\n    if (a[i] < 0) {\n      count++;\n    }\n  }\n  return count;\n}' }),
        cpp({ id: 'L-cpp-maxval', title: 'Highest reading', brief: '<p>Finish <code>int maxValue(int a[], int n)</code> to return the largest value (n is at least 1). Watch out: readings can all be negative.</p>',
          starter: 'int maxValue(int a[], int n) {\n  int best = 0;\n  for (int i = 0; i < n; i++) {\n    if (a[i] > best) {\n      best = a[i];\n    }\n  }\n  return best;\n}\n',
          tests: [{ setup: 'int a[3] = {3, 9, 2};', call: 'maxValue(a, 3)', expected: '9' }, { setup: 'int a[3] = {-5, -2, -9};', call: 'maxValue(a, 3)', expected: '-2' }], hidden: [{ setup: 'int a[1]; a[0] = 4;', call: 'maxValue(a, 1)', expected: '4' }],
          hint: 'The starter begins at 0, which beats every negative number. Start with <code>int best = a[0];</code> instead.',
          solution: 'int maxValue(int a[], int n) {\n  int best = a[0];\n  for (int i = 1; i < n; i++) {\n    if (a[i] > best) {\n      best = a[i];\n    }\n  }\n  return best;\n}' }),
      ],
    },
    {
      id: 'c-strings', icon: '🔤', title: 'Text as characters (C strings)',
      summary: 'In C-style C++, text is an array of characters that ends with a special zero character.',
      tags: ['char', 'string', 'text', 'strlen', 'character', 'message'],
      words: `<p>In C-style C++, a piece of text is an <b>array of <code>char</code></b>. The text <code>"CAT"</code> is stored as four characters: <code>'C'</code>, <code>'A'</code>, <code>'T'</code>, and a hidden <b>null character</b> <code>'\\0'</code> that marks the end.</p>
        <p>Because of that end marker, a function doesn't need the length. It can walk the characters until it reaches <code>'\\0'</code>:</p>
        <p><code>for (int i = 0; s[i] != '\\0'; i++) { … s[i] … }</code></p>
        <p>A function receives text as <code>const char s[]</code>. <code>const</code> is a promise not to change it. Single characters use <b>single quotes</b> (<code>'a'</code>) while whole strings use <b>double quotes</b> (<code>"abc"</code>).</p>
        <div class="analogy">🚂 <b>Like a train:</b> each car carries one letter, and the caboose (<code>'\\0'</code>) tells you the train has ended.</div>`,
      terms: [['char', 'One character, in single quotes: <code>\'A\'</code>.'], ['\'\\0\'', 'The null character that ends every C string.'], ['const char s[]', 'Read-only text passed into a function.']],
      example: {
        lang: 'cpp',
        intro: 'Count how many times a letter appears:',
        code: `int countChar(const char s[], char c) {
  int count = 0;
  for (int i = 0; s[i] != '\\0'; i++) {
    if (s[i] == c) {
      count++;
    }
  }
  return count;
}

// countChar("BANANA", 'A') is 3`,
        output: '3',
        steps: [
          { lines: [1], text: 'Takes read-only text and one character to look for.' },
          { lines: [3], text: 'Walk the characters until the null character. For "BANANA", i goes 0 to 5.' },
          { lines: [4, 5], text: 'Compare the current character with <code>c</code> using <code>==</code>. Every \'A\' adds one.' },
          { lines: [8], text: 'Three A\'s, so return 3.' },
        ],
      },
      practice: [
        cpp({ id: 'L-cpp-len', title: 'Length of a message', brief: '<p>Finish <code>int textLength(const char s[])</code> to count the characters before <code>\'\\0\'</code> (without using <code>strlen</code>).</p>',
          starter: 'int textLength(const char s[]) {\n  return 0;\n}\n',
          tests: [{ call: 'textLength("HELLO")', expected: '5' }, { call: 'textLength("A")', expected: '1' }], hidden: [{ call: 'textLength("")', expected: '0' }],
          hint: '<code>int n = 0; while (s[n] != \'\\0\') { n++; } return n;</code>',
          solution: 'int textLength(const char s[]) {\n  int n = 0;\n  while (s[n] != \'\\0\') {\n    n++;\n  }\n  return n;\n}' }),
        cpp({ id: 'L-cpp-vowels', title: 'Count vowels', brief: '<p>Finish <code>int countVowels(const char s[])</code> to count the lowercase vowels a, e, i, o, u.</p>',
          starter: 'int countVowels(const char s[]) {\n  return 0;\n}\n',
          tests: [{ call: 'countVowels("banana")', expected: '3' }, { call: 'countVowels("sky")', expected: '0' }], hidden: [{ call: 'countVowels("aeiou")', expected: '5' }, { call: 'countVowels("")', expected: '0' }],
          hint: 'Inside the loop: <code>char c = s[i]; if (c == \'a\' || c == \'e\' || c == \'i\' || c == \'o\' || c == \'u\') count++;</code>',
          solution: 'int countVowels(const char s[]) {\n  int count = 0;\n  for (int i = 0; s[i] != \'\\0\'; i++) {\n    char c = s[i];\n    if (c == \'a\' || c == \'e\' || c == \'i\' || c == \'o\' || c == \'u\') {\n      count++;\n    }\n  }\n  return count;\n}' }),
        cpp({ id: 'L-cpp-starts', title: 'Command check', brief: '<p>Show commands start with a letter code. Finish <code>bool startsWith(const char s[], char c)</code> to return <code>true</code> if the text is not empty and its first character is <code>c</code>.</p>',
          starter: 'bool startsWith(const char s[], char c) {\n  return false;\n}\n',
          tests: [{ call: 'startsWith("GO", \'G\')', bool: true, expected: 'true' }, { call: 'startsWith("STOP", \'G\')', bool: true, expected: 'false' }], hidden: [{ call: 'startsWith("", \'G\')', bool: true, expected: 'false' }],
          hint: 'The first character is <code>s[0]</code>. For empty text, <code>s[0]</code> is <code>\'\\0\'</code>, which never equals a real letter.',
          solution: 'bool startsWith(const char s[], char c) {\n  return s[0] != \'\\0\' && s[0] == c;\n}' }),
      ],
    },
  ];
})();
