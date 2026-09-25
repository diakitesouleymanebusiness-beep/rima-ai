// ============================================================
// RIMA AI — Page Éducation (Apprentissage des lettres)
// ============================================================
'use client';
import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import VoiceRecorder from '@/components/voice/VoiceRecorder';
import LoadingSpinner from '@/components/ui/LoadingSpinner';
import AdBanner from '@/components/ui/AdBanner';
import ComingSoonButton from '@/components/ui/ComingSoonButton';
import { Language, LetterResult, LetterExercise } from '@/types';
import { speakText, storage, uid } from '@/lib/utils';
import { cn } from '@/lib/utils';

// Alphabets
const ALPHABETS: Record<string, string[]> = {
  fr: ['A','B','C','D','E','F','G','H','I','J','K','L','M','N','O','P','Q','R','S','T','U','V','W','X','Y','Z'],
  en: ['A','B','C','D','E','F','G','H','I','J','K','L','M','N','O','P','Q','R','S','T','U','V','W','X','Y','Z'],
  ar: ['ا','ب','ت','ث','ج','ح','خ','د','ذ','ر','ز','س','ش','ص','ض','ط','ظ','ع','غ','ف','ق','ك','ل','م','ن','ه','و','ي'],
};

type EduStep = 'choose-lang' | 'demo' | 'test' | 'finish';

