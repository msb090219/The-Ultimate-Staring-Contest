<script>
  import { onMount } from 'svelte';
  import { gameState } from '../../stores/gameState.js';
  import { authState } from '../../stores/authState.js';
  import { supabaseService } from '../../services/supabase.js';
  import { getRank } from '../../lib/utils/rank.js';
  import { Trophy, Gamepad2, Award, TrendingUp, Calendar, Target, ArrowLeft } from 'lucide-svelte';
  import Navbar from '../start/Navbar.svelte';

  let userStats = null;
  let userScores = [];
  let loading = true;
  let error = null;

  onMount(async () => {
    if (!$authState.isAuthenticated) {
      gameState.setPhase('landing');
      return;
    }

    await loadUserStats();
    await loadUserScores();
  });

  async function loadUserStats() {
    loading = true;
    const result = await supabaseService.getUserProfile($authState.user.id);
    if (result.success) {
      userStats = result.data;
    } else {
      error = result.error;
    }
    loading = false;
  }

  async function loadUserScores() {
    const result = await supabaseService.getUserBestScore($authState.user.id);
    if (result.success && result.data) {
      userScores = [result.data];
    }
  }

  function handleBack() {
    gameState.setPhase('start');
  }

  function getRankForTime(time) {
    if (!time) return 'No games played yet';
    return getRank(time);
  }

  function getRankColor(time) {
    if (!time) return '#888';
    const rank = getRankForTime(time);
    if (rank.includes('Human') || rank.includes('Villain')) return '#ffd700';
    if (rank.includes('Suspiciously')) return '#00ccff';
    return '#00ff88';
  }
</script>

