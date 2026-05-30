import { writable } from 'svelte/store';

const initialState = {
  phase: 'landing', // 'landing' | 'start' | 'countdown' | 'playing' | 'results'
  playerName: '',
  startTime: null,
  currentTime: 0,
  finalTime: 0,
  lossReason: null, // 'blink' | 'position_lost' | 'manual' | 'cheating'
  isDisqualified: false,
  isLoading: false,
  error: null
};

function createGameState() {
  const { subscribe, set, update } = writable(initialState);

  return {
    subscribe,
    setPhase: (phase) => update(state => ({ ...state, phase })),
    setPlayerName: (name) => update(state => ({ ...state, playerName: name })),
    startGame: () => update(state => ({
      ...state,
      phase: 'playing',
      startTime: Date.now(),
      currentTime: 0,
      finalTime: 0,
      lossReason: null,
      isDisqualified: false
    })),
    updateTimer: (time) => update(state => ({ ...state, currentTime: time })),
    endGame: (finalTime, lossReason, isDisqualified = false) => update(state => ({
      ...state,
      phase: 'results',
      finalTime,
      lossReason,
      isDisqualified,
      currentTime: 0
    })),
    reset: () => set(initialState),
    setLoading: (isLoading) => update(state => ({ ...state, isLoading })),
    setError: (error) => update(state => ({ ...state, error }))
  };
}

export const gameState = createGameState();
