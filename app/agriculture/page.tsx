// ============================================================
// RIMA AI — Page Agriculture (Analyse de plantes BIO)
// ============================================================
'use client';
import { useState, useRef, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import SpeakButton from '@/components/voice/SpeakButton';
import LoadingSpinner from '@/components/ui/LoadingSpinner';
import AdBanner from '@/components/ui/AdBanner';
import ComingSoonButton from '@/components/ui/ComingSoonButton';
import { Language, PlantAnalysisResult } from '@/types';
import { speakText, storage } from '@/lib/utils';

export default function AgriculturePage() {
  const router = useRouter();
  const [language, setLanguage] = useState<Language>('fr');
  const [step, setStep] = useState<'intro' | 'capture' | 'loading' | 'result'>('intro');
  const [result, setResult] = useState<PlantAnalysisResult | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const fileRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const saved = storage.get<Language>('rima_language');
    if (saved) setLanguage(saved);
    setTimeout(() => {
      speakText('Service Agriculture. Analysez vos plantes avec des conseils biologiques.', saved ?? 'fr').catch(() => {});
      setStep('capture');
    }, 600);
  }, []);

  const handleImageFile = async (file: File) => {
    const reader = new FileReader();
    reader.onloadend = async () => {
      const base64 = reader.result as string;
      setPreview(base64);
      setStep('loading');
      speakText('Analyse en cours. Veuillez patienter.', language).catch(() => {});

      try {
        const res = await fetch('/api/plant-analyze', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ imageBase64: base64, language }),
        });
        const json = await res.json();
        if (json.success && json.data) {
          setResult(json.data);
          setStep('result');
          speakText(json.data.bioAdvice, language).catch(() => {});
        } else {
          alert('Analyse impossible. Réessayez avec une meilleure photo.');
          setStep('capture');
        }
      } catch {
        alert('Erreur de connexion. Réessayez.');
        setStep('capture');
      }
    };
    reader.readAsDataURL(file);
  };

  return (
    <div className="flex flex-col min-h-screen">
      {/* Header */}
      <header className="bg-gradient-to-br from-primary-500 to-primary-700 text-white px-5 pt-8 pb-6 rounded-b-3xl shadow-lg">
        <div className="flex items-center gap-3">
          <button onClick={() => router.push('/')} className="text-white/80 hover:text-white text-2xl">←</button>
          <span className="text-4xl">🌾</span>
          <div>
            <h1 className="text-2xl font-black">Agriculture</h1>
            <p className="text-primary-100 text-sm">Analyse de plantes — Conseils BIO</p>
          </div>
        </div>
      </header>

      <main className="flex-1 p-5 flex flex-col gap-5">

        {/* Capture image */}
        {step === 'capture' && (
          <div className="card text-center">
            <p className="text-2xl font-black text-gray-700 mb-2">📸 Photographiez votre plante</p>
            <p className="text-gray-500 mb-6">Prenez une photo de la feuille, tige ou fruit malade</p>

            <div className="flex flex-col gap-4">
              {/* Photo via caméra */}
              <button
                onClick={() => { if (fileRef.current) { fileRef.current.accept = 'image/*'; fileRef.current.capture = 'environment'; fileRef.current.click(); } }}
                className="w-full py-5 bg-primary-500 text-white rounded-2xl font-bold text-xl flex items-center justify-center gap-3 hover:bg-primary-600 active:scale-95 transition-all shadow-lg"
              >
                <span className="text-3xl">📷</span> Prendre une photo
              </button>

              {/* Téléverser */}
              <button
                onClick={() => { if (fileRef.current) { fileRef.current.removeAttribute('capture'); fileRef.current.click(); } }}
                className="w-full py-5 bg-white border-2 border-primary-400 text-primary-700 rounded-2xl font-bold text-xl flex items-center justify-center gap-3 hover:bg-primary-50 transition-all"
              >
                <span className="text-3xl">🖼️</span> Choisir une photo
              </button>
            </div>

            <input
              ref={fileRef}
              type="file"
              accept="image/*"
              className="hidden"
              onChange={(e) => { const f = e.target.files?.[0]; if (f) handleImageFile(f); }}
            />
          </div>
        )}

        {/* Chargement */}
        {step === 'loading' && (
          <div className="flex-1 flex flex-col items-center justify-center gap-5">
            {preview && (
              <div className="w-48 h-48 rounded-3xl overflow-hidden shadow-xl border-4 border-primary-300">
                <img src={preview} alt="Plante analysée" className="w-full h-full object-cover" />
              </div>
            )}
            <LoadingSpinner size="lg" message="Analyse de votre plante en cours... 🔬" />
          </div>
        )}

        {/* Résultat */}
        {step === 'result' && result && (
          <>
            {/* Photo + info plante */}
            <div className="card">
              <div className="flex gap-4 items-start">
                {preview && (
                  <div className="w-24 h-24 rounded-2xl overflow-hidden flex-shrink-0 border-2 border-primary-200">
                    <img src={preview} alt="Plante" className="w-full h-full object-cover" />
                  </div>
                )}
                <div className="flex-1">
                  <p className="font-black text-xl text-gray-800">{result.plantName}</p>
                  <p className="text-red-600 font-semibold mt-1">🦠 {result.diseaseName}</p>
                  <div className="flex items-center gap-2 mt-2">
                    <div className="h-2 rounded-full bg-gray-200 flex-1">
                      <div
                        className="h-2 rounded-full bg-primary-500"
                        style={{ width: `${result.confidence}%` }}
                      />
                    </div>
                    <span className="text-xs text-gray-500">{result.confidence}%</span>
                  </div>
                  <p className="text-xs text-gray-400 mt-1">Source : {result.source}</p>
                </div>
              </div>
            </div>

            {/* Conseil BIO */}
            <div className="card border-2 border-primary-300 bg-primary-50">
              <div className="flex items-center gap-2 mb-3">
                <span className="badge-bio">🌱 Conseil BIO</span>
              </div>
              <p className="text-gray-700 leading-relaxed text-lg whitespace-pre-line">
                {result.bioAdvice}
              </p>
              <SpeakButton text={result.bioAdvice} language={language} className="mt-4" label="Écouter le conseil BIO" />
            </div>

            <button
              onClick={() => { setStep('capture'); setResult(null); setPreview(null); }}
              className="w-full py-4 rounded-2xl border-2 border-primary-400 text-primary-700 font-bold text-lg hover:bg-primary-50 transition-colors"
            >
              📸 Analyser une autre plante
            </button>
          </>
        )}

        {/* Coming Soon */}
        <section>
          <h3 className="text-sm font-bold text-gray-400 mb-3 uppercase tracking-widest">🚀 Prochainement</h3>
          <div className="flex flex-wrap gap-3 justify-center">
            <ComingSoonButton icon="💰" label="Prix marché" />
            <ComingSoonButton icon="🌤️" label="Météo locale" />
            <ComingSoonButton icon="🧪" label="Analyse sol" />
            <ComingSoonButton icon="🤝" label="Mise en relation" />
          </div>
        </section>

        <AdBanner />
      </main>
    </div>
  );
}
