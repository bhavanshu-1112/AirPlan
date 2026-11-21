import { ConfigError } from '@/lib/security/errors';

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
    [key: string]: unknown;
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

function extractErrorStatus(error: unknown, status?: number): number {
  if (status !== undefined) return status;
  const err = error as { status?: number; code?: number | string };
  return Number(err?.status ?? err?.code);
}

/** Check if an error indicates quota exhaustion, rate limit, high demand or unavailability. */
export function isQuotaOrUnavailableError(error: unknown, status?: number): boolean {
  if (RETRYABLE_STATUSES.has(extractErrorStatus(error, status))) {
    return true;
  }
  const err = error as { message?: string; name?: string };
  return QUOTA_ERROR_REGEX.test(`${err?.name ?? ''} ${err?.message ?? ''}`);
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

function throwFetchError(
  res: Response,
  errJson: { error?: { message?: string; code?: number } },
): never {
  const message = errJson.error?.message || `HTTP ${res.status}: ${res.statusText}`;
  const err = new Error(message) as Error & { status?: number; code?: number | string };
  err.status = res.status;
  err.code = errJson.error?.code ?? res.status;
  throw err;
}

async function handleFetchResponse(
  res: Response,
): Promise<{ text: string; candidates: GeminiCandidate[]; raw: Record<string, unknown> }> {
  if (!res.ok) {
    const errJson = (await res.json().catch(() => ({}))) as {
      error?: { message?: string; code?: number };
    };
    throwFetchError(res, errJson);
  }

  const data = (await res.json()) as Record<string, unknown>;
  const candidates = (data['candidates'] as GeminiCandidate[]) ?? [];
  const firstParts = candidates[0]?.content?.parts ?? [];
  const text = firstParts
    .map((p) => p.text)
    .filter(Boolean)
    .join('');

  return { text, candidates, raw: data };
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
          console.warn(
            `[GeminiClient] Model ${model} encountered quota/unavailable error (${error.message}). Switching to fallback model ${nextModel}...`,
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
    const apiKey = process.env['GEMINI_API_KEY'] ?? process.env['ANTHROPIC_API_KEY'];
    if (!apiKey) {
      throw new ConfigError(
        'GEMINI_API_KEY or ANTHROPIC_API_KEY required when DEMO_MODE is not true.',
      );
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
 * Backward compatibility alias for Anthropic client callers.
 */
export function getAnthropicClient(): GeminiClient | undefined {
  return getGeminiClient();
}

/**
 * Primary model name: defaults to gemini-3.8-flash.
 */
export function getModelName(): string {
  const custom = process.env['GEMINI_MODEL'] ?? process.env['ANTHROPIC_MODEL'];
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
