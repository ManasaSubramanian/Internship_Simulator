// Learning Center: machine learning from zero, in plain Python (internship 8).
IS.learnData = IS.learnData || {};
(function () {
  const py = (o) => Object.assign({ type: 'coding', lang: 'python' }, o);
  IS.learnData.ml = [
    {
      id: 'model-error', icon: '📐', title: 'What a model is: predictions and error',
      summary: 'A model is a formula that makes guesses. Error measures how wrong the guesses are.',
      tags: ['model', 'predict', 'prediction', 'error', 'mae', 'mse', 'linear', 'slope'],
      words: `<p><b>Machine learning</b> sounds magical, but the core idea is simple: a <b>model</b> is a formula that takes some inputs and makes a <b>prediction</b>. "Learning" means adjusting the formula\'s numbers until its predictions match real examples as closely as possible.</p>
        <p>The simplest model is a straight line: <code>prediction = slope × x + intercept</code>. If x is "guests in the park (thousands)" and the prediction is "wait time", then the slope says how much the wait grows per thousand guests, and the intercept is the wait with nobody around.</p>
        <p>To know if a model is any good, measure its <b>error</b>: how far each prediction is from the true answer.</p>
        <ul><li><b>Absolute error</b> for one guess: <code>abs(actual - predicted)</code>. Being 5 too high or 5 too low both count as 5.</li>
        <li><b>MAE</b> (mean absolute error): the average absolute error over many guesses. "On average we\'re off by 4 minutes."</li>
        <li><b>MSE</b> (mean squared error) squares each error first, so big misses count much more.</li></ul>
        <div class="analogy">🎯 <b>Like playing darts:</b> the model throws, error measures how far each dart landed from the bullseye, and training is adjusting your aim after each throw.</div>`,
      terms: [['model', 'A formula that makes predictions.'], ['prediction', 'The model\'s guess.'], ['error', 'Distance between guess and truth.'], ['MAE', 'Average of absolute errors.'], ['abs()', 'Absolute value: <code>abs(-3)</code> is 3.']],
      example: {
        lang: 'python',
        intro: 'A line model and its average error:',
        code: `def predict(slope, intercept, x):
    return slope * x + intercept

def mae(actual, predicted):
    total = 0
    for a, p in zip(actual, predicted):
        total += abs(a - p)
    return total / len(actual)

mae([30, 50], [35, 44])`,
        output: '5.5',
        steps: [
          { lines: [1, 2], text: 'The model: multiply by the slope and add the intercept. <code>predict(4, 10, 5)</code> is 30.' },
          { lines: [5], text: 'An accumulator for the total error.' },
          { lines: [6], text: '<code>zip</code> walks two lists side by side: (30, 35), then (50, 44).' },
          { lines: [7], text: 'Add each absolute error: |30 − 35| = 5 and |50 − 44| = 6.' },
          { lines: [8], text: 'Average: 11 / 2 = 5.5 minutes off, on average.' },
        ],
      },
      practice: [
        py({ id: 'L-ml-predict', title: 'Make a prediction', fnName: 'predict',
          brief: '<p>Finish <code>predict(slope, intercept, x)</code> to return <code>slope * x + intercept</code>.</p>',
          starter: 'def predict(slope, intercept, x):\n    return 0\n',
          tests: [{ args: [4, 10, 5], expected: 30 }, { args: [2, 0, 3], expected: 6 }], hidden: [{ args: [0, 7, 100], expected: 7 }],
          hint: 'One line: <code>return slope * x + intercept</code>',
          solution: 'def predict(slope, intercept, x):\n    return slope * x + intercept' }),
        py({ id: 'L-ml-abs', title: 'Absolute errors', fnName: 'abs_errors',
          brief: '<p>Finish <code>abs_errors(actual, predicted)</code> to return a list of the absolute error for each pair.</p>',
          starter: 'def abs_errors(actual, predicted):\n    pass\n',
          tests: [{ args: [[30, 50], [35, 44]], expected: [5, 6] }, { args: [[], []], expected: [] }], hidden: [{ args: [[10], [10]], expected: [0] }],
          hint: '<code>return [abs(a - p) for a, p in zip(actual, predicted)]</code>',
          solution: 'def abs_errors(actual, predicted):\n    return [abs(a - p) for a, p in zip(actual, predicted)]' }),
        py({ id: 'L-ml-mse', title: 'Mean squared error', fnName: 'mse',
          brief: '<p>Finish <code>mse(actual, predicted)</code>: square each error, then average. Round to 2 decimals. Empty lists → <code>0.0</code>.</p>',
          starter: 'def mse(actual, predicted):\n    pass\n',
          tests: [{ args: [[30, 50], [35, 44]], expected: 30.5 }, { args: [[], []], expected: 0 }], hidden: [{ args: [[1, 2, 3], [1, 2, 4]], expected: 0.33 }],
          hint: 'Square with <code>** 2</code>: <code>(a - p) ** 2</code>. Sum them, divide by the count, round.',
          solution: 'def mse(actual, predicted):\n    if not actual:\n        return 0.0\n    total = sum((a - p) ** 2 for a, p in zip(actual, predicted))\n    return round(total / len(actual), 2)' }),
      ],
    },
    {
      id: 'train-test', icon: '🧪', title: 'Training, testing and accuracy',
      summary: 'Check a model on data it has never seen, and compare it to a simple baseline.',
      tags: ['train', 'test', 'split', 'accuracy', 'baseline', 'overfit', 'classification'],
      words: `<p>If you test a model on the same examples it learned from, it can look perfect just by memorizing them. That\'s called <b>overfitting</b>, like a student who memorized last year\'s exam answers but can\'t solve a new question.</p>
        <p>So we <b>split</b> the data: a <b>training set</b> the model learns from, and a <b>test set</b> held back to check it at the end. The test score is the honest one.</p>
        <p>For <b>classification</b> models (ones that predict a category, like "busy" or "quiet"), the simplest score is <b>accuracy</b>: the fraction of predictions that were exactly right.</p>
        <p>Always compare with a <b>baseline</b>: the score of a silly model that always guesses the most common answer. If 90% of days are "quiet", always guessing "quiet" gets 90% accuracy. A model with 88% accuracy is worse than doing nothing!</p>
        <div class="analogy">📚 <b>Like studying for a test:</b> practice problems are the training set; the real exam (new questions!) is the test set.</div>`,
      terms: [['training set', 'Data the model learns from.'], ['test set', 'Data held back to measure the model honestly.'], ['overfitting', 'Memorizing training data instead of learning patterns.'], ['accuracy', 'Right predictions ÷ all predictions.'], ['baseline', 'A simple reference model to beat.']],
      example: {
        lang: 'python',
        intro: 'Accuracy of some predictions:',
        code: `def accuracy(truth, preds):
    right = 0
    for t, p in zip(truth, preds):
        if t == p:
            right += 1
    return right / len(truth)

accuracy(["busy", "quiet", "busy"], ["busy", "busy", "busy"])`,
        output: '0.6666…',
        steps: [
          { lines: [2], text: 'Count how many predictions were right.' },
          { lines: [3, 4, 5], text: 'Compare each true label with its prediction: ✔, ✘, ✔.' },
          { lines: [6], text: '2 right out of 3 ≈ 0.67 (67%).' },
        ],
      },
      practice: [
        py({ id: 'L-ml-acc', title: 'Accuracy', fnName: 'accuracy',
          brief: '<p>Finish <code>accuracy(truth, preds)</code>: the fraction of matching pairs, rounded to 2 decimals. Empty → <code>0.0</code>.</p>',
          starter: 'def accuracy(truth, preds):\n    pass\n',
          tests: [{ args: [['a', 'b', 'a'], ['a', 'a', 'a']], expected: 0.67 }, { args: [[], []], expected: 0 }], hidden: [{ args: [[1, 1], [1, 1]], expected: 1 }],
          hint: 'Follow the example, then <code>round(…, 2)</code>, with an empty check first.',
          solution: 'def accuracy(truth, preds):\n    if not truth:\n        return 0.0\n    right = sum(1 for t, p in zip(truth, preds) if t == p)\n    return round(right / len(truth), 2)' }),
        py({ id: 'L-ml-split', title: 'Hold out a test set', fnName: 'split',
          brief: '<p>Finish <code>split(rows, n_test)</code> to return <code>[train, test]</code>, where <code>test</code> is the <b>last</b> <code>n_test</code> rows and <code>train</code> is everything before them.</p>',
          starter: 'def split(rows, n_test):\n    return [rows, rows]\n',
          tests: [{ args: [[1, 2, 3, 4, 5], 2], expected: [[1, 2, 3], [4, 5]] }, { args: [[1, 2], 0], expected: [[1, 2], []] }], hidden: [{ args: [[7], 1], expected: [[], [7]] }],
          hint: 'Slicing: <code>rows[:k]</code> is everything before index k, <code>rows[k:]</code> is everything from k on. Use <code>k = len(rows) - n_test</code>.',
          solution: 'def split(rows, n_test):\n    k = len(rows) - n_test\n    return [rows[:k], rows[k:]]' }),
        py({ id: 'L-ml-base', title: 'Baseline guess', fnName: 'baseline',
          brief: '<p>Finish <code>baseline(labels)</code> to return the most common label (ties → the one that comes first alphabetically). This is what a "do-nothing" model would always guess.</p>',
          starter: 'def baseline(labels):\n    return labels[0]\n',
          tests: [{ args: [['quiet', 'busy', 'quiet']], expected: 'quiet' }, { args: [['b', 'a']], expected: 'a' }], hidden: [{ args: [['busy', 'busy', 'quiet']], expected: 'busy' }],
          hint: 'Count with a dict, then <code>min(counts, key=lambda k: (-counts[k], k))</code> picks the highest count, then alphabetical.',
          solution: 'def baseline(labels):\n    counts = {}\n    for x in labels:\n        counts[x] = counts.get(x, 0) + 1\n    return min(counts, key=lambda k: (-counts[k], k))' }),
      ],
    },
    {
      id: 'features', icon: '🎚️', title: 'Features and scaling',
      summary: 'Turn raw data into numbers a model can use, on comparable scales.',
      tags: ['feature', 'scale', 'normalize', 'min-max', 'standardize', 'one-hot', 'category'],
      words: `<p>The inputs a model uses are called <b>features</b>: temperature, day of week, number of guests… Models only understand <b>numbers</b>, and they work best when features are on <b>similar scales</b>.</p>
        <p>Why does scale matter? If one feature is "guests" (0 to 80,000) and another is "is it raining" (0 or 1), the huge numbers drown out the small ones. Two common fixes:</p>
        <ul><li><b>Min-max scaling:</b> <code>(x - min) / (max - min)</code> squeezes values into 0…1. The smallest becomes 0, the largest becomes 1.</li>
        <li><b>Standardizing:</b> <code>(x - mean) / std</code> centers values around 0.</li></ul>
        <p><b>Categories</b> (like the land: "Frontier", "Tomorrow") aren\'t numbers. Giving them 1, 2, 3 would wrongly suggest Tomorrow is "bigger" than Frontier. Instead use <b>one-hot encoding</b>: one 0/1 column per category, with a 1 only in the matching column.</p>
        <div class="analogy">🌡️ <b>Like converting currencies:</b> you can\'t compare 100 yen and 100 dollars until you put them on the same scale.</div>`,
      terms: [['feature', 'One input to a model.'], ['min-max scaling', 'Rescale values to 0…1.'], ['one-hot', 'A 0/1 column per category.']],
      example: {
        lang: 'python',
        intro: 'Scale a list of values to the 0…1 range:',
        code: `def min_max(xs):
    lo = min(xs)
    hi = max(xs)
    if hi == lo:
        return [0.0 for x in xs]
    return [round((x - lo) / (hi - lo), 2) for x in xs]

min_max([10, 20, 50])`,
        output: '[0.0, 0.25, 1.0]',
        steps: [
          { lines: [2, 3], text: 'Find the smallest (10) and largest (50).' },
          { lines: [4, 5], text: 'If every value is the same, the range is 0, and dividing would crash, so return all zeros.' },
          { lines: [6], text: '(10−10)/40 = 0, (20−10)/40 = 0.25, (50−10)/40 = 1.' },
        ],
      },
      practice: [
        py({ id: 'L-ml-minmax', title: 'Min-max scaling', fnName: 'min_max',
          brief: '<p>Finish <code>min_max(xs)</code> exactly like the example: scale to 0…1, rounded to 2; all zeros if every value is equal.</p>',
          starter: 'def min_max(xs):\n    pass\n',
          tests: [{ args: [[10, 20, 50]], expected: [0, 0.25, 1] }, { args: [[5, 5]], expected: [0, 0] }], hidden: [{ args: [[3, 1, 2]], expected: [1, 0, 0.5] }],
          hint: 'Re-type the example yourself. It\'s the best way to remember it.',
          solution: 'def min_max(xs):\n    lo = min(xs)\n    hi = max(xs)\n    if hi == lo:\n        return [0.0 for x in xs]\n    return [round((x - lo) / (hi - lo), 2) for x in xs]' }),
        py({ id: 'L-ml-onehot', title: 'One-hot encode', fnName: 'one_hot',
          brief: '<p>Finish <code>one_hot(value, categories)</code> to return a list with a <code>1</code> where the category equals <code>value</code> and <code>0</code> everywhere else. Example: <code>one_hot("B", ["A", "B", "C"])</code> → <code>[0, 1, 0]</code>.</p>',
          starter: 'def one_hot(value, categories):\n    pass\n',
          tests: [{ args: ['B', ['A', 'B', 'C']], expected: [0, 1, 0] }, { args: ['Z', ['A', 'B']], expected: [0, 0] }], hidden: [{ args: ['A', ['A']], expected: [1] }],
          hint: '<code>return [1 if c == value else 0 for c in categories]</code>',
          solution: 'def one_hot(value, categories):\n    return [1 if c == value else 0 for c in categories]' }),
        py({ id: 'L-ml-center', title: 'Center the data', fnName: 'center',
          brief: '<p>Finish <code>center(xs)</code> to subtract the mean from every value (so the new mean is 0). Round each to 2. Empty → <code>[]</code>.</p>',
          starter: 'def center(xs):\n    pass\n',
          tests: [{ args: [[1, 2, 3]], expected: [-1, 0, 1] }, { args: [[]], expected: [] }], hidden: [{ args: [[10, 20]], expected: [-5, 5] }, { args: [[1, 2]], expected: [-0.5, 0.5] }],
          hint: '<code>m = sum(xs) / len(xs)</code>, then <code>[round(x - m, 2) for x in xs]</code>.',
          solution: 'def center(xs):\n    if not xs:\n        return []\n    m = sum(xs) / len(xs)\n    return [round(x - m, 2) for x in xs]' }),
      ],
    },
    {
      id: 'neighbors', icon: '📍', title: 'Classifying with nearest neighbors',
      summary: 'Predict a category by looking at the most similar examples you already know.',
      tags: ['knn', 'neighbor', 'nearest', 'distance', 'classify', 'threshold', 'label'],
      words: `<p>One of the easiest models to understand is <b>k-nearest neighbors</b> (k-NN). To classify something new, find the <b>k</b> known examples most similar to it, and let them vote.</p>
        <p>"Similar" means <b>close together</b>. If each example is a point with two features, like (temperature, guests), the distance between two points is the straight-line distance you learned in geometry:</p>
        <p><code>distance = √((x₁ − x₂)² + (y₁ − y₂)²)</code>. In Python, <code>** 0.5</code> is a square root.</p>
        <p>With k = 1, the new point simply copies the label of its single closest neighbor. With larger k, the most common label among the k closest wins.</p>
        <p>Another very simple classifier is a <b>threshold</b>: if a score is at or above a cutoff, say "yes", otherwise "no". Many real models output a score between 0 and 1, and a threshold turns it into a decision.</p>
        <div class="analogy">🏘️ <b>Like guessing a stranger\'s favorite team:</b> look at their closest neighbors on the street. If most of them cheer for the same team, that\'s your best guess.</div>`,
      terms: [['k-NN', 'Classify by majority vote of the k closest examples.'], ['distance', 'How far apart two points are.'], ['label', 'The category an example belongs to.'], ['threshold', 'A cutoff that turns a score into yes/no.']],
      example: {
        lang: 'python',
        intro: 'The distance between two points, and the label of the closest one:',
        code: `def distance(a, b):
    return ((a[0] - b[0]) ** 2 + (a[1] - b[1]) ** 2) ** 0.5

def nearest_label(examples, point):
    best = min(examples, key=lambda e: distance(e, point))
    return best[2]

nearest_label([[1, 1, "quiet"], [9, 9, "busy"]], [8, 7])`,
        output: '"busy"',
        steps: [
          { lines: [1, 2], text: 'Straight-line distance using the first two numbers of each point.' },
          { lines: [5], text: '<code>min</code> with a <code>key</code> finds the example with the smallest distance to our point.' },
          { lines: [6], text: 'Each example is [x, y, label], so index 2 is its label.' },
          { lines: [8], text: '(8, 7) is much closer to (9, 9) than to (1, 1), so the answer is "busy".' },
        ],
      },
      practice: [
        py({ id: 'L-ml-dist', title: 'Distance', fnName: 'distance',
          brief: '<p>Finish <code>distance(a, b)</code> for two points <code>[x, y]</code>, rounded to 2 decimals.</p>',
          starter: 'def distance(a, b):\n    pass\n',
          tests: [{ args: [[0, 0], [3, 4]], expected: 5 }, { args: [[1, 1], [1, 1]], expected: 0 }], hidden: [{ args: [[0, 0], [1, 1]], expected: 1.41 }],
          hint: 'Use the example\'s formula and wrap it in <code>round(…, 2)</code>.',
          solution: 'def distance(a, b):\n    return round(((a[0] - b[0]) ** 2 + (a[1] - b[1]) ** 2) ** 0.5, 2)' }),
        py({ id: 'L-ml-nearest', title: 'Nearest neighbor label', fnName: 'nearest_label',
          brief: '<p>Finish <code>nearest_label(examples, point)</code>. Each example is <code>[x, y, label]</code>; return the label of the example closest to <code>point</code>.</p>',
          starter: 'def nearest_label(examples, point):\n    return examples[0][2]\n',
          tests: [{ args: [[[1, 1, 'quiet'], [9, 9, 'busy']], [8, 7]], expected: 'busy' }, { args: [[[1, 1, 'quiet'], [9, 9, 'busy']], [2, 0]], expected: 'quiet' }], hidden: [{ args: [[[5, 5, 'x']], [0, 0]], expected: 'x' }],
          hint: 'Write a small distance helper inside, then <code>min(examples, key=…)</code>.',
          solution: 'def nearest_label(examples, point):\n    def dist(e):\n        return ((e[0] - point[0]) ** 2 + (e[1] - point[1]) ** 2) ** 0.5\n    return min(examples, key=dist)[2]' }),
        py({ id: 'L-ml-thresh', title: 'Apply a threshold', fnName: 'classify',
          brief: '<p>Finish <code>classify(scores, cutoff)</code> to return <code>1</code> for each score ≥ cutoff and <code>0</code> otherwise.</p>',
          starter: 'def classify(scores, cutoff):\n    pass\n',
          tests: [{ args: [[0.2, 0.7, 0.5], 0.5], expected: [0, 1, 1] }, { args: [[], 0.5], expected: [] }], hidden: [{ args: [[0.49], 0.5], expected: [0] }],
          hint: '<code>return [1 if s &gt;= cutoff else 0 for s in scores]</code>',
          solution: 'def classify(scores, cutoff):\n    return [1 if s >= cutoff else 0 for s in scores]' }),
      ],
    },
  ];
})();
