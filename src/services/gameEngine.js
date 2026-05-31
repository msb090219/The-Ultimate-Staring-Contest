import { get } from 'svelte/store';
import { gameState } from '../stores/gameState.js';
import { faceState } from '../stores/faceState.js';
import { settings } from '../stores/settings.js';
import { mediaPipeService } from './mediapipe.js';
import { cameraService } from './camera.js';
import { CALIBRATION } from '../lib/constants/calibration.js';
import { getRank } from '../lib/utils/rank.js';
import { frameController } from '../lib/utils/performance.js';

export class GameEngine {
  constructor() {
    this.animationFrameId = null;
    this.isRunning = false;
    this.lastPositionCheck = 0;
    this.calibrationSamples = [];
    this.consecutiveBlinkFrames = 0;
    this.requiredBlinkFrames = 1;  // Instant blink detection (was 2)
    this.gameStartTime = 0;  // Track when game actually starts
    this.frameCount = 0;  // Initialize debug counter here

    // Face size tracking for movement compensation
    this.initialFaceSize = null;
    this.currentFaceSize = null;

    // Smoothing buffers for noise reduction
    this.smoothingWindow = 3;  // Reduced for more responsiveness (was 5)
    this.leftEARBuffer = [];
    this.rightEARBuffer = [];

    // Previous EAR values for rate of change detection
    this.prevLeft = null;
    this.prevRight = null;

    // Adaptive baseline system
    this.adaptiveBaseline = null;
    this.learningComplete = false;
  }

  getSmoothedEAR(rawLeft, rawRight) {
    // Add to buffer
    this.leftEARBuffer.push(rawLeft);
    this.rightEARBuffer.push(rawRight);

    // Keep buffer at fixed size
    if (this.leftEARBuffer.length > this.smoothingWindow) {
      this.leftEARBuffer.shift();
      this.rightEARBuffer.shift();
    }

    // IMPORTANT: Use raw values until buffer is full (avoids warmup delay)
    if (this.leftEARBuffer.length < this.smoothingWindow) {
      return { left: rawLeft, right: rawRight };
    }

    // Return average (only when buffer is full)
    const avgLeft = this.leftEARBuffer.reduce((a, b) => a + b, 0) / this.leftEARBuffer.length;
    const avgRight = this.rightEARBuffer.reduce((a, b) => a + b, 0) / this.rightEARBuffer.length;

    return { left: avgLeft, right: avgRight };
  }

  async startCountdown(callback) {
    if (this.isRunning) return;

    // Start countdown with calibration
    await this.performCalibrationDuringCountdown(callback);
  }

  async performCalibrationDuringCountdown(callback) {
    // Collect baseline samples during countdown
    this.calibrationSamples = [];

    // Reset smoothing buffers for clean calibration
    this.leftEARBuffer = [];
    this.rightEARBuffer = [];

    const countdownDuration = get(settings).countdownDuration;
    const startTime = Date.now();

    const collectBaseline = () => {
      // Get fresh video element reference each frame
      const videoElement = cameraService.getVideoElement();
      if (!videoElement) {
        gameState.setError('Camera not available');
        return;
      }

      const elapsed = Date.now() - startTime;

      if (elapsed >= countdownDuration) {
        // Calculate baseline threshold
        if (this.calibrationSamples.length > 0) {
          const avgLeft = this.calibrationSamples.reduce((sum, s) => sum + s.left, 0) / this.calibrationSamples.length;
          const avgRight = this.calibrationSamples.reduce((sum, s) => sum + s.right, 0) / this.calibrationSamples.length;

          faceState.setCalibrationBaseline({
            left: avgLeft,
            right: avgRight
          });
        }

        callback();
        return;
      }

      // Collect sample
      const results = mediaPipeService.detectFrame(videoElement, performance.now());
      if (results) {
        const { left, right, detected } = mediaPipeService.getBlinkValues(results);
        if (detected) {
          this.calibrationSamples.push({ left, right });
        }
      }

      // Continue countdown
      this.animationFrameId = requestAnimationFrame(collectBaseline);
    };

    collectBaseline();
  }

