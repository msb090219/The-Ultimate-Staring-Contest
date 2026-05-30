import { writable } from 'svelte/store';

const initialState = {
  isAuthenticated: false,
  user: null, // { id, email, game_name, provider }
  session: null,
  isLoading: false,
  error: null
};

function createAuthState() {
  const { subscribe, set, update } = writable(initialState);

  return {
    subscribe,
    setUser: (user, session) => update(state => ({
      ...state,
      isAuthenticated: !!user,
      user,
      session,
      error: null
    })),
    updateGameName: (gameName) => update(state => ({
      ...state,
      user: state.user ? { ...state.user, game_name: gameName } : null
    })),
    setLoading: (isLoading) => update(state => ({ ...state, isLoading })),
    setError: (error) => update(state => ({ ...state, error })),
    logout: () => set(initialState)
  };
}

export const authState = createAuthState();
