// ============================================================
// RIMA AI — API Route : Text-to-Speech
// POST /api/tts
// Body: { text, language? }
// Stratégie : Web Speech API côté client (gratuit, multilingue)
// Ce endpoint retourne les paramètres pour le frontend
// ============================================================
import { NextRequest, NextResponse } from 'next/server';

export async function POST(req: NextRequest) {
  try {
    const { text, language = 'fr' } = await req.json();

    if (!text || typeof text !== 'string') {
      return NextResponse.json({ error: 'text requis' }, { status: 400 });
    }

    // Retourner les paramètres pour que le frontend utilise Web Speech API
    // Le frontend appellera window.speechSynthesis.speak() avec ces paramètres
    return NextResponse.json({
      success: true,
      data: {
        text: text.slice(0, 1000),
        language,
        useBrowserTTS: true,  // signal au frontend d'utiliser Web Speech API
        // Mapping langue → code BCP-47 pour SpeechSynthesis
        langCode: language === 'ar' ? 'ar-SA' : language === 'en' ? 'en-US' : 'fr-FR',
      },
    });
  } catch (err: any) {
    console.error('[API/tts]', err.message);
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}
