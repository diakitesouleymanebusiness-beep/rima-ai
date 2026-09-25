// ============================================================
// RIMA AI — Composant : Enregistreur vocal
// ============================================================
'use client';
import { useState, useRef, useCallback } from 'react';
import { cn } from '@/lib/utils';

interface VoiceRecorderProps {
  onTranscript: (text: string) => void;
  language?: string;
  className?: string;
  size?: 'sm' | 'md' | 'lg';
}

type RecordingState = 'idle' | 'recording' | 'processing';

export default function VoiceRecorder({
  onTranscript,
  language = 'fr',
  className,
  size = 'lg',
}: VoiceRecorderProps) {
  const [state, setState] = useState<RecordingState>('idle');
  const [error, setError] = useState<string | null>(null);
  const mediaRef  = useRef<MediaRecorder | null>(null);
  const chunksRef = useRef<Blob[]>([]);

  const startRecording = useCallback(async () => {
    setError(null);
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const recorder = new MediaRecorder(stream, { mimeType: 'audio/webm' });
      chunksRef.current = [];

      recorder.ondataavailable = (e) => { if (e.data.size > 0) chunksRef.current.push(e.data); };
      recorder.onstop = async () => {
        setState('processing');
        stream.getTracks().forEach((t) => t.stop());

        const blob = new Blob(chunksRef.current, { type: 'audio/webm' });
        const formData = new FormData();
        formData.append('audio', blob, 'recording.webm');
        formData.append('language', language);

        try {
          const res = await fetch('/api/stt', { method: 'POST', body: formData });
          const json = await res.json();
          if (json.success && json.data?.text) {
            onTranscript(json.data.text);
          } else {
            setError('Impossible de transcrire l\'audio. Réessayez.');
          }
        } catch {
          setError('Erreur de connexion. Réessayez.');
        } finally {
          setState('idle');
        }
      };

      recorder.start();
      mediaRef.current = recorder;
      setState('recording');
    } catch {
      setError('Microphone non disponible. Utilisez le mode texte.');
      setState('idle');
    }
  }, [language, onTranscript]);

  const stopRecording = useCallback(() => {
    mediaRef.current?.stop();
  }, []);

  const sizeClasses = {
    sm: 'w-14 h-14 text-2xl',
    md: 'w-20 h-20 text-3xl',
    lg: 'w-28 h-28 text-5xl',
  };

  return (
    <div className={cn('flex flex-col items-center gap-3', className)}>
      <button
        onClick={state === 'recording' ? stopRecording : startRecording}
        disabled={state === 'processing'}
        aria-label={state === 'recording' ? 'Arrêter l\'enregistrement' : 'Commencer à parler'}
        className={cn(
          'rounded-full flex items-center justify-center shadow-2xl transition-all duration-300',
          'focus:outline-none focus:ring-4 focus:ring-primary-300',
          sizeClasses[size],
          state === 'idle'       && 'bg-primary-500 hover:bg-primary-600 hover:scale-105 animate-pulseGlow',
          state === 'recording'  && 'bg-red-500 hover:bg-red-600 scale-110 animate-bounce',
          state === 'processing' && 'bg-gray-300 cursor-not-allowed',
        )}
      >
        {state === 'idle'       && '🎤'}
        {state === 'recording'  && '⏹️'}
        {state === 'processing' && '⏳'}
      </button>

      <p className="text-center font-semibold text-gray-600 text-sm">
        {state === 'idle'       && 'Appuyez pour parler'}
        {state === 'recording'  && '🔴 Enregistrement en cours...'}
        {state === 'processing' && 'Traitement de votre voix...'}
      </p>

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-2 rounded-xl text-sm text-center max-w-xs">
          ⚠️ {error}
        </div>
      )}
    </div>
  );
}
