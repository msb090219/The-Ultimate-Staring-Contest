<script>
  import { onMount } from 'svelte';
  import { gameState } from '../../stores/gameState.js';

  let mounted = false;

  onMount(() => {
    mounted = true;
  });

  function handleStartClick() {
    gameState.setPhase('start');
  }
</script>

<div class="hero-section" class:mounted={mounted}>
  <div class="content" class:mounted={mounted}>
    <div class="logo-wrapper">
      <img src="/favicon.svg" alt="Do Not Blink" class="logo" />
    </div>
    <h1 class="headline">The Ultimate Staring Competition</h1>
    <p class="tagline">How long can you maintain eye contact without blinking?</p>
    <button class="cta-button" on:click={handleStartClick}>Start Playing</button>
    <a href="https://github.com/msb090219/The-Ultimate-Staring-Contest" target="_blank" rel="noopener noreferrer" class="github-link">View Project on GitHub</a>
  </div>
</div>

<style>
  .hero-section {
    width: 100%;
    min-height: 100vh;
    display: flex;
    align-items: center;
    justify-content: center;
    padding: 2rem;
  }

  .content {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 2rem;
    max-width: 800px;
    text-align: center;
    opacity: 0;
    transform: translateY(20px);
    transition: opacity 0.6s ease, transform 0.6s ease;
  }

  .content.mounted {
    opacity: 1;
    transform: translateY(0);
  }

  .headline {
    font-size: 2rem;
    font-weight: 700;
    letter-spacing: -0.05em;
    color: #ffffff;
    margin: 0;
  }

  .tagline {
    font-size: 1.25rem;
    font-weight: 400;
    color: #888;
    margin: 0;
    line-height: 1.6;
  }

  .logo-wrapper {
    animation: pulse 2s ease-in-out infinite;
  }

  .logo {
    width: 120px;
    height: 120px;
    filter: drop-shadow(0 0 20px rgba(0, 255, 136, 0.8));
  }

  @keyframes pulse {
    0%, 100% {
      filter: drop-shadow(0 0 20px rgba(0, 255, 136, 0.8));
    }
    50% {
      filter: drop-shadow(0 0 30px rgba(0, 255, 136, 1));
    }
  }

  .cta-button {
    padding: 1.5rem 3rem;
    font-size: 1.3rem;
    font-weight: 700;
    background: #00ff88;
    border: none;
    border-radius: 12px;
    color: #0a0a0a;
    cursor: pointer;
    transition: all 0.2s ease;
    box-shadow: 0 4px 15px rgba(0, 255, 136, 0.3);
  }

  .cta-button:hover {
    transform: scale(1.05);
    box-shadow: 0 6px 20px rgba(0, 255, 136, 0.4);
  }

  .cta-button:active {
    transform: scale(0.98);
  }

  .github-link {
    color: #888;
    text-decoration: none;
    font-size: 0.9rem;
    transition: color 0.2s ease;
    margin-top: 1rem;
  }

  .github-link:hover {
    color: #00ff88;
  }

  @media (max-width: 768px) {
    .headline {
      font-size: 1.5rem;
    }

    .tagline {
      font-size: 1rem;
    }

    .cta-button {
      padding: 1.2rem 2.5rem;
      font-size: 1.1rem;
    }
  }
</style>
