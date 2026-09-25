// Characters. Recurring studio staff live here; each internship track adds its
// own manager, mentor and intern cohort with IS.addCharacters().
// look: config for IS.people.svg (see people.js)
IS.characters = {};

IS.addCharacters = function (map) {
  Object.keys(map).forEach((id) => {
    const c = map[id];
    c.short = c.short || c.name.split(' ')[0];
    c.chat = c.chat || ['Good to see you!'];
    IS.characters[id] = c;
  });
};

IS.addCharacters({
  rosa: {
    name: 'Rosa Alvarez', title: 'University Programs Recruiter', role: 'Recruiter',
    bio: 'Rosa runs recruiting, onboarding and the intern program for every team in the studio, from interviews to awards night to return offers.',
    look: { skin: '#c68b5f', hair: 'long', hairColor: '#4a2e1c', eyes: '#3b2618', top: 'cardigan', topColor: '#d99a2b', bottom: 'pants', bottomColor: '#5a4636', shoes: 'boots', accessory: 'lanyard', accessory2: 'earrings' },
    chat: [
      'Return offers come down to three things: quality of work, reliability, and how people feel working with you.',
      'Go to the coffee chats. People remember the interns who showed up curious.',
      'Every internship here is 34 workdays. It goes faster than you think.',
      'Interview tip: specific stories beat big adjectives. "I cut load time 40%" beats "I\'m a hard worker."',
    ],
  },
  gus: {
    name: 'Gus Ferreira', title: 'Barista, Studio Café', role: 'Café',
    bio: 'Gus remembers everyone\'s order after one visit and knows all the campus gossip.',
    look: { skin: '#8a5638', hair: 'bald', hairColor: '#a3a09a', facial: 'mustache', eyes: '#3b2618', top: 'apron', topColor: '#f3ece0', bottom: 'pants', bottomColor: '#2b2622', shoes: 'loafers', build: 'broad' },
    chat: ['The usual? Or are we being adventurous today?', 'Word is the capstone demos are in the big screening room this year.', 'Pro tip: the cold brew is stronger than it looks.'],
  },
  marcus: {
    name: 'Marcus Bell', title: 'Security Officer', role: 'Security',
    bio: 'Marcus has worked the front desk for twelve years. Nobody gets past without a badge, and everybody gets a good morning.',
    look: { skin: '#4d2c1d', hair: 'buzz', hairColor: '#1c1714', facial: 'goatee', eyes: '#3b2618', top: 'button', topColor: '#2b2622', bottom: 'pants', bottomColor: '#2b2622', shoes: 'boots', build: 'broad', accessory: 'tie' },
    chat: ['Badge on the reader, green light, you\'re in. Have a great day.', 'I\'ve seen a lot of interns come through. The good ones say good morning. You\'re one of the good ones.', 'Don\'t hold the door for anyone without a badge. Not even if they have donuts.'],
  },
  lena: {
    name: 'Lena Hart', title: 'IT Help Desk', role: 'IT Support',
    bio: 'Lena fixes laptops, VPNs and existential crises. Keeps a spare charger for every device ever made.',
    look: { skin: '#f1d0b5', hair: 'bob', hairColor: '#c75b39', eyes: '#4f6b3a', top: 'polo', topColor: '#6f8f5e', bottom: 'pants', bottomColor: '#5a4636', shoes: 'sneakers', accessory: 'glasses' },
    chat: ['Have you tried turning it off and on again? No, really, it works 40% of the time.', 'Never reuse passwords. I can tell when you do. (I can\'t, but still.)', 'If your laptop is slow, close the 87 browser tabs. You know the ones.'],
  },
  harriet: {
    name: 'Harriet Lin', title: 'VP, Creative Technology', role: 'Executive',
    bio: 'Harriet sponsors every intern capstone and asks the hardest questions in the room, always kindly.',
    look: { skin: '#f1d0b5', hair: 'bob', hairColor: '#a3a09a', eyes: '#5a3a22', top: 'blazer', topColor: '#6b3a2e', bottom: 'skirt', bottomColor: '#2b2622', shoes: 'flats', accessory: 'glasses', accessory2: 'earrings' },
    chat: ['Technology is only magic if the guest never has to think about it.', 'I love a demo that fails gracefully more than one that never takes a risk.', 'What problem did you solve for a real person this week?'],
  },
  theo: {
    name: 'Theo Park', title: 'Show Producer', role: 'Producer',
    bio: 'Theo turns wild ideas into schedules. Always carrying a clipboard, a coffee and a deadline.',
    look: { skin: '#e7bf9c', hair: 'sidepart', hairColor: '#1c1714', eyes: '#3b2618', facial: 'stubble', top: 'sweater', topColor: '#3e6b48', bottom: 'pants', bottomColor: '#c9b18a', shoes: 'loafers' },
    chat: ['Every show has three deadlines: the real one, the one I tell you, and the one I tell myself.', 'Engineers who can explain things to producers are rare. Be rare.', 'Guests never see the schedule. They only feel it when it slips.'],
  },
  ava: {
    name: 'Ava Mensah', title: 'Experience Designer', role: 'Designer',
    bio: 'Ava designs the guest-facing side of everything: signs, apps, queues. Sketches on every napkin in the café.',
    look: { skin: '#6b4029', hair: 'braids', hairColor: '#1c1714', eyes: '#3b2618', top: 'tee', topColor: '#e07a5f', bottom: 'skirt', bottomColor: '#4b5a3a', shoes: 'sneakers', accessory2: 'earrings' },
    chat: ['If a guest has to read instructions, the design already failed a little.', 'I prototype in cardboard first. It is humbling and fast.', 'Accessibility isn\'t a feature. It\'s the floor.'],
  },
});

IS.RECURRING = ['rosa', 'gus', 'marcus', 'lena', 'harriet', 'theo', 'ava'];
