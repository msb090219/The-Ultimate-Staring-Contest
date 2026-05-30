import { supabase } from '../../services/supabase.js';

const sampleNames = [
  'StarGazer', 'BlinkMaster', 'EyeContactPro', 'FocusKing', 'StareChampion',
  'UnblinkingHero', 'GazeWarrior', 'VisionKeeper', 'FocusLegend', 'StareMaster',
  'EagleEyes', 'IronGaze', 'LaserFocus', 'DiamondEyes', 'StareNinja',
  'BlinklessWonder', 'GazeGuardian', 'VisionViking', 'FocusPhoenix', 'EyeEmperor',
  'StareSorcerer', 'GazeGladiator', 'VisionValkyrie', 'FocusFury', 'EyeEnigma',
  'BlinkBreaker', 'GazeGhost', 'VisionVirtuoso', 'FocusFalcon', 'StareStorm',
  'EyeEmpress', 'GazeGenius', 'VisionViper', 'FocusForce', 'BlinkBoss',
  'StareSupreme', 'GazeGiant', 'VisionVanguard', 'FocusFenix', 'EyeElite',
  'BlinkBuster', 'GazeGod', 'VisionVictor', 'FocusFlash', 'StareSamurai',
  'EyeTitan', 'GazeGriffin', 'VisionVortex', 'FocusFrost', 'BlinkBanisher'
];

// Generate random time between 5 and 60 seconds
function randomTime() {
  return Math.random() * 55 + 5;
}

// Generate random date within last 30 days
function randomDate() {
  const now = new Date();
  const daysAgo = Math.floor(Math.random() * 30);
  const date = new Date(now.getTime() - daysAgo * 24 * 60 * 60 * 1000);
  return date.toISOString();
}

export async function seedDatabase(count = 50) {
  console.log(`[Seed] Inserting ${count} sample scores...`);

  const scores = [];
  const usedNames = new Set();

  for (let i = 0; i < count; i++) {
    // Pick a random name (ensure uniqueness)
    let name;
    do {
      name = sampleNames[Math.floor(Math.random() * sampleNames.length)];
      if (usedNames.size >= sampleNames.length) {
        name = `${name}${Math.floor(Math.random() * 1000)}`;
      }
    } while (usedNames.has(name));

    usedNames.add(name);

    scores.push({
      user_id: null, // Guest users
      guest_identifier: `seed_guest_${i}_${Date.now()}`,
      game_name: name,
      time_seconds: parseFloat(randomTime().toFixed(2)),
      is_disqualified: false,
      created_at: randomDate()
    });
  }

  // Sort by time (descending) so better scores appear first
  scores.sort((a, b) => b.time_seconds - a.time_seconds);

  try {
    // Insert in batches of 20
    const batchSize = 20;
    for (let i = 0; i < scores.length; i += batchSize) {
      const batch = scores.slice(i, i + batchSize);
      const { data, error } = await supabase
        .from('scores')
        .insert(batch)
        .select();

      if (error) {
        console.error(`[Seed] Batch ${i / batchSize + 1} failed:`, error);
      } else {
        console.log(`[Seed] Batch ${i / batchSize + 1} inserted:`, data?.length || 0, 'scores');
      }
    }

    console.log('[Seed] Complete! Use window.location.reload() to refresh the page.');
    return { success: true, inserted: scores.length };
  } catch (error) {
    console.error('[Seed] Error:', error);
    return { success: false, error: error.message };
  }
}

// Expose to browser console
if (typeof window !== 'undefined') {
  window.seedDatabase = () => seedDatabase(50);
  console.log('[Seed] Seeding function available: window.seedDatabase()');
}
