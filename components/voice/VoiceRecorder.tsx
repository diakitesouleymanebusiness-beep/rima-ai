'use client';
import { useState, useRef, useCallback } from 'react';
import { Language } from '@/types';

interface VoiceRecorderProps {
  onTranscript: (text: string) => void;
  language: Language;
  disabled?: boolean;
  className?: string;
  size?: 'sm' | 'md' | 'lg';
}

type RecorderState = 'idle' | 'recording' | 'processing' | 'error';

export default function VoiceRecorder({ onTranscript, language, disabled, className, size = 'lg' }: VoiceRecorderProps) {
  const [state, setState] = useState<RecorderState>('idle');
  const [errorMsg, setErrorMsg] = useState('');
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const chunksRef = useRef<Blob[]>([]);
  const streamRef = useRef<MediaStream | null>(null);

  const startRecording = useCallback(async () => {
    setErrorMsg('');
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      streamRef.current = stream;

      const mimeType = MediaRecorder.isTypeSupported('audio/webm;codecs=opus')
        ? 'audio/webm;codecs=opus'
        : MediaRecorder.isTypeSupported('audio/webm')
        ? 'audio/webm'
        : 'audio/mp4';

      const recorder = new MediaRecorder(stream, { mimeType });
      mediaRecorderRef.current = recorder;
      chunksRef.current = [];

      recorder.ondataavailable = (e) => {
        if (e.data.size > 0) chunksRef.current.push(e.data);
      };

      recorder.onstop = async () => {
        streamRef.current?.getTracks().forEach(t => t.stop());
        const blob = new Blob(chunksRef.current, { type: mimeType });

        if (blob.size < 500) {
          setState('error');
          setErrorMsg('Audio trop court. Parlez plus longtemps.');
          return;
        }

        setState('processing');
        try {
          const form = new FormData();
          const ext = mimeType.includes('mp4') ? 'mp4' : 'webm';
          form.append('audio', blob, `audio.${ext}`);
          form.append('language', language);

          const res = await fetch('/api/stt', { method: 'POST', body: form });
          const json = await res.json();

          const transcript = json.transcript || json.data?.text || '';
          if (transcript.trim()) {
            onTranscript(transcript.trim());
            setState('idle');
          } else {
            setState('error');
            setErrorMsg(json.error || 'Rien entendu. Parlez plus fort et reessayez.');
          }
        } catch {
          setState('error');
          setErrorMsg('Erreur reseau. Verifiez votre connexion.');
        }
      };

      recorder.start(100);
      setState('recording');
    } catch (err) {
      setState('error');
      const msg = err instanceof Error ? err.message : '';
      if (msg.includes('Permission') || msg.includes('NotAllowed')) {
        setErrorMsg('Micro refuse. Autorisez le micro dans Chrome.');
      } else if (msg.includes('NotFound')) {
        setErrorMsg('Aucun micro detecte.');
      } else {
        setErrorMsg('Impossible d acceder au micro. Utilisez le texte.');
      }
    }
  }, [language, onTranscript]);

  const stopRecording = useCallback(() => {
    if (mediaRecorderRef.current?.state === 'recording') {
      mediaRecorderRef.current.stop();
    }
  }, []);

  const sizeClasses = { sm: 'w-14 h-14 text-2xl', md: 'w-20 h-20 text-3xl', lg: 'w-24 h-24 text-4xl' };

  const stateConfig = {
    idle: { icon: '🎤', label: 'Appuyer pour parler', bg: 'bg-primary-500 hover:bg-primary-600' },
    recording: { icon: '⏹️', label: 'Appuyer pour arreter', bg: 'bg-red-500 hover:bg-red-600' },
    processing: { icon: '⏳', label: 'Transcription...', bg: 'bg-amber-500' },
    error: { icon: '🔄', label: 'Reessayer', bg: 'bg-primary-500 hover:bg-primary-600' },
  };

  const cfg = stateConfig[state];
  const isDisabled = disabled || state === 'processing';

  return (
    <div className={`flex flex-col items-center gap-3 w-full ${className ?? ''}`}>
      <button
        onClick={state === 'recording' ? stopRecording : startRecording}
        disabled={isDisabled}
        aria-label={state === 'recording' ? 'Arreter' : 'Parler'}
        className={`
          relative rounded-full flex items-center justify-center text-white shadow-2xl
          transition-all duration-300 active:scale-95
          ${sizeClasses[size]} ${cfg.bg}
          ${isDisabled ? 'opacity-60 cursor-not-allowed' : 'cursor-pointer'}
          ${state === 'idle' ? 'hover:scale-105' : ''}
          ${state === 'recording' ? 'scale-110' : ''}
        `}
      >
        {state === 'recording' && (
          <span className="absolute inset-0 rounded-full bg-red-400 animate-ping opacity-50" />
        )}
        <span className="relative">{cfg.icon}</span>
      </button>

      <p className={`text-sm font-medium text-center ${state === 'error' ? 'text-red-600' : 'text-gray-600'}`}>
        {state === 'error' ? errorMsg : cfg.label}
      </p>
    </div>
  );
}
