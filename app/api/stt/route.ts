// ============================================================
// RIMA AI — API Route : Speech-to-Text
// POST /api/stt
// Stratégie : Web Speech API côté client (SpeechRecognition)
// Ce endpoint retourne les paramètres de configuration
// ============================================================
import { NextRequest, NextResponse } from 'next/server';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json().catch(() => ({}));
    const language = body.language ?? 'fr';

    return NextResponse.json({
      success: true,
      data: {
        useBrowserSTT: true,
        langCode: language === 'ar' ? 'ar-SA' : language === 'en' ? 'en-US' : 'fr-FR',
      },
    });
  } catch (err: any) {
    console.error('[API/stt]', err.message);
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}
