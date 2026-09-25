// Learning Center: DevOps from zero (internship 9): YAML, pipelines, logs, reliability math.
IS.learnData = IS.learnData || {};
(function () {
  const HOME = '/home/intern';
  const MOTD = 'ops-practice (simulated Linux)\nType `help` to list commands.';
  const isList = Array.isArray;
  const cfg = (o) => Object.assign({ type: 'config' }, o);
  const term = (o) => Object.assign({ type: 'terminal', motd: MOTD }, o);
  const py = (o) => Object.assign({ type: 'coding', lang: 'python' }, o);
  const ACCESS = ['GET /rides 200', 'GET /waits 503', 'POST /buy 201', 'GET /map 500', 'GET /rides 200', 'POST /buy 502'].join('\n') + '\n';
  const PODS = { '/var/log/pods/api.log': 'started\nGET /rides 200\n', '/var/log/pods/tickets.log': 'started\ncontainer OOMKilled (exit 137)\n', '/var/log/pods/map.log': 'started\nready\n' };

  IS.learnData.devops = [
    {
      id: 'yaml', icon: '📝', title: 'Config files in YAML',
      summary: 'Describe how a service should run in a simple text format that humans and machines both read.',
      tags: ['yaml', 'config', 'key', 'value', 'indent', 'service', 'replicas', 'port'],
      words: `<p><b>DevOps</b> is the work of getting software built, shipped and kept running reliably. A big idea in DevOps is <b>configuration as code</b>: instead of clicking settings in a dashboard, you write them in files that are reviewed and versioned like code.</p>
        <p>Many of those files use <b>YAML</b>. It\'s made of <code>key: value</code> pairs, one per line:</p>
        <p><code>name: wait-api</code><br><code>replicas: 3</code></p>
        <p>To put settings <b>inside</b> another setting (a nested group), indent them by <b>two spaces</b> under a key that ends with a colon. Indentation is the structure in YAML, so it must be consistent, and tabs aren\'t allowed.</p>
        <p>Numbers (<code>8080</code>) and <code>true</code>/<code>false</code> are written plainly; text usually doesn\'t need quotes either. A <code>#</code> starts a comment.</p>
        <div class="analogy">📋 <b>Like an order form:</b> each line is a field and its answer, and indented lines are sub-fields that belong to the line above them.</div>`,
      terms: [['DevOps', 'Building, shipping and running software reliably.'], ['config as code', 'Settings written in reviewed, versioned files.'], ['key: value', 'One setting per line.'], ['nesting', 'Indent 2 spaces to put settings inside another.'], ['replicas', 'How many copies of a service run at once.']],
      example: {
        lang: 'yaml',
        code: `# service.yaml
name: wait-api
replicas: 3
port: 8080
healthcheck:
  path: /health
  interval_seconds: 10`,
        steps: [
          { lines: [1], text: 'A comment naming the file.' },
          { lines: [2, 3, 4], text: 'Three simple settings: the service name (text), and two numbers.' },
          { lines: [5], text: '<code>healthcheck:</code> has no value on its line. It\'s a group, and the indented lines below belong to it.' },
          { lines: [6, 7], text: 'Indented by two spaces: these are <code>healthcheck.path</code> and <code>healthcheck.interval_seconds</code>.' },
        ],
      },
      practice: [
        cfg({ id: 'L-do-y1', title: 'Describe a service', filename: 'service.yaml',
          brief: '<p>Write a config with <code>name: map-api</code>, <code>replicas: 2</code> and <code>port: 9090</code>.</p>',
          starter: '# service.yaml\n',
          checks: [
            { label: 'name is map-api', fn: (o) => o.name === 'map-api' },
            { label: 'replicas is 2 and port is 9090', fn: (o) => o.replicas === 2 && o.port === 9090 },
          ],
          hint: 'Three lines, each <code>key: value</code>.',
          solution: '# service.yaml\nname: map-api\nreplicas: 2\nport: 9090\n' }),
        cfg({ id: 'L-do-y2', title: 'Add a health check', filename: 'service.yaml',
          brief: '<p>Add a nested <code>healthcheck</code> group with <code>path: /ready</code> and <code>interval_seconds: 5</code>. Keep the name.</p>',
          starter: '# service.yaml\nname: map-api\n',
          checks: [
            { label: 'name is still map-api', fn: (o) => o.name === 'map-api' },
            { label: 'healthcheck.path is /ready', fn: (o) => !!o.healthcheck && o.healthcheck.path === '/ready' },
            { label: 'healthcheck.interval_seconds is 5', fn: (o) => !!o.healthcheck && o.healthcheck.interval_seconds === 5 },
          ],
          hint: '<code>healthcheck:</code> on its own line, then two lines indented by two spaces.',
          solution: '# service.yaml\nname: map-api\nhealthcheck:\n  path: /ready\n  interval_seconds: 5\n' }),
        cfg({ id: 'L-do-y3', title: 'Fix the indentation', filename: 'service.yaml',
          brief: '<p>The <code>resources</code> settings should be <b>inside</b> <code>resources</code>, but they aren\'t indented. Fix it so <code>resources.memory_mb</code> is 512 and <code>resources.cpu</code> is 1.</p>',
          starter: '# service.yaml\nname: tickets\nresources:\nmemory_mb: 512\ncpu: 1\n',
          checks: [{ label: 'resources.memory_mb is 512 and resources.cpu is 1', fn: (o) => !!o.resources && typeof o.resources === 'object' && o.resources.memory_mb === 512 && o.resources.cpu === 1 }],
          hint: 'Put two spaces in front of <code>memory_mb</code> and <code>cpu</code>.',
          solution: '# service.yaml\nname: tickets\nresources:\n  memory_mb: 512\n  cpu: 1\n' }),
      ],
    },
    {
      id: 'pipelines', icon: '🚀', title: 'Lists in YAML and CI/CD pipelines',
      summary: 'Automate testing and deploying with a pipeline described as a list of steps.',
      tags: ['pipeline', 'ci', 'cd', 'list', 'stage', 'job', 'deploy', 'script'],
      words: `<p><b>CI/CD</b> stands for Continuous Integration / Continuous Delivery. Every time someone changes the code, a <b>pipeline</b> automatically runs a series of <b>stages</b>, for example lint (style check) → test → build → deploy. If any stage fails, the pipeline stops, so broken code never reaches guests.</p>
        <p>Pipelines are written in YAML, which means you need <b>lists</b>. A list item starts with a dash and a space, indented under its key:</p>
        <p><code>stages:</code><br><code>&nbsp;&nbsp;- test</code><br><code>&nbsp;&nbsp;- deploy</code></p>
        <p>A list item can itself be a group of settings (a "list of maps"). The first setting goes after the dash, and the rest line up under it:</p>
        <p><code>jobs:</code><br><code>&nbsp;&nbsp;- name: unit-tests</code><br><code>&nbsp;&nbsp;&nbsp;&nbsp;stage: test</code></p>
        <div class="analogy">🏭 <b>Like an assembly line with inspectors:</b> each station checks the product, and if one inspector finds a flaw, the product never leaves the factory.</div>`,
      terms: [['CI', 'Automatically build and test every change.'], ['CD', 'Automatically deliver/deploy changes that pass.'], ['stage', 'One step of a pipeline.'], ['- item', 'A list item in YAML.']],
      example: {
        lang: 'yaml',
        code: `stages:
  - test
  - deploy
jobs:
  - name: unit-tests
    stage: test
    script:
      - npm test
  - name: ship-it
    stage: deploy
    script:
      - ./deploy.sh`,
        steps: [
          { lines: [1, 2, 3], text: 'A list of stages, run in this order.' },
          { lines: [4], text: '<code>jobs</code> is a list where each item is a group of settings.' },
          { lines: [5, 6], text: 'First job: the dash starts the item, <code>name</code> is its first setting, and <code>stage</code> lines up under <code>name</code>.' },
          { lines: [7, 8], text: 'Its <code>script</code> is itself a list of commands to run.' },
          { lines: [9, 10, 11, 12], text: 'Second job, in the deploy stage. It only runs if the test stage passed.' },
        ],
      },
      practice: [
        cfg({ id: 'L-do-p1', title: 'List the stages', filename: 'pipeline.yaml',
          brief: '<p>Write a <code>stages</code> list with exactly <code>lint</code>, <code>test</code>, <code>deploy</code>, in that order.</p>',
          starter: '# pipeline.yaml\nstages: lint, test, deploy\n',
          checks: [{ label: 'stages is the list lint, test, deploy', fn: (o) => isList(o.stages) && o.stages.join(',') === 'lint,test,deploy' }],
          hint: '<code>stages:</code> then three lines like <code>  - lint</code>.',
          solution: '# pipeline.yaml\nstages:\n  - lint\n  - test\n  - deploy\n' }),
        cfg({ id: 'L-do-p2', title: 'Add a test job', filename: 'pipeline.yaml',
          brief: '<p>Add a <code>jobs</code> list with one job: <code>name: unit-tests</code>, <code>stage: test</code>, and a <code>script</code> list containing <code>npm test</code>.</p>',
          starter: '# pipeline.yaml\nstages:\n  - test\n',
          checks: [
            { label: 'jobs is a list with a unit-tests job', fn: (o) => isList(o.jobs) && o.jobs.some((j) => j && j.name === 'unit-tests') },
            { label: 'the job is in the test stage and runs npm test', fn: (o) => isList(o.jobs) && o.jobs.some((j) => j && j.stage === 'test' && isList(j.script) && j.script.includes('npm test')) },
          ],
          hint: 'Copy the first job from the example.',
          solution: '# pipeline.yaml\nstages:\n  - test\njobs:\n  - name: unit-tests\n    stage: test\n    script:\n      - npm test\n' }),
        cfg({ id: 'L-do-p3', title: 'Deploy only from main', filename: 'pipeline.yaml',
          brief: '<p>The deploy job should only run on the <code>main</code> branch. Add an <code>only</code> list containing <code>main</code> to the <code>ship-it</code> job.</p>',
          starter: '# pipeline.yaml\njobs:\n  - name: ship-it\n    stage: deploy\n    script:\n      - ./deploy.sh\n',
          checks: [{ label: 'ship-it has only: [main]', fn: (o) => isList(o.jobs) && o.jobs.some((j) => j && j.name === 'ship-it' && isList(j.only) && j.only.length === 1 && j.only[0] === 'main') }],
          hint: 'Line <code>only:</code> up with <code>script:</code>, and put <code>- main</code> under it.',
          solution: '# pipeline.yaml\njobs:\n  - name: ship-it\n    stage: deploy\n    script:\n      - ./deploy.sh\n    only:\n      - main\n' }),
      ],
    },
    {
      id: 'triage', icon: '🚨', title: 'Incident triage in the terminal',
      summary: 'When something breaks, use grep and friends to find what and where, fast.',
      tags: ['incident', 'log', 'grep', 'oomkilled', '5xx', 'status', 'triage', 'sed'],
      words: `<p>An <b>incident</b> is when something is broken for users. The first job is to find <b>what</b> is failing, fast. Logs are the best clues.</p>
        <p>Web servers log one line per request, ending with a <b>status code</b>: <code>200</code>–<code>299</code> means success, <code>400</code>s mean the request was bad, and <code>500</code>s mean the <b>server</b> failed. Counting 5xx errors tells you how bad things are.</p>
        <p>Useful moves (you met most of them in the Linux internship):</p>
        <ul><li><code>grep -l WORD files*</code>: list <b>which files</b> contain a word. The <code>*</code> wildcard matches many files at once.</li>
        <li><code>grep -c ' 5[0-9][0-9]$' access.log</code>: count lines ending with a 5xx code. <code>[0-9]</code> means "any digit", and <code>$</code> means "end of line".</li>
        <li><code>sed -i 's/old/new/' file</code>: replace text inside a file (s = substitute).</li></ul>
        <div class="analogy">🕵️ <b>Like a detective at a crime scene:</b> don\'t read every page of every notebook. Search for the key word, then follow the clue.</div>`,
      terms: [['incident', 'A problem affecting users right now.'], ['status code', '200 OK, 404 not found, 500 server error…'], ['*', 'Wildcard: matches any characters.'], ['[0-9]', 'Any single digit (in grep patterns).'], ['sed -i', 'Edit a file in place.']],
      example: {
        lang: 'bash',
        code: `grep -l OOMKilled /var/log/pods/*.log
grep -c ' 5[0-9][0-9]$' /var/log/app/access.log
sed -i 's/port: 8008/port: 8080/' service.yaml`,
        output: '/var/log/pods/tickets.log\n3',
        steps: [
          { lines: [1], text: 'Which pod log mentions OOMKilled (out of memory)? The wildcard searches all of them at once.' },
          { lines: [2], text: 'How many requests failed with a server error? The pattern means: a space, a 5, two more digits, end of line.' },
          { lines: [3], text: 'Fix a bad setting in place: replace the wrong port with the right one.' },
        ],
      },
      practice: [
        term({ id: 'L-do-t1', title: 'Which pod crashed?',
          brief: '<p>One pod log in <code>/var/log/pods/</code> mentions <code>OOMKilled</code>. Find it with a single grep across all the logs.</p>',
          fs: { files: PODS, cwd: HOME },
          objectives: [{ text: 'Print which log file contains OOMKilled', check: (sh) => sh.history.some((h) => /grep/.test(h.cmd) && h.out.includes('tickets') && !h.out.includes('map.log')) }],
          hint: '<code>grep -l OOMKilled /var/log/pods/*.log</code>',
          solution: ['grep -l OOMKilled /var/log/pods/*.log'] }),
        term({ id: 'L-do-t2', title: 'Count server errors',
          brief: '<p>Print how many lines of <code>/var/log/app/access.log</code> end with a 5xx status code.</p>',
          fs: { files: { '/var/log/app/access.log': ACCESS }, cwd: HOME },
          objectives: [{ text: 'Print the number of 5xx lines', check: (sh) => sh.ran(/grep/) && sh.ranOutput('3') }],
          hint: "<code>grep -c ' 5[0-9][0-9]$' /var/log/app/access.log</code>",
          solution: ["grep -c ' 5[0-9][0-9]$' /var/log/app/access.log"] }),
        term({ id: 'L-do-t3', title: 'Fix the bad port',
          brief: '<p>The service config has the wrong port. Change <code>port: 8008</code> to <code>port: 8080</code> in <code>~/service.yaml</code>, and keep the other lines.</p>',
          fs: { files: { [HOME + '/service.yaml']: 'name: park-app\nport: 8008\nreplicas: 3\n' }, cwd: HOME },
          objectives: [{ text: 'service.yaml has port: 8080 and still has name and replicas', check: (sh) => { const c = sh.read(HOME + '/service.yaml') || ''; return /port: 8080/.test(c) && !/8008/.test(c) && /name: park-app/.test(c) && /replicas: 3/.test(c); } }],
          hint: "<code>sed -i 's/8008/8080/' service.yaml</code>, then <code>cat service.yaml</code> to check.",
          solution: ["sed -i 's/8008/8080/' service.yaml"] }),
      ],
    },
    {
      id: 'reliability', icon: '📉', title: 'Reliability math: availability, SLOs and backoff',
      summary: 'Measure how reliable a service is, and retry politely when it isn\'t.',
      tags: ['availability', 'slo', 'error budget', 'uptime', 'backoff', 'retry', 'reliability', 'percent'],
      words: `<p>Reliability teams measure things with a few simple formulas:</p>
        <ul><li><b>Availability</b>: the percent of time (or requests) that worked. <code>good / total * 100</code>. 99.9% is called "three nines".</li>
        <li>An <b>SLO</b> (service level objective) is the target, like 99.9%. The rest, 0.1%, is the <b>error budget</b>: how much failure is allowed. Over 30 days (43,200 minutes), 0.1% is about 43 minutes of downtime.</li>
        <li><b>Exponential backoff</b>: when a request fails, wait before retrying, and double the wait each time (1 s, 2 s, 4 s, 8 s…), up to a maximum. If every client retried instantly, a struggling service would be flooded and never recover.</li></ul>
        <div class="analogy">📞 <b>Like calling a busy friend:</b> if they don\'t pick up, you wait a bit longer before each new call instead of calling 50 times in a minute.</div>`,
      terms: [['availability', 'Percent of time/requests that succeeded.'], ['SLO', 'The reliability target.'], ['error budget', '100% − SLO: the failure you can afford.'], ['backoff', 'Waiting longer between each retry.']],
      example: {
        lang: 'python',
        code: `def allowed_downtime(slo, minutes):
    budget = 1 - slo
    return round(budget * minutes, 1)

allowed_downtime(0.999, 43200)`,
        output: '43.2',
        steps: [
          { lines: [1], text: 'Inputs: the SLO as a fraction (0.999 = 99.9%) and the period in minutes (30 days = 43,200).' },
          { lines: [2], text: 'The error budget is whatever the SLO doesn\'t promise: 0.001.' },
          { lines: [3], text: '0.001 × 43,200 = 43.2 minutes of allowed downtime this month.' },
        ],
      },
      practice: [
        py({ id: 'L-do-avail', title: 'Availability', fnName: 'availability',
          brief: '<p>Finish <code>availability(good, total)</code> to return the percent of good requests, rounded to 2 decimals. If total is 0, return <code>100.0</code> (nothing failed).</p>',
          starter: 'def availability(good, total):\n    return good / total\n',
          tests: [{ args: [999, 1000], expected: 99.9 }, { args: [0, 0], expected: 100 }], hidden: [{ args: [1, 3], expected: 33.33 }],
          hint: 'Multiply by 100, round to 2, and handle total == 0 first.',
          solution: 'def availability(good, total):\n    if total == 0:\n        return 100.0\n    return round(good / total * 100, 2)' }),
        py({ id: 'L-do-budget', title: 'Allowed downtime', fnName: 'allowed_downtime',
          brief: '<p>Finish <code>allowed_downtime(slo, minutes)</code> like the example: <code>(1 − slo) × minutes</code>, rounded to 1 decimal.</p>',
          starter: 'def allowed_downtime(slo, minutes):\n    pass\n',
          tests: [{ args: [0.999, 43200], expected: 43.2 }, { args: [0.99, 1000], expected: 10 }], hidden: [{ args: [1, 500], expected: 0 }],
          hint: '<code>return round((1 - slo) * minutes, 1)</code>',
          solution: 'def allowed_downtime(slo, minutes):\n    return round((1 - slo) * minutes, 1)' }),
        py({ id: 'L-do-backoff', title: 'Backoff schedule', fnName: 'backoff',
          brief: '<p>Finish <code>backoff(attempts, cap)</code> to return the wait (in seconds) before each retry: 1, 2, 4, 8… (doubling), but never more than <code>cap</code>.</p>',
          starter: 'def backoff(attempts, cap):\n    return [1] * attempts\n',
          tests: [{ args: [4, 100], expected: [1, 2, 4, 8] }, { args: [5, 5], expected: [1, 2, 4, 5, 5] }], hidden: [{ args: [0, 10], expected: [] }],
          hint: 'Retry i waits <code>2 ** i</code> seconds: <code>[min(cap, 2 ** i) for i in range(attempts)]</code>',
          solution: 'def backoff(attempts, cap):\n    return [min(cap, 2 ** i) for i in range(attempts)]' }),
      ],
    },
  ];
})();
