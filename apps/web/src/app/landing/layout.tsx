import type { Metadata, Viewport } from 'next';
import './landing.css';

export const metadata: Metadata = {
  title: 'TasteChef — Cooking that respects what you will actually eat',
  description:
    'Recipes built around your texture likes and dislikes, your allergens and the food already in your kitchen. Pre-launch preview.',
};

export const viewport: Viewport = {
  themeColor: '#ffffff',
  width: 'device-width',
  initialScale: 1,
  maximumScale: 5,
};

export default function LandingLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
