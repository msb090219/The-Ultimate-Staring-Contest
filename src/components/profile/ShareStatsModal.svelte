<script>
  import { X, Download, Twitter } from 'lucide-svelte';

  export let isOpen = false;
  export let onClose = () => {};
  export let playerName = 'Player';
  export let bestTime = 0;
  export let globalRank = null;
  export let percentile = 0;

  let canvasElement;
  let ctx;
  let imageUrl = '';
  let copied = false;

  function handleBackdropClick(e) {
    if (e.target === e.currentTarget) {
      onClose();
    }
  }

  function handleBackdropKeydown(e) {
    if (e.key === 'Enter' || e.key === ' ') {
      onClose();
    }
  }

  function handleKeydown(e) {
    if (e.key === 'Escape' && isOpen) {
      onClose();
    }
  }

  $: if (isOpen) {
    generateShareableImage();
    window.addEventListener('keydown', handleKeydown);
  } else {
    window.removeEventListener('keydown', handleKeydown);
  }

  function generateShareableImage() {
    if (!canvasElement) return;

    try {
      ctx = canvasElement.getContext('2d');
      if (!ctx) return;

      const width = 1200;
      const height = 630;
      canvasElement.width = width;
      canvasElement.height = height;

    // Background - dark gradient
    const bgGradient = ctx.createLinearGradient(0, 0, width, height);
    bgGradient.addColorStop(0, '#0d0d0d');
    bgGradient.addColorStop(0.5, '#1a1a1a');
    bgGradient.addColorStop(1, '#0d0d0d');
    ctx.fillStyle = bgGradient;
    ctx.fillRect(0, 0, width, height);

    // Subtle grid pattern
    ctx.strokeStyle = 'rgba(0, 255, 136, 0.03)';
    ctx.lineWidth = 1;
    for (let i = 0; i < width; i += 40) {
      ctx.beginPath();
      ctx.moveTo(i, 0);
      ctx.lineTo(i, height);
      ctx.stroke();
    }
    for (let i = 0; i < height; i += 40) {
      ctx.beginPath();
      ctx.moveTo(0, i);
      ctx.lineTo(width, i);
      ctx.stroke();
    }

    // Header text - game title
    ctx.fillStyle = 'rgba(255, 255, 255, 0.4)';
    ctx.font = '600 14px system-ui, -apple-system, sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText('THE ULTIMATE STARING COMPETITION', width / 2, 45);

    // Main title
    ctx.fillStyle = '#ffffff';
    ctx.font = 'bold 72px system-ui, -apple-system, sans-serif';
    ctx.fillText('MY STATS', width / 2, 110);

    // Accent line
    const accentGradient = ctx.createLinearGradient(width / 2 - 150, 0, width / 2 + 150, 0);
    accentGradient.addColorStop(0, 'rgba(0, 255, 136, 0)');
    accentGradient.addColorStop(0.5, 'rgba(0, 255, 136, 0.8)');
    accentGradient.addColorStop(1, 'rgba(0, 255, 136, 0)');
    ctx.strokeStyle = accentGradient;
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.moveTo(width / 2 - 150, 130);
    ctx.lineTo(width / 2 + 150, 130);
    ctx.stroke();

    // Player name
    ctx.fillStyle = 'rgba(255, 255, 255, 0.6)';
    ctx.font = '600 24px system-ui, -apple-system, sans-serif';
    ctx.fillText(playerName.toUpperCase(), width / 2, 170);

    // Best time card
    const cardY = 200;
    const cardHeight = 180;
    const cardWidth = 500;
    const cardX = (width - cardWidth) / 2;

    // Card background with gradient
    const cardGradient = ctx.createLinearGradient(cardX, cardY, cardX, cardY + cardHeight);
    cardGradient.addColorStop(0, 'rgba(0, 255, 136, 0.08)');
    cardGradient.addColorStop(1, 'rgba(0, 204, 255, 0.08)');
    ctx.fillStyle = cardGradient;
    ctx.strokeStyle = 'rgba(0, 255, 136, 0.3)';
    ctx.lineWidth = 2;
    roundRect(ctx, cardX, cardY, cardWidth, cardHeight, 20);
    ctx.fill();
    ctx.stroke();

    // Best time label
    ctx.fillStyle = 'rgba(255, 255, 255, 0.5)';
    ctx.font = '600 18px system-ui, -apple-system, sans-serif';
    ctx.fillText('PERSONAL BEST', width / 2, cardY + 45);

    // Best time value - large and prominent
    ctx.fillStyle = '#00ff88';
    ctx.font = 'bold 88px system-ui, -apple-system, sans-serif';
    const timeText = bestTime > 0 ? bestTime.toFixed(2) + 's' : '--';
    ctx.fillText(timeText, width / 2, cardY + 125);

    // Rank info (if available)
    let infoY = cardY + cardHeight + 60;
    if (globalRank) {
      ctx.fillStyle = '#ffffff';
      ctx.font = '600 32px system-ui, -apple-system, sans-serif';
      ctx.fillText(`#${globalRank} Global Rank`, width / 2, infoY);

      ctx.fillStyle = 'rgba(255, 255, 255, 0.5)';
      ctx.font = '500 20px system-ui, -apple-system, sans-serif';
      ctx.fillText(`Top ${percentile.toFixed(1)}% of players`, width / 2, infoY + 35);
    }

    // Challenge section
    const challengeY = globalRank ? infoY + 80 : 420;
    ctx.fillStyle = '#00ccff';
    ctx.font = '700 36px system-ui, -apple-system, sans-serif';
    ctx.fillText('THINK YOU CAN BEAT ME?', width / 2, challengeY);

    // CTA
    ctx.fillStyle = 'rgba(255, 255, 255, 0.7)';
    ctx.font = '600 24px system-ui, -apple-system, sans-serif';
    ctx.fillText('Play now and prove it!', width / 2, challengeY + 40);

    // Footer with URL
    const footerY = height - 35;
    ctx.fillStyle = 'rgba(0, 255, 136, 0.6)';
    ctx.font = '600 18px system-ui, -apple-system, sans-serif';
    ctx.fillText('theultimatestaringcontest.com', width / 2, footerY);

    // Convert to image
    imageUrl = canvasElement.toDataURL('image/png');
    } catch (err) {
      console.error('Error generating shareable image:', err);
      imageUrl = '';
    }
  }

  function roundRect(ctx, x, y, width, height, radius) {
    ctx.beginPath();
    ctx.moveTo(x + radius, y);
    ctx.lineTo(x + width - radius, y);
    ctx.quadraticCurveTo(x + width, y, x + width, y + radius);
    ctx.lineTo(x + width, y + height - radius);
    ctx.quadraticCurveTo(x + width, y + height, x + width - radius, y + height);
    ctx.lineTo(x + radius, y + height);
    ctx.quadraticCurveTo(x, y + height, x, y + height - radius);
    ctx.lineTo(x, y - radius);
    ctx.quadraticCurveTo(x, y, x + radius, y);
    ctx.closePath();
  }

  async function copyToClipboard() {
    if (!imageUrl) return;

    try {
      const response = await fetch(imageUrl);
      const blob = await response.blob();
      await navigator.clipboard.write([
        new ClipboardItem({ 'image/png': blob })
      ]);
      copied = true;
      setTimeout(() => copied = false, 2000);
    } catch (err) {
      console.error('Failed to copy image:', err);
      alert('Failed to copy image to clipboard');
    }
  }

  function downloadImage() {
    if (!imageUrl) return;
    const link = document.createElement('a');
    link.download = `${playerName.replace(/\s+/g, '_')}_stare_stats.png`;
    link.href = imageUrl;
    link.click();
  }

  function shareOnTwitter() {
    const text = encodeURIComponent(`I just survived ${bestTime.toFixed(2)}s in The Ultimate Staring Competition! Think you can stare longer? Beat my time! 🎯`);
    const url = `https://twitter.com/intent/tweet?text=${text}`;
    window.open(url, '_blank', 'width=550,height=420');
  }

  function shareOnFacebook() {
    const url = encodeURIComponent('https://theultimatestaringcontest.com');
    const fbUrl = `https://www.facebook.com/sharer/sharer.php?u=${url}`;
    window.open(fbUrl, '_blank', 'width=550,height=420');
  }
