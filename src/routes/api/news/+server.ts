import { json } from '@sveltejs/kit';
import { getRandomizedNews, clearNewsCache } from '$lib/server/news-aggregator.js';
import type { RequestHandler } from './$types.js';

export const GET: RequestHandler = async ({ url }) => {
  try {
    // Check for refresh query parameter
    const shouldRefresh = url.searchParams.has('refresh');

    if (shouldRefresh) {
      clearNewsCache();
    }

    const news = await getRandomizedNews();

    return json({
      success: true,
      news,
      refreshed: shouldRefresh,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error('Error fetching news:', error);

    return json(
      {
        success: false,
        error: 'Failed to fetch news',
        news: []
      },
      { status: 500 }
    );
  }
};
