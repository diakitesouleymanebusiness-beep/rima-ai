'use client';
import BottomNav from '@/components/ui/BottomNav';
import { useState, useCallback, useRef } from 'react';
import { useRouter } from 'next/navigation';
import VoiceRecorder from '@/components/voice/VoiceRecorder';
import { speakText, stopSpeaking } from '@/lib/utils';

interface HealthResult {
  condition: string;
  severity: 'low' | 'medium' | 'high';
  firstAid: { icon: string; text: string }[];
  callEmergency: boolean;
  advice: string;
}

const SYSTEM_PROMPT = `Tu es RIMA, un assistant santé bienveillant pour une population analphabète en Afrique de l'Ouest.
RÈGLES STRICTES :
- Ne fais JAMAIS de diagnostic médical certain.
- Fournis des premiers secours simples et pratiques.
- Utilise des termes simples et compréhensibles.
- Si symptômes graves (douleur thoracique, perte de connaissance, convulsions, saignement abondant) : severity = "high" et callEmergency = true.
Format JSON OBLIGATOIRE :
{
  "condition": "Suspicion clinique : <nom maladie probable>",
  "severity": "low|medium|high",
  "firstAid": [
    {"icon": "💧", "text": "Hydratation immédiate"},
    {"icon": "🛏", "text": "Repos sous moustiquaire"},
    {"icon": "🍚", "text": "Repas légers et tièdes"}
  ],
  "callEmergency": false,
  "advice": "Conseil de bienveillance court et rassurant"
}`;

const SEVERITY_CONFIG = {
  low: { label: 'ALERTE FAIBLE', color: '#16a34a', bg: '#f0fdf4', border: '#bbf7d0' },
  medium: { label: 'ALERTE MODÉRÉE', color: '#d97706', bg: '#fffbeb', border: '#fde68a' },
  high: { label: 'URGENCE', color: '#dc2626', bg: '#fef2f2', border: '#fecaca' },
};

