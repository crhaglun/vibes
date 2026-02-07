<script lang="ts">
  import { formatDistanceToNow } from 'date-fns';
  import { config } from '$lib/data/config.js';

  export let item;

  $: relativeTime = formatDistanceToNow(new Date(item.pubDate), { addSuffix: true });
</script>

<a href={item.link} target="_blank" rel="noopener noreferrer" class="card">
  <div class="card-content">
    <h3 class="card-title">{item.title}</h3>
    {#if item.contentSnippet}
      <p class="card-snippet">{item.contentSnippet.substring(0, config.algorithm.contentSnippetLength)}...</p>
    {/if}
  </div>
  <div class="card-footer">
    <div>
      <span class="source">{item.source}</span>
      <span class="time">{relativeTime}</span>
    </div>
    <div class="card-icon">→</div>
  </div>
</a>

<style>
  .card {
    display: flex;
    flex-direction: column;
    justify-content: space-between;
    height: 100%;
    background: rgba(255, 255, 255, 0.85);
    border: 3px solid var(--pastel-mint);
    border-radius: 12px;
    padding: var(--spacing-lg);
    gap: var(--spacing-md);
    transition: all var(--transition-base);
    cursor: pointer;
    text-decoration: none;
    color: inherit;
    animation: fadeIn 0.5s ease-in-out;
  }

  .card:hover {
    transform: translateY(-4px);
    box-shadow: var(--shadow-lg);
    border-color: var(--pastel-lavender);
    background: rgba(255, 255, 255, 0.95);
  }

  .card-content {
    flex: 1;
    min-width: 0;
  }

  .card-title {
    font-size: var(--font-size-lg);
    margin-bottom: var(--spacing-sm);
    color: var(--text-primary);
    line-height: var(--line-height-tight);
  }

  .card-snippet {
    font-size: var(--font-size-sm);
    color: var(--text-secondary);
    margin-bottom: var(--spacing-md);
    line-height: var(--line-height-normal);
  }

  .card-footer {
    display: flex;
    justify-content: space-between;
    align-items: center;
    gap: var(--spacing-md);
    font-size: var(--font-size-sm);
    color: var(--text-secondary);
    margin-top: auto;
  }

  .source {
    font-weight: 600;
    color: var(--pastel-blue);
  }

  .time {
    color: var(--text-secondary);
  }

  .card-icon {
    font-size: var(--font-size-xl);
    color: var(--pastel-pink);
    transition: transform var(--transition-base);
    flex-shrink: 0;
  }

  .card:hover .card-icon {
    transform: translateY(-2px);
    color: var(--pastel-lavender);
  }

  @media (max-width: 768px) {
    .card {
      padding: var(--spacing-md);
    }

    .card-title {
      font-size: var(--font-size-base);
    }
  }
</style>
