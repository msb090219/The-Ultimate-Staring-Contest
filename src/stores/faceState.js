import { writable } from 'svelte/store';

const initialState = {
  isDetected: false,
  blinkLeft: 0,
  blinkRight: 0,
  confidence: 0,
  boundingBox: null, // { x, y, width, height }
  calibrationBaseline: null, // { left, right } for dynamic threshold
  blinkThreshold: 0.5, // Default, will be calibrated
  lastFrameTime: 0,
  frameCount: 0,
  landmarks: null, // MediaPipe face landmarks for visual overlay
  blinkWarningLevel: 0, // 0-1 scale: how close to blinking
  blinkWarningMessage: '' // Warning message to display
};

function createFaceState() {
  const { subscribe, set, update } = writable(initialState);

  return {
    subscribe,
    updateDetection: (detected, confidence = 0) => update(state => ({
      ...state,
      isDetected: detected,
      confidence
    })),
    updateBlinkValues: (left, right) => update(state => ({
      ...state,
      blinkLeft: left,
      blinkRight: right
    })),
    updateBoundingBox: (box) => update(state => ({
      ...state,
      boundingBox: box
    })),
    updateLandmarks: (landmarks) => update(state => ({
      ...state,
      landmarks
    })),
    setCalibrationBaseline: (baseline) => update(state => {
      console.log('[FaceState] Calibration complete - EAR Baseline:', baseline);
      return {
        ...state,
        calibrationBaseline: baseline
      };
    }),
    incrementFrameCount: () => update(state => ({
      ...state,
      frameCount: state.frameCount + 1,
      lastFrameTime: Date.now()
    })),
    updateBlinkWarning: (level, message = '') => update(state => ({
      ...state,
      blinkWarningLevel: Math.max(0, Math.min(1, level)), // Clamp 0-1
      blinkWarningMessage: message
    })),
    reset: () => set(initialState)
  };
}

export const faceState = createFaceState();
