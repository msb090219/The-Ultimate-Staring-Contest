<script>
  export let reason = '';
  export let isDisqualified = false;

  const messages = {
    blink: 'You blinked',
    position_lost: 'Position lost',
    manual: 'Game ended',
    cheating: 'Hands detected'
  };
</script>

<div class="reason-display {isDisqualified ? 'disqualified' : ''}">
  <p class="reason">{messages[reason] || reason}</p>
</div>

<style>
  .reason-display {
    text-align: center;
  }

  .reason {
    font-size: 1.1rem;
    color: #888;
    margin: 0;
  }

  .disqualified .reason {
    color: #ffaa00;
    font-weight: 500;
  }
</style>
