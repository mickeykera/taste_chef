import { z } from 'zod';

export interface LLMGenerateOptions<T> {
  systemPrompt: string;
  userPrompt: string;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  schema?: z.ZodType<T, any, any>;
  maxTokens?: number;
}

export interface LLMProvider {
  generate<T = string>(options: LLMGenerateOptions<T>): Promise<T>;
  stream(options: { systemPrompt: string; userPrompt: string; maxTokens?: number }): AsyncIterable<string>;
}
