import { useStore, type RecipeRecord } from '../state';
import { Button, Section } from '../components/ui';
import {
  BookmarkIcon,
  CheckIcon,
  ChevronIcon,
  ClockIcon,
  GroceryIcon,
  PlusIcon,
  TrashIcon,
} from '../icons';

export function SavedScreen({ onOpenRecipe }: { onOpenRecipe: (record: RecipeRecord) => void }) {
  const { state, toggleSaved, toggleGrocery, removeGrocery, clearChecked } = useStore();
  const checked = state.grocery.filter((item) => item.checked).length;

  return (
    <div className="screen saved-screen">
      <header className="screen-head">
        <p className="eyebrow">Your collection</p>
        <h1 className="display hero-title">
          Saved & <em>shopping.</em>
        </h1>
        <p className="lede">
          Keep the winners close. Missing ingredients from any recipe land in the grocery list
          automatically.
        </p>
      </header>

      <div className="stat-strip">
        <div className="stat">
          <strong>{state.saved.length}</strong>
          <span>saved recipes</span>
        </div>
        <div className="stat">
          <strong>{state.grocery.filter((item) => !item.checked).length}</strong>
          <span>to buy</span>
        </div>
        <div className="stat">
          <strong>{state.ratings ? Object.keys(state.ratings).length : 0}</strong>
          <span>rated meals</span>
        </div>
      </div>

      <Section title={`Saved recipes (${state.saved.length})`}>
        {state.saved.length === 0 ? (
          <div className="empty">
            <div className="empty-icon"><BookmarkIcon size={32} /></div>
            <h3>No saved recipes yet</h3>
            <p>Open a generated recipe and tap save. It will stay here, offline, forever.</p>
          </div>
        ) : (
          <div className="saved-list">
            {state.saved.map((record) => {
              const recipe = record.recipe;
              const total = recipe.prep_time_min + recipe.cook_time_min;
              return (
                <div key={record.id} className="saved-row">
                  <button type="button" className="saved-main" onClick={() => onOpenRecipe(record)}>
                    <span className="saved-cuisine">{recipe.cuisine} · {recipe.meal_slot}</span>
                    <strong className="display">{recipe.title}</strong>
                    <span className="saved-meta">
                      <ClockIcon size={13} /> {total} min · {recipe.nutrition_per_serving.calories} kcal
                    </span>
                  </button>
                  <div className="saved-actions">
                    <button type="button" className="mini-btn danger" aria-label={`Remove ${recipe.title}`} onClick={() => toggleSaved(record)}>
                      <TrashIcon size={15} />
                    </button>
                    <button type="button" className="mini-btn" aria-label={`Open ${recipe.title}`} onClick={() => onOpenRecipe(record)}>
                      <ChevronIcon size={15} />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </Section>

      <Section
        title={`Grocery list (${state.grocery.length})`}
        action={
          checked > 0 ? (
            <button type="button" className="inline-link" onClick={clearChecked}>
              Clear {checked} checked
            </button>
          ) : undefined
        }
      >
        {state.grocery.length === 0 ? (
          <div className="empty">
            <div className="empty-icon"><GroceryIcon size={32} /></div>
            <h3>Nothing to buy</h3>
            <p>Missing ingredients from a recipe will show up here, ready for the shop.</p>
          </div>
        ) : (
          <ul className="grocery-list">
            {state.grocery.map((item) => (
              <li key={item.id} className={item.checked ? 'is-checked' : ''}>
                <button
                  type="button"
                  className="grocery-check"
                  aria-label={item.checked ? `Uncheck ${item.ingredient}` : `Check ${item.ingredient}`}
                  aria-pressed={item.checked}
                  onClick={() => toggleGrocery(item.id)}
                >
                  {item.checked ? <CheckIcon size={15} /> : <PlusIcon size={15} />}
                </button>
                <span className="grocery-copy">
                  <strong>{item.ingredient}</strong>
                  <span>{[item.quantity, item.unit].filter(Boolean).join(' ') || 'as needed'}</span>
                </span>
                <button type="button" className="mini-btn danger" aria-label={`Remove ${item.ingredient}`} onClick={() => removeGrocery(item.id)}>
                  <TrashIcon size={15} />
                </button>
              </li>
            ))}
          </ul>
        )}
      </Section>

      {state.saved.length > 0 && (
        <div className="card tip-card">
          <strong>Offline by design</strong>
          <p>
            Saved recipes, pantry and taste rules live in this device's storage. Nothing is sent to
            a server.
          </p>
        </div>
      )}
    </div>
  );
}
