<script>
  export let rank = '';
</script>

<div class="rank-display">
  <p class="rank">{rank}</p>
</div>

<style>
  .rank-display {
    text-align: center;
  }

  .rank {
    font-size: 1.8rem;
    font-weight: 600;
    color: #00ccff;
    margin: 0;
    padding: 1rem 2rem;
    background: rgba(0, 204, 255, 0.1);
    border-radius: 12px;
    border: 2px solid rgba(0, 204, 255, 0.3);
  }
</style>
