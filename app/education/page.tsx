'use client';
import BottomNav from '@/components/ui/BottomNav';
import { useState, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import VoiceRecorder from '@/components/voice/VoiceRecorder';
import { speakText } from '@/lib/utils';

const ALPHABETS: Record<string, { letters: string[], name: string, flag: string, dir?: string }> = {
  fr: { letters: ['A','B','C','D','E','F','G','H','I','J','K','L','M','N','O','P','Q','R','S','T','U','V','W','X','Y','Z'], name: 'Français', flag: '🇫🇷' },
  en: { letters: ['A','B','C','D','E','F','G','H','I','J','K','L','M','N','O','P','Q','R','S','T','U','V','W','X','Y','Z'], name: 'Anglais', flag: '🇬🇧' },
  ar: { letters: ['ا','ب','ت','ث','ج','ح','خ','د','ذ','ر','ز','س','ش','ص','ض','ط','ظ','ع','غ','ف','ق','ك','ل','م','ن','ه','و','ي'], name: 'Arabe', flag: '🇸🇦', dir: 'rtl' },
};

const LETTER_WORDS: Record<string, Record<string, string>> = {
  fr: { A:'Arbre', B:'Baobab', C:'Champ', D:'Dieu', E:'Eau', F:'Feu', G:'Grain', H:'Herbe' },
  en: { A:'Apple', B:'Baobab', C:'Corn', D:'Drum', E:'Earth', F:'Farm', G:'Grain', H:'Home' },
  ar: { 'ا':'أرض', 'ب':'بيت', 'ت':'تمر', 'ث':'ثوم', 'ج':'جمل', 'ح':'حقل' },
};

export default function EducationPage() {
  const router = useRouter();
  const [lang, setLang] = useState<'fr'|'en'|'ar'>('fr');
  const [step, setStep] = useState<'choose'|'listen'|'pronounce'|'feedback'>('choose');
  const [currentIdx, setCurrentIdx] = useState(0);
  const [points, setPoints] = useState(() => {
    if (typeof window !== 'undefined') {
      return parseInt(localStorage.getItem('rima_edu_points') || '0');
    }
    return 0;
  });
  const [feedback, setFeedback] = useState<'correct'|'wrong'|null>(null);
  const [micKey, setMicKey] = useState(0);
  const restartMic = useCallback(() => setMicKey(k => k + 1), []);

  const alphabet = ALPHABETS[lang];
  const currentLetter = alphabet.letters[currentIdx];
  const wordExample = LETTER_WORDS[lang]?.[currentLetter] || '';

  const listenLetter = () => {
    speakText(lang === 'ar' ? currentLetter : `La lettre ${currentLetter}, comme dans ${wordExample}`, lang).catch(() => {});
    setStep('pronounce');
  };

  const handlePronunciation = (transcript: string) => {
    const clean = transcript.trim().toUpperCase().replace(/[.,!?]/g, '');
    const correct = clean.includes(currentLetter.toUpperCase()) || 
                    clean.includes(wordExample.toUpperCase()) ||
                    clean.length > 0 && currentLetter.toUpperCase().startsWith(clean[0]);
    setFeedback(correct ? 'correct' : 'wrong');
    setStep('feedback');
    if (correct) {
      const newPts = points + 25;
      setPoints(newPts);
      if (typeof window !== 'undefined') localStorage.setItem('rima_edu_points', String(newPts));
      speakText('Bravo ! Tu as bien prononcé !', 'fr').catch(() => {});
    } else {
      speakText(`La bonne prononciation est : ${currentLetter}`, lang).catch(() => {});
    }
  };

  const nextLetter = () => {
    setFeedback(null);
    setStep('listen');
    setCurrentIdx(i => (i + 1) % alphabet.letters.length);
    restartMic();
  };

  const progress = Math.round((currentIdx / alphabet.letters.length) * 100);

  return (
    <div className="rima-app">
      {/* ── HEADER ── */}
      <div className="rima-header" style={{ padding: '14px 16px', display: 'flex', alignItems: 'center', gap: 12 }}>
        <button onClick={() => router.push('/')} style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 4 }}>
          <svg width="24" height="24" viewBox="0 0 24 24" fill="#374151"><path d="M20 11H7.83l5.59-5.59L12 4l-8 8 8 8 1.41-1.41L7.83 13H20v-2z"/></svg>
        </button>
        <div style={{ flex: 1 }}>
          <div style={{ fontFamily: 'Google Sans, sans-serif', fontWeight: 700, fontSize: 18, color: '#111' }}>Éducation</div>
          <div style={{ fontSize: 12, color: '#6b7280' }}>Savoirs</div>
        </div>
        <div style={{ display: 'flex', gap: 6 }}>
          <div style={{ background: '#fef3c7', borderRadius: 20, padding: '4px 10px', fontSize: 12, fontWeight: 700, color: '#d97706' }}>
            🏆 {points} pts
          </div>
          <div style={{ background: '#ede9fe', borderRadius: 20, padding: '4px 10px', fontSize: 12, fontWeight: 700, color: '#7c3aed' }}>
            🎤 Atelier Phonétique
          </div>
        </div>
      </div>

      <main style={{ padding: '16px', paddingBottom: 90, display: 'flex', flexDirection: 'column', gap: 14 }}>

        {/* ── TITRE ── */}
        <div style={{ background: 'white', borderRadius: 20, padding: 20, boxShadow: '0 2px 12px rgba(0,0,0,0.08)' }}>
          <div style={{ fontFamily: 'Google Sans, sans-serif', fontWeight: 800, fontSize: 26, color: '#111', marginBottom: 4 }}>
            Apprendre l'Alphabet
          </div>
          <div style={{ fontSize: 13, color: '#6b7280', marginBottom: 14 }}>
            Écoute, répète à <span style={{ color: '#7c3aed', fontWeight: 600 }}>haute voix</span> et gagne des{' '}
            <span style={{ color: '#d97706', fontWeight: 600 }}>récompenses d'apprentissage utiles.</span>
          </div>

          {/* Sélecteur de langue */}
          <div style={{ fontSize: 12, fontWeight: 600, color: '#6b7280', marginBottom: 8 }}>LANGUE CIBLE</div>
          <div style={{ display: 'flex', gap: 8 }}>
            {(['fr','en','ar'] as const).map(l => (
              <button key={l} onClick={() => { setLang(l); setCurrentIdx(0); setStep('choose'); setFeedback(null); }} style={{
                flex: 1, padding: '10px 8px', borderRadius: 12, border: 'none', cursor: 'pointer',
                background: lang === l ? '#16a34a' : '#f3f4f6',
                color: lang === l ? 'white' : '#374151',
                fontWeight: lang === l ? 700 : 500, fontSize: 13
              }}>
                {ALPHABETS[l].flag} {ALPHABETS[l].name}
                {l === 'ar' && <div style={{ fontSize: 10, opacity: 0.8 }}>Droite → Gauche</div>}
              </button>
            ))}
          </div>
        </div>

        {/* ── PHASE 1 : ÉCOUTER ── */}
        {(step === 'choose' || step === 'listen') && (
          <div style={{ background: 'white', borderRadius: 20, padding: 20, boxShadow: '0 2px 12px rgba(0,0,0,0.08)' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 16 }}>
              <div style={{ background: '#16a34a', color: 'white', borderRadius: '50%', width: 26, height: 26, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 13, fontWeight: 700 }}>1</div>
              <div style={{ fontWeight: 700, color: '#111' }}>Phase : Écoute Rima</div>
            </div>
            <div style={{ fontSize: 13, color: '#6b7280', marginBottom: 16 }}>
              « Répète avec moi ces trois lettres : »
            </div>

            {/* Progression */}
            <div style={{ background: '#f3f4f6', borderRadius: 8, height: 6, marginBottom: 16 }}>
              <div style={{ background: '#16a34a', borderRadius: 8, height: '100%', width: `${progress}%`, transition: 'width 0.3s' }} />
            </div>

            {/* Lettre courante + 2 suivantes */}
            <div style={{ display: 'flex', gap: 12, justifyContent: 'center', marginBottom: 20 }}>
              {[0, 1, 2].map(offset => {
                const idx = (currentIdx + offset) % alphabet.letters.length;
                const letter = alphabet.letters[idx];
                return (
                  <div key={offset} style={{
                    flex: offset === 0 ? 2 : 1,
                    background: offset === 0 ? '#dcfce7' : '#f9fafb',
                    borderRadius: 16, padding: '20px 10px', textAlign: 'center',
                    border: offset === 0 ? '2px solid #16a34a' : '1px solid #e5e7eb'
                  }}>
                    <div style={{
                      fontSize: offset === 0 ? 56 : 36, fontWeight: 800,
                      color: offset === 0 ? '#16a34a' : '#9ca3af',
                      fontFamily: lang === 'ar' ? 'serif' : 'Google Sans, sans-serif',
                      direction: alphabet.dir as any
                    }}>{letter}</div>
                    {offset === 0 && wordExample && (
                      <div style={{ fontSize: 12, color: '#16a34a', marginTop: 4 }}>/{letter.toLowerCase()}/  {wordExample}</div>
                    )}
                  </div>
                );
              })}
            </div>

            <button onClick={listenLetter} style={{
              background: '#16a34a', color: 'white', border: 'none', borderRadius: 14,
              padding: '14px', width: '100%', fontFamily: 'Google Sans, sans-serif',
              fontWeight: 700, fontSize: 15, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8
            }}>
              <svg width="20" height="20" viewBox="0 0 24 24" fill="white"><path d="M3 9v6h4l5 5V4L7 9H3zm13.5 3c0-1.77-1.02-3.29-2.5-4.03v8.05c1.48-.73 2.5-2.25 2.5-4.02z"/></svg>
              Écouter la lettre
            </button>
          </div>
        )}

        {/* ── PHASE 2 : PRONONCER ── */}
        {step === 'pronounce' && (
          <div style={{ background: 'white', borderRadius: 20, padding: 20, boxShadow: '0 2px 12px rgba(0,0,0,0.08)' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 12 }}>
              <div style={{ background: '#7c3aed', color: 'white', borderRadius: '50%', width: 26, height: 26, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 13, fontWeight: 700 }}>2</div>
              <div style={{ fontWeight: 700, color: '#111' }}>À ton tour de parler !</div>
              <div style={{ marginLeft: 'auto', background: '#ede9fe', borderRadius: 10, padding: '3px 8px', fontSize: 11, color: '#7c3aed', fontWeight: 600 }}>STT Actif</div>
            </div>
            <div style={{ fontSize: 13, color: '#6b7280', marginBottom: 16 }}>
              Prononce la lettre affichée ci-dessous :
            </div>

            {/* Grande lettre */}
            <div style={{
              background: '#ede9fe', borderRadius: 20, padding: '32px', textAlign: 'center', marginBottom: 16,
              direction: alphabet.dir as any
            }}>
              <div style={{ fontSize: 80, fontWeight: 800, color: '#7c3aed', fontFamily: lang === 'ar' ? 'serif' : 'Google Sans, sans-serif' }}>
                {currentLetter}
              </div>
              {wordExample && <div style={{ fontSize: 14, color: '#7c3aed', marginTop: 8 }}>comme dans « {wordExample} »</div>}
            </div>

            <div style={{ fontSize: 13, color: '#6b7280', textAlign: 'center', marginBottom: 12 }}>
              🎤 Reconnaisance IA
            </div>
            <VoiceRecorder key={micKey} onTranscript={handlePronunciation} language={lang} autoStart={true} />

            <button onClick={listenLetter} style={{
              background: '#f3f4f6', border: 'none', borderRadius: 12, padding: '10px',
              width: '100%', fontSize: 13, color: '#374151', cursor: 'pointer', marginTop: 10
            }}>
              🔁 Répéter la lettre {currentLetter}
            </button>
          </div>
        )}

        {/* ── PHASE 3 : FEEDBACK ── */}
        {step === 'feedback' && (
          <div style={{
            background: feedback === 'correct' ? '#dcfce7' : '#fee2e2',
            borderRadius: 20, padding: 24, textAlign: 'center',
            border: `2px solid ${feedback === 'correct' ? '#16a34a' : '#dc2626'}`,
            boxShadow: '0 2px 12px rgba(0,0,0,0.08)'
          }}>
            <div style={{ fontSize: 48, marginBottom: 8 }}>
              {feedback === 'correct' ? '✅' : '❌'}
            </div>
            <div style={{ fontFamily: 'Google Sans, sans-serif', fontWeight: 800, fontSize: 20, color: feedback === 'correct' ? '#16a34a' : '#dc2626', marginBottom: 8 }}>
              {feedback === 'correct' ? 'Prononciation réussie !' : 'Pas tout à fait…'}
            </div>
            <div style={{ fontSize: 14, color: '#374151', marginBottom: 16 }}>
              {feedback === 'correct'
                ? `« Bravo ! Tu as prononcé /b/ parfaitement ! » +25 pts`
                : `La lettre ${currentLetter} se prononce comme dans "${wordExample}". Réécoute !`}
            </div>
            {feedback === 'correct' && (
              <div style={{ background: '#16a34a', color: 'white', borderRadius: 12, padding: '8px 16px', display: 'inline-block', fontSize: 15, fontWeight: 700, marginBottom: 16 }}>
                +25 points ! 🎉
              </div>
            )}

            {/* Mot du jour */}
            <div style={{ background: 'white', borderRadius: 14, padding: 14, marginBottom: 16 }}>
              <div style={{ fontSize: 12, color: '#6b7280', marginBottom: 6 }}>Mot du jour</div>
              <div style={{ fontSize: 14, fontWeight: 700, color: '#111' }}>{currentLetter} = {wordExample}</div>
              <div style={{ fontSize: 12, color: '#6b7280' }}>{currentLetter} comme « {wordExample} »  {lang === 'fr' ? `« Garebug Guy » en Wolof` : ''}</div>
            </div>

            <div style={{ display: 'flex', gap: 10 }}>
              {feedback === 'wrong' && (
                <button onClick={listenLetter} style={{
                  flex: 1, background: 'white', border: '2px solid #dc2626', borderRadius: 14,
                  padding: '12px', fontSize: 14, color: '#dc2626', fontWeight: 700, cursor: 'pointer'
                }}>
                  🔁 Répéter
                </button>
              )}
              <button onClick={nextLetter} style={{
                flex: 1, background: feedback === 'correct' ? '#16a34a' : '#374151',
                border: 'none', borderRadius: 14, padding: '12px',
                fontSize: 14, color: 'white', fontWeight: 700, cursor: 'pointer'
              }}>
                Lettre {alphabet.letters[(currentIdx + 1) % alphabet.letters.length]} →
              </button>
            </div>
          </div>
        )}

        {/* ── TOTAL POINTS ── */}
        <div style={{ background: 'white', borderRadius: 16, padding: '14px 16px', display: 'flex', alignItems: 'center', gap: 12, boxShadow: '0 2px 8px rgba(0,0,0,0.06)' }}>
          <span style={{ fontSize: 24 }}>🏆</span>
          <div style={{ flex: 1 }}>
            <div style={{ fontWeight: 700, color: '#111' }}>{points} Points</div>
            <div style={{ fontSize: 12, color: '#6b7280' }}>{currentIdx}/{alphabet.letters.length} lettres · {Math.round((currentIdx/alphabet.letters.length)*100)}% complété</div>
          </div>
          <div style={{ background: '#fef3c7', borderRadius: 10, padding: '4px 10px', fontSize: 12, fontWeight: 700, color: '#d97706' }}>
            Niveau 1
          </div>
        </div>

        {/* PUB */}
        <div style={{ background: '#f9fafb', borderRadius: 16, padding: '10px 14px', border: '1px dashed #d1d5db', textAlign: 'center' }}>
          <div style={{ fontSize: 10, color: '#9ca3af', textTransform: 'uppercase', letterSpacing: 1 }}>Espace publicitaire simulation</div>
          <div style={{ fontSize: 11, color: '#6b7280', marginTop: 2 }}>Vercel Hobby — usage non commercial</div>
        </div>
      </main>
      <BottomNav />
    </div>
  );
}
