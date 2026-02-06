import { getRandomizedNews, RSS_FEEDS } from '$lib/server/news-aggregator.js';
import { getRandomQuote } from '$lib/data/quotes.js';
import type { PageServerLoad } from './$types.js';

export const load: PageServerLoad = async () => {
  try {
    const [news, quote] = await Promise.all([getRandomizedNews(), Promise.resolve(getRandomQuote())]);

    return {
      news,
      quote,
      feeds: RSS_FEEDS
    };
  } catch (error) {
    console.error('Error loading page data:', error);

    return {
      news: [],
      quote: getRandomQuote(),
      feeds: RSS_FEEDS,
      error: 'Failed to load news'
    };
  }
};
