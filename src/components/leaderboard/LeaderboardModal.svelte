<script>
  import { leaderboard } from '../../stores/leaderboard.js';
  import { authState } from '../../stores/authState.js';
  import { getOrCreateGuest } from '../../lib/utils/guest.js';
  import { onMount } from 'svelte';
  import { formatDate } from '../../lib/utils/time.js';
  import { Trophy, X } from 'lucide-svelte';

  export let isOpen = false;
  export let onClose = () => {};

  let allScores = [];
  let isLoading = false;
  let wasOpen = false;

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
    const result = await supabaseService.getTopScores(500);
    if (result.success) {
      allScores = result.data;

      // Check if current user is in the top 500
      const userId = $authState.isAuthenticated ? $authState.user?.id : null;
      const guest = getOrCreateGuest();
      const guestIdentifier = $authState.isAuthenticated ? null : guest.id;

      let userInTop500 = false;
      if (userId) {
        userInTop500 = allScores.some(score => score.user_id === userId);
      } else if (guestIdentifier) {
        userInTop500 = allScores.some(score => score.guest_identifier === guestIdentifier);
      }

      // If user not in top 500, fetch their actual score and rank
      if (!userInTop500 && (userId || guestIdentifier)) {
        const userResult = await supabaseService.getUserBestScore(userId || guestIdentifier);
        if (userResult.success && userResult.data) {
          // Get all scores to calculate user's actual rank
          const allScoresResult = await supabaseService.getTopScores(10000);
          if (allScoresResult.success) {
            const allScoresList = allScoresResult.data;
            let actualRank = 0;
            for (let i = 0; i < allScoresList.length; i++) {
              const key = allScoresList[i].user_id || allScoresList[i].guest_identifier;
              const userKey = userId || guestIdentifier;
              if (key === userKey) {
                actualRank = i + 1;
                break;
              }
            }

            // Add user's score at the end with their actual rank
            allScores.push({
              ...userResult.data,
              actualRank: actualRank,
              isUserAtEnd: true
            });
          }
        }
      }
    }
    isLoading = false;
  }

  // Reload scores when modal opens (only when opening, not closing)
  $: if (isOpen && !wasOpen) {
    wasOpen = true;
    loadScores();
  } else if (!isOpen) {
    wasOpen = false;
  }

  function handleBackdropClick(e) {
    if (e.target === e.currentTarget) {
      onClose();
    }
  }

  function getMedalColor(rank) {
    if (rank === 1) return '#ffd700';
    if (rank === 2) return '#c0c0c0';
    if (rank === 3) return '#cd7f32';
    return '#888';
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
      <button class="close-btn" on:click={onClose}>
        <X size={24} />
      </button>

      <div class="modal-header">
        <div class="header-icon">
          <Trophy size={32} />
        </div>
        <h2>Global Leaderboard</h2>
      </div>

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
            {@const rank = score.actualRank || (index + 1)}
            {@const isAtEnd = score.isUserAtEnd}
            <div class="score-entry" class:current-user={isUser} class:user-at-end={isAtEnd}>
              <span class="rank" style:color={isAtEnd ? '#888' : getMedalColor(rank)}>
                {#if !isAtEnd && rank <= 3}
                  <Trophy size={16} style="margin-right: 4px;" />
                {/if}
                {rank}
              </span>
              <span class="name">
                {score.game_name}
                {#if isUser}
                  <span class="you-badge">You</span>
                {/if}
                {#if isAtEnd}
                  <span class="rank-badge">Rank #{rank}</span>
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
    background: rgba(0, 0, 0, 0.85);
    display: flex;
    align-items: center;
    justify-content: center;
    z-index: 1000;
    backdrop-filter: blur(4px);
  }

  .modal {
    background: #1a1a1a;
    border-radius: 16px;
    padding: 2rem;
    width: 90%;
    max-width: 600px;
    max-height: 80vh;
    position: relative;
    border: 1px solid rgba(255, 255, 255, 0.1);
    box-shadow: 0 20px 60px rgba(0, 0, 0, 0.5);
    display: flex;
    flex-direction: column;
  }

  .modal-header {
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 1rem;
    margin-bottom: 2rem;
    position: relative;
  }

  .header-icon {
    display: flex;
    align-items: center;
    justify-content: center;
    width: 48px;
    height: 48px;
    background: linear-gradient(135deg, #00ff88 0%, #00ccff 100%);
    border-radius: 12px;
    color: #0a0a0a;
  }

  .modal-header h2 {
    font-size: 1.5rem;
    font-weight: 700;
    margin: 0;
    color: #fff;
    text-align: center;
  }

  .close-btn {
    position: absolute;
    top: 0.5rem;
    right: 0.5rem;
    background: none;
    border: none;
    color: #888;
    cursor: pointer;
    padding: 0.5rem;
    display: flex;
    align-items: center;
    justify-content: center;
    transition: color 0.15s ease;
  }

  .close-btn:hover {
    color: #fff;
  }

  .loading,
  .empty {
    text-align: center;
    color: #888;
    padding: 3rem 0;
  }

  .leaderboard-list {
    overflow-y: auto;
    max-height: calc(80vh - 120px);
    padding-right: 0.5rem;
  }

  /* Custom scrollbar */
  .leaderboard-list::-webkit-scrollbar {
    width: 6px;
  }

  .leaderboard-list::-webkit-scrollbar-track {
    background: rgba(255, 255, 255, 0.05);
    border-radius: 3px;
  }

  .leaderboard-list::-webkit-scrollbar-thumb {
    background: rgba(0, 255, 136, 0.3);
    border-radius: 3px;
  }

  .leaderboard-list::-webkit-scrollbar-thumb:hover {
    background: rgba(0, 255, 136, 0.5);
  }

  .list-header {
    display: grid;
    grid-template-columns: 50px 1fr 100px 120px;
    gap: 1rem;
    padding: 0.75rem 1rem;
    border-bottom: 1px solid rgba(255, 255, 255, 0.1);
    position: sticky;
    top: 0;
    background: #1a1a1a;
    z-index: 1;
  }

  .header-rank,
  .header-name,
  .header-time,
  .header-date {
    font-weight: 600;
    color: #888;
    text-transform: uppercase;
    font-size: 0.7rem;
    letter-spacing: 0.08em;
  }

  .score-entry {
    display: grid;
    grid-template-columns: 50px 1fr 100px 120px;
    gap: 1rem;
    padding: 0.75rem 1rem;
    border-radius: 8px;
    transition: all 0.15s ease;
    align-items: center;
    border-bottom: 1px solid rgba(255, 255, 255, 0.05);
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

  .score-entry.user-at-end {
    border-top: 2px solid rgba(0, 255, 136, 0.5);
    margin-top: 0.5rem;
  }

  .rank {
    display: flex;
    align-items: center;
    justify-content: center;
    font-weight: 700;
    font-size: 0.95rem;
    gap: 0.25rem;
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
    font-size: 0.7rem;
    padding: 0.2rem 0.5rem;
    background: linear-gradient(135deg, #00ff88 0%, #00ccff 100%);
    color: #0a0a0a;
    border-radius: 4px;
    font-weight: 600;
    text-transform: uppercase;
    letter-spacing: 0.05em;
  }

  .rank-badge {
    font-size: 0.65rem;
    padding: 0.15rem 0.4rem;
    background: rgba(136, 136, 136, 0.2);
    color: #888;
    border-radius: 3px;
    font-weight: 500;
    margin-left: 0.25rem;
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
      border-radius: 12px;
    }

    .modal-header {
      gap: 0.75rem;
      margin-bottom: 1.5rem;
    }

    .header-icon {
      width: 40px;
      height: 40px;
    }

    .header-icon :global(svg) {
      width: 24px;
      height: 24px;
    }

    .modal-header h2 {
      font-size: 1.25rem;
    }

    .list-header,
    .score-entry {
      grid-template-columns: 40px 1fr 80px;
      gap: 0.75rem;
      padding: 0.65rem 0.75rem;
    }

    .header-date,
    .date {
      display: none;
    }
  }
</style>
