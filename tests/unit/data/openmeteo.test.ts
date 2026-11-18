import { fetchForecast, searchCity } from '@/lib/data/openmeteo';

// Tests run in DEMO_MODE implicitly since we don't set ANTHROPIC_API_KEY
// and the functions fall back to fixtures

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
});