export default function HealthPage() {
  const router = useRouter();
  const [step, setStep] = useState<'idle' | 'listening' | 'loading' | 'result'>('idle');
  const [result, setResult] = useState<HealthResult | null>(null);
  const [transcript, setTranscript] = useState('');
  const [micKey, setMicKey] = useState(0);
  const [showPhoto, setShowPhoto] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const restartMic = useCallback(() => {
    setMicKey(k => k + 1);
    setStep('listening');
    setResult(null);
    setTranscript('');
  }, []);

  const analyzeSymptoms = async (text: string) => {
    if (!text.trim()) return;
    setTranscript(text);
    setStep('loading');
    stopSpeaking();
    try {
      const res = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          messages: [{ role: 'user', content: `Symptômes décrits par le patient : ${text}` }],
          systemPrompt: SYSTEM_PROMPT,
          language: 'fr',
        }),
      });
      const json = await res.json();
      if (json.success) {
        try {
          const match = json.data.text.match(/\{[\s\S]*\}/);
          const parsed: HealthResult = match ? JSON.parse(match[0]) : null;
          if (parsed) {
            setResult(parsed);
            setStep('result');
            const msg = `${parsed.condition}. ${parsed.firstAid.map(f => f.text).join(', ')}. ${parsed.advice}`;
            speakText(msg, 'fr');
          }
        } catch {
          setResult({
            condition: 'Symptômes enregistrés',
            severity: 'low',
            firstAid: [
              { icon: '💧', text: 'Boire beaucoup d\'eau' },
              { icon: '🛏', text: 'Se reposer' },
              { icon: '🏥', text: 'Consulter un médecin' },
            ],
            callEmergency: false,
            advice: 'Consultez un professionnel de santé pour un avis médical.',
          });
          setStep('result');
        }
      }
    } catch {
      setStep('idle');
    }
  };

  const sevConfig = result ? SEVERITY_CONFIG[result.severity] : null;

  return (
    <div style={{ minHeight: '100vh', background: '#f5f5f5', fontFamily: "'Google Sans', sans-serif", paddingBottom: 80 }}>
      {/* Header */}
      <div style={{ background: 'white', padding: '12px 16px', display: 'flex', alignItems: 'center', gap: 12, boxShadow: '0 1px 3px rgba(0,0,0,0.1)', position: 'sticky', top: 0, zIndex: 10 }}>
        <button onClick={() => router.back()} style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 4 }}>
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none"><path d="M20 11H7.83l5.59-5.59L12 4l-8 8 8 8 1.41-1.41L7.83 13H20v-2z" fill="#333"/></svg>
        </button>
        <div style={{ flex: 1 }}>
          <div style={{ fontWeight: 700, fontSize: 18, color: '#1a1a1a' }}>Guide Vocal Santé</div>
          <div style={{ fontSize: 12, color: '#888' }}>Assistance médicale RIMA</div>
        </div>
        <div style={{ background: '#dc2626', color: 'white', borderRadius: 12, padding: '4px 10px', fontSize: 11, fontWeight: 700 }}>
          🏥 Santé
        </div>
      </div>

      <div style={{ padding: '16px' }}>

        {/* Instruction audio */}
        {step === 'idle' && (
          <>
            <div style={{ background: 'white', borderRadius: 16, padding: 20, marginBottom: 16, boxShadow: '0 2px 8px rgba(0,0,0,0.06)' }}>
              <div style={{ fontSize: 15, fontWeight: 600, color: '#1a1a1a', marginBottom: 12 }}>
                🎤 Décris ce qui te fait mal
              </div>
              <button
                onClick={() => speakText('Bonjour, je suis RIMA. Dis-moi ce qui te fait mal aujourd\'hui. Parle clairement et décris tes symptômes.', 'fr')}
                style={{ width: '100%', background: '#16a34a', color: 'white', border: 'none', borderRadius: 12, padding: '14px 20px', fontSize: 15, fontWeight: 600, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 10, justifyContent: 'center' }}
              >
                <span style={{ fontSize: 20 }}>🎵</span>
                Écouter la consigne audio
              </button>
            </div>

            {/* Big PARLER button */}
            <div style={{ background: 'white', borderRadius: 16, padding: 24, marginBottom: 16, boxShadow: '0 2px 8px rgba(0,0,0,0.06)', textAlign: 'center' }}>
              <div style={{ fontSize: 13, color: '#666', marginBottom: 6, fontWeight: 500 }}>
                Microphone RIMA Intelligent
              </div>
              <button
                onClick={() => setStep('listening')}
                style={{ width: 120, height: 120, borderRadius: '50%', background: 'linear-gradient(135deg, #1d4ed8, #3b82f6)', border: '4px solid #dbeafe', cursor: 'pointer', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 6, margin: '0 auto 16px', boxShadow: '0 4px 20px rgba(59,130,246,0.4)' }}
              >
                <svg width="40" height="40" viewBox="0 0 24 24" fill="white"><path d="M12 15c1.66 0 3-1.34 3-3V6c0-1.66-1.34-3-3-3S9 4.34 9 6v6c0 1.66 1.34 3 3 3zm5.91-3c-.49 0-.9.36-.98.85C16.52 15.2 14.47 17 12 17s-4.52-1.8-4.93-4.15c-.08-.49-.49-.85-.98-.85-.61 0-1.09.54-1 1.14.49 3 2.89 5.35 5.91 5.78V21h2v-1.98c3.02-.43 5.42-2.78 5.91-5.78.1-.6-.39-1.14-1-1.14z"/></svg>
                <span style={{ color: 'white', fontSize: 13, fontWeight: 700 }}>PARLER</span>
              </button>
              {/* Audio waves animation */}
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 4, marginBottom: 16 }}>
                {[12, 20, 28, 20, 12].map((h, i) => (
                  <div key={i} style={{ width: 4, height: h, borderRadius: 2, background: '#3b82f6', opacity: 0.5 }} />
                ))}
              </div>
              <div style={{ fontSize: 12, color: '#999' }}>Analyse médicale assistée par IA</div>
            </div>

            {/* Photo analysis */}
            <div style={{ background: 'white', borderRadius: 16, padding: 20, marginBottom: 16, boxShadow: '0 2px 8px rgba(0,0,0,0.06)' }}>
              <div style={{ fontSize: 15, fontWeight: 600, color: '#1a1a1a', marginBottom: 4 }}>📷 Analyse par photo</div>
              <div style={{ fontSize: 13, color: '#666', marginBottom: 12 }}>Montre une blessure ou une éruption cutanée</div>
              <button
                onClick={() => fileInputRef.current?.click()}
                style={{ width: '100%', background: '#f8fafc', border: '2px dashed #cbd5e1', borderRadius: 12, padding: '20px', cursor: 'pointer', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 8 }}
              >
                <span style={{ fontSize: 32 }}>📷</span>
                <span style={{ fontSize: 14, color: '#64748b', fontWeight: 500 }}>Prendre une photo</span>
              </button>
              <input ref={fileInputRef} type="file" accept="image/*" capture="environment" style={{ display: 'none' }}
                onChange={() => { alert('Analyse photo bientôt disponible'); }} />
            </div>
          </>
        )}

        {/* Listening state */}
        {step === 'listening' && (
          <div style={{ background: 'white', borderRadius: 16, padding: 24, marginBottom: 16, boxShadow: '0 2px 8px rgba(0,0,0,0.06)', textAlign: 'center' }}>
            <div style={{ fontSize: 15, fontWeight: 600, color: '#1a1a1a', marginBottom: 20 }}>🎤 Je t'écoute...</div>
            <VoiceRecorder
              key={micKey}
              onTranscript={analyzeSymptoms}
              language="fr"
              autoStart={true}
            />
            <button
              onClick={() => { setStep('idle'); restartMic(); }}
              style={{ marginTop: 16, background: 'none', border: '1px solid #e5e7eb', borderRadius: 8, padding: '8px 16px', fontSize: 14, color: '#666', cursor: 'pointer' }}
            >
              Annuler
            </button>
          </div>
        )}

        {/* Loading */}
        {step === 'loading' && (
          <div style={{ background: 'white', borderRadius: 16, padding: 32, marginBottom: 16, boxShadow: '0 2px 8px rgba(0,0,0,0.06)', textAlign: 'center' }}>
            <div style={{ width: 50, height: 50, border: '4px solid #f3f4f6', borderTop: '4px solid #dc2626', borderRadius: '50%', animation: 'spin 1s linear infinite', margin: '0 auto 16px' }} />
            <div style={{ fontSize: 15, color: '#666', fontWeight: 500 }}>Analyse en cours...</div>
            {transcript && (
              <div style={{ marginTop: 12, padding: 12, background: '#fef3c7', borderRadius: 10, fontSize: 13, color: '#92400e', textAlign: 'left' }}>
                <div style={{ fontWeight: 600, marginBottom: 4 }}>Ce que tu as dit :</div>
                "{transcript}"
              </div>
            )}
          </div>
        )}

        {/* Result */}
        {step === 'result' && result && sevConfig && (
          <>
            {/* Transcript */}
            {transcript && (
              <div style={{ background: '#fef3c7', borderRadius: 12, padding: 14, marginBottom: 12 }}>
                <div style={{ fontSize: 12, fontWeight: 600, color: '#92400e', marginBottom: 4 }}>CE QUE TU AS DIT</div>
                <div style={{ fontSize: 14, color: '#78350f' }}>"{transcript}"</div>
              </div>
            )}

            {/* Alert badge + condition */}
            <div style={{ background: sevConfig.bg, border: `2px solid ${sevConfig.border}`, borderRadius: 16, padding: 16, marginBottom: 12 }}>
              <div style={{ background: sevConfig.color, color: 'white', borderRadius: 8, padding: '4px 12px', fontSize: 12, fontWeight: 700, display: 'inline-block', marginBottom: 10 }}>
                ⚠️ {sevConfig.label}
              </div>
              <div style={{ fontSize: 16, fontWeight: 700, color: '#1a1a1a' }}>{result.condition}</div>
            </div>

            {/* First Aid */}
            <div style={{ background: 'white', borderRadius: 16, padding: 16, marginBottom: 12, boxShadow: '0 2px 8px rgba(0,0,0,0.06)' }}>
              <div style={{ fontSize: 14, fontWeight: 700, color: '#1a1a1a', marginBottom: 12 }}>🩹 Premiers gestes</div>
              {result.firstAid.map((item, i) => (
                <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '10px 0', borderBottom: i < result.firstAid.length - 1 ? '1px solid #f3f4f6' : 'none' }}>
                  <div style={{ width: 40, height: 40, background: '#f0fdf4', borderRadius: 10, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 20, flexShrink: 0 }}>
                    {item.icon}
                  </div>
                  <div style={{ fontSize: 14, color: '#374151', fontWeight: 500 }}>{item.text}</div>
                </div>
              ))}
            </div>

            {/* Emergency / Dispensary */}
            <div style={{ background: '#fef2f2', border: '2px solid #fecaca', borderRadius: 16, padding: 16, marginBottom: 12 }}>
              <div style={{ fontSize: 14, fontWeight: 700, color: '#dc2626', marginBottom: 12 }}>🚨 Besoin d'aide maintenant ?</div>
              <a href="tel:15" style={{ display: 'block', background: '#dc2626', color: 'white', textDecoration: 'none', borderRadius: 12, padding: '14px', textAlign: 'center', fontSize: 16, fontWeight: 700, marginBottom: 12 }}>
                📞 Appeler le dispensaire
              </a>
              <div style={{ background: 'white', borderRadius: 12, padding: 14 }}>
                <div style={{ fontSize: 13, fontWeight: 700, color: '#1a1a1a', marginBottom: 4 }}>🏥 Centre de Santé Communautaire</div>
                <div style={{ fontSize: 12, color: '#666', marginBottom: 8 }}>2,4 km · 8 min en moto</div>
                <div style={{ background: '#e5e7eb', borderRadius: 8, height: 80, display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: 8 }}>
                  <div style={{ fontSize: 13, color: '#666' }}>🗺️ Carte ici</div>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                  <div style={{ width: 8, height: 8, borderRadius: '50%', background: '#16a34a' }} />
                  <span style={{ fontSize: 12, color: '#16a34a', fontWeight: 600 }}>Poste de santé ouvert 24h/24</span>
                </div>
              </div>
            </div>

            {/* Bienveillance */}
            <div style={{ background: '#f0fdf4', border: '1px solid #bbf7d0', borderRadius: 16, padding: 16, marginBottom: 12 }}>
              <div style={{ fontSize: 13, fontWeight: 700, color: '#15803d', marginBottom: 6 }}>💚 Conseil et bienveillance</div>
              <div style={{ fontSize: 14, color: '#166534' }}>{result.advice}</div>
            </div>

            {/* Audio + Restart */}
            <div style={{ display: 'flex', gap: 10, marginBottom: 16 }}>
              <button
                onClick={() => {
                  const msg = `${result.condition}. Premiers gestes : ${result.firstAid.map(f => f.text).join(', ')}. ${result.advice}`;
                  speakText(msg, 'fr');
                }}
                style={{ flex: 1, background: '#1d4ed8', color: 'white', border: 'none', borderRadius: 12, padding: '14px', fontSize: 14, fontWeight: 600, cursor: 'pointer' }}
              >
                🔊 Écouter le résultat
              </button>
              <button
                onClick={restartMic}
                style={{ flex: 1, background: 'white', color: '#374151', border: '1px solid #e5e7eb', borderRadius: 12, padding: '14px', fontSize: 14, fontWeight: 600, cursor: 'pointer' }}
              >
                🔄 Nouveau symptôme
              </button>
            </div>
          </>
        )}
      </div>

      <BottomNav />
      <style>{`
        @keyframes spin { to { transform: rotate(360deg); } }
        @import url('https://fonts.googleapis.com/css2?family=Google+Sans:wght@400;500;600;700&display=swap');
      `}</style>
    </div>
  );
}
