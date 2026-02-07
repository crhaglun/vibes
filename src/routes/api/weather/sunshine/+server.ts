import { json } from '@sveltejs/kit';
import type { RequestHandler } from './$types.js';
import { getWeatherMood } from '$lib/server/weather-service.js';

interface SuccessResponse {
  success: true;
  location: string;
  temperature: number;
  mood: string;
  description: string;
  icon: string;
  coordinates: { lat: number; lon: number };
}

export const GET: RequestHandler = async ({ url }) => {
  try {
    const lat = url.searchParams.get('lat');
    const lon = url.searchParams.get('lon');

    // Validate inputs
    if (!lat || !lon) {
      return json(
        { success: false, error: 'Missing coordinates' },
        { status: 400 }
      );
    }

    const latitude = parseFloat(lat);
    const longitude = parseFloat(lon);

    if (isNaN(latitude) || isNaN(longitude)) {
      return json(
        { success: false, error: 'Invalid coordinates' },
        { status: 400 }
      );
    }

    const result = await getWeatherMood(latitude, longitude);

    const response: SuccessResponse = {
      success: true,
      location: result.location,
      temperature: result.temperature,
      mood: result.mood,
      description: result.description,
      icon: result.icon,
      coordinates: result.coordinates
    };

    return json(response);
  } catch (error) {
    console.error('[Weather API] Error:', error);
    return json(
      { success: false, error: 'Failed to fetch weather data' },
      { status: 500 }
    );
  }
};
