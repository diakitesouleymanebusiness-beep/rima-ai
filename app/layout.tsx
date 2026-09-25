// ============================================================
// RIMA AI — Layout racine
// ============================================================
import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'RIMA AI — Votre Assistante Vocale',
  description: 'Application vocale pour personnes analphabètes en Afrique. Santé, Agriculture, Éducation.',
  manifest: '/manifest.json',
  themeColor: '#22c55e',
  viewport: 'width=device-width, initial-scale=1, maximum-scale=1',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="fr">
      <body className="bg-gradient-to-br from-primary-50 to-earth-50 min-h-screen font-sans antialiased">
        <div className="max-w-md mx-auto min-h-screen bg-white shadow-2xl relative">
          {children}
        </div>
      </body>
    </html>
  );
}
