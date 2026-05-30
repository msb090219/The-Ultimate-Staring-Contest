<script>
  import { gameState } from '../../stores/gameState.js';
  import { MESSAGES } from '../../lib/constants/messages.js';

  const messages = {
    position_lost: MESSAGES.game.disqualifiedPosition,
    face_lost: MESSAGES.game.disqualifiedFace,
    cheating: MESSAGES.game.disqualifiedCheating
  };

  $: message = messages[$gameState.lossReason] || 'Round forfeited';
</script>

<div class="disqualified-banner">
  <p class="message">{message}</p>
  <p class="info">This time was not submitted to the leaderboard.</p>
</div>

<style>
  .disqualified-banner {
    padding: 1.5rem;
    background: rgba(255, 170, 0, 0.1);
    border-radius: 12px;
    border: 2px solid rgba(255, 170, 0, 0.3);
    text-align: center;
  }

  .message {
    font-size: 1.2rem;
    font-weight: 600;
    color: #ffaa00;
    margin: 0 0 0.5rem 0;
  }

  .info {
    font-size: 0.9rem;
    color: #888;
    margin: 0;
  }
</style>
