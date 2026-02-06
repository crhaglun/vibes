<script lang="ts">
  import NewsCard from './NewsCard.svelte';

  export let items = [];
  export let isLoading = false;
</script>

<div class="news-section">
  {#if isLoading}
    <div class="loading">
      <div class="spinner"></div>
      <p>Loading good news...</p>
    </div>
  {:else if items.length === 0}
    <div class="empty">
      <p>No news items available right now. Check back soon!</p>
    </div>
  {:else}
    <div class="news-grid">
      {#each items as item (item.link)}
        <NewsCard {item} />
      {/each}
    </div>
  {/if}
</div>

<style>
  .news-section {
    animation: slideUp 0.8s ease-out;
  }

  .news-grid {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
    gap: var(--spacing-lg);
    auto-rows: 1fr;
  }

  .loading {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    padding: var(--spacing-2xl);
    color: var(--text-secondary);
  }

  .spinner {
    width: 40px;
    height: 40px;
    border: 4px solid var(--pastel-pink);
    border-top-color: var(--pastel-lavender);
    border-radius: 50%;
    animation: spin 1s linear infinite;
    margin-bottom: var(--spacing-md);
  }

  @keyframes spin {
    to {
      transform: rotate(360deg);
    }
  }

  .empty {
    text-align: center;
    padding: var(--spacing-2xl);
    background: rgba(255, 255, 255, 0.7);
    border-radius: 12px;
    color: var(--text-secondary);
  }

  @media (max-width: 1024px) {
    .news-grid {
      grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
    }
  }

  @media (max-width: 768px) {
    .news-section {
      max-width: 700px;
      margin: 0 auto;
    }

    .news-grid {
      grid-template-columns: 1fr;
    }

    .news-header h2 {
      font-size: var(--font-size-xl);
    }

    .subtitle {
      font-size: var(--font-size-base);
    }
  }
</style>
