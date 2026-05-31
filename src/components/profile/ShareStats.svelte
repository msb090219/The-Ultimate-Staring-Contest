<script>
  import ShareStatsModal from './ShareStatsModal.svelte';

  export let bestTime = 0;
  export let globalRank = null;
  export let percentile = 0;
  export let gamesPlayed = 0;
  export let averageTime = 0;
  export let playerName = 'Player';

  let showShareModal = false;

  function toggleShareModal() {
    showShareModal = !showShareModal;
  }
</script>

<div class="share-stats-container">
  <button class="share-stats-btn" on:click={toggleShareModal}>
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
      <path d="M4 12v8a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-8"/>
      <polyline points="16 6 12 2 8 6"/>
      <line x1="12" y1="2" x2="12" y2="15"/>
    </svg>
    Share Stats
  </button>

  <ShareStatsModal
    isOpen={showShareModal}
    onClose={() => showShareModal = false}
    playerName={playerName}
    bestTime={bestTime}
    globalRank={globalRank}
    percentile={percentile}
    gamesPlayed={gamesPlayed}
    averageTime={averageTime}
  />
</div>

<style>
  .share-stats-container {
    position: relative;
  }

  .share-stats-btn {
    display: flex;
    align-items: center;
    gap: 0.5rem;
    padding: 0.75rem 1.5rem;
    background: linear-gradient(135deg, rgba(0, 255, 136, 0.1) 0%, rgba(0, 204, 255, 0.1) 100%);
    border: 2px solid rgba(0, 255, 136, 0.3);
    border-radius: 8px;
    color: #00ff88;
    font-size: 0.9rem;
    font-weight: 600;
    cursor: pointer;
    transition: all 0.2s ease;
  }

  .share-stats-btn:hover {
    background: linear-gradient(135deg, rgba(0, 255, 136, 0.2) 0%, rgba(0, 204, 255, 0.2) 100%);
    border-color: rgba(0, 255, 136, 0.5);
    transform: translateY(-1px);
  }
</style>
