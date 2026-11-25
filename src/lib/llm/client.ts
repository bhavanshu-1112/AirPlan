import { ConfigError } from '@/lib/security/errors';
import { logger } from '@/lib/security/logger';

export interface GeminiPart {
  text?: string;
  inlineData?: {
    mimeType: string;
    data: string;
  };
  functionCall?: {
    name: string;
    args: Record<string, unknown>;
  };
  functionResponse?: {
    name: string;
    response: Record<string, unknown>;
  };
}

export interface GeminiContent {
  role?: 'user' | 'model' | 'system' | 'function' | string;
  parts: GeminiPart[];
}

export interface GeminiGenerateOptions {
  contents: GeminiContent[];
  systemInstruction?: {
    parts: Array<{ text: string }>;
  };
  generationConfig?: {
    temperature?: number;
    topP?: number;
    topK?: number;
    maxOutputTokens?: number;
    responseMimeType?: string;
    responseSchema?: Record<string, unknown>;
  };
  tools?: unknown[];
  timeoutMs?: number;
  signal?: AbortSignal;
}

export interface GeminiCandidate {
  content?: {
    role?: string;
    parts?: GeminiPart[];
  };
  finishReason?: string;
  citationMetadata?: unknown;
}

export interface GeminiGenerateResult {
  model: string;
  text: string;
  candidates: GeminiCandidate[];
  fallbackTriggered: boolean;
  modelsAttempted: string[];
  raw: Record<string, unknown>;
}

export interface GeminiClientConfig {
  apiKey: string;
  primaryModel?: string;
  fallbackModels?: string[];
  baseUrl?: string;
  defaultTimeoutMs?: number;
}

const RETRYABLE_STATUSES = new Set([429, 500, 502, 503, 504]);
const QUOTA_ERROR_REGEX =
  /quota|resource_exhausted|rate.?limit|429|503|unavailable|high demand|spikes in demand|overloaded|timeout|abort|fetch failed|headers timeout/i;

/** Type guard: check if an unknown value looks like an error with status/code properties. */
function hasStatusOrCode(error: unknown): error is { status?: number; code?: number | string } {
  return typeof error === 'object' && error !== null;
}

/** Type guard: check if an unknown value looks like an error with message/name properties. */
function hasMessageOrName(error: unknown): error is { message?: string; name?: string } {
  return typeof error === 'object' && error !== null;
}

function extractErrorStatus(error: unknown, status?: number): number {
  if (status !== undefined) return status;
  if (!hasStatusOrCode(error)) return NaN;
  return Number(error.status ?? error.code);
}

/** Check if an error indicates quota exhaustion, rate limit, high demand or unavailability. */
export function isQuotaOrUnavailableError(error: unknown, status?: number): boolean {
  if (RETRYABLE_STATUSES.has(extractErrorStatus(error, status))) {
    return true;
  }
  if (!hasMessageOrName(error)) return false;
  return QUOTA_ERROR_REGEX.test(`${error.name ?? ''} ${error.message ?? ''}`);
}

function buildRequestPayload(options: GeminiGenerateOptions): Record<string, unknown> {
  const payload: Record<string, unknown> = {
    contents: options.contents,
  };
  if (options.systemInstruction) {
    payload['systemInstruction'] = options.systemInstruction;
  }
  if (options.generationConfig) {
    payload['generationConfig'] = options.generationConfig;
  }
  if (options.tools) {
    payload['tools'] = options.tools;
  }
  return payload;
}

interface TimeoutAbortHandle {
  controller: AbortController;
  cleanup: () => void;
}

function setupAbortAndTimeout(
  options: GeminiGenerateOptions,
  defaultTimeout: number,
  model: string,
): TimeoutAbortHandle {
  const controller = new AbortController();
  const timeoutMs = options.timeoutMs ?? defaultTimeout;
  let timeoutId: NodeJS.Timeout | undefined;

  if (timeoutMs > 0) {
    timeoutId = setTimeout(() => {
      controller.abort(new Error(`Request to model ${model} timed out after ${timeoutMs}ms`));
    }, timeoutMs);
  }

  const onUserAbort = () => {
    controller.abort(options.signal?.reason);
  };

  if (options.signal) {
    options.signal.addEventListener('abort', onUserAbort, { once: true });
  }

  const cleanup = () => {
    if (timeoutId) clearTimeout(timeoutId);
    if (options.signal) {
      options.signal.removeEventListener('abort', onUserAbort);
    }
  };

  return { controller, cleanup };
}

/** Custom error class for HTTP errors from the Gemini API. */
class GeminiHttpError extends Error {
  readonly status: number;
  readonly code: number;

  constructor(message: string, status: number, code: number) {
    super(message);
    this.name = 'GeminiHttpError';
    this.status = status;
    this.code = code;
  }
}

interface GeminiErrorBody {
  error?: { message?: string; code?: number };
}

function isGeminiErrorBody(data: unknown): data is GeminiErrorBody {
  if (typeof data !== 'object' || data === null) return false;
  if (!('error' in data)) return true; // empty object is valid
  const obj = data as Record<string, unknown>;
  return typeof obj['error'] === 'object' || obj['error'] === undefined;
}

function throwFetchError(res: Response, errJson: GeminiErrorBody): never {
  const message = errJson.error?.message || `HTTP ${res.status}: ${res.statusText}`;
  throw new GeminiHttpError(message, res.status, errJson.error?.code ?? res.status);
}

