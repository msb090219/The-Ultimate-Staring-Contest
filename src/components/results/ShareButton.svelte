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
    transition: all 0.2s ease;
  }

  .share-button:hover {
    background: rgba(0, 204, 255, 0.1);
    border-color: #00ccff;
  }

  .share-button:active {
    transform: scale(0.98);
  }
</style>
