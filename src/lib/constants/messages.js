export const MESSAGES = {
  camera: {
    denied: "Please allow camera access to play",
    notFound: "No camera found on this device",
    inUse: "Camera is being used by another application",
    failed: "Camera access failed. Please try again"
  },

  calibration: {
    moveCloser: "Move closer to the camera",
    centerFace: "Center your face in the frame",
    improveLighting: "Improve lighting for better detection",
    removeGlasses: "Try removing glasses for better detection",
    openEyes: "Please open your eyes normally for calibration",
    multipleFaces: "Only one person at a time, please",
    ready: "Perfect! You're ready to stare."
  },

  game: {
    disqualifiedPosition: "Position lost. Round forfeited.",
    disqualifiedFace: "Face tracking lost. Round forfeited.",
    disqualifiedCheating: "No hands allowed! Round forfeited.",
    blinked: "You blinked",
    positionLost: "You moved out of frame",
    cheating: "Hands detected! Only your face allowed."
  },

  auth: {
    oauthFailed: "Sign in failed. Please try again",
    sessionExpired: "Please sign in again",
    networkError: "Connection failed. Check your internet",
    signingIn: "Signing in...",
    signInWith: "Sign in with"
  },

  leaderboard: {
    title: "Top Stare-ers",
    loading: "Loading leaderboard...",
    error: "Failed to load leaderboard",
    anonymous: "Anonymous",
    you: "You"
  },

  share: {
    template: (time) => `I lasted ${time.toFixed(2)}s in The Ultimate Staring Competition - can you beat me?\nPlay now:`,
    copySuccess: "Copied to clipboard!",
    copyFailed: "Failed to copy"
  }
};
