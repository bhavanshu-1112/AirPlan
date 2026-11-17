export class AppError extends Error {
  constructor(
    public readonly code: string,
    message: string,
    public readonly statusCode: number,
    public readonly details?: unknown,
  ) {
    super(message);
    this.name = 'AppError';
  }
}

export class ValidationError extends AppError {
  constructor(message: string, details?: unknown) {
    super('VALIDATION_ERROR', message, 400, details);
    this.name = 'ValidationError';
  }
}

export class RateLimitError extends AppError {
  constructor(message?: string) {
    super('RATE_LIMIT_ERROR', message ?? 'Too many requests', 429);
    this.name = 'RateLimitError';
  }
}

export class UpstreamError extends AppError {
  constructor(message: string) {
    super('UPSTREAM_ERROR', message, 502);
    this.name = 'UpstreamError';
  }
}

export class NotFoundError extends AppError {
  constructor(message: string) {
    super('NOT_FOUND', message, 404);
    this.name = 'NotFoundError';
  }
}

export class ConfigError extends AppError {
  constructor(message: string) {
    super('CONFIG_ERROR', message, 500);
    this.name = 'ConfigError';
  }
}

export function errorToResponse(error: unknown): Response {
  if (error instanceof AppError) {
    return Response.json(
      { error: { code: error.code, message: error.message } },
      { status: error.statusCode },
    );
  }
  return Response.json(
    { error: { code: 'INTERNAL_ERROR', message: 'Internal server error' } },
    { status: 500 },
  );
}
