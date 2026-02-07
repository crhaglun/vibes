<script lang="ts">
  import { onMount } from 'svelte';
  import { browser } from '$app/environment';

  /** Component-level configuration */
  const config = {
    /** How long to keep weather data before refreshing */
    cacheTtl: 60 * 60 * 1000, // 1 hour (moderately expensive, depends on API rate limits)

    /** Cache key for storing weather data in sessionStorage */
    cacheKey: 'vibes_weatherData'
  };

  let state = 'loading';
  let sunshineData = null;
  let errorMessage = '';

  function loadFromCache() {
    if (!browser) return null;

    const stored = sessionStorage.getItem(config.cacheKey);
    if (!stored) return null;

    const cached = JSON.parse(stored);
    const age = Date.now() - cached.timestamp;
    const isExpired = age > config.cacheTtl;

    if (isExpired) {
      sessionStorage.removeItem(config.cacheKey);
      return null;
    }

    return cached.sunshineData;
  }

  function saveToCache(data) {
    if (!browser) return;

    const cached = {
      sunshineData: data,
      timestamp: Date.now()
    };
    sessionStorage.setItem(config.cacheKey, JSON.stringify(cached));
  }

  function requestGeolocation() {
    return new Promise((resolve) => {
      if (!navigator.geolocation) {
        console.log('[SunshineWidget] Geolocation not supported');
        resolve(null);
        return;
      }

      const timeout = setTimeout(() => {
        console.log('[SunshineWidget] Geolocation request timed out');
        resolve(null);
      }, 5000);

      navigator.geolocation.getCurrentPosition(
        (position) => {
          clearTimeout(timeout);
          resolve({
            lat: position.coords.latitude,
            lon: position.coords.longitude
          });
        },
        (error) => {
          clearTimeout(timeout);
          console.log('[SunshineWidget] Geolocation denied or error:', error.message);
          resolve(null);
        },
        {
          enableHighAccuracy: false,
          timeout: 5000,
          maximumAge: 0
        }
      );
    });
  }

  async function getLocationWithFallback() {
    const geoLocation = await requestGeolocation();
    if (geoLocation) {
      return geoLocation;
    }

    try {
      const response = await fetch('/api/weather/location');
      const data = await response.json();
      if (data.success) {
        return data.coordinates;
      }
    } catch (error) {
      console.error('[SunshineWidget] Error getting IP location:', error);
    }

    return { lat: 59.3293, lon: 18.0686 };
  }

  async function fetchWeatherMood(lat, lon) {
    try {
      const response = await fetch(
        `/api/weather/sunshine?lat=${lat}&lon=${lon}`
      );
      const data = await response.json();

      if (!data.success) {
        throw new Error(data.error || 'Failed to fetch weather data');
      }

      const weatherInfo = {
        location: data.location || 'Unknown location',
        temperature: data.temperature || 0,
        mood: data.mood || 'weather',
        description: data.description || 'Check the weather',
        icon: data.icon || '🌤️',
        coordinates: data.coordinates || { lat, lon }
      };

      sunshineData = weatherInfo;
      saveToCache(weatherInfo);
      state = 'success';
    } catch (error) {
      console.error('[SunshineWidget] Error fetching weather:', error);
      errorMessage = "We couldn't check the weather right now. Please try again!";
      state = 'error';
    }
  }

  onMount(async () => {
    if (!browser) return;

    const cached = loadFromCache();
    if (cached) {
      sunshineData = cached;
      state = 'success';
      return;
    }

    state = 'permission';
    const location = await getLocationWithFallback();
    await fetchWeatherMood(location.lat, location.lon);
  });
</script>

<div class="sunshine-widget">
  {#if state === 'loading' || state === 'permission'}
    <div class="loading-state">
      <div class="sun-icon rotating">☀️</div>
      <p>Finding sunshine near you...</p>
    </div>
  {:else if state === 'error'}
    <div class="error-state">
      <p class="error-message">{errorMessage}</p>
    </div>
  {:else if state === 'success' && sunshineData}
    <div class="success-state">
      <div class="icon">
        {sunshineData.icon}
      </div>
      <div class="content">
        <h3 class="title">
          {sunshineData.location}
        </h3>
        <p class="description">{sunshineData.description}</p>
        <div class="details">
          <span class="temperature">{sunshineData.temperature}°C</span>
        </div>
      </div>
    </div>
  {/if}
</div>

<style>
  .sunshine-widget {
    border: 3px solid var(--pastel-lavender);
    border-radius: 20px;
    padding: var(--spacing-xl);
    margin: var(--spacing-2xl) 0;
    animation: slideUp 0.8s ease-out;
    color: var(--text-primary);
  }

  .loading-state {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: var(--spacing-md);
    text-align: center;
  }

  .sun-icon {
    font-size: 48px;
    animation: pulse 2s ease-in-out infinite;
  }

  .rotating {
    animation: rotate 4s linear infinite, pulse 2s ease-in-out infinite;
  }

  @keyframes rotate {
    from {
      transform: rotate(0deg);
    }
    to {
      transform: rotate(360deg);
    }
  }

  @keyframes pulse {
    0%,
    100% {
      opacity: 1;
    }
    50% {
      opacity: 0.6;
    }
  }

  @keyframes slideUp {
    from {
      opacity: 0;
      transform: translateY(20px);
    }
    to {
      opacity: 1;
      transform: translateY(0);
    }
  }

  .success-state {
    display: flex;
    align-items: center;
    gap: var(--spacing-lg);
  }

  .icon {
    font-size: 64px;
    flex-shrink: 0;
    animation: pulse 2s ease-in-out infinite;
  }

  .content {
    flex: 1;
    text-align: left;
  }

  .title {
    font-size: var(--font-size-xl);
    color: var(--text-primary);
    margin: 0 0 var(--spacing-sm) 0;
  }

  .description {
    font-size: var(--font-size-base);
    color: var(--text-primary);
    margin: 0 0 var(--spacing-sm) 0;
    line-height: 1.5;
  }

  .details {
    display: flex;
    gap: var(--spacing-md);
    font-size: var(--font-size-sm);
    color: var(--text-secondary);
    margin: 0;
  }

  .temperature {
    display: inline-block;
  }

  .error-state {
    color: var(--text-secondary);
    font-style: italic;
    text-align: center;
    padding: var(--spacing-md);
  }

  .error-message {
    margin: 0;
  }

  @media (max-width: 768px) {
    .sunshine-widget {
      padding: var(--spacing-lg);
      margin: var(--spacing-lg) 0;
    }

    .success-state {
      flex-direction: column;
      text-align: center;
      align-items: center;
    }

    .content {
      text-align: center;
    }

    .details {
      justify-content: center;
    }

    .icon {
      font-size: 48px;
    }
  }
</style>
