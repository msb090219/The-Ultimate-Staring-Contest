<script>
  import { onMount, onDestroy } from 'svelte';
  import { faceState } from '../../stores/faceState.js';
  import { mediaPipeService } from '../../services/mediapipe.js';
  import { cameraService } from '../../services/camera.js';
  import { MESSAGES } from '../../lib/constants/messages.js';
  import { CALIBRATION } from '../../lib/constants/calibration.js';

  export let ready = () => {};

  let videoElement;
  let canvasElement;
  let ctx;
  let isInitialized = false;
  let animationFrameId = null;
  let calibrationStatus = {
    allPassed: false,
    checks: {}
  };
  let currentMessage = '';

  onMount(async () => {
    ctx = canvasElement.getContext('2d');

    // Initialize camera
    const result = await cameraService.initialize(videoElement);
    if (!result.success) {
      currentMessage = result.error;
      return;
    }

    // Initialize MediaPipe
    const mpResult = await mediaPipeService.initialize();
    if (!mpResult.success) {
      currentMessage = mpResult.error;
      return;
    }

    isInitialized = true;
    startCalibrationLoop();
  });

  onDestroy(() => {
    isInitialized = false;
    if (animationFrameId) {
      cancelAnimationFrame(animationFrameId);
    }
    // Don't stop camera or MediaPipe - they need to continue running for countdown and gameplay
  });

  function startCalibrationLoop() {
    const loop = async (timestamp) => {
      if (!isInitialized) {
        animationFrameId = requestAnimationFrame(loop);
        return;
      }

      // Check calibration criteria (Face Mesh uses callback pattern)
      const results = mediaPipeService.detectFrame(videoElement, timestamp);

      if (results) {
        calibrationStatus = mediaPipeService.checkCalibrationCriteria(
          results,
          videoElement
        );

        // Update message based on failing checks
        const failingChecks = Object.entries(calibrationStatus.checks)
          .filter(([_, check]) => !check.passed)
          .map(([_, check]) => check.message);

        currentMessage = failingChecks.length > 0
          ? failingChecks[0]
          : calibrationStatus.allPassed
          ? MESSAGES.calibration.ready
          : '';

        // Update face state
        faceState.updateBoundingBox(calibrationStatus.boundingBox);
        faceState.updateDetection(
          calibrationStatus.checks.face_detected?.passed || false,
          calibrationStatus.checks.face_detected?.passed ? 0.9 : 0
        );

        // Store landmarks for visual overlay
        if (results.multiFaceLandmarks && results.multiFaceLandmarks.length > 0) {
          faceState.updateLandmarks(results.multiFaceLandmarks[0]);
        }

        // Draw overlay
        drawOverlay(calibrationStatus, results);
      }

      animationFrameId = requestAnimationFrame(loop);
    };

    animationFrameId = requestAnimationFrame(loop);
  }

  function drawOverlay(status, results) {
    if (!ctx || !videoElement) return;

    const canvas = canvasElement;
    const video = videoElement;

    // Set canvas size to match video
    canvas.width = video.videoWidth || 640;
    canvas.height = video.videoHeight || 480;

    // Clear canvas
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    const { boundingBox, allPassed } = status;
    const color = allPassed ? 'rgba(0, 255, 136, 0.5)' : 'rgba(255, 68, 68, 0.5)';

    // Draw face tracking visuals if landmarks available
    if (results?.multiFaceLandmarks?.[0]) {
      const landmarks = results.multiFaceLandmarks[0];
      const w = canvas.width;
      const h = canvas.height;

      // Draw face oval
      ctx.strokeStyle = color;
      ctx.lineWidth = 2;
      ctx.beginPath();

      // Full face oval including jawline - starts from chin, goes around face
      const faceOval = [
        // Right side of face
        234, 93, 132, 58, 172, 136, 150, 149, 176, 148, 152, 377, 400, 378, 379, 365, 397, 288,
        361, 323, 454, 356, 389, 251, 284, 332, 297, 338, 10,
        // Left side of face (includes jawline back to chin)
        109, 67, 103, 54, 21, 162, 127, 234
      ];

      faceOval.forEach((idx, i) => {
        const lm = landmarks[idx];
        const x = lm.x * w;
        const y = lm.y * h;
        if (i === 0) ctx.moveTo(x, y);
        else ctx.lineTo(x, y);
      });

      ctx.closePath();
      ctx.stroke();
    }

    // Fallback to bounding box if no landmarks
    if (!status.boundingBox) return;

    // Draw center indicator
    const centerX = boundingBox.centerX;
    const centerY = boundingBox.centerY;

    ctx.fillStyle = allPassed ? '#00ff88' : '#ff4444';
    ctx.beginPath();
    ctx.arc(centerX, centerY, 5, 0, Math.PI * 2);
    ctx.fill();
  }
