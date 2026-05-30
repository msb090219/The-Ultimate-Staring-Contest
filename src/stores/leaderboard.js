import { writable } from 'svelte/store';

const initialState = {
  scores: [],
  topScores: [],
  userBestScore: null,
  userCentric: null,
  isLoading: false,
  error: null,
  lastFetch: null
};

function createLeaderboard() {
  const { subscribe, set, update } = writable(initialState);

  return {
    subscribe,
    setScores: (scores) => update(state => ({ ...state, scores })),
    setTopScores: (scores) => update(state => ({
      ...state,
      topScores: scores,
      lastFetch: Date.now()
    })),
    setUserBestScore: (score) => update(state => ({
      ...state,
      userBestScore: score
    })),
    setUserCentric: (data) => update(state => ({
      ...state,
      userCentric: data
    })),
    setLoading: (isLoading) => update(state => ({ ...state, isLoading })),
    setError: (error) => update(state => ({ ...state, error })),
    reset: () => set(initialState)
  };
}

export const leaderboard = createLeaderboard();
