<script>
  import { faceState } from '../../stores/faceState.js';
  import { scale } from 'svelte/transition';
  import { quintInOut } from 'svelte/easing';

  $: isVisible = $faceState.blinkWarningLevel > 0.3;
  $: intensity = $faceState.blinkWarningLevel;
  $: message = $faceState.blinkWarningMessage;
</script>

{#if isVisible}
  <div
    class="blink-warning"
    style="--intensity: {intensity};"
    transition:scale={{ duration: 200, easing: quintInOut, start: 0.9 }}
  >
    <div class="warning-icon">
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
        <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/>
        <circle cx="12" cy="12" r="3"/>
      </svg>
    </div>
    <span class="warning-text">{message}</span>
  </div>
{/if}

<style>
  .blink-warning {
    position: fixed;
    top: 20px;
    left: 50%;
    transform: translateX(-50%);
    display: flex;
    align-items: center;
    gap: 0.75rem;
    padding: 0.75rem 1.5rem;
    background: rgba(0, 0, 0, 0.9);
    border: 2px solid rgba(255, 68, 68, calc(0.3 + var(--intensity) * 0.5));
    border-radius: 50px;
    z-index: 100;
    box-shadow: 0 4px 20px rgba(255, 68, 68, calc(0.2 + var(--intensity) * 0.3));
    animation: warningPulse calc(1s - var(--intensity) * 0.5s) ease-in-out infinite;
  }

  .warning-icon {
    color: #ff4444;
    animation: eyeShake 0.5s ease-in-out infinite;
  }

  .warning-text {
    font-weight: 600;
    font-size: 0.9rem;
    color: #ffffff;
    min-width: 120px;
    text-align: center;
  }

  @keyframes warningPulse {
    0%, 100% {
      opacity: 0.8;
      transform: translateX(-50%) scale(1);
    }
    50% {
      opacity: 1;
      transform: translateX(-50%) scale(1.05);
    }
  }

  @keyframes eyeShake {
    0%, 100% {
      transform: translateX(0);
    }
    25% {
      transform: translateX(-1px);
    }
    75% {
      transform: translateX(1px);
    }
  }
</style>
