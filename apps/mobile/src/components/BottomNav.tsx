import {
  BookmarkIcon,
  PantryIcon,
  ProfileIcon,
  SparkIcon,
  TasteIcon,
} from '../icons';

export type Screen = 'generate' | 'pantry' | 'taste' | 'saved' | 'profile';

const ITEMS: Array<{ id: Screen; label: string; Icon: typeof SparkIcon }> = [
  { id: 'generate', label: 'Cook', Icon: SparkIcon },
  { id: 'pantry', label: 'Pantry', Icon: PantryIcon },
  { id: 'taste', label: 'Taste', Icon: TasteIcon },
  { id: 'saved', label: 'Saved', Icon: BookmarkIcon },
  { id: 'profile', label: 'You', Icon: ProfileIcon },
];

export function BottomNav({
  screen,
  onChange,
}: {
  screen: Screen;
  onChange: (screen: Screen) => void;
}) {
  return (
    <nav className="bottom-nav" aria-label="Main navigation">
      {ITEMS.map(({ id, label, Icon }) => {
        const active = screen === id;
        return (
          <button
            key={id}
            type="button"
            className={`nav-item ${active ? 'is-active' : ''}`}
            aria-current={active ? 'page' : undefined}
            onClick={() => onChange(id)}
          >
            <span className="nav-icon">
              <Icon size={21} />
            </span>
            <span className="nav-label">{label}</span>
          </button>
        );
      })}
    </nav>
  );
}
