// Everything you can buy. Effects:
//   energy / morale      instant change when consumed
//   productivity         passive bonus while the item is on your desk or worn
//   startEnergy          bonus energy at the start of every day (desk item)
//   dailyMorale          morale each morning (desk item)
//   presentation         delivery bonus while worn on stage
// Wearables carry `wear`: the part of the player's look they change.
IS.store = {
  categories: [
    { id: 'outfit', label: 'Outfits', icon: '👕', where: 'merch' },
    { id: 'hat', label: 'Hats', icon: '🎩', where: 'merch' },
    { id: 'accessory', label: 'Accessories', icon: '👓', where: 'merch' },
    { id: 'desk', label: 'Desk Setup', icon: '🪴', where: 'merch' },
    { id: 'cafe', label: 'Studio Café', icon: '☕', where: 'cafe' },
    { id: 'experience', label: 'Outings & Trips', icon: '🎟️', where: 'home' },
  ],
  items: [
    { id: 'tee', cat: 'outfit', name: 'Classic Tee', price: 0, emoji: '👕', desc: 'Comfy and reliable, like a good unit test.', wear: { top: 'tee' } },
    { id: 'polo', cat: 'outfit', name: 'Studio Polo', price: 28, emoji: '👕', desc: 'Mustard polo with the studio crest.', wear: { top: 'polo', topColor: '#d99a2b' } },
    { id: 'hoodie', cat: 'outfit', name: 'Imagineering Hoodie', price: 45, emoji: '🧥', desc: 'Forest green, extremely soft. Official intern drip.', wear: { top: 'hoodie', topColor: '#3e6b48' } },
    { id: 'castletee', cat: 'outfit', name: 'Castle Graphic Tee', price: 30, emoji: '🏰', desc: 'Terracotta tee with a gold castle print.', wear: { top: 'castletee', topColor: '#c2593f' } },
    { id: 'hawaiian', cat: 'outfit', name: 'Tiki Room Shirt', price: 35, emoji: '🌺', desc: 'Loud, floral and perfect for Friday demos.', wear: { top: 'hawaiian', topColor: '#6f8f5e' } },
    { id: 'sweater', cat: 'outfit', name: 'Cable-Knit Sweater', price: 50, emoji: '🧶', desc: 'For the office AC that is set to "arctic."', wear: { top: 'sweater', topColor: '#a8412a' } },
    { id: 'buttonup', cat: 'outfit', name: 'Crisp Button-Up', price: 55, emoji: '👔', desc: 'Interview-ready. +2 presentation delivery.', wear: { top: 'button', topColor: '#f3ece0' }, effect: { presentation: 2 } },
    { id: 'blazer', cat: 'outfit', name: 'Presentation Blazer', price: 90, emoji: '🧥', desc: 'Charcoal blazer. +3 presentation delivery.', wear: { top: 'blazer', topColor: '#2b2622' }, effect: { presentation: 3 } },
    { id: 'labcoat', cat: 'outfit', name: 'Lab Coat', price: 55, emoji: '🥼', desc: 'For when you calibrate animatronics (or want to look like it).', wear: { top: 'labcoat' } },
    { id: 'varsity', cat: 'outfit', name: 'Varsity Jacket', price: 70, emoji: '🧥', desc: 'Burgundy and gold. Very main-character energy.', wear: { top: 'varsity', topColor: '#8e2b45' } },

    { id: 'beanie', cat: 'hat', name: 'Cozy Beanie', price: 18, emoji: '🧶', desc: 'Keeps your brain warm.', wear: { hat: 'beanie' } },
    { id: 'cap', cat: 'hat', name: 'Studio Cap', price: 20, emoji: '🧢', desc: 'Backwards for coding, forwards for meetings.', wear: { hat: 'cap' } },
    { id: 'ears', cat: 'hat', name: 'Ear Headband', price: 30, emoji: '🎀', desc: 'Round ears with a terracotta bow. A park classic.', wear: { hat: 'ears' } },
    { id: 'explorer', cat: 'hat', name: 'Explorer Hat', price: 28, emoji: '🤠', desc: 'For expeditions to the lab.', wear: { hat: 'explorer' } },
    { id: 'hardhat', cat: 'hat', name: 'Lab Hard Hat', price: 24, emoji: '⛑️', desc: 'Safety first, style second. Or also first.', wear: { hat: 'hardhat' } },
    { id: 'wizard', cat: 'hat', name: 'Sorcerer Hat', price: 60, emoji: '🧙', desc: 'Deep green with gold stars. Slightly too big.', wear: { hat: 'wizard' } },
    { id: 'crown', cat: 'hat', name: 'Royal Crown', price: 150, emoji: '👑', desc: 'For the intern who has everything.', wear: { hat: 'crown' } },

    { id: 'glasses', cat: 'accessory', name: 'Tortoise Glasses', price: 25, emoji: '👓', desc: 'Very scholarly.', wear: { accessory: 'glasses' } },
    { id: 'sunglasses', cat: 'accessory', name: 'Sunglasses', price: 22, emoji: '🕶️', desc: 'Florida sun protection.', wear: { accessory: 'sunglasses' } },
    { id: 'headphones', cat: 'accessory', name: 'Noise-Cancel Headphones', price: 90, emoji: '🎧', desc: 'Deep focus. +5% productivity while worn.', wear: { accessory: 'headphones' }, effect: { productivity: 0.05 } },
    { id: 'lanyard', cat: 'accessory', name: 'Pin-Trading Lanyard', price: 35, emoji: '📛', desc: 'Covered in collectible pins. Great conversation starter.', wear: { accessory: 'lanyard' } },
    { id: 'tie', cat: 'accessory', name: 'Rust Silk Tie', price: 24, emoji: '👔', desc: 'Pairs with the button-up.', wear: { accessory: 'tie' } },
    { id: 'bowtie', cat: 'accessory', name: 'Bow Tie', price: 20, emoji: '🎀', desc: 'Dapper.', wear: { accessory: 'bowtie' } },
    { id: 'scarf', cat: 'accessory', name: 'Knit Scarf', price: 26, emoji: '🧣', desc: 'Terracotta and toasty.', wear: { accessory: 'scarf' } },

    { id: 'succulent', cat: 'desk', name: 'Tiny Succulent', price: 12, emoji: '🪴', desc: '+2 morale every morning.', effect: { dailyMorale: 2 } },
    { id: 'duck', cat: 'desk', name: 'Rubber Debug Duck', price: 8, emoji: '🦆', desc: 'Explaining code to it gives one free hint per day.', effect: { freeHint: 1 } },
    { id: 'keyboard', cat: 'desk', name: 'Mechanical Keyboard', price: 110, emoji: '⌨️', desc: 'Clicky. +5% productivity.', effect: { productivity: 0.05 } },
    { id: 'monitor', cat: 'desk', name: 'Second Monitor', price: 180, emoji: '🖥️', desc: 'Tests on one screen, code on the other. +10% productivity.', effect: { productivity: 0.1 } },
    { id: 'lamp', cat: 'desk', name: 'Brass Desk Lamp', price: 40, emoji: '💡', desc: 'Warm glow. +1 morale every morning.', effect: { dailyMorale: 1 } },
    { id: 'castle', cat: 'desk', name: 'Castle Model', price: 75, emoji: '🏰', desc: 'Hand-painted miniature castle. +2 morale every morning.', effect: { dailyMorale: 2 } },
    { id: 'robot', cat: 'desk', name: 'Retro Robot Figure', price: 45, emoji: '🤖', desc: 'Watches you code. Judges silently.' },
    { id: 'fridge', cat: 'desk', name: 'Mini Fridge', price: 140, emoji: '🧊', desc: 'Start every day with +10 energy.', effect: { startEnergy: 10 } },
    { id: 'standing', cat: 'desk', name: 'Standing Desk Converter', price: 160, emoji: '🧍', desc: 'Energy drains 15% slower.', effect: { drain: -0.15 } },
    { id: 'photo', cat: 'desk', name: 'Framed Team Photo', price: 15, emoji: '🖼️', desc: '+3 with every intern on your team.', effect: { teamRel: 3 } },

    { id: 'drip', cat: 'cafe', name: 'Drip Coffee', price: 3, emoji: '☕', desc: '+20 energy. 5 minutes.', effect: { energy: 20, time: 5 } },
    { id: 'coldbrew', cat: 'cafe', name: 'Cold Brew', price: 5, emoji: '🧋', desc: '+30 energy. 5 minutes.', effect: { energy: 30, time: 5 } },
    { id: 'latte', cat: 'cafe', name: 'Caramel Latte', price: 6, emoji: '🥛', desc: '+25 energy, +4 morale. 5 minutes.', effect: { energy: 25, morale: 4, time: 5 } },
    { id: 'matcha', cat: 'cafe', name: 'Matcha Latte', price: 6, emoji: '🍵', desc: '+20 energy, +6 morale. 5 minutes.', effect: { energy: 20, morale: 6, time: 5 } },
    { id: 'churro', cat: 'cafe', name: 'Churro', price: 5, emoji: '🥖', desc: '+10 energy, +8 morale.', effect: { energy: 10, morale: 8, time: 5 } },
    { id: 'pretzel', cat: 'cafe', name: 'Soft Pretzel', price: 7, emoji: '🥨', desc: '+15 energy, +6 morale.', effect: { energy: 15, morale: 6, time: 5 } },
    { id: 'teamcoffee', cat: 'cafe', name: 'Coffee Run for the Team', price: 22, emoji: '🛍️', desc: '+10 energy, +4 with every intern on your team. 15 minutes.', effect: { energy: 10, teamRel: 4, time: 15 } },

    { id: 'movie', cat: 'experience', name: 'Movie Night', price: 15, emoji: '🎬', desc: 'Catch the new animated release. +12 morale.', effect: { morale: 12 }, memory: 'Saw the new animated film on opening night' },
    { id: 'minigolf', cat: 'experience', name: 'Mini Golf with Interns', price: 20, emoji: '⛳', desc: '+10 morale, +3 with every intern.', effect: { morale: 10, teamRel: 3 }, memory: 'Lost at mini golf to the intern cohort (again)' },
    { id: 'concert', cat: 'experience', name: 'Symphony Under the Stars', price: 55, emoji: '🎻', desc: 'Film scores played live outdoors. +18 morale.', effect: { morale: 18 }, memory: 'Heard a full orchestra play film scores under the stars' },
    { id: 'parkday', cat: 'experience', name: 'Theme Park Day', price: 120, emoji: '🎢', desc: 'Ride the attractions your team supports. +25 morale.', effect: { morale: 25 }, memory: 'Spent a whole day at the park riding everything twice' },
    { id: 'beach', cat: 'experience', name: 'Beach Weekend', price: 90, emoji: '🏖️', desc: 'Sun, sand, zero tickets. +22 morale.', effect: { morale: 22 }, memory: 'Took a beach weekend and actually disconnected' },
    { id: 'roadtrip', cat: 'experience', name: 'Desert Road Trip', price: 250, emoji: '🏜️', desc: 'Red rocks and gas-station snacks. +35 morale.', effect: { morale: 35 }, memory: 'Road-tripped through red-rock canyons with the cohort' },
    { id: 'cruise', cat: 'experience', name: 'Weekend Cruise', price: 450, emoji: '🛳️', desc: 'Three nights at sea. +45 morale. Unlocks Globetrotter.', effect: { morale: 45 }, memory: 'Went on a weekend cruise and watched the sunrise at sea' },
  ],
  byId(id) {
    return this.items.find((i) => i.id === id);
  },
};
