import { AnthropicProvider } from './anthropic.js';
import type { LLMProvider } from './types.js';

export type { LLMProvider };
export { AnthropicProvider };

/** Returns the configured LLM provider */
export function getLLMProvider(): LLMProvider {
  return new AnthropicProvider();
}
