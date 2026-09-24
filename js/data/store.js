// Everything you can buy. Effects:
//   energy / morale      instant change when consumed
//   productivity         passive bonus while the desk item is displayed
//   startEnergy          bonus energy at the start of every day (desk item)
// Categories: outfit, hat, accessory (wearable), desk (placed on desk),
// cafe (consumed, only while clocked in), experience (only while clocked out).
IS.store = {
  categories: [
    { id: 'outfit', label: 'Outfits', icon: '👕' },
    { id: 'hat', label: 'Hats', icon: '🎩' },
    { id: 'accessory', label: 'Accessories', icon: '🕶️' },
    { id: 'desk', label: 'Desk Setup', icon: '🖥️' },
    { id: 'cafe', label: 'Studio Café', icon: '☕' },
    { id: 'experience', label: 'Outings & Trips', icon: '🎟️' },
  ],
  items: [
    // Outfits (tee is free and owned from the start)
    { id: 'tee', cat: 'outfit', name: 'Classic Tee', price: 0, emoji: '👕', desc: 'Comfy and reliable, like a good unit test.' },
    { id: 'hoodie', cat: 'outfit', name: 'Imagineering Hoodie', price: 45, emoji: '🧥', desc: 'Navy hoodie with a tiny gold star. Official intern drip.' },
    { id: 'castletee', cat: 'outfit', name: 'Castle Graphic Tee', price: 30, emoji: '🏰', desc: 'A soft tee with a sparkly castle print.' },
    { id: 'hawaiian', cat: 'outfit', name: 'Tiki Room Shirt', price: 35, emoji: '🌺', desc: 'Loud, floral, and perfect for Friday demos.' },
    { id: 'blazer', cat: 'outfit', name: 'Presentation Blazer', price: 80, emoji: '🤵', desc: 'Adds +3 to presentation delivery scores while worn.', effect: { presentation: 3 } },
    { id: 'labcoat', cat: 'outfit', name: 'Ride Lab Coat', price: 55, emoji: '🥼', desc: 'For when you want to look like you calibrate animatronics.' },
    { id: 'varsity', cat: 'outfit', name: 'Varsity Jacket', price: 65, emoji: '🧑‍🎓', desc: 'Red and gold. Very main-character energy.' },

    // Hats
    { id: 'beanie', cat: 'hat', name: 'Cozy Beanie', price: 18, emoji: '🧢', desc: 'Keeps your brain warm while the AC blasts.' },
    { id: 'cap', cat: 'hat', name: 'Baseball Cap', price: 20, emoji: '🧢', desc: 'Backwards for coding, forwards for meetings.' },
    { id: 'ears', cat: 'hat', name: 'Sparkle Ear Headband', price: 30, emoji: '✨', desc: 'Round ears with a glittery bow. A park classic.' },
    { id: 'explorer', cat: 'hat', name: 'Explorer Hat', price: 28, emoji: '🤠', desc: 'For expeditions to the ride lab.' },
    { id: 'wizard', cat: 'hat', name: 'Sorcerer Hat', price: 60, emoji: '🧙', desc: 'Blue, starry, and slightly too big.' },
    { id: 'crown', cat: 'hat', name: 'Royal Crown', price: 150, emoji: '👑', desc: 'For the intern who has everything.' },

    // Accessories
    { id: 'glasses', cat: 'accessory', name: 'Round Glasses', price: 25, emoji: '👓', desc: 'Very scholarly. +1 to looking smart.' },
    { id: 'sunglasses', cat: 'accessory', name: 'Sunglasses', price: 22, emoji: '🕶️', desc: 'Florida sun protection.' },
    { id: 'headphones', cat: 'accessory', name: 'Noise-Cancel Headphones', price: 90, emoji: '🎧', desc: 'Deep focus. +5% productivity while worn.', effect: { productivity: 0.05 } },
    { id: 'lanyard', cat: 'accessory', name: 'Pin-Trading Lanyard', price: 35, emoji: '📛', desc: 'Covered in collectible pins. Great conversation starter.' },
    { id: 'bowtie', cat: 'accessory', name: 'Bow Tie', price: 20, emoji: '🎀', desc: 'Dapper.' },

    // Desk setup
    { id: 'succulent', cat: 'desk', name: 'Tiny Succulent', price: 12, emoji: '🪴', desc: 'Low maintenance. +2 morale every morning.', effect: { dailyMorale: 2 } },
    { id: 'duck', cat: 'desk', name: 'Rubber Debug Duck', price: 8, emoji: '🦆', desc: 'Explaining code to it gives you one free hint per day.', effect: { freeHint: 1 } },
    { id: 'keyboard', cat: 'desk', name: 'Mechanical Keyboard', price: 110, emoji: '⌨️', desc: 'Clicky. +5% productivity.', effect: { productivity: 0.05 } },
    { id: 'monitor', cat: 'desk', name: 'Second Monitor', price: 180, emoji: '🖥️', desc: 'Tests on one screen, code on the other. +10% productivity.', effect: { productivity: 0.1 } },
    { id: 'lamp', cat: 'desk', name: 'Rocket Lamp', price: 40, emoji: '🚀', desc: 'Warm glow. +1 morale every morning.', effect: { dailyMorale: 1 } },
    { id: 'castle', cat: 'desk', name: 'Castle Model', price: 75, emoji: '🏰', desc: 'A hand-painted miniature castle. Pure inspiration.', effect: { dailyMorale: 2 } },
    { id: 'robot', cat: 'desk', name: 'Retro Robot Figure', price: 45, emoji: '🤖', desc: 'Watches you code. Judges silently.' },
    { id: 'fridge', cat: 'desk', name: 'Mini Fridge', price: 140, emoji: '🧊', desc: 'Stocked snacks. Start every day with +10 energy.', effect: { startEnergy: 10 } },
    { id: 'standing', cat: 'desk', name: 'Standing Desk Converter', price: 160, emoji: '🧍', desc: 'Energy drains 15% slower.', effect: { drain: -0.15 } },
    { id: 'photo', cat: 'desk', name: 'Framed Team Photo', price: 15, emoji: '🖼️', desc: 'Your intern cohort. +3 to all teammate relationships.', effect: { teamRel: 3 } },

    // Café (consumed immediately, only while clocked in)
    { id: 'drip', cat: 'cafe', name: 'Drip Coffee', price: 3, emoji: '☕', desc: '+20 energy. Takes 5 minutes.', effect: { energy: 20, time: 5 } },
    { id: 'coldbrew', cat: 'cafe', name: 'Cold Brew', price: 5, emoji: '🧋', desc: '+30 energy. Takes 5 minutes.', effect: { energy: 30, time: 5 } },
    { id: 'latte', cat: 'cafe', name: 'Caramel Latte', price: 6, emoji: '🥛', desc: '+25 energy, +4 morale. Takes 5 minutes.', effect: { energy: 25, morale: 4, time: 5 } },
    { id: 'matcha', cat: 'cafe', name: 'Matcha Latte', price: 6, emoji: '🍵', desc: '+20 energy, +6 morale. Takes 5 minutes.', effect: { energy: 20, morale: 6, time: 5 } },
    { id: 'churro', cat: 'cafe', name: 'Churro', price: 5, emoji: '🥖', desc: '+10 energy, +8 morale. Cinnamon sugar everywhere.', effect: { energy: 10, morale: 8, time: 5 } },
    { id: 'pretzel', cat: 'cafe', name: 'Mouse Pretzel', price: 7, emoji: '🥨', desc: '+15 energy, +6 morale.', effect: { energy: 15, morale: 6, time: 5 } },
    { id: 'teamcoffee', cat: 'cafe', name: 'Coffee Run for the Team', price: 22, emoji: '🛍️', desc: '+10 energy for you, +4 with every fellow intern. Takes 15 minutes.', effect: { energy: 10, teamRel: 4, time: 15 } },

    // Experiences (only while clocked out: evenings and weekends)
    { id: 'movie', cat: 'experience', name: 'Movie Night Ticket', price: 15, emoji: '🎬', desc: 'Catch the new animated release. +12 morale.', effect: { morale: 12 }, memory: 'Saw the new animated film on opening night' },
    { id: 'minigolf', cat: 'experience', name: 'Mini Golf with Interns', price: 20, emoji: '⛳', desc: '+10 morale, +3 with every intern.', effect: { morale: 10, teamRel: 3 }, memory: 'Lost at mini golf to Priya (again)' },
    { id: 'concert', cat: 'experience', name: 'Symphony Under the Stars', price: 55, emoji: '🎻', desc: 'Film scores played live outdoors. +18 morale.', effect: { morale: 18 }, memory: 'Heard a full orchestra play film scores under the stars' },
    { id: 'parkday', cat: 'experience', name: 'Theme Park Day', price: 120, emoji: '🎢', desc: 'Ride the attractions your team supports. +25 morale.', effect: { morale: 25 }, memory: 'Spent a whole day at the park riding everything twice' },
    { id: 'beach', cat: 'experience', name: 'Beach Weekend', price: 90, emoji: '🏖️', desc: 'Sun, sand, zero Jira tickets. +22 morale.', effect: { morale: 22 }, memory: 'Took a beach weekend and actually disconnected' },
    { id: 'roadtrip', cat: 'experience', name: 'National Park Road Trip', price: 250, emoji: '🏔️', desc: 'Huge views, bad gas station snacks. +35 morale.', effect: { morale: 35 }, memory: 'Road-tripped to a national park with the intern cohort' },
    { id: 'cruise', cat: 'experience', name: 'Weekend Cruise', price: 450, emoji: '🛳️', desc: 'Three nights at sea. +45 morale. Unlocks the Globetrotter award.', effect: { morale: 45 }, memory: 'Went on a weekend cruise and saw bioluminescent waves' },
  ],
  byId(id) {
    return this.items.find((i) => i.id === id);
  },
};
