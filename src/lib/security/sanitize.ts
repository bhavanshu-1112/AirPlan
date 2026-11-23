const DEFAULT_MAX_LENGTH = 1000;

/**
 * Trim and limit the length of a string.
 * @param input - The string to sanitize
 * @param maxLength - Maximum allowed length (default: 1000)
 */
export function sanitizeString(input: string, maxLength: number = DEFAULT_MAX_LENGTH): string {
  const trimmed = input.trim();
  if (trimmed.length <= maxLength) {
    return trimmed;
  }
  return trimmed.slice(0, maxLength);
}

/**
 * Redact latitude/longitude coordinate patterns in text.
 * Replaces patterns like "12.3456, 78.9012" or "lat: 12.34" with [REDACTED_COORDINATES].
 * @param text - Input text that may contain coordinates
 */
export function redactCoordinates(text: string): string {
  // Match decimal coordinate pairs: e.g. "28.6139, 77.2090" or "-33.87, 151.21"
  // Bounded length (1-3 digits) guarantees linear evaluation time.
  // eslint-disable-next-line security/detect-unsafe-regex
  const coordPairPattern = /-?\d{1,3}(?:\.\d+)?\s*,\s*-?\d{1,3}(?:\.\d+)?/g;

  // Match labeled coordinates: "lat: 28.61" / "latitude: 28.61" / "lon: 77.20" / "longitude: 77.20"
  // Bounded length (1-3 digits) guarantees linear evaluation time.
  // eslint-disable-next-line security/detect-unsafe-regex
  const labeledPattern = /(?:lat(?:itude)?|lon(?:gitude)?)\s*[:=]\s*-?\d{1,3}(?:\.\d+)?/gi;

  return text
    .replace(coordPairPattern, '[REDACTED_COORDINATES]')
    .replace(labeledPattern, '[REDACTED_COORDINATES]');
}

/**
 * Redact API key patterns in text.
 * Replaces common patterns like "key=...", "api_key=...", "apikey=...", bearer tokens, etc.
 * @param text - Input text that may contain API keys
 */
export function redactApiKey(text: string): string {
  // Match key=VALUE patterns (query params / config values)
  const keyParamPattern =
    /(?:api[_-]?key|apikey|access[_-]?token|secret|bearer)\s*[:=]\s*[\w\-._~+/]{8,}/gi;

  // Match Authorization: Bearer <token>
  const bearerPattern = /Bearer\s+[\w\-._~+/]{8,}/gi;

  return text
    .replace(keyParamPattern, '[REDACTED_API_KEY]')
    .replace(bearerPattern, 'Bearer [REDACTED_API_KEY]');
}
