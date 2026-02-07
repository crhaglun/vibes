interface IPLocation {
  lat: number;
  lon: number;
  city?: string;
  country?: string;
}

interface IPAPIResponse {
  latitude: number;
  longitude: number;
  city: string;
  country_name: string;
}

const cache: Map<string, IPLocation> = new Map();

export async function getLocationFromIP(ip: string): Promise<IPLocation> {
  // Check cache first
  if (cache.has(ip)) {
    console.log(`[IP Geolocation] Cache hit for IP: ${ip}`);
    return cache.get(ip)!;
  }

  try {
    console.log(`[IP Geolocation] Looking up IP: ${ip}`);

    // Use ipapi.co free tier (no API key needed)
    const url = `https://ipapi.co/${ip}/json/`;
    const response = await fetch(url);

    if (!response.ok) {
      throw new Error(`IP API error: ${response.status}`);
    }

    const data = (await response.json()) as IPAPIResponse;

    const location: IPLocation = {
      lat: data.latitude,
      lon: data.longitude,
      city: data.city,
      country: data.country_name
    };

    cache.set(ip, location);
    return location;
  } catch (error) {
    console.error('[IP Geolocation] Error looking up IP location:', error);
    // Fallback to a default location (could be configurable)
    // Using Sweden as default since the site is vibes.hglnd.se
    return {
      lat: 59.3293,
      lon: 18.0686,
      city: 'Stockholm',
      country: 'Sweden'
    };
  }
}

export function clearIPLocationCache(): void {
  cache.clear();
  console.log('[IP Geolocation] Cache cleared');
}
