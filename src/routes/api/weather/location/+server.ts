import { json } from '@sveltejs/kit';
import type { RequestHandler } from './$types.js';
import { getLocationFromIP } from '$lib/server/ip-geolocation.js';

interface SuccessResponse {
  success: true;
  coordinates: { lat: number; lon: number };
  city?: string;
  country?: string;
}

interface ErrorResponse {
  success: false;
  error: string;
}

export const GET: RequestHandler = async ({ getClientAddress }) => {
  try {
    const clientIP = getClientAddress();
    const location = await getLocationFromIP(clientIP);

    const response: SuccessResponse = {
      success: true,
      coordinates: { lat: location.lat, lon: location.lon },
      city: location.city,
      country: location.country
    };

    return json(response);
  } catch (error) {
    console.error('[Location API] Error:', error);
    return json(
      { success: false, error: 'Failed to determine location' },
      { status: 500 }
    );
  }
};
