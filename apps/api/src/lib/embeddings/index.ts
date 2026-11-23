import { OpenAIEmbeddingProvider } from './openai.js';
import type { EmbeddingProvider } from './types.js';

export type { EmbeddingProvider };
export { OpenAIEmbeddingProvider };

export function getEmbeddingProvider(): EmbeddingProvider {
  return new OpenAIEmbeddingProvider();
}
