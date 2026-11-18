import { getAnthropicClient, getModelName } from '@/lib/llm/client';

describe('llm client', () => {
  const originalEnv = process.env;

  beforeEach(() => {
    process.env = { ...originalEnv };
  });

  afterAll(() => {
    process.env = originalEnv;
  });

  it('returns undefined in DEMO_MODE', () => {
    process.env['DEMO_MODE'] = 'true';
    const client = getAnthropicClient();
    expect(client).toBeUndefined();
  });

  it('throws ConfigError when API key missing and not demo', () => {
    process.env['DEMO_MODE'] = 'false';
    delete process.env['ANTHROPIC_API_KEY'];
    expect(() => getAnthropicClient()).toThrow('ANTHROPIC_API_KEY');
  });

  it('returns default model name', () => {
    delete process.env['ANTHROPIC_MODEL'];
    expect(getModelName()).toBe('claude-sonnet-4-20250514');
  });

  it('returns custom model name from env', () => {
    process.env['ANTHROPIC_MODEL'] = 'custom-model';
    expect(getModelName()).toBe('custom-model');
  });
});
