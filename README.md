# Internship Simulator

An interactive game that gives you the experience of a software engineering internship on a theme-park ride systems team: real assignments, real deadlines, a paycheck, teammates, presentations and an awards night.

> Educational simulation. Not affiliated with, sponsored or endorsed by The Walt Disney Company. All characters are fictional.

## ▶️ How to play

No install or build step. Open `index.html` in any modern browser (Chrome, Edge, Firefox, Safari). Progress saves automatically in your browser, and you can export or import a save file from **Save / Menu**.

To serve it locally instead (optional):

```bash
python3 -m http.server 8000   # then open http://localhost:8000
```

## 🎮 What's in the game

| Feature | Details |
| --- | --- |
| **Role** | Software Engineering Intern, Ride Systems Software, for 6 weeks / 30 workdays |
| **Hours & pay** | 3 hours a day (9:00 AM – 12:00 PM) at **$24/hr**, paid every Friday after taxes. Clocking out early means fewer paid hours. |
| **Assignments** | 32 tasks: 14 **coding** tasks (you write real JavaScript that runs against visible and hidden tests), 3 **code reviews**, 9 **writing** tasks (design docs, stakeholder email, blameless postmortem, README, self-evaluation…), 3 **training quizzes**, 3 **live presentations** |
| **Grading** | Every submission is scored against a rubric with a full breakdown and written feedback from whoever assigned it |
| **Deadlines** | Late work: −10% per workday and a $10 pay adjustment. More than 2 workdays late counts as **missed** (0% and another $25). |
| **Help** | Ask your mentor Dev for hints, ask a fellow intern, search the internal wiki, use a rubber duck, or ask your manager for an extension *before* the deadline |
| **Group projects** | Queue Time Display Board (week 2) and the Guest Flow Optimizer capstone (weeks 4–6). Your choices in kickoffs and conflicts change team health, which affects the group grade. |
| **Presentations** | Build a slide deck, then present live: pick your opening, handle a surprise mid-talk, and answer timed audience questions |
| **Store** | Outfits, hats and accessories for your avatar; desk upgrades (some boost productivity); café treats for energy; movies, park days and trips for morale |
| **Awards** | 12 achievements, weekly **Pixie Dust Spot Awards** ($50 bonus), the midpoint **Rising Star**, and a final **Summer Intern Awards** ceremony where you compete with the other interns in 7 categories |
| **Ending** | Final performance review, return-offer decision, report card, paystubs and a scrapbook of your summer |

### Characters
- **Maya Chen**: your manager
- **Dev Patel**: your mentor
- **Rosa Alvarez**: runs the intern program
- **Jordan, Sam, Priya, Tyler**: fellow interns and group-project teammates
- **Harriet Lin**: the VP who attends your final capstone presentation

## 🗂️ Project structure

```
index.html            entry point
css/style.css         all styles
js/util.js            helpers (time, money, grades, PRNG)
js/avatar.js          layered SVG avatars
js/data/*.js          content: tasks, characters, store, scenes, awards
js/state.js           save / load / import / export
js/engine.js          game rules: time, energy, pay, deadlines, help, store, awards
js/grading.js         rubrics for code, quizzes, reviews, writing, presentations
js/coderunner.js      runs player code in a Web Worker with a timeout
js/ui.js              shell, modals, dialogue scenes, end-of-day flow
js/ceremony.js        award ceremonies
js/views.js           pages (desk, tasks, inbox, team, store, profile, report, awards, pay)
js/workspace.js       assignment workspace + live presentation stage
tests/run-tests.js    content checks (reference solutions, rubrics, schedule)
```

## ✅ Tests

```bash
node tests/run-tests.js
```

This checks that every coding task's reference solution passes all visible and hidden tests, that the starter code does not, and that the rubrics reward thorough work over empty work. The reference solutions are in `tests/solutions.js`. Spoilers!
