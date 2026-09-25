// Behavioral interview content shared by every internship. The lessons that
// teach it live in the Learning Center (js/data/learn/career.js).
IS.behavioral = {
  questions: [
    { q: 'Tell me about a time you disagreed with a teammate. What happened?', options: [
      { text: 'On a class project we disagreed about the database. I set up a 15-minute call, we listed pros and cons, tested both on a small sample, and picked the faster one. We shipped on time and I learned to decide with data.', pts: 10 },
      { text: 'I usually just go along with whatever the group wants to avoid conflict.', pts: 3 },
      { text: 'My teammate was wrong, so I rewrote their part myself.', pts: 0 },
      { text: 'We argued for a while but eventually it worked out.', pts: 5 }] },
    { q: 'Describe a project you\'re proud of.', options: [
      { text: 'I built things. Lots of things.', pts: 2 },
      { text: 'I built a bus-arrival app for my campus. I designed the API, wrote tests, and 400 students used it in the first month. The hardest part was handling bad GPS data, so I added filtering.', pts: 10 },
      { text: 'A group project that got an A.', pts: 4 },
      { text: 'Honestly, none really. I\'m hoping to build one here.', pts: 1 }] },
    { q: 'Tell me about a time you failed.', options: [
      { text: 'I don\'t really fail. I just work harder.', pts: 0 },
      { text: 'I missed a hackathon deadline because I didn\'t scope down. Now I break work into milestones and cut features early. My next project shipped two days early.', pts: 10 },
      { text: 'I failed an exam once because the professor was unfair.', pts: 1 },
      { text: 'I once had a bug in production. It was stressful.', pts: 5 }] },
    { q: 'What do you do if you realize you won\'t meet a deadline?', options: [
      { text: 'Stay up all night and hope.', pts: 2 },
      { text: 'Tell my manager as early as possible, explain why, propose a new date or a smaller scope, and ask what matters most.', pts: 10 },
      { text: 'Submit whatever I have when it\'s due without saying anything.', pts: 1 },
      { text: 'Ask a teammate to finish it for me.', pts: 3 }] },
    { q: 'Why do you want to intern with this team?', options: [
      { text: 'I need an internship for my resume.', pts: 1 },
      { text: 'I grew up loving theme parks, and I want to learn how software makes the guest experience work, like wait times and show control. This team builds exactly that, and I want to learn from engineers who ship real systems.', pts: 10 },
      { text: 'The free park tickets.', pts: 0 },
      { text: 'It seems like a cool company.', pts: 4 }] },
    { q: 'Tell me about a time you had to learn something quickly.', options: [
      { text: 'I had one week to learn SQL for a research job. I did a tutorial, then rewrote three real queries the team used and asked a senior student to review them. By week two I was writing reports alone.', pts: 10 },
      { text: 'I\'m a fast learner, I pick things up quickly.', pts: 3 },
      { text: 'I watched a lot of videos.', pts: 4 },
      { text: 'I usually avoid things I don\'t know.', pts: 0 }] },
    { q: 'You have three assignments due the same week. How do you prioritize?', options: [
      { text: 'Whatever is most fun first.', pts: 1 },
      { text: 'List them with deadlines and effort, do the most urgent and important first, block time on my calendar, and flag any conflict to my manager early.', pts: 10 },
      { text: 'Work on all three a little each day and see what happens.', pts: 4 },
      { text: 'The easiest one first so I feel productive.', pts: 3 }] },
    { q: 'Describe a time you got critical feedback.', options: [
      { text: 'A TA said my code was hard to read. I asked for an example, started writing smaller functions with clear names, and my next review said it was the easiest submission to grade.', pts: 10 },
      { text: 'I don\'t get much critical feedback.', pts: 1 },
      { text: 'I felt bad about it for a while.', pts: 3 },
      { text: 'I explained why they were wrong.', pts: 0 }] },
    { q: 'Tell me about a time you helped a teammate.', options: [
      { text: 'A teammate was stuck on a bug before a demo. I paired with them for 30 minutes, we found an off-by-one error, and I showed them how I debug with small prints and tests.', pts: 10 },
      { text: 'I usually focus on my own work.', pts: 1 },
      { text: 'I helped someone with homework once.', pts: 4 },
      { text: 'I did their part so we would get a good grade.', pts: 3 }] },
    { q: 'You find a bug an hour before a launch. What do you do?', options: [
      { text: 'Stay quiet. Launches are stressful enough.', pts: 0 },
      { text: 'Tell the team lead right away with the impact and a proposed fix or workaround, so they can decide whether to delay, patch, or launch with a known issue.', pts: 10 },
      { text: 'Fix it quickly myself and push without telling anyone.', pts: 2 },
      { text: 'Write it down to fix next week.', pts: 3 }] },
    { q: 'How would you explain a technical idea to someone non-technical?', options: [
      { text: 'Use the correct technical terms so they learn them.', pts: 2 },
      { text: 'Start with why it matters to them, use a simple analogy, skip jargon, and check that it makes sense by asking a question back.', pts: 10 },
      { text: 'Send them a link to the documentation.', pts: 3 },
      { text: 'Tell them it\'s complicated and not to worry about it.', pts: 0 }] },
    { q: 'Tell me about a time you took initiative.', options: [
      { text: 'Our club\'s sign-up sheet kept losing entries, so I built a simple form with validation and a spreadsheet export. Sign-ups went up 30% and the officers still use it.', pts: 10 },
      { text: 'I always do what I\'m told.', pts: 1 },
      { text: 'I suggested an idea once but nobody did it.', pts: 3 },
      { text: 'I volunteer a lot.', pts: 4 }] },
  ],
  freeResponse: {
    q: 'In your own words: why do you want this internship, and what will you bring to the team? (50+ words)',
    rubric: {
      minWords: 50, format: 'doc',
      sections: [
        { label: 'Motivation', keys: ['excited', 'passion', 'love', 'want to', 'dream', 'inspired', 'interested'] },
        { label: 'Relevant skills', keys: ['skill', 'experience', 'built', 'project', 'learned', 'course', 'code', 'programming'] },
        { label: 'Team / guest focus', keys: ['team', 'guest', 'studio', 'park', 'ride', 'show', 'people'] },
        { label: 'Specific example', keys: ['for example', 'when i', 'last year', 'this year', 'semester', 'i built', 'i created', 'i led'] },
        { label: 'Growth', keys: ['learn', 'grow', 'goal', 'improve', 'mentor', 'feedback'] },
      ],
      terms: [],
    },
  },
};
