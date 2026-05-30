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
    transition: all 0.2s ease;
    box-shadow: 0 4px 15px rgba(0, 255, 136, 0.3);
    text-align: center;
    min-width: 100px;
  }

  .start-button:hover:not(:disabled) {
    transform: translateY(-1px);
    box-shadow: 0 5px 18px rgba(0, 255, 136, 0.4);
  }

  .start-button:active:not(:disabled) {
    transform: translateY(0);
  }

  .start-button:disabled {
    opacity: 0.3;
    cursor: not-allowed;
    box-shadow: none;
  }

  /* Compact variant for navbar */
  .start-button.size-compact {
    padding: 0.6rem 1.2rem;
    font-size: 0.9rem;
  }
</style>
