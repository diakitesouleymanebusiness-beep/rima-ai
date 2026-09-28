// ============================================================
// RIMA AI — Page Santé
// ============================================================
'use client';
import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import VoiceRecorder from '@/components/voice/VoiceRecorder';
import TextInput from '@/components/voice/TextInput';
import SpeakButton from '@/components/voice/SpeakButton';
import LoadingSpinner from '@/components/ui/LoadingSpinner';
import AdBanner from '@/components/ui/AdBanner';
import ComingSoonButton from '@/components/ui/ComingSoonButton';
import { Language } from '@/types';
import { speakText, stopSpeaking, storage } from '@/lib/utils';

interface HealthResult {
  advice: string;
  severity: 'low' | 'medium' | 'high';
  callEmergency: boolean;
}

const SYSTEM_PROMPT = `Tu es RIMA, un assistant santé pour une population analphabète en Afrique.
RÈGLES STRICTES :
- Ne fais JAMAIS de diagnostic médical.
- Réponds en 3-4 phrases simples maximum.
- Toujours conseiller de voir un médecin si doute.
- Si symptômes graves (douleur thoracique, perte de connaissance, saignement abondant, convulsions) :
  réponds avec "URGENCE:" au début.
- Inclure un conseil nutrition ou hygiène adapté.
Format de réponse JSON :
{"advice": "...", "severity": "low|medium|high", "callEmergency": true|false}`;

