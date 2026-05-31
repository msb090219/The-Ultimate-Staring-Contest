<script>
  import { X, Download } from 'lucide-svelte';
  import { tick } from 'svelte';
  import { getRank } from '../../lib/utils/rank.js';
  import { authState } from '../../stores/authState.js';

  export let isOpen = false;
  export let onClose = () => {};
  export let time = 0;
  export let playerName = 'Player';

  let canvasElement;
  let ctx;
  let imageUrl = '';
  let copied = false;

  function handleBackdropClick(e) {
    if (e.target === e.currentTarget) {
      onClose();
    }
  }

  function handleKeydown(e) {
    if (e.key === 'Escape' && isOpen) {
      onClose();
    }
  }

  $: if (isOpen) {
    generateImageAfterRender();
    window.addEventListener('keydown', handleKeydown);
  } else {
    window.removeEventListener('keydown', handleKeydown);
  }

  async function generateImageAfterRender() {
    await tick();
    generateShareableImage();
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

      // Background - solid dark
      ctx.fillStyle = '#0a0a0a';
      ctx.fillRect(0, 0, width, height);

      ctx.textAlign = 'center';

      // Game name - small, top
      ctx.fillStyle = 'rgba(255, 255, 255, 0.3)';
      ctx.font = '500 16px -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif';
      ctx.letterSpacing = '2px';
      ctx.fillText('THE ULTIMATE STARING COMPETITION', width / 2, 70);

      // Main time - the hero, super clean
      ctx.fillStyle = '#00ff88';
      ctx.font = '900 200px -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif';
      const timeText = time > 0 ? time.toFixed(2) + 's' : '--';
      ctx.fillText(timeText, width / 2, 265);

      // "I survived" - subtle label
      ctx.fillStyle = 'rgba(255, 255, 255, 0.35)';
      ctx.font = '400 15px -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif';
      ctx.fillText('I survived for', width / 2, 310);

      // Player name
      ctx.fillStyle = 'rgba(255, 255, 255, 0.5)';
      ctx.font = '500 18px -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif';
      ctx.fillText(playerName, width / 2, 350);

      // Simple line
      ctx.strokeStyle = 'rgba(0, 255, 136, 0.15)';
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.moveTo(width / 2 - 60, 400);
      ctx.lineTo(width / 2 + 60, 400);
      ctx.stroke();

      // Challenge - clean
      ctx.fillStyle = '#ffffff';
      ctx.font = '600 26px -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif';
      ctx.fillText('Can you beat me?', width / 2, 460);

      // URL - minimal
      ctx.fillStyle = 'rgba(0, 255, 136, 0.4)';
      ctx.font = '400 13px -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif';
      ctx.fillText('theultimatestaringcontest.com', width / 2, 590);

      // Convert to image
      imageUrl = canvasElement.toDataURL('image/png');
    } catch (err) {
      console.error('Error generating shareable image:', err);
      imageUrl = '';
    }
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
    link.download = `${playerName.replace(/\s+/g, '_')}_stare_${time.toFixed(1)}s.png`;
    link.href = imageUrl;
    link.click();
  }

  async function shareImage() {
    if (!imageUrl) return;

    try {
      const response = await fetch(imageUrl);
      const blob = await response.blob();
      const file = new File([blob], `${playerName.replace(/\s+/g, '_')}_stare_${time.toFixed(1)}s.png`, { type: 'image/png' });

      if (navigator.canShare && navigator.canShare({ files: [file] })) {
        await navigator.share({
          files: [file],
          title: 'My Staring Contest Result',
          text: `I survived ${time.toFixed(1)}s in The Ultimate Staring Competition! Can you beat me?`
        });
      } else {
        // Fallback: copy to clipboard
        alert('Share not supported on this device. Image copied to clipboard instead!');
        await copyToClipboard();
      }
    } catch (err) {
      console.error('Failed to share:', err);
      if (err.name !== 'AbortError') {
        alert('Failed to share. Image copied to clipboard instead!');
        await copyToClipboard();
      }
    }
  }
</script>

{#if isOpen}
  <div class="modal-backdrop" on:click={handleBackdropClick}>
    <div class="modal">
      <button class="close-btn" on:click={onClose}>
        <X size={24} />
      </button>

      <div class="modal-header">
        <h2>Share Your Result</h2>
      </div>

      <canvas bind:this={canvasElement} style="display: none;"></canvas>

      {#if imageUrl}
        <div class="image-preview">
          <img src={imageUrl} alt="Shareable result image" />
        </div>

        <div class="share-actions">
          <button class="action-btn primary" on:click={shareImage}>
            Share
          </button>
          <button class="action-btn" on:click={copyToClipboard}>
            {copied ? '✓ Copied!' : 'Copy to Clipboard'}
          </button>
          <button class="action-btn" on:click={downloadImage}>
            <Download size={18} />
            Download
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
    grid-template-columns: repeat(3, 1fr);
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
