<script lang="ts">
  export let quote;
</script>

<div class="quote-container">
  <div class="quote-content">
    <p class="quote-text">{quote.text}</p>
    {#if quote.author}
      <p class="quote-author">— {quote.author}</p>
    {/if}
  </div>
</div>

<style>
  .quote-container {
    display: flex;
    align-items: center;
    justify-content: center;
    min-height: 50vh;
    padding: var(--spacing-2xl);
    margin-bottom: var(--spacing-2xl);
  }

  .quote-content {
    background: var(--pastel-pink);
    border-radius: 20px;
    padding: var(--spacing-2xl);
    box-shadow: var(--shadow-lg);
    max-width: 700px;
    animation: slideUp 0.6s ease-out;
    text-align: center;
  }

  .quote-text {
    font-family: var(--font-display);
    font-size: var(--font-size-2xl);
    line-height: var(--line-height-relaxed);
    color: var(--text-primary);
    margin-bottom: var(--spacing-lg);
    font-style: italic;
  }

  .quote-author {
    font-size: var(--font-size-lg);
    color: var(--text-secondary);
    font-weight: 600;
    letter-spacing: 0.5px;
  }

  @media (max-width: 768px) {
    .quote-container {
      min-height: auto;
      padding: var(--spacing-lg);
      margin-bottom: var(--spacing-lg);
    }

    .quote-content {
      padding: var(--spacing-lg);
    }

    .quote-text {
      font-size: var(--font-size-xl);
    }

    .quote-author {
      font-size: var(--font-size-base);
    }
  }
</style>
