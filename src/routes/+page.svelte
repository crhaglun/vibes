<script lang="ts">
  import QuoteDisplay from '$lib/components/QuoteDisplay.svelte';
  import NewsFeed from '$lib/components/NewsFeed.svelte';

  export let data;
</script>

<div class="container">
  <main>
    <QuoteDisplay quote={data.quote} />
    <NewsFeed items={data.news} />
  </main>

  <footer class="footer">
    <div class="footer-content">
      <div class="footer-links">
        <div class="sources">
          <p class="sources-title">News sources:</p>
          <ul>
            {#each data.feeds as feed (feed.name)}
              <li><a href={feed.homepage} target="_blank" rel="noopener noreferrer">{feed.name}</a></li>
            {/each}
          </ul>
        </div>
        <div class="repo">
          <a href="https://github.com/crhaglun/vibes" target="_blank" rel="noopener noreferrer">Source code on Github</a>
        </div>
      </div>
    </div>
  </footer>
</div>

<style>
  .container {
    max-width: 1200px;
    margin: 0 auto;
    padding: 0 var(--spacing-md);
  }

  main {
    padding: var(--spacing-lg) 0;
  }

  .footer {
    text-align: left;
    padding: var(--spacing-2xl) var(--spacing-md);
    color: var(--text-secondary);
    font-size: var(--font-size-base);
    animation: slideUp 1s ease-out;
    border-top: 1px solid rgba(0, 0, 0, 0.1);
    margin-top: var(--spacing-2xl);
  }

  .footer-content {
    max-width: 1200px;
    margin: 0 auto;
  }

  .footer-tagline {
    margin: 0 0 var(--spacing-lg) 0;
    font-size: var(--font-size-lg);
  }

  .footer-links {
    display: flex;
    gap: var(--spacing-2xl);
    justify-content: flex-start;
    flex-wrap: wrap;
  }

  .sources {
    text-align: left;
  }

  .sources-title {
    margin: 0 0 var(--spacing-sm) 0;
    font-weight: 600;
    font-size: var(--font-size-sm);
    text-transform: uppercase;
    letter-spacing: 0.5px;
  }

  .sources ul {
    list-style: none;
    padding: 0;
    margin: 0;
    display: flex;
    flex-direction: column;
    gap: var(--spacing-xs);
  }

  .sources a,
  .repo a {
    color: var(--text-secondary);
    text-decoration: none;
    transition: color 0.2s ease;
  }

  .sources a:hover,
  .repo a:hover {
    color: var(--text-primary);
    text-decoration: underline;
  }

  .repo a {
    font-weight: 600;
  }

  @media (max-width: 768px) {
    .footer {
      padding: var(--spacing-lg) var(--spacing-md);
    }

    .footer-links {
      flex-direction: column;
      gap: var(--spacing-lg);
      justify-content: flex-start;
    }

    .sources {
      text-align: left;
    }
  }
</style>
