<script>
  import { authState } from '../../stores/authState.js';

  export let playerName = '';
  export let onClick = () => {};
  export let size = 'large'; // 'large' or 'compact'

  function handleClick() {
    if (playerName.trim() || $authState.isAuthenticated) {
      onClick();
    }
  }
</script>

<button
  class="start-button"
  class:size={size}
  disabled={!playerName.trim() && !$authState.isAuthenticated}
  on:click={handleClick}
>
  Start
</button>

<style>
  .start-button {
    padding: 1rem 2rem;
    font-size: 1.1rem;
    font-weight: 700;
    background: linear-gradient(135deg, #00ff88 0%, #00ccff 100%);
    border: none;
    border-radius: 12px;
    color: #0a0a0a;
    cursor: pointer;
    transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
    box-shadow: 0 4px 15px rgba(0, 255, 136, 0.3);
    position: relative;
    overflow: hidden;
  }

  .start-button::before {
    content: '';
    position: absolute;
    top: 0;
    left: -100%;
    width: 100%;
    height: 100%;
    background: linear-gradient(90deg, transparent, rgba(255,255,255,0.2), transparent);
    transition: left 0.5s;
  }

  .start-button:hover:not(:disabled)::before {
    left: 100%;
  }

  .start-button:hover:not(:disabled) {
    transform: translateY(-2px) scale(1.02);
    box-shadow: 0 6px 25px rgba(0, 255, 136, 0.5);
  }

  .start-button:active:not(:disabled) {
    transform: translateY(0) scale(0.98);
  }

  .start-button:disabled {
    opacity: 0.3;
    cursor: not-allowed;
    box-shadow: none;
  }

  .start-button:disabled::before {
    display: none;
  }

  /* Compact variant for navbar */
  .start-button.size-compact {
    padding: 0.6rem 1.2rem;
    font-size: 0.9rem;
  }

  .start-button.size-compact:hover:not(:disabled) {
    transform: translateY(-1px);
  }
</style>
