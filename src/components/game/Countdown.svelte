<script>
  import { onMount, onDestroy } from 'svelte';
  import { gameState } from '../../stores/gameState.js';
  import { gameEngine } from '../../services/gameEngine.js';

  let count = 3;
  let isVisible = true;
  let intervalId = null;

  onMount(async () => {
    try {
      // Start countdown with calibration
      await gameEngine.startCountdown(() => {
        // Start game after countdown
        gameEngine.startGame();
      });

      // Countdown display
      intervalId = setInterval(() => {
        count--;
        if (count < 1) {
          clearInterval(intervalId);
          isVisible = false;
        }
      }, 1000);
    } catch (error) {
      console.error('Countdown error:', error);
      gameState.setError('Failed to start game');
      isVisible = false;
    }
  });

  onDestroy(() => {
    if (intervalId) {
      clearInterval(intervalId);
    }
  });
</script>

<div class="countdown-container">
  {#if isVisible}
    <div class="countdown-overlay">
      <div class="number">
        {count === 0 ? 'STARE' : count}
      </div>
    </div>
  {/if}
</div>

<style>
  .countdown-container {
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    display: flex;
    align-items: center;
    justify-content: center;
    z-index: 1000;
  }

  .countdown-overlay {
    display: flex;
    align-items: center;
    justify-content: center;
  }

  .number {
    font-size: 15rem;
    font-weight: 900;
    color: #00ff88;
    animation: pulse 0.5s ease-in-out;
  }

  @keyframes pulse {
    0% {
      transform: scale(0.5);
      opacity: 0;
    }
    50% {
      transform: scale(1.2);
      opacity: 1;
    }
    100% {
      transform: scale(1);
      opacity: 1;
    }
  }
</style>
