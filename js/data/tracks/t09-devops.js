// Internship 9: DevOps & Reliability. Mixes YAML configs, terminal work and Python.
(function () {
  const has = (o, k) => o && Object.prototype.hasOwnProperty.call(o, k);
  const isList = Array.isArray;
  const HOME = '/home/intern';
  const MOTD = 'ops-bastion-01 · Platform Reliability (simulated)\nType `help` to list commands.';
  const POD_LOGS = {
    '/var/log/pods/wait-api.log': '12:00:01 started\n12:05:10 GET /waits 200\n12:07:44 GET /waits 200\n',
    '/var/log/pods/queue-api.log': '12:00:02 started\n12:31:09 heap 2.1GB\n12:31:10 container OOMKilled (exit 137)\n12:31:12 restarting\n',
    '/var/log/pods/tickets-api.log': '12:00:03 started\n12:44:00 POST /buy 201\n',
    '/var/log/pods/notify-worker.log': '12:00:04 started\n12:50:21 queue depth 12\n',
  };
  const ACCESS = ['GET /waits 200', 'GET /waits 200', 'POST /buy 502', 'GET /rides 200', 'GET /waits 503', 'POST /buy 201', 'GET /map 500', 'GET /rides 200'].join('\n') + '\n';

  IS.addCharacters({
    naledi: {
      name: 'Naledi Dube', title: 'Manager, Platform Reliability', role: 'Manager',
      bio: 'Naledi\'s team keeps the park app, ticketing and ride data running 24/7. Believes the best incident is the one that never pages anyone.',
      look: { skin: '#6b4029', hair: 'afro', hairColor: '#1c1714', eyes: '#3b2618', top: 'blazer', topColor: '#c2593f', bottom: 'pants', bottomColor: '#2b2622', shoes: 'boots', accessory2: 'earrings' },
      chat: ['Reliability is a feature. Guests only notice it when it\'s missing.', 'Everything as code: configs, pipelines, dashboards.', 'Error budgets let us move fast AND stay safe.'],
    },
    felix: {
      name: 'Felix Wagner', title: 'Staff Site Reliability Engineer (your mentor)', role: 'Mentor',
      bio: 'Felix has been on call for a decade and still sleeps well, because everything he builds has alerts, runbooks and rollbacks.',
      look: { skin: '#f1d0b5', hair: 'short', hairColor: '#9c6a3a', eyes: '#4f6b3a', facial: 'beard', top: 'hoodie', topColor: '#6f8f5e', bottom: 'pants', bottomColor: '#2b2622', shoes: 'sneakers', accessory: 'glasses', build: 'broad' },
      chat: ['Pin your versions. "latest" is a lie.', 'Retries without backoff are a denial-of-service attack on yourself.', 'If it isn\'t monitored, it isn\'t in production.'],
    },
    aria: {
      name: 'Aria Patel', title: 'DevOps Intern', role: 'Intern', reliability: 0.9,
      bio: 'Organized, calm and fond of checklists. Writes the runbooks nobody else wants to.',
      look: { skin: '#a8704a', hair: 'long', hairColor: '#1c1714', eyes: '#3b2618', top: 'sweater', topColor: '#6b3a2e', bottom: 'pants', bottomColor: '#5a4636', shoes: 'boots', accessory: 'glasses' },
      chat: ['I write runbooks for things that haven\'t broken yet. They will.'],
    },
    desmond: {
      name: 'Desmond Clarke', title: 'Cloud Intern', role: 'Intern', reliability: 0.6,
      bio: 'Automates everything, including his excuses for being late.',
      look: { skin: '#4d2c1d', hair: 'buzz', hairColor: '#1c1714', eyes: '#3b2618', top: 'tee', topColor: '#d99a2b', bottom: 'shorts', bottomColor: '#2b2622', shoes: 'sneakers', hat: 'beanie' },
      chat: ['I wrote a bot that reminds me of deadlines. I muted it.'],
    },
    lin: {
      name: 'Lin Zhao', title: 'Site Reliability Intern', role: 'Intern', reliability: 0.95,
      bio: 'Turns vague "the app feels slow" into precise latency graphs. Unflappable on call.',
      look: { skin: '#e7bf9c', hair: 'ponytail', hairColor: '#1c1714', eyes: '#3b2618', top: 'button', topColor: '#6f8f5e', bottom: 'pants', bottomColor: '#2b2622', shoes: 'loafers' },
      chat: ['p95 latency tells you what most guests feel. Averages hide the pain.'],
    },
    rafa: {
      name: 'Rafael Costa', title: 'Infrastructure Intern', role: 'Intern', reliability: 0.7,
      bio: 'Builds clusters in his garage for fun. Cloud approvals are his personal nemesis.',
      look: { skin: '#c68b5f', hair: 'curly', hairColor: '#2f2019', eyes: '#3b2618', facial: 'stubble', top: 'hivis', bottom: 'pants', bottomColor: '#4b5a3a', shoes: 'boots' },
      chat: ['My garage cluster has better uptime than my car.'],
    },
  });

  const cfg = (o) => Object.assign({ type: 'config', kind: 'individual', category: 'Coding' }, o);
  const term = (o) => Object.assign({ type: 'terminal', kind: 'individual', category: 'Coding', motd: MOTD }, o);
  const py = (o) => Object.assign({ type: 'coding', lang: 'python', kind: 'individual', category: 'Coding' }, o);

  IS.registerTrack({
    id: 'devops', n: 9, icon: '☁️', lang: 'python', langLabel: 'DevOps (YAML, Bash, Python)', rate: 40,
    title: 'Site Reliability Engineering Intern', team: 'Platform Reliability',
    blurb: 'Keep the park app, ticketing and ride data online: write service and pipeline configs in YAML, fight incidents in the terminal, and code reliability logic in Python.',
    skills: ['Config as code (YAML)', 'CI/CD pipelines', 'Incident response', 'SLOs & error budgets'],
    channel: 'platform-reliability', lab: { name: 'Network Operations Center', art: 'servers' },
    cast: { manager: 'naledi', mentor: 'felix', interns: ['aria', 'desmond', 'lin', 'rafa'] },
    groups: { g1: { name: 'Deployment Pipeline', members: ['aria', 'desmond'] }, g2: { name: 'Park App SLO Dashboard', members: ['lin', 'rafa'] } },
    incident: 'The park app is down: a bad config deploy set the service port wrong and health checks are failing.',
    scenario: { conflictA: 'a live deploy on stage', conflictB: 'a recorded pipeline run', delay: 'the staging cloud account is still waiting on approval', delayFix: 'a local container setup' },
    tasks: [
      {
        id: 'q1', type: 'quiz', title: 'Incident Response & On-Call', from: 'rosa', day: 1, due: { day: 1, minute: 180 }, effort: 20, kind: 'individual', category: 'Training',
        brief: '<p>You\'ll shadow on-call. Pass the incident-response check (80%+).</p>',
        hints: ['Mitigate first, communicate constantly, blameless postmortems.'],
        wiki: '<b>Incident roles:</b> incident commander, communications lead, operations. Mitigate → communicate → root cause → postmortem.',
        peer: { who: 'lin', text: 'Communication is half of incident response.' },
        questions: [
          { q: 'The app is down. What comes first?', options: ['Find the root cause', 'Mitigate impact (rollback, failover)', 'Write the postmortem', 'Blame someone'], answer: 1 },
          { q: 'During an incident you should post status updates:', options: ['Only when fixed', 'Regularly, even if there\'s no news', 'Never', 'Only to your manager'], answer: 1 },
          { q: 'A deploy just caused errors. Fastest safe mitigation?', options: ['Debug in production', 'Roll back to the last good version', 'Restart your laptop', 'Wait'], answer: 1 },
          { q: 'Postmortems should be:', options: ['Blameless and focused on systems', 'About who made the mistake', 'Secret', 'Optional'], answer: 0 },
          { q: 'An alert fires but it\'s a false alarm every day. You should:', options: ['Ignore it forever', 'Tune or remove it. Noisy alerts cause real ones to be missed.', 'Add more alerts', 'Turn off your phone'], answer: 1 },
        ],
      },
      IS.T.intro({ channel: 'platform-reliability', team: 'Platform Reliability', teamKey: 'reliability' }),
      cfg({
        id: 'y1', title: 'Service Config in YAML', from: 'mentor', day: 2, due: { day: 3, minute: 180 }, effort: 45, filename: 'service.yaml',
        brief: '<p>Describe the wait-time API as code. <code>service.yaml</code> needs: <code>name: wait-api</code>, <code>replicas: 3</code>, <code>port: 8080</code>, and a <code>healthcheck</code> map with <code>path: /health</code> and <code>interval_seconds: 10</code>.</p>',
        starter: '# service.yaml\nname: wait-api\n',
        checks: [
          { label: 'name is wait-api and replicas is 3', fn: (o) => o.name === 'wait-api' && o.replicas === 3 },
          { label: 'port is 8080', fn: (o) => o.port === 8080 },
          { label: 'healthcheck.path is /health', fn: (o) => has(o, 'healthcheck') && o.healthcheck.path === '/health' },
          { label: 'healthcheck.interval_seconds is 10', hidden: true, fn: (o) => has(o, 'healthcheck') && o.healthcheck.interval_seconds === 10 },
        ],
        hints: ['YAML maps nest with indentation: healthcheck:\\n  path: /health', 'Numbers like 3 and 8080 don\'t need quotes.'],
        wiki: '<b>YAML:</b> key: value pairs, 2-space indentation for nesting, "- item" for lists, # for comments.',
        peer: { who: 'aria', text: 'Indentation IS the syntax in YAML. Two spaces, never tabs.' },
      }),
      term({
        id: 't1', title: 'Which Pod Keeps Crashing?', from: 'manager', day: 3, due: { day: 4, minute: 180 }, effort: 45,
        brief: '<p>One service keeps restarting. Its pod log in <code>/var/log/pods/</code> mentions <code>OOMKilled</code> (out of memory). Find it and record its name (e.g. <code>wait-api</code>) in <code>~/oom.txt</code>.</p>',
        fs: { files: POD_LOGS, cwd: HOME },
        objectives: [
          { text: 'Search all pod logs for OOMKilled in one command', check: (sh) => sh.ran(/grep .*OOMKilled/) },
          { text: 'Write the crashing service name to ~/oom.txt', check: (sh) => (sh.read(HOME + '/oom.txt') || '').trim() === 'queue-api' },
        ],
        hints: ['grep -l OOMKilled /var/log/pods/*.log lists matching files.', 'echo queue-api > ~/oom.txt'],
        wiki: '<b>Exit code 137:</b> the container was killed, usually for exceeding its memory limit.',
        peer: { who: 'rafa', text: 'OOMKilled is Kubernetes for "you ate all the memory."' },
      }),
      {
        id: 'r1', type: 'review', title: 'Code Review: Dockerfile', from: 'mentor', day: 3, due: { day: 5, minute: 120 }, effort: 40, kind: 'individual', category: 'Code Review',
        brief: '<p>Review the Dockerfile for the tickets API before it goes to production.</p>',
        code: `FROM node:latest
COPY . .
RUN npm install
ENV DB_PASSWORD=hunter2
USER root
CMD npm start`,
        issues: [
          { text: 'node:latest is unpinned, so builds change without warning. Pin a version.', real: true },
          { text: 'A database password is baked into the image. Inject secrets at runtime.', real: true },
          { text: 'Running as root increases the blast radius of any exploit.', real: true },
          { text: 'COPY . . before npm install breaks layer caching and can copy .git and .env files (no .dockerignore).', real: true },
          { text: 'FROM must be written in lowercase.', real: false },
          { text: 'npm install cannot run inside Docker.', real: false },
          { text: 'Dockerfiles can have at most five lines.', real: false },
        ],
        keywords: ['latest', 'pin', 'secret', 'password', 'root', 'user', 'cache', 'dockerignore'],
        hints: ['Who can read environment variables baked into an image?', 'What happens to the build when node releases a new major version?'],
        wiki: '<b>Container hygiene:</b> pinned bases, non-root users, no secrets in images, cache-friendly layer order.',
        peer: { who: 'desmond', text: 'hunter2 is my password too. Wait, you can see it?' },
      },
      IS.T.standup({ day: 4, terms: ['yaml', 'config', 'pod', 'review', 'docker', 'deploy'] }),
      py({
        id: 'p1', bugfix: true, title: 'Bug Fix: Retry Storm', from: 'manager', day: 4, due: { day: 5, minute: 180 }, effort: 45, fnName: 'retry_delays',
        brief: '<p>🐞 <b>OPS-9:</b> When the ticket service hiccups, clients retry so fast they knock it over again. Fix <code>retry_delays(attempts, base, cap)</code> to return <b>exponential backoff</b> delays: attempt <i>i</i> waits <code>min(cap, base × 2^i)</code> seconds, for i = 0 … attempts−1.</p>',
        starter: 'def retry_delays(attempts, base, cap):\n    return [base for i in range(attempts)]\n',
        tests: [{ args: [4, 1, 100], expected: [1, 2, 4, 8] }, { args: [0, 1, 10], expected: [] }],
        hidden: [{ args: [6, 2, 20], expected: [2, 4, 8, 16, 20, 20] }, { args: [1, 5, 3], expected: [3] }],
        hints: ['base * 2 ** i grows exponentially.', 'Cap it: min(cap, …).'],
        wiki: '<b>Backoff:</b> exponential backoff (plus jitter in real systems) prevents retry storms.',
        peer: { who: 'lin', text: 'Real clients add random jitter too, but the spec here is deterministic.' },
      }),
      IS.T.designDoc({ id: 'w-design1', title: 'Deployment Pipeline', day: 6, due: { day: 8, minute: 120 }, group: 'g1',
        brief: 'Your team builds a CI/CD pipeline: lint, test, build, deploy, deploying to production only from main, with a rollback plan.',
        terms: ['pipeline', 'stage', 'test', 'deploy', 'rollback', 'main', 'artifact'], termsNeeded: 4 }),
      cfg({
        id: 'y2', kind: 'group', group: 'g1', title: 'Pipeline: CI Config', from: 'manager', day: 6, due: { day: 8, minute: 180 }, effort: 75, filename: 'pipeline.yaml',
        brief: '<p>Write <code>pipeline.yaml</code>: a <code>stages</code> list in this exact order: lint, test, build, deploy. Then a <code>jobs</code> list with one job per stage. Each job has <code>name</code>, <code>stage</code> and a non-empty <code>script</code> list. The deploy job must include <code>only:</code> with <code>main</code>.</p>',
        starter: '# pipeline.yaml\nstages:\n  - test\n',
        checks: [
          { label: 'stages are lint, test, build, deploy (in order)', fn: (o) => isList(o.stages) && o.stages.join(',') === 'lint,test,build,deploy' },
          { label: 'every stage has a job with a non-empty script list', fn: (o) => isList(o.jobs) && ['lint', 'test', 'build', 'deploy'].every((s) => o.jobs.some((j) => j && j.stage === s && j.name && isList(j.script) && j.script.length)) },
          { label: 'the deploy job only runs on main', fn: (o) => isList(o.jobs) && o.jobs.some((j) => j && j.stage === 'deploy' && isList(j.only) && j.only.includes('main')) },
          { label: 'no job deploys from other branches', hidden: true, fn: (o) => isList(o.jobs) && o.jobs.filter((j) => j && j.stage === 'deploy').every((j) => isList(j.only) && j.only.every((b) => b === 'main')) },
        ],
        hints: ['jobs:\\n  - name: lint\\n    stage: lint\\n    script:\\n      - npm run lint', 'only:\\n      - main'],
        wiki: '<b>CI/CD:</b> stages run in order; a failing stage stops the pipeline; deploy only from the protected branch.',
        peer: { who: 'aria', text: 'Lists of maps: the "- name:" line starts each job, the other keys line up under "name".' },
      }),
      py({
        id: 'p2', title: 'Availability from Health Checks', from: 'mentor', day: 7, due: { day: 9, minute: 120 }, effort: 45, fnName: 'availability',
        brief: '<p>Health checks run every minute and record <code>"OK"</code> or <code>"FAIL"</code>. Write <code>availability(checks)</code> returning the percentage of OK checks rounded to 2 decimals. No checks → <code>None</code>.</p>',
        starter: 'def availability(checks):\n    pass\n',
        tests: [{ args: [['OK', 'OK', 'FAIL', 'OK']], expected: 75.0 }, { args: [[]], expected: null }],
        hidden: [{ args: [Array(999).fill('OK').concat(['FAIL'])], expected: 99.9 }, { args: [['FAIL', 'FAIL']], expected: 0.0 }],
        hints: ['checks.count("OK") / len(checks) * 100'],
        wiki: '<b>Availability:</b> 99.9% ("three nines") allows about 43 minutes of downtime per month.',
        peer: { who: 'lin', text: 'None vs 0.0 matters: "no data" is not "fully down."' },
      }),
      {
        id: 'q2', type: 'quiz', title: 'DevOps Fundamentals', from: 'mentor', day: 8, due: { day: 8, minute: 180 }, effort: 20, kind: 'individual', category: 'Training',
        brief: '<p>Felix\'s DevOps fundamentals check.</p>',
        hints: ['SLO vs SLA; blue-green; idempotency.'],
        wiki: '<b>Reliability vocab:</b> SLI (measurement), SLO (target), SLA (contract), error budget = 1 − SLO.',
        peer: { who: 'desmond', text: 'I always mix up SLO and SLA. O is for Objective, A is for Agreement.' },
        questions: [
          { q: 'An SLO of 99.9% over 30 days means the error budget is:', options: ['0.1% of requests (or ~43 min of downtime)', '99.9% errors', 'Zero errors allowed', '1 hour exactly'], answer: 0 },
          { q: 'A blue-green deployment:', options: ['Paints servers', 'Runs two environments and switches traffic, enabling instant rollback', 'Deploys twice', 'Is a testing framework'], answer: 1 },
          { q: 'An idempotent operation:', options: ['Can run many times with the same result', 'Runs only once ever', 'Is always fast', 'Needs root'], answer: 0 },
          { q: 'Why pin container image versions?', options: ['Smaller images', 'Reproducible, predictable builds', 'Faster networks', 'Required by YAML'], answer: 1 },
          { q: 'A readiness probe tells the platform:', options: ['When a container can receive traffic', 'The CPU temperature', 'The build number', 'Nothing'], answer: 0 },
        ],
      },
      IS.T.groupDemo({ day: 8, due: { day: 10, minute: 150 }, project: 'Deployment Pipeline', terms: ['pipeline', 'test', 'deploy', 'rollback', 'main', 'stage'],
        failQ: 'What happens if a bad build reaches production anyway?', failBest: 'Health checks fail, the deploy stage auto-rolls back to the last good artifact, and the on-call engineer gets paged with the diff.' }),
      IS.T.midpoint({ terms: ['deploy', 'config'] }),
      term({
        id: 't2', title: 'Rotate a Leaked Secret', from: 'manager', day: 11, due: { day: 12, minute: 180 }, effort: 60,
        brief: '<p>The app\'s API key leaked in a screenshot. The new key is in <code>/run/secrets/new_key</code>. Update <code>API_KEY=</code> in <code>/etc/app/env</code>, lock the file down to <code>600</code>, and delete the stray backup <code>/tmp/env.bak</code> that still contains the old key.</p>',
        fs: { files: { '/etc/app/env': { content: 'API_KEY=old-7f3a9\nLOG_LEVEL=info\n', mode: '644' }, '/run/secrets/new_key': 'new-c41d2\n', '/tmp/env.bak': 'API_KEY=old-7f3a9\n' }, cwd: HOME },
        objectives: [
          { text: '/etc/app/env has API_KEY=new-c41d2 and keeps LOG_LEVEL', check: (sh) => { const c = sh.read('/etc/app/env') || ''; return c.includes('API_KEY=new-c41d2') && !c.includes('old-7f3a9') && c.includes('LOG_LEVEL=info'); } },
          { text: '/etc/app/env is mode 600', check: (sh) => sh.mode('/etc/app/env') === '600' },
          { text: 'No file still contains the old key', check: (sh) => !sh.walk('/').some((p) => sh.isFile(p) && (sh.read(p) || '').includes('old-7f3a9')) },
        ],
        hints: ['cat /run/secrets/new_key to see it.', "sed -i 's/old-7f3a9/new-c41d2/' /etc/app/env", 'chmod 600 /etc/app/env && rm /tmp/env.bak'],
        wiki: '<b>Secret rotation:</b> replace the secret everywhere, revoke the old one, and hunt down copies (backups, logs, tmp files).',
        peer: { who: 'aria', text: 'grep -r old-7f3a9 / is a great last check.' },
      }),
      py({
        id: 'p3', bugfix: true, title: 'Bug Fix: p95 Latency Is Wrong', from: 'manager', day: 12, due: { day: 13, minute: 180 }, effort: 45, fnName: 'p95',
        brief: '<p>🐞 <b>OBS-33:</b> The latency dashboard\'s p95 is always the max. Fix <code>p95(latencies)</code> to use the <b>nearest-rank</b> method: sort, rank = <code>ceil(0.95 × n)</code>, return the value at that 1-based rank. Empty → <code>None</code>.</p>',
        starter: 'def p95(latencies):\n    return max(latencies)\n',
        tests: [{ args: [[100, 200, 300, 400, 500, 600, 700, 800, 900, 1000, 1100, 1200, 1300, 1400, 1500, 1600, 1700, 1800, 1900, 5000]], expected: 1900 }, { args: [[]], expected: null }],
        hidden: [{ args: [[7]], expected: 7 }, { args: [[30, 10, 20]], expected: 30 }, { args: [[1, 2, 3, 4, 5, 6, 7, 8, 9, 10]], expected: 10 }],
        hints: ['import math; rank = math.ceil(0.95 * len(s))', 'Return sorted(latencies)[rank - 1].'],
        wiki: '<b>Latency:</b> p95 = the latency 95% of requests are faster than.',
        peer: { who: 'lin', text: 'One slow outlier made the whole dashboard red. p95 fixes that.' },
      }),
      IS.T.email({ day: 13, due: { day: 13, minute: 180 }, to: 'Theo Park', toTitle: 'Show Producer', subject: 'Deploy Freeze Extended',
        brief: 'Because of the secret rotation, the deploy freeze extends one day, so the parade-schedule app update ships tomorrow.',
        terms: ['deploy', 'freeze', 'secret|security', 'update', 'date', 'sorry|apolog'] }),
      {
        id: 'r2', type: 'review', title: 'Review: Kubernetes Deployment', from: 'intern3', day: 13, due: { day: 14, minute: 180 }, effort: 45, kind: 'individual', category: 'Code Review',
        brief: '<p>Lin wants a review of the queue-api deployment manifest.</p>',
        code: `spec:
  replicas: 1
  template:
    spec:
      containers:
        - name: queue-api
          image: queue-api:latest
          resources: {}`,
        issues: [
          { text: 'A single replica means any restart or node failure takes the service down.', real: true },
          { text: 'No resource requests/limits, so it can starve neighbors or get OOMKilled unpredictably.', real: true },
          { text: 'No liveness/readiness probes, so traffic is sent to pods that aren\'t ready.', real: true },
          { text: 'The image tag is "latest" (not pinned).', real: true },
          { text: 'YAML requires tabs for indentation.', real: false },
          { text: 'Container names must be uppercase.', real: false },
          { text: 'containers must be a map, not a list.', real: false },
        ],
        keywords: ['replica', 'redundan', 'resource', 'limit', 'probe', 'readiness', 'liveness', 'latest'],
        hints: ['What happens during a node upgrade with 1 replica?', 'Remember the OOMKilled pod from week 1?'],
        wiki: '<b>Kubernetes:</b> multiple replicas, requests/limits, probes and pinned images are the baseline for production.',
        peer: { who: 'rafa', text: 'This is basically the manifest that caused the OOM crash. Full circle.' },
      },
      cfg({
        id: 'y3', optional: true, title: '⭐ Stretch: Alert Rules', from: 'mentor', day: 14, due: { day: 17, minute: 180 }, effort: 60, filename: 'alerts.yaml',
        brief: '<p><b>Optional stretch.</b> Write <code>alerts.yaml</code> with a top-level <code>rules</code> list. Each rule has <code>name</code>, <code>expr</code>, <code>for</code> (like <code>5m</code>) and <code>severity</code> (<code>page</code> or <code>ticket</code>). Include rules whose <code>expr</code> mentions <b>error</b> rate and <b>latency</b> (both <code>page</code>) and <b>disk</b> usage (<code>ticket</code>).</p>',
        starter: '# alerts.yaml\nrules:\n',
        checks: [
          { label: 'Every rule has name, expr, for (like 5m) and severity page|ticket', fn: (o) => isList(o.rules) && o.rules.length >= 3 && o.rules.every((r) => r && r.name && r.expr && /^\d+[smh]$/.test(String(r.for)) && ['page', 'ticket'].includes(r.severity)) },
          { label: 'Error-rate and latency rules page', fn: (o) => isList(o.rules) && ['error', 'latency'].every((k) => o.rules.some((r) => r && String(r.expr).toLowerCase().includes(k) && r.severity === 'page')) },
          { label: 'Disk rule opens a ticket (doesn\'t page)', hidden: true, fn: (o) => isList(o.rules) && o.rules.some((r) => r && String(r.expr).toLowerCase().includes('disk') && r.severity === 'ticket') },
        ],
        hints: ['rules:\\n  - name: HighErrorRate\\n    expr: error_rate > 0.01\\n    for: 5m\\n    severity: page'],
        wiki: '<b>Alerting:</b> page humans only for guest-facing symptoms; everything else becomes a ticket.',
        peer: { who: 'lin', text: 'The "for: 5m" stops one bad minute from waking someone up.' },
      }),
      IS.T.designDoc({ id: 'w-design2', title: 'Park App SLO Dashboard', day: 16, due: { day: 17, minute: 180 }, group: 'g2', minWords: 180, metrics: true,
        brief: 'The capstone: an SLO dashboard for the park app with availability, latency, error budget burn and a safe deploy order for its services.',
        terms: ['slo', 'error budget', 'latency', 'availability', 'alert', 'dependency', 'local container', 'dashboard'], termsNeeded: 5 }),
      py({
        id: 'p4', kind: 'group', group: 'g2', title: 'Capstone: Error Budget Remaining', from: 'manager', day: 16, due: { day: 19, minute: 180 }, effort: 75, fnName: 'budget_remaining',
        brief: '<p>Write <code>budget_remaining(total, errors, target)</code>. Allowed errors = <code>total × (1 − target)</code>. Return <code>(allowed − errors) / allowed</code> rounded to 3 (negative means the budget is overspent). If allowed is 0, return <code>0.0</code>.</p>',
        starter: 'def budget_remaining(total, errors, target):\n    pass\n',
        tests: [{ args: [100000, 25, 0.999], expected: 0.75 }, { args: [100000, 200, 0.999], expected: -1.0 }],
        hidden: [{ args: [0, 0, 0.999], expected: 0.0 }, { args: [1000, 0, 0.99], expected: 1.0 }, { args: [100, 5, 1.0], expected: 0.0 }],
        hints: ['allowed = total * (1 - target)', 'Guard allowed == 0 (or extremely close to it).', 'Floating point: 1 - 0.999 isn\'t exactly 0.001, so round at the end.'],
        wiki: '<b>Error budgets:</b> when the budget is spent, reliability work takes priority over new features.',
        peer: { who: 'rafa', text: 'Negative budget = freeze deploys. That\'s the rule we agreed on.' },
      }),
      py({
        id: 'p5', title: 'Rolling Error Rate', from: 'intern3', day: 18, due: { day: 20, minute: 180 }, effort: 60, fnName: 'rolling_error_rate',
        brief: '<p><code>events</code> is a list of 0 (success) / 1 (error). Write <code>rolling_error_rate(events, window)</code> returning the error rate for every full window of <code>window</code> consecutive events, rounded to 3. Fewer events than the window → <code>[]</code>.</p>',
        starter: 'def rolling_error_rate(events, window):\n    pass\n',
        tests: [{ args: [[0, 1, 0, 0, 1, 1], 3], expected: [0.333, 0.333, 0.333, 0.667] }, { args: [[0, 1], 3], expected: [] }],
        hidden: [{ args: [[1, 1, 1], 1], expected: [1.0, 1.0, 1.0] }, { args: [[0, 0, 0, 0], 4], expected: [0.0] }],
        hints: ['There are len(events) − window + 1 windows.', 'sum(events[i:i + window]) / window'],
        wiki: '<b>Burn rate:</b> a rolling error rate shows whether the budget is burning fast right now.',
        peer: { who: 'lin', text: 'Same shape as a moving average, just with errors.' },
      }),
      term({
        id: 't3', urgent: true, bugfix: true, title: '🚨 URGENT: App Down After Config Deploy', from: 'manager', day: 22, due: { day: 22, minute: 120 }, effort: 40,
        brief: '<p>🚨 <b>SEV-1:</b> The park app is down. A config deploy changed the service port and health checks fail. <code>/etc/app/README</code> says which port the load balancer expects. Fix <code>/etc/app/service.yaml</code> and confirm with <code>/opt/health.sh</code> <b>by 11:00 AM</b>. Also count how many 5xx errors are in <code>/var/log/app/access.log</code> for the incident channel.</p>',
        fs: { files: {
          '/etc/app/README': 'Load balancer forwards to port 8080.\nNever change the port without updating the LB.\n',
          '/etc/app/service.yaml': 'name: park-app\nreplicas: 3\nport: 8008\n',
          '/opt/health.sh': { content: 'grep port /etc/app/service.yaml\ngrep 8080 /etc/app/README\n', mode: '755' },
          '/var/log/app/access.log': ACCESS,
        }, cwd: HOME },
        objectives: [
          { text: 'service.yaml uses port 8080', check: (sh) => /port: 8080\n/.test(sh.read('/etc/app/service.yaml') || '') && !/8008/.test(sh.read('/etc/app/service.yaml') || '') },
          { text: 'Run /opt/health.sh after the fix', check: (sh) => sh.history.some((h) => /health\.sh/.test(h.cmd) && h.out.includes('port: 8080')) },
          { text: 'Print the number of 5xx responses in access.log', check: (sh) => sh.ran(/grep/) && sh.ranOutput('3') },
        ],
        hints: ["sed -i 's/8008/8080/' /etc/app/service.yaml", 'Run it with /opt/health.sh', "grep -c ' 5[0-9][0-9]$' /var/log/app/access.log"],
        wiki: '<b>Incident runbook:</b> restore service first (fix or roll back the config), then communicate impact numbers.',
        peer: { who: 'desmond', text: 'I may have approved that config change. Let\'s fix it and I\'ll write the timeline.' },
      }),
      IS.T.postmortem({ title: 'Park App Outage', day: 22, due: { day: 23, minute: 180 }, terms: ['port', 'config', 'health', 'rollback', 'validation|review', 'monitor|alert'] }),
      cfg({
        id: 'y4', kind: 'group', group: 'g2', title: 'Capstone: SLO Dashboard Config', from: 'intern4', day: 21, due: { day: 23, minute: 180 }, effort: 60, filename: 'dashboard.yaml',
        brief: '<p>Write <code>dashboard.yaml</code> with a <code>title</code>, an <code>slo</code> map (<code>target: 0.999</code>, <code>window_days: 30</code>) and a <code>panels</code> list of at least 3 panels, each with <code>title</code> and <code>query</code>. One panel\'s query must mention <code>error_budget</code> and one must mention <code>latency</code>.</p>',
        starter: '# dashboard.yaml\ntitle: Park App\n',
        checks: [
          { label: 'slo.target is 0.999 and window_days is 30', fn: (o) => o.slo && o.slo.target === 0.999 && o.slo.window_days === 30 },
          { label: 'At least 3 panels with title and query', fn: (o) => isList(o.panels) && o.panels.length >= 3 && o.panels.every((p) => p && p.title && p.query) },
          { label: 'Panels cover error_budget and latency', hidden: true, fn: (o) => isList(o.panels) && ['error_budget', 'latency'].every((k) => o.panels.some((p) => p && String(p.query).includes(k))) },
        ],
        hints: ['panels:\\n  - title: Error budget\\n    query: error_budget_remaining', 'Nested map: slo:\\n  target: 0.999'],
        wiki: '<b>Dashboards as code:</b> reviewable, versioned, and identical across environments.',
        peer: { who: 'rafa', text: 'Dashboards in YAML means no more "who changed the graph?!"' },
      }),
      py({
        id: 'p6', kind: 'group', group: 'g2', title: 'Capstone: Safe Deploy Order', from: 'mentor', day: 24, due: { day: 26, minute: 180 }, effort: 90, fnName: 'deploy_order',
        brief: '<p>Services must deploy after their dependencies. Write <code>deploy_order(deps)</code> where <code>deps</code> maps each service to the list of services it depends on. Return a valid order (topological sort); when several services are ready, pick them alphabetically. If there\'s a cycle, return <code>[]</code>.</p>',
        starter: 'def deploy_order(deps):\n    pass\n',
        tests: [{ args: [{ app: ['api'], api: ['db'], db: [] }], expected: ['db', 'api', 'app'] }, { args: [{ a: ['b'], b: ['a'] }], expected: [] }],
        hidden: [{ args: [{ web: ['auth', 'cache'], auth: [], cache: [] }], expected: ['auth', 'cache', 'web'] }, { args: [{}], expected: [] }, { args: [{ x: [], y: [], z: ['x'] }], expected: ['x', 'y', 'z'] }],
        hints: ['Repeatedly pick the alphabetically first service whose deps are all already deployed.', 'If no service is ready but some remain, it\'s a cycle.'],
        wiki: '<b>Topological sort:</b> order a dependency graph so every item comes after what it needs (Kahn\'s algorithm).',
        peer: { who: 'lin', text: 'Cycle detection is the part everyone forgets.' },
      }),
      IS.T.status({ day: 25, terms: ['capstone', 'outage', 'postmortem', 'slo', 'dashboard', 'deploy'] }),
      IS.T.readme({ day: 26, due: { day: 28, minute: 180 }, project: 'Park App SLO Dashboard', terms: ['budget_remaining', 'deploy_order', 'dashboard.yaml', 'slo', 'local container', 'alert'] }),
      IS.T.finalPres({ project: 'Park App SLO Dashboard', terms: ['slo', 'error budget', 'latency', 'guest', 'deploy', 'alert', 'availability'], questions: [
        { who: 'harriet', q: 'What does 99.9% mean for a guest standing in line?', options: [
          { text: 'At most about 43 minutes a month when the app might fail them, and we can see exactly how much of that we\'ve used, so we stop risky deploys before guests feel it.', pts: 10 },
          { text: 'The app is almost perfect.', pts: 3 },
          { text: 'Nothing, it\'s a server metric.', pts: 1 },
          { text: 'They get a discount.', pts: 0 }] },
        { who: 'harriet', q: 'Why not target 100%?', options: [
          { text: '100% is impossible and would freeze all change. The error budget lets us ship improvements while protecting guests.', pts: 10 },
          { text: 'We should target 100%.', pts: 0 },
          { text: 'It costs too much.', pts: 5 },
          { text: 'Nobody would notice.', pts: 1 }] },
        { who: 'manager', q: 'What happens when the budget runs out?', options: [
          { text: 'Feature deploys pause, reliability fixes take priority, and we review the incidents that burned it.', pts: 10 },
          { text: 'We buy more budget.', pts: 0 },
          { text: 'Keep deploying.', pts: 1 },
          { text: 'Lower the SLO.', pts: 3 }] },
        { who: 'mentor', q: 'How do you avoid alert fatigue?', options: [
          { text: 'Page only on fast budget burn and guest-facing symptoms, with "for" durations; everything else becomes a ticket.', pts: 10 },
          { text: 'Alert on everything.', pts: 0 },
          { text: 'Turn alerts off at night.', pts: 1 },
          { text: 'Email instead of paging.', pts: 3 }] },
      ] }),
      IS.T.selfEval({ day: 30, due: { day: 31, minute: 180 }, terms: ['reliability', 'capstone', 'outage', 'team', 'config', 'deadline'] }),
    ],
    interview: {
      coding: [
        { id: 'i-do1', type: 'config', title: 'Minimal Service Config', filename: 'service.yaml',
          brief: '<p>Write a YAML config with <code>name: tickets-api</code>, at least <code>2</code> replicas, and <code>port: 9000</code>.</p>',
          starter: '# service.yaml\n',
          checks: [
            { label: 'name is tickets-api', fn: (o) => o.name === 'tickets-api' },
            { label: 'replicas ≥ 2', fn: (o) => typeof o.replicas === 'number' && o.replicas >= 2 },
            { label: 'port is 9000', fn: (o) => o.port === 9000 },
          ] },
        { id: 'i-do2', type: 'terminal', title: 'Count Server Errors', motd: MOTD, fs: { files: { '/var/log/app/access.log': ACCESS }, cwd: HOME },
          brief: '<p>Print how many lines in <code>/var/log/app/access.log</code> end with a 5xx status code.</p>',
          objectives: [{ text: 'Print the 5xx count', check: (sh) => sh.ran(/grep/) && sh.ranOutput('3') }] },
        { id: 'i-do3', type: 'coding', lang: 'python', title: 'Healthy Fraction', fnName: 'healthy_fraction',
          brief: '<p>Write <code>healthy_fraction(statuses)</code>: the fraction of HTTP status codes below 500, rounded to 2. Empty → <code>1.0</code>.</p>',
          starter: 'def healthy_fraction(statuses):\n    pass\n',
          tests: [{ args: [[200, 500, 201, 503]], expected: 0.5 }, { args: [[]], expected: 1.0 }],
          hidden: [{ args: [[404, 200, 302]], expected: 1.0 }, { args: [[502]], expected: 0.0 }] },
      ],
      concepts: [
        { q: 'What does CI stand for and do?', options: ['Code Inspection: formatting', 'Continuous Integration: build & test every change automatically', 'Cloud Infrastructure', 'Container Isolation'], answer: 1 },
        { q: 'Why exponential backoff on retries?', options: ['Faster retries', 'Avoid overwhelming a struggling service', 'Required by HTTP', 'Saves disk'], answer: 1 },
        { q: 'An SLO is:', options: ['A legal contract', 'An internal reliability target', 'A server type', 'A log format'], answer: 1 },
        { q: 'Where should secrets live?', options: ['In the Dockerfile', 'In a secrets manager / injected at runtime', 'In git', 'In the README'], answer: 1 },
        { q: 'In YAML, a list item starts with:', options: ['*', '- ', '#', '>'], answer: 1 },
        { q: 'A rollback is:', options: ['Deploying the previous known-good version', 'Deleting logs', 'Restarting the laptop', 'A database index'], answer: 0 },
        { q: 'What does exit code 137 in containers usually mean?', options: ['Success', 'Killed (often out of memory)', 'Syntax error', 'Network timeout'], answer: 1 },
        { q: 'Infrastructure as code means:', options: ['Servers written in Python', 'Configs and infrastructure defined in versioned files', 'No servers', 'Manual setup'], answer: 1 },
      ],
    },
    training: {
      lessons: [
        { title: 'YAML in five minutes', html: '<pre># comment\nname: wait-api\nreplicas: 3\nhealthcheck:\n  path: /health\nstages:\n  - lint\n  - test\njobs:\n  - name: lint\n    script:\n      - npm run lint</pre><p>Two spaces per level. Lists use "- ". Never tabs.</p>' },
        { title: 'Terminal triage', html: '<pre>grep -l OOMKilled /var/log/pods/*.log   # which file?\ngrep -c " 5[0-9][0-9]$" access.log      # how many 5xx?\nsed -i \'s/8008/8080/\' service.yaml       # fix in place</pre>' },
        { title: 'Reliability math', html: '<pre>allowed = total * (1 - slo)\nremaining = (allowed - errors) / allowed\ndelay_i = min(cap, base * 2 ** i)</pre>' },
      ],
    },
  });
})();
