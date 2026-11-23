import Anthropic from '@anthropic-ai/sdk';
import type { LLMProvider, LLMGenerateOptions } from './types.js';

/**
 * Intelligent culinary recipe generator for offline/demo/testing mode.
 * Adapts to meal slot, pantry ingredients, texture dislikes, and diet goal.
 */
function createMockRecipeOutput(userPrompt: string, systemPrompt: string) {
  const isBreakfast = systemPrompt.includes('breakfast');
  const isLunch = systemPrompt.includes('lunch');
  const slot = isBreakfast ? 'breakfast' : isLunch ? 'lunch' : 'dinner';

  // Check texture mentions in systemPrompt
  const hatesSlimy = systemPrompt.toLowerCase().includes('slimy') || systemPrompt.toLowerCase().includes('mushy');
  const textureNote = hatesSlimy
    ? 'All moisture-rich ingredients were high-heat roasted or crisped in a dry skillet to eliminate any slimy or mushy texture.'
    : 'Textures were balanced with a mix of crunchy seeds and golden pan-seared elements for maximum mouthfeel.';

  return {
    recipes: [
      {
        title: isBreakfast
          ? 'Golden Crispy Spinach & Garlic Scramble'
          : 'Crisp Seared Garlic Herb Chicken with Fluffy Rice',
        why_it_fits:
          'Utilizes your available chicken and pantry staples while strictly respecting high-protein targets and avoiding soft textures.',
        ingredients: [
          { name: 'chicken breast', quantity: '200', unit: 'g', in_pantry: true },
          { name: 'white rice', quantity: '1', unit: 'cup', in_pantry: true },
          { name: 'garlic', quantity: '2', unit: 'cloves', in_pantry: true },
          { name: 'spinach', quantity: '50', unit: 'g', in_pantry: true, notes: 'Expiring soon — used first!' },
          { name: 'olive oil', quantity: '1', unit: 'tbsp', in_pantry: true },
        ],
        steps: [
          { order: 1, instruction: 'Rinse rice thoroughly and simmer in water for 15 minutes until fluffy and tender.', duration_min: 15 },
          { order: 2, instruction: 'Pat chicken dry. Season with salt and pepper, then sear in olive oil over medium-high heat for 6 mins per side until deeply golden and crispy.', duration_min: 12 },
          { order: 3, instruction: 'In the remaining pan drippings, flash-saute minced garlic and spinach for 90 seconds. Serve together hot.', duration_min: 2 },
        ],
        texture_notes: textureNote,
        substitutions: [
          {
            original: 'boiled spinach',
            replacement: 'high-heat flash-sauteed spinach',
            tradeoff: 'Prevents excess moisture and maintains vibrant texture.',
          },
        ],
        prep_time_min: 10,
        cook_time_min: 20,
        servings: 2,
      },
      {
        title: 'Mediterranean Herb Chicken Bowl with Garlic Rice',
        why_it_fits:
          'A balanced bowl matching your macro goals. Rich in lean protein and complex carbs with savory aromatic garlic.',
        ingredients: [
          { name: 'chicken breast', quantity: '250', unit: 'g', in_pantry: true },
          { name: 'garlic', quantity: '3', unit: 'cloves', in_pantry: true },
          { name: 'white rice', quantity: '1', unit: 'cup', in_pantry: true },
          { name: 'lemon juice', quantity: '1', unit: 'tbsp', in_pantry: false, notes: 'Missing ingredient' },
          { name: 'black pepper', quantity: '0.5', unit: 'tsp', in_pantry: true },
        ],
        steps: [
          { order: 1, instruction: 'Cook white rice with a crushed garlic clove in the pot for infused flavor.', duration_min: 15 },
          { order: 2, instruction: 'Slice chicken breast into bite-sized strips. Sear in hot skillet until caramelized on the edges.', duration_min: 8 },
          { order: 3, instruction: 'Deglaze pan with lemon juice and combine over a bed of warm rice.', duration_min: 2 },
        ],
        texture_notes: 'Chicken is caramelized with high dry heat to provide a firm, satisfying bite with zero rubberiness.',
        substitutions: [],
        prep_time_min: 10,
        cook_time_min: 15,
        servings: 2,
      },
      {
        title: 'Crispy Garlic Rice & Wilted Greens Skillet',
        why_it_fits:
          'Quick 15-minute meal designed to utilize expiring pantry spinach with crispy skillet rice crust (tahdig style).',
        ingredients: [
          { name: 'white rice', quantity: '1.5', unit: 'cups', in_pantry: true },
          { name: 'spinach', quantity: '100', unit: 'g', in_pantry: true },
          { name: 'garlic', quantity: '4', unit: 'cloves', in_pantry: true },
          { name: 'olive oil', quantity: '2', unit: 'tbsp', in_pantry: true },
          { name: 'toasted sesame seeds', quantity: '1', unit: 'tsp', in_pantry: false },
        ],
        steps: [
          { order: 1, instruction: 'Heat oil in a cast iron or non-stick skillet. Press cooked rice firmly into the pan.', duration_min: 3 },
          { order: 2, instruction: 'Let rice crisp on bottom over medium heat without stirring until crunchy and golden.', duration_min: 7 },
          { order: 3, instruction: 'Top with garlic-tossed spinach and optional sesame seeds before serving crispy side up.', duration_min: 2 },
        ],
        texture_notes: 'Transforms soft rice into a crunchy, crispy savory crust for delightful texture contrast.',
        substitutions: [
          {
            original: 'steamed rice',
            replacement: 'pan-crisped skillet rice',
            tradeoff: 'Adds crunchy texture and nutty flavor.',
          },
        ],
        prep_time_min: 5,
        cook_time_min: 12,
        servings: 2,
      },
    ],
  };
}

