import Parser from 'rss-parser';
import type { NewsItem } from '$lib/types/index.js';
import { config } from '$lib/data/config.js';

const parser = new Parser();

export async function parseRssFeed(feedUrl: string, sourceName: string): Promise<NewsItem[]> {
  try {
    const feed = await parser.parseURL(feedUrl);

    if (!feed.items || feed.items.length === 0) {
      console.warn(`No items found in feed: ${sourceName}`);
      return [];
    }

    return feed.items.slice(0, config.algorithm.itemsPerFeed).map((item) => ({
      title: item.title || 'Untitled',
      link: item.link || '#',
      pubDate: item.pubDate || new Date().toISOString(),
      source: sourceName,
      contentSnippet: item.contentSnippet || item.content || ''
    }));
  } catch (error) {
    console.error(`Error parsing feed ${sourceName}:`, error);
    return [];
  }
}
