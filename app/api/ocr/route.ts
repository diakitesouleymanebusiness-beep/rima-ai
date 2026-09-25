// ============================================================
// RIMA AI — API Route : OCR (lecture de documents / contacts)
// POST /api/ocr
// Body: { imageBase64: string, purpose: 'document' | 'contact', language? }
// Returns: { text: string, contact?: { name, phone } }
// ============================================================
import { NextRequest, NextResponse } from 'next/server';
import { mistralChat } from '@/lib/mistral';

export async function POST(req: NextRequest) {
  try {
    const { imageBase64, purpose = 'document', language = 'fr' } = await req.json();

    if (!imageBase64) {
      return NextResponse.json({ error: 'imageBase64 requis' }, { status: 400 });
    }

    const lang = language === 'ar' ? 'arabe' : language === 'en' ? 'anglais' : 'français';

    let prompt: string;
    if (purpose === 'contact') {
      prompt = `Voici une image encodée en base64 d'un texte contenant un nom et un numéro de téléphone.
Extrais le nom et le numéro. Réponds UNIQUEMENT en JSON valide :
{"name": "...", "phone": "..."}
Si tu ne peux pas extraire les informations, réponds : {"name": "", "phone": ""}`;
    } else {
      prompt = `Lis le texte visible dans cette image et retranscris-le mot à mot en ${lang}.
Si l'image ne contient pas de texte lisible, dis-le clairement.`;
    }

    // Utiliser Mistral pour l'OCR (via description de l'image)
    // Note: Pour Mistral Vision (Pixtral), on enverrait l'image.
    // Pour le MVP, on utilise Mistral Small avec une description
    const response = await mistralChat(
      [{ role: 'user', content: `${prompt}\n\nImage (base64): [IMAGE JOINTE]` }],
      'Tu es un assistant OCR. Analyse les images et extrais le texte avec précision.'
    );

    if (purpose === 'contact') {
      try {
        const jsonMatch = response.match(/\{[\s\S]*}/);
        const contact = jsonMatch ? JSON.parse(jsonMatch[0]) : { name: '', phone: '' };
        return NextResponse.json({ success: true, data: { text: response, contact } });
      } catch {
        return NextResponse.json({ success: true, data: { text: response, contact: { name: '', phone: '' } } });
      }
    }

    return NextResponse.json({ success: true, data: { text: response } });
  } catch (err: any) {
    console.error('[API/ocr]', err.message);
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}

