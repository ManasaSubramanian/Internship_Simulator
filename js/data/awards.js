// Awards come in three flavors:
//   achievements: unlocked once per career, instantly (mini ceremony popup)
//   honors: weekly spot awards and the midpoint Rising Star (presented live)
//   finals: each internship's awards night, where you compete with that cohort
IS.awards = {
  achievements: [
    { id: 'hired', name: 'You\'re Hired!', icon: '🤝', desc: 'Pass your first internship interview.' },
    { id: 'persistent', name: 'Never Give Up', icon: '🔁', desc: 'Pass an interview after being turned down.' },
    { id: 'first_commit', name: 'First Commit', icon: '💾', desc: 'Submit your first technical assignment.' },
    { id: 'perfect', name: 'Perfect Score', icon: '💯', desc: 'Score 100% on any assignment.' },
    { id: 'early_bird', name: 'Early Bird', icon: '🐦', desc: 'Submit an assignment a full workday early.' },
    { id: 'caffeinated', name: 'Caffeine Powered', icon: '☕', desc: 'Buy 10 things at the Studio Café in one internship.' },
    { id: 'globetrotter', name: 'Globetrotter', icon: '🌍', desc: 'Go on a road trip or a cruise.' },
    { id: 'best_dressed', name: 'Best Dressed', icon: '👔', desc: 'Own 5 wearable items.' },
    { id: 'desk_designer', name: 'Desk Designer', icon: '🪴', desc: 'Display 5 items on your desk.' },
    { id: 'firefighter', name: 'Firefighter', icon: '🧯', desc: 'Resolve a production incident on time with 90%+.' },
    { id: 'bug_squasher', name: 'Bug Squasher', icon: '🐞', desc: 'Score 90%+ on every bug-fix ticket in an internship.' },
    { id: 'reviewer', name: 'Eagle-Eyed Reviewer', icon: '🦅', desc: 'Score 90%+ on every code review in an internship.' },
    { id: 'networker', name: 'Networker', icon: '🌐', desc: 'Meet 8 people in one internship (chats, coffee chats, tours).' },
    { id: 'overachiever', name: 'Overachiever', icon: '⭐', desc: 'Complete an optional stretch task.' },
    { id: 'polyglot', name: 'Polyglot', icon: '🗣️', desc: 'Earn return offers from 3 different internships.' },
    { id: 'full_time', name: 'Full-Time Imagineer', icon: '🏰', desc: 'Complete all 10 internships with a return offer.' },
  ],
  honors: [
    { id: 'spot', name: 'Pixie Dust Spot Award', icon: '✨', desc: 'Weekly: 90%+ average on that week\'s graded work with nothing late. Comes with a $50 bonus.' },
    { id: 'rising_star', name: 'Rising Star Award', icon: '🌟', desc: 'Midpoint review: 88%+ average and nothing missed.' },
  ],
  finals: [
    { id: 'intern_of_summer', name: 'Intern of the Term', icon: '🏆', desc: 'Highest overall performance in the cohort.', metric: 'Overall average, minus late work' },
    { id: 'code_craft', name: 'Code Craft Award', icon: '⚙️', desc: 'Best technical work.', metric: 'Average on technical assignments' },
    { id: 'storyteller', name: 'Master Storyteller Award', icon: '🎤', desc: 'Best presenter.', metric: 'Average presentation score' },
    { id: 'team_spirit', name: 'Team Spirit Award', icon: '🤝', desc: 'The teammate everyone wants.', metric: 'Intern relationships, group health and group grades' },
    { id: 'blue_sky', name: 'Blue Sky Innovation Award', icon: '💡', desc: 'Design excellence and going beyond the brief.', metric: 'Design docs + stretch task' },
    { id: 'right_on_cue', name: 'Right on Cue Award', icon: '⏰', desc: 'Hit every deadline.', metric: 'Punctuality (late and missed work)' },
    { id: 'curious_mind', name: 'Curious Mind Award', icon: '🔍', desc: 'Asked great questions and built a network.', metric: 'Help requests + networking' },
  ],
  // Baseline scores for the four interns in each cohort, by position:
  // [steady designer, brilliant-but-late coder, top performer, hands-on builder]
  npc: [
    { intern_of_summer: 86, code_craft: 80, storyteller: 92, team_spirit: 90, blue_sky: 84, right_on_cue: 94, curious_mind: 82 },
    { intern_of_summer: 79, code_craft: 89, storyteller: 80, team_spirit: 76, blue_sky: 78, right_on_cue: 55, curious_mind: 70 },
    { intern_of_summer: 91, code_craft: 92, storyteller: 85, team_spirit: 80, blue_sky: 89, right_on_cue: 96, curious_mind: 78 },
    { intern_of_summer: 81, code_craft: 76, storyteller: 77, team_spirit: 84, blue_sky: 87, right_on_cue: 72, curious_mind: 87 },
  ],
  all() {
    return [].concat(this.achievements, this.honors, this.finals);
  },
  byId(id) {
    return this.all().find((a) => a.id === id);
  },
};
