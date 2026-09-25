// ============================================================
// RIMA AI — API Route : Chat Mistral
// POST /api/chat
// Body: { messages, systemPrompt?, language? }
// ============================================================
import { NextRequest, NextResponse } from 'next/server';
import { mistralChat } from '@/lib/mistral';

export async function POST(req: NextRequest) {
  try {
    const { messages, systemPrompt, language = 'fr' } = await req.json();

    if (!messages || !Array.isArray(messages)) {
      return NextResponse.json({ error: 'messages requis' }, { status: 400 });
    }

    // Prompt système par défaut si non fourni
    const defaultSystem = `Tu es RIMA, un assistant vocal pour les personnes analphabètes en Afrique.
Langue de réponse : ${language === 'ar' ? 'arabe' : language === 'en' ? 'anglais' : 'français'}.
Règles importantes :
- Réponds de manière TRÈS courte, simple et directe (2-3 phrases maximum).
- Utilise des mots simples, évite le jargon.
- Sois chaleureux, encourageant et bienveillant.
- Ne fais jamais de diagnostic médical formel.
- Toujours conseiller de consulter un professionnel si nécessaire.`;

    const response = await mistralChat(messages, systemPrompt ?? defaultSystem);

    return NextResponse.json({ success: true, data: { text: response } });
  } catch (err: any) {
    console.error('[API/chat]', err.message);
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}
