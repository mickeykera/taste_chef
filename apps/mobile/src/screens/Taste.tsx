import { useMemo, useState } from 'react';
import { useStore, type PreferenceType } from '../state';
import { Button, Chip, Section } from '../components/ui';
import {
  AlertIcon,
  CheckIcon,
  PlusIcon,
  SparkIcon,
  TasteIcon,
  TrashIcon,
} from '../icons';

const TEXTURES = [
  'slimy',
  'chewy',
  'grainy',
  'mushy',
  'rubbery',
  'gritty',
  'watery',
  'dense',
  'crunchy',
  'fluffy',
  'creamy',
  'crispy',
];

const PREPARATIONS: Array<{ id: string; label: string }> = [
  { id: 'crispy', label: 'Crispy' },
  { id: 'roasted', label: 'Roasted' },
  { id: 'blended', label: 'Blended' },
  { id: 'finely_chopped', label: 'Finely chopped' },
  { id: 'hidden_in_sauce', label: 'Hidden in sauce' },
  { id: 'pureed', label: 'Pureed' },
  { id: 'caramelized', label: 'Caramelized' },
  { id: 'marinated', label: 'Marinated' },
  { id: 'cooked_only', label: 'Cooked only' },
  { id: 'raw_only', label: 'Raw only' },
];

const TYPE_LABELS: Record<PreferenceType, string> = {
  like: 'I love it',
  dislike: 'Not for me',
  allergy: 'Allergy / hard no',
};

function prettify(value: string): string {
  return value.replace(/_/g, ' ');
}

