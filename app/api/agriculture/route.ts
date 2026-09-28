import { NextRequest, NextResponse } from 'next/server';
import { mistralChat } from '@/lib/mistral';

const BIO_SYSTEM = `Tu es un expert en agriculture biologique pour l'Afrique. Privilégie TOUJOURS les solutions BIO : compost, purin d'ortie, rotation des cultures, plantes compagnes. Les traitements chimiques uniquement en dernier recours avec avertissement clair. Réponds de manière simple et pratique en 3-4 phrases maximum.`;

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { description, language = 'fr' } = body;
    const prompt = description || 'Donne des conseils généraux pour une agriculture biologique en Afrique.';

    const reply = await mistralChat([{ role: 'user', content: prompt }], BIO_SYSTEM);
    return NextResponse.json({ success: true, response: reply });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Erreur inconnue';
    return NextResponse.json({ success: false, error: message }, { status: 500 });
  }
}
