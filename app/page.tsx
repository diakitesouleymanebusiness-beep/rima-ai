// ============================================================
// RIMA AI — Page d'accueil — Design Stitch Material
// ============================================================
'use client';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import LanguageSelector from '@/components/ui/LanguageSelector';
import { Language, LANGUAGES } from '@/types';
import { speakText, stopSpeaking, storage } from '@/lib/utils';
import { useGeoLanguage } from '@/hooks/useGeoLanguage';

export default function HomePage() {
  const [language, setLanguage] = useState<Language>('fr');
  const hasSavedLang = !!storage.get<Language>('rima_language');
  useGeoLanguage(setLanguage, hasSavedLang);
  const [greeted, setGreeted] = useState(false);
  const router = useRouter();

  useEffect(() => {
    const saved = storage.get<Language>('rima_language');
    if (saved) setLanguage(saved);
  }, []);

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
    setGreeted(false);
  };

  const navigate = (href: string, voice: string) => {
    stopSpeaking();
    speakText(voice, language).catch(() => {});
    router.push(href);
  };

  const langConf = LANGUAGES.find((l) => l.code === language);
  const langLabel = langConf?.label ?? 'Français';

  return (
    <div className="rima-app">

      {/* ═══ HEADER ═══ */}
      <header className="rima-header">
        <div className="rima-header-left">
          {/* Logo cercle vert */}
          <div className="rima-logo-circle">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="white">
              <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 14.5v-9l6 4.5-6 4.5z"/>
            </svg>
          </div>
          <div>
            <div className="rima-logo-title">
              RIMA <span className="rima-ai-badge">AI</span>
            </div>
            <div className="rima-logo-sub">Écoute active</div>
          </div>
        </div>
        <div className="rima-header-right">
          {/* Signal barres */}
          <div className="rima-signal">
            <span className="signal-bar h-2"></span>
            <span className="signal-bar h-3"></span>
            <span className="signal-bar h-4"></span>
            <span className="signal-bar h-5"></span>
          </div>
          {/* Sélecteur langue compact */}
          <button
            className="rima-lang-pill"
            onClick={() => {
              const langs: Language[] = ['fr','wo','bm','dyu','ff','ha','sw','en','ar'];
              const idx = langs.indexOf(language);
              const next = langs[(idx + 1) % langs.length];
              handleLanguageChange(next);
            }}
          >
            {langLabel.slice(0, 5)}
            <svg width="10" height="10" viewBox="0 0 24 24" fill="currentColor" className="ml-1">
              <path d="M7 10l5 5 5-5z"/>
            </svg>
          </button>
          {/* Avatar */}
          <div className="rima-avatar">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="white">
              <path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z"/>
            </svg>
          </div>
        </div>
      </header>

      {/* ═══ MAIN SCROLL ═══ */}
      <main className="rima-main">

        {/* ── Card salutation ── */}
        <div className="rima-card salutation-card">
          <div className="salutation-top">
            <span className="badge-voxtral">✦ Mistral Voxtral</span>
            <span className="badge-voix">● Voix active</span>
            <button className="btn-icon-sm ml-auto" onClick={() => speakText(langConf?.greeting ?? 'Bonjour !', language).catch(() => {})}>
              <SpeakerIcon />
            </button>
          </div>
          <h2 className="salutation-greeting">{langConf?.greeting ?? 'Bonjour !'}</h2>
          <p className="salutation-question">Que veux-tu faire aujourd&apos;hui ?</p>
          <button
            className="btn-mode-vocal"
            onClick={() => navigate('/assistant', "Ouverture de l'assistant vocal.")}
          >
            <MicIcon size={16} /> Mode vocal actif
            <span className="ml-2 text-xs opacity-80">Parle librement ou appuie</span>
          </button>
        </div>

        {/* ── Card Agriculture (grande) ── */}
        <div
          className="rima-card service-card-large agriculture-card"
          onClick={() => navigate('/agriculture', "Ouverture du service agriculture.")}
        >
          <div className="service-icon-large agri-icon">
            <svg width="28" height="28" viewBox="0 0 24 24" fill="#16a34a">
              <path d="M17 8C8 10 5.9 16.17 3.82 21.34L5.71 22l1-2.3A4.49 4.49 0 0 0 8 20C19 20 22 3 22 3c-1 2-8 2-8 2z"/>
            </svg>
          </div>
          <div className="service-card-text">
            <div className="service-card-title">Agriculture</div>
            <div className="service-card-sub">Conseil BIO &amp; Analyse Photos</div>
          </div>
          <div className="service-card-badges">
            <span className="badge-bio">🌿 100%<br/>Bio</span>
            <button className="btn-icon-sm" onClick={(e)=>{e.stopPropagation(); speakText('Service agriculture', language).catch(()=>{})}}>
              <EarIcon />
            </button>
          </div>
        </div>

        {/* ── Cards Santé + Éducation côte à côte ── */}
        <div className="services-grid-2">
          <div
            className="rima-card service-card-small sante-card"
            onClick={() => navigate('/health', 'Ouverture du service santé.')}
          >
            <div className="service-small-top">
              <div className="service-icon-sm sante-icon">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="#ef4444">
                  <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z"/>
                </svg>
              </div>
              <span className="badge-small voix-badge">🎤 Voix</span>
            </div>
            <div className="service-small-title">Santé</div>
            <div className="service-small-sub">Symptômes &amp; Soins</div>
          </div>

          <div
            className="rima-card service-card-small edu-card"
            onClick={() => navigate('/education', 'Ouverture du service éducation.')}
          >
            <div className="service-small-top">
              <div className="service-icon-sm edu-icon">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="#d97706">
                  <path d="M18 2H6c-1.1 0-2 .9-2 2v16c0 1.1.9 2 2 2h12c1.1 0 2-.9 2-2V4c0-1.1-.9-2-2-2zm-2 14H8v-2h8v2zm0-4H8v-2h8v2zm0-4H8V6h8v2z"/>
                </svg>
              </div>
              <span className="badge-small gamifie-badge">🎮 Gamifié</span>
            </div>
            <div className="service-small-title">Éducation</div>
            <div className="service-small-sub">Alphabet &amp; Langues</div>
          </div>
        </div>

        {/* ── Bouton micro central ── */}
        <div className="mic-section">
          <button
            className="btn-mic-main"
            onClick={() => navigate('/assistant', "Ouverture de l'assistant vocal.")}
          >
            <MicIcon size={28} />
          </button>
          <div className="mic-label">
            <span className="mic-dot"></span>
            Micro Prêt • Touche pour Parler
          </div>
        </div>

        {/* ── Dis par exemple ── */}
        <div className="rima-card exemples-card">
          <div className="exemples-header">
            <div className="exemples-icon">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="#6366f1">
                <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 17h-2v-2h2v2zm2.07-7.75l-.9.92C13.45 12.9 13 13.5 13 15h-2v-.5c0-1.1.45-2.1 1.17-2.83l1.24-1.26c.37-.36.59-.86.59-1.41 0-1.1-.9-2-2-2s-2 .9-2 2H8c0-2.21 1.79-4 4-4s4 1.79 4 4c0 .88-.36 1.68-.93 2.25z"/>
              </svg>
            </div>
            <span className="exemples-title">DIS PAR EXEMPLE :</span>
          </div>
          <div className="exemples-phrases">
            <span className="exemple-pill" onClick={() => navigate('/agriculture', 'Analyse ma plante')}>« Comment soigner mes tomates ? »</span>
            <span className="exemple-pill" onClick={() => navigate('/health', "J'ai mal à la tête")}>« J&apos;ai mal à la tête »</span>
            <span className="exemple-pill" onClick={() => navigate('/education', 'Apprends-moi')}>« Apprends-moi le A »</span>
          </div>
        </div>

        {/* ── Jeu participatif ── */}
        <div
          className="rima-card jeu-card"
          onClick={() => navigate('/game', 'Bienvenue dans le jeu de traduction !')}
        >
          <div className="jeu-header">
            <div className="jeu-icon">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="#7c3aed">
                <path d="M20.5 11H19V7c0-1.1-.9-2-2-2h-4V3.5C13 2.12 11.88 1 10.5 1S8 2.12 8 3.5V5H4c-1.1 0-1.99.9-1.99 2v3.8H3.5c1.49 0 2.7 1.21 2.7 2.7s-1.21 2.7-2.7 2.7H2V20c0 1.1.9 2 2 2h3.8v-1.5c0-1.49 1.21-2.7 2.7-2.7s2.7 1.21 2.7 2.7V22H17c1.1 0 2-.9 2-2v-4h1.5c1.38 0 2.5-1.12 2.5-2.5S21.88 11 20.5 11z"/>
              </svg>
            </div>
            <div className="jeu-texte">
              <div className="jeu-title">Jeu Participatif de Traduction</div>
              <div className="jeu-defi">DÉFI DU JOUR &nbsp;·&nbsp; Couche Phonétique IPA</div>
              <div className="jeu-question">Comment dit-on « Bonjour » dans ta langue ?</div>
            </div>
            <div className="jeu-pts">150<br/><span className="text-xs">pts</span></div>
          </div>
          <button
            className="btn-enregistrer-voix"
            onClick={(e) => { e.stopPropagation(); navigate('/game', 'Bienvenue dans le jeu de traduction !'); }}
          >
            <MicIcon size={16} /> Enregistrer ma voix (+25 pts)
          </button>
        </div>

        {/* ── Raccourcis quotidiens ── */}
        <div className="raccourcis-section">
          <div className="raccourcis-header">
            <span className="raccourcis-title">Raccourcis du quotidien</span>
            <span className="outils-label">Outils rapides</span>
          </div>
          <div className="raccourcis-grid">
            <button
              className="raccourci-btn"
              onClick={() => navigate('/assistant', 'Enregistrer un contact.')}
            >
              <svg width="18" height="18" viewBox="0 0 24 24" fill="#16a34a">
                <path d="M19 3H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zm-7 3c1.93 0 3.5 1.57 3.5 3.5S13.93 13 12 13s-3.5-1.57-3.5-3.5S10.07 6 12 6zm7 13H5v-.23c0-.62.28-1.2.76-1.58C7.47 15.82 9.64 15 12 15s4.53.82 6.24 2.19c.48.38.76.97.76 1.58V19z"/>
              </svg>
              <span>Enregistrer contact</span>
            </button>
            <button
              className="raccourci-btn"
              onClick={() => navigate('/assistant', 'Passer un appel.')}
            >
              <svg width="18" height="18" viewBox="0 0 24 24" fill="#16a34a">
                <path d="M6.62 10.79c1.44 2.83 3.76 5.14 6.59 6.59l2.2-2.2c.27-.27.67-.36 1.02-.24 1.12.37 2.33.57 3.57.57.55 0 1 .45 1 1V20c0 .55-.45 1-1 1-9.39 0-17-7.61-17-17 0-.55.45-1 1-1h3.5c.55 0 1 .45 1 1 0 1.25.2 2.45.57 3.57.11.35.03.74-.25 1.02l-2.2 2.2z"/>
              </svg>
              <span>Appeler</span>
            </button>
            <button className="raccourci-btn raccourci-bientot">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="#d97706">
                <path d="M11 9H9V2H7v7H5V2H3v7c0 2.12 1.66 3.84 3.75 3.97V22h2.5v-9.03C11.34 12.84 13 11.12 13 9V2h-2v7zm5-3v8h2.5v8H21V2c-2.76 0-5 2.24-5 4z"/>
              </svg>
              <span>Prix du marché</span>
              <span className="bientot-badge">BIENTÔT</span>
            </button>
            <button className="raccourci-btn raccourci-bientot">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="#0ea5e9">
                <path d="M6.76 4.84l-1.8-1.79-1.41 1.41 1.79 1.79 1.42-1.41zM4 10.5H1v2h3v-2zm9-9.95h-2V3.5h2V.55zm7.45 3.91l-1.41-1.41-1.79 1.79 1.41 1.41 1.79-1.79zm-3.21 13.7l1.79 1.8 1.41-1.41-1.8-1.79-1.4 1.4zM20 10.5v2h3v-2h-3zm-8-5c-3.31 0-6 2.69-6 6s2.69 6 6 6 6-2.69 6-6-2.69-6-6-6zm-1 16.95h2V19.5h-2v2.95zm-7.45-3.91l1.41 1.41 1.79-1.8-1.41-1.41-1.79 1.8z"/>
              </svg>
              <span>Météo agricole</span>
              <span className="bientot-badge">BIENTÔT</span>
            </button>
          </div>
        </div>

        {/* ── Bannière pub simulée ── */}
        <div className="pub-card">
          <div className="pub-header">
            <span className="pub-label">ESPACE PUBLICITAIRE (SIMULATION)</span>
            <span className="pub-vercel">Vercel Hobby · Non commercial</span>
          </div>
          <div className="pub-content">
            <div className="pub-icon">🌱</div>
            <div className="pub-text">
              <div className="pub-title">Semences Certifiées Bio &amp; É…</div>
              <div className="pub-sub">Solutions durables pour…</div>
            </div>
            <button className="btn-icon-sm" onClick={() => speakText('Annonce partenaire local', language).catch(()=>{})}>
              <SpeakerIcon />
            </button>
          </div>
          <div className="pub-footer">
            <span className="annonce-badge">ANNONCE</span>
            <span className="annonce-text">Micro-crédit vocal agricole dis…</span>
            <button className="annonce-ecouter" onClick={() => speakText('Micro-crédit vocal agricole disponible', language).catch(()=>{})}>
              🔊 Écouter
            </button>
          </div>
        </div>

        {/* Espace pour la nav bar */}
        <div className="h-20"></div>
      </main>

      {/* ═══ BOTTOM NAV ═══ */}
      <nav className="rima-bottom-nav">
        <button className="nav-item nav-item-active">
          <svg width="22" height="22" viewBox="0 0 24 24" fill="currentColor">
            <path d="M10 20v-6h4v6h5v-8h3L12 3 2 12h3v8z"/>
          </svg>
          <span>Accueil</span>
        </button>
        <button className="nav-item" onClick={() => navigate('/agriculture', 'Service agriculture.')}>
          <svg width="22" height="22" viewBox="0 0 24 24" fill="currentColor">
            <path d="M17 8C8 10 5.9 16.17 3.82 21.34L5.71 22l1-2.3A4.49 4.49 0 0 0 8 20C19 20 22 3 22 3c-1 2-8 2-8 2z"/>
          </svg>
          <span>Champs</span>
        </button>
        <button className="nav-item" onClick={() => navigate('/health', 'Service santé.')}>
          <svg width="22" height="22" viewBox="0 0 24 24" fill="currentColor">
            <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z"/>
          </svg>
          <span>Santé</span>
        </button>
        <button className="nav-item nav-item-disabled">
          <svg width="22" height="22" viewBox="0 0 24 24" fill="currentColor">
            <path d="M11 9H9V2H7v7H5V2H3v7c0 2.12 1.66 3.84 3.75 3.97V22h2.5v-9.03C11.34 12.84 13 11.12 13 9V2h-2v7zm5-3v8h2.5v8H21V2c-2.76 0-5 2.24-5 4z"/>
          </svg>
          <span>Marché</span>
        </button>
        <button className="nav-item" onClick={() => speakText('Comment puis-je vous aider ?', language).catch(()=>{})}>
          <svg width="22" height="22" viewBox="0 0 24 24" fill="currentColor">
            <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 17h-2v-2h2v2zm2.07-7.75l-.9.92C13.45 12.9 13 13.5 13 15h-2v-.5c0-1.1.45-2.1 1.17-2.83l1.24-1.26c.37-.36.59-.86.59-1.41 0-1.1-.9-2-2-2s-2 .9-2 2H8c0-2.21 1.79-4 4-4s4 1.79 4 4c0 .88-.36 1.68-.93 2.25z"/>
          </svg>
          <span>Aide</span>
        </button>
      </nav>
    </div>
  );
}

