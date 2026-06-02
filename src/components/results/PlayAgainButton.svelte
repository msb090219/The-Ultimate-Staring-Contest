<script>
  export let onClick = () => {};
</script>

<button
  class="play-again-button"
  on:click={onClick}
>
  Play Again
</button>

<style>
  .play-again-button {
    padding: 1rem 2rem;
    font-size: 1rem;
    font-weight: 600;
    background: #00ff88;
    border: none;
    border-radius: 12px;
    color: #0a0a0a;
    cursor: pointer;
    transition: all 0.2s ease;
    box-shadow: 0 4px 15px rgba(0, 255, 136, 0.3);
    text-align: center;
  }

  .play-again-button:hover {
    transform: translateY(-1px);
    box-shadow: 0 5px 18px rgba(0, 255, 136, 0.4);
  }

  .play-again-button:active {
    transform: translateY(0);
  }
</style>
