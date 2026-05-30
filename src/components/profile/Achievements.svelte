<script>
  import {
    Gamepad2,
    Target,
    Award,
    Trophy,
    Eye,
    Flame,
    Zap,
    Bot,
    Star,
    Crown,
    Medal
  } from 'lucide-svelte';

  export let games = [];
  export let bestTime = 0;
  export let globalRank = null;

  const iconComponents = {
    Gamepad: Gamepad2,
    Target,
    Award,
    Trophy,
    Eye,
    Flame,
    Zap,
    Bot,
    Star,
    Crown,
    Medal
  };

  const achievements = [
    {
      id: 'first_game',
      title: 'First Steps',
      description: 'Complete your first game',
      icon: 'Gamepad',
      condition: (stats) => stats.gamesPlayed >= 1,
      category: 'milestone'
    },
    {
      id: 'games_5',
      title: 'Getting Started',
      description: 'Play 5 games',
      icon: 'Target',
      condition: (stats) => stats.gamesPlayed >= 5,
      category: 'milestone'
    },
    {
      id: 'games_10',
      title: 'Dedicated Player',
      description: 'Play 10 games',
      icon: 'Award',
      condition: (stats) => stats.gamesPlayed >= 10,
      category: 'milestone'
    },
    {
      id: 'games_25',
      title: 'Staring Veteran',
      description: 'Play 25 games',
      icon: 'Trophy',
      condition: (stats) => stats.gamesPlayed >= 25,
      category: 'milestone'
    },
    {
      id: 'time_10',
      title: 'Focused Gaze',
      description: 'Reach 10 seconds',
      icon: 'Eye',
      condition: (stats) => stats.bestTime >= 10,
      category: 'performance'
    },
    {
      id: 'time_15',
      title: 'Villain Energy',
      description: 'Reach 15 seconds',
      icon: 'Flame',
      condition: (stats) => stats.bestTime >= 15,
      category: 'performance'
    },
    {
      id: 'time_25',
      title: 'Superhuman',
      description: 'Reach 25 seconds',
      icon: 'Zap',
      condition: (stats) => stats.bestTime >= 25,
      category: 'performance'
    },
    {
      id: 'time_30',
      title: 'Probably Not Human',
      description: 'Reach 30 seconds',
      icon: 'Bot',
      condition: (stats) => stats.bestTime >= 30,
      category: 'performance'
    },
    {
      id: 'top_100',
      title: 'Elite Stare-er',
      description: 'Reach top 100 global rank',
      icon: 'Star',
      condition: (stats) => stats.globalRank && stats.globalRank <= 100,
      category: 'rank'
    },
    {
      id: 'top_50',
      title: 'Legendary Focus',
      description: 'Reach top 50 global rank',
      icon: 'Crown',
      condition: (stats) => stats.globalRank && stats.globalRank <= 50,
      category: 'rank'
    },
    {
      id: 'top_10',
      title: 'Staring Champion',
      description: 'Reach top 10 global rank',
      icon: 'Medal',
      condition: (stats) => stats.globalRank && stats.globalRank <= 10,
      category: 'rank'
    }
  ];

  $: unlockedAchievements = achievements.filter(achievement =>
    achievement.condition({
      gamesPlayed: games.length,
      bestTime,
      globalRank
    })
  );

  $: lockedAchievements = achievements.filter(achievement =>
    !achievement.condition({
      gamesPlayed: games.length,
      bestTime,
      globalRank
    })
  );

  $: milestoneAchievements = unlockedAchievements.filter(a => a.category === 'milestone');
  $: performanceAchievements = unlockedAchievements.filter(a => a.category === 'performance');
  $: rankAchievements = unlockedAchievements.filter(a => a.category === 'rank');

  function getIconComponent(iconName) {
    return iconComponents[iconName] || Award;
  }
</script>

