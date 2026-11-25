import {
  getGeminiClient,
  resetGeminiClient,
  getModelName,
  getFallbackModels,
  getAllModels,
  isQuotaOrUnavailableError,
  GeminiClient,
} from '@/lib/llm/client';

describe('Gemini LLM client and fallback orchestration', () => {
  const originalEnv = process.env;

  beforeEach(() => {
    process.env = { ...originalEnv };
    resetGeminiClient();
    jest.restoreAllMocks();
  });

  afterAll(() => {
    process.env = originalEnv;
    resetGeminiClient();
  });

  describe('singleton getter & env configuration', () => {
    it('returns undefined in DEMO_MODE', () => {
      process.env['DEMO_MODE'] = 'true';
      expect(getGeminiClient()).toBeUndefined();
    });

    it('throws ConfigError when API key is missing and not in DEMO_MODE', () => {
      process.env['DEMO_MODE'] = 'false';
      delete process.env['GEMINI_API_KEY'];
      expect(() => getGeminiClient()).toThrow(/GEMINI_API_KEY/);
    });

    it('returns client singleton when GEMINI_API_KEY is provided', () => {
      process.env['DEMO_MODE'] = 'false';
      process.env['GEMINI_API_KEY'] = 'test-key-123';
      const client1 = getGeminiClient();
      const client2 = getGeminiClient();
      expect(client1).toBeInstanceOf(GeminiClient);
      expect(client1).toBe(client2);
    });

    it('returns default model name gemini-3.8-flash', () => {
      delete process.env['GEMINI_MODEL'];
      expect(getModelName()).toBe('gemini-3.8-flash');
    });

    it('returns custom model name from GEMINI_MODEL env', () => {
      process.env['GEMINI_MODEL'] = 'custom-gemini-model';
      expect(getModelName()).toBe('custom-gemini-model');
    });

    it('normalizes spaces in model names', () => {
      process.env['GEMINI_MODEL'] = 'gemini 3.8 flash';
      expect(getModelName()).toBe('gemini-3.8-flash');
    });

    it('returns default fallback models [gemini-2.5-flash, gemini-3.5-flash-lite]', () => {
      delete process.env['GEMINI_FALLBACK_MODELS'];
      expect(getFallbackModels()).toEqual(['gemini-2.5-flash', 'gemini-3.5-flash-lite']);
    });

    it('returns custom fallback models from GEMINI_FALLBACK_MODELS', () => {
      process.env['GEMINI_FALLBACK_MODELS'] = 'gemini 2.5 flash, gemini 3.5 flash lite';
      expect(getFallbackModels()).toEqual(['gemini-2.5-flash', 'gemini-3.5-flash-lite']);
    });

    it('returns all models via getAllModels', () => {
      delete process.env['GEMINI_MODEL'];
      delete process.env['GEMINI_FALLBACK_MODELS'];
      expect(getAllModels()).toEqual([
        'gemini-3.8-flash',
        'gemini-2.5-flash',
        'gemini-3.5-flash-lite',
      ]);
    });
  });

  describe('isQuotaOrUnavailableError', () => {
    it('detects HTTP status codes 429, 503, 500, 502, 504', () => {
      expect(isQuotaOrUnavailableError(new Error('err'), 429)).toBe(true);
      expect(isQuotaOrUnavailableError(new Error('err'), 503)).toBe(true);
      expect(isQuotaOrUnavailableError(new Error('err'), 500)).toBe(true);
      expect(isQuotaOrUnavailableError(new Error('err'), 502)).toBe(true);
      expect(isQuotaOrUnavailableError(new Error('err'), 504)).toBe(true);
      expect(isQuotaOrUnavailableError(new Error('err'), 400)).toBe(false);
    });

    it('detects status property on error objects', () => {
      expect(isQuotaOrUnavailableError({ status: 429, message: 'Too many' })).toBe(true);
      expect(isQuotaOrUnavailableError({ status: 503, message: 'Unavailable' })).toBe(true);
      expect(isQuotaOrUnavailableError({ code: 429, message: 'Quota' })).toBe(true);
      expect(isQuotaOrUnavailableError({ code: 503, message: 'Server' })).toBe(true);
    });

    it('detects quota and rate-limit keywords in error message', () => {
      expect(
        isQuotaOrUnavailableError(new Error('Resource has been exhausted (e.g. check quota)')),
      ).toBe(true);
      expect(isQuotaOrUnavailableError(new Error('Rate limit exceeded'))).toBe(true);
      expect(
        isQuotaOrUnavailableError(new Error('This model is currently experiencing high demand')),
      ).toBe(true);
      expect(isQuotaOrUnavailableError(new Error('Service Unavailable'))).toBe(true);
      expect(isQuotaOrUnavailableError(new Error('UND_ERR_HEADERS_TIMEOUT'))).toBe(true);
      expect(isQuotaOrUnavailableError(new Error('fetch failed'))).toBe(true);
      expect(isQuotaOrUnavailableError(new Error('Invalid argument: missing field'))).toBe(false);
    });
  });

  describe('GeminiClient execution and model fallback', () => {
    const client = new GeminiClient({
      apiKey: 'dummy-api-key',
      primaryModel: 'gemini-3.8-flash',
      fallbackModels: ['gemini-2.5-flash', 'gemini-3.5-flash-lite'],
      defaultTimeoutMs: 2000,
    });

    it('succeeds on primary model without triggering fallback', async () => {
      const mockFetch = jest.spyOn(global, 'fetch').mockImplementation(async (url, init) => {
        expect(String(url)).toContain('gemini-3.8-flash');
        const body = JSON.parse(String(init?.body));
        expect(body.systemInstruction).toBeDefined();
        expect(body.generationConfig).toBeDefined();
        expect(body.tools).toBeDefined();
        return {
          ok: true,
          status: 200,
          json: async () => ({
            candidates: [{ content: { parts: [{ text: 'Primary model response' }] } }],
          }),
        } as unknown as Response;
      });

      const res = await client.generateContent({
        systemInstruction: { parts: [{ text: 'System prompt' }] },
        generationConfig: { temperature: 0.1 },
        tools: [{ name: 'test_tool' }],
        contents: [{ role: 'user', parts: [{ text: 'Hello' }] }],
      });

      expect(res.model).toBe('gemini-3.8-flash');
      expect(res.text).toBe('Primary model response');
      expect(res.fallbackTriggered).toBe(false);
      expect(res.modelsAttempted).toEqual(['gemini-3.8-flash']);
      mockFetch.mockRestore();
    });

    it('falls back from gemini-3.8-flash to gemini-2.5-flash on 503 / high demand', async () => {
      const calls: string[] = [];
      const mockFetch = jest.spyOn(global, 'fetch').mockImplementation(async (url) => {
        const urlStr = String(url);
        if (urlStr.includes('gemini-3.8-flash')) {
          calls.push('gemini-3.8-flash');
          return {
            ok: false,
            status: 503,
            statusText: 'Service Unavailable',
            json: async () => ({
              error: {
                code: 503,
                message:
                  'This model is currently experiencing high demand. Spikes in demand are usually temporary.',
                status: 'UNAVAILABLE',
              },
            }),
          } as unknown as Response;
        }

        if (urlStr.includes('gemini-2.5-flash')) {
          calls.push('gemini-2.5-flash');
          return {
            ok: true,
            status: 200,
            json: async () => ({
              candidates: [{ content: { parts: [{ text: 'Fallback 2 response' }] } }],
            }),
          } as unknown as Response;
        }

        throw new Error('Unexpected URL ' + urlStr);
      });

      const res = await client.generateContent({
        contents: [{ role: 'user', parts: [{ text: 'Plan query' }] }],
      });

      expect(res.model).toBe('gemini-2.5-flash');
      expect(res.text).toBe('Fallback 2 response');
      expect(res.fallbackTriggered).toBe(true);
      expect(res.modelsAttempted).toEqual(['gemini-3.8-flash', 'gemini-2.5-flash']);
      expect(calls).toEqual(['gemini-3.8-flash', 'gemini-2.5-flash']);
      mockFetch.mockRestore();
    });

    it('falls back to gemini-3.5-flash-lite when model 1 and 2 hit quota (429)', async () => {
      const calls: string[] = [];
      const mockFetch = jest.spyOn(global, 'fetch').mockImplementation(async (url) => {
        const urlStr = String(url);
        if (urlStr.includes('gemini-3.8-flash')) {
          calls.push('gemini-3.8-flash');
          return {
            ok: false,
            status: 429,
            statusText: 'Too Many Requests',
            json: async () => ({
              error: {
                code: 429,
                message: 'Resource has been exhausted (check quota)',
                status: 'RESOURCE_EXHAUSTED',
              },
            }),
          } as unknown as Response;
        }

        if (urlStr.includes('gemini-2.5-flash')) {
          calls.push('gemini-2.5-flash');
          return {
            ok: false,
            status: 429,
            statusText: 'Too Many Requests',
            json: async () => ({
              error: {
                code: 429,
                message: 'Quota exceeded for model 2',
                status: 'RESOURCE_EXHAUSTED',
              },
            }),
          } as unknown as Response;
        }

        if (urlStr.includes('gemini-3.5-flash-lite')) {
          calls.push('gemini-3.5-flash-lite');
          return {
            ok: true,
            status: 200,
            json: async () => ({
              candidates: [{ content: { parts: [{ text: 'Fallback 3 response' }] } }],
            }),
          } as unknown as Response;
        }

        throw new Error('Unexpected URL ' + urlStr);
      });

      const res = await client.generateContent({
        contents: [{ role: 'user', parts: [{ text: 'Plan query' }] }],
      });

      expect(res.model).toBe('gemini-3.5-flash-lite');
      expect(res.text).toBe('Fallback 3 response');
      expect(res.fallbackTriggered).toBe(true);
      expect(res.modelsAttempted).toEqual([
        'gemini-3.8-flash',
        'gemini-2.5-flash',
        'gemini-3.5-flash-lite',
      ]);
      expect(calls).toEqual(['gemini-3.8-flash', 'gemini-2.5-flash', 'gemini-3.5-flash-lite']);
      mockFetch.mockRestore();
    });

    it('throws error when non-json error is returned and all models fail', async () => {
      const mockFetch = jest.spyOn(global, 'fetch').mockImplementation(async () => {
        return {
          ok: false,
          status: 503,
          statusText: 'Gateway Unavailable',
          json: async () => {
            throw new Error('Not JSON');
          },
        } as unknown as Response;
      });

      await expect(
        client.generateContent({
          contents: [{ role: 'user', parts: [{ text: 'Hi' }] }],
        }),
      ).rejects.toThrow(/Gateway Unavailable/);
      mockFetch.mockRestore();
    });

    it('does not fall back when user aborts with manual signal', async () => {
      const controller = new AbortController();
      controller.abort();

      const mockFetch = jest.spyOn(global, 'fetch').mockImplementation(async () => {
        throw new Error('Aborted');
      });

      await expect(
        client.generateContent({
          contents: [{ role: 'user', parts: [{ text: 'Hi' }] }],
          signal: controller.signal,
        }),
      ).rejects.toThrow();
      mockFetch.mockRestore();
    });
  });
});
