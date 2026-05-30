<script>
  import { gameState } from '../../stores/gameState.js';
  import { authState } from '../../stores/authState.js';
  import { authService } from '../../services/auth.js';
  import { User, Mail, Crown, Save, Check, X, Info, ArrowLeft } from 'lucide-svelte';
  import Navbar from '../start/Navbar.svelte';

  let newUsername = '';
  let isSaving = false;
  let saveMessage = '';
  let saveSuccess = false;

  function handleBack() {
    gameState.setPhase('start');
  }

  async function handleSaveUsername() {
    if (!newUsername.trim()) {
      saveMessage = 'Please enter a username';
      saveSuccess = false;
      return;
    }

    if (newUsername.length < 2) {
      saveMessage = 'Username must be at least 2 characters';
      saveSuccess = false;
      return;
    }

    if (newUsername.length > 20) {
      saveMessage = 'Username must be 20 characters or less';
      saveSuccess = false;
      return;
    }

    isSaving = true;
    saveMessage = '';

    const result = await authService.updateGameName(newUsername.trim());

    isSaving = false;

    if (result.success) {
      saveMessage = 'Username updated successfully!';
      saveSuccess = true;
      newUsername = '';
    } else {
      saveMessage = result.error || 'Failed to update username';
      saveSuccess = false;
    }
  }

  function handleKeyDown(e) {
    if (e.key === 'Enter' && !isSaving) {
      handleSaveUsername();
    }
  }

  function clearMessage() {
    saveMessage = '';
  }

  function capitalize(str) {
    return str ? str.charAt(0).toUpperCase() + str.slice(1) : '';
  }
</script>

