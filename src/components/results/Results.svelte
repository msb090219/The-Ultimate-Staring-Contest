<script>
  import { gameState } from '../../stores/gameState.js';
  import { authState } from '../../stores/authState.js';
  import { leaderboard } from '../../stores/leaderboard.js';
  import { getRank } from '../../lib/utils/rank.js';
  import { formatDate } from '../../lib/utils/time.js';
  import { MESSAGES } from '../../lib/constants/messages.js';
  import { supabaseService } from '../../services/supabase.js';
  import { cameraService } from '../../services/camera.js';
  import { gameEngine } from '../../services/gameEngine.js';
  import { getOrCreateGuest } from '../../lib/utils/guest.js';
  import confetti from 'canvas-confetti';
  import ScoreDisplay from './ScoreDisplay.svelte';
  import RankDisplay from './RankDisplay.svelte';
  import DisqualifiedBanner from './DisqualifiedBanner.svelte';
  import ShareButton from './ShareButton.svelte';
  import PlayAgainButton from './PlayAgainButton.svelte';
  import LeaderboardFull from '../leaderboard/LeaderboardFull.svelte';
  import { onMount, onDestroy, tick } from 'svelte';

  let scoreSubmitted = false;
  let submissionResult = null;
  let showConfetti = false;

  onMount(async () => {
    // Stop game engine
    gameEngine.stop();

    // Submit score if not disqualified (guest or authenticated)
    if (!$gameState.isDisqualified) {
      await submitScore();
    }

    // Load user-centric leaderboard
    await loadUserCentricLeaderboard();
  });

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

  async function submitScore() {
    if ($gameState.isDisqualified) return;

    let userId, guestIdentifier, userName;

    if ($authState.isAuthenticated) {
      userId = $authState.user.id;
      guestIdentifier = null;
      userName = $authState.user.game_name;
    } else {
      // Guest user
      const guest = getOrCreateGuest();
      userId = null;
      guestIdentifier = guest.id;
      userName = guest.name;
    }

    console.log('[Results] Submitting score:', {
      userId,
      guestIdentifier,
      userName,
      time: $gameState.finalTime
    });

    const result = await supabaseService.submitScore(
      userId,
      guestIdentifier,
      userName,
      $gameState.finalTime
    );

    console.log('[Results] Submission result:', result);

    scoreSubmitted = true;
    submissionResult = result;

    // Refresh leaderboard after score submission
    if (result.success) {
      await loadUserCentricLeaderboard();
      console.log('[Results] User-centric leaderboard refreshed');
    }

    // Trigger confetti for new personal best
    if (result.success && result.better) {
      console.log('[Results] Triggering confetti for new personal best!');
      await tick();
      const rank = getRank($gameState.finalTime);
      triggerConfetti(rank);
    } else {
      console.log('[Results] No confetti - success:', result.success, 'better:', result.better);
    }
  }

  function triggerConfetti(rank) {
    // Game theme colors: green (#00ff88) and cyan (#00ccff)
    const colors = ['#00ff88', '#00ccff', '#00ffaa', '#00ddff'];

    // Different celebration levels based on rank
    const rankName = rank?.name || '';
    const isHighRank = ['Probably Not Human', 'Villain Energy'].includes(rankName);
    const isMediumRank = ['Suspiciously Focused', 'Weak but Respectable'].includes(rankName);

    if (isHighRank) {
      // EPIC celebration for top ranks
      triggerEpicConfetti(colors);
    } else if (isMediumRank) {
      // Nice celebration for mid ranks
      triggerMediumConfetti(colors);
    } else {
      // Standard celebration
      triggerStandardConfetti(colors);
    }
  }

  function triggerEpicConfetti(colors) {
    // Multiple waves from all directions
    const duration = 3000;
    const end = Date.now() + duration;

    const frame = () => {
      confetti({
        particleCount: 3,
        angle: 60,
        spread: 55,
        origin: { x: 0, y: 0.8 },
        colors: colors,
        disableForReducedMotion: true,
        zIndex: 1000
      });
      confetti({
        particleCount: 3,
        angle: 120,
        spread: 55,
        origin: { x: 1, y: 0.8 },
        colors: colors,
        disableForReducedMotion: true,
        zIndex: 1000
      });

      if (Date.now() < end) {
        requestAnimationFrame(frame);
      }
    };

    // Initial massive burst
    confetti({
      particleCount: 200,
      spread: 100,
      origin: { y: 0.6, x: 0.5 },
      colors: colors,
      disableForReducedMotion: true,
      zIndex: 1000
    });

    confetti({
      particleCount: 100,
      angle: 60,
      spread: 70,
      origin: { x: 0, y: 0.7 },
      colors: colors,
      disableForReducedMotion: true,
      zIndex: 1000
    });

    confetti({
      particleCount: 100,
      angle: 120,
      spread: 70,
      origin: { x: 1, y: 0.7 },
      colors: colors,
      disableForReducedMotion: true,
      zIndex: 1000
    });

    // Start continuous rain
    frame();
  }

  function triggerMediumConfetti(colors) {
    // Multiple coordinated bursts
    confetti({
      particleCount: 150,
      spread: 80,
      origin: { y: 0.6, x: 0.5 },
      colors: colors,
      disableForReducedMotion: true,
      zIndex: 1000
    });

    setTimeout(() => {
      confetti({
        particleCount: 80,
        angle: 60,
        spread: 60,
        origin: { x: 0, y: 0.75 },
        colors: colors,
        disableForReducedMotion: true,
        zIndex: 1000
      });
      confetti({
        particleCount: 80,
        angle: 120,
        spread: 60,
        origin: { x: 1, y: 0.75 },
        colors: colors,
        disableForReducedMotion: true,
        zIndex: 1000
      });
    }, 150);

    setTimeout(() => {
      confetti({
        particleCount: 60,
        spread: 90,
        origin: { y: 0.7, x: 0.5 },
        colors: colors,
        disableForReducedMotion: true,
        zIndex: 1000
      });
    }, 300);
  }

  function triggerStandardConfetti(colors) {
    // Simple celebration burst
    confetti({
      particleCount: 100,
      spread: 70,
      origin: { y: 0.6, x: 0.5 },
      colors: colors,
      disableForReducedMotion: true,
      zIndex: 1000
    });

    setTimeout(() => {
      confetti({
        particleCount: 50,
        angle: 60,
        spread: 55,
        origin: { x: 0, y: 0.8 },
        colors: colors,
        disableForReducedMotion: true,
        zIndex: 1000
      });
    }, 200);

    setTimeout(() => {
      confetti({
        particleCount: 50,
        angle: 120,
        spread: 55,
        origin: { x: 1, y: 0.8 },
        colors: colors,
        disableForReducedMotion: true,
        zIndex: 1000
      });
    }, 400);
  }

  function handlePlayAgain() {
    // Go to start screen instead of landing (keep player name/guest info)
    gameState.setPhase('start');
    gameEngine.reset();
    cameraService.stop();
  }

  onDestroy(() => {
    // Ensure cleanup happens even if component unmounts
    gameEngine.stop();
  });
</script>

<div class="results">
  <div class="results-content">
    {#if $gameState.isDisqualified}
      <DisqualifiedBanner />
    {/if}

    <ScoreDisplay time={$gameState.finalTime} />

    {#if !$gameState.isDisqualified}
      <RankDisplay rank={getRank($gameState.finalTime)} />
    {/if}

    <div class="actions">
      <ShareButton time={$gameState.finalTime} />
      <PlayAgainButton onClick={handlePlayAgain} />
    </div>
  </div>

  <LeaderboardFull />
</div>

<style>
  .results {
    width: 100%;
    max-width: 800px;
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 2rem;
    padding: 2rem;
  }

  .results-content {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 1.5rem;
    text-align: center;
  }

  .actions {
    display: flex;
    gap: 1rem;
    flex-wrap: wrap;
    justify-content: center;
  }
</style>
