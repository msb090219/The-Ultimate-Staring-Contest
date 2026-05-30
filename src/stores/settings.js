import { writable } from 'svelte/store';

const initialState = {
  // Calibration thresholds
  faceDetection: {
    minConfidence: 0.7,
    minSizeRatio: 0.3,
    centerMargin: 0.2
  },
  eyeDetection: {
    minConfidence: 0.5,
    bothEyesRequired: true
  },
  lighting: {
    minBrightness: 50,
    maxBrightness: 230
  },
  blinkThreshold: {
    baselineMargin: 0.3,
    debounceMs: 100
  },
  positionMonitoring: {
    gracePeriod: 0,
    checkInterval: 100
  },
  // Game settings
  maxFrameRate: 30,
  countdownDuration: 3500, // ms
  // Display settings
  timerPrecision: 2 // decimal places
};

function createSettings() {
  const { subscribe, set, update } = writable(initialState);

  return {
    subscribe,
    update: (updates) => update(state => ({ ...state, ...updates })),
    reset: () => set(initialState)
  };
}

export const settings = createSettings();
