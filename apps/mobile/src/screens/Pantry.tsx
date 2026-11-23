import { useMemo, useState } from 'react';
import { useStore } from '../state';
import { Button, Section } from '../components/ui';
import {
  CheckIcon,
  ClockIcon,
  PantryIcon,
  PlusIcon,
  TrashIcon,
} from '../icons';

const SUGGESTIONS = [
  'chicken breast',
  'chickpeas',
  'tofu',
  'pasta',
  'canned tomatoes',
  'yogurt',
  'lemon',
  'broccoli',
  'potato',
  'oats',
  'banana',
  'salmon',
];

export function PantryScreen() {
  const { state, addPantry, removePantry, toggleExpiring } = useStore();
  const [ingredient, setIngredient] = useState('');
  const [quantity, setQuantity] = useState('');
  const [unit, setUnit] = useState('');

  const sorted = useMemo(
    () =>
      [...state.pantry].sort((a, b) => {
        if (a.expiringSoon !== b.expiringSoon) return a.expiringSoon ? -1 : 1;
        return a.ingredient.localeCompare(b.ingredient);
      }),
    [state.pantry],
  );

  const expiring = sorted.filter((item) => item.expiringSoon);

  const submit = () => {
    if (!ingredient.trim()) return;
    addPantry({
      ingredient: ingredient.trim(),
      quantity: quantity.trim(),
      unit: unit.trim(),
      expiringSoon: false,
    });
    setIngredient('');
    setQuantity('');
    setUnit('');
  };

  return (
    <div className="screen pantry-screen">
      <header className="screen-head">
        <p className="eyebrow">Your kitchen</p>
        <h1 className="display hero-title">
          The <em>pantry.</em>
        </h1>
        <p className="lede">
          Everything here is fair game. Mark things that need using first and the chef will build
          around them.
        </p>
      </header>

      <div className="stat-strip">
        <div className="stat">
          <strong>{state.pantry.length}</strong>
          <span>ingredients</span>
        </div>
        <div className="stat">
          <strong>{expiring.length}</strong>
          <span>use soon</span>
        </div>
        <div className="stat">
          <strong>{state.profile.assumeStaples ? '5' : '0'}</strong>
          <span>staples assumed</span>
        </div>
      </div>

      <div className="card form-card">
        <div className="add-row">
          <label className="field field-grow">
            <span className="field-label">Add an ingredient</span>
            <input
              className="input"
              placeholder="e.g. sweet potato"
              value={ingredient}
              onChange={(event) => setIngredient(event.target.value)}
              onKeyDown={(event) => {
                if (event.key === 'Enter') submit();
              }}
              enterKeyHint="done"
            />
          </label>
          <label className="field field-qty">
            <span className="field-label">Qty</span>
            <input
              className="input"
              placeholder="2"
              inputMode="decimal"
              value={quantity}
              onChange={(event) => setQuantity(event.target.value)}
            />
          </label>
          <label className="field field-unit">
            <span className="field-label">Unit</span>
            <input
              className="input"
              placeholder="piece"
              value={unit}
              onChange={(event) => setUnit(event.target.value)}
            />
          </label>
        </div>
        <Button className="full-width" onClick={submit} disabled={!ingredient.trim()}>
          <PlusIcon size={18} /> Add to pantry
        </Button>
      </div>

      <Section title="Quick add">
        <div className="chip-row">
          {SUGGESTIONS.filter(
            (item) =>
              !state.pantry.some(
                (pantryItem) => pantryItem.ingredient.toLowerCase() === item.toLowerCase(),
              ),
          ).map((item) => (
            <button
              key={item}
              type="button"
              className="chip chip-quiet"
              onClick={() =>
                addPantry({ ingredient: item, quantity: '1', unit: '', expiringSoon: false })
              }
            >
              <PlusIcon size={13} /> {item}
            </button>
          ))}
        </div>
      </Section>

      <Section title={`In the kitchen (${sorted.length})`}>
        {sorted.length === 0 ? (
          <div className="empty">
            <div className="empty-icon"><PantryIcon size={32} /></div>
            <h3>Your pantry is empty</h3>
            <p>Add a few basics and the chef will start building around them.</p>
          </div>
        ) : (
          <ul className="pantry-list">
            {sorted.map((item) => (
              <li key={item.id} className={item.expiringSoon ? 'is-expiring' : ''}>
                <span className="pantry-dot" aria-hidden />
                <span className="pantry-copy">
                  <strong>{item.ingredient}</strong>
                  <span>
                    {[item.quantity, item.unit].filter(Boolean).join(' ') || 'some'}
                    {item.expiringSoon ? ' · use first' : ''}
                  </span>
                </span>
                <button
                  type="button"
                  className={`mini-btn ${item.expiringSoon ? 'is-on' : ''}`}
                  aria-label={item.expiringSoon ? `Unmark ${item.ingredient}` : `Mark ${item.ingredient} as expiring`}
                  aria-pressed={item.expiringSoon}
                  onClick={() => toggleExpiring(item.id)}
                >
                  {item.expiringSoon ? <CheckIcon size={15} /> : <ClockIcon size={15} />}
                </button>
                <button
                  type="button"
                  className="mini-btn danger"
                  aria-label={`Remove ${item.ingredient}`}
                  onClick={() => removePantry(item.id)}
                >
                  <TrashIcon size={15} />
                </button>
              </li>
            ))}
          </ul>
        )}
      </Section>
    </div>
  );
}
