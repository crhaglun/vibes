import { parseRssFeed } from './rss-parser.js';
import type { NewsItem } from '$lib/types/index.js';
import { config } from '$lib/data/config.js';

interface CacheEntry {
  data: NewsItem[];
  timestamp: number;
}

// In-memory cache
const cache: Map<string, CacheEntry> = new Map();

/**
 * Calculate similarity between two strings (0-1)
 * Used to detect duplicate articles from different sources
 */
function stringSimilarity(str1: string, str2: string): number {
  const a = str1.toLowerCase();
  const b = str2.toLowerCase();

  const lengthDiff = Math.abs(a.length - b.length);
  const maxLen = Math.max(a.length, b.length);

  if (maxLen === 0) return 1;

  let matches = 0;
  const minLen = Math.min(a.length, b.length);

  for (let i = 0; i < minLen; i++) {
    if (a[i] === b[i]) matches++;
  }

  const baseScore = matches / maxLen;
  const lengthPenalty = Math.min(lengthDiff / maxLen, 0.5);

  return Math.max(0, baseScore - lengthPenalty);
}

/**
 * Filter out duplicate articles based on title similarity
 */
function filterDuplicates(items: NewsItem[]): NewsItem[] {
  const seen: NewsItem[] = [];

  for (const item of items) {
    const isDuplicate = seen.some(
      (seenItem) => stringSimilarity(seenItem.title, item.title) > config.algorithm.similarityThreshold
    );

    if (!isDuplicate) {
      seen.push(item);
    }
  }

  return seen;
}

/**
 * Randomly select N items from an array
 */
function getRandomItems<T>(items: T[], count: number): T[] {
  if (items.length <= count) {
    return items;
  }

  const shuffled = [...items];
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }

  return shuffled.slice(0, count);
}

/**
 * Select N random news items ensuring no duplicate sources
 * Groups items by source and picks randomly from each source
 */
function getRandomNewsWithDiverseSources(items: NewsItem[], count: number): NewsItem[] {
  if (items.length === 0) {
    return [];
  }

  // Group items by source
  const itemsBySource = new Map<string, NewsItem[]>();
  for (const item of items) {
    if (!itemsBySource.has(item.source)) {
      itemsBySource.set(item.source, []);
    }
    itemsBySource.get(item.source)!.push(item);
  }

  const sources = Array.from(itemsBySource.keys());
  const result: NewsItem[] = [];
  const usedSources = new Set<string>();

  // First pass: pick one item from each source until we have enough
  for (const source of sources) {
    if (result.length >= count) break;

    const sourceItems = itemsBySource.get(source)!;
    const randomIndex = Math.floor(Math.random() * sourceItems.length);
    result.push(sourceItems[randomIndex]);
    usedSources.add(source);
  }

  // If we still need more items and have unused sources, pick from remaining sources
  if (result.length < count && usedSources.size < sources.length) {
    const unusedSources = sources.filter((s) => !usedSources.has(s));
    const shuffled = [...unusedSources];
    for (let i = shuffled.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
    }

    for (const source of shuffled) {
      if (result.length >= count) break;
      const sourceItems = itemsBySource.get(source)!;
      const randomIndex = Math.floor(Math.random() * sourceItems.length);
      result.push(sourceItems[randomIndex]);
    }
  }

  return result;
}

/**
 * Fetch and aggregate news from all RSS feeds
 * Caches for 24 hours (expensive operation)
 */
async function getAggregatedNews(): Promise<NewsItem[]> {
  const cacheKey = 'aggregated_news';
  const cached = cache.get(cacheKey);

  // Return cached data if available and not expired (24 hour TTL)
  if (cached && Date.now() - cached.timestamp < config.cache.feedTtl) {
    console.log('Returning cached aggregated news');
    return cached.data;
  }

  console.log('Fetching fresh news from all feeds...');

  // Fetch all feeds in parallel
  const results = await Promise.allSettled(
    config.feeds.map((feed) => parseRssFeed(feed.url, feed.name))
  );

  // Combine all successful results
  let allItems: NewsItem[] = [];
  results.forEach((result, index) => {
    if (result.status === 'fulfilled') {
      allItems = allItems.concat(result.value);
    } else {
      console.error(`Failed to fetch ${config.feeds[index].name}:`, result.reason);
    }
  });

  // Filter duplicates and sort by date
  const filtered = filterDuplicates(allItems);
  const sorted = filtered.sort((a, b) => {
    const dateA = new Date(a.pubDate).getTime();
    const dateB = new Date(b.pubDate).getTime();
    return dateB - dateA; // Newest first
  });

  // Take top N items and randomly select M (one per source where possible)
  const topItems = sorted.slice(0, config.algorithm.topArticlesToConsider);
  const randomItems = getRandomNewsWithDiverseSources(topItems, config.algorithm.finalNewsCount);

  // Cache the result
  cache.set(cacheKey, {
    data: randomItems,
    timestamp: Date.now()
  });

  return randomItems;
}

/**
 * Get randomized selection of news articles
 * Fetches aggregated news (24h cache) and returns 3 random items
 * Caches the random selection for 1 hour (cheap operation)
 */
export async function getRandomizedNews(): Promise<NewsItem[]> {
  const cacheKey = 'randomized_news';
  const cached = cache.get(cacheKey);

  // Return cached random selection if available and not expired (1 hour TTL)
  if (cached && Date.now() - cached.timestamp < config.cache.selectionTtl) {
    console.log('Returning cached randomized selection');
    return cached.data;
  }

  console.log('Generating new random selection from aggregated news');

  // Get all aggregated news (uses 24h cache internally)
  const allNews = await getAggregatedNews();

  // Randomly select N items
  const randomItems = getRandomItems(allNews, config.algorithm.finalNewsCount);

  // Cache the random selection
  cache.set(cacheKey, {
    data: randomItems,
    timestamp: Date.now()
  });

  return randomItems;
}

/**
 * Clear the news cache (useful for manual refresh in development)
 */
export function clearNewsCache(): void {
  cache.delete('aggregated_news');
  cache.delete('randomized_news');
  console.log('News cache cleared');
}
