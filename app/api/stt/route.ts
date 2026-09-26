import { NextRequest, NextResponse } from 'next/server';
export const runtime = 'nodejs';
export const maxDuration = 30;

function getApiKey(): string {
  const key = process.env.GROQ_API_KEY;
  if (!key) throw new Error('GROQ_API_KEY manquante');
  return key;
}

export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData();
    const audioFile = formData.get('audio') as File | null;
    const language = (formData.get('language') as string) || 'fr';

    if (!audioFile) {
      return NextResponse.json({ error: 'Fichier audio manquant', transcript: '', success: false }, { status: 400 });
    }

    const whisperLang: Record<string, string> = {
      fr: 'fr', en: 'en', ar: 'ar', sw: 'sw', ha: 'ha',
      wo: 'fr', bm: 'fr', dyu: 'fr', ff: 'fr',
    };
    const lang = whisperLang[language] ?? 'fr';

    const groqForm = new FormData();
    const ext = audioFile.name?.includes('mp4') ? 'mp4' : 'webm';
    groqForm.append('file', audioFile, `audio.${ext}`);
    groqForm.append('model', 'whisper-large-v3-turbo');
    groqForm.append('language', lang);
    groqForm.append('response_format', 'json');

    const res = await fetch('https://api.groq.com/openai/v1/audio/transcriptions', {
      method: 'POST',
      headers: { 'Authorization': `Bearer ${getApiKey()}` },
      body: groqForm,
    });

    if (!res.ok) {
      const err = await res.text();
      throw new Error(`Groq Whisper error ${res.status}: ${err}`);
    }

    const data = await res.json();
    const transcript = data.text?.trim() ?? '';
    return NextResponse.json({ transcript, success: true, data: { text: transcript } });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Erreur inconnue';
    console.error('STT error:', message);
    return NextResponse.json({ error: message, transcript: '', success: false }, { status: 500 });
  }
}
