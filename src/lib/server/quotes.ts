import type { Quote } from '$lib/types/index.js';
import { config } from '$lib/data/config.js';

interface CacheEntry {
  quote: Quote;
  timestamp: number;
}

let cachedQuote: CacheEntry | null = null;

export function getRandomQuote(): Quote {
  // Return cached quote if available and not expired
  if (cachedQuote && Date.now() - cachedQuote.timestamp < config.cache.quoteTtl) {
    return cachedQuote.quote;
  }

  // Generate new random quote
  const quote = config.quotes[Math.floor(Math.random() * config.quotes.length)];

  // Cache it
  cachedQuote = {
    quote,
    timestamp: Date.now()
  };

  return quote;
}
