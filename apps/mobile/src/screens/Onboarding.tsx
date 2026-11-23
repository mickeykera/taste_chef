import { useState } from 'react';
import type { DietGoal, DietType } from '@tastechef/shared';
import { useStore } from '../state';
import { Button, Chip, Field, Switch } from '../components/ui';
import { ArrowLeftIcon, BowlIcon, CheckIcon, FlameIcon, LeafIcon, SparkIcon } from '../icons';

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

const GOALS: Array<{ id: DietGoal; label: string; description: string; icon: typeof FlameIcon }> = [
  { id: 'eat_healthier', label: 'Eat healthier', description: 'Balanced, whole-food plates', icon: LeafIcon },
  { id: 'lose_weight', label: 'Lose weight', description: 'Lighter, protein-forward meals', icon: FlameIcon },
  { id: 'build_muscle', label: 'Build muscle', description: 'Higher protein and energy', icon: SparkIcon },
  { id: 'maintain', label: 'Maintain', description: 'Everyday balanced cooking', icon: BowlIcon },
];

export function Onboarding() {
  const { state, updateProfile, completeOnboarding } = useStore();
  const [step, setStep] = useState(0);
  const [name, setName] = useState(state.profile.name);
  const [diets, setDiets] = useState<DietType[]>(state.profile.dietTypes);
  const [goal, setGoal] = useState<DietGoal>(state.profile.dietGoal);
  const [assumeStaples, setAssumeStaples] = useState(state.profile.assumeStaples);
  const [calorieTarget, setCalorieTarget] = useState(
    state.profile.calorieTarget ? String(state.profile.calorieTarget) : '',
  );

  const toggleDiet = (diet: DietType) => {
    if (diet === 'omnivore') {
      setDiets(['omnivore']);
      return;
    }
    setDiets((current) => {
      const withoutOmnivore = current.filter((item) => item !== 'omnivore');
      return withoutOmnivore.includes(diet)
        ? withoutOmnivore.filter((item) => item !== diet)
        : [...withoutOmnivore, diet];
    });
  };

  const finish = () => {
    updateProfile({
      name: name.trim(),
      dietTypes: diets.length > 0 ? diets : ['omnivore'],
      dietGoal: goal,
      assumeStaples,
      calorieTarget: calorieTarget ? Number(calorieTarget) : null,
    });
    completeOnboarding();
  };

  return (
    <div className="onboarding">
      <div className="onboarding-top">
        {step > 0 ? (
          <button type="button" className="onboarding-back" onClick={() => setStep(step - 1)} aria-label="Back">
            <ArrowLeftIcon size={20} />
          </button>
        ) : (
          <span className="brand-mark">
            <BowlIcon size={18} /> TasteChef
          </span>
        )}
        <div className="progress-dots" aria-label={`Step ${step + 1} of 3`}>
          {[0, 1, 2].map((index) => (
            <span key={index} className={index <= step ? 'is-done' : ''} />
          ))}
        </div>
      </div>

      {step === 0 && (
        <div className="onboarding-body">
          <div className="onboarding-art" aria-hidden>
            <span className="art-ring" />
            <BowlIcon size={74} />
            <span className="art-spark art-spark-1"><SparkIcon size={20} /></span>
            <span className="art-spark art-spark-2"><LeafIcon size={18} /></span>
          </div>
          <p className="eyebrow">A private chef, in your pocket</p>
          <h1 className="display onboarding-title">
            Cook well with
            <br />
            <em>what you already have.</em>
          </h1>
          <p className="lede">
            TasteChef is a fully offline recipe engine. It reads your pantry, respects your diet,
            and learns the textures you love — no account, no cloud, no waiting.
          </p>
          <Field
            label="What should I call you?"
            placeholder="Your name"
            value={name}
            onChange={(event) => setName(event.target.value)}
            autoComplete="given-name"
            enterKeyHint="next"
          />
        </div>
      )}

      {step === 1 && (
        <div className="onboarding-body">
          <p className="eyebrow">Step two</p>
          <h1 className="display onboarding-title">
            How do you
            <br />
            <em>like to eat?</em>
          </h1>
          <p className="lede">Pick as many as apply. Safety rules always win.</p>
          <div className="chip-grid">
            {DIETS.map((diet) => (
              <Chip key={diet.id} active={diets.includes(diet.id)} onClick={() => toggleDiet(diet.id)}>
                {diets.includes(diet.id) && <CheckIcon size={14} />}
                {diet.label}
              </Chip>
            ))}
          </div>
        </div>
      )}

      {step === 2 && (
        <div className="onboarding-body">
          <p className="eyebrow">Last one</p>
          <h1 className="display onboarding-title">
            What are you
            <br />
            <em>cooking for?</em>
          </h1>
          <div className="goal-list">
            {GOALS.map(({ id, label, description, icon: Icon }) => (
              <button
                key={id}
                type="button"
                className={`goal-card ${goal === id ? 'is-active' : ''}`}
                onClick={() => setGoal(id)}
              >
                <span className="goal-icon"><Icon size={22} /></span>
                <span className="goal-copy">
                  <strong>{label}</strong>
                  <span>{description}</span>
                </span>
                <span className={`goal-radio ${goal === id ? 'is-on' : ''}`} />
              </button>
            ))}
          </div>
          <Field
            label="Daily calorie target (optional)"
            placeholder="e.g. 2000"
            inputMode="numeric"
            value={calorieTarget}
            onChange={(event) => setCalorieTarget(event.target.value.replace(/[^0-9]/g, ''))}
          />
          <div className="card compact">
            <Switch
              checked={assumeStaples}
              onChange={setAssumeStaples}
              label="Assume basic staples"
              description="Salt, pepper, olive oil, water and sugar are always available."
            />
          </div>
        </div>
      )}

      <div className="onboarding-actions">
        <Button
          className="full-width"
          onClick={() => (step < 2 ? setStep(step + 1) : finish())}
        >
          {step < 2 ? 'Continue' : 'Start cooking'}
          <ArrowLeftIcon size={18} className="flip" />
        </Button>
        {step === 0 && (
          <button type="button" className="text-button" onClick={() => setStep(2)}>
            Skip the setup
          </button>
        )}
      </div>
    </div>
  );
}
