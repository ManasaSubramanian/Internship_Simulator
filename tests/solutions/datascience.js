// Reference solutions for internship 3 (Data Science, Python). Test suite only.
module.exports = {
  c1: `def mean_median(values):
    v = sorted(x for x in values if x is not None)
    n = len(v)
    if not n:
        return [None, None]
    med = v[n // 2] if n % 2 else (v[n // 2 - 1] + v[n // 2]) / 2
    return [round(sum(v) / n, 2), round(med, 2)]`,
  c2: `def clean_records(rows):
    return [{"ride": r["ride"].strip().title(), "wait": r["wait"]}
            for r in rows if r["wait"] is not None and 0 <= r["wait"] <= 300]`,
  c3: `def pct_change(series):
    out = [None] if series else []
    for i in range(1, len(series)):
        prev = series[i - 1]
        out.append(None if prev == 0 else round((series[i] - prev) / prev * 100, 1))
    return out`,
  c4: `def group_mean(rows, key, value):
    groups = {}
    for r in rows:
        if r[value] is not None:
            groups.setdefault(r[key], []).append(r[value])
    return {k: round(sum(v) / len(v), 1) for k, v in groups.items()}`,
  c5: `def z_scores(values):
    n = len(values)
    if not n:
        return []
    m = sum(values) / n
    sd = (sum((x - m) ** 2 for x in values) / n) ** 0.5
    return [0.0 if sd == 0 else round((x - m) / sd, 2) for x in values]`,
  c6: `import math

def percentile(values, p):
    if not values:
        return None
    s = sorted(values)
    rank = max(1, math.ceil(p / 100 * len(s)))
    return s[rank - 1]`,
  c7: `def correlation(xs, ys):
    n = len(xs)
    mx, my = sum(xs) / n, sum(ys) / n
    sxy = sum((x - mx) * (y - my) for x, y in zip(xs, ys))
    sxx = sum((x - mx) ** 2 for x in xs)
    syy = sum((y - my) ** 2 for y in ys)
    if sxx == 0 or syy == 0:
        return 0.0
    return round(sxy / (sxx * syy) ** 0.5, 3)`,
  c8: `def pivot_counts(rows, row_key, col_key):
    out = {}
    for r in rows:
        inner = out.setdefault(r[row_key], {})
        inner[r[col_key]] = inner.get(r[col_key], 0) + 1
    return out`,
  c9: `def moving_average(values, k):
    if k <= 0 or len(values) < k:
        return []
    return [round(sum(values[i:i + k]) / k, 2) for i in range(len(values) - k + 1)]`,
  c10: `def dedupe_events(events):
    seen = set()
    out = []
    for e in events:
        if e["id"] not in seen:
            seen.add(e["id"])
            out.append(e)
    return out`,
  c11: `def rank_drivers(rows, target, features):
    def corr(xs, ys):
        n = len(xs)
        mx, my = sum(xs) / n, sum(ys) / n
        sxy = sum((x - mx) * (y - my) for x, y in zip(xs, ys))
        sxx = sum((x - mx) ** 2 for x in xs)
        syy = sum((y - my) ** 2 for y in ys)
        return 0.0 if sxx == 0 or syy == 0 else sxy / (sxx * syy) ** 0.5
    ys = [r[target] for r in rows]
    pairs = [[f, round(corr([r[f] for r in rows], ys), 2)] for f in features]
    return sorted(pairs, key=lambda p: (-abs(p[1]), p[0]))`,
  c12: `def bucket_counts(values, edges):
    counts = [0] * (len(edges) - 1)
    for v in values:
        for i in range(len(counts)):
            last = i == len(counts) - 1
            if edges[i] <= v < edges[i + 1] or (last and v == edges[-1]):
                counts[i] += 1
                break
    return counts`,
  'i-ds1': `def median(values):
    s = sorted(values)
    n = len(s)
    if not n:
        return None
    return s[n // 2] if n % 2 else (s[n // 2 - 1] + s[n // 2]) / 2`,
  'i-ds2': `def normalize(values):
    if not values:
        return []
    lo, hi = min(values), max(values)
    if lo == hi:
        return [0.0 for _ in values]
    return [round((x - lo) / (hi - lo), 3) for x in values]`,
  'i-ds3': `from collections import Counter

def mode(values):
    if not values:
        return None
    c = Counter(values)
    return min(c, key=lambda x: (-c[x], x))`,
};