  startGame() {
    if (this.isRunning) return;

    console.log('[GameEngine] Starting game...');
    this.isRunning = true;
    this.gameStartTime = Date.now();  // Track game start for grace period
    this.consecutiveBlinkFrames = 0;  // Reset blink counter
    this.frameCount = 0;  // Reset debug counter

    // Reset smoothing buffers for clean slate
    this.leftEARBuffer = [];
    this.rightEARBuffer = [];

    // Reset adaptive baseline and previous EAR values
    this.adaptiveBaseline = null;
    this.prevLeft = null;
    this.prevRight = null;
    this.learningComplete = false;

    // Reset face size tracking
    this.initialFaceSize = null;
    this.currentFaceSize = null;

    gameState.startGame();
    this.startGameLoop();
  }

  startGameLoop() {
    const loop = (timestamp) => {
      if (!this.isRunning || get(gameState).phase !== 'playing') {
        this.stop();
        return;
      }

      // Get fresh video element reference each frame
      const videoElement = cameraService.getVideoElement();
      if (!videoElement) {
        gameState.setError('Camera not available');
        this.stop();
        return;
      }

      // Frame rate limiting
      if (!frameController.shouldProcess(timestamp)) {
        this.animationFrameId = requestAnimationFrame(loop);
        return;
      }

      this.processFrame(videoElement, timestamp);
      this.animationFrameId = requestAnimationFrame(loop);
    };

    this.animationFrameId = requestAnimationFrame(loop);
  }

