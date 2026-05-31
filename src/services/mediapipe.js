import { CALIBRATION } from '../lib/constants/calibration.js';

// Face Mesh is loaded via CDN as global object
// Access via window.FaceMesh

export class MediaPipeService {
  constructor() {
    this.faceMesh = null;
    this.isInitialized = false;
    this.isInitializing = false;
    this.lastResults = null;
    this.frameCount = 0;
  }

  async initialize() {
    if (this.isInitialized) {
      return { success: true };
    }

    if (this.isInitializing) {
      return new Promise((resolve) => {
        const checkInterval = setInterval(() => {
          if (this.isInitialized) {
            clearInterval(checkInterval);
            resolve({ success: true });
          } else if (!this.isInitializing) {
            clearInterval(checkInterval);
            resolve({ success: false, error: 'Initialization failed' });
          }
        }, 100);
      });
    }

    this.isInitializing = true;

    try {
      // Check if Face Mesh is loaded from CDN
      if (typeof window.FaceMesh === 'undefined') {
        throw new Error('Face Mesh not loaded. Please check your internet connection.');
      }

      // Initialize Face Mesh
      this.faceMesh = new window.FaceMesh({
        locateFile: (file) => {
          return `https://cdn.jsdelivr.net/npm/@mediapipe/face_mesh/${file}`;
        }
      });

      this.faceMesh.setOptions({
        maxNumFaces: 1,
        refineLandmarks: true,
        minDetectionConfidence: 0.5,
        minTrackingConfidence: 0.5
      });

      this.faceMesh.onResults((results) => {
        this.lastResults = results;
      });

      await this.faceMesh.initialize();

      this.isInitialized = true;
      this.isInitializing = false;
      console.log('[MediaPipe] Face Mesh initialized successfully');
      return { success: true };
    } catch (error) {
      console.error('[MediaPipe] Initialization failed:', error);
      this.isInitializing = false;
      return {
        success: false,
        error: 'Failed to initialize face detection. Please refresh.'
      };
    }
  }

  detectFrame(videoElement, timestamp) {
    if (!this.isInitialized || !this.faceMesh || !videoElement) {
      return null;
    }

    try {
      // Send frame to Face Mesh (asynchronous)
      // Results will be available via onResults callback
      // We return the cached results from previous frame
      this.faceMesh.send({ image: videoElement, timestamp });
      return this.lastResults;
    } catch (error) {
      console.error('[MediaPipe] Frame detection failed:', error);
      return null;
    }
  }

  calculateEAR(landmarks, indices) {
    // Get the eye landmark points
    const points = indices.map(i => landmarks[i]);

    // Vertical distances
    const v1 = Math.hypot(points[1].x - points[5].x, points[1].y - points[5].y);
    const v2 = Math.hypot(points[2].x - points[4].x, points[2].y - points[4].y);

    // Horizontal distance
    const h = Math.hypot(points[0].x - points[3].x, points[0].y - points[3].y);

    return (v1 + v2) / (2 * h);
  }

  // IMPROVED: Enhanced EAR using more eye landmarks for better accuracy
  // Based on blendshapes research - use comprehensive eye measurement
  calculateEnhancedEAR(landmarks) {
    // Left eye: [33, 160, 158, 133, 153, 145] (standard 6 points)
    const leftEyeIndices = [33, 160, 158, 133, 153, 145];
    const rightEyeIndices = [362, 385, 387, 263, 373, 380];

    const leftEAR = this.calculateEAR(landmarks, leftEyeIndices);
    const rightEAR = this.calculateEAR(landmarks, rightEyeIndices);

    return { left: leftEAR, right: rightEAR };
  }

  getBlinkValues(results) {
    if (!results?.multiFaceLandmarks || results.multiFaceLandmarks.length === 0) {
      return { left: 0, right: 0, detected: false };
    }

    const landmarks = results.multiFaceLandmarks[0];

    // Check landmark visibility for obstruction detection
    // MediaPipe provides visibility scores (0-1) for each landmark
    const visibilityScores = this.checkEyeLandmarkVisibility(landmarks);

    // Calculate enhanced EAR - return raw EAR values directly
    // Higher EAR = more open, Lower EAR = more closed
    const { left: leftEAR, right: rightEAR } = this.calculateEnhancedEAR(landmarks);

    // Debug logging (sample every 30 frames to avoid spam)
    this.frameCount++;
    if (this.frameCount % 30 === 0) {
      console.log('[MediaPipe] Raw EAR - Left:', leftEAR.toFixed(3), 'Right:', rightEAR.toFixed(3), 'Visibility:', visibilityScores);
    }

    return {
      left: leftEAR,
      right: rightEAR,
      detected: true,
      visibility: visibilityScores
    };
  }

