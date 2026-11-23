import { useEffect, useState } from 'react';
import { useStore, type RecipeRecord } from './state';
import { BottomNav, type Screen } from './components/BottomNav';
import { RecipeSheet } from './components/RecipeSheet';
import { Onboarding } from './screens/Onboarding';
import { GenerateScreen } from './screens/Generate';
import { PantryScreen } from './screens/Pantry';
import { TasteScreen } from './screens/Taste';
import { SavedScreen } from './screens/Saved';
import { ProfileScreen } from './screens/Profile';

export function App() {
  const { state } = useStore();
  const [screen, setScreen] = useState<Screen>('generate');
  const [selected, setSelected] = useState<RecipeRecord | null>(null);

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'auto' });
  }, [screen]);

  if (!state.onboarded) {
    return <Onboarding />;
  }

  return (
    <div className="app">
      <main className="app-main" key={screen}>
        {screen === 'generate' && (
          <GenerateScreen onOpenRecipe={setSelected} onNavigate={setScreen} />
        )}
        {screen === 'pantry' && <PantryScreen />}
        {screen === 'taste' && <TasteScreen />}
        {screen === 'saved' && <SavedScreen onOpenRecipe={setSelected} />}
        {screen === 'profile' && <ProfileScreen />}
      </main>
      <BottomNav screen={screen} onChange={setScreen} />
      <RecipeSheet record={selected} onClose={() => setSelected(null)} />
    </div>
  );
}
