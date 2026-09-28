'use client';
import { useState, useRef, useCallback, useEffect } from 'react';
import { Language } from '@/types';

interface VoiceRecorderProps {
  onTranscript: (text: string) => void;
  language: Language;
  disabled?: boolean;
  className?: string;
  size?: 'sm' | 'md' | 'lg';
  autoStart?: boolean; // VAD : démarrer automatiquement
}

type RecorderState = 'idle' | 'recording' | 'processing' | 'error';

// Fallback Web Speech API (iOS Safari, navigateurs sans MediaRecorder)
function tryWebSpeech(language: string, onResult: (text: string) => void, onError: (msg: string) => void): (() => void) | null {
  const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
  if (!SpeechRecognition) return null;

  const langMap: Record<string, string> = {
    fr: 'fr-FR', en: 'en-US', ar: 'ar-SA',
    sw: 'sw-KE', ha: 'ha-NG', wo: 'fr-FR', bm: 'fr-FR', dyu: 'fr-FR', ff: 'fr-FR',
  };

  const rec = new SpeechRecognition();
  rec.lang = langMap[language] ?? 'fr-FR';
  rec.continuous = false;
  rec.interimResults = false;
  rec.maxAlternatives = 1;

  rec.onresult = (e: any) => {
    const text = e.results[0]?.[0]?.transcript?.trim();
    if (text) onResult(text);
    else onError('Rien entendu. Réessayez.');
  };
  rec.onerror = (e: any) => {
    if (e.error === 'not-allowed') onError('Micro refusé. Autorisez le micro dans Chrome.');
    else if (e.error === 'no-speech') onError('Rien entendu. Parlez plus fort.');
    else onError('Erreur micro. Utilisez le texte.');
  };
  rec.start();
  return () => { try { rec.stop(); } catch {} };
}

