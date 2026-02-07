/**
 * Application-wide configuration and constants
 * Single source of truth for all tunable parameters, magic numbers, and static data
 */

import { quotes } from './quotes-data.js';
import { feeds } from './feeds.js';

export const config = {
  /** Cache TTL (Time To Live) configuration */
  cache: {
    /** How long to keep a single quote before generating a new random one */
    quoteTtl: 5 * 60 * 1000, // 5 minutes

    /** How long to keep fetched RSS feeds before refreshing */
    feedTtl: 24 * 60 * 60 * 1000, // 24 hours (expensive operation)

    /** How long to keep the randomized news selection before regenerating */
    selectionTtl: 5 * 60 * 1000 // 5 minutes (cheap operation)
  },

  /** Algorithm and business logic configuration */
  algorithm: {
    /** Threshold for detecting duplicate articles (0-1 scale) */
    similarityThreshold: 0.85,

    /** Number of characters to show in article snippet before truncating */
    contentSnippetLength: 150,

    /** Number of top articles to consider before random selection */
    topArticlesToConsider: 30,

    /** Number of news items to return to the user */
    finalNewsCount: 3,

    /** Maximum items to parse from each RSS feed */
    itemsPerFeed: 10
  },

  /** UI and responsive design configuration */
  ui: {
    breakpoints: {
      /** Mobile breakpoint (pixels) */
      mobile: 768,

      /** Tablet breakpoint (pixels) */
      tablet: 1024
    }
  },

  /** Inspirational quotes dataset */
  quotes,

  /** RSS feed sources */
  feeds
} as const;
