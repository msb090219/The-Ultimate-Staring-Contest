<script>
  import ShareableImage from './ShareableImage.svelte';

  export let gamesPlayed = 0;
  export let bestTime = 0;
  export let globalRank = null;
  export let percentile = 0;
  export let playerName = 'Player';

  let showShareMenu = false;

  const shareMessages = [
    `I just survived ${bestTime.toFixed(2)}s in The Ultimate Staring Competition! Think you can beat me?`,
    `My best time is ${bestTime.toFixed(2)}s in The Ultimate Staring Competition! Can you stare longer?`,
    `Just hit ${bestTime.toFixed(2)}s in the staring contest! My rank: #${globalRank || 'N/A'} - try to beat my record!`,
    `I've played ${gamesPlayed} games and my best stare time is ${bestTime.toFixed(2)}s! Can you do better?`
  ];

  function generateShareText() {
    const message = shareMessages[Math.floor(Math.random() * shareMessages.length)];
    return `${message}\n\nPlay now: https://theultimatestaringcontest.com`;
  }

  function shareOnTwitter() {
    const text = encodeURIComponent(generateShareText());
    const url = `https://twitter.com/intent/tweet?text=${text}`;
    window.open(url, '_blank', 'width=550,height=420');
  }

  function shareOnFacebook() {
    const url = encodeURIComponent('https://theultimatestaringcontest.com');
    const fbUrl = `https://www.facebook.com/sharer/sharer.php?u=${url}`;
    window.open(fbUrl, '_blank', 'width=550,height=420');
  }

  function copyToClipboard() {
    const text = generateShareText();
    navigator.clipboard.writeText(text).then(() => {
      alert('Stats copied to clipboard!');
    });
  }

  function toggleShareMenu() {
    showShareMenu = !showShareMenu;
  }
</script>

<div class="share-stats-container">
  <button class="share-stats-btn" on:click={toggleShareMenu}>
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
      <path d="M4 12v8a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-8"/>
      <polyline points="16 6 12 2 8 6"/>
      <line x1="12" y1="2" x2="12" y2="15"/>
    </svg>
    Share Stats
  </button>

  {#if showShareMenu}
    <div class="share-menu">
      <div class="share-header">Share your achievements</div>

      <ShareableImage
        playerName={playerName}
        bestTime={bestTime}
        globalRank={globalRank}
        percentile={percentile}
      />

      <div class="share-options">
        <button class="share-option" on:click={shareOnTwitter}>
          <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
            <path d="M23 3a10.9 10.9 0 0 1-3.14 1.53 4.48 4.48 0 0 0-7.86 3v1A10.66 10.66 0 0 1 3 4s-4 9 5 13a11.64 11.64 0 0 1-7 2c9 5 20 0 20-11.5a4.5 4.5 0 0 0-.08-.83A7.72 7.72 0 0 0 23 3z"/>
          </svg>
          Twitter
        </button>

        <button class="share-option" on:click={shareOnFacebook}>
          <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
            <path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z"/>
          </svg>
          Facebook
        </button>

        <button class="share-option" on:click={copyToClipboard}>
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <rect x="9" y="9" width="13" height="13" rx="2" ry="2"/>
            <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"/>
          </svg>
          Copy Link
        </button>
      </div>
    </div>
  {/if}
</div>

<style>
  .share-stats-container {
    position: relative;
  }

  .share-stats-btn {
    display: flex;
    align-items: center;
    gap: 0.5rem;
    padding: 0.75rem 1.5rem;
    background: linear-gradient(135deg, rgba(0, 255, 136, 0.1) 0%, rgba(0, 204, 255, 0.1) 100%);
    border: 2px solid rgba(0, 255, 136, 0.3);
    border-radius: 8px;
    color: #00ff88;
    font-size: 0.9rem;
    font-weight: 600;
    cursor: pointer;
    transition: all 0.2s ease;
  }

  .share-stats-btn:hover {
    background: linear-gradient(135deg, rgba(0, 255, 136, 0.2) 0%, rgba(0, 204, 255, 0.2) 100%);
    border-color: rgba(0, 255, 136, 0.5);
    transform: translateY(-1px);
  }

  .share-menu {
    position: absolute;
    top: calc(100% + 0.5rem);
    right: 0;
    background: rgba(26, 26, 46, 0.98);
    border: 2px solid rgba(255, 255, 255, 0.1);
    border-radius: 12px;
    padding: 1rem;
    min-width: 650px;
    max-width: 650px;
    z-index: 1000;
    box-shadow: 0 10px 40px rgba(0, 0, 0, 0.5);
    backdrop-filter: blur(10px);
  }

  .share-header {
    font-size: 0.9rem;
    font-weight: 600;
    color: #fff;
    padding: 0.5rem;
    margin-bottom: 1rem;
    text-align: center;
  }

  .share-options {
    display: flex;
    flex-direction: column;
    gap: 0.25rem;
  }

  .share-option {
    display: flex;
    align-items: center;
    gap: 0.75rem;
    padding: 0.75rem;
    background: none;
    border: none;
    border-radius: 8px;
    color: #fff;
    font-size: 0.9rem;
    cursor: pointer;
    transition: background 0.2s ease;
    text-align: left;
  }

  .share-option:hover {
    background: rgba(255, 255, 255, 0.05);
  }

  .share-option svg {
    flex-shrink: 0;
  }
</style>
