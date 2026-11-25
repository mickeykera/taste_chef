import type { Metadata, Viewport } from 'next';
import './landing.css';

export const metadata: Metadata = {
  title: 'TasteChef — Your pantry, in one app',
  description:
    'Recipes from the pantry you have, matched to your diet, texture dislikes and taste. Generated offline on your phone.',
};

export const viewport: Viewport = {
  themeColor: '#fbfaf4',
  width: 'device-width',
  initialScale: 1,
  maximumScale: 5,
};

export default function LandingLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
