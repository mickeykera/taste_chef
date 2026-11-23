/**
 * @tastechef/distilled-ai
 *
 * A distilled, fully offline "chef" for TasteChef. It has no network calls,
 * no API keys and no runtime model downloads: just a curated ingredient
 * knowledge base, a recipe corpus, a nutrition estimator and a tiny learned
 * taste model. It runs identically in Node and in the browser.
 */

export * from './types.js';
export * from './utils.js';
export * from './ingredients.js';
export * from './recipes.js';
export * from './nutrition.js';
export * from './tasteModel.js';
export * from './engine.js';
