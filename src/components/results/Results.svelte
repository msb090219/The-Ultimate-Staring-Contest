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
  import ReasonDisplay from './ReasonDisplay.svelte';
  import DisqualifiedBanner from './DisqualifiedBanner.svelte';
  import ShareButton from './ShareButton.svelte';
  import PlayAgainButton from './PlayAgainButton.svelte';
  import LeaderboardFull from '../leaderboard/LeaderboardFull.svelte';
  import { onMount, onDestroy, tick } from 'svelte';

  let scoreSubmitted = false;
  let submissionResult = null;
  let showConfetti = false;
  let gameOverFlash = false;
  let revealStage = 0; // 0: initial, 1: flash, 2: content

  onMount(async () => {
    // Stop game engine
    gameEngine.stop();

    // Dramatic reveal sequence
    await triggerGameOverReveal();

    // Submit score if not disqualified (guest or authenticated)
    if (!$gameState.isDisqualified) {
      await submitScore();
    }

    // Load user-centric leaderboard
    await loadUserCentricLeaderboard();
  });

  async function triggerGameOverReveal() {
    // Stage 1: Initial flash
    gameOverFlash = true;
    revealStage = 1;
    await tick();

    // Stage 2: Shake effect
    setTimeout(() => {
      gameOverFlash = false;
    }, 150);

    // Stage 3: Reveal content
    setTimeout(() => {
      revealStage = 2;
    }, 300);
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

<div class="results" class:flash={gameOverFlash} class:revealed={revealStage === 2}>
  {#if gameOverFlash}
    <div class="flash-overlay"></div>
  {/if}

  <div class="results-content">
    {#if $gameState.isDisqualified}
      <DisqualifiedBanner />
    {/if}

    <ScoreDisplay time={$gameState.finalTime} />

    {#if !$gameState.isDisqualified}
      <RankDisplay rank={getRank($gameState.finalTime)} />
    {/if}

    <ReasonDisplay
      reason={$gameState.lossReason}
      isDisqualified={$gameState.isDisqualified}
    />

    <div class="actions">
      <ShareButton time={$gameState.finalTime} />
      <PlayAgainButton onClick={handlePlayAgain} />
    </div>

    {#if scoreSubmitted && submissionResult}
      <div class="submission-result">
        {#if submissionResult.success}
          {#if submissionResult.better}
            <p class="success">🎉 New personal best: {$gameState.finalTime.toFixed(2)}s!</p>
          {:else}
            <p class="info">{submissionResult.message} | Your time: {$gameState.finalTime.toFixed(2)}s</p>
          {/if}
        {:else}
          <p class="error">Failed to save score: {submissionResult.error}</p>
        {/if}
      </div>
    {/if}
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
    position: relative;
    transition: opacity 0.3s ease;
  }

  .results:not(.revealed) {
    opacity: 0;
  }

  .results.revealed {
    animation: resultsReveal 0.5s ease-out forwards;
  }

  .flash-overlay {
    position: fixed;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    background: radial-gradient(circle at center, rgba(255, 68, 68, 0.8) 0%, rgba(0, 0, 0, 0.9) 100%);
    z-index: 1000;
    animation: flashFade 150ms ease-out forwards;
  }

  .results.flash {
    animation: screenShake 150ms ease-out;
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

  .submission-result {
    padding: 1rem;
    background: rgba(0, 255, 136, 0.1);
    border-radius: 8px;
    border: 1px solid rgba(0, 255, 136, 0.3);
  }

  .success {
    color: #00ff88;
    font-weight: 600;
    margin: 0;
  }

  .info {
    color: #00ccff;
    font-weight: 500;
    margin: 0;
  }

  .error {
    color: #ff4444;
    font-weight: 500;
    margin: 0;
  }

  @keyframes flashFade {
    0% {
      opacity: 1;
    }
    100% {
      opacity: 0;
    }
  }

  @keyframes screenShake {
    0%, 100% {
      transform: translate(0, 0);
    }
    25% {
      transform: translate(-5px, 5px);
    }
    50% {
      transform: translate(5px, -5px);
    }
    75% {
      transform: translate(-5px, -5px);
    }
  }

  @keyframes resultsReveal {
    0% {
      opacity: 0;
      transform: translateY(20px) scale(0.95);
    }
    50% {
      opacity: 0.7;
      transform: translateY(-10px) scale(1.02);
    }
    100% {
      opacity: 1;
      transform: translateY(0) scale(1);
    }
  }
</style>