</script>

<div class="calibration-view">
  <div class="video-container">
    <video
      bind:this={videoElement}
      autoplay
      playsinline
      muted
    ></video>
    <canvas bind:this={canvasElement}></canvas>
  </div>

  <div class="calibration-info">
    {#if !isInitialized}
      <div class="loading-state">
        <div class="eye-loader">
          <div class="eye outer">
            <div class="eye inner">
              <div class="pupil"></div>
            </div>
          </div>
        </div>
        <p class="loading-text">Initializing camera...</p>
      </div>
    {:else}
      <p class="message {calibrationStatus.allPassed ? 'success' : 'warning'}">
        {currentMessage}
      </p>

      {#if calibrationStatus.allPassed}
        <button on:click={ready}>
          Start Game
        </button>
      {/if}
    {/if}
  </div>
</div>

<style>
  .calibration-view {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 1.5rem;
  }

  .video-container {
    position: relative;
    width: 640px;
    height: 480px;
    border-radius: 12px;
    overflow: hidden;
    background: #1a1a1a;
  }

  video {
    width: 100%;
    height: 100%;
    object-fit: cover;
    transform: scaleX(-1); /* Mirror */
  }

  canvas {
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    pointer-events: none;
    transform: scaleX(-1); /* Mirror to match video */
  }

  .calibration-info {
    text-align: center;
  }

  .message {
    font-size: 1.1rem;
    margin-bottom: 1rem;
    min-height: 1.5em;
  }

  .message.warning {
    color: #ffaa00;
  }

  .message.success {
    color: #00ff88;
  }

  button {
    padding: 1rem 2rem;
    font-size: 1.1rem;
    font-weight: 600;
    background: #00ff88;
    color: #0a0a0a;
    border: none;
    border-radius: 12px;
    cursor: pointer;
    transition: all 0.2s ease;
    box-shadow: 0 4px 15px rgba(0, 255, 136, 0.3);
  }

  button:hover {
    transform: translateY(-1px);
    box-shadow: 0 5px 18px rgba(0, 255, 136, 0.4);
  }

  button:active {
    transform: translateY(0);
  }

  .loading-state {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 1.5rem;
    padding: 2rem;
  }

  .eye-loader {
    position: relative;
    width: 80px;
    height: 80px;
  }

  .eye {
    position: absolute;
    border-radius: 50%;
    animation: blink 3s ease-in-out infinite;
  }

  .eye.outer {
    width: 80px;
    height: 80px;
    border: 3px solid #00ff88;
    box-shadow: 0 0 20px rgba(0, 255, 136, 0.3), inset 0 0 20px rgba(0, 255, 136, 0.1);
  }

  .eye.inner {
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%);
    width: 50px;
    height: 50px;
    border: 2px solid #00ccff;
    box-shadow: 0 0 15px rgba(0, 204, 255, 0.3), inset 0 0 15px rgba(0, 204, 255, 0.1);
  }

  .pupil {
    position: absolute;
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%);
    width: 20px;
    height: 20px;
    background: linear-gradient(135deg, #00ff88 0%, #00ccff 100%);
    border-radius: 50%;
    box-shadow: 0 0 25px rgba(0, 255, 136, 0.5);
    animation: pulse 1.5s ease-in-out infinite;
  }

  @keyframes blink {
    0%, 90%, 100% {
      transform: scaleY(1);
    }
    95% {
      transform: scaleY(0.1);
    }
  }

  @keyframes pulse {
    0%, 100% {
      transform: translate(-50%, -50%) scale(1);
      opacity: 1;
    }
    50% {
      transform: translate(-50%, -50%) scale(1.2);
      opacity: 0.8;
    }
  }

  .loading-text {
    color: #00ccff;
    font-size: 1rem;
    animation: fadePulse 2s ease-in-out infinite;
  }

  @keyframes fadePulse {
    0%, 100% {
      opacity: 0.5;
    }
    50% {
      opacity: 1;
    }
  }
</style>
