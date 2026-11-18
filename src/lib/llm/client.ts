import Anthropic from '@anthropic-ai/sdk';
import { ConfigError } from '@/lib/security/errors';

let clientInstance: Anthropic | undefined;

/** Get or create the Anthropic client singleton. Returns undefined in DEMO_MODE. */
export function getAnthropicClient(): Anthropic | undefined {
  if (process.env['DEMO_MODE'] === 'true') return undefined;
  if (!clientInstance) {
    const apiKey = process.env['ANTHROPIC_API_KEY'];
    if (!apiKey) {
      throw new ConfigError('ANTHROPIC_API_KEY required when DEMO_MODE is not true.');
    }
    clientInstance = new Anthropic({ apiKey });
  }
  return clientInstance;
}

export function getModelName(): string {
  return process.env['ANTHROPIC_MODEL'] ?? 'claude-sonnet-4-20250514';
}
