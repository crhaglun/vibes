<script lang="ts">
  import NewsCard from './NewsCard.svelte';

  export let items = [];
</script>

<div class="news-section">
  {#if items.length === 0}
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
  }
</style>
