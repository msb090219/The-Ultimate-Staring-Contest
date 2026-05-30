<script>
  import { faceState } from '../../stores/faceState.js';
</script>

<div class="position-indicator">
  <div class="indicator {faceState.isDetected ? 'detected' : 'not-detected'}">
    <div class="dot"></div>
  </div>
  {#if !$faceState.isDetected}
    <p class="warning">Face not detected</p>
  {/if}
</div>

<style>
  .position-indicator {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 0.5rem;
  }

  .indicator {
    width: 24px;
    height: 24px;
    border-radius: 50%;
    border: 2px solid #444;
    display: flex;
    align-items: center;
    justify-content: center;
  }

  .indicator.detected {
    border-color: #00ff88;
    background: rgba(0, 255, 136, 0.2);
  }

  .indicator.not-detected {
    border-color: #ff4444;
    background: rgba(255, 68, 68, 0.2);
  }

  .dot {
    width: 8px;
    height: 8px;
    border-radius: 50%;
    background: #00ff88;
  }

  .indicator.not-detected .dot {
    background: #ff4444;
    animation: blink 0.5s ease-in-out infinite;
  }

  .warning {
    font-size: 0.9rem;
    color: #ff4444;
    margin: 0;
  }

  @keyframes blink {
    0%, 100% {
      opacity: 1;
    }
    50% {
      opacity: 0.3;
    }
  }
</style>