  processFrame(videoElement, timestamp) {
    const results = mediaPipeService.detectFrame(videoElement, timestamp);

    // Face Mesh uses callback pattern, so results might be null on first frame
    // Only check for face landmarks after we've been running for a bit
    const timeSinceGameStart = Date.now() - this.gameStartTime;
    const hasGracePeriodPassed = timeSinceGameStart > CALIBRATION.positionMonitoring.gracePeriod;

    // Handle null results - wait during grace period
    if (!results) {
      // Return early during grace period - don't end game yet
      if (!hasGracePeriodPassed || timeSinceGameStart < 3000) {
        return;
      }
      // After grace period + 3 seconds, no results is a problem
      console.log('[GameEngine] Game over: no results after grace period');
      this.handleGameOver('position_lost', true);
      return;
    }

    // Check for face landmarks
    if (!results.multiFaceLandmarks || results.multiFaceLandmarks.length === 0) {
      faceState.updateDetection(false, 0);
      // Only end game if grace period has passed AND we've had time to get results
      if (hasGracePeriodPassed && timeSinceGameStart > 3000) {
        console.log('[GameEngine] Game over: position lost after grace period');
        this.handleGameOver('position_lost', true);
        return;
      }
      // During grace period (or first 3 seconds), skip this frame and continue
      return;
    }

    // Get bounding box and check position
    const boundingBox = mediaPipeService.getFaceBoundingBox(
      results,
      videoElement.videoWidth || 640,
      videoElement.videoHeight || 480
    );

    if (boundingBox) {
      faceState.updateBoundingBox(boundingBox);
    }

    // Store landmarks for visual overlay
    if (results.multiFaceLandmarks && results.multiFaceLandmarks.length > 0) {
      faceState.updateLandmarks(results.multiFaceLandmarks[0]);
    }

    // Check position monitoring (only periodically to save performance)
    const now = Date.now();
    if (now - this.lastPositionCheck > CALIBRATION.positionMonitoring.checkInterval) {
      // Skip position check during grace period
      const inGracePeriod = timeSinceGameStart < CALIBRATION.positionMonitoring.gracePeriod;

      if (!inGracePeriod && !this.checkPositionValid(results, videoElement)) {
        console.log('[GameEngine] Position check failed! Face lost completely.');
        this.handleGameOver('position_lost', true);
        return;
      }
      this.lastPositionCheck = now;
    }

    // Get blink values (now returns raw EAR values)
    const { left, right, detected } = mediaPipeService.getBlinkValues(results);

    // Use existing boundingBox to track distance changes
    const faceSize = boundingBox ? boundingBox.height : null;

    // During grace period, skip frames where eyes aren't detected yet
    const inGracePeriod = timeSinceGameStart < CALIBRATION.positionMonitoring.gracePeriod;

    if (!detected) {
      faceState.updateDetection(false, 0);
      // Only end game if grace period has passed AND we've had more time
      if (!inGracePeriod && timeSinceGameStart > 3000) {
        console.log('[GameEngine] Game over: eyes not detected after grace period');
        this.handleGameOver('position_lost', true);
        return;
      }
      // During grace period (or first 3 seconds), skip this frame and continue
      return;
    }

    faceState.updateDetection(true, 0.9);
    faceState.updateBlinkValues(left, right);
    faceState.incrementFrameCount();

    // ============================================
    // IMPROVED BLINE DETECTION - MULTI-FACTOR APPROACH
    // Based on blendshapes research: adaptive + multi-factor
    // ============================================

    // Stage 1: Noise reduction with moving average smoothing
    const { left: smoothedLeft, right: smoothedRight } = this.getSmoothedEAR(left, right);

    // Get baseline from calibration (raw EAR values)
    // Higher EAR = more open, Lower EAR = more closed
    const baseline = get(faceState).calibrationBaseline;
    if (!baseline) {
      // No baseline yet (shouldn't happen after calibration)
      return;
    }

    // Track face size to detect movement (prevent false positives from moving closer/further)
    if (faceSize && !this.initialFaceSize) {
      this.initialFaceSize = faceSize;
    }
    if (faceSize && this.initialFaceSize) {
      this.currentFaceSize = faceSize;
    }

    // Calculate face size ratio compared to initial
    const faceSizeRatio = this.initialFaceSize ? (this.currentFaceSize / this.initialFaceSize) : 1;

    // Stage 2: ADAPTIVE BASELINE - learns your actual resting eye state
    // Instead of relying on calibration (when you're staring intensely),
    // we learn what your NORMAL eyes look like during gameplay
    const LEARNING_PERIOD = 5000; // Learn for first 5 seconds
    const isInLearningPeriod = timeSinceGameStart < LEARNING_PERIOD;

    if (!this.adaptiveBaseline) {
      this.adaptiveBaseline = { left: baseline.left, right: baseline.right };
    }

    if (isInLearningPeriod && faceSizeRatio > 0.85 && faceSizeRatio < 1.15) {
      // Update adaptive baseline (2% per frame = settles in ~2-3 seconds)
      const ADAPTATION_RATE = 0.02;
      this.adaptiveBaseline.left += (smoothedLeft - this.adaptiveBaseline.left) * ADAPTATION_RATE;
      this.adaptiveBaseline.right += (smoothedRight - this.adaptiveBaseline.right) * ADAPTATION_RATE;
    }

    // Use adaptive baseline after learning period starts
    const effectiveBaseline = isInLearningPeriod ? this.adaptiveBaseline : baseline;

    // Adjust for face size changes (movement compensation)
    const adjustedBaselineLeft = effectiveBaseline.left * faceSizeRatio;
    const adjustedBaselineRight = effectiveBaseline.right * faceSizeRatio;

    // Stage 3: Calculate percentage drop from baseline
    const leftChange = (adjustedBaselineLeft - smoothedLeft) / adjustedBaselineLeft;
    const rightChange = (adjustedBaselineRight - smoothedRight) / adjustedBaselineRight;

    // Stage 4: BALANCED blink detection - catches real blinks, not just smaller eyes
    // Factor 1: Eyes must be actually closed (not just smaller)
    // Factor 2: Significant drop from baseline
    // Factor 3: Sudden change (blinks are quick)
    const MIN_BLINK_EAR = 0.32; // Eyes must be closed to this level (natural blink level)
    const BLINK_THRESHOLD = 0.20; // 20% drop from baseline

    // Calculate rate of change (sudden drops indicate blinks, not gradual squinting)
    const leftRate = Math.abs(smoothedLeft - (this.prevLeft || smoothedLeft));
    const rightRate = Math.abs(smoothedRight - (this.prevRight || smoothedRight));
    const isSuddenDrop = (leftRate > 0.025 || rightRate > 0.025); // Must be QUICK change

    this.prevLeft = smoothedLeft;
    this.prevRight = smoothedRight;

    const isActuallyClosed = smoothedLeft < MIN_BLINK_EAR || smoothedRight < MIN_BLINK_EAR;

    // Combined detection: ALL three factors must be true
    // This catches real blinks but ignores gradual eye size changes
    const isBlinking = isActuallyClosed && (leftChange > BLINK_THRESHOLD || rightChange > BLINK_THRESHOLD) && isSuddenDrop;

    // Calculate blink warning level (0-1 scale)
    // Based on how close we are to triggering each factor
    const earFactor = 1 - Math.min(smoothedLeft, smoothedRight) / MIN_BLINK_EAR; // 0 when eyes open, 1 when at MIN_BLINK_EAR
    const changeFactor = Math.max(leftChange, rightChange) / BLINK_THRESHOLD; // 0 when no change, 1 when at threshold
    const rateFactor = Math.max(leftRate, rightRate) / 0.025; // 0 when no rate, 1 when at sudden drop threshold

    // Overall warning level (weighted average, favor change and rate factors)
    const warningLevel = Math.max(earFactor * 0.3, changeFactor * 0.4, rateFactor * 0.3);

    // Update warning state
    let warningMessage = '';
    if (warningLevel > 0.7) {
      warningMessage = '⚠️ Don\'t blink!';
    } else if (warningLevel > 0.5) {
      warningMessage = 'Eyes closing...';
    } else if (warningLevel > 0.3) {
      warningMessage = 'Stay focused';
    }

    faceState.updateBlinkWarning(warningLevel, warningMessage);

    // Additional safety: If face moved significantly (>30%), skip detection for this frame
    if (faceSize && Math.abs(faceSizeRatio - 1) > 0.3) {
      // Face is moving too much, skip this frame
      return;
    }

    // Debug logging every 30 frames
    if (!this.frameCount) this.frameCount = 0;
    this.frameCount++;
    if (this.frameCount % 30 === 0) {
      console.log('[GameEngine] Simple Detection:', {
        smoothed: { left: smoothedLeft.toFixed(3), right: smoothedRight.toFixed(3) },
        baseline: { left: baseline.left.toFixed(3), right: baseline.right.toFixed(3) },
        drop: { left: (leftChange * 100).toFixed(1) + '%', right: (rightChange * 100).toFixed(1) + '%' },
        threshold: (BLINK_THRESHOLD * 100).toFixed(0) + '%',
        result: isBlinking ? '🚨 BLINK' : '✓ OK'
      });
    }

    // Debounce logic: Require consecutive frames to confirm blink
    if (isBlinking) {
      this.consecutiveBlinkFrames++;
      if (this.consecutiveBlinkFrames >= this.requiredBlinkFrames) {
        console.log('[GameEngine] BLINK DETECTED! Game over!');
        this.handleGameOver('blink', false);
        return;
      }
    } else {
      this.consecutiveBlinkFrames = 0;
    }

    // Update timer
    const elapsed = (Date.now() - get(gameState).startTime) / 1000;
    gameState.updateTimer(elapsed);
  }

