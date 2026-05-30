export const RANKS = [
  { maxTime: 3, title: "NPC Blink Speed" },
  { maxTime: 8, title: "Weak but Respectable" },
  { maxTime: 15, title: "Suspiciously Focused" },
  { maxTime: 25, title: "Villain Energy" },
  { maxTime: Infinity, title: "Probably Not Human" }
];

export function getRank(time) {
  for (const rank of RANKS) {
    if (time <= rank.maxTime) {
      return rank.title;
    }
  }
  return RANKS[RANKS.length - 1].title;
}
