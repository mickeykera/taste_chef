import { useState } from 'react';
import type { DietGoal, DietType } from '@tastechef/shared';
import { useStore } from '../state';
import { Button, Chip, Field, Section, Switch } from '../components/ui';
import { AlertIcon, BowlIcon, CheckIcon, LeafIcon, ProfileIcon } from '../icons';

const DIETS: Array<{ id: DietType; label: string }> = [
  { id: 'omnivore', label: 'Omnivore' },
  { id: 'vegetarian', label: 'Vegetarian' },
  { id: 'vegan', label: 'Vegan' },
  { id: 'pescatarian', label: 'Pescatarian' },
  { id: 'high_protein', label: 'High protein' },
  { id: 'low_carb', label: 'Low carb' },
  { id: 'keto', label: 'Keto' },
  { id: 'gluten_free', label: 'Gluten free' },
  { id: 'dairy_free', label: 'Dairy free' },
  { id: 'paleo', label: 'Paleo' },
  { id: 'halal', label: 'Halal' },
  { id: 'kosher', label: 'Kosher' },
];

const GOALS: Array<{ id: DietGoal; label: string }> = [
  { id: 'eat_healthier', label: 'Eat healthier' },
  { id: 'lose_weight', label: 'Lose weight' },
  { id: 'build_muscle', label: 'Build muscle' },
  { id: 'maintain', label: 'Maintain' },
];

export function ProfileScreen() {
  const { state, updateProfile, reset } = useStore();
  const [confirmReset, setConfirmReset] = useState(false);
  const { profile } = state;
  const initials = profile.name
    .split(' ')
    .filter(Boolean)
    .map((part) => part[0]?.toUpperCase())
    .slice(0, 2)
    .join('');

  const toggleDiet = (diet: DietType) => {
    if (diet === 'omnivore') {
      updateProfile({ dietTypes: ['omnivore'] });
      return;
    }
    const current = profile.dietTypes.filter((item) => item !== 'omnivore');
    const next = current.includes(diet)
      ? current.filter((item) => item !== diet)
      : [...current, diet];
    updateProfile({ dietTypes: next.length > 0 ? next : ['omnivore'] });
  };

  return (
    <div className="screen profile-screen">
      <header className="screen-head">
        <p className="eyebrow">Your account, on this device</p>
        <h1 className="display hero-title">
          The <em>cook.</em>
        </h1>
      </header>

      <div className="card profile-card">
        <div className="avatar">{initials || <ProfileIcon size={26} />}</div>
        <div className="profile-copy">
          <strong>{profile.name || 'Anonymous cook'}</strong>
          <span>
            {profile.dietTypes
              .filter((diet) => diet !== 'omnivore')
              .map((diet) => diet.replace(/_/g, ' '))
              .join(' · ') || 'Omnivore'}
          </span>
        </div>
        <span className="profile-goal">{profile.dietGoal.replace(/_/g, ' ')}</span>
      </div>

      <Section title="Identity">
        <div className="card form-card">
          <Field
            label="Name"
            placeholder="Your name"
            value={profile.name}
            onChange={(event) => updateProfile({ name: event.target.value })}
          />
          <Field
            label="Daily calorie target (optional)"
            placeholder="e.g. 2000"
            inputMode="numeric"
            value={profile.calorieTarget ? String(profile.calorieTarget) : ''}
            onChange={(event) =>
              updateProfile({
                calorieTarget: event.target.value
                  ? Number(event.target.value.replace(/[^0-9]/g, ''))
                  : null,
              })
            }
          />
        </div>
      </Section>

      <Section title="Diet">
        <div className="card form-card">
          <div className="chip-grid">
            {DIETS.map((diet) => (
              <Chip
                key={diet.id}
                active={profile.dietTypes.includes(diet.id)}
                onClick={() => toggleDiet(diet.id)}
              >
                {profile.dietTypes.includes(diet.id) && <CheckIcon size={14} />}
                {diet.label}
              </Chip>
            ))}
          </div>
          <p className="muted-small">
            Diet rules are applied at generation time and the final recipe is re-checked.
          </p>
        </div>
      </Section>

      <Section title="Goal">
        <div className="chip-row">
          {GOALS.map((goal) => (
            <Chip
              key={goal.id}
              active={profile.dietGoal === goal.id}
              onClick={() => updateProfile({ dietGoal: goal.id })}
            >
              {goal.label}
            </Chip>
          ))}
        </div>
      </Section>

      <Section title="Kitchen rules">
        <div className="card form-card">
          <Switch
            checked={profile.assumeStaples}
            onChange={(next) => updateProfile({ assumeStaples: next })}
            label="Assume basic staples"
            description="Salt, pepper, olive oil, water and sugar are treated as always available."
          />
        </div>
      </Section>

      <Section title="At a glance">
        <div className="stat-strip">
          <div className="stat">
            <strong>{state.pantry.length}</strong>
            <span>pantry</span>
          </div>
          <div className="stat">
            <strong>{state.taste.length}</strong>
            <span>taste rules</span>
          </div>
          <div className="stat">
            <strong>{state.saved.length}</strong>
            <span>saved</span>
          </div>
          <div className="stat">
            <strong>{state.tasteModel.signals}</strong>
            <span>learned</span>
          </div>
        </div>
      </Section>

      <div className="card about-card">
        <div className="about-row">
          <span className="about-icon"><BowlIcon size={20} /></span>
          <div>
            <strong>Distilled chef v1</strong>
            <p>
              A curated recipe corpus, ingredient knowledge base and tiny taste model. No network
              calls, no API keys, no data leaving your phone.
            </p>
          </div>
        </div>
        <div className="about-row">
          <span className="about-icon"><LeafIcon size={20} /></span>
          <div>
            <strong>Works in airplane mode</strong>
            <p>Every recipe, substitution and nutrition estimate is computed on device.</p>
          </div>
        </div>
      </div>

      <Section title="Danger zone">
        <div className="card form-card">
          {confirmReset ? (
            <div className="confirm-reset">
              <p>
                <AlertIcon size={16} /> This erases your pantry, saved recipes and learned taste
                model.
              </p>
              <div className="button-row">
                <Button variant="secondary" onClick={() => setConfirmReset(false)}>
                  Cancel
                </Button>
                <Button onClick={reset}>Yes, erase everything</Button>
              </div>
            </div>
          ) : (
            <Button variant="secondary" onClick={() => setConfirmReset(true)}>
              Reset all data
            </Button>
          )}
        </div>
      </Section>
    </div>
  );
}
