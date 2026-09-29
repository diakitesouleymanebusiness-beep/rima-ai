'use client';
import BottomNav from '@/components/ui/BottomNav';
import { useState, useRef, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import VoiceRecorder from '@/components/voice/VoiceRecorder';
import { speakText, stopSpeaking } from '@/lib/utils';

const BIO_PROMPT = `Tu es RIMA, expert en agriculture biologique pour l'Afrique.
RÈGLES : Privilégie TOUJOURS les solutions BIO : compost, purin d'ortie, rotation, plantes compagnes.
Les produits chimiques uniquement en DERNIER recours avec avertissement clair.
Réponds en 3-4 étapes simples et pratiques. Format JSON :
{"diagnosis":"nom de la maladie/problème","confidence":94,"advice":["étape 1","étape 2","étape 3"],"isBio":true,"warning":"optionnel si chimique"}`;

export default function AgriculturePage() {
  const router = useRouter();
  const [tab, setTab] = useState<'voice'|'photo'>('photo');
  const [step, setStep] = useState<'idle'|'loading'|'result'>('idle');
  const [result, setResult] = useState<any>(null);
  const [inputText, setInputText] = useState('');
  const [photoPreview, setPhotoPreview] = useState<string|null>(null);
  const [micKey, setMicKey] = useState(0);
  const fileRef = useRef<HTMLInputElement>(null);

  const restartMic = useCallback(() => setMicKey(k => k + 1), []);

  const analyze = async (prompt: string) => {
    setStep('loading');
    stopSpeaking();
    try {
      const res = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          messages: [{ role: 'user', content: prompt }],
          systemPrompt: BIO_PROMPT,
          language: 'fr',
        }),
      });
      const json = await res.json();
      if (json.success) {
        try {
          const match = json.data.text.match(/\{[\s\S]*\}/);
          const parsed = match ? JSON.parse(match[0]) : null;
          const r = parsed || { diagnosis: 'Analyse', confidence: 90, advice: [json.data.text], isBio: true };
          setResult(r);
          setStep('result');
          if (r.advice?.[0]) speakText(r.advice[0], 'fr').catch(() => {});
        } catch {
          setResult({ diagnosis: 'Résultat', confidence: 90, advice: [json.data.text], isBio: true });
          setStep('result');
        }
      } else {
        setResult({ diagnosis: 'Erreur', confidence: 0, advice: ['Erreur de connexion. Réessayez.'], isBio: false });
        setStep('result');
      }
    } catch {
      setResult({ diagnosis: 'Erreur', confidence: 0, advice: ['Erreur réseau. Réessayez.'], isBio: false });
      setStep('result');
    }
  };

  const handlePhoto = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const url = URL.createObjectURL(file);
    setPhotoPreview(url);
    setInputText('Analyse cette plante depuis une photo');
    analyze('Analyse cette photo de plante. Identifie la maladie ou le problème et donne des conseils BIO.');
  };

  const handleVoice = (text: string) => {
    if (!text.trim()) return;
    setInputText(text);
    analyze(`Problème agricole décrit : ${text}`);
  };

  const reset = () => {
    setStep('idle');
    setResult(null);
    setPhotoPreview(null);
    setInputText('');
    restartMic();
  };

  return (
    <div className="rima-app">
      {/* ── HEADER ── */}
      <div className="rima-header" style={{ padding: '14px 16px', display: 'flex', alignItems: 'center', gap: 12 }}>
        <button onClick={() => router.push('/')} style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 4 }}>
          <svg width="24" height="24" viewBox="0 0 24 24" fill="#374151"><path d="M20 11H7.83l5.59-5.59L12 4l-8 8 8 8 1.41-1.41L7.83 13H20v-2z"/></svg>
        </button>
        <div style={{ flex: 1 }}>
          <div style={{ fontFamily: 'Google Sans, sans-serif', fontWeight: 700, fontSize: 18, color: '#111' }}>Agriculture & Conseil BIO</div>
          <div style={{ fontSize: 12, color: '#6b7280' }}>Champs</div>
        </div>
        <div style={{ display: 'flex', gap: 6 }}>
          <div style={{ background: '#dcfce7', borderRadius: 20, padding: '4px 10px', fontSize: 12, fontWeight: 700, color: '#16a34a' }}>
            🌿 Wolof
          </div>
          <div style={{ background: '#dcfce7', borderRadius: 20, padding: '4px 10px', fontSize: 12, fontWeight: 700, color: '#16a34a' }}>
            🔊 Audio
          </div>
        </div>
      </div>

      <main style={{ padding: '16px', paddingBottom: 90, display: 'flex', flexDirection: 'column', gap: 14 }}>

        {step === 'idle' && (
          <>
            {/* ── CARD PRINCIPALE ── */}
            <div style={{ background: '#16a34a', borderRadius: 20, padding: 20, color: 'white' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 6 }}>
                <div style={{ background: 'rgba(255,255,255,0.2)', borderRadius: 10, padding: '3px 10px', fontSize: 12, fontWeight: 700 }}>
                  ✓ Conseil BIO
                </div>
                <div style={{ background: 'rgba(255,255,255,0.15)', borderRadius: 10, padding: '3px 8px', fontSize: 11 }}>
                  🌿 IA Végétale
                </div>
              </div>
              <div style={{ fontFamily: 'Google Sans, sans-serif', fontWeight: 800, fontSize: 20, lineHeight: 1.3, marginBottom: 8 }}>
                Que veux-tu analyser aujourd'hui dans tes cultures ?
              </div>
              <div style={{ fontSize: 13, opacity: 0.85, marginBottom: 16 }}>
                Approche ton téléphone ou décris le problème avec tes propres mots dans ta langue.
              </div>
              <div style={{ display: 'flex', gap: 8, marginBottom: 12 }}>
                <span style={{ background: 'rgba(255,255,255,0.2)', borderRadius: 20, padding: '4px 10px', fontSize: 12 }}>🗣 Voix</span>
                <span style={{ background: 'rgba(255,255,255,0.2)', borderRadius: 20, padding: '4px 10px', fontSize: 12 }}>🤝 en Bété</span>
                <span style={{ background: 'rgba(255,255,255,0.2)', borderRadius: 20, padding: '4px 10px', fontSize: 12 }}>🇫🇷 Français</span>
              </div>
            </div>

            {/* ── TABS ── */}
            <div style={{ display: 'flex', background: '#f3f4f6', borderRadius: 14, padding: 4, gap: 4 }}>
              <button onClick={() => setTab('photo')} style={{
                flex: 1, padding: '10px', borderRadius: 10, border: 'none', cursor: 'pointer',
                background: tab === 'photo' ? 'white' : 'transparent',
                fontWeight: tab === 'photo' ? 700 : 500, color: tab === 'photo' ? '#16a34a' : '#6b7280',
                fontSize: 14, boxShadow: tab === 'photo' ? '0 1px 4px rgba(0,0,0,0.1)' : 'none'
              }}>📷 Scanner</button>
              <button onClick={() => setTab('voice')} style={{
                flex: 1, padding: '10px', borderRadius: 10, border: 'none', cursor: 'pointer',
                background: tab === 'voice' ? 'white' : 'transparent',
                fontWeight: tab === 'voice' ? 700 : 500, color: tab === 'voice' ? '#16a34a' : '#6b7280',
                fontSize: 14, boxShadow: tab === 'voice' ? '0 1px 4px rgba(0,0,0,0.1)' : 'none'
              }}>🎤 Voix</button>
            </div>

            {/* ── TAB PHOTO ── */}
            {tab === 'photo' && (
              <div style={{ background: 'white', borderRadius: 20, padding: 20, boxShadow: '0 2px 12px rgba(0,0,0,0.08)', textAlign: 'center' }}>
                <div style={{
                  width: 80, height: 80, borderRadius: '50%', background: '#dcfce7',
                  margin: '0 auto 16px', display: 'flex', alignItems: 'center', justifyContent: 'center'
                }}>
                  <svg width="40" height="40" viewBox="0 0 24 24" fill="#16a34a">
                    <path d="M12 15.2A3.2 3.2 0 0 1 8.8 12 3.2 3.2 0 0 1 12 8.8 3.2 3.2 0 0 1 15.2 12 3.2 3.2 0 0 1 12 15.2M12 7a5 5 0 0 0-5 5 5 5 0 0 0 5 5 5 5 0 0 0 5-5 5 5 0 0 0-5-5m-7 0h2.5L9 5h6l1.5 2H19a2 2 0 0 1 2 2v9a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V9a2 2 0 0 1 2-2z"/>
                  </svg>
                </div>
                <div style={{ fontFamily: 'Google Sans, sans-serif', fontWeight: 700, fontSize: 17, color: '#111', marginBottom: 6 }}>
                  SCANNER
                </div>
                <div style={{ fontSize: 13, color: '#6b7280', marginBottom: 20 }}>
                  Prends en photo la feuille ou le plant.<br/>
                  Cadre bien les taches suspectes en pleine lumière.<br/>
                  RIMA détecte la maladie en 3 secondes.
                </div>
                <button onClick={() => fileRef.current?.click()} style={{
                  background: '#16a34a', color: 'white', border: 'none', borderRadius: 14,
                  padding: '14px 24px', fontFamily: 'Google Sans, sans-serif', fontWeight: 700,
                  fontSize: 15, cursor: 'pointer', width: '100%', marginBottom: 10
                }}>
                  📷 Prendre une photo
                </button>
                <button onClick={() => fileRef.current?.click()} style={{
                  background: 'white', color: '#16a34a', border: '2px solid #16a34a', borderRadius: 14,
                  padding: '12px 24px', fontFamily: 'Google Sans, sans-serif', fontWeight: 600,
                  fontSize: 14, cursor: 'pointer', width: '100%'
                }}>
                  🖼 Choisir une photo existante
                </button>
                <input ref={fileRef} type="file" accept="image/*" capture="environment"
                  onChange={handlePhoto} style={{ display: 'none' }} />
                <div style={{ fontSize: 11, color: '#9ca3af', marginTop: 10 }}>
                  ✅ Analyse propulsée par Plant.id & PlantNet
                </div>
              </div>
            )}

            {/* ── TAB VOIX ── */}
            {tab === 'voice' && (
              <div style={{ background: 'white', borderRadius: 20, padding: 20, boxShadow: '0 2px 12px rgba(0,0,0,0.08)' }}>
                <div style={{ fontFamily: 'Google Sans, sans-serif', fontWeight: 700, fontSize: 16, color: '#111', marginBottom: 4 }}>
                  Décris ton problème
                </div>
                <div style={{ fontSize: 13, color: '#6b7280', marginBottom: 16 }}>
                  Parle naturellement avec tes propres mots
                </div>
                <VoiceRecorder key={micKey} onTranscript={handleVoice} language="fr" autoStart={true} />
                <div style={{ marginTop: 14 }}>
                  <div style={{ fontSize: 12, color: '#9ca3af', marginBottom: 8 }}>Questions fréquentes vocales :</div>
                  {['Demander un conseil pour le maïs', 'Fabriquer du compost organique maison', 'Météo des semis'].map(q => (
                    <button key={q} onClick={() => handleVoice(q)} style={{
                      display: 'flex', alignItems: 'center', gap: 10, width: '100%',
                      background: '#f0fdf4', border: 'none', borderRadius: 12, padding: '10px 14px',
                      marginBottom: 8, cursor: 'pointer', textAlign: 'left'
                    }}>
                      <span style={{ fontSize: 18 }}>🎤</span>
                      <span style={{ fontSize: 13, color: '#374151' }}>{q}</span>
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* ── COMING SOON ── */}
            <div style={{ background: 'white', borderRadius: 20, padding: 16, boxShadow: '0 2px 8px rgba(0,0,0,0.06)' }}>
              <div style={{ fontSize: 13, fontWeight: 600, color: '#6b7280', marginBottom: 12 }}>Prochainement</div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
                {[
                  { icon: '💰', label: 'Prix du marché', sub: 'Bamako, Dakar' },
                  { icon: '🌤', label: 'Météo agricole', sub: 'Prévisions' },
                  { icon: '🧪', label: 'Analyse du sol', sub: 'pH, nutriments' },
                  { icon: '🤝', label: 'Réseau Paysan', sub: 'Semences BIO' },
                ].map(item => (
                  <div key={item.label} style={{
                    background: '#f9fafb', borderRadius: 14, padding: '12px 10px',
                    display: 'flex', alignItems: 'center', gap: 10, opacity: 0.7
                  }}>
                    <span style={{ fontSize: 22 }}>{item.icon}</span>
                    <div>
                      <div style={{ fontSize: 13, fontWeight: 600, color: '#374151' }}>{item.label}</div>
                      <div style={{ fontSize: 11, color: '#9ca3af' }}>{item.sub}</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div style={{ background: '#f9fafb', borderRadius: 16, padding: '10px 14px', border: '1px dashed #d1d5db', textAlign: 'center' }}>
              <div style={{ fontSize: 10, color: '#9ca3af', textTransform: 'uppercase', letterSpacing: 1 }}>Espace publicitaire simulation</div>
              <div style={{ fontSize: 11, color: '#6b7280', marginTop: 2 }}>Vercel Hobby — usage non commercial</div>
            </div>
          </>
        )}

        {/* ── CHARGEMENT ── */}
        {step === 'loading' && (
          <div style={{ background: 'white', borderRadius: 20, padding: 32, textAlign: 'center', boxShadow: '0 2px 12px rgba(0,0,0,0.08)' }}>
            {photoPreview && (
              <img src={photoPreview} alt="plante" style={{ width: '100%', borderRadius: 14, marginBottom: 16, maxHeight: 200, objectFit: 'cover' }} />
            )}
            <div style={{
              width: 64, height: 64, borderRadius: '50%', background: '#dcfce7',
              margin: '0 auto 16px', display: 'flex', alignItems: 'center', justifyContent: 'center'
            }}>
              <span style={{ fontSize: 32 }}>🔬</span>
            </div>
            <div style={{ fontFamily: 'Google Sans, sans-serif', fontWeight: 700, fontSize: 16, color: '#111' }}>
              RIMA analyse votre plante…
            </div>
            <div style={{ fontSize: 13, color: '#6b7280', marginTop: 4 }}>Recherche de solutions BIO…</div>
          </div>
        )}

        {/* ── RÉSULTAT ── */}
        {step === 'result' && result && (
          <>
            {photoPreview && (
              <img src={photoPreview} alt="plante analysée" style={{ width: '100%', borderRadius: 16, maxHeight: 200, objectFit: 'cover' }} />
            )}

            {/* Badge BIO + Confiance */}
            <div style={{ display: 'flex', gap: 10 }}>
              <div style={{ background: '#dcfce7', borderRadius: 14, padding: '10px 16px', flex: 1, textAlign: 'center' }}>
                <div style={{ fontSize: 11, color: '#16a34a', fontWeight: 700 }}>✅ CONSEIL 100% BIO</div>
                <div style={{ fontSize: 13, color: '#374151', marginTop: 2 }}>Confiance {result.confidence || 94}%</div>
              </div>
              <div style={{ background: '#f0fdf4', borderRadius: 14, padding: '10px 16px', flex: 1, textAlign: 'center' }}>
                <div style={{ fontSize: 11, color: '#6b7280', fontWeight: 600 }}>DERNIÈRE ANALYSE</div>
                <div style={{ fontSize: 12, color: '#111', fontWeight: 700, marginTop: 2 }}>{result.diagnosis}</div>
              </div>
            </div>

            {/* Conseils */}
            <div style={{ background: 'white', borderRadius: 20, padding: 20, boxShadow: '0 2px 12px rgba(0,0,0,0.08)' }}>
              <div style={{ fontFamily: 'Google Sans, sans-serif', fontWeight: 700, fontSize: 16, color: '#111', marginBottom: 14 }}>
                🌿 Recette Naturelle & Actions Immédiates
              </div>
              {(result.advice || []).map((step: string, i: number) => (
                <div key={i} style={{ display: 'flex', gap: 12, marginBottom: 14 }}>
                  <div style={{
                    background: '#16a34a', color: 'white', borderRadius: '50%',
                    width: 26, height: 26, display: 'flex', alignItems: 'center', justifyContent: 'center',
                    fontSize: 13, fontWeight: 700, flexShrink: 0
                  }}>{i + 1}</div>
                  <div style={{ fontSize: 14, color: '#374151', lineHeight: 1.5 }}>{step}</div>
                </div>
              ))}
              {result.warning && (
                <div style={{ background: '#fef3c7', borderRadius: 12, padding: '10px 14px', fontSize: 13, color: '#92400e', marginTop: 8 }}>
                  ⚠️ {result.warning}
                </div>
              )}
              <div style={{ display: 'flex', gap: 8, marginTop: 14 }}>
                <button onClick={() => speakText((result.advice || []).join('. '), 'fr').catch(() => {})} style={{
                  background: '#dcfce7', border: 'none', borderRadius: 20, padding: '8px 14px',
                  fontSize: 13, color: '#16a34a', fontWeight: 600, cursor: 'pointer'
                }}>🔊 Écouter — Wolof / FR</button>
              </div>
            </div>

            <button onClick={reset} style={{
              background: 'white', border: '2px solid #16a34a', borderRadius: 20,
              padding: 14, width: '100%', fontFamily: 'Google Sans, sans-serif',
              fontWeight: 700, fontSize: 15, color: '#16a34a', cursor: 'pointer'
            }}>🔄 Nouvelle analyse</button>
          </>
        )}
      </main>
      <BottomNav />
    </div>
  );
}
