<script>
  export let size = 'large'; // 'large' | 'medium' | 'small'
</script>

<div class="game-logo" class:large={size === 'large'} class:medium={size === 'medium'} class:small={size === 'small'}>
  <svg class="eye-icon" viewBox="0 0 100 60" xmlns="http://www.w3.org/2000/svg">
    <!-- Outer eye shape -->
    <path
      class="eye-outer"
      d="M 10 30 Q 50 5 90 30 Q 50 55 10 30 Z"
      fill="none"
      stroke="#00ff88"
      stroke-width="2"
    />
    <!-- Inner glow effect -->
    <path
      class="eye-glow"
      d="M 15 30 Q 50 10 85 30 Q 50 50 15 30 Z"
      fill="rgba(0, 255, 136, 0.1)"
      stroke="none"
    />
    <!-- Iris -->
    <circle class="iris" cx="50" cy="30" r="12" fill="rgba(0, 255, 136, 0.3)" />
    <!-- Pupil -->
    <circle class="pupil" cx="50" cy="30" r="6" fill="#00ff88" />
    <!-- Highlight -->
    <circle class="highlight" cx="54" cy="26" r="2" fill="rgba(255, 255, 255, 0.8)" />
  </svg>
  <span class="logo-text">DO NOT BLINK</span>
</div>

<style>
  .game-logo {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 1rem;
  }

  .game-logo.large {
    --eye-size: 100px;
    --text-size: 2.5rem;
  }

  .game-logo.medium {
    --eye-size: 60px;
    --text-size: 1.8rem;
  }

  .game-logo.small {
    --eye-size: 40px;
    --text-size: 1.2rem;
    flex-direction: row;
    gap: 0.5rem;
  }

  .eye-icon {
    width: var(--eye-size);
    height: calc(var(--eye-size) * 0.6);
    filter: drop-shadow(0 0 10px rgba(0, 255, 136, 0.5));
    animation: pulse 2s ease-in-out infinite;
  }

  .eye-outer {
    stroke: #00ff88;
  }

  .eye-glow {
    fill: rgba(0, 255, 136, 0.1);
  }

  .iris {
    fill: rgba(0, 255, 136, 0.3);
  }

  .pupil {
    fill: #00ff88;
  }

  .highlight {
    fill: rgba(255, 255, 255, 0.8);
  }

  .logo-text {
    font-size: var(--text-size);
    font-weight: 700;
    letter-spacing: -0.05em;
    background: #00ff88;
    -webkit-background-clip: text;
    -webkit-text-fill-color: transparent;
    background-clip: text;
    text-align: center;
  }

  @keyframes pulse {
    0%, 100% {
      filter: drop-shadow(0 0 10px rgba(0, 255, 136, 0.5));
    }
    50% {
      filter: drop-shadow(0 0 20px rgba(0, 255, 136, 0.8));
    }
  }
</style>
