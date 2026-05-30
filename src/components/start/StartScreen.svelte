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
      <!-- Hero section -->
      <div class="hero-section">
        <h1>The Ultimate Staring Competition</h1>
        <p class="subtitle">How long can you maintain eye contact without blinking?</p>
      </div>

      <!-- Player controls above leaderboard -->
      <div class="player-section">
        <div class="player-controls-wrapper">
          <div class="player-label-row">
            <span class="player-label">Playing as</span>
          </div>
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
    gap: 1.5rem;
    padding-top: 5rem;
  }

  .content.calibration-mode {
    padding-top: 2rem;
  }

  .hero-section {
    text-align: center;
    margin-bottom: 2rem;
  }

  h1 {
    font-size: 3rem;
    font-weight: 700;
    background: linear-gradient(135deg, #00ff88 0%, #00ccff 100%);
    -webkit-background-clip: text;
    -webkit-text-fill-color: transparent;
    background-clip: text;
    margin-bottom: 0.5rem;
  }

  .subtitle {
    font-size: 1.2rem;
    color: #888;
  }

  .player-section {
    display: flex;
    flex-direction: column;
    align-items: center;
    width: 100%;
    max-width: 500px;
  }

  .player-controls-wrapper {
    display: flex;
    flex-direction: column;
    gap: 0.5rem;
    align-items: flex-start;
  }

  .player-label-row {
    text-align: left;
  }

  .player-label {
    font-size: 0.75rem;
    color: #888;
    text-transform: uppercase;
    letter-spacing: 0.1em;
  }

  .player-input-row {
    display: flex;
    align-items: center;
    gap: 1rem;
  }

  h1 {
    font-size: 3rem;
    font-weight: 700;
    text-align: center;
    background: linear-gradient(135deg, #00ff88 0%, #00ccff 100%);
    -webkit-background-clip: text;
    -webkit-text-fill-color: transparent;
    background-clip: text;
    margin-bottom: 0.5rem;
  }

  .subtitle {
    font-size: 1.2rem;
    color: #888;
    text-align: center;
    margin-bottom: 1rem;
  }

  @media (max-width: 600px) {
    .content {
      padding-top: 6rem;
    }

    h1 {
      font-size: 2rem;
    }

    .subtitle {
      font-size: 1rem;
    }

    .player-controls-wrapper {
      align-items: center;
    }

    .player-input-row {
      flex-direction: column;
      gap: 1rem;
    }

    .player-input-row :global(input) {
      width: 100%;
    }
  }
</style>
