'use client';
import BottomNav from '@/components/ui/BottomNav';
import { useState, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import VoiceRecorder from '@/components/voice/VoiceRecorder';
import { speakText, stopSpeaking } from '@/lib/utils';

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
- Si symptômes graves (douleur thoracique, perte de connaissance, saignement abondant, convulsions) mets "URGENCE:" au début.
Format de réponse JSON : {"advice": "...", "severity": "low|medium|high", "callEmergency": true|false}`;

export default function HealthPage() {
  const router = useRouter();
  const [step, setStep] = useState<'idle' | 'loading' | 'result'>('idle');
  const [result, setResult] = useState<HealthResult | null>(null);
  const [inputText, setInputText] = useState('');
  const [micKey, setMicKey] = useState(0);

  const restartMic = useCallback(() => setMicKey(k => k + 1), []);

  const analyzeSymptoms = async (text: string) => {
    if (!text.trim()) return;
    setInputText(text);
    setStep('loading');
    stopSpeaking();
    try {
      const res = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          messages: [{ role: 'user', content: `Symptômes : ${text}` }],
          systemPrompt: SYSTEM_PROMPT,
          language: 'fr',
        }),
      });
      const json = await res.json();
      if (json.success) {
        try {
          const match = json.data.text.match(/\{[\s\S]*\}/);
          const parsed = match ? JSON.parse(match[0]) : null;
          const r: HealthResult = parsed || { advice: json.data.text, severity: 'medium', callEmergency: false };
          setResult(r);
          setStep('result');
          speakText(r.advice, 'fr').catch(() => {});
        } catch {
          const r: HealthResult = { advice: json.data.text, severity: 'medium', callEmergency: false };
          setResult(r);
          setStep('result');
        }
      } else {
        setResult({ advice: 'Erreur de connexion. Consultez un médecin.', severity: 'medium', callEmergency: false });
        setStep('result');
      }
    } catch {
      setResult({ advice: 'Erreur. Réessayez plus tard.', severity: 'low', callEmergency: false });
      setStep('result');
    }
  };

  const reset = () => {
    setStep('idle');
    setResult(null);
    setInputText('');
    restartMic();
  };

  return (
    <div className="rima-app">
      {/* ── HEADER ── */}
      <div className="rima-header" style={{ padding: '14px 16px', display: 'flex', alignItems: 'center', gap: 12 }}>
        <button onClick={() => router.push('/')} style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 4 }}>
          <svg width="24" height="24" viewBox="0 0 24 24" fill="#374151">
            <path d="M20 11H7.83l5.59-5.59L12 4l-8 8 8 8 1.41-1.41L7.83 13H20v-2z"/>
          </svg>
        </button>
        <div style={{ flex: 1 }}>
          <div style={{ fontFamily: 'Google Sans, sans-serif', fontWeight: 700, fontSize: 18, color: '#111' }}>Santé</div>
          <div style={{ fontSize: 12, color: '#6b7280' }}>Analyse de symptômes</div>
        </div>
        <div style={{
          background: '#fee2e2', borderRadius: 20, padding: '4px 10px',
          fontSize: 12, fontWeight: 700, color: '#dc2626', display: 'flex', alignItems: 'center', gap: 4
        }}>
          <svg width="14" height="14" viewBox="0 0 24 24" fill="#dc2626">
            <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z"/>
          </svg>
          Santé
        </div>
      </div>

      <main style={{ padding: '16px', paddingBottom: 90, display: 'flex', flexDirection: 'column', gap: 14 }}>

        {/* ── CARD PRINCIPALE : MIC ── */}
        {step === 'idle' && (
          <>
            <div style={{
              background: 'white', borderRadius: 20, padding: 20,
              boxShadow: '0 2px 12px rgba(0,0,0,0.08)'
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 8 }}>
                <div style={{
                  background: '#fee2e2', borderRadius: 12, width: 44, height: 44,
                  display: 'flex', alignItems: 'center', justifyContent: 'center'
                }}>
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="#dc2626">
                    <path d="M12 14c1.66 0 2.99-1.34 2.99-3L15 5c0-1.66-1.34-3-3-3S9 3.34 9 5v6c0 1.66 1.34 3 3 3zm5.3-3c0 3-2.54 5.1-5.3 5.1S6.7 14 6.7 11H5c0 3.41 2.72 6.23 6 6.72V21h2v-3.28c3.28-.48 6-3.3 6-6.72h-1.7z"/>
                  </svg>
                </div>
                <div>
                  <div style={{ fontFamily: 'Google Sans, sans-serif', fontWeight: 700, fontSize: 16, color: '#111' }}>
                    Décrivez vos symptômes
                  </div>
                  <div style={{ fontSize: 12, color: '#6b7280' }}>Parlez après le signal</div>
                </div>
              </div>
              <VoiceRecorder key={micKey} onTranscript={analyzeSymptoms} language="fr" autoStart={true} />
            </div>

            {/* ── EXEMPLES CLIQUABLES ── */}
            <div style={{ background: 'white', borderRadius: 20, padding: 16, boxShadow: '0 2px 8px rgba(0,0,0,0.06)' }}>
              <div style={{ fontSize: 13, fontWeight: 600, color: '#6b7280', marginBottom: 10 }}>
                💬 Dis par exemple
              </div>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
                {["J'ai de la fièvre", "Mal à la tête", "Douleur au ventre", "Je tousse beaucoup", "Mon enfant est malade"].map(ex => (
                  <button key={ex} onClick={() => analyzeSymptoms(ex)} style={{
                    background: '#fef2f2', border: '1px solid #fecaca', borderRadius: 20,
                    padding: '6px 12px', fontSize: 13, color: '#dc2626', cursor: 'pointer'
                  }}>{ex}</button>
                ))}
              </div>
            </div>

            {/* ── SERVICES COMING SOON ── */}
            <div style={{ background: 'white', borderRadius: 20, padding: 16, boxShadow: '0 2px 8px rgba(0,0,0,0.06)' }}>
              <div style={{ fontSize: 13, fontWeight: 600, color: '#6b7280', marginBottom: 12 }}>Prochainement</div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
                {[
                  { icon: '📍', label: 'Centres de santé', sub: 'GPS' },
                  { icon: '🤰', label: 'Santé maternelle', sub: 'Suivi' },
                  { icon: '📅', label: 'RDV médecin', sub: 'Réserver' },
                  { icon: '🍎', label: 'Nutrition', sub: 'Conseils' },
                ].map(item => (
                  <div key={item.label} style={{
                    background: '#f9fafb', borderRadius: 14, padding: '12px 10px',
                    display: 'flex', alignItems: 'center', gap: 10, opacity: 0.7
                  }}>
                    <span style={{ fontSize: 22 }}>{item.icon}</span>
                    <div>
                      <div style={{ fontSize: 13, fontWeight: 600, color: '#374151' }}>{item.label}</div>
                      <div style={{ fontSize: 11, color: '#9ca3af' }}>Bientôt</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* ── PUB SIMULATION ── */}
            <div style={{
              background: '#f9fafb', borderRadius: 16, padding: '10px 14px',
              border: '1px dashed #d1d5db', textAlign: 'center'
            }}>
              <div style={{ fontSize: 10, color: '#9ca3af', textTransform: 'uppercase', letterSpacing: 1 }}>
                Espace publicitaire simulation
              </div>
              <div style={{ fontSize: 11, color: '#6b7280', marginTop: 2 }}>Vercel Hobby — usage non commercial</div>
            </div>
          </>
        )}

        {/* ── CHARGEMENT ── */}
        {step === 'loading' && (
          <div style={{ background: 'white', borderRadius: 20, padding: 32, textAlign: 'center', boxShadow: '0 2px 12px rgba(0,0,0,0.08)' }}>
            <div style={{ marginBottom: 16 }}>
              {/* Pulse animation */}
              <div style={{
                width: 64, height: 64, borderRadius: '50%', background: '#fee2e2',
                margin: '0 auto', display: 'flex', alignItems: 'center', justifyContent: 'center',
                animation: 'pulse-mic 1.5s infinite'
              }}>
                <svg width="32" height="32" viewBox="0 0 24 24" fill="#dc2626">
                  <path d="M12 14c1.66 0 2.99-1.34 2.99-3L15 5c0-1.66-1.34-3-3-3S9 3.34 9 5v6c0 1.66 1.34 3 3 3zm5.3-3c0 3-2.54 5.1-5.3 5.1S6.7 14 6.7 11H5c0 3.41 2.72 6.23 6 6.72V21h2v-3.28c3.28-.48 6-3.3 6-6.72h-1.7z"/>
                </svg>
              </div>
            </div>
            <div style={{ fontFamily: 'Google Sans, sans-serif', fontWeight: 700, fontSize: 16, color: '#111' }}>
              RIMA analyse vos symptômes…
            </div>
            <div style={{ fontSize: 13, color: '#6b7280', marginTop: 4 }}>«&nbsp;{inputText}&nbsp;»</div>
          </div>
        )}

        {/* ── RÉSULTAT ── */}
        {step === 'result' && result && (
          <>
            {/* Symptômes */}
            <div style={{ background: '#f9fafb', borderRadius: 14, padding: '10px 14px' }}>
              <div style={{ fontSize: 12, color: '#9ca3af' }}>Symptômes décrits</div>
              <div style={{ fontSize: 14, color: '#374151', fontStyle: 'italic', marginTop: 2 }}>« {inputText} »</div>
            </div>

            {/* Réponse */}
            <div style={{
              background: 'white', borderRadius: 20, padding: 20,
              border: `2px solid ${result.severity === 'high' ? '#dc2626' : result.severity === 'medium' ? '#f59e0b' : '#16a34a'}`,
              boxShadow: '0 2px 12px rgba(0,0,0,0.08)'
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 12 }}>
                <span style={{ fontSize: 32 }}>
                  {result.severity === 'high' ? '🚨' : result.severity === 'medium' ? '⚠️' : '✅'}
                </span>
                <div>
                  <div style={{ fontFamily: 'Google Sans, sans-serif', fontWeight: 700, fontSize: 16, color: '#111' }}>
                    {result.severity === 'high' ? 'Situation grave' : result.severity === 'medium' ? 'Consultez un médecin' : 'Situation normale'}
                  </div>
                </div>
              </div>
              <p style={{ fontSize: 15, color: '#374151', lineHeight: 1.6, margin: 0 }}>{result.advice}</p>
              <button onClick={() => speakText(result.advice, 'fr').catch(() => {})} style={{
                marginTop: 14, background: '#fee2e2', border: 'none', borderRadius: 20,
                padding: '8px 16px', fontSize: 13, color: '#dc2626', fontWeight: 600, cursor: 'pointer',
                display: 'flex', alignItems: 'center', gap: 6
              }}>
                <svg width="16" height="16" viewBox="0 0 24 24" fill="#dc2626">
                  <path d="M3 9v6h4l5 5V4L7 9H3zm13.5 3c0-1.77-1.02-3.29-2.5-4.03v8.05c1.48-.73 2.5-2.25 2.5-4.02z"/>
                </svg>
                Réécouter
              </button>
            </div>

            {/* URGENCES */}
            {result.callEmergency && (
              <a href="tel:15" style={{
                background: '#dc2626', color: 'white', borderRadius: 20, padding: '16px 20px',
                display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 12,
                textDecoration: 'none', fontFamily: 'Google Sans, sans-serif', fontWeight: 700, fontSize: 17
              }}>
                <span style={{ fontSize: 28 }}>📞</span>
                APPELER LES URGENCES (15)
              </a>
            )}

            {/* Bouton recommencer */}
            <button onClick={reset} style={{
              background: 'white', border: '2px solid #dc2626', borderRadius: 20,
              padding: '14px', width: '100%', fontFamily: 'Google Sans, sans-serif',
              fontWeight: 700, fontSize: 15, color: '#dc2626', cursor: 'pointer'
            }}>
              🔄 Décrire d'autres symptômes
            </button>
          </>
        )}
      </main>

      <BottomNav />
    </div>
  );
}
