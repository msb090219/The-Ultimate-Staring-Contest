<script>
  import { authService } from '../../services/auth.js';
  import { authState } from '../../stores/authState.js';
  import OAuthButton from './OAuthButton.svelte';

  export let isOpen = false;

  let isSignUp = false;
  let email = '';
  let password = '';
  let gameName = '';
  let formError = '';

  function closeModal() {
    isOpen = false;
    resetForm();
  }

  function resetForm() {
    email = '';
    password = '';
    gameName = '';
    formError = '';
  }

  function toggleMode() {
    isSignUp = !isSignUp;
    formError = '';
  }

  async function handleSubmit() {
    formError = '';

    if (!email || !password) {
      formError = 'Please fill in all fields';
      return;
    }

    if (isSignUp && !gameName) {
      formError = 'Please enter a display name';
      return;
    }

    if (password.length < 6) {
      formError = 'Password must be at least 6 characters';
      return;
    }

    let result;
    if (isSignUp) {
      result = await authService.signUpWithEmail(email, password, gameName);
      if (result.success) {
        // Email verification might be required
        formError = 'Check your email to confirm your account!';
      }
    } else {
      result = await authService.signInWithEmail(email, password);
      if (result.success) {
        closeModal();
      }
    }

    if (!result.success) {
      formError = result.error || 'Authentication failed';
    }
  }

  async function handleForgotPassword() {
    if (!email) {
      formError = 'Enter your email address first';
      return;
    }

    const result = await authService.resetPassword(email);
    if (result.success) {
      formError = 'Password reset email sent!';
    } else {
      formError = result.error || 'Failed to send reset email';
    }
  }

  function handleBackdropClick(e) {
    if (e.target === e.currentTarget) {
      closeModal();
    }
  }
</script>

{#if isOpen}
  <div class="modal-backdrop" on:click={handleBackdropClick}>
    <div class="modal">
      <button class="close-btn" on:click={closeModal}>×</button>

      <h2>{isSignUp ? 'Create Account' : 'Sign In'}</h2>

      <div class="auth-content">
        <!-- Google OAuth -->
        <div class="oauth-section">
          <p class="divider">Or continue with</p>
          <div class="oauth-button-wrapper">
            <OAuthButton provider="google" />
          </div>
        </div>

        <!-- Email Form -->
        <form on:submit|preventDefault={handleSubmit} class="email-form">
          {#if isSignUp}
            <div class="input-group">
              <input
                type="text"
                id="gameName"
                bind:value={gameName}
                placeholder="Display Name"
                autocomplete="username"
              />
            </div>
          {/if}

          <div class="input-group">
            <input
              type="email"
              id="email"
              bind:value={email}
              placeholder="Email"
              autocomplete="email"
              required
            />
          </div>

          <div class="input-group">
            <input
              type="password"
              id="password"
              bind:value={password}
              placeholder="Password"
              autocomplete={isSignUp ? 'new-password' : 'current-password'}
              required
            />
          </div>

          {#if formError}
            <p class="form-error" class:info={formError.includes('email') || formError.includes('sent')}>
              {formError}
            </p>
          {/if}

          <button type="submit" class="submit-btn" disabled={$authState.isLoading}>
            {$authState.isLoading ? 'Please wait...' : isSignUp ? 'Sign Up' : 'Sign In'}
          </button>
        </form>

        <div class="form-footer">
          {#if !isSignUp}
            <button class="link-btn" on:click={handleForgotPassword}>Forgot password?</button>
          {/if}

          <button class="link-btn" on:click={toggleMode}>
            {isSignUp ? 'Already have an account? Sign in' : "Don't have an account? Sign up"}
          </button>
        </div>
      </div>
    </div>
  </div>
{/if}

<style>
  .modal-backdrop {
    position: fixed;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    background: rgba(0, 0, 0, 0.8);
    display: flex;
    align-items: center;
    justify-content: center;
    z-index: 1000;
  }

  .modal {
    background: linear-gradient(135deg, #1a1a2e 0%, #16213e 100%);
    border-radius: 20px;
    padding: 2.5rem;
    width: 90%;
    max-width: 420px;
    position: relative;
    border: 2px solid rgba(255, 255, 255, 0.1);
    box-shadow: 0 25px 50px rgba(0, 0, 0, 0.5);
  }

  .close-btn {
    position: absolute;
    top: 1rem;
    right: 1rem;
    background: none;
    border: none;
    color: #888;
    font-size: 1.5rem;
    cursor: pointer;
    padding: 0.25rem;
    line-height: 1;
    transition: color 0.2s ease;
  }

  .close-btn:hover {
    color: #fff;
  }

  h2 {
    font-size: 1.8rem;
    font-weight: 700;
    text-align: center;
    margin: 0 0 2rem 0;
    color: #fff;
  }

  .auth-content {
    display: flex;
    flex-direction: column;
    gap: 1.5rem;
  }

  .oauth-section {
    display: flex;
    flex-direction: column;
    gap: 1rem;
  }

  .divider {
    text-align: center;
    color: #888;
    font-size: 0.9rem;
    margin: 0;
  }

  .oauth-button-wrapper {
    display: flex;
    justify-content: center;
  }

  .email-form {
    display: flex;
    flex-direction: column;
    gap: 1rem;
  }

  .input-group input {
    width: 100%;
    padding: 1rem;
    background: rgba(255, 255, 255, 0.05);
    border: 2px solid rgba(255, 255, 255, 0.1);
    border-radius: 10px;
    color: #fff;
    font-size: 1rem;
    transition: all 0.2s ease;
    box-sizing: border-box;
  }

  .input-group input:focus {
    outline: none;
    border-color: #00ff88;
    background: rgba(255, 255, 255, 0.08);
  }

  .input-group input::placeholder {
    color: #666;
  }

  .form-error {
    color: #ff4757;
    font-size: 0.9rem;
    text-align: center;
    margin: 0;
  }

  .form-error.info {
    color: #00ff88;
  }

  .submit-btn {
    padding: 1rem;
    background: linear-gradient(135deg, #00ff88 0%, #00ccff 100%);
    border: none;
    border-radius: 10px;
    color: #1a1a2e;
    font-size: 1rem;
    font-weight: 700;
    cursor: pointer;
    transition: all 0.2s ease;
  }

  .submit-btn:hover:not(:disabled) {
    transform: translateY(-2px);
    box-shadow: 0 10px 20px rgba(0, 255, 136, 0.3);
  }

  .submit-btn:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }

  .form-footer {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 0.75rem;
  }

  .link-btn {
    background: none;
    border: none;
    color: #00ff88;
    font-size: 0.9rem;
    cursor: pointer;
    padding: 0;
    text-decoration: underline;
    transition: color 0.2s ease;
  }

  .link-btn:hover {
    color: #00ccff;
  }
</style>
