// Awards come in three flavors:
//   achievements: unlocked instantly during play (mini ceremony popup)
//   honors: weekly spot awards and the midpoint Rising Star (presented by Maya/Rosa)
//   finals: the end-of-internship ceremony, where you compete with the other interns
IS.awards = {
  achievements: [
    { id: 'first_commit', name: 'First Commit', icon: '💾', desc: 'Submit your first coding assignment.' },
    { id: 'perfect', name: 'Perfect Score', icon: '💯', desc: 'Score 100% on any assignment.' },
    { id: 'early_bird', name: 'Early Bird', icon: '🐦', desc: 'Submit an assignment a full workday before it is due.' },
    { id: 'caffeinated', name: 'Caffeine Powered', icon: '☕', desc: 'Buy 10 things at the Studio Café.' },
    { id: 'globetrotter', name: 'Globetrotter', icon: '🌍', desc: 'Go on a road trip or a cruise.' },
    { id: 'best_dressed', name: 'Best Dressed', icon: '👔', desc: 'Own 5 wearable items.' },
    { id: 'desk_designer', name: 'Desk Designer', icon: '🪴', desc: 'Display 5 items on your desk.' },
    { id: 'firefighter', name: 'Firefighter', icon: '🧯', desc: 'Resolve the production incident on time with 90%+.' },
    { id: 'bug_squasher', name: 'Bug Squasher', icon: '🐞', desc: 'Score 90%+ on all three bug-fix tickets.' },
    { id: 'reviewer', name: 'Eagle-Eyed Reviewer', icon: '🦅', desc: 'Score 90%+ on all three code reviews.' },
    { id: 'networker', name: 'Networker', icon: '🤝', desc: 'Reach 8 networking points (chats, coffee chats, tours, talks).' },
    { id: 'overachiever', name: 'Overachiever', icon: '⭐', desc: 'Complete the optional stretch task.' },
  ],
  honors: [
    { id: 'spot', name: 'Pixie Dust Spot Award', icon: '✨', desc: 'Weekly: 90%+ average on that week\'s graded work with nothing late. Comes with a $50 bonus.' },
    { id: 'rising_star', name: 'Rising Star Award', icon: '🌟', desc: 'Midpoint review: 88%+ average and nothing missed.' },
  ],
  finals: [
    { id: 'intern_of_summer', name: 'Intern of the Summer', icon: '🏆', desc: 'Highest overall performance in the cohort.', metric: 'Overall average, minus late work' },
    { id: 'code_craft', name: 'Code Craft Award', icon: '⚙️', desc: 'Best engineering work.', metric: 'Average on coding assignments' },
    { id: 'storyteller', name: 'Master Storyteller Award', icon: '🎤', desc: 'Best presenter.', metric: 'Average presentation score' },
    { id: 'team_spirit', name: 'Team Spirit Award', icon: '🤝', desc: 'The teammate everyone wants.', metric: 'Intern relationships, group health and group grades' },
    { id: 'blue_sky', name: 'Blue Sky Innovation Award', icon: '💡', desc: 'Design excellence and going beyond the brief.', metric: 'Design docs + stretch task' },
    { id: 'right_on_cue', name: 'Right on Cue Award', icon: '⏰', desc: 'Hit every deadline.', metric: 'Punctuality (late and missed work)' },
    { id: 'curious_mind', name: 'Curious Mind Award', icon: '🔍', desc: 'Asked great questions and built a network.', metric: 'Help requests + networking' },
  ],
  // Baseline scores for the NPC interns in each final category.
  npc: {
    jordan: { intern_of_summer: 86, code_craft: 80, storyteller: 92, team_spirit: 90, blue_sky: 84, right_on_cue: 94, curious_mind: 82 },
    sam: { intern_of_summer: 79, code_craft: 89, storyteller: 80, team_spirit: 76, blue_sky: 78, right_on_cue: 55, curious_mind: 70 },
    priya: { intern_of_summer: 91, code_craft: 92, storyteller: 85, team_spirit: 80, blue_sky: 89, right_on_cue: 96, curious_mind: 78 },
    tyler: { intern_of_summer: 81, code_craft: 76, storyteller: 77, team_spirit: 84, blue_sky: 87, right_on_cue: 72, curious_mind: 87 },
  },
  all() {
    return [].concat(this.achievements, this.honors, this.finals);
  },
  byId(id) {
    return this.all().find((a) => a.id === id);
  },
};
