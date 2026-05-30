<script>
  export let value = '';
  export let placeholder = 'Enter your name';
  export let size = 'large'; // 'large' or 'compact'

  function handleInput(e) {
    value = e.target.value;
  }
</script>

<input
  type="text"
  bind:value={value}
  {placeholder}
  maxlength="20"
  class:size={size}
  readonly
  on:focus={(e) => e.target.blur()}
/>

<style>
  input {
    width: 100%;
    max-width: 300px;
    font-size: 1rem;
    padding: 1rem 0.75rem;
    background: rgba(255, 255, 255, 0.1);
    border: 2px solid rgba(255, 255, 255, 0.2);
    border-radius: 12px;
    color: #ffffff;
    text-align: center;
    transition: border-color 0.2s ease;
  }

  input:focus {
    outline: none;
    border-color: #00ff88;
  }

  input::placeholder {
    color: #888;
  }

  /* Compact variant for navbar */
  input.size-compact {
    max-width: 150px;
    font-size: 0.9rem;
    padding: 0.5rem 0.75rem;
  }
</style>