export default function HealthPage() {
  const router = useRouter();
  const [language, setLanguage] = useState<Language>('fr');
  const [step, setStep] = useState<'intro' | 'input' | 'result'>('intro');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<HealthResult | null>(null);
  const [inputText, setInputText] = useState('');
  const [mode, setMode] = useState<'voice' | 'text'>('voice');
  const [micKey, setMicKey] = useState(0);

  const restartMic = useCallback(() => {
    setMicKey(k => k + 1);
  }, []);

  useEffect(() => {
    const saved = storage.get<Language>('rima_language');
    if (saved) setLanguage(saved);
    setTimeout(() => {
      speakText('Service Santé. Décrivez vos symptômes.', saved ?? 'fr')
        .catch(() => {})
        .finally(() => { setStep('input'); restartMic(); });
    }, 600);
    return () => stopSpeaking();
  }, []);

  const analyzeSymptoms = async (text: string) => {
    setInputText(text);
    setLoading(true);
    setStep('result');
    try {
      const res = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          messages: [{ role: 'user', content: `Symptômes : ${text}` }],
          systemPrompt: SYSTEM_PROMPT,
          language,
        }),
      });
      const json = await res.json();
      if (json.success) {
        try {
          const match = json.data.text.match(/\{[\s\S]*\}/);
          const parsed = match ? JSON.parse(match[0]) : null;
          if (parsed) {
            setResult(parsed);
            await speakText(parsed.advice, language).catch(() => {});
            restartMic();
          } else {
            setResult({ advice: json.data.text, severity: 'medium', callEmergency: false });
            await speakText(json.data.text, language).catch(() => {});
            restartMic();
          }
        } catch {
          setResult({ advice: json.data.text, severity: 'medium', callEmergency: false });
          restartMic();
        }
      } else {
        setResult({ advice: 'Erreur de connexion. Consultez un médecin.', severity: 'medium', callEmergency: false });
        restartMic();
      }
    } catch {
      setResult({ advice: 'Erreur de connexion. Réessayez plus tard.', severity: 'low', callEmergency: false });
      restartMic();
    } finally {
      setLoading(false);
    }
  };

  const severityConfig = {
    low:    { color: 'bg-green-50 border-green-400',  icon: '✅', label: 'Situation normale' },
    medium: { color: 'bg-yellow-50 border-yellow-400', icon: '⚠️', label: 'Consultez un médecin' },
    high:   { color: 'bg-red-50 border-red-500',      icon: '🚨', label: 'Situation grave' },
  };

  return (
    <div className="flex flex-col min-h-screen">
      {/* Header */}
      <header className="bg-gradient-to-br from-red-400 to-rose-500 text-white px-5 pt-8 pb-6 rounded-b-3xl shadow-lg">
        <div className="flex items-center gap-3">
          <button onClick={() => router.push('/')} className="text-white/80 hover:text-white text-2xl">←</button>
          <span className="text-4xl">🏥</span>
          <div>
            <h1 className="text-2xl font-black">Santé</h1>
            <p className="text-red-100 text-sm">Analyse de symptômes vocaux</p>
          </div>
        </div>
      </header>

      <main className="flex-1 p-5 flex flex-col gap-5">

        {/* Étape : saisie */}
        {(step === 'input' || (step === 'result' && !loading)) && (
          <>
            {step === 'input' && (
              <div className="card text-center">
                <p className="text-2xl font-black text-gray-700 mb-2">🩺 Décrivez vos symptômes</p>
                <p className="text-gray-500">Parlez ou tapez ce que vous ressentez</p>

                {/* Toggle mode */}
                <div className="flex justify-center gap-2 mt-4 mb-6">
                  <button onClick={() => setMode('voice')}
                    className={`px-4 py-2 rounded-full font-semibold text-sm ${mode === 'voice' ? 'bg-red-400 text-white' : 'bg-gray-100 text-gray-600'}`}>
                    🎤 Voix
                  </button>
                  <button onClick={() => setMode('text')}
                    className={`px-4 py-2 rounded-full font-semibold text-sm ${mode === 'text' ? 'bg-red-400 text-white' : 'bg-gray-100 text-gray-600'}`}>
                    ⌨️ Texte
                  </button>
                </div>

                {mode === 'voice' ? (
                  <VoiceRecorder
                    key={micKey}
                    onTranscript={analyzeSymptoms}
                    language={language}
                    autoStart={true}
                  />
                ) : (
                  <TextInput
                    onSubmit={analyzeSymptoms}
                    placeholder="Ex: J'ai de la fièvre et mal à la tête..."
                  />
                )}
              </div>
            )}

            {/* Résultat */}
            {step === 'result' && result && !loading && (
              <>
                <div className="card">
                  <p className="text-xs text-gray-400 mb-2">Symptômes : <em>{inputText}</em></p>
                </div>

                <div className={`card border-2 ${severityConfig[result.severity].color}`}>
                  <div className="flex items-center gap-3 mb-3">
                    <span className="text-4xl">{severityConfig[result.severity].icon}</span>
                    <div>
                      <p className="font-black text-lg">{severityConfig[result.severity].label}</p>
                    </div>
                  </div>
                  <p className="text-gray-700 leading-relaxed text-lg">{result.advice}</p>
                  <SpeakButton text={result.advice} language={language} className="mt-4" />
                </div>

                {/* Urgence */}
                {result.callEmergency && (
                  <a href="tel:15" className="card bg-red-600 text-white text-center text-xl font-black flex items-center justify-center gap-3 py-5 hover:bg-red-700 transition-colors no-underline rounded-3xl">
                    <span className="text-4xl">📞</span>
                    APPELER LES URGENCES (15)
                  </a>
                )}

                <button
                  onClick={() => {
                    setStep('input');
                    setResult(null);
                    speakText('Décrivez vos nouveaux symptômes.', language).catch(() => {}).finally(() => restartMic());
                  }}
                  className="w-full py-4 rounded-2xl border-2 border-red-300 text-red-600 font-bold text-lg hover:bg-red-50 transition-colors"
                >
                  🔄 Nouveau symptôme
                </button>
              </>
            )}
          </>
        )}

        {/* Chargement */}
        {loading && (
          <div className="flex-1 flex items-center justify-center">
            <LoadingSpinner size="lg" message="RIMA analyse vos symptômes..." />
          </div>
        )}

        {/* Coming Soon */}
        <section>
          <h3 className="text-sm font-bold text-gray-400 mb-3 uppercase tracking-widest">🚀 Prochainement</h3>
          <div className="flex flex-wrap gap-3 justify-center">
            <ComingSoonButton icon="📍" label="Centres de santé proches" />
            <ComingSoonButton icon="🤰" label="Santé maternelle" />
            <ComingSoonButton icon="📅" label="RDV médecin" />
            <ComingSoonButton icon="🍎" label="Nutrition" />
          </div>
        </section>

        <AdBanner />
      </main>
    </div>
  );
}
