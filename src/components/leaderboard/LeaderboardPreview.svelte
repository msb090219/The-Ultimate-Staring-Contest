<script>
  import { leaderboard } from '../../stores/leaderboard.js';
  import { authState } from '../../stores/authState.js';
  import { formatDate } from '../../lib/utils/time.js';
  import { getOrCreateGuest } from '../../lib/utils/guest.js';
  import { onMount } from 'svelte';
  import LeaderboardModal from './LeaderboardModal.svelte';
  import { supabaseService } from '../../services/supabase.js';

  let showLeaderboardModal = false;

  function openModal() {
    showLeaderboardModal = true;
  }

  function isCurrentUser(score) {
    if ($authState.isAuthenticated) {
      return score.user_id === $authState.user?.id;
    } else {
      const guest = getOrCreateGuest();
      return score.guest_identifier === guest.id;
    }
  }

  let prevUserId = null;
  let prevGuestId = null;

  onMount(async () => {
    // Load user-centric leaderboard on mount
    await loadUserCentricLeaderboard();
  });

  // Reload leaderboard when user actually changes (not just auth state)
  $: if ($authState.isAuthenticated !== undefined) {
    const currentUserId = $authState.isAuthenticated ? $authState.user?.id : null;
    const currentGuestId = !$authState.isAuthenticated ? getOrCreateGuest().id : null;

    // Only reload if user actually changed
    if (currentUserId !== prevUserId || currentGuestId !== prevGuestId) {
      prevUserId = currentUserId;
      prevGuestId = currentGuestId;
      loadUserCentricLeaderboard();
    }
  }

  async function loadUserCentricLeaderboard() {
    let userId, guestIdentifier;

    if ($authState.isAuthenticated) {
      userId = $authState.user?.id;
      guestIdentifier = null;
    } else {
      const guest = getOrCreateGuest();
      userId = null;
      guestIdentifier = guest.id;
    }

    const result = await supabaseService.getUserCentricLeaderboard(userId, guestIdentifier, 2);
    if (result.success) {
      leaderboard.setUserCentric(result.data);
    }
  }
</script>

<div class="leaderboard-preview">
  <h2>
    {#if $leaderboard.userCentric?.userRank}
      Your Rank: #{$leaderboard.userCentric.userRank}
    {:else if $authState.isAuthenticated}
      Welcome, {$authState.user?.game_name || 'Player'}!
    {:else}
      Top Stare-ers
    {/if}
  </h2>

  {#if $leaderboard.isLoading}
    <p class="loading">Loading leaderboard...</p>
  {:else if !$leaderboard.userCentric || $leaderboard.userCentric.scores.length === 0}
    <p class="empty">
      {#if $authState.isAuthenticated}
        No scores yet. Play your first game to appear on the leaderboard!
      {:else}
        No scores yet. Be the first!
      {/if}
    </p>
  {:else}
    <div class="entries">
      {#each $leaderboard.userCentric.scores.slice(0, 3) as score, index}
        {@const displayRank = ($leaderboard.userCentric.startIndex || 1) + index}
        {@const isUser = isCurrentUser(score)}
        <div class="entry" class:user={isUser}>
          <span class="rank" class:rank-1={displayRank === 1} class:rank-2={displayRank === 2} class:rank-3={displayRank === 3}>
            {displayRank}
          </span>
          <span class="name">
            {score.game_name}
            {#if isUser}
              <span class="you-badge">You</span>
            {/if}
          </span>
          <span class="time">{score.time_seconds.toFixed(2)}s</span>
        </div>
      {/each}
    </div>

    <button class="view-all-btn" on:click={openModal}>
      View Full Leaderboard
    </button>
  {/if}
</div>

<LeaderboardModal
  isOpen={showLeaderboardModal}
  onClose={() => showLeaderboardModal = false}
/>

<style>
  .leaderboard-preview {
    width: 100%;
    max-width: 700px;
    padding: 2.5rem;
    background: rgba(255, 255, 255, 0.05);
    border-radius: 12px;
    border: 1px solid rgba(255, 255, 255, 0.1);
  }

  h2 {
    font-size: 2rem;
    text-align: center;
    margin-bottom: 2rem;
    color: #00ff88;
  }

  .loading,
  .empty {
    text-align: center;
    color: #888;
    margin: 2rem 0;
  }

  .entries {
    display: flex;
    flex-direction: column;
    gap: 1rem;
    margin-bottom: 2rem;
  }

  .entry {
    display: grid;
    grid-template-columns: 50px 1fr 100px;
    align-items: center;
    gap: 1.5rem;
    padding: 1rem 1.5rem;
    background: rgba(255, 255, 255, 0.05);
    border-radius: 8px;
    transition: background 0.2s ease;
  }

  .entry:hover {
    background: rgba(255, 255, 255, 0.1);
  }

  .entry.user {
    background: rgba(0, 255, 136, 0.1);
    border: 1px solid rgba(0, 255, 136, 0.3);
  }

  .rank {
    font-weight: 700;
    color: #00ff88;
    text-align: center;
  }

  .rank-1 {
    color: #ffd700;
    text-shadow: 0 0 10px rgba(255, 215, 0, 0.5);
  }

  .rank-2 {
    color: #c0c0c0;
  }

  .rank-3 {
    color: #cd7f32;
  }

  .name {
    font-weight: 500;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
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

  .view-all-btn {
    width: 100%;
    padding: 1.25rem 2rem;
    margin-top: 2rem;
    background: rgba(0, 255, 136, 0.1);
    border: 2px solid rgba(0, 255, 136, 0.3);
    border-radius: 8px;
    color: #00ff88;
    font-size: 1.1rem;
    font-weight: 600;
    cursor: pointer;
    transition: all 0.2s ease;
  }

  .view-all-btn:hover {
    background: rgba(0, 255, 136, 0.2);
    border-color: rgba(0, 255, 136, 0.5);
    transform: translateY(-2px);
    box-shadow: 0 5px 15px rgba(0, 255, 136, 0.2);
  }

  .view-all-btn:active {
    transform: translateY(0);
  }
</style>
