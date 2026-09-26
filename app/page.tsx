// ============================================================
// RIMA AI — Page d'accueil
// ============================================================
'use client';
import { useEffect, useState } from 'react';
import MainNavButton from '@/components/sections/MainNavButton';
import ComingSoonButton from '@/components/ui/ComingSoonButton';
import AdBanner from '@/components/ui/AdBanner';
import LanguageSelector from '@/components/ui/LanguageSelector';
import { Language, LANGUAGES } from '@/types';
import { speakText, storage } from '@/lib/utils';
import { useGeoLanguage } from '@/hooks/useGeoLanguage';

export default function HomePage() {
  const [language, setLanguage] = useState<Language>('fr');
  const hasSavedLang = !!storage.get<Language>('rima_language');
  useGeoLanguage(setLanguage, hasSavedLang);
  const [greeted, setGreeted] = useState(false);

  // Charger la langue sauvegardée
  useEffect(() => {
    const saved = storage.get<Language>('rima_language');
    if (saved) setLanguage(saved);
  }, []);

  // Accueil personnalisé vocal au chargement
  useEffect(() => {
    if (greeted) return;
    const langConf = LANGUAGES.find((l) => l.code === language);
    if (!langConf) return;
    const greeting = `${langConf.greeting} Choisissez un service.`;
    const timer = setTimeout(() => {
      speakText(greeting, language).catch(() => {});
      setGreeted(true);
    }, 800);
    return () => clearTimeout(timer);
  }, [language, greeted]);

  const handleLanguageChange = (lang: Language) => {
    setLanguage(lang);
    storage.set('rima_language', lang);
    setGreeted(false); // Re-saluer dans la nouvelle langue
  };

  return (
    <div className="flex flex-col min-h-screen">
      {/* ---- Header ---- */}
      <header className="bg-primary-600 text-white px-5 pt-8 pb-6 rounded-b-3xl shadow-lg">
        <div className="flex items-center gap-3 mb-1">
          <span className="text-4xl">🎙️</span>
          <div>
            <h1 className="text-3xl font-black tracking-tight">RIMA AI</h1>
            <p className="text-primary-100 text-sm">Votre assistante vocale africaine</p>
          </div>
        </div>
        {/* Sélecteur de langue */}
        <div className="mt-4">
          <p className="text-primary-100 text-xs mb-2 font-semibold uppercase tracking-wider">Langue</p>
          <LanguageSelector value={language} onChange={handleLanguageChange} />
        </div>
      </header>

      <main className="flex-1 flex flex-col gap-5 p-5">

        {/* ---- Section Assistant de base ---- */}
        <section>
          <h2 className="text-lg font-bold text-gray-700 mb-3 flex items-center gap-2">
            <span>🤖</span> Assistant quotidien
          </h2>
          <MainNavButton
            icon="🤖"
            label="Assistant"
            sublabel="Contacts, appels, navigation, lecture"
            href="/assistant"
            color="bg-gradient-to-br from-sky-500 to-sky-600"
            language={language}
            voiceMessage="Ouverture de l'assistant vocal."
          />
        </section>

        {/* ---- Trois axes principaux ---- */}
        <section>
          <h2 className="text-lg font-bold text-gray-700 mb-3 flex items-center gap-2">
            <span>⭐</span> Services spécialisés
          </h2>
          <div className="grid grid-cols-1 gap-4">
            <MainNavButton
              icon="🏥"
              label="Santé"
              sublabel="Décrivez vos symptômes"
              href="/health"
              color="bg-gradient-to-br from-red-400 to-rose-500"
              language={language}
              voiceMessage="Ouverture du service santé. Décrivez vos symptômes."
            />
            <MainNavButton
              icon="🌾"
              label="Agriculture"
              sublabel="Analysez vos plantes"
              href="/agriculture"
              color="bg-gradient-to-br from-primary-500 to-primary-700"
              language={language}
              voiceMessage="Ouverture du service agriculture. Analysez vos plantes."
            />
            <MainNavButton
              icon="📚"
              label="Éducation"
              sublabel="Apprenez à lire et écrire"
              href="/education"
              color="bg-gradient-to-br from-earth-400 to-earth-600"
              language={language}
              voiceMessage="Ouverture du service éducation. Apprenons ensemble."
            />
          </div>
        </section>

        {/* ---- Jeu participatif ---- */}
        <section>
          <MainNavButton
            icon="🎮"
            label="Jeu de traduction"
            sublabel="Gagnez des points en traduisant"
            href="/game"
            color="bg-gradient-to-br from-purple-500 to-violet-600"
            language={language}
            voiceMessage="Bienvenue dans le jeu de traduction !"
          />
        </section>

        {/* ---- Boutons Coming Soon ---- */}
        <section>
          <h2 className="text-sm font-bold text-gray-400 mb-3 uppercase tracking-widest">
            🚀 Prochainement
          </h2>
          <div className="flex flex-wrap gap-3 justify-center">
            <ComingSoonButton icon="💬" label="SMS vocal" />
            <ComingSoonButton icon="💰" label="Prix marché" />
            <ComingSoonButton icon="🌤️" label="Météo" />
            <ComingSoonButton icon="🧪" label="Sol" />
            <ComingSoonButton icon="✍️" label="Écriture" />
            <ComingSoonButton icon="🔢" label="Maths" />
            <ComingSoonButton icon="💊" label="RDV médecin" />
            <ComingSoonButton icon="🤝" label="Mise en relation" />
          </div>
        </section>

        {/* ---- Bannière pub simulée ---- */}
        <AdBanner />
      </main>

      <footer className="text-center py-4 text-xs text-gray-400">
        RIMA AI © 2026 — Mistral AI Bootcamp — 🌍 Afrique
      </footer>
    </div>
  );
}
