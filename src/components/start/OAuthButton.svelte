<script>
  import { authService } from '../../services/auth.js';
  import { authState } from '../../stores/authState.js';

  export let provider = 'google';

  const icons = {
    google: 'G'
  };

  const labels = {
    google: 'Continue with Google'
  };

  async function handleSignIn() {
    if (provider === 'google') {
      await authService.signInWithGoogle();
    }
  }
</script>

<button
  class="oauth-button {provider}"
  on:click={handleSignIn}
  disabled={$authState.isLoading}
>
  <span class="icon">{icons[provider]}</span>
  <span class="label">{labels[provider]}</span>
</button>

<style>
  .oauth-button {
    display: flex;
    align-items: center;
    gap: 0.75rem;
    padding: 1rem 1.5rem;
    background: rgba(255, 255, 255, 0.05);
    border: 2px solid rgba(255, 255, 255, 0.1);
    border-radius: 12px;
    color: #ffffff;
    font-weight: 600;
    cursor: pointer;
    transition: all 0.2s ease;
  }

  .oauth-button:hover:not(:disabled) {
    background: rgba(66, 133, 244, 0.1);
    border-color: #4285f4;
  }

  .oauth-button:active:not(:disabled) {
    transform: scale(0.98);
  }

  .oauth-button:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }

  .icon {
    font-size: 1.2rem;
    font-weight: 700;
  }

  .label {
    font-size: 1rem;
  }

  .google .icon {
    color: #4285f4;
  }
</style>