  checkPositionValid(results, videoElement) {
    const videoWidth = videoElement.videoWidth || 640;
    const videoHeight = videoElement.videoHeight || 480;
    const boundingBox = mediaPipeService.getFaceBoundingBox(results, videoWidth, videoHeight);

    if (!boundingBox) {
      console.log('[GameEngine] Position check: No face detected at all');
      return false;
    }

    // Check face size (WARNING only, not instant forfeit)
    const sizeRatio = boundingBox.height / videoHeight;
    if (sizeRatio < CALIBRATION.faceDetection.minSizeRatio) {
      console.log(`[GameEngine] ⚠️ Warning: Getting far! Face is ${(sizeRatio * 100).toFixed(1)}% of screen (need ${CALIBRATION.faceDetection.minSizeRatio * 100}%+)`);
      // Return true (don't forfeit yet) - only forfeit if face is lost
      return true;
    }

    // Check face centered (WARNING only, not instant forfeit)
    const marginX = videoWidth * CALIBRATION.faceDetection.centerMargin;
    const marginY = videoHeight * CALIBRATION.faceDetection.centerMargin;

    if (boundingBox.centerX < marginX ||
        boundingBox.centerX > videoWidth - marginX ||
        boundingBox.centerY < marginY ||
        boundingBox.centerY > videoHeight - marginY) {
      console.log('[GameEngine] ⚠️ Warning: Not centered - move back to center');
      // Return true (don't forfeit yet) - only forfeit if face is lost
      return true;
    }

    return true;
  }

  handleGameOver(reason, isDisqualified) {
    const finalTime = get(gameState).currentTime;
    gameState.endGame(finalTime, reason, isDisqualified);
    this.stop();
  }

  stop() {
    this.isRunning = false;
    if (this.animationFrameId) {
      cancelAnimationFrame(this.animationFrameId);
      this.animationFrameId = null;
    }
    // Don't cleanup MediaPipe - it should stay active for replay/results
  }

  reset() {
    this.stop();
    this.calibrationSamples = [];
    faceState.reset();
    // Only cleanup MediaPipe when explicitly resetting the entire session
    mediaPipeService.cleanup();
  }

  cleanup() {
    this.stop();
    this.calibrationSamples = [];
    mediaPipeService.cleanup();
  }
}

export const gameEngine = new GameEngine();