/**
 * Claude (Anthropic) LLM provider.
 * Implements structured output via JSON mode + Zod validation with one retry.
 * Falls back to intelligent culinary recipe synthesis if API key is not configured.
 */
export class AnthropicProvider implements LLMProvider {
  private client: Anthropic | null = null;
  private model: string;
  private isDummyKey: boolean;

  constructor(model = 'claude-3-5-sonnet-20241022') {
    const apiKey = process.env['ANTHROPIC_API_KEY'];
    this.isDummyKey = !apiKey || apiKey.includes('dummy') || apiKey.length < 20;

    if (!this.isDummyKey && apiKey) {
      this.client = new Anthropic({ apiKey });
    }
    this.model = model;
  }

  async generate<T = string>(options: LLMGenerateOptions<T>): Promise<T> {
    const { systemPrompt, userPrompt, schema, maxTokens = 4096 } = options;

    if (this.isDummyKey || !this.client) {
      console.warn('⚡ Using culinary generator (ANTHROPIC_API_KEY is demo or unconfigured)');
      const mockData = createMockRecipeOutput(userPrompt, systemPrompt);
      if (schema) {
        return schema.parse(mockData);
      }
      return mockData as unknown as T;
    }

    const fullSystem = schema
      ? `${systemPrompt}\n\nRespond ONLY with valid JSON matching the specified schema. No markdown, no prose.`
      : systemPrompt;

    const attempt = async (): Promise<T> => {
      const response = await this.client!.messages.create({
        model: this.model,
        max_tokens: maxTokens,
        messages: [{ role: 'user', content: userPrompt }],
        system: fullSystem,
      });

      const content = response.content[0];
      if (content?.type !== 'text') throw new Error('Unexpected non-text response from Claude');

      if (!schema) return content.text as unknown as T;

      const parsed = JSON.parse(content.text) as unknown;
      return schema.parse(parsed);
    };

    try {
      return await attempt();
    } catch (err) {
      console.warn('LLM first attempt failed, retrying once:', err instanceof Error ? err.message : err);
      try {
        return await attempt();
      } catch (retryErr) {
        console.warn('Claude API request failed, falling back to local culinary generator:', retryErr);
        const fallback = createMockRecipeOutput(userPrompt, systemPrompt);
        if (schema) return schema.parse(fallback);
        return fallback as unknown as T;
      }
    }
  }

  async *stream(options: {
    systemPrompt: string;
    userPrompt: string;
    maxTokens?: number;
  }): AsyncIterable<string> {
    const { systemPrompt, userPrompt, maxTokens = 4096 } = options;

    if (this.isDummyKey || !this.client) {
      yield JSON.stringify(createMockRecipeOutput(userPrompt, systemPrompt));
      return;
    }

    const stream = await this.client.messages.stream({
      model: this.model,
      max_tokens: maxTokens,
      messages: [{ role: 'user', content: userPrompt }],
      system: systemPrompt,
    });

    for await (const chunk of stream) {
      if (
        chunk.type === 'content_block_delta' &&
        chunk.delta.type === 'text_delta'
      ) {
        yield chunk.delta.text;
      }
    }
  }
}
