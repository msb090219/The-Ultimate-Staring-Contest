<script>
  import { onMount } from 'svelte';
  import { fade, fly, scale } from 'svelte/transition';
  import { quintInOut } from 'svelte/easing';
  import { gameState } from './stores/gameState.js';
  import HeroSection from './components/landing/HeroSection.svelte';
  import StartScreen from './components/start/StartScreen.svelte';
  import Countdown from './components/game/Countdown.svelte';
  import GamePhase from './components/game/GamePhase.svelte';
  import Results from './components/results/Results.svelte';
  import ProfilePage from './components/profile/ProfilePage.svelte';
  import SettingsPage from './components/settings/SettingsPage.svelte';

  let phase = $gameState.phase;

  gameState.subscribe(state => {
    phase = state.phase;
  });
</script>

<div class="app">
  {#if phase === 'landing'}
    <div transition:fade|global>
      <HeroSection />
    </div>
  {:else if phase === 'start'}
    <div transition:fade|global>
      <StartScreen />
    </div>
  {:else if phase === 'countdown'}
    <div transition:scale|global={{ duration: 300, easing: quintInOut }}>
      <Countdown />
    </div>
  {:else if phase === 'playing'}
    <div transition:fade|global>
      <GamePhase />
    </div>
  {:else if phase === 'results'}
    <div transition:fly|global={{ y: 20, duration: 400, easing: quintInOut }}>
      <Results />
    </div>
  {:else if phase === 'profile'}
    <div transition:fade|global>
      <ProfilePage />
    </div>
  {:else if phase === 'settings'}
    <div transition:fade|global>
      <SettingsPage />
    </div>
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
