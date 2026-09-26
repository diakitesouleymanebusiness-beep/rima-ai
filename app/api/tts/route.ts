import { NextRequest, NextResponse } from 'next/server';

const LANG_CODE: Record<string, string> = {
  fr: 'fr-FR', en: 'en-US', ar: 'ar-SA',
  sw: 'fr-FR', ha: 'fr-FR', wo: 'fr-FR',
  bm: 'fr-FR', dyu: 'fr-FR', ff: 'fr-FR',
};

export async function POST(req: NextRequest) {
  try {
    const { text, language = 'fr' } = await req.json();
    const langCode = LANG_CODE[language] ?? 'fr-FR';
    return NextResponse.json({ text, langCode, useBrowser: true });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Erreur inconnue';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
