# Internship Simulator

An interactive game that gives you the experience of a software engineering internship at a theme-park studio. You interview, walk around the office, talk to the people you work with, and complete real assignments with real deadlines and a paycheck. Do well enough and you get a return offer for the next internship. There are ten internships in all.

> Educational simulation. Not affiliated with, sponsored or endorsed by The Walt Disney Company. All characters are fictional.

## ▶️ How to play

No build step. Open `index.html` in a modern browser (Chrome, Edge, Firefox, Safari). Progress saves automatically in your browser. The **💾 Export save** button in the bottom-left corner of every screen downloads a backup file; load it again with ☰ Menu → Import save.

To serve it locally instead (optional):

```bash
python3 -m http.server 8000   # then open http://localhost:8000
```

**Internet on first use:** Python tasks load [Pyodide](https://pyodide.org) (about 10 MB) and SQL tasks load [sql.js](https://sql.js.org) from the jsDelivr CDN the first time you run them. Everything else works offline.

## 🎮 The game

### 🎤 Interviews
Every internship starts with an interview:
- **Behavioral round:** five situational questions plus a short written answer, graded with a STAR-style rubric.
- **Technical round:** four concept questions and a timed live coding problem in that internship's language.

Score 70+ on both rounds to get the offer. If you don't pass, you go through **interview training**: you work through that internship's Learning Center topics (plus STAR answers if the behavioral round counts), solving a practice problem in each, then retry. You can retry as often as you like, and each completed training adds a small prep bonus. A return offer waives the behavioral round of the next interview.

### 📚 Learning Center
Beginner-friendly lessons for every internship, written for someone who has never used that language or heard of the topic. There are 45 topics (135 practice problems): 4–5 per internship plus 4 career skills (STAR interview answers, writing at work, code reviews, presenting). Each topic has:
1. **The idea in plain words:** an explanation with an everyday analogy and a "words to know" glossary.
2. **See it in code:** a worked example with a line-by-line breakdown. Pointing at a step highlights the matching lines.
3. **Your turn:** 3 practice problems that loop (1 → 2 → 3 → 1), run in the same engines as the real work. Each has a hint, and after one attempt you can reveal a solution.

Open it with 📚 in the office, the Learn app on your computer, from home, or from the career center. Every assignment also links its related lessons under **Get help**.

### 🏢 The office
The main screen is the studio itself. You walk around by clicking or with WASD/arrow keys, and press **E** to interact.
- Badge in with Marcus at security to start the day.
- Grab coffee from Gus at the café. Lena at the IT help desk and Rosa, the recruiter, are nearby.
- Your manager, mentor and four fellow interns are in the office. You can ask them for help or feedback, invite them on a coffee run, or ask for an extension.
- There's also a studio store, a Hall of Fame, a conference room and a team lab.

Your **computer** is at your desk. It has a To-Do list with every assignment, plus Mail, Calendar, HR (pay stubs and performance), Team and Career apps.

### 🗺️ Ten internships, 100 hours each

| # | Internship | Technology | Pay |
| --- | --- | --- | --- |
| 1 | Ride Systems Software | JavaScript | $24/hr |
| 2 | Park Operations Tools | Python | $26/hr |
| 3 | Guest Insights | Data science (Python) | $28/hr |
| 4 | Figure Animation Controls | C++ | $30/hr |
| 5 | Show Control Infrastructure | Linux / Bash | $32/hr |
| 6 | Reservations & Ticketing Data | SQL | $34/hr |
| 7 | Guest App Engineering | HTML / CSS / JS | $36/hr |
| 8 | Crowd Forecasting | Python (ML from scratch) | $38/hr |
| 9 | Platform Reliability | DevOps: YAML, Bash, Python | $40/hr |
| 10 | Imagination Lab | Full-stack capstone: JS, Python, SQL, web, Bash | $45/hr |

Each internship is **100 hours**: 3 hours a day (9:00 AM – 12:00 PM) for 33 days, plus a one-hour final day for reviews and the awards ceremony. Each one has its own team, 28–33 assignments, two group projects, an urgent production incident and an optional stretch task.

### 📋 Work, grading and pay
- **Technical work runs for real:**
  - JavaScript runs in a Web Worker and Python on Pyodide.
  - C++ runs on the bundled JSCPP interpreter, which supports C-style code only (arrays, C strings, `<cmath>`; no STL).
  - SQL runs on SQLite, checked against your database *and* a hidden one.
  - Web pages render in a sandboxed frame and are checked through the DOM.
  - The terminal is a simulated Linux shell with pipes, redirects and globs.
  - YAML configs are parsed and validated.
- **Everything else:**
  - Writing (design docs, emails, postmortems, READMEs) is scored against a keyword and structure rubric.
  - Code reviews, quizzes and live presentations with audience Q&A are graded too.
- **Deadlines:** late work loses 10% per workday and costs a $10 pay adjustment. More than 2 workdays late counts as missed (0% and another $25 off).
- **Help:** your mentor, fellow interns, the wiki, a rubber duck, and extensions requested *before* the deadline.
- **Pay:** hourly, every Friday after taxes. Clocking out early means fewer paid hours.

### 🛍️ Store, awards and ending
- **Store:** outfits, hats and accessories for your character, and desk upgrades (some boost productivity). The café sells energy; movies, park days and trips from home boost morale.
- **Awards:** career achievements, weekly spot awards, the midpoint Rising Star, and an animated awards ceremony at the end of every internship.
- **Ending:** finish all ten internships and you get a full-time offer.

## 🗂️ Project structure

```
index.html                 entry point
css/style.css              styles (warm palette, borderless components)
js/util.js                 helpers (time, money, grades, PRNG)
js/people.js               detailed SVG characters (full body + portraits, walk/blink animations)
js/tracks.js               internship registry + shared task templates
js/data/tracks/tNN-*.js    the ten internships: cast, tasks, interview, training
js/data/*.js               characters, store, awards, behavioral interview, scenes
js/state.js                save / load / import / export
js/engine.js               rules: time, energy, pay, deadlines, help, store, awards, career
js/grading.js              rubrics for code, quizzes, reviews, writing, presentations
js/runners/*.js            JavaScript, Python, C++, SQL, shell, web and YAML runners
js/office.js               the walkable office scene
js/computer.js             the in-game computer and its apps
js/workspace.js            assignment editors + live presentation stage
js/interview.js            interviews and training
js/learn.js                Learning Center (lessons + looping practice)
js/problem.js              shared practice-problem editor/runner
js/data/learn/*.js         lesson content for each internship + career skills
js/home.js                 title, character creator, apartment, results
js/ceremony.js             award ceremonies
js/ui.js, js/main.js       rendering, dialogue, day flow, click dispatcher
vendor/jscpp.js            bundled C++ interpreter (MIT, see vendor/JSCPP-LICENSE)
tests/                     content tests + reference solutions (spoilers!)
```

## 🧪 Testing shortcut

To move through the game quickly while testing, type **`3.14159265358979`** into any answer you write:
- **Interview** (written behavioral answer, or the live coding problem): passes the whole interview.
- **Assignment** (code, SQL, web page, YAML, terminal command, writing, review comment or slide text): submitting gives 100%, even with no focus time logged or after the deadline. You still need to be badged in.
- **Learning Center practice:** the problem counts as solved (this also counts toward interview training).

## ✅ Tests

```bash
npm install
npm test
```

The test suite runs every technical task and interview problem with the same engines the game uses (Pyodide, JSCPP, sql.js, jsdom, the shell simulator and the YAML parser). For each one, it checks three things:
- the reference solution passes every visible and hidden check and scores 100;
- the starter code fails at least one check;
- the rubrics reward thorough work over empty work.

It also checks every Learning Center topic: it has an explanation and a worked example whose steps point at real lines, and its practice problems' solutions pass while their starters fail. Schedules, casts and interview data are checked too. Reference solutions are in `tests/solutions/`.

If you change a SQL task, regenerate its expected results with `npm run gen:sql`.
