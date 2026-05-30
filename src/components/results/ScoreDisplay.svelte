<script>
  export let time = 0;
</script>

<div class="score-display">
  <h1 class="time">{time.toFixed(2)}s</h1>
  <p class="label">Time Survived</p>
</div>

<style>
  .score-display {
    text-align: center;
  }

  .time {
    font-size: 5rem;
    font-weight: 900;
    background: linear-gradient(135deg, #00ff88 0%, #00ccff 100%);
    -webkit-background-clip: text;
    -webkit-text-fill-color: transparent;
    background-clip: text;
    margin: 0;
    line-height: 1;
  }

  .label {
    font-size: 1.2rem;
    color: #888;
    margin-top: 1rem;
  }
</style>