interface GeminiFetchResult {
  text: string;
  candidates: GeminiCandidate[];
  raw: Record<string, unknown>;
}

interface GeminiRawResponse {
  candidates?: GeminiCandidate[];
}

function isGeminiRawResponse(data: unknown): data is GeminiRawResponse {
  return typeof data === 'object' && data !== null;
}

async function handleFetchResponse(res: Response): Promise<GeminiFetchResult> {
  if (!res.ok) {
    const rawErr: unknown = await res.json().catch(() => ({}));
    const errJson: GeminiErrorBody = isGeminiErrorBody(rawErr) ? rawErr : {};
    throwFetchError(res, errJson);
  }

  const data: unknown = await res.json();
  const candidates = isGeminiRawResponse(data) ? (data.candidates ?? []) : [];
  const firstParts = candidates[0]?.content?.parts ?? [];
  const text = firstParts
    .map((p) => p.text)
    .filter(Boolean)
    .join('');
  const raw: Record<string, unknown> =
    typeof data === 'object' && data !== null ? (data as Record<string, unknown>) : {};

  return { text, candidates, raw };
}

export class GeminiClient {
  readonly apiKey: string;
  readonly primaryModel: string;
  readonly fallbackModels: string[];
  readonly baseUrl: string;
  readonly defaultTimeoutMs: number;

  constructor(config: GeminiClientConfig) {
    this.apiKey = config.apiKey;
    this.primaryModel = (config.primaryModel ?? getModelName()).trim().replace(/\s+/g, '-');
    this.fallbackModels = (config.fallbackModels ?? getFallbackModels()).map((m) =>
      m.trim().replace(/\s+/g, '-'),
    );
    this.baseUrl = config.baseUrl ?? 'https://generativelanguage.googleapis.com/v1beta';
    this.defaultTimeoutMs = config.defaultTimeoutMs ?? 12000;
  }

  getAllModels(): string[] {
    return [this.primaryModel, ...this.fallbackModels];
  }

  async generateContent(options: GeminiGenerateOptions): Promise<GeminiGenerateResult> {
    const models = this.getAllModels();
    let lastError: Error | null = null;
    const modelsAttempted: string[] = [];

    for (const [index, model] of models.entries()) {
      modelsAttempted.push(model);
      const isLast = index === models.length - 1;

      try {
        const result = await this.callModel(model, options);
        return {
          model,
          text: result.text,
          candidates: result.candidates,
          fallbackTriggered: index > 0,
          modelsAttempted,
          raw: result.raw,
        };
      } catch (err: unknown) {
        const error = err instanceof Error ? err : new Error(String(err));
        lastError = error;

        if (options.signal?.aborted) {
          throw error;
        }

        if (!isLast && isQuotaOrUnavailableError(error)) {
          const nextModel = models.at(index + 1) ?? 'next-fallback';
          logger.warn(
            `[GeminiClient] Model ${model} encountered quota/unavailable error (${error.message}). Switching to fallback model ${nextModel}...`,
            { model, nextModel, error: error.message },
          );
          continue;
        }

        throw error;
      }
    }

    throw lastError ?? new Error('All Gemini models in fallback chain failed');
  }

  private async callModel(
    model: string,
    options: GeminiGenerateOptions,
  ): Promise<{ text: string; candidates: GeminiCandidate[]; raw: Record<string, unknown> }> {
    const url = `${this.baseUrl}/models/${model}:generateContent?key=${this.apiKey}`;
    const { controller, cleanup } = setupAbortAndTimeout(options, this.defaultTimeoutMs, model);

    try {
      const payload = buildRequestPayload(options);
      const res = await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
        signal: controller.signal,
      });

      return await handleFetchResponse(res);
    } finally {
      cleanup();
    }
  }
}

let clientInstance: GeminiClient | undefined;

/**
 * Get or create the Gemini client singleton. Returns undefined in DEMO_MODE.
 */
export function getGeminiClient(): GeminiClient | undefined {
  if (process.env['DEMO_MODE'] === 'true') return undefined;
  if (!clientInstance) {
    const apiKey = process.env['GEMINI_API_KEY'];
    if (!apiKey) {
      throw new ConfigError('GEMINI_API_KEY is required when DEMO_MODE is not true.');
    }
    clientInstance = new GeminiClient({
      apiKey,
      primaryModel: getModelName(),
      fallbackModels: getFallbackModels(),
    });
  }
  return clientInstance;
}

/** Reset client singleton (useful for tests) */
export function resetGeminiClient(): void {
  clientInstance = undefined;
}

/**
 * Primary model name: defaults to gemini-3.8-flash.
 */
export function getModelName(): string {
  const custom = process.env['GEMINI_MODEL'];
  return (custom ?? 'gemini-3.8-flash').trim().replace(/\s+/g, '-');
}

/**
 * Fallback models: defaults to [gemini-2.5-flash, gemini-3.5-flash-lite].
 */
export function getFallbackModels(): string[] {
  const envVal = process.env['GEMINI_FALLBACK_MODELS'];
  if (envVal) {
    return envVal
      .split(',')
      .map((s) => s.trim().replace(/\s+/g, '-'))
      .filter(Boolean);
  }
  return ['gemini-2.5-flash', 'gemini-3.5-flash-lite'];
}

/**
 * Combined list of primary + fallback models.
 */
export function getAllModels(): string[] {
  return [getModelName(), ...getFallbackModels()];
}
