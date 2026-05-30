<script>
  import { onMount } from 'svelte';
  import { gameState } from './stores/gameState.js';
  import HeroSection from './components/landing/HeroSection.svelte';
  import StartScreen from './components/start/StartScreen.svelte';
  import Countdown from './components/game/Countdown.svelte';
  import GamePhase from './components/game/GamePhase.svelte';
  import Results from './components/results/Results.svelte';
  import ProfilePage from './components/profile/ProfilePage.svelte';

  let phase = $gameState.phase;

  gameState.subscribe(state => {
    phase = state.phase;
  });
</script>

<div class="app">
  {#if phase === 'landing'}
    <HeroSection />
  {:else if phase === 'start'}
    <StartScreen />
  {:else if phase === 'countdown'}
    <Countdown />
  {:else if phase === 'playing'}
    <GamePhase />
  {:else if phase === 'results'}
    <Results />
  {:else if phase === 'profile'}
    <ProfilePage />
  {/if}
</div>

<style>
  .app {
    min-height: 100vh;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    background: #0a0a0a;
    color: #ffffff;
    font-family: system-ui, -apple-system, sans-serif;
  }

  :global(body) {
    margin: 0;
    padding: 0;
  }
</style>
