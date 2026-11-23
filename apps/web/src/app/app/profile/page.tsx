'use client';

import { useState, useEffect } from 'react';
import { getAuthSession } from '@/lib/auth';
import { api } from '@/lib/api';
import type { Profile, DietType, DietGoal, ActivityLevel } from '@tastechef/shared';

const DIET_TYPES: { value: DietType; label: string }[] = [
  { value: 'omnivore', label: 'Omnivore' },
  { value: 'vegetarian', label: 'Vegetarian' },
  { value: 'vegan', label: 'Vegan' },
  { value: 'pescatarian', label: 'Pescatarian' },
  { value: 'halal', label: 'Halal' },
  { value: 'kosher', label: 'Kosher' },
  { value: 'keto', label: 'Keto' },
  { value: 'low_carb', label: 'Low Carb' },
  { value: 'high_protein', label: 'High Protein' },
  { value: 'gluten_free', label: 'Gluten-Free' },
  { value: 'dairy_free', label: 'Dairy-Free' },
  { value: 'paleo', label: 'Paleo' },
];

const DIET_GOALS: { value: DietGoal; label: string; desc: string }[] = [
  { value: 'lose_weight', label: 'Lose Weight', desc: 'Caloric deficit, higher protein satiety' },
  { value: 'maintain', label: 'Maintain', desc: 'Balanced macronutrients & daily energy' },
  { value: 'build_muscle', label: 'Build Muscle', desc: 'Caloric surplus & high protein target' },
  { value: 'eat_healthier', label: 'Eat Healthier', desc: 'Whole foods, micronutrient variety' },
];

