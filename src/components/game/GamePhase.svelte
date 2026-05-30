<script>
  import { onDestroy } from 'svelte';
  import { gameEngine } from '../../services/gameEngine.js';
  import { gameState } from '../../stores/gameState.js';
  import WebcamFeed from './WebcamFeed.svelte';
  import TimerDisplay from './TimerDisplay.svelte';
  import PositionIndicator from './PositionIndicator.svelte';
  import BlinkWarning from './BlinkWarning.svelte';

  // Calculate intensity based on time (0-1 scale)
  $: intensity = Math.min($gameState.currentTime / 30, 1);

  onDestroy(() => {
    // Stop the game loop, but don't cleanup MediaPipe or camera
    // They should stay active for potential replay or results view
    gameEngine.stop();
  });
</script>

<div class="game-phase" style="--intensity: {intensity};">
  <div class="tension-overlay"></div>
  <BlinkWarning />
  <div class="game-wrapper">
    <WebcamFeed />
    <div class="timer-container">
      <TimerDisplay />
    </div>
  </div>

  <PositionIndicator />
</div>

<style>
  .game-phase {
    width: 100%;
    height: 100vh;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    gap: 2rem;
    position: relative;
    overflow: hidden;
  }

  .tension-overlay {
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    background: radial-gradient(
      circle at center,
      transparent 0%,
      rgba(0, 255, 136, calc(var(--intensity) * 0.03)) 100%
    );
    animation: tensionPulse calc(3s - var(--intensity) * 1.5s) ease-in-out infinite;
    pointer-events: none;
    z-index: 0;
  }

  .game-wrapper {
    position: relative;
    z-index: 1;
  }

  .timer-container {
    position: absolute;
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%);
    z-index: 10;
    pointer-events: none;
  }

  @keyframes tensionPulse {
    0%, 100% {
      opacity: 0.3;
      transform: scale(1);
    }
    50% {
      opacity: 0.5 + var(--intensity) * 0.3;
      transform: scale(1 + var(--intensity) * 0.1);
    }
  }
</style>
