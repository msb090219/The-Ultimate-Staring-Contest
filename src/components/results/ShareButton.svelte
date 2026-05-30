<script>
  export let time = 0;
  import { MESSAGES } from '../../lib/constants/messages.js';

  let copySuccess = false;
  let copyTimeout = null;

  async function handleShare() {
    const text = `${MESSAGES.share.template(time)} https://ultimate-staring-competition.com`;

    try {
      await navigator.clipboard.writeText(text);

      copySuccess = true;

      if (copyTimeout) clearTimeout(copyTimeout);
      copyTimeout = setTimeout(() => {
        copySuccess = false;
      }, 2000);
    } catch (error) {
      console.error('Failed to copy:', error);
    }
  }
</script>

<button
  class="share-button"
  on:click={handleShare}
>
  {#if copySuccess}
    ✓ {MESSAGES.share.copySuccess}
  {:else}
    Share Score
  {/if}
</button>

<style>
  .share-button {
    padding: 1rem 2rem;
    font-size: 1rem;
    font-weight: 600;
    background: rgba(255, 255, 255, 0.05);
    border: 2px solid rgba(255, 255, 255, 0.1);
    border-radius: 12px;
    color: #ffffff;
    cursor: pointer;
    transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
    position: relative;
    overflow: hidden;
  }

  .share-button::before {
    content: '';
    position: absolute;
    top: 0;
    left: -100%;
    width: 100%;
    height: 100%;
    background: linear-gradient(90deg, transparent, rgba(255,255,255,0.05), transparent);
    transition: left 0.5s;
  }

  .share-button:hover::before {
    left: 100%;
  }

  .share-button:hover {
    background: rgba(0, 204, 255, 0.1);
    border-color: #00ccff;
    box-shadow: 0 0 20px rgba(0, 204, 255, 0.3);
    transform: translateY(-2px);
  }

  .share-button:active {
    transform: translateY(0);
  }
</style>
