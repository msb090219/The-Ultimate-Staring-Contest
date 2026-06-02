<script>
  import { leaderboard } from '../../stores/leaderboard.js';
  import { gameState } from '../../stores/gameState.js';
  import { formatDate } from '../../lib/utils/time.js';
  import { authState } from '../../stores/authState.js';
  import { getGuestId } from '../../lib/utils/guest.js';
  import { onMount } from 'svelte';
  import { supabaseService } from '../../services/supabase.js';
  import LeaderboardModal from './LeaderboardModal.svelte';

  let showLeaderboardModal = false;

  function openModal() {
    showLeaderboardModal = true;
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
    const currentGuestId = $authState.isAuthenticated ? getGuestId() : getGuestId();

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
      // Also include guest ID for users who signed in after playing as guest
      guestIdentifier = getGuestId();
    } else {
      const guestId = getGuestId();
      userId = null;
      guestIdentifier = guestId;
    }

    console.log('[Leaderboard] Loading user-centric leaderboard:', { userId, guestIdentifier });

    // contextSize=1 gives: 1 above + you + 1 below = 3 total scores
    const result = await supabaseService.getUserCentricLeaderboard(userId, guestIdentifier, 1);
    if (result.success) {
      leaderboard.setUserCentric(result.data);
      console.log('[Leaderboard] User-centric data loaded:', result.data);
    }
  }

  function isCurrentUser(score) {
    if ($authState.isAuthenticated) {
      return score.user_id === $authState.user.id;
    } else {
      return score.guest_identifier === getGuestId();
    }
  }
</script>

<div class="leaderboard-full">
  <h2>
    {#if $leaderboard.userCentric?.userRank}
      Your Rank: #{$leaderboard.userCentric.userRank}
    {:else}
      Leaderboard
    {/if}
  </h2>

  {#if !$leaderboard.userCentric || $leaderboard.userCentric.scores.length === 0}
    <p class="empty">No scores yet. Be the first!</p>
  {:else}
    <div class="entries">
      {#each $leaderboard.userCentric.scores.slice(0, 3) as score, index}
        {@const displayRank = ($leaderboard.userCentric.startIndex || 1) + index}
        {@const isUser = isCurrentUser(score)}
        {@const isCurrentScore = $gameState.finalTime > 0 && $gameState.finalTime === score.time_seconds}
        <div
          class="entry {isUser ? 'user' : ''} {isCurrentScore ? 'current' : ''}"
        >
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
          <span class="date">{formatDate(score.created_at)}</span>
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
  .leaderboard-full {
    width: 100%;
    max-width: 600px;
    padding: 2rem;
    background: rgba(255, 255, 255, 0.05);
    border-radius: 12px;
    border: 1px solid rgba(255, 255, 255, 0.1);
  }

  h2 {
    font-size: 1.8rem;
    text-align: center;
    margin-bottom: 1.5rem;
    color: #00ff88;
  }

  .empty {
    text-align: center;
    color: #888;
    margin: 2rem 0;
  }

  .entries {
    display: flex;
    flex-direction: column;
    gap: 0.75rem;
  }

  .entry {
    display: grid;
    grid-template-columns: 40px 1fr 80px 100px;
    align-items: center;
    gap: 1rem;
    padding: 0.75rem 1rem;
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

  .entry.current {
    background: rgba(0, 204, 255, 0.1);
    border: 1px solid rgba(0, 204, 255, 0.3);
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

  .date {
    font-size: 0.85rem;
    color: #888;
    text-align: right;
  }

  .view-all-btn {
    width: 100%;
    margin-top: 1.5rem;
    padding: 1rem;
    background: linear-gradient(135deg, rgba(0, 255, 136, 0.1) 0%, rgba(0, 204, 255, 0.1) 100%);
    border: 2px solid rgba(0, 255, 136, 0.3);
    border-radius: 8px;
    color: #00ff88;
    font-size: 1rem;
    font-weight: 600;
    cursor: pointer;
    transition: all 0.2s ease;
  }

  .view-all-btn:hover {
    background: linear-gradient(135deg, rgba(0, 255, 136, 0.2) 0%, rgba(0, 204, 255, 0.2) 100%);
    border-color: rgba(0, 255, 136, 0.5);
    transform: translateY(-2px);
    box-shadow: 0 5px 15px rgba(0, 255, 136, 0.2);
  }

  .view-all-btn:active {
    transform: translateY(0);
  }

  @media (max-width: 600px) {
    .entry {
      grid-template-columns: 40px 1fr 80px;
    }

    .date {
      display: none;
    }
  }
</style>