</script>

{#if isOpen}
  <div class="modal-backdrop" on:click={handleBackdropClick}>
    <div class="modal">
      <button class="close-btn" on:click={onClose}>
        <X size={24} />
      </button>

      <div class="modal-header">
        <h2>Share Your Stats</h2>
      </div>

      <canvas bind:this={canvasElement} style="display: none;"></canvas>

      {#if imageUrl}
        <div class="image-preview">
          <img src={imageUrl} alt="Shareable stats image" />
        </div>

        <div class="share-actions">
          <button class="action-btn primary" on:click={copyToClipboard}>
            {copied ? '✓ Copied!' : '📋 Copy to Clipboard'}
          </button>
          <button class="action-btn" on:click={downloadImage}>
            <Download size={18} />
            Download
          </button>
          <button class="action-btn" on:click={shareOnTwitter}>
            <Twitter size={18} />
            Twitter
          </button>
          <button class="action-btn" on:click={shareOnFacebook}>
            <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
              <path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z"/>
            </svg>
            Facebook
          </button>
        </div>
      {/if}
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
    background: rgba(0, 0, 0, 0.85);
    display: flex;
    align-items: center;
    justify-content: center;
    z-index: 1000;
    backdrop-filter: blur(4px);
  }

  .modal {
    background: #1a1a1a;
    border-radius: 16px;
    padding: 2rem;
    width: 90%;
    max-width: 700px;
    max-height: 90vh;
    position: relative;
    border: 1px solid rgba(255, 255, 255, 0.1);
    box-shadow: 0 20px 60px rgba(0, 0, 0, 0.5);
    display: flex;
    flex-direction: column;
    overflow-y: auto;
  }

  .close-btn {
    position: absolute;
    top: 1rem;
    right: 1rem;
    background: none;
    border: none;
    color: #888;
    cursor: pointer;
    padding: 0.5rem;
    display: flex;
    align-items: center;
    justify-content: center;
    transition: color 0.15s ease;
    z-index: 1;
  }

  .close-btn:hover {
    color: #fff;
  }

  .modal-header {
    text-align: center;
    margin-bottom: 1.5rem;
  }

  .modal-header h2 {
    font-size: 1.5rem;
    font-weight: 700;
    margin: 0;
    color: #fff;
  }

  .image-preview {
    display: flex;
    justify-content: center;
    margin-bottom: 1.5rem;
  }

  .image-preview img {
    width: 100%;
    max-width: 600px;
    height: auto;
    border-radius: 12px;
    border: 2px solid rgba(255, 255, 255, 0.1);
  }

  .share-actions {
    display: grid;
    grid-template-columns: repeat(2, 1fr);
    gap: 1rem;
  }

  .action-btn {
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 0.5rem;
    padding: 0.75rem 1rem;
    background: rgba(255, 255, 255, 0.05);
    border: 2px solid rgba(255, 255, 255, 0.1);
    border-radius: 8px;
    color: #fff;
    font-size: 0.9rem;
    font-weight: 600;
    cursor: pointer;
    transition: all 0.2s ease;
  }

  .action-btn:hover {
    background: rgba(255, 255, 255, 0.1);
    border-color: rgba(255, 255, 255, 0.2);
    transform: translateY(-1px);
  }

  .action-btn.primary {
    background: linear-gradient(135deg, rgba(0, 255, 136, 0.1) 0%, rgba(0, 204, 255, 0.1) 100%);
    border-color: rgba(0, 255, 136, 0.3);
    color: #00ff88;
  }

  .action-btn.primary:hover {
    background: linear-gradient(135deg, rgba(0, 255, 136, 0.2) 0%, rgba(0, 204, 255, 0.2) 100%);
    border-color: rgba(0, 255, 136, 0.5);
  }

  @media (max-width: 600px) {
    .modal {
      width: 95%;
      padding: 1.5rem;
      max-height: 95vh;
    }

    .share-actions {
      grid-template-columns: 1fr;
    }

    .image-preview img {
      max-width: 100%;
    }
  }
</style>