<div class="settings-page">
  <Navbar />

  <div class="content">
    <!-- Header -->
    <div class="page-header">
      <button class="back-btn" on:click={handleBack}>
        <ArrowLeft size={20} />
      </button>
      <div class="header-text">
        <h1>Settings</h1>
      </div>
    </div>

    <div class="settings-layout">
      <!-- Main Settings -->
      <div class="settings-main">
        <!-- Username Change Card -->
        <div class="settings-card featured-card">
          <div class="card-banner">
            <div class="banner-icon">
              <Crown size={28} />
            </div>
            <div class="banner-text">
              <h2>Display Name</h2>
              <p>Change how your name appears on the leaderboard</p>
            </div>
          </div>

          <div class="card-content">
            <div class="current-display">
              <span class="display-label">Current name</span>
              <span class="display-value">{$authState.user?.game_name || 'Player'}</span>
            </div>

            <div class="input-group">
              <input
                type="text"
                bind:value={newUsername}
                placeholder="Enter new username"
                disabled={isSaving}
                on:keydown={handleKeyDown}
                on:input={clearMessage}
                maxlength="20"
              />
              <button
                class="save-button"
                on:click={handleSaveUsername}
                disabled={isSaving || !newUsername.trim()}
                class:loading={isSaving}
              >
                {#if isSaving}
                  <span class="button-text">Saving...</span>
                {:else}
                  <Save size={18} class="button-icon" />
                  <span class="button-text">Save Changes</span>
                {/if}
              </button>
            </div>

            <div class="input-hint">
              <Info size={14} />
              <span>2-20 characters • Instant update • Preserves your stats</span>
            </div>

            {#if saveMessage}
              <div class="status-message {saveSuccess ? 'success' : 'error'}">
                {#if saveSuccess}
                  <Check size={18} class="status-icon" />
                {:else}
                  <X size={18} class="status-icon" />
                {/if}
                <span>{saveMessage}</span>
              </div>
            {/if}
          </div>
        </div>

        <!-- Account Info Card -->
        <div class="settings-card">
          <div class="card-header">
            <div class="header-icon">
              <User size={22} />
            </div>
            <h3>Account Information</h3>
          </div>

          <div class="info-list">
            <div class="info-row">
              <span class="info-key">Display Name</span>
              <span class="info-val">{$authState.user?.game_name || 'Player'}</span>
            </div>

            <div class="info-row">
              <span class="info-key">Email Address</span>
              <span class="info-val">{$authState.user?.email || ''}</span>
            </div>

            <div class="info-row">
              <span class="info-key">Account Type</span>
              <span class="info-val tag">{capitalize($authState.user?.provider || 'email')}</span>
            </div>
          </div>
        </div>

        <!-- Coming Soon Card -->
        <div class="settings-card coming-soon-card">
          <div class="card-header">
            <div class="header-icon header-icon-accent">
              <Info size={22} />
            </div>
            <h3>Coming Soon</h3>
          </div>

          <div class="feature-grid">
            <div class="feature-item">
              <div class="feature-icon">🔊</div>
              <div>
                <div class="feature-name">Sound Settings</div>
                <div class="feature-desc">Toggle game sounds and music</div>
              </div>
            </div>

            <div class="feature-item">
              <div class="feature-icon">🎯</div>
              <div>
                <div class="feature-name">Sensitivity</div>
                <div class="feature-desc">Adjust blink detection threshold</div>
              </div>
            </div>

            <div class="feature-item">
              <div class="feature-icon">📷</div>
              <div>
                <div class="feature-name">Camera</div>
                <div class="feature-desc">Choose your camera device</div>
              </div>
            </div>

            <div class="feature-item">
              <div class="feature-icon">🎨</div>
              <div>
                <div class="feature-name">Appearance</div>
                <div class="feature-desc">Custom colors and themes</div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Sidebar -->
      <div class="settings-sidebar">
        <div class="sidebar-card">
          <div class="sidebar-header">
            <h4>Quick Tips</h4>
          </div>
          <ul class="tips-list">
            <li>
              <span class="tip-icon">✓</span>
              <span>Your name appears on the global leaderboard</span>
            </li>
            <li>
              <span class="tip-icon">✓</span>
              <span>Changes are instant - no re-sign in needed</span>
            </li>
            <li>
              <span class="tip-icon">✓</span>
              <span>All stats and scores are preserved</span>
            </li>
            <li>
              <span class="tip-icon">✓</span>
              <span>Your rank updates automatically</span>
            </li>
          </ul>
        </div>

        <div class="sidebar-card highlight-card">
          <div class="highlight-text">
            <span class="highlight-icon">⚡</span>
            <span>Want to improve your rank? Keep practicing to beat your best time!</span>
          </div>
        </div>
      </div>
    </div>
  </div>
</div>

<style>
  .settings-page {
    min-height: 100vh;
    display: flex;
    flex-direction: column;
    background: #0a0a0a;
  }

  .content {
    flex: 1;
    max-width: 1200px;
    width: 100%;
    margin: 0 auto;
    padding: 2rem;
    padding-top: 6rem;
  }

  .page-header {
    display: flex;
    align-items: center;
    gap: 1.5rem;
    margin-bottom: 2rem;
  }

  .back-btn {
    display: flex;
    align-items: center;
    justify-content: center;
    background: rgba(255, 255, 255, 0.05);
    border: 1px solid rgba(255, 255, 255, 0.1);
    border-radius: 10px;
    color: #fff;
    padding: 0.6rem;
    cursor: pointer;
    transition: all 0.2s ease;
    width: 40px;
    height: 40px;
  }

  .back-btn:hover {
    background: rgba(255, 255, 255, 0.1);
    transform: translateX(-2px);
  }

  .header-text h1 {
    font-size: 2.5rem;
    font-weight: 700;
    margin: 0;
    background: linear-gradient(135deg, #00ff88 0%, #00ccff 100%);
    -webkit-background-clip: text;
    -webkit-text-fill-color: transparent;
    background-clip: text;
  }

  .header-text p {
    font-size: 1rem;
    color: #888;
    margin: 0;
  }

  .settings-layout {
    display: grid;
    grid-template-columns: 1fr 320px;
    gap: 2rem;
  }

  @media (max-width: 900px) {
    .settings-layout {
      grid-template-columns: 1fr;
    }
  }

  .settings-main {
    display: flex;
    flex-direction: column;
    gap: 1.5rem;
  }

  .settings-card {
    background: rgba(255, 255, 255, 0.02);
    border: 1px solid rgba(255, 255, 255, 0.08);
    border-radius: 16px;
    overflow: hidden;
  }

  .featured-card {
    background: rgba(255, 255, 255, 0.03);
    border: 2px solid rgba(0, 255, 136, 0.15);
  }

  .card-banner {
    display: flex;
    align-items: center;
    gap: 1rem;
    padding: 1.5rem 2rem;
    background: linear-gradient(135deg, rgba(0, 255, 136, 0.08) 0%, rgba(0, 204, 255, 0.08) 100%);
    border-bottom: 1px solid rgba(0, 255, 136, 0.1);
  }

  .banner-icon {
    display: flex;
    align-items: center;
    justify-content: center;
    width: 52px;
    height: 52px;
    background: linear-gradient(135deg, #00ff88 0%, #00ccff 100%);
    border-radius: 12px;
    color: #0a0a0a;
  }

  .banner-text h2 {
    font-size: 1.2rem;
    font-weight: 600;
    margin: 0 0 0.25rem 0;
    color: #fff;
  }

  .banner-text p {
    font-size: 0.85rem;
    color: #888;
    margin: 0;
  }

  .card-content {
    padding: 2rem;
  }

  .current-display {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 1rem 1.25rem;
    background: rgba(0, 255, 136, 0.05);
    border: 1px solid rgba(0, 255, 136, 0.1);
    border-radius: 10px;
    margin-bottom: 1.5rem;
  }

  .display-label {
    font-size: 0.8rem;
    color: #888;
    text-transform: uppercase;
    letter-spacing: 0.08em;
    font-weight: 600;
  }

  .display-value {
    font-size: 1.1rem;
    font-weight: 600;
    color: #00ff88;
  }

  .input-group {
    display: flex;
    gap: 1rem;
    margin-bottom: 1rem;
  }

  .input-group input {
    flex: 1;
    padding: 1rem 1.25rem;
    background: rgba(255, 255, 255, 0.05);
    border: 2px solid rgba(255, 255, 255, 0.1);
    border-radius: 10px;
    color: #fff;
    font-size: 1rem;
    transition: all 0.2s ease;
  }

  .input-group input:focus {
    outline: none;
    border-color: #00ff88;
    background: rgba(255, 255, 255, 0.08);
  }

  .input-group input:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }

  .input-group input::placeholder {
    color: #666;
  }

  .save-button {
    display: flex;
    align-items: center;
    gap: 0.5rem;
    padding: 1rem 1.75rem;
    background: linear-gradient(135deg, #00ff88 0%, #00ccff 100%);
    border: none;
    border-radius: 10px;
    color: #0a0a0a;
    font-size: 0.95rem;
    font-weight: 600;
    cursor: pointer;
    transition: all 0.2s ease;
    white-space: nowrap;
  }

  .save-button:hover:not(:disabled) {
    transform: translateY(-1px);
    box-shadow: 0 4px 15px rgba(0, 255, 136, 0.3);
  }

  .save-button:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }

  .save-button.loading {
    opacity: 0.7;
  }

  .input-hint {
    display: flex;
    align-items: center;
    gap: 0.5rem;
    font-size: 0.8rem;
    color: #888;
  }

  .status-message {
    display: flex;
    align-items: center;
    gap: 0.75rem;
    padding: 0.85rem 1.25rem;
    border-radius: 8px;
    font-size: 0.9rem;
    font-weight: 500;
  }

  .status-message.success {
    background: rgba(0, 255, 136, 0.1);
    border: 1px solid rgba(0, 255, 136, 0.2);
    color: #00ff88;
  }

  .status-message.error {
    background: rgba(255, 71, 87, 0.1);
    border: 1px solid rgba(255, 71, 87, 0.2);
    color: #ff4757;
  }

  .status-icon {
    flex-shrink: 0;
  }

  .card-header {
    display: flex;
    align-items: center;
    gap: 0.75rem;
    padding: 1.5rem 2rem;
    border-bottom: 1px solid rgba(255, 255, 255, 0.05);
  }

  .header-icon {
    display: flex;
    align-items: center;
    justify-content: center;
    width: 40px;
    height: 40px;
    background: rgba(0, 255, 136, 0.1);
    border-radius: 10px;
    color: #00ff88;
  }

  .header-icon-accent {
    background: rgba(0, 204, 255, 0.1);
    color: #00ccff;
  }

  .card-header h3 {
    font-size: 1.1rem;
    font-weight: 600;
    margin: 0;
    color: #fff;
  }

  .info-list {
    padding: 1.5rem 2rem;
    display: flex;
    flex-direction: column;
    gap: 0.75rem;
  }

  .info-row {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 0.85rem 1rem;
    background: rgba(255, 255, 255, 0.02);
    border-radius: 8px;
  }

  .info-key {
    font-size: 0.9rem;
    color: #888;
  }

  .info-val {
    font-size: 0.95rem;
    font-weight: 500;
    color: #00ccff;
  }

  .info-val.tag {
    padding: 0.3rem 0.75rem;
    background: rgba(0, 204, 255, 0.1);
    border-radius: 6px;
    font-size: 0.85rem;
  }

  .coming-soon-card {
    opacity: 0.7;
  }

  .feature-grid {
    padding: 1.5rem 2rem;
    display: grid;
    grid-template-columns: repeat(2, 1fr);
    gap: 1rem;
  }

  @media (max-width: 600px) {
    .feature-grid {
      grid-template-columns: 1fr;
    }
  }

  .feature-item {
    display: flex;
    align-items: center;
    gap: 1rem;
    padding: 1rem;
    background: rgba(255, 255, 255, 0.02);
    border-radius: 10px;
  }

  .feature-icon {
    font-size: 1.5rem;
  }

  .feature-name {
    font-size: 0.9rem;
    font-weight: 500;
    color: #fff;
    margin-bottom: 0.2rem;
  }

  .feature-desc {
    font-size: 0.75rem;
    color: #888;
  }

  .settings-sidebar {
    display: flex;
    flex-direction: column;
    gap: 1rem;
  }

  .sidebar-card {
    background: rgba(255, 255, 255, 0.02);
    border: 1px solid rgba(255, 255, 255, 0.08);
    border-radius: 12px;
    padding: 1.25rem;
  }

  .sidebar-header h4 {
    font-size: 0.95rem;
    font-weight: 600;
    margin: 0 0 1rem 0;
    color: #00ff88;
  }

  .tips-list {
    list-style: none;
    padding: 0;
    margin: 0;
    display: flex;
    flex-direction: column;
    gap: 0.75rem;
  }

  .tips-list li {
    display: flex;
    align-items: flex-start;
    gap: 0.75rem;
    font-size: 0.85rem;
    color: #888;
    line-height: 1.4;
  }

  .tip-icon {
    flex-shrink: 0;
    color: #00ff88;
    font-weight: 700;
  }

  .highlight-card {
    background: linear-gradient(135deg, rgba(0, 255, 136, 0.05) 0%, rgba(0, 204, 255, 0.05) 100%);
    border-color: rgba(0, 255, 136, 0.15);
  }

  .highlight-text {
    display: flex;
    align-items: flex-start;
    gap: 0.75rem;
    font-size: 0.85rem;
    color: #fff;
    line-height: 1.4;
  }

  .highlight-icon {
    flex-shrink: 0;
  }
</style>