export default function EducationPage() {
  const router = useRouter();
  const [appLang, setAppLang]   = useState<Language>('fr');
  const [learnLang, setLearnLang] = useState<Language | null>(null);
  const [step, setStep]           = useState<EduStep>('choose-lang');

  // Exercice
  const DEMO_LETTERS = 3;
  const [demoLetters, setDemoLetters] = useState<string[]>([]);
  const [demoIndex, setDemoIndex]     = useState(0);
  const [exercises, setExercises]     = useState<LetterExercise[]>([]);
  const [currentIdx, setCurrentIdx]   = useState(0);
  const [score, setScore]             = useState(0);
  const [totalPoints, setTotalPoints] = useState(() => storage.get<number>('rima_points') ?? 0);
  const [letterState, setLetterState] = useState<'active' | 'correct' | 'incorrect' | 'idle'>('idle');
  const [feedback, setFeedback]       = useState('');
  const [isProcessing, setIsProcessing] = useState(false);

  useEffect(() => {
    const saved = storage.get<Language>('rima_language');
    if (saved) setAppLang(saved);
    speakText('Service Éducation. Quelle langue veux-tu apprendre ?', saved ?? 'fr').catch(() => {});
  }, []);

  // Sélectionner une langue d'apprentissage
  const startLearning = (lang: Language) => {
    setLearnLang(lang);
    const alphabet = ALPHABETS[lang];
    const demo = alphabet.slice(0, DEMO_LETTERS);
    setDemoLetters(demo);
    setDemoIndex(0);
    setStep('demo');
    // Annoncer la phase démo
    const msg = lang === 'ar'
      ? `سنتعلم الحروف العربية معاً. كرر بعدي : ${demo.join('، ')}`
      : `Nous allons apprendre ${lang === 'en' ? "l'alphabet anglais" : "l'alphabet français"}. Répétez après moi : ${demo.join(', ')}`;
    speakText(msg, appLang).catch(() => {});
  };

  // Avancer dans la démo
  useEffect(() => {
    if (step !== 'demo') return;
    if (demoIndex >= demoLetters.length) {
      // Fin démo → phase test
      const alphabet = ALPHABETS[learnLang ?? 'fr'];
      const testLetters = alphabet.slice(0, 5); // 5 lettres pour le test
      setExercises(testLetters.map(l => ({ letter: l, result: 'pending', attempts: 0 })));
      setCurrentIdx(0);
      setStep('test');
      speakText('Maintenant, prononce chaque lettre seul.', appLang).catch(() => {});
      return;
    }
    // Lire chaque lettre de la démo avec zoom
    const letter = demoLetters[demoIndex];
    setLetterState('active');
    const timer = setTimeout(() => {
      speakText(letter, learnLang ?? 'fr').catch(() => {});
      const next = setTimeout(() => { setDemoIndex(i => i + 1); }, 1500);
      return () => clearTimeout(next);
    }, 400);
    return () => clearTimeout(timer);
  }, [demoIndex, step]);

  // Évaluer la réponse de l'utilisateur
  const evaluateAnswer = async (transcript: string) => {
    if (isProcessing) return;
    const exercise = exercises[currentIdx];
    const expected = exercise.letter.toLowerCase().trim();
    const given    = transcript.toLowerCase().trim();

    // Comparaison simple (l'utilisateur dit la lettre)
    const isCorrect = given.includes(expected) || expected.includes(given.charAt(0));

    setIsProcessing(true);
    if (isCorrect) {
      setLetterState('correct');
      setFeedback('✅ Excellent ! Très bien !');
      setScore(s => s + 1);
      const pts = totalPoints + 10;
      setTotalPoints(pts);
      storage.set('rima_points', pts);
      speakText('Bravo ! Très bien !', appLang).catch(() => {});
    } else {
      setLetterState('incorrect');
      setFeedback(`❌ Ce n'est pas tout à fait ça. La lettre est : ${exercise.letter}`);
      speakText(`La bonne réponse est : ${exercise.letter}`, appLang).catch(() => {});
    }

    // Mettre à jour les exercices
    const updated = [...exercises];
    updated[currentIdx] = { ...exercise, result: isCorrect ? 'correct' : 'incorrect', attempts: exercise.attempts + 1 };
    setExercises(updated);

    setTimeout(() => {
      setIsProcessing(false);
      setLetterState('idle');
      setFeedback('');
      if (currentIdx + 1 >= exercises.length) {
        setStep('finish');
        const encouragement = score + (isCorrect ? 1 : 0) >= exercises.length / 2
          ? 'Félicitations ! Tu as fait un excellent travail !'
          : 'Bon courage ! Continue à pratiquer, tu progresses bien !';
        speakText(encouragement, appLang).catch(() => {});
      } else {
        setCurrentIdx(i => i + 1);
        speakText(`Lettre suivante : ${exercises[currentIdx + 1]?.letter}`, appLang).catch(() => {});
      }
    }, 2000);
  };

  const isRTL = learnLang === 'ar';

  return (
    <div className="flex flex-col min-h-screen">
      {/* Header */}
      <header className="bg-gradient-to-br from-earth-400 to-earth-600 text-white px-5 pt-8 pb-6 rounded-b-3xl shadow-lg">
        <div className="flex items-center gap-3">
          <button onClick={() => router.push('/')} className="text-white/80 hover:text-white text-2xl">←</button>
          <span className="text-4xl">📚</span>
          <div>
            <h1 className="text-2xl font-black">Éducation</h1>
            <p className="text-earth-100 text-sm">Apprends à lire les lettres</p>
          </div>
          {/* Score */}
          <div className="ml-auto bg-white/20 rounded-2xl px-3 py-1 text-center">
            <p className="text-xs font-bold opacity-80">Points</p>
            <p className="text-xl font-black">{totalPoints}</p>
          </div>
        </div>
      </header>

      <main className="flex-1 p-5 flex flex-col gap-5">

        {/* Choisir la langue */}
        {step === 'choose-lang' && (
          <div className="card text-center">
            <p className="text-2xl font-black text-gray-700 mb-2">🌍 Quelle langue veux-tu apprendre ?</p>
            <p className="text-gray-500 mb-6">Choisissez votre langue d'apprentissage</p>
            <div className="flex flex-col gap-4">
              {[
                { lang: 'fr' as Language, icon: '🇫🇷', label: 'Français' },
                { lang: 'en' as Language, icon: '🇬🇧', label: 'English' },
                { lang: 'ar' as Language, icon: '🇸🇦', label: 'العربية' },
              ].map(({ lang, icon, label }) => (
                <button
                  key={lang}
                  onClick={() => startLearning(lang)}
                  className="w-full py-5 bg-white border-3 border-earth-300 rounded-2xl font-bold text-xl flex items-center justify-center gap-4 hover:bg-earth-50 hover:border-earth-500 transition-all shadow-sm active:scale-95"
                >
                  <span className="text-4xl">{icon}</span>
                  <span>{label}</span>
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Phase Démonstration */}
        {step === 'demo' && demoIndex < demoLetters.length && (
          <div className="card text-center flex flex-col items-center gap-6">
            <p className="text-lg font-bold text-gray-600">Phase 1 — Écoutez et répétez</p>
            <p className="text-gray-500">Prononcez ces lettres après moi :</p>
            {/* Lettres démo avec zoom */}
            <div className={cn('flex gap-6 justify-center flex-wrap', isRTL && 'flex-row-reverse')} dir={isRTL ? 'rtl' : 'ltr'}>
              {demoLetters.map((letter, i) => (
                <span
                  key={letter}
                  className={cn(
                    'edu-letter',
                    i === demoIndex && 'edu-letter--active',
                    i < demoIndex  && 'text-primary-400 opacity-60',
                  )}
                >
                  {letter}
                </span>
              ))}
            </div>
            <p className="text-primary-600 font-semibold text-lg animate-pulse">
              {demoIndex < demoLetters.length ? `🔊 Écoutez : ${demoLetters[demoIndex]}` : 'Bien ! Préparez-vous...'}
            </p>
          </div>
        )}

        {/* Phase Test */}
        {step === 'test' && exercises[currentIdx] && (
          <div className="card text-center flex flex-col items-center gap-6">
            <p className="text-lg font-bold text-gray-600">Phase 2 — Prononce seul</p>

            {/* Progression */}
            <div className="w-full flex gap-1 justify-center">
              {exercises.map((ex, i) => (
                <div key={i} className={cn(
                  'h-2 rounded-full flex-1 transition-colors',
                  ex.result === 'correct'   && 'bg-green-400',
                  ex.result === 'incorrect' && 'bg-red-400',
                  ex.result === 'pending'   && (i === currentIdx ? 'bg-earth-400' : 'bg-gray-200'),
                )} />
              ))}
            </div>

            {/* Grande lettre */}
            <div dir={isRTL ? 'rtl' : 'ltr'}>
              <span className={cn(
                'edu-letter block',
                letterState === 'correct'   && 'edu-letter--correct',
                letterState === 'incorrect' && 'edu-letter--incorrect',
                letterState === 'active'    && 'edu-letter--active',
                letterState === 'idle'      && 'text-gray-700',
              )}>
                {exercises[currentIdx].letter}
              </span>
            </div>

            {/* Feedback */}
            {feedback && (
              <p className={cn(
                'font-bold text-xl',
                letterState === 'correct'   && 'text-green-600',
                letterState === 'incorrect' && 'text-red-600',
              )}>
                {feedback}
              </p>
            )}

            {!isProcessing && !feedback && (
              <p className="text-gray-500">Prononce la lettre ci-dessus</p>
            )}

            {/* Enregistrement */}
            {!isProcessing && (
              <VoiceRecorder
                onTranscript={evaluateAnswer}
                language={learnLang ?? 'fr'}
                size="md"
              />
            )}

            {isProcessing && <LoadingSpinner size="md" message="Évaluation..." />}

            <p className="text-sm text-gray-400">
              Lettre {currentIdx + 1} / {exercises.length} — Score : {score}
            </p>
          </div>
        )}

        {/* Phase Fin */}
        {step === 'finish' && (
          <div className="card text-center flex flex-col items-center gap-6">
            <span className="text-7xl">
              {score >= exercises.length / 2 ? '🏆' : '⭐'}
            </span>
            <h2 className="text-2xl font-black text-gray-800">
              {score >= exercises.length * 0.8 ? 'Excellent !' :
               score >= exercises.length * 0.5 ? 'Bien joué !' : 'Continue comme ça !'}
            </h2>
            <p className="text-gray-600 text-lg">
              Tu as réussi <span className="font-black text-primary-600">{score}/{exercises.length}</span> lettres
            </p>

            {/* Résumé des lettres */}
            <div className={cn('flex gap-4 flex-wrap justify-center', isRTL && 'flex-row-reverse')} dir={isRTL ? 'rtl' : 'ltr'}>
              {exercises.map((ex) => (
                <div key={ex.letter} className={cn(
                  'w-14 h-14 rounded-2xl flex items-center justify-center text-3xl font-black shadow-md',
                  ex.result === 'correct'   && 'bg-green-100 text-green-600 border-2 border-green-300',
                  ex.result === 'incorrect' && 'bg-red-100 text-red-500 border-2 border-red-300',
                )}>
                  {ex.letter}
                </div>
              ))}
            </div>

            {/* Classement simulé */}
            <div className="card w-full bg-earth-50 border border-earth-200">
              <p className="font-bold text-earth-700 mb-2">🏅 Classement (simulé)</p>
              <div className="text-sm text-gray-600 space-y-1">
                <div className="flex justify-between"><span>🥇 Amara K. — Dakar</span><span className="font-bold">450 pts</span></div>
                <div className="flex justify-between"><span>🥈 Fatou D. — Abidjan</span><span className="font-bold">380 pts</span></div>
                <div className="flex justify-between font-bold text-primary-700"><span>🥉 Vous — {totalPoints} pts</span><span>{totalPoints} pts</span></div>
              </div>
            </div>

            <div className="flex gap-3 w-full">
              <button
                onClick={() => { setStep('choose-lang'); setLearnLang(null); setScore(0); setFeedback(''); }}
                className="flex-1 py-4 rounded-2xl border-2 border-earth-400 text-earth-700 font-bold hover:bg-earth-50"
              >
                🔄 Recommencer
              </button>
              <button
                onClick={() => router.push('/')}
                className="flex-1 py-4 rounded-2xl bg-earth-500 text-white font-bold hover:bg-earth-600"
              >
                🏠 Accueil
              </button>
            </div>
          </div>
        )}

        {/* Coming Soon */}
        <section>
          <h3 className="text-sm font-bold text-gray-400 mb-3 uppercase tracking-widest">🚀 Prochainement</h3>
          <div className="flex flex-wrap gap-3 justify-center">
            <ComingSoonButton icon="✍️" label="Écriture" />
            <ComingSoonButton icon="🔢" label="Maths" />
            <ComingSoonButton icon="📖" label="Lecture" />
          </div>
        </section>

        <AdBanner />
      </main>
    </div>
  );
}