<div class="achievements-container">
  {#if unlockedAchievements.length === 0}
    <div class="achievements-empty">
      <Target size={48} class="empty-icon" />
      <h3>No achievements yet</h3>
      <p>Start playing to unlock achievements!</p>
    </div>
  {:else}
    <div class="achievements-overview">
      <div class="achievement-stat">
        <div class="achievement-value">{unlockedAchievements.length}</div>
        <div class="achievement-label">Unlocked</div>
      </div>
      <div class="achievement-stat">
        <div class="achievement-value">{achievements.length}</div>
        <div class="achievement-label">Total</div>
      </div>
    </div>

    {#if milestoneAchievements.length > 0}
      <div class="achievement-category">
        <h4>Milestones</h4>
        <div class="achievement-grid">
          {#each milestoneAchievements as achievement}
            {@const IconComponent = getIconComponent(achievement.icon)}
            <div class="achievement-card achievement-unlocked">
              <div class="achievement-icon">
                <IconComponent size={20} />
              </div>
              <div class="achievement-info">
                <div class="achievement-title">{achievement.title}</div>
                <div class="achievement-desc">{achievement.description}</div>
              </div>
            </div>
          {/each}
        </div>
      </div>
    {/if}

    {#if performanceAchievements.length > 0}
      <div class="achievement-category">
        <h4>Performance</h4>
        <div class="achievement-grid">
          {#each performanceAchievements as achievement}
            {@const IconComponent = getIconComponent(achievement.icon)}
            <div class="achievement-card achievement-unlocked">
              <div class="achievement-icon">
                <IconComponent size={20} />
              </div>
              <div class="achievement-info">
                <div class="achievement-title">{achievement.title}</div>
                <div class="achievement-desc">{achievement.description}</div>
              </div>
            </div>
          {/each}
        </div>
      </div>
    {/if}

    {#if rankAchievements.length > 0}
      <div class="achievement-category">
        <h4>Rank Achievements</h4>
        <div class="achievement-grid">
          {#each rankAchievements as achievement}
            {@const IconComponent = getIconComponent(achievement.icon)}
            <div class="achievement-card achievement-unlocked">
              <div class="achievement-icon">
                <IconComponent size={20} />
              </div>
              <div class="achievement-info">
                <div class="achievement-title">{achievement.title}</div>
                <div class="achievement-desc">{achievement.description}</div>
              </div>
            </div>
          {/each}
        </div>
      </div>
    {/if}
  {/if}
</div>

<style>
  .achievements-container {
    width: 100%;
  }

  .achievements-empty {
    text-align: center;
    padding: 2rem;
    background: rgba(255, 255, 255, 0.02);
    border: 2px dashed rgba(255, 255, 255, 0.1);
    border-radius: 12px;
  }

  .empty-icon {
    color: #00ff88;
    margin-bottom: 1rem;
  }

  .achievements-empty h3 {
    font-size: 1.1rem;
    color: #fff;
    margin: 0 0 0.5rem 0;
  }

  .achievements-empty p {
    color: #888;
    margin: 0;
  }

  .achievements-overview {
    display: flex;
    gap: 2rem;
    margin-bottom: 1.5rem;
  }

  .achievement-stat {
    text-align: center;
  }

  .achievement-stat .achievement-value {
    font-size: 1.5rem;
    font-weight: 700;
    color: #00ff88;
  }

  .achievement-stat .achievement-label {
    font-size: 0.85rem;
    color: #888;
  }

  .achievement-category {
    margin-bottom: 2rem;
  }

  .achievement-category h4 {
    font-size: 1rem;
    color: #fff;
    margin: 0 0 0.75rem 0;
  }

  .achievement-grid {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
    gap: 1rem;
  }

  .achievement-card {
    display: flex;
    align-items: center;
    gap: 0.75rem;
    padding: 0.75rem 1rem;
    background: rgba(255, 255, 255, 0.03);
    border: 2px solid rgba(255, 255, 255, 0.08);
    border-radius: 8px;
    transition: all 0.3s ease;
  }

  .achievement-card:hover {
    background: rgba(255, 255, 255, 0.05);
    transform: translateY(-2px);
  }

  .achievement-unlocked {
    border-color: rgba(0, 255, 136, 0.2);
    background: rgba(0, 255, 136, 0.02);
  }

  .achievement-locked {
    opacity: 0.5;
    border-color: rgba(255, 255, 255, 0.05);
  }

  .achievement-icon {
    flex-shrink: 0;
    width: 36px;
    height: 36px;
    display: flex;
    align-items: center;
    justify-content: center;
    background: rgba(0, 255, 136, 0.1);
    border-radius: 8px;
    color: #00ff88;
  }

  .achievement-locked .achievement-icon {
    background: rgba(255, 255, 255, 0.05);
    color: #888;
  }

  .achievement-info {
    flex: 1;
  }

  .achievement-title {
    font-weight: 600;
    color: #fff;
    margin-bottom: 0.25rem;
    font-size: 0.9rem;
  }

  .achievement-desc {
    font-size: 0.8rem;
    color: #888;
  }

  @media (max-width: 600px) {
    .achievement-grid {
      grid-template-columns: 1fr;
    }

    .achievements-overview {
      justify-content: center;
    }
  }
</style>
