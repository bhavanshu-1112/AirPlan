import { logger } from '@/lib/security/logger';

describe('logger', () => {
  let stderrSpy: jest.SpiedFunction<typeof process.stderr.write>;

  beforeEach(() => {
    stderrSpy = jest.spyOn(process.stderr, 'write').mockImplementation(() => true);
  });

  afterEach(() => {
    stderrSpy.mockRestore();
  });

  it('logs info messages to stderr', () => {
    logger.info('test message');
    expect(stderrSpy).toHaveBeenCalledTimes(1);
    const output = stderrSpy.mock.calls[0]![0] as string;
    const parsed = JSON.parse(output);
    expect(parsed.level).toBe('info');
    expect(parsed.message).toBe('test message');
    expect(parsed.timestamp).toBeDefined();
  });

  it('logs warn messages', () => {
    logger.warn('warning');
    const output = stderrSpy.mock.calls[0]![0] as string;
    expect(JSON.parse(output).level).toBe('warn');
  });

  it('logs error messages', () => {
    logger.error('error');
    const output = stderrSpy.mock.calls[0]![0] as string;
    expect(JSON.parse(output).level).toBe('error');
  });

  it('redacts sensitive keys', () => {
    logger.info('request', {
      apiKey: 'sk-secret',
      latitude: 28.45,
      longitude: 77.02,
      city: 'Gurugram',
    });
    const output = stderrSpy.mock.calls[0]![0] as string;
    const parsed = JSON.parse(output);
    expect(parsed.data.apiKey).toBe('[REDACTED]');
    expect(parsed.data.latitude).toBe('[REDACTED]');
    expect(parsed.data.longitude).toBe('[REDACTED]');
    expect(parsed.data.city).toBe('Gurugram');
  });

  it('redacts nested sensitive keys', () => {
    logger.info('nested', { user: { password: '123', name: 'test' } });
    const output = stderrSpy.mock.calls[0]![0] as string;
    const parsed = JSON.parse(output);
    expect(parsed.data.user.password).toBe('[REDACTED]');
    expect(parsed.data.user.name).toBe('test');
  });

  it('handles log without data', () => {
    logger.info('no data');
    const output = stderrSpy.mock.calls[0]![0] as string;
    const parsed = JSON.parse(output);
    expect(parsed.data).toBeUndefined();
  });
});
