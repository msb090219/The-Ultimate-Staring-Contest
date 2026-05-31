<script>
  export let value = '';
  export let placeholder = 'Enter your name';
  export let size = 'large'; // 'large' or 'compact'

  function handleInput(e) {
    value = e.target.value;
  }
</script>

<div class="name-display" class:size={size}>
  <span class="name-label">Playing as</span>
  <div class="name-badge">{value || placeholder}</div>
</div>

<style>
  .name-display {
    display: flex;
    flex-direction: column;
    align-items: flex-start;
    gap: 0.5rem;
  }

  .name-label {
    font-size: 0.75rem;
    color: #888;
    text-transform: uppercase;
    letter-spacing: 0.15em;
    font-weight: 600;
  }

  .name-badge {
    padding: 1rem 1.5rem;
    background: rgba(255, 255, 255, 0.08);
    border: 1px solid rgba(255, 255, 255, 0.15);
    border-radius: 12px;
    color: #fff;
    font-size: 1.1rem;
    font-weight: 600;
    letter-spacing: 0.5px;
    min-width: 140px;
    text-align: center;
    transition: all 0.2s ease;
  }

  .name-badge:hover {
    background: rgba(255, 255, 255, 0.12);
    border-color: rgba(255, 255, 255, 0.25);
  }

  /* Compact variant for navbar */
  .name-display.size-compact .name-label {
    font-size: 0.65rem;
  }

  .name-display.size-compact .name-badge {
    min-width: 100px;
    padding: 0.5rem 0.75rem;
    font-size: 0.85rem;
  }
</style>
