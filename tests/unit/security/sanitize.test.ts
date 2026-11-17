import { sanitizeString, redactCoordinates, redactApiKey } from '../../../src/lib/security/sanitize';

describe('sanitizeString', () => {
  it('trims leading and trailing whitespace', () => {
    expect(sanitizeString('  hello  ')).toBe('hello');
  });

  it('limits string to default 1000 chars', () => {
    const long = 'a'.repeat(1500);
    const result = sanitizeString(long);
    expect(result.length).toBe(1000);
  });

  it('limits string to custom maxLength', () => {
    const result = sanitizeString('hello world', 5);
    expect(result).toBe('hello');
  });

  it('returns unchanged string within limit', () => {
    expect(sanitizeString('short', 100)).toBe('short');
  });

  it('handles empty string', () => {
    expect(sanitizeString('')).toBe('');
  });

  it('trims then limits', () => {
    // '  abc  ' trimmed = 'abc' (3 chars) which is <= 2 after trim... no wait
    // '  abcde  ' trimmed = 'abcde', maxLength=3 → 'abc'
    expect(sanitizeString('  abcde  ', 3)).toBe('abc');
  });
});

describe('redactCoordinates', () => {
  it('redacts coordinate pairs like "28.6139, 77.2090"', () => {
    const result = redactCoordinates('Location is 28.6139, 77.2090 in Delhi');
    expect(result).not.toContain('28.6139');
    expect(result).toContain('[REDACTED_COORDINATES]');
  });

  it('redacts negative coordinate pairs', () => {
    const result = redactCoordinates('Sydney: -33.87, 151.21');
    expect(result).not.toContain('-33.87');
    expect(result).toContain('[REDACTED_COORDINATES]');
  });

  it('redacts labeled latitude', () => {
    const result = redactCoordinates('lat: 28.61 and other info');
    expect(result).not.toContain('28.61');
    expect(result).toContain('[REDACTED_COORDINATES]');
  });

  it('redacts labeled longitude', () => {
    const result = redactCoordinates('longitude: 77.209');
    expect(result).toContain('[REDACTED_COORDINATES]');
  });

  it('leaves non-coordinate text intact', () => {
    const text = 'The temperature is 36 degrees';
    expect(redactCoordinates(text)).toBe(text);
  });

  it('handles text without any coordinates', () => {
    const text = 'Hello world';
    expect(redactCoordinates(text)).toBe(text);
  });
});

describe('redactApiKey', () => {
  it('redacts api_key= pattern', () => {
    const result = redactApiKey('url?api_key=abc123def456');
    expect(result).not.toContain('abc123def456');
    expect(result).toContain('[REDACTED_API_KEY]');
  });

  it('redacts apiKey: pattern', () => {
    const result = redactApiKey('apiKey: supersecretkey12345');
    expect(result).not.toContain('supersecretkey12345');
    expect(result).toContain('[REDACTED_API_KEY]');
  });

  it('redacts Bearer token', () => {
    const result = redactApiKey('Authorization: Bearer eyJhbGciOiJSUzI1NiJ9.payload');
    expect(result).not.toContain('eyJhbGciOiJSUzI1NiJ9');
    expect(result).toContain('[REDACTED_API_KEY]');
  });

  it('redacts secret= pattern', () => {
    const result = redactApiKey('secret=mysupersecretvalue123');
    expect(result).toContain('[REDACTED_API_KEY]');
  });

  it('leaves unrelated text intact', () => {
    const text = 'Hello world from the API';
    expect(redactApiKey(text)).toBe(text);
  });

  it('leaves short values (under 8 chars) intact to avoid false positives', () => {
    // "key=abc" is 3 chars, should not be redacted
    const text = 'api_key=short';
    // "short" is 5 chars — below 8, so won't match
    const result = redactApiKey(text);
    expect(result).toBe(text);
  });
});