export function TasteScreen() {
  const { state, addTaste, removeTaste } = useStore();
  const [ingredient, setIngredient] = useState('');
  const [type, setType] = useState<PreferenceType>('dislike');
  const [reason, setReason] = useState<'texture' | 'flavor' | 'other'>('texture');
  const [textures, setTextures] = useState<string[]>([]);
  const [preparations, setPreparations] = useState<string[]>([]);

  const grouped = useMemo(
    () => ({
      allergies: state.taste.filter((item) => item.preference_type === 'allergy'),
      dislikes: state.taste.filter((item) => item.preference_type === 'dislike'),
      likes: state.taste.filter((item) => item.preference_type === 'like'),
    }),
    [state.taste],
  );

  const learned = useMemo(() => {
    const entries = Object.entries(state.tasteModel.weights)
      .filter(([feature]) => feature.startsWith('ingredient:') || feature.startsWith('cuisine:'))
      .map(([feature, weight]) => ({
        feature: feature.split(':')[1] ?? feature,
        weight,
      }))
      .sort((a, b) => Math.abs(b.weight) - Math.abs(a.weight))
      .slice(0, 6);
    return entries;
  }, [state.tasteModel]);

  const submit = () => {
    if (!ingredient.trim()) return;
    addTaste({
      ingredient: ingredient.trim(),
      preference_type: type,
      reason: type === 'dislike' ? reason : 'other',
      texture_words: type === 'dislike' ? textures : [],
      acceptable_when: type === 'dislike' ? preparations : [],
      is_hard_constraint: type === 'allergy',
    });
    setIngredient('');
    setTextures([]);
    setPreparations([]);
  };

  const toggle = (list: string[], setList: (next: string[]) => void, value: string) => {
    setList(list.includes(value) ? list.filter((item) => item !== value) : [...list, value]);
  };

  return (
    <div className="screen taste-screen">
      <header className="screen-head">
        <p className="eyebrow">Preferences</p>
        <h1 className="display hero-title">
          Taste & <em>texture.</em>
        </h1>
        <p className="lede">
          This is where the chef gets personal. A dislike with an acceptable preparation becomes a
          technique, not a ban.
        </p>
      </header>

      <div className="card form-card">
        <label className="field">
          <span className="field-label">Ingredient</span>
          <input
            className="input"
            placeholder="e.g. mushrooms"
            value={ingredient}
            onChange={(event) => setIngredient(event.target.value)}
            enterKeyHint="done"
          />
        </label>

        <div className="type-grid" role="group" aria-label="Preference type">
          {(Object.keys(TYPE_LABELS) as PreferenceType[]).map((option) => (
            <button
              key={option}
              type="button"
              className={`type-btn type-${option} ${type === option ? 'is-active' : ''}`}
              aria-pressed={type === option}
              onClick={() => setType(option)}
            >
              {option === 'allergy' ? <AlertIcon size={17} /> : <TasteIcon size={17} />}
              {TYPE_LABELS[option]}
            </button>
          ))}
        </div>

        {type === 'dislike' && (
          <div className="dislike-details">
            <div className="field-label">Why?</div>
            <div className="chip-row">
              {(['texture', 'flavor', 'other'] as const).map((option) => (
                <Chip key={option} active={reason === option} onClick={() => setReason(option)}>
                  {option}
                </Chip>
              ))}
            </div>

            {reason === 'texture' && (
              <>
                <span className="field-label">Texture that bothers you</span>
                <div className="chip-row">
                  {TEXTURES.map((texture) => (
                    <Chip
                      key={texture}
                      active={textures.includes(texture)}
                      onClick={() => toggle(textures, setTextures, texture)}
                    >
                      {texture}
                    </Chip>
                  ))}
                </div>

                <span className="field-label">But it's fine when…</span>
                <div className="chip-row">
                  {PREPARATIONS.map((prep) => (
                    <Chip
                      key={prep.id}
                      active={preparations.includes(prep.id)}
                      onClick={() => toggle(preparations, setPreparations, prep.id)}
                    >
                      {prep.label}
                    </Chip>
                  ))}
                </div>
              </>
            )}
          </div>
        )}

        {type === 'allergy' && (
          <p className="hint-card">
            <AlertIcon size={16} />
            Allergies are hard constraints. The chef will never include this ingredient, and every
            generated recipe is re-checked.
          </p>
        )}

        <Button className="full-width" onClick={submit} disabled={!ingredient.trim()}>
          <PlusIcon size={18} /> Add preference
        </Button>
      </div>

      {grouped.allergies.length > 0 && (
        <Section title="Hard rules">
          <ul className="taste-list">
            {grouped.allergies.map((item) => (
              <li key={item.id} className="taste-row is-hard">
                <span className="taste-badge hard"><AlertIcon size={15} /></span>
                <span className="taste-copy">
                  <strong>{item.ingredient}</strong>
                  <span>Never include — allergy or hard restriction</span>
                </span>
                <button type="button" className="mini-btn danger" aria-label={`Remove ${item.ingredient}`} onClick={() => removeTaste(item.id)}>
                  <TrashIcon size={15} />
                </button>
              </li>
            ))}
          </ul>
        </Section>
      )}

      {grouped.dislikes.length > 0 && (
        <Section title="Dislikes, with nuance">
          <ul className="taste-list">
            {grouped.dislikes.map((item) => (
              <li key={item.id} className="taste-row">
                <span className="taste-badge"><TasteIcon size={15} /></span>
                <span className="taste-copy">
                  <strong>{item.ingredient}</strong>
                  <span>
                    {item.reason === 'texture' && item.texture_words.length > 0
                      ? `${item.texture_words.join(', ')}`
                      : item.reason}
                    {item.acceptable_when.length > 0
                      ? ` · okay ${item.acceptable_when.map(prettify).join(', ')}`
                      : ' · avoid'}
                  </span>
                </span>
                {item.source === 'feedback' && <span className="source-tag">learned</span>}
                <button type="button" className="mini-btn danger" aria-label={`Remove ${item.ingredient}`} onClick={() => removeTaste(item.id)}>
                  <TrashIcon size={15} />
                </button>
              </li>
            ))}
          </ul>
        </Section>
      )}

      {grouped.likes.length > 0 && (
        <Section title="Loved foods">
          <ul className="taste-list">
            {grouped.likes.map((item) => (
              <li key={item.id} className="taste-row">
                <span className="taste-badge like"><CheckIcon size={15} /></span>
                <span className="taste-copy">
                  <strong>{item.ingredient}</strong>
                  <span>More of this, please</span>
                </span>
                {item.source === 'feedback' && <span className="source-tag">learned</span>}
                <button type="button" className="mini-btn danger" aria-label={`Remove ${item.ingredient}`} onClick={() => removeTaste(item.id)}>
                  <TrashIcon size={15} />
                </button>
              </li>
            ))}
          </ul>
        </Section>
      )}

      <Section title="What the chef has learned">
        <div className="card learned-card">
          <div className="learned-head">
            <span className="learned-icon"><SparkIcon size={20} /></span>
            <div>
              <strong>
                {state.tasteModel.signals === 0
                  ? 'No ratings yet'
                  : `${state.tasteModel.signals} rating${state.tasteModel.signals === 1 ? '' : 's'} learned`}
              </strong>
              <span>
                {state.tasteModel.signals === 0
                  ? 'Rate a cooked recipe and the offline model starts adapting.'
                  : 'A tiny linear model, stored only on this device.'}
              </span>
            </div>
          </div>
          {learned.length > 0 && (
            <div className="learned-weights">
              {learned.map((entry) => (
                <span
                  key={entry.feature}
                  className={`weight-chip ${entry.weight >= 0 ? 'positive' : 'negative'}`}
                >
                  {entry.weight >= 0 ? '↑' : '↓'} {entry.feature}
                </span>
              ))}
            </div>
          )}
        </div>
      </Section>
    </div>
  );
}
