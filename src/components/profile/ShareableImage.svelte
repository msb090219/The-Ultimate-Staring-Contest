<script>
  export let playerName = 'Player';
  export let bestTime = 0;
  export let globalRank = null;
  export let percentile = 0;

  let canvasElement;
  let ctx;
  let imageUrl = '';
  let copied = false;

  function generateShareableImage() {
    if (!canvasElement) return;

    ctx = canvasElement.getContext('2d');
    const width = 1200;
    const height = 630;
    canvasElement.width = width;
    canvasElement.height = height;

    // Background with gradient
    const gradient = ctx.createLinearGradient(0, 0, width, height);
    gradient.addColorStop(0, '#0a0a0a');
    gradient.addColorStop(0.5, '#1a1a1a');
    gradient.addColorStop(1, '#0a0a0a');
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, width, height);

    // Add subtle glow effect
    ctx.fillStyle = 'rgba(0, 255, 136, 0.03)';
    ctx.fillRect(0, 0, width, height);

    // Title
    ctx.fillStyle = '#00ff88';
    ctx.font = 'bold 48px system-ui, -apple-system, sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText('THE ULTIMATE STARING COMPETITION', width / 2, 60);

    // Divider line
    ctx.strokeStyle = 'rgba(0, 255, 136, 0.3)';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(width / 2 - 200, 80);
    ctx.lineTo(width / 2 + 200, 80);
    ctx.stroke();

    // Player name
    ctx.fillStyle = '#ffffff';
    ctx.font = '600 36px system-ui, -apple-system, sans-serif';
    ctx.fillText(playerName + "'s Stats", width / 2, 130);

    // Best Time Card
    const cardWidth = 520;
    const cardX = (width - cardWidth) / 2;
    const cardY = 160;

    // Card background
    ctx.fillStyle = 'rgba(0, 255, 136, 0.05)';
    ctx.strokeStyle = 'rgba(0, 255, 136, 0.3)';
    ctx.lineWidth = 2;
    roundRect(ctx, cardX, cardY, cardWidth, 120, 16);
    ctx.fill();
    ctx.stroke();

    // Best time label
    ctx.fillStyle = '#888888';
    ctx.font = '500 20px system-ui, -apple-system, sans-serif';
    ctx.fillText('BEST TIME', width / 2, cardY + 35);

    // Best time value
    ctx.fillStyle = '#00ff88';
    ctx.font = 'bold 64px system-ui, -apple-system, sans-serif';
    ctx.fillText(bestTime > 0 ? bestTime.toFixed(2) + 's' : '--', width / 2, cardY + 85);

    // Stats row (if rank available)
    if (globalRank) {
      const statY = 310;
      ctx.fillStyle = '#ffffff';
      ctx.font = '600 28px system-ui, -apple-system, sans-serif';
      ctx.fillText(`Rank #${globalRank} worldwide`, width / 2, statY);

      ctx.fillStyle = '#888888';
      ctx.font = '500 20px system-ui, -apple-system, sans-serif';
      ctx.fillText(`Top ${percentile.toFixed(1)}% of all players`, width / 2, statY + 35);
    }

    // Challenge text
    const challengeY = globalRank ? 380 : 320;
    ctx.fillStyle = '#00ccff';
    ctx.font = '600 32px system-ui, -apple-system, sans-serif';
    ctx.fillText('Think you can stare longer?', width / 2, challengeY);

    // CTA text
    ctx.fillStyle = '#ffffff';
    ctx.font = '500 24px system-ui, -apple-system, sans-serif';
    ctx.fillText('Try and beat my time!', width / 2, challengeY + 40);

    // URL
    const urlY = height - 40;
    ctx.fillStyle = '#00ff88';
    ctx.font = '600 20px system-ui, -apple-system, sans-serif';
    ctx.fillText('theultimatestaringcontest.com', width / 2, urlY);

    // Convert to image
    imageUrl = canvasElement.toDataURL('image/png');
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

  import { onMount, afterUpdate } from 'svelte';

  onMount(() => {
    generateShareableImage();
  });

  afterUpdate(() => {
    generateShareableImage();
  });
</script>

<div class="shareable-image-container">
  <canvas bind:this={canvasElement} style="display: none;"></canvas>

  {#if imageUrl}
    <div class="image-preview">
      <img src={imageUrl} alt="Shareable stats image" />
      <button class="copy-btn" on:click={copyToClipboard}>
        {copied ? '✓ Copied!' : '📋 Copy Image'}
      </button>
    </div>
  {/if}
</div>

<style>
  .shareable-image-container {
    width: 100%;
    max-width: 600px;
    margin: 0 auto;
  }

  .image-preview {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 1rem;
  }

  .image-preview img {
    width: 100%;
    height: auto;
    border-radius: 12px;
    border: 2px solid rgba(255, 255, 255, 0.1);
  }

  .copy-btn {
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

  .copy-btn:hover {
    background: linear-gradient(135deg, rgba(0, 255, 136, 0.2) 0%, rgba(0, 204, 255, 0.2) 100%);
    border-color: rgba(0, 255, 136, 0.5);
    transform: translateY(-1px);
  }
</style>
