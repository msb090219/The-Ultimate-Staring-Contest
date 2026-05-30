<script>
  import { authState } from '../../stores/authState.js';
  import { gameState } from '../../stores/gameState.js';
  import { authService } from '../../services/auth.js';
  import { BarChart3, LogOut } from 'lucide-svelte';

  export let onSignIn = () => {};
  export let inCalibration = false;

  let showUserMenu = false;

  function toggleUserMenu() {
    showUserMenu = !showUserMenu;
  }

  function closeUserMenu() {
    showUserMenu = false;
  }

  function goToProfile() {
    gameState.setPhase('profile');
    closeUserMenu();
  }
</script>

<nav class="navbar">
  <div class="navbar-content">
    <div class="navbar-left">
      <a href="/" class="logo-link">
        <img src="/favicon.svg" alt="The Ultimate Staring Competition" class="logo-icon" />
        <span class="logo-text">The Ultimate Staring Competition</span>
      </a>
    </div>

    <div class="navbar-right">
      <!-- Sign in or user menu -->
      {#if !$authState.isAuthenticated}
        <button class="sign-in-btn" on:click={onSignIn}>
          Sign In
        </button>
      {:else}
        <div class="user-section">
          <button class="user-menu-btn" on:click={toggleUserMenu}>
            <span class="user-avatar">
              {$authState.user?.game_name?.substring(0, 2).toUpperCase() || 'YO'}
            </span>
          </button>

          {#if showUserMenu}
            <div class="user-dropdown">
              <div class="user-info">
                <span class="user-name">{$authState.user?.game_name || 'Player'}</span>
                <span class="user-email">{$authState.user?.email || ''}</span>
              </div>
              <div class="dropdown-divider"></div>
              <button class="dropdown-item" on:click={goToProfile}>
                <BarChart3 size={18} class="dropdown-icon" />
                Stats
              </button>
              <div class="dropdown-divider"></div>
              <button class="dropdown-item dropdown-danger" on:click={() => authService.signOut()}>
                <LogOut size={18} class="dropdown-icon" />
                Sign Out
              </button>
            </div>
          {/if}
        </div>
      {/if}
    </div>
  </div>

  {#if showUserMenu}
    <div class="dropdown-backdrop" on:click={closeUserMenu}></div>
  {/if}
</nav>

<style>
  .navbar {
    position: fixed;
    top: 0;
    left: 0;
    right: 0;
    z-index: 100;
    padding: 1rem 2rem;
    background: rgba(10, 10, 10, 0.8);
    backdrop-filter: blur(10px);
    border-bottom: 1px solid rgba(255, 255, 255, 0.05);
  }

  .navbar-content {
    display: flex;
    justify-content: space-between;
    align-items: center;
    max-width: 1400px;
    margin: 0 auto;
  }

  .navbar-left {
    display: flex;
    align-items: center;
  }

  .logo-link {
    display: flex;
    align-items: center;
    gap: 0.75rem;
    text-decoration: none;
  }

  .logo-icon {
    width: 40px;
    height: 40px;
    filter: drop-shadow(0 0 8px rgba(0, 255, 136, 0.6));
    transition: transform 0.2s ease, filter 0.2s ease;
  }

  .logo-link:hover .logo-icon {
    transform: scale(1.1);
    filter: drop-shadow(0 0 12px rgba(0, 255, 136, 0.8));
  }

  .logo-text {
    font-size: 1.2rem;
    font-weight: 700;
    background: linear-gradient(135deg, #00ff88 0%, #00ccff 100%);
    -webkit-background-clip: text;
    -webkit-text-fill-color: transparent;
    background-clip: text;
  }

  .navbar-right {
    display: flex;
    align-items: center;
    justify-content: flex-end;
  }

  .sign-in-btn {
    padding: 0.75rem 1.5rem;
    background: rgba(0, 255, 136, 0.1);
    border: 1px solid rgba(0, 255, 136, 0.3);
    border-radius: 8px;
    color: #00ff88;
    font-weight: 600;
    font-size: 0.9rem;
    cursor: pointer;
    transition: all 0.2s ease;
  }

  .sign-in-btn:hover {
    background: rgba(0, 255, 136, 0.2);
    border-color: rgba(0, 255, 136, 0.5);
    transform: translateY(-1px);
  }

  .user-section {
    position: relative;
  }

  .user-menu-btn {
    background: none;
    border: none;
    padding: 0;
    cursor: pointer;
  }

  .user-avatar {
    display: flex;
    align-items: center;
    justify-content: center;
    width: 40px;
    height: 40px;
    background: linear-gradient(135deg, #00ff88 0%, #00ccff 100%);
    border-radius: 50%;
    color: #0a0a0a;
    font-weight: 700;
    font-size: 0.9rem;
    transition: transform 0.2s ease, box-shadow 0.2s ease;
  }

  .user-menu-btn:hover .user-avatar {
    transform: scale(1.05);
    box-shadow: 0 0 15px rgba(0, 255, 136, 0.5);
  }

  .user-dropdown {
    position: absolute;
    top: calc(100% + 0.5rem);
    right: 0;
    background: rgba(26, 26, 46, 0.98);
    border: 2px solid rgba(255, 255, 255, 0.1);
    border-radius: 12px;
    padding: 0.75rem 0;
    min-width: 220px;
    z-index: 1000;
    box-shadow: 0 10px 40px rgba(0, 0, 0, 0.5);
    backdrop-filter: blur(10px);
  }

  .user-info {
    padding: 0.75rem 1rem;
    border-bottom: 1px solid rgba(255, 255, 255, 0.1);
  }

  .user-name {
    display: block;
    font-weight: 600;
    color: #fff;
    font-size: 0.95rem;
  }

  .user-email {
    display: block;
    font-size: 0.85rem;
    color: #888;
    margin-top: 0.25rem;
  }

  .dropdown-divider {
    height: 1px;
    background: rgba(255, 255, 255, 0.1);
    margin: 0.5rem 0;
  }

  .dropdown-item {
    width: 100%;
    padding: 0.75rem 1rem;
    background: none;
    border: none;
    color: #fff;
    font-size: 0.9rem;
    text-align: left;
    cursor: pointer;
    display: flex;
    align-items: center;
    gap: 0.75rem;
    transition: background 0.15s ease;
  }

  .dropdown-item:hover {
    background: rgba(255, 255, 255, 0.05);
  }

  .dropdown-icon {
    color: #00ff88;
  }

  .dropdown-danger {
    color: #ff4757;
  }

  .dropdown-danger:hover {
    background: rgba(255, 71, 87, 0.1);
  }

  .dropdown-danger .dropdown-icon {
    color: #ff4757;
  }

  .dropdown-backdrop {
    position: fixed;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    z-index: 999;
  }

  @media (max-width: 600px) {
    .navbar {
      padding: 1rem;
    }

    .navbar-content {
      gap: 1rem;
    }

    .sign-in-btn {
      padding: 0.6rem 1rem;
      font-size: 0.85rem;
    }
  }
</style>