  checkEyeLandmarkVisibility(landmarks) {
    // Check visibility of key eye landmarks
    // MediaPipe provides visibility (0-1) indicating if landmark is visible/occluded
    const leftEyeIndices = [33, 160, 158, 133, 153, 145];
    const rightEyeIndices = [362, 385, 387, 263, 373, 380];

    let leftVisibilitySum = 0;
    let rightVisibilitySum = 0;

    for (const index of leftEyeIndices) {
      const landmark = landmarks[index];
      leftVisibilitySum += (landmark.visibility || 0);
    }

    for (const index of rightEyeIndices) {
      const landmark = landmarks[index];
      rightVisibilitySum += (landmark.visibility || 0);
    }

    return {
      left: leftVisibilitySum / leftEyeIndices.length,
      right: rightVisibilitySum / rightEyeIndices.length
    };
  }

  getFaceBoundingBox(results, videoWidth, videoHeight) {
    if (!results?.multiFaceLandmarks || results.multiFaceLandmarks.length === 0) {
      return null;
    }

    const landmarks = results.multiFaceLandmarks[0];

    // Use ear landmarks for wider horizontal coverage (ear to ear)
    const leftEar = landmarks[234] || landmarks[132];
    const rightEar = landmarks[454] || landmarks[361];

    // Calculate vertical bounds from all landmarks
    let minY = Infinity, maxY = -Infinity;
    for (const landmark of landmarks) {
      minY = Math.min(minY, landmark.y);
      maxY = Math.max(maxY, landmark.y);
    }

    // Use ear positions for horizontal bounds
    const minX = Math.min(leftEar.x, rightEar.x);
    const maxX = Math.max(leftEar.x, rightEar.x);

    return {
      x: minX * videoWidth,
      y: minY * videoHeight,
      width: (maxX - minX) * videoWidth,
      height: (maxY - minY) * videoHeight,
      centerX: ((minX + maxX) / 2) * videoWidth,
      centerY: ((minY + maxY) / 2) * videoHeight
    };
  }

  checkCalibrationCriteria(results, videoElement) {
    if (!results || !results.multiFaceLandmarks || results.multiFaceLandmarks.length === 0) {
      return {
        allPassed: false,
        checks: {
          face_detected: { passed: false, message: 'No face detected' }
        }
      };
    }

    const videoWidth = videoElement.videoWidth || 640;
    const videoHeight = videoElement.videoHeight || 480;
    const boundingBox = this.getFaceBoundingBox(results, videoWidth, videoHeight);

    if (!boundingBox) {
      return {
        allPassed: false,
        checks: {
          face_detected: { passed: false, message: 'Cannot detect face features' }
        }
      };
    }

    const checks = {};

    checks.face_detected = {
      passed: true,
      message: 'Face detected'
    };

    // Check face size
    const sizeRatio = boundingBox.height / videoHeight;
    checks.face_size = {
      passed: sizeRatio >= CALIBRATION.faceDetection.minSizeRatio,
      message: sizeRatio < CALIBRATION.faceDetection.minSizeRatio
        ? 'Move closer until face fills 45% of screen height'
        : 'Perfect distance! Try to stay this close.'
    };

    // Check face centered
    const marginX = videoWidth * CALIBRATION.faceDetection.centerMargin;
    const marginY = videoHeight * CALIBRATION.faceDetection.centerMargin;
    const isCentered =
      boundingBox.centerX >= marginX &&
      boundingBox.centerX <= videoWidth - marginX &&
      boundingBox.centerY >= marginY &&
      boundingBox.centerY <= videoHeight - marginY;

    checks.face_centered = {
      passed: isCentered,
      message: !isCentered ? 'Center your face in the frame' : 'Well centered'
    };

    const { detected } = this.getBlinkValues(results);
    checks.eyes_visible = {
      passed: detected,
      message: !detected ? 'Eyes not visible' : 'Eyes visible'
    };

    const allPassed = Object.values(checks).every(check => check.passed);

    return {
      allPassed,
      checks,
      boundingBox
    };
  }

  cleanup() {
    if (this.faceMesh) {
      this.faceMesh.close();
      this.faceMesh = null;
    }
    this.isInitialized = false;
    this.isInitializing = false;
    this.lastResults = null;
  }
}

export const mediaPipeService = new MediaPipeService();
