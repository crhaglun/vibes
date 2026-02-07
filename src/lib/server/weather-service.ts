import { OPENWEATHER_API_KEY } from '$env/static/private';

export interface WeatherMoodResult {
  location: string;
  temperature: number;
  mood: string;
  description: string;
  icon: string;
  coordinates: { lat: number; lon: number };
}

interface OpenWeatherResponse {
  name: string;
  sys: { country: string; sunrise: number; sunset: number };
  coord: { lat: number; lon: number };
  main: { temp: number; feels_like: number };
  weather: Array<{ id: number; main: string; description: string }>;
  wind?: { speed: number };
  clouds?: { all: number };
}

export async function getWeatherMood(
  userLat: number,
  userLon: number
): Promise<WeatherMoodResult> {
  try {
    console.log(`[Weather] Fetching current weather for lat=${userLat}, lon=${userLon}`);

    const url = `https://api.openweathermap.org/data/2.5/weather?lat=${userLat}&lon=${userLon}&appid=${OPENWEATHER_API_KEY}&units=metric`;
    const response = await fetch(url);

    if (!response.ok) {
      const errorText = await response.text();
      console.error(`[Weather] API Error:`, response.status, errorText);
      throw new Error(`OpenWeatherMap API error: ${response.status}`);
    }

    const data = (await response.json()) as OpenWeatherResponse;
    const now = Math.floor(Date.now() / 1000);
    const isDaytime = now > data.sys.sunrise && now < data.sys.sunset;

    const { mood, description, icon } = generateMoodDescription(
      data.weather[0]?.id || 500,
      data.main.temp,
      isDaytime,
      data.main.feels_like,
      data.clouds?.all || 0,
      now,
      data.sys.sunrise,
      data.sys.sunset
    );

    console.log(`[Weather] Got weather for ${data.name}: ${description}`);

    return {
      location: `${data.name}, ${data.sys.country}`,
      temperature: Math.round(data.main.temp),
      mood,
      description,
      icon,
      coordinates: { lat: data.coord.lat, lon: data.coord.lon }
    };
  } catch (error) {
    console.error('[Weather] Error fetching weather:', error);
    // Return a minimal fallback if everything fails
    return {
      location: 'Your location',
      temperature: 0,
      mood: 'weather',
      description: 'Check the weather outside',
      icon: '🌤️',
      coordinates: { lat: userLat, lon: userLon }
    };
  }
}

function generateMoodDescription(
  weatherCode: number,
  temperature: number,
  isDaytime: boolean,
  _feelsLike: number,
  cloudCover: number,
  now: number,
  sunrise: number,
  _sunset: number
): { mood: string; description: string; icon: string } {
  // Thunderstorm (2xx)
  if (weatherCode >= 200 && weatherCode < 300) {
    return {
      mood: 'dramatic',
      description: 'Lightning and thunder nearby—nature\'s light show',
      icon: '⛈️'
    };
  }

  // Drizzle (3xx)
  if (weatherCode >= 300 && weatherCode < 400) {
    return {
      mood: 'gentle',
      description: 'Light drizzle—perfect for a peaceful walk with an umbrella',
      icon: '🌦️'
    };
  }

  // Rain (5xx)
  if (weatherCode >= 500 && weatherCode < 600) {
    if (temperature < 0) {
      return {
        mood: 'cozy',
        description: 'Rain turning to snow—winter wonder outside your window',
        icon: '🌨️'
      };
    }
    return {
      mood: 'cozy',
      description: temperature < 10
        ? 'Cool rain—great day for tea and a good book'
        : 'Warm rain—perfect for listening to the patter on the roof',
      icon: '🌧️'
    };
  }

  // Snow (6xx)
  if (weatherCode >= 600 && weatherCode < 700) {
    return {
      mood: 'magical',
      description: 'Snowfall — everything is hushed and beautiful',
      icon: '❄️'
    };
  }

  // Atmosphere (7xx) - fog, mist, etc
  if (weatherCode >= 700 && weatherCode < 800) {
    if (isDaytime) {
      return {
        mood: 'mysterious',
        description: 'Misty air—like walking through clouds',
        icon: '🌫️'
      };
    }
    return {
      mood: 'mysterious',
      description: 'Fog rolling in—mysteriously atmospheric',
      icon: '🌫️'
    };
  }

  // Clear sky (800)
  if (weatherCode === 800) {
    if (isDaytime) {
      if (temperature > 20) {
        return {
          mood: 'perfect',
          description: `Clear skies and ${Math.round(temperature)}°—ideal for being outside`,
          icon: '☀️'
        };
      }
      return {
        mood: 'crisp',
        description: `Bright and clear—${Math.round(temperature)}° for an energizing day`,
        icon: '☀️'
      };
    }
    // Nighttime clear
    const timeUntilSunrise = sunrise - now;
    if (timeUntilSunrise < 3600) {
      // Less than 1 hour until sunrise
      return {
        mood: 'dawn',
        description: 'Clear skies just before sunrise—you could catch the dawn',
        icon: '🌅'
      };
    }
    return {
      mood: 'starry',
      description: temperature < 5
        ? 'Crystal clear night—perfect for stargazing (bundle up!)'
        : 'Clear night skies—perfect for stargazing',
      icon: '✨'
    };
  }

  // Clouds (80x)
  if (weatherCode > 800 && weatherCode < 810) {
    if (isDaytime) {
      if (cloudCover > 70) {
        return {
          mood: 'overcast',
          description: 'Overcast but pleasant—comfortable weather for wandering',
          icon: '☁️'
        };
      }
      return {
        mood: 'partly-cloudy',
        description: 'Partly cloudy—nice balance of sun and shade',
        icon: '⛅'
      };
    }
    // Nighttime partly cloudy
    return {
      mood: 'cloudy',
      description: 'Cloudy night—cozy indoor weather',
      icon: '☁️'
    };
  }

  // Fallback
  return {
    mood: 'weather',
    description: `It's... weather! Probably a great day`,
    icon: '🌤️'
  };
}

