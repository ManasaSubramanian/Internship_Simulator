// Reference solutions for internship 8 (Machine Learning, Python). Test suite only.
module.exports = {
  c1: `def mse(y_true, y_pred):
    n = len(y_true)
    if not n:
        return 0.0
    return round(sum((t - p) ** 2 for t, p in zip(y_true, y_pred)) / n, 3)`,
  c2: `def train_test_split(rows, test_ratio):
    n_test = round(len(rows) * test_ratio)
    cut = len(rows) - n_test
    return [rows[:cut], rows[cut:]]`,
  c3: `def accuracy(y_true, y_pred):
    if not y_true:
        return 0.0
    right = sum(1 for t, p in zip(y_true, y_pred) if t == p)
    return round(right / len(y_true), 3)`,
  c4: `def linear_fit(xs, ys):
    n = len(xs)
    mx, my = sum(xs) / n, sum(ys) / n
    sxx = sum((x - mx) ** 2 for x in xs)
    if sxx == 0:
        return [0.0, round(my, 3)]
    slope = sum((x - mx) * (y - my) for x, y in zip(xs, ys)) / sxx
    return [round(slope, 3), round(my - slope * mx, 3)]`,
  c5: `def standard_scale(train, test):
    m = sum(train) / len(train)
    sd = (sum((x - m) ** 2 for x in train) / len(train)) ** 0.5
    f = lambda v: 0.0 if sd == 0 else round((v - m) / sd, 3)
    return [[f(v) for v in train], [f(v) for v in test]]`,
  c6: `import math

def predict(weights, bias, x, threshold):
    z = sum(w * v for w, v in zip(weights, x)) + bias
    if z >= 0:
        p = 1 / (1 + math.exp(-z))
    else:
        e = math.exp(z)
        p = e / (1 + e)
    return 1 if p >= threshold else 0`,
  c7: `def kmeans_step(points, centroids):
    groups = [[] for _ in centroids]
    for p in points:
        d = [(p[0] - c[0]) ** 2 + (p[1] - c[1]) ** 2 for c in centroids]
        groups[d.index(min(d))].append(p)
    out = []
    for c, g in zip(centroids, groups):
        if g:
            out.append([round(sum(p[0] for p in g) / len(g), 3), round(sum(p[1] for p in g) / len(g), 3)])
        else:
            out.append(c)
    return out`,
  c8: `def knn_predict(train, point, k):
    dist = lambda r: ((r[0] - point[0]) ** 2 + (r[1] - point[1]) ** 2) ** 0.5
    nearest = sorted(train, key=dist)[:k]
    counts = {}
    for r in nearest:
        counts[r[2]] = counts.get(r[2], 0) + 1
    return min(counts, key=lambda lab: (-counts[lab], lab))`,
  c9: `def confusion_matrix(y_true, y_pred):
    m = [[0, 0], [0, 0]]
    for t, p in zip(y_true, y_pred):
        m[t][p] += 1
    return m`,
  c10: `def scale_features(values, mean, std):
    if std == 0:
        return [0.0 for _ in values]
    return [round((v - mean) / std, 3) for v in values]`,
  c11: `def precision_recall(y_true, y_pred):
    tp = sum(1 for t, p in zip(y_true, y_pred) if t == 1 and p == 1)
    fp = sum(1 for t, p in zip(y_true, y_pred) if t == 0 and p == 1)
    fn = sum(1 for t, p in zip(y_true, y_pred) if t == 1 and p == 0)
    prec = round(tp / (tp + fp), 3) if tp + fp else 0.0
    rec = round(tp / (tp + fn), 3) if tp + fn else 0.0
    return [prec, rec]`,
  c12: `def one_hot(values):
    cats = sorted(set(values))
    index = {c: i for i, c in enumerate(cats)}
    return [cats, [[1 if index[v] == i else 0 for i in range(len(cats))] for v in values]]`,
  'i-ml1': `def dot(a, b):
    return sum(x * y for x, y in zip(a, b))`,
  'i-ml2': `def mae(y_true, y_pred):
    if not y_true:
        return 0.0
    return round(sum(abs(t - p) for t, p in zip(y_true, y_pred)) / len(y_true), 3)`,
  'i-ml3': `def argmax(values):
    if not values:
        return -1
    return values.index(max(values))`,
};
