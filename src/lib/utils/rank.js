import { RANKS } from '../constants/ranks.js';

export function getRank(time) {
  for (const rank of RANKS) {
    if (time <= rank.maxTime) {
      return rank.title;
    }
  }
  return RANKS[RANKS.length - 1].title;
}

export function getRankIndex(time) {
  for (let i = 0; i < RANKS.length; i++) {
    if (time <= RANKS[i].maxTime) {
      return i;
    }
  }
  return RANKS.length - 1;
}

export function getNextRank(currentTime) {
  const currentIndex = getRankIndex(currentTime);
  if (currentIndex < RANKS.length - 1) {
    const nextRank = RANKS[currentIndex + 1];
    return {
      title: nextRank.title,
      targetTime: nextRank.maxTime,
      improvement: nextRank.maxTime - currentTime
    };
  }
  return null;
}
