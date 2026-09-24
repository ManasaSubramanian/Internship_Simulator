// Reference solutions for internship 9 (DevOps). Test suite only.
module.exports = {
  y1: `name: wait-api
replicas: 3
port: 8080
healthcheck:
  path: /health
  interval_seconds: 10
`,
  t1: ['grep -l OOMKilled /var/log/pods/*.log', 'echo queue-api > ~/oom.txt'],
  p1: `def retry_delays(attempts, base, cap):
    return [min(cap, base * 2 ** i) for i in range(attempts)]`,
  y2: `stages:
  - lint
  - test
  - build
  - deploy
jobs:
  - name: lint
    stage: lint
    script:
      - npm run lint
  - name: unit-tests
    stage: test
    script:
      - npm test
  - name: build-image
    stage: build
    script:
      - docker build -t queue-api:1.4.2 .
  - name: deploy-prod
    stage: deploy
    script:
      - ./deploy.sh
    only:
      - main
`,
  p2: `def availability(checks):
    if not checks:
        return None
    return round(checks.count("OK") / len(checks) * 100, 2)`,
  t2: ['cat /run/secrets/new_key', "sed -i 's/old-7f3a9/new-c41d2/' /etc/app/env", 'chmod 600 /etc/app/env', 'rm /tmp/env.bak'],
  p3: `import math

def p95(latencies):
    if not latencies:
        return None
    s = sorted(latencies)
    return s[math.ceil(0.95 * len(s)) - 1]`,
  y3: `rules:
  - name: HighErrorRate
    expr: error_rate > 0.01
    for: 5m
    severity: page
  - name: SlowResponses
    expr: latency_p95_ms > 800
    for: 10m
    severity: page
  - name: DiskFilling
    expr: disk_used_percent > 85
    for: 30m
    severity: ticket
`,
  p4: `def budget_remaining(total, errors, target):
    allowed = total * (1 - target)
    if allowed <= 1e-9:
        return 0.0
    return round((allowed - errors) / allowed, 3)`,
  p5: `def rolling_error_rate(events, window):
    if len(events) < window:
        return []
    return [round(sum(events[i:i + window]) / window, 3) for i in range(len(events) - window + 1)]`,
  t3: ["sed -i 's/8008/8080/' /etc/app/service.yaml", '/opt/health.sh', "grep -c ' 5[0-9][0-9]$' /var/log/app/access.log"],
  y4: `title: Park App
slo:
  target: 0.999
  window_days: 30
panels:
  - title: Error budget
    query: error_budget_remaining
  - title: p95 latency
    query: latency_p95_ms
  - title: Availability
    query: availability_percent
`,
  p6: `def deploy_order(deps):
    done, order = set(), []
    while len(order) < len(deps):
        ready = sorted(s for s in deps if s not in done and all(d in done for d in deps[s]))
        if not ready:
            return []
        done.add(ready[0])
        order.append(ready[0])
    return order`,
  'i-do1': `name: tickets-api
replicas: 2
port: 9000
`,
  'i-do2': ["grep -c ' 5[0-9][0-9]$' /var/log/app/access.log"],
  'i-do3': `def healthy_fraction(statuses):
    if not statuses:
        return 1.0
    return round(sum(1 for s in statuses if s < 500) / len(statuses), 2)`,
};