// ── Icônes SVG inline ──
function MicIcon({ size = 24 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor">
      <path d="M12 14c1.66 0 2.99-1.34 2.99-3L15 5c0-1.66-1.34-3-3-3S9 3.34 9 5v6c0 1.66 1.34 3 3 3zm5.3-3c0 3-2.54 5.1-5.3 5.1S6.7 14 6.7 11H5c0 3.41 2.72 6.23 6 6.72V21h2v-3.28c3.28-.48 6-3.3 6-6.72h-1.7z"/>
    </svg>
  );
}
function SpeakerIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
      <path d="M3 9v6h4l5 5V4L7 9H3zm13.5 3c0-1.77-1.02-3.29-2.5-4.03v8.05c1.48-.73 2.5-2.25 2.5-4.02zM14 3.23v2.06c2.89.86 5 3.54 5 6.71s-2.11 5.85-5 6.71v2.06c4.01-.91 7-4.49 7-8.77s-2.99-7.86-7-8.77z"/>
    </svg>
  );
}
function EarIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
      <path d="M17 8C17 4.69 14.31 2 11 2S5 4.69 5 8c0 2.38 1.34 4.45 3.31 5.54L8 15h6l-.31-1.46C15.66 12.45 17 10.38 17 8zm-6 12c1.1 0 2-.9 2-2H9c0 1.1.9 2 2 2zm-4-5h8v-2H7v2z"/>
    </svg>
  );
}
