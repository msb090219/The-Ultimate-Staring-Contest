<script>
  import { gameState } from '../../stores/gameState.js';
  import { settings } from '../../stores/settings.js';

  // Calculate intensity based on time (0-1 scale)
  $: intensity = Math.min($gameState.currentTime / 30, 1); // Max intensity at 30s

  // Calculate color shift based on intensity
  $: hue = 120 - (intensity * 60); // Shift from green (120) to yellow (60)
  $: saturation = 100 - (intensity * 20); // Reduce saturation slightly
  $: lightness = 50 + (intensity * 10); // Increase brightness
</script>

<div class="timer-display" style="--intensity: {intensity}; --hue: {hue}deg; --saturation: {saturation}%; --lightness: {lightness}%;">
  <span class="time">
    {$gameState.currentTime.toFixed($settings.timerPrecision)}
  </span>
  <span class="unit">s</span>
</div>

<style>
  .timer-display {
    font-size: 4rem;
    font-weight: 700;
    font-variant-numeric: tabular-nums;
    display: flex;
    align-items: baseline;
    gap: 0.25rem;
    opacity: 0.8;
    animation: heartbeat calc(1.5s - var(--intensity) * 0.5s) ease-in-out infinite;
  }

  .time {
    color: hsl(var(--hue), var(--saturation), var(--lightness));
    text-shadow: 0 0 calc(10px + var(--intensity) * 20px) hsla(var(--hue), var(--saturation), var(--lightness), 0.5);
    transition: color 0.3s ease, text-shadow 0.3s ease;
  }

  .unit {
    font-size: 2rem;
    color: #888;
    transition: color 0.3s ease;
  }

  @keyframes heartbeat {
    0%, 100% {
      transform: scale(1);
    }
    50% {
      transform: scale(1 + var(--intensity) * 0.05);
    }
  }
</style>
