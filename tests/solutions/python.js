// Reference solutions for internship 2 (Python). Used only by the test suite.
module.exports = {
  c1: `import re
from collections import Counter

def count_words(text):
    return dict(Counter(re.findall(r"[a-z']+", text.lower())))`,
  c2: `def parse_time(s):
    clock, suffix = s.strip().split()
    h, m = clock.split(":")
    return (int(h) % 12 + (12 if suffix.upper() == "PM" else 0)) * 60 + int(m)`,
  c3: `def average_rating(ratings):
    valid = [r for r in ratings if r is not None and 1 <= r <= 5]
    if not valid:
        return 0.0
    return round(sum(valid) / len(valid), 2)`,
  c4: `def assign_shifts(staff, shifts):
    used = {p["name"]: 0 for p in staff}
    out = {}
    i = 0
    for s in shifts:
        out[s] = None
        for k in range(len(staff)):
            p = staff[(i + k) % len(staff)]
            if used[p["name"]] < p["max_shifts"]:
                used[p["name"]] += 1
                out[s] = p["name"]
                i = (i + k + 1) % len(staff)
                break
    return out`,
  c5: `def merge_intervals(intervals):
    out = []
    for s, e in sorted(intervals):
        if out and s <= out[-1][1]:
            out[-1][1] = max(out[-1][1], e)
        else:
            out.append([s, e])
    return out`,
  c6: `def chunk(items, size):
    if size <= 0:
        return []
    return [items[i:i + size] for i in range(0, len(items), size)]`,
  c7: `from itertools import groupby

def rle_encode(s):
    return "".join(ch + str(len(list(g))) for ch, g in groupby(s))`,
  c8: `def match_items(lost, found):
    key = lambda x: (x["item"].strip().lower(), x["color"].strip().lower())
    used = set()
    pairs = []
    for l in lost:
        for f in found:
            if f["id"] not in used and key(f) == key(l):
                used.add(f["id"])
                pairs.append([l["id"], f["id"]])
                break
    return pairs`,
  c9: `def top_categories(items, k):
    counts = {}
    for it in items:
        counts[it.lower()] = counts.get(it.lower(), 0) + 1
    ranked = sorted(counts.items(), key=lambda kv: (-kv[1], kv[0]))
    return [[n, c] for n, c in ranked[:k]]`,
  c10: `def parse_badge(badge):
    digits = "".join(ch for ch in badge if ch.isdigit())
    return int(digits) if digits else None`,
  c11: `def daily_summary(events):
    out = {"lost": 0, "found": 0, "returned": 0}
    zones = {}
    for e in events:
        out[e["type"]] += 1
        zones[e["zone"]] = zones.get(e["zone"], 0) + 1
    out["busiest_zone"] = min(zones, key=lambda z: (-zones[z], z)) if zones else None
    return out`,
  c12: `def anonymize(record):
    out = dict(record)
    if "name" in out:
        out["name"] = out["name"][:1] + "***"
    if "email" in out:
        out["email"] = "***@" + out["email"].split("@")[-1]
    if "phone" in out:
        digits = "".join(ch for ch in out["phone"] if ch.isdigit())
        out["phone"] = "***" + digits[-4:]
    return out`,
  'i-py1': `def is_anagram(a, b):
    norm = lambda s: sorted(s.replace(" ", "").lower())
    return norm(a) == norm(b)`,
  'i-py2': `from collections import Counter

def first_unique(s):
    c = Counter(s)
    for i, ch in enumerate(s):
        if c[ch] == 1:
            return i
    return -1`,
  'i-py3': `def running_total(nums):
    out, t = [], 0
    for n in nums:
        t += n
        out.append(t)
    return out`,
};
