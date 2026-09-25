// ============================================================
// RIMA AI — Page Jeu Participatif de Traduction
// Collecte de mots en langues africaines avec couche phonétique
// ============================================================
'use client';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import VoiceRecorder from '@/components/voice/VoiceRecorder';
import TextInput from '@/components/voice/TextInput';
import LoadingSpinner from '@/components/ui/LoadingSpinner';
import AdBanner from '@/components/ui/AdBanner';
import { Language, PhoneticEntry, GameTranslation } from '@/types';
import { speakText, storage, uid, KNOWN_AFRICAN_LANGUAGES } from '@/lib/utils';

// Phrases à traduire pour le jeu
const GAME_PHRASES = [
  { fr: 'Bonjour, comment vas-tu ?', en: 'Hello, how are you?', ar: 'مرحباً، كيف حالك؟' },
  { fr: 'Merci beaucoup.', en: 'Thank you very much.', ar: 'شكراً جزيلاً.' },
  { fr: 'De l\'eau, s\'il vous plaît.', en: 'Water, please.', ar: 'ماء من فضلك.' },
  { fr: 'Où est le marché ?', en: 'Where is the market?', ar: 'أين السوق؟' },
  { fr: 'Je vais bien.', en: 'I am fine.', ar: 'أنا بخير.' },
];

type GameStep = 'intro' | 'language-info' | 'playing' | 'unknown-lang' | 'result';

