import { fetchForecast, searchCity } from '@/lib/data/openmeteo';

// Tests run in DEMO_MODE implicitly since we set it
// and also test the non-demo paths with mocked fetch

describe('openmeteo data adapters', () => {
  const originalEnv = process.env;

  beforeEach(() => {
    process.env = { ...originalEnv, DEMO_MODE: 'true' };
  });

  afterAll(() => {
    process.env = originalEnv;
  });

  describe('fetchForecast', () => {
    it('returns fixture data in demo mode', async () => {
      const result = await fetchForecast(28.4595, 77.0266);
      expect(result).toBeDefined();
      expect(result.hourly).toBeDefined();
      expect(result.hourly.pm2_5).toBeInstanceOf(Array);
      expect(result.hourly.pm10).toBeInstanceOf(Array);
      expect(result.hourly.us_aqi).toBeInstanceOf(Array);
      expect(result.hourly.time).toBeInstanceOf(Array);
      expect(result.hourly.pm2_5.length).toBeGreaterThan(0);
    });

    it('returns consistent data for same coordinates', async () => {
      const r1 = await fetchForecast(28.4595, 77.0266);
      const r2 = await fetchForecast(28.4595, 77.0266);
      expect(r1).toEqual(r2);
    });

    it('forecast has matching array lengths', async () => {
      const result = await fetchForecast(28.4595, 77.0266);
      const len = result.hourly.time.length;
      expect(result.hourly.pm2_5.length).toBe(len);
      expect(result.hourly.pm10.length).toBe(len);
      expect(result.hourly.us_aqi.length).toBe(len);
    });

    it('PM2.5 values are non-negative', async () => {
      const result = await fetchForecast(28.4595, 77.0266);
      for (const val of result.hourly.pm2_5) {
        expect(val).toBeGreaterThanOrEqual(0);
      }
    });
  });

  describe('searchCity', () => {
    it('returns fixture results in demo mode', async () => {
      const results = await searchCity('Delhi');
      expect(results).toBeInstanceOf(Array);
      expect(results.length).toBeGreaterThan(0);
    });

    it('each result has required fields', async () => {
      const results = await searchCity('Delhi');
      for (const r of results) {
        expect(r.name).toBeDefined();
        expect(typeof r.name).toBe('string');
        expect(typeof r.latitude).toBe('number');
        expect(typeof r.longitude).toBe('number');
        expect(typeof r.country).toBe('string');
      }
    });
  });

  describe('non-demo mode with fetch', () => {
    const originalFetch = globalThis.fetch;

    beforeEach(() => {
      process.env = { ...originalEnv, DEMO_MODE: 'false' };
    });

    afterEach(() => {
      globalThis.fetch = originalFetch;
    });

    it('fetchForecast falls back to fixture on network error', async () => {
      globalThis.fetch = jest.fn().mockRejectedValue(new Error('Network error'));
      // Use unique coordinates to avoid cache hit
      const result = await fetchForecast(10.123, 20.456);
      expect(result).toBeDefined();
      expect(result.hourly.pm2_5).toBeInstanceOf(Array);
    });

    it('fetchForecast falls back to fixture on HTTP error', async () => {
      globalThis.fetch = jest.fn().mockResolvedValue({
        ok: false,
        status: 500,
        statusText: 'Internal Server Error',
      });
      const result = await fetchForecast(11.111, 22.222);
      expect(result).toBeDefined();
      expect(result.hourly.pm2_5).toBeInstanceOf(Array);
    });

    it('searchCity falls back to fixture on network error', async () => {
      globalThis.fetch = jest.fn().mockRejectedValue(new Error('Network error'));
      const results = await searchCity('NonExistentCity12345');
      expect(results).toBeInstanceOf(Array);
      expect(results.length).toBeGreaterThan(0);
    });

    it('fetchForecast parses valid API response', async () => {
      const mockResponse = {
        hourly: {
          time: ['2024-01-01T00:00'],
          pm2_5: [45.0],
          pm10: [80.0],
          us_aqi: [120],
        },
        hourly_units: { pm2_5: 'µg/m³', pm10: 'µg/m³', us_aqi: '' },
      };
      globalThis.fetch = jest.fn().mockResolvedValue({
        ok: true,
        json: async () => mockResponse,
      });
      const result = await fetchForecast(33.333, 44.444);
      expect(result.hourly.pm2_5[0]).toBe(45.0);
    });

    it('searchCity parses valid API response', async () => {
      const mockResponse = {
        results: [{ name: 'TestCity', latitude: 10, longitude: 20, country: 'TC' }],
      };
      globalThis.fetch = jest.fn().mockResolvedValue({
        ok: true,
        json: async () => mockResponse,
      });
      const results = await searchCity('uniqueTestQuery999');
      expect(results.length).toBe(1);
      expect(results[0]!.name).toBe('TestCity');
    });

    it('searchCity handles empty results', async () => {
      const mockResponse = {};
      globalThis.fetch = jest.fn().mockResolvedValue({
        ok: true,
        json: async () => mockResponse,
      });
      const results = await searchCity('emptyResultQuery777');
      expect(results).toEqual([]);
    });
  });
});
