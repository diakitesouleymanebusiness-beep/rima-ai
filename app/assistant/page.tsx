'use client';
import BottomNav from '@/components/ui/BottomNav';
// ============================================================
// RIMA AI — Page Assistant (Contacts, Appels, Navigation, Lecture, Traduction)
// ============================================================

import { useState, useEffect, useRef, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import VoiceRecorder from '@/components/voice/VoiceRecorder';
import TextInput from '@/components/voice/TextInput';
import SpeakButton from '@/components/voice/SpeakButton';
import LoadingSpinner from '@/components/ui/LoadingSpinner';
import AdBanner from '@/components/ui/AdBanner';
import ComingSoonButton from '@/components/ui/ComingSoonButton';
import { Language, Contact } from '@/types';
import { speakText, stopSpeaking, storage, uid } from '@/lib/utils';

type AssistantMode = 'menu' | 'contact' | 'call' | 'navigate' | 'read' | 'translate';

const SYSTEM_PROMPT_ASSISTANT = `Tu es RIMA, un assistant vocal pour personnes analphabètes en Afrique.
Pour les contacts : extrais le nom et numéro en JSON {"action":"contact","name":"...","phone":"..."}.
Pour appeler : {"action":"call","name":"...","mode":"direct|whatsapp|autre"}.
Pour naviguer : {"action":"navigate","place":"...","emergency":true|false}.
Pour lire : {"action":"read","text":"..."}.
Pour traduire : {"action":"translate","from":"...","to":"...","text":"..."}.
Si la personne parle de santé, symptômes, maladie, douleur, médecin : {"action":"redirect","to":"health","speech":"Je vous redirige vers le service santé."}.
Si la personne parle de plante, culture, agriculture, sol, récolte : {"action":"redirect","to":"agriculture","speech":"Je vous redirige vers le service agriculture."}.
Si la personne parle d'apprendre, lire, écrire, école, alphabétisation : {"action":"redirect","to":"education","speech":"Je vous redirige vers le service éducation."}.
Si la demande est ambiguë, pose une question simple.
Réponds TOUJOURS en JSON avec un champ "speech" pour la réponse vocale.`;

export default function AssistantPage() {
  const router = useRouter();
  const [language, setLanguage]     = useState<Language>('fr');
  const [mode, setMode]             = useState<AssistantMode>('menu');
  const [loading, setLoading]       = useState(false);
  const [response, setResponse]     = useState<string>('');
  const [contacts, setContacts]     = useState<Contact[]>([]);
  const [inputMode, setInputMode]   = useState<'voice' | 'text'>('voice');
  const [pendingContact, setPendingContact] = useState<{ name: string; phone: string } | null>(null);
  const [micKey, setMicKey]         = useState(0);
  const fileRef = useRef<HTMLInputElement>(null);

  // Redémarre le micro après que l'IA a fini de parler
  const restartMic = useCallback(() => {
    setMicKey(k => k + 1);
  }, []);

  useEffect(() => {
    const saved = storage.get<Language>('rima_language');
    if (saved) setLanguage(saved);
    const savedContacts = storage.get<Contact[]>('rima_contacts') ?? [];
    setContacts(savedContacts);
    speakText('Assistant vocal. Que puis-je faire pour vous ?', saved ?? 'fr')
      .catch(() => {})
      .finally(() => restartMic());
    return () => stopSpeaking();
  }, []);

  const handleUserInput = async (text: string) => {
    setLoading(true);
    setResponse('');
    try {
      const res = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          messages: [{ role: 'user', content: text }],
          systemPrompt: SYSTEM_PROMPT_ASSISTANT,
          language,
        }),
      });
      const json = await res.json();
      if (!json.success) throw new Error(json.error);

      // Essayer de parser la réponse JSON
      try {
        const match = json.data.text.match(/\{[\s\S]*\}/);
        const parsed = match ? JSON.parse(match[0]) : null;

        if (parsed) {
          await handleAction(parsed);
        } else {
          setResponse(json.data.text);
          await speakText(json.data.text, language).catch(() => {});
          restartMic();
        }
      } catch {
        setResponse(json.data.text);
        await speakText(json.data.text, language).catch(() => {});
        restartMic();
      }
    } catch (err: any) {
      const msg = 'Désolé, une erreur est survenue. Réessayez.';
      setResponse(msg);
      await speakText(msg, language).catch(() => {});
      restartMic();
    } finally {
      setLoading(false);
    }
  };

  const handleAction = async (parsed: any) => {
    const speech = parsed.speech ?? '';

    switch (parsed.action) {
      case 'contact': {
        const { name, phone } = parsed;
        if (!name || !phone) {
          const msg = 'Je n\'ai pas pu extraire le nom ou le numéro. Réessayez.';
          setResponse(msg);
          await speakText('Je n\'ai pas compris le nom ou le numéro. Répétez.', language).catch(() => {});
          restartMic();
          return;
        }
        // Vérifier doublon
        const existing = contacts.find(c => c.name.toLowerCase() === name.toLowerCase());
        if (existing) {
          setPendingContact({ name, phone });
          const msg = `Le contact ${name} existe déjà avec le numéro ${existing.phone}. Voulez-vous remplacer ?`;
          setResponse(msg);
          await speakText(msg, language).catch(() => {});
          setMode('contact');
          restartMic();
        } else {
          const newContact: Contact = { id: uid(), name, phone, addedAt: new Date().toISOString() };
          const updated = [...contacts, newContact];
          setContacts(updated);
          storage.set('rima_contacts', updated);
          const msg = `Contact ${name} enregistré avec le numéro ${phone}.`;
          setResponse(msg);
          await speakText(msg, language).catch(() => {});
          restartMic();
        }
        break;
      }
      case 'call': {
        const contact = contacts.find(c => c.name.toLowerCase().includes(parsed.name?.toLowerCase()));
        if (!contact) {
          const msg = `Je ne trouve pas le contact ${parsed.name}. Voulez-vous l'enregistrer d'abord ?`;
          setResponse(msg);
          await speakText(msg, language).catch(() => {});
          restartMic();
          return;
        }
        const callMsg = `Appel de ${contact.name} au ${contact.phone}`;
        setResponse(callMsg + (speech ? `\n${speech}` : ''));
        await speakText(`Appel de ${contact.name}`, language).catch(() => {});
        // Rediriger selon le mode
        if (parsed.mode === 'whatsapp') {
          window.location.href = `https://wa.me/${contact.phone.replace(/\s/g, '')}`;
        } else {
          window.location.href = `tel:${contact.phone.replace(/\s/g, '')}`;
        }
        break;
      }
      case 'redirect': {
        const dest = parsed.to as 'health' | 'agriculture' | 'education';
        const redirectMsg = parsed.speech ?? 'Redirection en cours...';
        setResponse(redirectMsg);
        await speakText(redirectMsg, language).catch(() => {});
        router.push(`/${dest}`);
        break;
      }
      case 'navigate': {
        const place = parsed.place ?? 'lieu';
        if (parsed.emergency) {
          const msg = `Je vous dirige vers l'hôpital le plus proche. Voulez-vous appeler les urgences ?`;
          setResponse(msg);
          await speakText(msg, language).catch(() => {});
          restartMic();
        } else {
          const msg = speech || `Navigation vers ${place}. Ouverture de Google Maps.`;
          setResponse(msg);
          await speakText(msg, language).catch(() => {});
          window.open(`https://maps.google.com/?q=${encodeURIComponent(place)}`, '_blank');
          restartMic();
        }
        break;
      }
      case 'translate': {
        const msg = speech || parsed.text || 'Traduction effectuée.';
        setResponse(msg);
        await speakText(msg, language).catch(() => {});
        restartMic();
        break;
      }
      default: {
        setResponse(speech || '' || 'Je vous ai entendu.');
        await speakText(speech || 'Entendu.', language).catch(() => {});
        restartMic();
      }
    }
  };

  const confirmReplaceContact = async () => {
    if (!pendingContact) return;
    const updated = contacts.map(c =>
      c.name.toLowerCase() === pendingContact.name.toLowerCase()
        ? { ...c, phone: pendingContact.phone }
        : c
    );
    setContacts(updated);
    storage.set('rima_contacts', updated);
    const msg = `Contact ${pendingContact.name} mis à jour.`;
    setResponse(msg);
    await speakText(msg, language).catch(() => {});
    setPendingContact(null);
    setMode('menu');
    restartMic();
  };

  const handlePhoto = async (file: File) => {
    const reader = new FileReader();
    reader.onloadend = async () => {
      setLoading(true);
      try {
        const res = await fetch('/api/ocr', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ imageBase64: reader.result, purpose: 'document', language }),
        });
        const json = await res.json();
        if (json.success) {
          setResponse(json.data.text);
          await speakText(json.data.text, language).catch(() => {});
          restartMic();
        }
      } finally {
        setLoading(false);
      }
    };
    reader.readAsDataURL(file);
  };

  return (
    <div className="flex flex-col min-h-screen">
      <header className="bg-gradient-to-br from-sky-500 to-sky-700 text-white px-5 pt-8 pb-6 rounded-b-3xl shadow-lg">
        <div className="flex items-center gap-3">
          <button onClick={() => router.push('/')} className="text-white/80 hover:text-white text-2xl">←</button>
          <span className="text-4xl">🤖</span>
          <div>
            <h1 className="text-2xl font-black">Assistant</h1>
            <p className="text-sky-100 text-sm">Contacts • Appels • Navigation • Lecture</p>
          </div>
        </div>
      </header>

      <main className="flex-1 p-5 flex flex-col gap-4">
        {/* Raccourcis rapides */}
        <div className="grid grid-cols-2 gap-3">
          {[
            { icon: '📞', label: 'Enregistrer contact', action: () => { setMode('contact'); speakText('Dites le nom et le numéro à enregistrer.', language).catch(()=>{}).finally(()=>restartMic()); } },
            { icon: '📖', label: 'Lire un document', action: () => fileRef.current?.click() },
            { icon: '🧭', label: 'Naviguer', action: () => { setMode('navigate'); speakText('Où voulez-vous aller ?', language).catch(()=>{}).finally(()=>restartMic()); } },
            { icon: '🌍', label: 'Traduire', action: () => { setMode('translate'); speakText('Que voulez-vous traduire ?', language).catch(()=>{}).finally(()=>restartMic()); } },
          ].map(({ icon, label, action }) => (
            <button key={label} onClick={action}
              className="card flex flex-col items-center gap-2 py-4 hover:bg-sky-50 hover:border-sky-300 border-2 border-transparent transition-all active:scale-95">
              <span className="text-3xl">{icon}</span>
              <span className="text-sm font-bold text-gray-700 text-center">{label}</span>
            </button>
          ))}
        </div>

        {/* Input vocal/texte */}
        <div className="card">
          <div className="flex justify-center gap-2 mb-4">
            <button onClick={() => setInputMode('voice')}
              className={`px-4 py-2 rounded-full font-semibold text-sm ${inputMode === 'voice' ? 'bg-sky-500 text-white' : 'bg-gray-100 text-gray-600'}`}>
              🎤 Voix
            </button>
            <button onClick={() => setInputMode('text')}
              className={`px-4 py-2 rounded-full font-semibold text-sm ${inputMode === 'text' ? 'bg-sky-500 text-white' : 'bg-gray-100 text-gray-600'}`}>
              ⌨️ Texte
            </button>
          </div>
          {inputMode === 'voice' ? (
            <VoiceRecorder
              key={micKey}
              onTranscript={handleUserInput}
              language={language}
              autoStart={true}
            />
          ) : (
            <TextInput onSubmit={handleUserInput} placeholder='Ex: "Enregistre le numéro de Mamadou : 07 12 34 56"' disabled={loading} />
          )}
        </div>

        {/* Chargement */}
        {loading && <LoadingSpinner size="md" message="RIMA traite votre demande..." />}

        {/* Réponse */}
        {response && !loading && (
          <div className="ai-response">
            <p className="leading-relaxed whitespace-pre-line">{response}</p>
            <SpeakButton text={response} language={language} className="mt-3" />
            {/* Confirmation remplacement contact */}
            {pendingContact && (
              <div className="flex gap-2 mt-3">
                <button onClick={confirmReplaceContact} className="flex-1 py-2 bg-sky-500 text-white rounded-xl font-bold text-sm">✅ Remplacer</button>
                <button onClick={() => setPendingContact(null)} className="flex-1 py-2 border border-gray-300 rounded-xl font-bold text-sm">❌ Annuler</button>
              </div>
            )}
          </div>
        )}

        {/* Liste contacts */}
        {contacts.length > 0 && (
          <div className="card">
            <h3 className="font-bold text-gray-700 mb-3">📋 Mes contacts ({contacts.length})</h3>
            <div className="space-y-2 max-h-48 overflow-y-auto">
              {contacts.map((c) => (
                <div key={c.id} className="flex items-center justify-between py-2 border-b border-gray-100">
                  <div>
                    <p className="font-bold text-gray-800">{c.name}</p>
                    <p className="text-sm text-gray-500">{c.phone}</p>
                  </div>
                  <a href={`tel:${c.phone}`} className="bg-sky-100 text-sky-700 px-3 py-1 rounded-xl text-sm font-bold hover:bg-sky-200">
                    📞
                  </a>
                </div>
              ))}
            </div>
          </div>
        )}

        <input ref={fileRef} type="file" accept="image/*" capture="environment" className="hidden"
          onChange={(e) => { const f = e.target.files?.[0]; if (f) handlePhoto(f); }} />

        {/* Coming Soon */}
        <div className="flex flex-wrap gap-3 justify-center">
          <ComingSoonButton icon="💬" label="SMS vocal" />
          <ComingSoonButton icon="💵" label="Billets" />
          <ComingSoonButton icon="🔢" label="Calculatrice" />
        </div>

        <AdBanner />
      </main>
      <BottomNav />
    </div>
  );
}
