import {
  AppError,
  ValidationError,
  RateLimitError,
  UpstreamError,
  NotFoundError,
  ConfigError,
  errorToResponse,
} from '../../../src/lib/security/errors';

describe('AppError', () => {
  it('sets code, message, statusCode', () => {
    const err = new AppError('MY_CODE', 'my message', 418);
    expect(err.code).toBe('MY_CODE');
    expect(err.message).toBe('my message');
    expect(err.statusCode).toBe(418);
    expect(err.name).toBe('AppError');
    expect(err instanceof Error).toBe(true);
  });

  it('stores details when provided', () => {
    const err = new AppError('CODE', 'msg', 400, { field: 'name' });
    expect(err.details).toEqual({ field: 'name' });
  });

  it('details undefined when not provided', () => {
    const err = new AppError('CODE', 'msg', 400);
    expect(err.details).toBeUndefined();
  });
});

describe('ValidationError', () => {
  it('maps to 400', () => {
    const err = new ValidationError('Invalid input');
    expect(err.code).toBe('VALIDATION_ERROR');
    expect(err.statusCode).toBe(400);
    expect(err.name).toBe('ValidationError');
  });

  it('stores details', () => {
    const err = new ValidationError('Bad', { field: 'x' });
    expect(err.details).toEqual({ field: 'x' });
  });
});

describe('RateLimitError', () => {
  it('maps to 429 with default message', () => {
    const err = new RateLimitError();
    expect(err.code).toBe('RATE_LIMIT_ERROR');
    expect(err.statusCode).toBe(429);
    expect(err.message).toBe('Too many requests');
  });

  it('uses custom message', () => {
    const err = new RateLimitError('Slow down!');
    expect(err.message).toBe('Slow down!');
  });
});

describe('UpstreamError', () => {
  it('maps to 502', () => {
    const err = new UpstreamError('Service down');
    expect(err.code).toBe('UPSTREAM_ERROR');
    expect(err.statusCode).toBe(502);
    expect(err.message).toBe('Service down');
  });
});

describe('NotFoundError', () => {
  it('maps to 404', () => {
    const err = new NotFoundError('Resource missing');
    expect(err.code).toBe('NOT_FOUND');
    expect(err.statusCode).toBe(404);
  });
});

describe('ConfigError', () => {
  it('maps to 500', () => {
    const err = new ConfigError('Missing env var');
    expect(err.code).toBe('CONFIG_ERROR');
    expect(err.statusCode).toBe(500);
  });
});

describe('errorToResponse', () => {
  it('returns correct status and body for AppError', async () => {
    const err = new ValidationError('Bad field', { field: 'email' });
    const res = errorToResponse(err);
    expect(res.status).toBe(400);
    const body = await res.json() as { error: { code: string; message: string } };
    expect(body.error.code).toBe('VALIDATION_ERROR');
    expect(body.error.message).toBe('Bad field');
  });

  it('returns 500 for unknown error', async () => {
    const res = errorToResponse(new Error('oops'));
    expect(res.status).toBe(500);
    const body = await res.json() as { error: { code: string } };
    expect(body.error.code).toBe('INTERNAL_ERROR');
  });

  it('returns 500 for non-Error thrown value', async () => {
    const res = errorToResponse('string error');
    expect(res.status).toBe(500);
    const body = await res.json() as { error: { code: string } };
    expect(body.error.code).toBe('INTERNAL_ERROR');
  });

  it('returns 429 for RateLimitError', async () => {
    const res = errorToResponse(new RateLimitError());
    expect(res.status).toBe(429);
    const body = await res.json() as { error: { code: string } };
    expect(body.error.code).toBe('RATE_LIMIT_ERROR');
  });

  it('returns 502 for UpstreamError', async () => {
    const res = errorToResponse(new UpstreamError('down'));
    expect(res.status).toBe(502);
  });
});
