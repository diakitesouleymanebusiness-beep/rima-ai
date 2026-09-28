// ============================================================
// RIMA AI — Layout racine
// ============================================================
import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'RIMA AI — Votre Assistante Vocale',
  description: 'Application vocale pour personnes analphabètes en Afrique. Santé, Agriculture, Éducation.',
  manifest: '/manifest.json',
  themeColor: '#16a34a',
  viewport: 'width=device-width, initial-scale=1, maximum-scale=1',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="fr">
      <body>
        {children}
      </body>
    </html>
  );
}
