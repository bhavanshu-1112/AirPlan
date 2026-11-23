type LogLevel = 'info' | 'warn' | 'error';

interface LogEntry {
  level: LogLevel;
  message: string;
  timestamp: string;
  data?: Record<string, unknown> | undefined;
}

const SENSITIVE_KEYS = new Set([
  'password',
  'apikey',
  'api_key',
  'secret',
  'token',
  'accesstoken',
  'access_token',
  'authorization',
  'cookie',
  'latitude',
  'longitude',
  'lat',
  'lon',
]);

function redactSensitive(data: Record<string, unknown>): Record<string, unknown> {
  const result = new Map<string, unknown>();
  for (const [key, value] of Object.entries(data)) {
    if (SENSITIVE_KEYS.has(key.toLowerCase())) {
      result.set(key, '[REDACTED]');
    } else if (value !== null && typeof value === 'object' && !Array.isArray(value)) {
      result.set(key, redactSensitive(value as Record<string, unknown>));
    } else {
      result.set(key, value);
    }
  }
  return Object.fromEntries(result);
}

function createLogEntry(
  level: LogLevel,
  message: string,
  data?: Record<string, unknown> | undefined,
): LogEntry {
  const entry: LogEntry = {
    level,
    message,
    timestamp: new Date().toISOString(),
  };
  if (data !== undefined) {
    entry.data = redactSensitive(data);
  }
  return entry;
}

function writeEntry(entry: LogEntry): void {
  const line = JSON.stringify(entry) + '\n';
  process.stderr.write(line);
}

export const logger = {
  info: (message: string, data?: Record<string, unknown>): void => {
    writeEntry(createLogEntry('info', message, data));
  },
  warn: (message: string, data?: Record<string, unknown>): void => {
    writeEntry(createLogEntry('warn', message, data));
  },
  error: (message: string, data?: Record<string, unknown>): void => {
    writeEntry(createLogEntry('error', message, data));
  },
};
