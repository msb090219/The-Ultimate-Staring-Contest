<script>
  import { onMount, onDestroy } from 'svelte';
  import { cameraService } from '../../services/camera.js';
  import { faceState } from '../../stores/faceState.js';

  let videoElement;
  let canvasElement;
  let ctx;
  let unsubscribe;

  onMount(() => {
    // Camera is already initialized from calibration phase
    ctx = canvasElement?.getContext('2d');

    // Attach the existing camera stream to this video element
    if (videoElement && cameraService.stream) {
      videoElement.srcObject = cameraService.stream;

      // Wait for video to be ready before playing and updating camera service
      videoElement.onloadedmetadata = () => {
        console.log('[WebcamFeed] Video metadata loaded, dimensions:', videoElement.videoWidth, 'x', videoElement.videoHeight);
        videoElement.play().then(() => {
          console.log('[WebcamFeed] Video playing successfully');
          // Update camera service to use this video element ONLY after it's playing
          cameraService.updateVideoElement(videoElement);
        }).catch(err => console.error('[WebcamFeed] Video play failed:', err));
      };

      // Fallback: if metadata already loaded, play immediately
      if (videoElement.readyState >= 1) {
        videoElement.play().then(() => {
          console.log('[WebcamFeed] Video playing immediately (readyState:', videoElement.readyState, ')');
          cameraService.updateVideoElement(videoElement);
        }).catch(err => console.error('[WebcamFeed] Video play failed:', err));
      }
    } else {
      console.warn('[WebcamFeed] No video element or camera stream available');
    }

    // Subscribe to face state for bounding box and landmarks updates
    unsubscribe = faceState.subscribe((state) => {
      if (ctx) {
        drawFaceOverlay(state);
      }
    });
  });

  onDestroy(() => {
    if (unsubscribe) {
      unsubscribe();
    }
  });

  function drawFaceOverlay(state) {
    if (!ctx || !videoElement) return;

    const canvas = canvasElement;
    const video = videoElement;

    // Only set canvas size if it has changed (performance optimization)
    const targetWidth = video.videoWidth || 640;
    const targetHeight = video.videoHeight || 480;
    if (canvas.width !== targetWidth || canvas.height !== targetHeight) {
      canvas.width = targetWidth;
      canvas.height = targetHeight;
    }

    // Clear canvas
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    if (!state.isDetected || !state.landmarks) {
      return;
    }

    const landmarks = state.landmarks;
    const w = canvas.width;
    const h = canvas.height;

    // Draw face oval (using face mesh contour landmarks)
    ctx.strokeStyle = 'rgba(0, 255, 136, 0.5)';
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
      if (i === 0) {
        ctx.moveTo(x, y);
      } else {
        ctx.lineTo(x, y);
      }
    });

    ctx.closePath();
    ctx.stroke();
  }

  function drawBoundingBox(box, isDetected) {
    if (!ctx) return;

    // Draw subtle bounding box as fallback
    ctx.strokeStyle = isDetected ? 'rgba(0, 255, 136, 0.3)' : 'rgba(255, 68, 68, 0.3)';
    ctx.lineWidth = 2;
    ctx.strokeRect(
      box.x,
      box.y,
      box.width,
      box.height
    );
  }
</script>

<div class="webcam-feed">
  <div class="video-container">
    <video
      bind:this={videoElement}
      autoplay
      playsinline
      muted
    ></video>
    <canvas bind:this={canvasElement}></canvas>
  </div>
</div>

<style>
  .webcam-feed {
    position: relative;
  }

  .video-container {
    position: relative;
    width: 640px;
    height: 480px;
    border-radius: 12px;
    overflow: hidden;
    background: #1a1a1a;
    box-shadow: 0 8px 32px rgba(0, 255, 136, 0.2);
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
</style>