export default function VoiceRecorder({ onTranscript, language, disabled, className, size = 'lg', autoStart }: VoiceRecorderProps) {
  const [state, setState] = useState<RecorderState>('idle');
  const [errorMsg, setErrorMsg] = useState('');
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const chunksRef = useRef<Blob[]>([]);
  const streamRef = useRef<MediaStream | null>(null);
  const webSpeechStopRef = useRef<(() => void) | null>(null);
  const silenceTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const analyserRef = useRef<AnalyserNode | null>(null);
  const animFrameRef = useRef<number | null>(null);

  // Nettoyage complet
  const cleanup = useCallback(() => {
    if (silenceTimerRef.current) clearTimeout(silenceTimerRef.current);
    if (animFrameRef.current) cancelAnimationFrame(animFrameRef.current);
    if (webSpeechStopRef.current) { webSpeechStopRef.current(); webSpeechStopRef.current = null; }
    streamRef.current?.getTracks().forEach(t => t.stop());
    streamRef.current = null;
    mediaRecorderRef.current = null;
  }, []);

  useEffect(() => () => cleanup(), [cleanup]);

  const sendToGroq = useCallback(async (blob: Blob, mimeType: string) => {
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
        setErrorMsg(json.error || 'Rien entendu. Parlez plus fort.');
      }
    } catch {
      setState('error');
      setErrorMsg('Erreur réseau. Vérifiez votre connexion.');
    }
  }, [language, onTranscript]);

  const startRecording = useCallback(async () => {
    if (state === 'recording' || state === 'processing') return;
    setErrorMsg('');
    cleanup();

    // Essai MediaRecorder (Android Chrome, PC)
    if (typeof MediaRecorder !== 'undefined' && navigator.mediaDevices?.getUserMedia) {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({ audio: { echoCancellation: true, noiseSuppression: true } });
        streamRef.current = stream;

        const mimeType = ['audio/webm;codecs=opus', 'audio/webm', 'audio/mp4', 'audio/ogg']
          .find(m => MediaRecorder.isTypeSupported(m)) ?? '';

        const recorder = new MediaRecorder(stream, mimeType ? { mimeType } : {});
        mediaRecorderRef.current = recorder;
        chunksRef.current = [];

        recorder.ondataavailable = e => { if (e.data.size > 0) chunksRef.current.push(e.data); };
        recorder.onstop = async () => {
          const blob = new Blob(chunksRef.current, { type: recorder.mimeType || 'audio/webm' });
          streamRef.current?.getTracks().forEach(t => t.stop());
          if (blob.size < 1000) {
            setState('error');
            setErrorMsg('Audio trop court. Parlez plus longtemps.');
            return;
          }
          await sendToGroq(blob, recorder.mimeType || 'audio/webm');
        };

        // VAD — détection silence via AnalyserNode
        const ctx = new AudioContext();
        const analyser = ctx.createAnalyser();
        analyser.fftSize = 512;
        analyserRef.current = analyser;
        ctx.createMediaStreamSource(stream).connect(analyser);
        const data = new Uint8Array(analyser.fftSize);
        let silentMs = 0;
        const SILENCE_THRESHOLD = 10;
        const SILENCE_DURATION = 2000; // 2s de silence = stop automatique
        const lastCheck = { t: Date.now() };

        const checkSilence = () => {
          analyser.getByteTimeDomainData(data);
          const rms = Math.sqrt(data.reduce((s, v) => s + (v - 128) ** 2, 0) / data.length);
          const now = Date.now();
          const dt = now - lastCheck.t;
          lastCheck.t = now;
          if (rms < SILENCE_THRESHOLD) {
            silentMs += dt;
            if (silentMs >= SILENCE_DURATION && recorder.state === 'recording') {
              recorder.stop();
              ctx.close();
              return;
            }
          } else {
            silentMs = 0;
          }
          animFrameRef.current = requestAnimationFrame(checkSilence);
        };

        recorder.start(200);
        setState('recording');
        animFrameRef.current = requestAnimationFrame(checkSilence);
        return;
      } catch (err) {
        // Si MediaRecorder échoue, on tombe sur Web Speech
      }
    }

    // Fallback Web Speech API (iOS Safari)
    const stop = tryWebSpeech(
      language,
      (text) => { onTranscript(text); setState('idle'); },
      (msg) => { setState('error'); setErrorMsg(msg); }
    );
    if (stop) {
      webSpeechStopRef.current = stop;
      setState('recording');
    } else {
      setState('error');
      setErrorMsg('Micro non disponible sur cet appareil. Utilisez le mode texte.');
    }
  }, [state, language, onTranscript, cleanup, sendToGroq]);

  // Auto-démarrage du micro si autoStart=true (démarrage conversation loop)
  useEffect(() => {
    if (!autoStart) return;
    const t = setTimeout(() => startRecording(), 300);
    return () => clearTimeout(t);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const stopRecording = useCallback(() => {
    if (animFrameRef.current) cancelAnimationFrame(animFrameRef.current);
    if (silenceTimerRef.current) clearTimeout(silenceTimerRef.current);
    if (mediaRecorderRef.current?.state === 'recording') {
      mediaRecorderRef.current.stop();
    } else if (webSpeechStopRef.current) {
      webSpeechStopRef.current();
      webSpeechStopRef.current = null;
      setState('idle');
    }
  }, []);

  const sizeClasses = { sm: 'w-14 h-14 text-2xl', md: 'w-20 h-20 text-3xl', lg: 'w-24 h-24 text-4xl' };
  const stateConfig = {
    idle:       { icon: '🎤', label: 'Appuyer pour parler',     bg: 'bg-primary-500 hover:bg-primary-600' },
    recording:  { icon: '⏹️', label: '🔴 Parlez… (auto-stop)',  bg: 'bg-red-500 hover:bg-red-600' },
    processing: { icon: '⏳', label: 'Transcription en cours…', bg: 'bg-amber-500' },
    error:      { icon: '🔄', label: 'Réessayer',               bg: 'bg-primary-500 hover:bg-primary-600' },
  };
  const cfg = stateConfig[state];
  const isDisabled = disabled || state === 'processing';

  return (
    <div className={`flex flex-col items-center gap-3 w-full ${className ?? ''}`}>
      <button
        onClick={state === 'recording' ? stopRecording : startRecording}
        disabled={isDisabled}
        aria-label={state === 'recording' ? 'Arrêter' : 'Parler'}
        className={`relative rounded-full flex items-center justify-center text-white shadow-2xl
          transition-all duration-300 active:scale-95
          ${sizeClasses[size]} ${cfg.bg}
          ${isDisabled ? 'opacity-60 cursor-not-allowed' : 'cursor-pointer'}
          ${state === 'idle' ? 'hover:scale-105' : ''}
          ${state === 'recording' ? 'scale-110' : ''}`}
      >
        {state === 'recording' && <span className="absolute inset-0 rounded-full bg-red-400 animate-ping opacity-50" />}
        <span className="relative">{cfg.icon}</span>
      </button>
      <p className={`text-sm font-medium text-center ${state === 'error' ? 'text-red-600' : 'text-gray-600'}`}>
        {state === 'error' ? `⚠️ ${errorMsg}` : cfg.label}
      </p>
    </div>
  );
}
