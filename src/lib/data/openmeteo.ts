import { TTLCache } from './cache';
import { ForecastResponseSchema, GeocodingResultSchema } from '@/lib/schemas/forecast';
import type { ForecastResponse, GeocodingResult } from '@/lib/schemas/forecast';
import { logger } from '@/lib/security/logger';
import forecastFixture from '@/fixtures/forecast.json';
import geocodingFixtureRaw from '@/fixtures/geocoding.json';

// Cache instances
const forecastCache = new TTLCache<ForecastResponse>(30 * 60 * 1000); // 30 min
const geocodingCache = new TTLCache<GeocodingResult[]>(24 * 60 * 60 * 1000); // 24 h

function isDemoMode(): boolean {
  return process.env['DEMO_MODE'] === 'true';
}

async function fetchWithTimeout(url: string, timeoutMs: number = 10000): Promise<Response> {
  const controller = new AbortController();
  const id = setTimeout(() => controller.abort(), timeoutMs);
  try {
    return await fetch(url, { signal: controller.signal });
  } finally {
    clearTimeout(id);
  }
}

async function fetchWithRetry(url: string, maxRetries: number = 2): Promise<Response> {
  let lastError: unknown;
  for (let attempt = 0; attempt <= maxRetries; attempt++) {
    try {
      const res = await fetchWithTimeout(url);
      if (!res.ok) throw new Error(`HTTP ${res.status}: ${res.statusText}`);
      return res;
    } catch (err) {
      lastError = err;
      if (attempt < maxRetries) {
        // Exponential backoff: 1s, 2s
        await new Promise<void>((resolve) => setTimeout(resolve, 1000 * Math.pow(2, attempt)));
      }
    }
  }
  throw lastError;
}

const parsedForecastFixture = ForecastResponseSchema.parse(forecastFixture);
const parsedGeocodingFixture: GeocodingResult[] = geocodingFixtureRaw.map((item) =>
  GeocodingResultSchema.parse(item),
);

/**
 * Fetch air quality forecast for a given location.
 * Falls back to fixtures on network failure or in DEMO_MODE.
 * @param latitude - Latitude in decimal degrees
 * @param longitude - Longitude in decimal degrees
 */
export async function fetchForecast(
  latitude: number,
  longitude: number,
): Promise<ForecastResponse> {
  if (isDemoMode()) return parsedForecastFixture;
  const key = `${latitude},${longitude}`;
  return forecastCache.getOrFetch(key, async () => {
    try {
      const url =
        `https://air-quality-api.open-meteo.com/v1/air-quality` +
        `?latitude=${latitude}&longitude=${longitude}` +
        `&hourly=pm2_5,pm10,us_aqi&forecast_days=3&timezone=auto`;
      const res = await fetchWithRetry(url);
      const data: unknown = await res.json();
      return ForecastResponseSchema.parse(data);
    } catch (err) {
      logger.warn('[openmeteo] fetchForecast failed, using fixture fallback', {
        error: err instanceof Error ? err.message : String(err),
      });
      return parsedForecastFixture;
    }
  });
}

/**
 * Search for cities by name using Open-Meteo Geocoding API.
 * Falls back to fixtures on network failure or in DEMO_MODE.
 * @param name - City name to search for
 */
export async function searchCity(name: string): Promise<GeocodingResult[]> {
  if (isDemoMode()) return parsedGeocodingFixture;
  const key = name.toLowerCase().trim();
  return geocodingCache.getOrFetch(key, async () => {
    try {
      const url =
        `https://geocoding-api.open-meteo.com/v1/search` +
        `?name=${encodeURIComponent(name)}&count=5&language=en&format=json`;
      const res = await fetchWithRetry(url);
      const data: unknown = await res.json();
      const parsed = data as { results?: unknown[] };
      const results = parsed.results ?? [];
      return results.map((item) => GeocodingResultSchema.parse(item));
    } catch (err) {
      logger.warn('[openmeteo] searchCity failed, using fixture fallback', {
        error: err instanceof Error ? err.message : String(err),
      });
      return parsedGeocodingFixture;
    }
  });
}
