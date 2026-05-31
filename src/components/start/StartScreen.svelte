<script>
  import { onMount } from 'svelte';
  import { gameState } from '../../stores/gameState.js';
  import { authState } from '../../stores/authState.js';
  import { leaderboard } from '../../stores/leaderboard.js';
  import Navbar from './Navbar.svelte';
  import NameInput from './NameInput.svelte';
  import SignInModal from './SignInModal.svelte';
  import CalibrationView from './CalibrationView.svelte';
  import LeaderboardPreview from '../leaderboard/LeaderboardPreview.svelte';
  import StartButton from './StartButton.svelte';
  import { authService } from '../../services/auth.js';
  import { supabaseService } from '../../services/supabase.js';
  import { getOrCreateGuest } from '../../lib/utils/guest.js';

  let showCalibration = false;
  let showSignIn = false;
  let playerName = $gameState.playerName;
  let guest = null;

  onMount(async () => {
    // Initialize auth service
    await authService.initialize();

    // Set up guest user if not authenticated
    if (!$authState.isAuthenticated) {
      guest = getOrCreateGuest();
      playerName = guest.name;
    } else {
      playerName = $authState.user?.game_name || 'Player';
    }

    gameState.setPlayerName(playerName);

    // Load leaderboard preview
    loadLeaderboard();
  });

  async function loadLeaderboard() {
    const result = await supabaseService.getPreviewScores(5);
    if (result.success) {
      leaderboard.setTopScores(result.data);
    }
  }

  function showCalibrationView() {
    gameState.setPlayerName(playerName);
    showCalibration = true;
  }

  function handleCalibrationReady() {
    gameState.setPhase('countdown');
  }

  $: if ($authState.isAuthenticated && $authState.user?.game_name) {
    // User is signed in - use their game name
    playerName = $authState.user.game_name;
    gameState.setPlayerName(playerName);
  } else if (!$authState.isAuthenticated) {
    // User is not signed in - use guest name
    guest = getOrCreateGuest();
    playerName = guest.name;
    gameState.setPlayerName(playerName);
  }
</script>

<div class="start-screen">
  <!-- Navbar - only show when not in calibration -->
  {#if !showCalibration}
    <Navbar onSignIn={() => showSignIn = true} />
  {/if}

  <div class="content" class:calibration-mode={showCalibration}>
    {#if !showCalibration}
      <!-- Small header -->
      <div class="page-header">
        <h2>Are you ready to compete?</h2>
      </div>

      <!-- Player controls above leaderboard -->
      <div class="player-section">
        <div class="player-controls-wrapper">
          <div class="player-input-row">
            <NameInput bind:value={playerName} placeholder="Enter your name" />
            <StartButton
              {playerName}
              onClick={showCalibrationView}
            />
          </div>
        </div>
      </div>

      <LeaderboardPreview />
    {:else}
      <CalibrationView ready={handleCalibrationReady} />
    {/if}

    <SignInModal bind:isOpen={showSignIn} />
  </div>
</div>

<style>
  .start-screen {
    width: 100%;
    max-width: 1200px;
    padding: 2rem;
  }

  .content {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 3rem;
    padding-top: 5rem;
  }

  .content.calibration-mode {
    padding-top: 2rem;
  }

  .page-header {
    text-align: center;
  }

  .page-header h2 {
    font-size: 2rem;
    font-weight: 700;
    background: linear-gradient(135deg, #00ff88 0%, #00ccff 100%);
    -webkit-background-clip: text;
    -webkit-text-fill-color: transparent;
    background-clip: text;
    margin: 0;
  }

  .player-section {
    display: flex;
    flex-direction: column;
    align-items: center;
    width: 100%;
    max-width: 700px;
  }

  .player-controls-wrapper {
    display: flex;
    flex-direction: column;
    align-items: center;
  }

  .player-input-row {
    display: flex;
    align-items: flex-end;
    gap: 0.75rem;
  }

  @media (max-width: 600px) {
    .content {
      padding-top: 6rem;
    }

    .player-input-row {
      flex-direction: column;
      gap: 1rem;
    }
  }
</style>