<div class="profile-page">
  <Navbar />

  <div class="content">
    <div class="page-header">
      <button class="back-btn" on:click={handleBack}>
        <ArrowLeft size={20} />
      </button>
      <h1>Your Stats</h1>
    </div>

    {#if loading}
      <div class="loading-state">
        <div class="spinner"></div>
        <p>Loading your stats...</p>
      </div>
    {:else if error}
      <div class="error-state">
        <p>Failed to load stats: {error}</p>
      </div>
    {:else}
      <!-- Profile Banner -->
      <div class="profile-banner">
        <div class="avatar-large">
          <span class="avatar-initials">
            {$authState.user?.game_name?.substring(0, 2).toUpperCase() || 'YO'}
          </span>
        </div>
        <div class="profile-info">
          <h2>{$authState.user?.game_name || 'Player'}</h2>
          <p class="email">{$authState.user?.email || ''}</p>
        </div>
      </div>

      <!-- Main Stats -->
      <div class="stats-section">
        <h3 class="section-title">Performance</h3>

        <div class="stats-grid">
          <!-- Best Time Card -->
          <div class="stat-card stat-card-large">
            <div class="stat-header">
              <div class="stat-icon stat-icon-primary">
                <Trophy size={32} />
              </div>
              <span class="stat-label">Best Time</span>
            </div>
            <div class="stat-value-large">
              {userStats?.best_time ? userStats.best_time.toFixed(2) : '--'}
            </div>
            {#if userStats?.best_time}
              <div class="stat-rank-badge" style="background: {getRankColor(userStats.best_time)}33; color: {getRankColor(userStats.best_time)}">
                {getRankForTime(userStats.best_time)}
              </div>
            {:else}
              <div class="stat-placeholder">No games yet</div>
            {/if}
          </div>

          <!-- Games Played Card -->
          <div class="stat-card">
            <div class="stat-icon stat-icon-secondary">
              <Gamepad2 size={28} />
            </div>
            <div class="stat-value">{userStats?.games_played || 0}</div>
            <div class="stat-label">Games Played</div>
          </div>

          <!-- Rank Card -->
          <div class="stat-card">
            <div class="stat-icon stat-icon-accent">
              <Target size={28} />
            </div>
            <div class="stat-value-small">
              {#if userStats?.best_time}
                {getRankForTime(userStats.best_time)}
              {:else}
                --
              {/if}
            </div>
            <div class="stat-label">Current Rank</div>
          </div>
        </div>
      </div>

      <!-- Recent Achievement -->
      {#if userScores.length > 0}
        <div class="achievement-section">
          <h3 class="section-title">Latest Achievement</h3>
          <div class="achievement-card">
            <div class="achievement-icon">
              <TrendingUp size={36} />
            </div>
            <div class="achievement-info">
              <h4>Personal Best</h4>
              <div class="achievement-stats">
                <div class="achievement-stat">
                  <span class="achievement-value">{userScores[0].time_seconds.toFixed(2)}s</span>
                  <span class="achievement-label">Your Best</span>
                </div>
                <div class="achievement-divider"></div>
                <div class="achievement-stat">
                  <span class="achievement-value">
                    <Calendar size={14} style="display: inline; vertical-align: middle;" />
                    {new Date(userScores[0].created_at).toLocaleDateString()}
                  </span>
                  <span class="achievement-label">Achieved</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      {/if}

      <!-- Empty State -->
      {#if !userStats?.best_time}
        <div class="empty-state">
          <Target size={64} />
          <h3>No games played yet</h3>
          <p>Complete your first game to see your stats here!</p>
          <button on:click={handleBack}>Start Playing</button>
        </div>
      {/if}
    {/if}
  </div>
</div>

<style>
  .profile-page {
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
    margin-bottom: 2.5rem;
  }

  .page-header h1 {
    font-size: 2.5rem;
    font-weight: 700;
    margin: 0;
    background: linear-gradient(135deg, #00ff88 0%, #00ccff 100%);
    -webkit-background-clip: text;
    -webkit-text-fill-color: transparent;
    background-clip: text;
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

  .loading-state, .error-state {
    text-align: center;
    padding: 4rem 2rem;
  }

  .spinner {
    width: 50px;
    height: 50px;
    margin: 0 auto 1.5rem;
    border: 3px solid rgba(0, 255, 136, 0.1);
    border-top-color: #00ff88;
    border-radius: 50%;
    animation: spin 1s linear infinite;
  }

  @keyframes spin {
    to { transform: rotate(360deg); }
  }

  .loading-state p {
    color: #888;
    font-size: 1.1rem;
  }

  .error-state {
    color: #ff4757;
  }

  .profile-banner {
    display: flex;
    align-items: center;
    gap: 2rem;
    padding: 2.5rem;
    background: linear-gradient(135deg, rgba(0, 255, 136, 0.05) 0%, rgba(0, 204, 255, 0.05) 100%);
    border: 2px solid rgba(255, 255, 255, 0.1);
    border-radius: 20px;
    margin-bottom: 2.5rem;
  }

  .avatar-large {
    flex-shrink: 0;
  }

  .avatar-initials {
    display: flex;
    align-items: center;
    justify-content: center;
    width: 120px;
    height: 120px;
    background: linear-gradient(135deg, #00ff88 0%, #00ccff 100%);
    border-radius: 50%;
    font-size: 2.5rem;
    font-weight: 700;
    color: #0a0a0a;
    box-shadow: 0 10px 30px rgba(0, 255, 136, 0.3);
  }

  .profile-info h2 {
    font-size: 2rem;
    font-weight: 700;
    margin: 0 0 0.5rem 0;
    color: #fff;
  }

  .email {
    color: #888;
    font-size: 1rem;
    margin: 0;
  }

  .section-title {
    font-size: 1.3rem;
    font-weight: 600;
    margin: 0 0 1.5rem 0;
    color: #fff;
  }

  .stats-section, .achievement-section {
    margin-bottom: 2.5rem;
  }

  .stats-grid {
    display: grid;
    grid-template-columns: 2fr 1fr 1fr;
    gap: 1.5rem;
  }

  @media (max-width: 900px) {
    .stats-grid {
      grid-template-columns: 1fr;
    }
  }

  .stat-card {
    background: rgba(255, 255, 255, 0.03);
    border: 2px solid rgba(255, 255, 255, 0.08);
    border-radius: 16px;
    padding: 2rem;
    transition: all 0.3s ease;
  }

  .stat-card:hover {
    background: rgba(255, 255, 255, 0.05);
    border-color: rgba(0, 255, 136, 0.2);
    transform: translateY(-2px);
  }

  .stat-card-large {
    display: flex;
    flex-direction: column;
    justify-content: space-between;
  }

  .stat-header {
    display: flex;
    align-items: center;
    gap: 1rem;
    margin-bottom: 1.5rem;
  }

  .stat-icon {
    display: flex;
    align-items: center;
    justify-content: center;
    width: 56px;
    height: 56px;
    border-radius: 12px;
  }

  .stat-icon-primary {
    background: linear-gradient(135deg, #00ff88 0%, #00ccff 100%);
    color: #0a0a0a;
  }

  .stat-icon-secondary {
    background: rgba(0, 255, 136, 0.1);
    color: #00ff88;
  }

  .stat-icon-accent {
    background: rgba(0, 204, 255, 0.1);
    color: #00ccff;
  }

  .stat-label {
    font-size: 0.85rem;
    color: #888;
    text-transform: uppercase;
    letter-spacing: 0.08em;
    font-weight: 600;
  }

  .stat-value {
    font-size: 3rem;
    font-weight: 700;
    color: #00ff88;
    line-height: 1;
  }

  .stat-value-large {
    font-size: 4rem;
    font-weight: 700;
    color: #00ff88;
    line-height: 1;
    margin-bottom: 1rem;
  }

  .stat-value-small {
    font-size: 1.5rem;
    font-weight: 600;
    color: #00ccff;
    line-height: 1.4;
  }

  .stat-rank-badge {
    display: inline-block;
    padding: 0.5rem 1rem;
    border-radius: 8px;
    font-size: 0.9rem;
    font-weight: 600;
  }

  .stat-placeholder {
    color: #888;
    font-size: 1rem;
  }

  .achievement-card {
    display: flex;
    align-items: center;
    gap: 2rem;
    padding: 2rem;
    background: linear-gradient(135deg, rgba(0, 255, 136, 0.05) 0%, rgba(0, 204, 255, 0.05) 100%);
    border: 2px solid rgba(255, 255, 255, 0.1);
    border-radius: 16px;
  }

  .achievement-icon {
    flex-shrink: 0;
    display: flex;
    align-items: center;
    justify-content: center;
    width: 80px;
    height: 80px;
    background: linear-gradient(135deg, #00ff88 0%, #00ccff 100%);
    border-radius: 16px;
    color: #0a0a0a;
  }

  .achievement-info {
    flex: 1;
  }

  .achievement-info h4 {
    font-size: 1.3rem;
    font-weight: 600;
    margin: 0 0 1rem 0;
    color: #fff;
  }

  .achievement-stats {
    display: flex;
    align-items: center;
    gap: 2rem;
  }

  .achievement-stat {
    display: flex;
    flex-direction: column;
    gap: 0.25rem;
  }

  .achievement-value {
    font-size: 1.5rem;
    font-weight: 700;
    color: #00ff88;
  }

  .achievement-label {
    font-size: 0.85rem;
    color: #888;
  }

  .achievement-divider {
    width: 1px;
    height: 40px;
    background: rgba(255, 255, 255, 0.1);
  }

  .empty-state {
    text-align: center;
    padding: 4rem 2rem;
    background: rgba(255, 255, 255, 0.03);
    border: 2px dashed rgba(255, 255, 255, 0.1);
    border-radius: 20px;
  }

  .empty-state > * {
    margin: 0 0 1rem 0;
  }

  .empty-state h3 {
    font-size: 1.5rem;
    font-weight: 600;
    color: #fff;
    margin-bottom: 0.5rem;
  }

  .empty-state p {
    color: #888;
    font-size: 1.1rem;
    margin-bottom: 1.5rem;
  }

  .empty-state button {
    padding: 1rem 2rem;
    background: linear-gradient(135deg, #00ff88 0%, #00ccff 100%);
    border: none;
    border-radius: 12px;
    color: #0a0a0a;
    font-size: 1rem;
    font-weight: 600;
    cursor: pointer;
    transition: all 0.2s ease;
  }

  .empty-state button:hover {
    transform: scale(1.05);
    box-shadow: 0 10px 25px rgba(0, 255, 136, 0.3);
  }
</style>
