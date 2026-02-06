import { parseRssFeed } from './rss-parser.js';
import type { NewsItem } from '$lib/types/index.js';

// Cache configuration
const FEED_CACHE_TTL = 24 * 60 * 60 * 1000; // 24 hours - expensive RSS fetching
const SELECTION_CACHE_TTL = 5 * 60 * 1000; // 5 minutes - cheap randomization

interface CacheEntry {
  data: NewsItem[];
  timestamp: number;
}

// In-memory cache
const cache: Map<string, CacheEntry> = new Map();

// RSS feed sources with homepage URLs
export const RSS_FEEDS = [
  {
    url: 'https://www.positive.news/feed/',
    name: 'Positive News',
    homepage: 'https://www.positive.news/'
  },
  {
    url: 'https://reasonstobecheerful.world/feed/',
    name: 'Reasons to be Cheerful',
    homepage: 'https://reasonstobecheerful.world/'
  },
  {
    url: 'https://www.upworthy.com/feeds/feed.rss',
    name: 'Upworthy',
    homepage: 'https://www.upworthy.com/'
  },
  {
    url: 'https://www.goodnewsnetwork.org/category/news/science/feed/',
    name: 'Good News Network - Science',
    homepage: 'https://www.goodnewsnetwork.org/category/news/science/'
  }
];

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
      (seenItem) => stringSimilarity(seenItem.title, item.title) > 0.85
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
  if (cached && Date.now() - cached.timestamp < FEED_CACHE_TTL) {
    console.log('Returning cached aggregated news');
    return cached.data;
  }

  console.log('Fetching fresh news from all feeds...');

  // Fetch all feeds in parallel
  const results = await Promise.allSettled(
    RSS_FEEDS.map((feed) => parseRssFeed(feed.url, feed.name))
  );

  // Combine all successful results
  let allItems: NewsItem[] = [];
  results.forEach((result, index) => {
    if (result.status === 'fulfilled') {
      allItems = allItems.concat(result.value);
    } else {
      console.error(`Failed to fetch ${RSS_FEEDS[index].name}:`, result.reason);
    }
  });

  // Filter duplicates and sort by date
  const filtered = filterDuplicates(allItems);
  const sorted = filtered.sort((a, b) => {
    const dateA = new Date(a.pubDate).getTime();
    const dateB = new Date(b.pubDate).getTime();
    return dateB - dateA; // Newest first
  });

  // Take top 30 items and randomly select 3 (one per source where possible)
  const topItems = sorted.slice(0, 30);
  const randomItems = getRandomNewsWithDiverseSources(topItems, 3);

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
  if (cached && Date.now() - cached.timestamp < SELECTION_CACHE_TTL) {
    console.log('Returning cached randomized selection');
    return cached.data;
  }

  console.log('Generating new random selection from aggregated news');

  // Get all aggregated news (uses 24h cache internally)
  const allNews = await getAggregatedNews();

  // Randomly select 3 items
  const randomItems = getRandomItems(allNews, 3);

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

/**
 * Get cache info for monitoring
 */
export function getCacheInfo() {
  const feedCache = cache.get('aggregated_news');
  const selectionCache = cache.get('randomized_news');

  return {
    feedCache: feedCache
      ? {
          isCached: true,
          itemCount: feedCache.data.length,
          ageMs: Date.now() - feedCache.timestamp,
          remainingMs: Math.max(0, FEED_CACHE_TTL - (Date.now() - feedCache.timestamp)),
          sources: [...new Set(feedCache.data.map((item) => item.source))]
        }
      : { isCached: false, message: 'No feed cache' },
    selectionCache: selectionCache
      ? {
          isCached: true,
          itemCount: selectionCache.data.length,
          ageMs: Date.now() - selectionCache.timestamp,
          remainingMs: Math.max(0, SELECTION_CACHE_TTL - (Date.now() - selectionCache.timestamp))
        }
      : { isCached: false, message: 'No selection cache' }
  };
}
