export const CALIBRATION = {
  faceDetection: {
    minConfidence: 0.7,
    minSizeRatio: 0.45,  // Face must be 45% of frame height (MUST be closer!)
    centerMargin: 0.1   // 10% margin from edges (more lenient)
  },

  eyeDetection: {
    minConfidence: 0.5,
    bothEyesRequired: true
  },

  lighting: {
    minBrightness: 50,   // 0-255 scale
    maxBrightness: 230
  },

  blinkDetection: {
    smoothingWindow: 3,       // Frames to average (very responsive)
    percentageThreshold: 0.20, // 20% drop from baseline = blink
    debounceFrames: 2,         // Consecutive frames required (catches very quick blinks)
    minBlinkDuration: 33       // Minimum ms (2 frames @ 60fps = 33ms)
  },

  positionMonitoring: {
    gracePeriod: 2000,   // 2 second grace period at game start
    checkInterval: 200    // Check every 200ms (less frequent)
  },

  video: {
    width: { ideal: 1280 },
    height: { ideal: 720 },
    facingMode: 'user'
  }
};

export const CALIBRATION_STATUS = {
  NOT_STARTED: 'not_started',
  IN_PROGRESS: 'in_progress',
  PASSED: 'passed',
  FAILED: 'failed'
};

export const CALIBRATION_CHECKS = {
  FACE_DETECTED: 'face_detected',
  FACE_CENTERED: 'face_centered',
  FACE_SIZE: 'face_size',
  EYES_VISIBLE: 'eyes_visible',
  LIGHTING: 'lighting'
};