export default function ProfilePage() {
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [savedSuccess, setSavedSuccess] = useState(false);

  // Profile Form state
  const [displayName, setDisplayName] = useState('');
  const [dietTypes, setDietTypes] = useState<DietType[]>([]);
  const [dietGoal, setDietGoal] = useState<DietGoal>('maintain');
  const [age, setAge] = useState<number | ''>('');
  const [heightCm, setHeightCm] = useState<number | ''>('');
  const [weightKg, setWeightKg] = useState<number | ''>('');
  const [activityLevel, setActivityLevel] = useState<ActivityLevel>('moderate');
  const [assumeStaples, setAssumeStaples] = useState(true);

  // Calculated / Custom Target
  const [calorieTarget, setCalorieTarget] = useState<number | ''>('');
  const [proteinTarget, setProteinTarget] = useState<number | ''>('');
  const [carbsTarget, setCarbsTarget] = useState<number | ''>('');
  const [fatTarget, setFatTarget] = useState<number | ''>('');

  useEffect(() => {
    async function load() {
      try {
        const session = await getAuthSession();
        if (!session) return;
        const p = await api.profile.get(session.token);
        setProfile(p);
        setDisplayName(p.display_name ?? '');
        setDietTypes((p.diet_types as DietType[]) ?? []);
        setDietGoal(p.diet_goal ?? 'maintain');
        setAge(p.age ?? '');
        setHeightCm(p.height_cm ?? '');
        setWeightKg(p.weight_kg ?? '');
        setActivityLevel(p.activity_level ?? 'moderate');
        setAssumeStaples(p.assume_staples ?? true);
        setCalorieTarget(p.calorie_target ?? '');
        if (p.macro_targets) {
          setProteinTarget(p.macro_targets.protein_g ?? '');
          setCarbsTarget(p.macro_targets.carbs_g ?? '');
          setFatTarget(p.macro_targets.fat_g ?? '');
        }
      } catch (err) {
        console.error('Failed to load profile', err);
      } finally {
        setLoading(false);
      }
    }
    void load();
  }, []);

  // Mifflin-St Jeor Formula calculation
  const calculateMacros = () => {
    const w = Number(weightKg) || 70;
    const h = Number(heightCm) || 170;
    const a = Number(age) || 30;

    // BMR estimate
    const bmr = 10 * w + 6.25 * h - 5 * a + 5;
    const activityMultipliers: Record<ActivityLevel, number> = {
      sedentary: 1.2,
      light: 1.375,
      moderate: 1.55,
      active: 1.725,
      very_active: 1.9,
    };
    let tdee = Math.round(bmr * (activityMultipliers[activityLevel] || 1.55));

    if (dietGoal === 'lose_weight') tdee -= 400;
    if (dietGoal === 'build_muscle') tdee += 300;

    const proteinG = Math.round(w * (dietGoal === 'build_muscle' ? 2.0 : 1.6));
    const fatG = Math.round((tdee * 0.25) / 9);
    const carbsG = Math.round((tdee - proteinG * 4 - fatG * 9) / 4);

    setCalorieTarget(tdee);
    setProteinTarget(proteinG);
    setCarbsTarget(carbsG);
    setFatTarget(fatG);
  };

  const handleToggleDietType = (type: DietType) => {
    setDietTypes((prev) =>
      prev.includes(type) ? prev.filter((t) => t !== type) : [...prev, type],
    );
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setSavedSuccess(false);

    try {
      const session = await getAuthSession();
      if (!session) return;

      await api.profile.update(session.token, {
        display_name: displayName.trim() || undefined,
        diet_types: dietTypes,
        diet_goal: dietGoal,
        age: age ? Number(age) : null,
        height_cm: heightCm ? Number(heightCm) : null,
        weight_kg: weightKg ? Number(weightKg) : null,
        activity_level: activityLevel,
        assume_staples: assumeStaples,
        calorie_target: calorieTarget ? Number(calorieTarget) : null,
        macro_targets: {
          calories: calorieTarget ? Number(calorieTarget) : undefined,
          protein_g: proteinTarget ? Number(proteinTarget) : undefined,
          carbs_g: carbsTarget ? Number(carbsTarget) : undefined,
          fat_g: fatTarget ? Number(fatTarget) : undefined,
        },
      });

      setSavedSuccess(true);
      setTimeout(() => setSavedSuccess(false), 3000);
    } catch (err) {
      console.error('Failed to update profile', err);
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <div className="p-8 text-center text-sm text-muted-foreground">Loading profile...</div>;

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl sm:text-3xl font-bold tracking-tight">Diet Goals & Profile</h1>
        <p className="text-sm text-muted-foreground mt-1">
          Customize your diet style, physical stats, and automated calorie/macro calculations.
        </p>
      </div>

      <form onSubmit={handleSave} className="space-y-6">
        {/* Diet Types */}
        <div className="rounded-2xl border border-border bg-card p-5 sm:p-6 space-y-4 shadow-sm">
          <h2 className="text-sm font-semibold uppercase tracking-wider text-muted-foreground">
            Diet Types
          </h2>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
            {DIET_TYPES.map((type) => {
              const active = dietTypes.includes(type.value);
              return (
                <button
                  key={type.value}
                  type="button"
                  onClick={() => handleToggleDietType(type.value)}
                  className={`py-2 px-3 rounded-xl text-xs font-semibold transition-all ${
                    active
                      ? 'bg-orange-500 text-white shadow-md shadow-orange-500/20'
                      : 'bg-muted/70 text-muted-foreground hover:bg-muted hover:text-foreground'
                  }`}
                >
                  {type.label}
                </button>
              );
            })}
          </div>
        </div>

        {/* Diet Goal */}
        <div className="rounded-2xl border border-border bg-card p-5 sm:p-6 space-y-4 shadow-sm">
          <h2 className="text-sm font-semibold uppercase tracking-wider text-muted-foreground">
            Primary Goal
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {DIET_GOALS.map((goal) => {
              const active = dietGoal === goal.value;
              return (
                <div
                  key={goal.value}
                  onClick={() => setDietGoal(goal.value)}
                  className={`p-3.5 rounded-xl border cursor-pointer transition-all ${
                    active
                      ? 'border-orange-500 bg-orange-500/5 ring-1 ring-orange-500'
                      : 'border-border hover:border-orange-500/30'
                  }`}
                >
                  <span className="font-bold text-sm block">{goal.label}</span>
                  <span className="text-xs text-muted-foreground">{goal.desc}</span>
                </div>
              );
            })}
          </div>
        </div>

        {/* Physical Stats for Macro Auto-calculation */}
        <div className="rounded-2xl border border-border bg-card p-5 sm:p-6 space-y-4 shadow-sm">
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-semibold uppercase tracking-wider text-muted-foreground">
              Body Stats & Target Calculator
            </h2>
            <button
              type="button"
              onClick={calculateMacros}
              className="text-xs font-semibold text-orange-500 hover:text-orange-600 underline"
            >
              ⚡ Auto-Calculate Targets
            </button>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <div>
              <label className="text-xs text-muted-foreground block mb-1">Age</label>
              <input
                type="number"
                placeholder="Years"
                value={age}
                onChange={(e) => setAge(e.target.value ? Number(e.target.value) : '')}
                className="w-full rounded-xl border border-input bg-background p-2 text-sm"
              />
            </div>
            <div>
              <label className="text-xs text-muted-foreground block mb-1">Height (cm)</label>
              <input
                type="number"
                placeholder="175"
                value={heightCm}
                onChange={(e) => setHeightCm(e.target.value ? Number(e.target.value) : '')}
                className="w-full rounded-xl border border-input bg-background p-2 text-sm"
              />
            </div>
            <div>
              <label className="text-xs text-muted-foreground block mb-1">Weight (kg)</label>
              <input
                type="number"
                placeholder="70"
                value={weightKg}
                onChange={(e) => setWeightKg(e.target.value ? Number(e.target.value) : '')}
                className="w-full rounded-xl border border-input bg-background p-2 text-sm"
              />
            </div>
            <div>
              <label className="text-xs text-muted-foreground block mb-1">Activity</label>
              <select
                value={activityLevel}
                onChange={(e) => setActivityLevel(e.target.value as ActivityLevel)}
                className="w-full rounded-xl border border-input bg-background p-2 text-sm"
              >
                <option value="sedentary">Sedentary</option>
                <option value="light">Light</option>
                <option value="moderate">Moderate</option>
                <option value="active">Active</option>
                <option value="very_active">Very Active</option>
              </select>
            </div>
          </div>

          {/* Macro Targets Inputs */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-3 border-t border-border">
            <div>
              <label className="text-xs text-muted-foreground block mb-1 font-semibold">Calories / day</label>
              <input
                type="number"
                value={calorieTarget}
                onChange={(e) => setCalorieTarget(e.target.value ? Number(e.target.value) : '')}
                className="w-full rounded-xl border border-input bg-background p-2 text-sm font-bold"
                placeholder="2000"
              />
            </div>
            <div>
              <label className="text-xs text-muted-foreground block mb-1 font-semibold">Protein (g)</label>
              <input
                type="number"
                value={proteinTarget}
                onChange={(e) => setProteinTarget(e.target.value ? Number(e.target.value) : '')}
                className="w-full rounded-xl border border-input bg-background p-2 text-sm font-bold"
                placeholder="140"
              />
            </div>
            <div>
              <label className="text-xs text-muted-foreground block mb-1 font-semibold">Carbs (g)</label>
              <input
                type="number"
                value={carbsTarget}
                onChange={(e) => setCarbsTarget(e.target.value ? Number(e.target.value) : '')}
                className="w-full rounded-xl border border-input bg-background p-2 text-sm font-bold"
                placeholder="220"
              />
            </div>
            <div>
              <label className="text-xs text-muted-foreground block mb-1 font-semibold">Fat (g)</label>
              <input
                type="number"
                value={fatTarget}
                onChange={(e) => setFatTarget(e.target.value ? Number(e.target.value) : '')}
                className="w-full rounded-xl border border-input bg-background p-2 text-sm font-bold"
                placeholder="60"
              />
            </div>
          </div>
        </div>

        {/* Common Staples Preference */}
        <div className="rounded-2xl border border-border bg-card p-5 sm:p-6 shadow-sm">
          <label className="flex items-center justify-between cursor-pointer">
            <div>
              <span className="font-semibold text-sm block text-foreground">Assume Common Staples</span>
              <span className="text-xs text-muted-foreground">
                Assumes you always have salt, black pepper, olive oil, and water available.
              </span>
            </div>
            <input
              type="checkbox"
              checked={assumeStaples}
              onChange={(e) => setAssumeStaples(e.target.checked)}
              className="rounded accent-orange-500 w-5 h-5 cursor-pointer ml-4"
            />
          </label>
        </div>

        {savedSuccess && (
          <div className="rounded-xl bg-emerald-50 border border-emerald-200 dark:bg-emerald-950/20 dark:border-emerald-800 p-3 text-xs font-semibold text-emerald-800 dark:text-emerald-300">
            ✓ Profile and nutrition targets saved successfully!
          </div>
        )}

        <button
          type="submit"
          disabled={saving}
          className="rounded-xl bg-orange-500 px-8 py-3 text-sm font-bold text-white hover:bg-orange-600 disabled:opacity-50 transition-colors shadow-md shadow-orange-500/20"
        >
          {saving ? 'Saving...' : 'Save Profile Settings'}
        </button>
      </form>
    </div>
  );
}
