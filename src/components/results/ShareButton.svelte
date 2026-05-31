<script>
  export let time = 0;
  import { authState } from '../../stores/authState.js';
  import ShareResultModal from './ShareResultModal.svelte';

  let showShareModal = false;

  function handleShare() {
    showShareModal = true;
  }

  function getShareName() {
    if ($authState.isAuthenticated && $authState.user?.game_name) {
      return $authState.user.game_name;
    }
    return 'Player';
  }
</script>

<div class="share-button-container">
  <button
    class="share-button"
    on:click={handleShare}
  >
    Share Score
  </button>

  <ShareResultModal
    isOpen={showShareModal}
    onClose={() => showShareModal = false}
    {time}
    playerName={getShareName()}
  />
</div>

<style>
  .share-button-container {
    position: relative;
  }

  .share-button {
    padding: 1rem 2rem;
    font-size: 1rem;
    font-weight: 600;
    background: rgba(255, 255, 255, 0.05);
    border: 2px solid rgba(255, 255, 255, 0.1);
    border-radius: 12px;
    color: #ffffff;
    cursor: pointer;
    transition: all 0.2s ease;
  }

  .share-button:hover {
    background: rgba(0, 204, 255, 0.1);
    border-color: #00ccff;
  }

  .share-button:active {
    transform: scale(0.98);
  }
</style>
