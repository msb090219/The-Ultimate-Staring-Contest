<script>
  import { leaderboard } from '../../stores/leaderboard.js';
  import { authState } from '../../stores/authState.js';
  import { getOrCreateGuest } from '../../lib/utils/guest.js';
  import { onMount } from 'svelte';
  import { formatDate } from '../../lib/utils/time.js';

  export let isOpen = false;
  export let onClose = () => {};

  let allScores = [];
  let isLoading = false;

  // ESC key handler
  function handleKeydown(e) {
    if (e.key === 'Escape' && isOpen) {
      onClose();
    }
  }

  // Fetch all scores when modal opens
  async function loadScores() {
    if (!isOpen) return;

    isLoading = true;
    // Import supabaseService dynamically to avoid circular dependencies
    const { supabaseService } = await import('../../services/supabase.js');
    const result = await supabaseService.getTopScores(100);
    if (result.success) {
      allScores = result.data;
    }
    isLoading = false;
  }

  // Reload scores when modal opens
  $: if (isOpen) {
    loadScores();
  }

  function handleBackdropClick(e) {
    if (e.target === e.currentTarget) {
      onClose();
    }
  }

  function isCurrentUser(score) {
    if ($authState.isAuthenticated) {
      return score.user_id === $authState.user?.id;
    } else {
      const guest = getOrCreateGuest();
      return score.guest_identifier === guest.id;
    }
  }

  // Add/remove ESC key listener
  $: if (isOpen) {
    window.addEventListener('keydown', handleKeydown);
  } else {
    window.removeEventListener('keydown', handleKeydown);
  }
</script>

{#if isOpen}
  <div class="modal-backdrop" on:click={handleBackdropClick}>
    <div class="modal">
      <button class="close-btn" on:click={onClose}>×</button>

      <h2>🏆 Global Leaderboard</h2>

      {#if isLoading}
        <p class="loading">Loading leaderboard...</p>
      {:else if allScores.length === 0}
        <p class="empty">No scores yet. Be the first!</p>
      {:else}
        <div class="leaderboard-list">
          <div class="list-header">
            <span class="header-rank">#</span>
            <span class="header-name">Player</span>
            <span class="header-time">Time</span>
            <span class="header-date">Date</span>
          </div>
          {#each allScores as score, index}
            {@const isUser = isCurrentUser(score)}
            <div class="score-entry" class:current-user={isCurrentUser(score)}>
              <span class="rank rank-{index < 3 ? index + 1 : ''}">{index + 1}</span>
              <span class="name">
                {score.game_name}
                {#if isUser}
                  <span class="you-badge">You</span>
                {/if}
              </span>
              <span class="time">{score.time_seconds.toFixed(2)}s</span>
              <span class="date">{formatDate(score.created_at)}</span>
            </div>
          {/each}
        </div>
      {/if}
    </div>
  </div>
{/if}

<style>
  .modal-backdrop {
    position: fixed;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    background: rgba(0, 0, 0, 0.8);
    display: flex;
    align-items: center;
    justify-content: center;
    z-index: 1000;
  }

  .modal {
    background: linear-gradient(135deg, #1a1a2e 0%, #16213e 100%);
    border-radius: 20px;
    padding: 2.5rem;
    width: 90%;
    max-width: 600px;
    max-height: 80vh;
    position: relative;
    border: 2px solid rgba(255, 255, 255, 0.1);
    box-shadow: 0 25px 50px rgba(0, 0, 0, 0.5);
    display: flex;
    flex-direction: column;
  }

  .close-btn {
    position: absolute;
    top: 1rem;
    right: 1rem;
    background: none;
    border: none;
    color: #888;
    font-size: 1.5rem;
    cursor: pointer;
    padding: 0.25rem;
    line-height: 1;
    transition: color 0.2s ease;
  }

  .close-btn:hover {
    color: #fff;
  }

  h2 {
    font-size: 1.8rem;
    font-weight: 700;
    text-align: center;
    margin: 0 0 2rem 0;
    color: #fff;
    padding-right: 2rem;
  }

  .loading,
  .empty {
    text-align: center;
    color: #888;
    padding: 3rem 0;
  }

  .leaderboard-list {
    overflow-y: auto;
    max-height: calc(80vh - 150px);
    padding-right: 0.5rem;
  }

  /* Custom scrollbar */
  .leaderboard-list::-webkit-scrollbar {
    width: 8px;
  }

  .leaderboard-list::-webkit-scrollbar-track {
    background: rgba(255, 255, 255, 0.05);
    border-radius: 4px;
  }

  .leaderboard-list::-webkit-scrollbar-thumb {
    background: rgba(0, 255, 136, 0.3);
    border-radius: 4px;
  }

  .leaderboard-list::-webkit-scrollbar-thumb:hover {
    background: rgba(0, 255, 136, 0.5);
  }

  .list-header {
    display: grid;
    grid-template-columns: 50px 1fr 100px 120px;
    gap: 1rem;
    padding: 1rem;
    border-bottom: 2px solid rgba(255, 255, 255, 0.1);
    position: sticky;
    top: 0;
    background: #1a1a2e;
    z-index: 1;
  }

  .header-rank,
  .header-name,
  .header-time,
  .header-date {
    font-weight: 700;
    color: #888;
    text-transform: uppercase;
    font-size: 0.75rem;
    letter-spacing: 1px;
  }

  .score-entry {
    display: grid;
    grid-template-columns: 50px 1fr 100px 120px;
    gap: 1rem;
    padding: 1rem;
    border-radius: 8px;
    transition: all 0.2s ease;
    align-items: center;
  }

  .score-entry:hover {
    background: rgba(255, 255, 255, 0.05);
  }

  .score-entry.current-user {
    background: rgba(0, 255, 136, 0.1);
    border: 1px solid rgba(0, 255, 136, 0.3);
  }

  .score-entry.current-user:hover {
    background: rgba(0, 255, 136, 0.15);
  }

  .rank {
    font-weight: 700;
    font-size: 1rem;
    text-align: center;
  }

  .rank-1 {
    color: #ffd700;
    font-size: 1.2rem;
    text-shadow: 0 0 10px rgba(255, 215, 0, 0.5);
  }

  .rank-2 {
    color: #c0c0c0;
    font-size: 1.1rem;
  }

  .rank-3 {
    color: #cd7f32;
    font-size: 1.1rem;
  }

  .name {
    font-weight: 500;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
    color: #fff;
    display: flex;
    align-items: center;
    gap: 0.5rem;
  }

  .you-badge {
    font-size: 0.75rem;
    padding: 0.25rem 0.5rem;
    background: #00ff88;
    color: #0a0a0a;
    border-radius: 4px;
    font-weight: 600;
  }

  .time {
    font-weight: 700;
    color: #00ccff;
    text-align: right;
  }

  .date {
    font-size: 0.85rem;
    color: #666;
    text-align: right;
  }

  @media (max-width: 600px) {
    .modal {
      width: 95%;
      padding: 1.5rem;
      max-height: 90vh;
    }

    .list-header,
    .score-entry {
      grid-template-columns: 40px 1fr 80px;
    }

    .header-date,
    .date {
      display: none;
    }

    h2 {
      font-size: 1.4rem;
    }
  }
</style>
