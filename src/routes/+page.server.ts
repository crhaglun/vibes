import { getRandomizedNews } from '$lib/server/news-aggregator.js';
import { config } from '$lib/data/config.js';
import { getRandomQuote } from '$lib/server/quotes.js';
import type { PageServerLoad } from './$types.js';

export const load: PageServerLoad = async () => {
  try {
    const [news, quote] = await Promise.all([getRandomizedNews(), Promise.resolve(getRandomQuote())]);

    return {
      news,
      quote,
      feeds: config.feeds
    };
  } catch (error) {
    console.error('Error loading page data:', error);

    return {
      news: [],
      quote: getRandomQuote(),
      feeds: config.feeds,
      error: 'Failed to load news'
    };
  }
};