export default function GamePage() {
  const router = useRouter();
  const [appLang, setAppLang]         = useState<Language>('fr');
  const [step, setStep]               = useState<GameStep>('intro');
  const [phraseIdx, setPhraseIdx]     = useState(0);
  const [userLanguage, setUserLanguage] = useState('');
  const [userCountry, setUserCountry]   = useState('');
  const [userCity, setUserCity]         = useState('');
  const [loading, setLoading]           = useState(false);
  const [points, setPoints]             = useState(() => storage.get<number>('rima_points') ?? 0);
  const [translations, setTranslations] = useState<GameTranslation[]>([]);
  const [inputMode, setInputMode]       = useState<'voice' | 'text'>('voice');
  const [collectStep, setCollectStep]   = useState<'country' | 'city' | 'language'>('country');

  useEffect(() => {
    const saved = storage.get<Language>('rima_language');
    if (saved) setAppLang(saved);
    speakText('Bienvenue dans le jeu de traduction ! Gagnez des points en traduisant des phrases dans votre langue.', saved ?? 'fr').catch(() => {});
  }, []);

  const currentPhrase = GAME_PHRASES[phraseIdx];
  const phraseToTranslate = currentPhrase[appLang] ?? currentPhrase.fr;

  const handleStartGame = () => {
    setStep('language-info');
    setCollectStep('country');
    speakText('Quel est votre pays ?', appLang).catch(() => {});
  };

  // Collecte des informations géographiques
  const handleInfoInput = (text: string) => {
    if (collectStep === 'country') {
      setUserCountry(text);
      setCollectStep('city');
      speakText('Quelle est votre ville ?', appLang).catch(() => {});
    } else if (collectStep === 'city') {
      setUserCity(text);
      setCollectStep('language');
      speakText('Quelle est votre langue locale ?', appLang).catch(() => {});
    } else if (collectStep === 'language') {
      setUserLanguage(text);
      // Vérifier si la langue est connue
      const isKnown = KNOWN_AFRICAN_LANGUAGES.some(l =>
        text.toLowerCase().includes(l) || l.includes(text.toLowerCase().trim())
      );
      if (isKnown) {
        setStep('playing');
        speakText(`Parfait ! Traduisez cette phrase en ${text} : ${phraseToTranslate}`, appLang).catch(() => {});
      } else {
        setStep('unknown-lang');
        speakText(`La langue "${text}" n'est pas encore dans notre base. Aidez-nous à la collecter !`, appLang).catch(() => {});
      }
    }
  };

  // Gérer la traduction soumise par l'utilisateur
  const handleTranslation = async (transcript: string) => {
    setLoading(true);
    try {
      // Simuler l'extraction IPA via Mistral
      const res = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          messages: [{ role: 'user', content:
            `Le mot "${transcript}" en langue "${userLanguage}" de ${userCity}, ${userCountry}.
             Génère une transcription IPA approximative et une variante dialectale possible.
             Réponds UNIQUEMENT en JSON : {"ipa": "...", "variante": {"zone": "...", "ipa": "...", "note": "..."}}` }],
          language: appLang,
        }),
      });
      const json = await res.json();

      let ipa = '/transcription/';
      let variante = { zone: userCity, ipa: '/variante/', note: 'variante dialectale' };

      try {
        const match = json.data?.text?.match(/\{[\s\S]*\}/);
        if (match) {
          const parsed = JSON.parse(match[0]);
          ipa = parsed.ipa ?? ipa;
          variante = parsed.variante ?? variante;
        }
      } catch {}

      // Structure phonétique complète (JSON visible dans le code, selon les specs)
      const phoneticEntry: PhoneticEntry = {
        mot: transcript,
        langue: userLanguage,
        zone: `${userCity}, ${userCountry}`,
        ipa,
        audio_url: undefined,
        variantes: [variante],
      };

      const translation: GameTranslation = {
        phrase: phraseToTranslate,
        language: userLanguage,
        zone: `${userCity}, ${userCountry}`,
        country: userCountry,
        phonetic: phoneticEntry,
        isKnownLanguage: step !== 'unknown-lang',
      };

      setTranslations(t => [...t, translation]);

      // Points
      const earned = 50;
      const newPts = points + earned;
      setPoints(newPts);
      storage.set('rima_points', newPts);

      const msg = `Merci ! Vous avez gagné ${earned} points. ${newPts} points au total.`;
      speakText(msg, appLang).catch(() => {});

      // Passer à la phrase suivante ou terminer
      if (phraseIdx + 1 < GAME_PHRASES.length) {
        setPhraseIdx(i => i + 1);
        const next = GAME_PHRASES[phraseIdx + 1][appLang] ?? GAME_PHRASES[phraseIdx + 1].fr;
        setTimeout(() => speakText(`Phrase suivante : ${next}`, appLang).catch(() => {}), 2000);
      } else {
        setTimeout(() => setStep('result'), 1500);
      }
    } finally {
      setLoading(false);
    }
  };

  const collectStepLabel = { country: 'Votre pays', city: 'Votre ville', language: 'Votre langue locale' }[collectStep];
  const collectPlaceholder = {
    country:  'Ex: Côte d\'Ivoire',
    city:     'Ex: Abidjan',
    language: 'Ex: Dioula, Bété, Baoulé...',
  }[collectStep];

  return (
    <div className="flex flex-col min-h-screen">
      <header className="bg-gradient-to-br from-purple-500 to-violet-700 text-white px-5 pt-8 pb-6 rounded-b-3xl shadow-lg">
        <div className="flex items-center gap-3">
          <button onClick={() => router.push('/')} className="text-white/80 hover:text-white text-2xl">←</button>
          <span className="text-4xl">🎮</span>
          <div>
            <h1 className="text-2xl font-black">Jeu de traduction</h1>
            <p className="text-purple-100 text-sm">Aidez RIMA à apprendre votre langue !</p>
          </div>
          <div className="ml-auto bg-white/20 rounded-2xl px-3 py-1 text-center">
            <p className="text-xs opacity-80">Points</p>
            <p className="text-xl font-black">{points}</p>
          </div>
        </div>
      </header>

      <main className="flex-1 p-5 flex flex-col gap-5">

        {/* Intro */}
        {step === 'intro' && (
          <div className="card text-center flex flex-col items-center gap-5">
            <span className="text-7xl">🌍</span>
            <h2 className="text-2xl font-black text-gray-800">Apprenez à RIMA votre langue !</h2>
            <p className="text-gray-600 leading-relaxed">
              Traduisez des phrases simples dans votre langue locale. Chaque traduction aide RIMA à mieux comprendre les langues africaines.
            </p>
            <div className="bg-purple-50 border border-purple-200 rounded-2xl p-4 w-full text-left">
              <p className="font-bold text-purple-700 mb-2">🏆 Récompenses :</p>
              <p className="text-sm text-gray-600">✅ 50 points par traduction</p>
              <p className="text-sm text-gray-600">✅ Bonus pour les nouvelles langues</p>
              <p className="text-sm text-gray-400 mt-2">(Conversion en Mobile Money — Bientôt !)</p>
            </div>
            <button
              onClick={handleStartGame}
              className="w-full py-5 bg-purple-600 text-white rounded-2xl font-black text-xl hover:bg-purple-700 shadow-lg active:scale-95 transition-all"
            >
              🎯 Commencer à jouer !
            </button>
          </div>
        )}

        {/* Collecte infos géographiques */}
        {step === 'language-info' && (
          <div className="card flex flex-col items-center gap-5 text-center">
            <div className="text-5xl">{collectStep === 'country' ? '🌍' : collectStep === 'city' ? '🏙️' : '🗣️'}</div>
            <h2 className="text-xl font-black text-gray-800">{collectStepLabel}</h2>
            <div className="flex justify-center gap-2 mb-2">
              <button onClick={() => setInputMode('voice')}
                className={`px-3 py-1.5 rounded-full text-sm font-semibold ${inputMode === 'voice' ? 'bg-purple-600 text-white' : 'bg-gray-100 text-gray-600'}`}>
                🎤 Voix
              </button>
              <button onClick={() => setInputMode('text')}
                className={`px-3 py-1.5 rounded-full text-sm font-semibold ${inputMode === 'text' ? 'bg-purple-600 text-white' : 'bg-gray-100 text-gray-600'}`}>
                ⌨️ Texte
              </button>
            </div>
            {inputMode === 'voice' ? (
              <VoiceRecorder onTranscript={handleInfoInput} language={appLang} />
            ) : (
              <TextInput onSubmit={handleInfoInput} placeholder={collectPlaceholder} />
            )}
          </div>
        )}

        {/* Jeu principal */}
        {(step === 'playing' || step === 'unknown-lang') && (
          <>
            {step === 'unknown-lang' && (
              <div className="card bg-amber-50 border-2 border-amber-300 text-center">
                <span className="text-4xl">🆕</span>
                <h3 className="font-black text-amber-800 text-lg mt-2">Nouvelle langue détectée !</h3>
                <p className="text-amber-700 text-sm mt-1">
                  La langue <strong>"{userLanguage}"</strong> n'est pas encore dans notre base.
                  Vous êtes un pionnier ! Vos traductions l'enrichiront.
                </p>
              </div>
            )}

            <div className="card text-center">
              <p className="text-xs text-gray-400 uppercase tracking-widest mb-2">
                Phrase {phraseIdx + 1} / {GAME_PHRASES.length}
              </p>
              <div className="bg-purple-50 rounded-2xl p-5 mb-5">
                <p className="text-2xl font-black text-gray-800">{phraseToTranslate}</p>
                <p className="text-gray-500 text-sm mt-2">
                  Traduisez en <strong>{userLanguage || 'votre langue'}</strong>
                </p>
              </div>

              {loading ? (
                <LoadingSpinner size="md" message="Enregistrement de votre traduction..." />
              ) : (
                <>
                  <div className="flex justify-center gap-2 mb-4">
                    <button onClick={() => setInputMode('voice')}
                      className={`px-3 py-1.5 rounded-full text-sm font-semibold ${inputMode === 'voice' ? 'bg-purple-600 text-white' : 'bg-gray-100 text-gray-600'}`}>
                      🎤 Voix
                    </button>
                    <button onClick={() => setInputMode('text')}
                      className={`px-3 py-1.5 rounded-full text-sm font-semibold ${inputMode === 'text' ? 'bg-purple-600 text-white' : 'bg-gray-100 text-gray-600'}`}>
                      ⌨️ Texte
                    </button>
                  </div>
                  {inputMode === 'voice' ? (
                    <VoiceRecorder onTranscript={handleTranslation} language={appLang} />
                  ) : (
                    <TextInput onSubmit={handleTranslation} placeholder="Traduction dans votre langue..." />
                  )}
                </>
              )}
            </div>

            {/* Traductions collectées */}
            {translations.length > 0 && (
              <div className="card">
                <p className="font-bold text-gray-700 mb-3">📚 Traductions collectées ({translations.length})</p>
                <div className="space-y-3 max-h-40 overflow-y-auto">
                  {translations.map((t, i) => (
                    <div key={i} className="bg-purple-50 rounded-xl p-3">
                      <p className="text-xs text-gray-400">{t.phrase}</p>
                      <p className="font-bold text-gray-700 mt-1">{t.phonetic.mot}</p>
                      <div className="flex gap-2 text-xs text-purple-600 mt-1">
                        <span>📍 {t.phonetic.zone}</span>
                        <span>🔤 {t.phonetic.ipa}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </>
        )}

        {/* Résultats finaux */}
        {step === 'result' && (
          <div className="card text-center flex flex-col items-center gap-5">
            <span className="text-7xl">🏆</span>
            <h2 className="text-2xl font-black text-gray-800">Bravo {userCity} !</h2>
            <p className="text-gray-600">
              Vous avez traduit <strong>{translations.length}</strong> phrases en <strong>{userLanguage}</strong>
            </p>
            <div className="bg-purple-50 border-2 border-purple-300 rounded-2xl p-5 w-full">
              <p className="text-4xl font-black text-purple-700">+{translations.length * 50} pts</p>
              <p className="text-purple-500">Total : {points} points</p>
            </div>

            {/* Classement simulé */}
            <div className="card w-full bg-gray-50 border border-gray-200">
              <p className="font-bold text-gray-700 mb-3">🏅 Classement global (simulé)</p>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between items-center"><span>🥇 Kofi A. — Accra</span><span className="font-bold text-amber-600">1,200 pts</span></div>
                <div className="flex justify-between items-center"><span>🥈 Aïssa B. — Bamako</span><span className="font-bold text-gray-400">980 pts</span></div>
                <div className="flex justify-between items-center font-bold text-purple-700"><span>🥉 Vous — {userCity}</span><span>{points} pts</span></div>
              </div>
            </div>

            {/* Structure phonétique complète (visible dans le code selon specs) */}
            {translations[0] && (
              <details className="w-full">
                <summary className="text-xs text-gray-400 cursor-pointer text-left">🔬 Données phonétiques collectées (dev)</summary>
                <pre className="mt-2 bg-gray-50 rounded-xl p-3 text-xs text-left overflow-x-auto">
                  {JSON.stringify(translations.map(t => t.phonetic), null, 2)}
                </pre>
              </details>
            )}

            <button onClick={() => { setPhraseIdx(0); setTranslations([]); setStep('playing'); }}
              className="w-full py-4 bg-purple-600 text-white rounded-2xl font-bold text-lg hover:bg-purple-700 shadow-lg">
              🔄 Rejouer
            </button>
            <button onClick={() => router.push('/')}
              className="w-full py-4 border-2 border-purple-300 text-purple-700 rounded-2xl font-bold hover:bg-purple-50">
              🏠 Accueil
            </button>
          </div>
        )}

        <AdBanner />
      </main>
    </div>
  );
}
