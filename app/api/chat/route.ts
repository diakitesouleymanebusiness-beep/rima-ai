import { NextRequest, NextResponse } from 'next/server';
import { mistralChat } from '@/lib/mistral';

const LANG_PROMPTS: Record<string, string> = {
  fr: 'Tu es RIMA, un assistant vocal bienveillant pour les personnes analphabètes en Afrique. Réponds toujours en 2-3 phrases courtes et simples en français.',
  en: 'You are RIMA, a helpful voice assistant for illiterate people in Africa. Always reply in 2-3 short, simple sentences in English.',
  ar: 'أنت ريما، مساعد صوتي لطيف للأميين في أفريقيا. أجب دائمًا في 2-3 جمل قصيرة وبسيطة باللغة العربية.',
  sw: 'Wewe ni RIMA, msaidizi wa sauti kwa watu wasio na elimu barani Afrika. Jibu kila wakati kwa sentensi 2-3 fupi na rahisi kwa Kiswahili.',
  ha: 'Kai ne RIMA, mataimaki mai magana don marasa karatu a Afirka. Koyaushe amsa da gajerun jimloli 2-3 mai sauƙi da yaren Hausa.',
  wo: 'Yow ngi fi RIMA, ci bëgg na dem Afrig, jëf ci xam-xam wi. Tontu ci 2-3 bataaxal yu néew ak yu wér ci wolof.',
  bm: 'I ye RIMA ye, kuma dɛmɛbaga ye Afiriki mɔgɔ minnu tɛ sɛbɛn kalan ye. Jaabi yɔrɔ bɛɛ la kumakan 2-3 fɛ ɲɔgɔn na bambara kɔnɔ.',
  dyu: 'I ye RIMA ye, kuma dɛmɛbaga ye Afiriki mɔgɔ minnu tɛ sɛbɛn kalan ye. Jaabi dioula kɔnɔ kumakan 2-3 la.',
  ff: 'Aɗa waɗi RIMA, ballotooɗo ngalu ngol e Afrik. Jaabir tawde jumle 2-3 pitiko e salpunde e fulfulde.',
};

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { messages, language = 'fr', systemPrompt: customPrompt } = body;
    const systemPrompt = customPrompt ?? LANG_PROMPTS[language] ?? LANG_PROMPTS['fr'];
    const reply = await mistralChat(messages, systemPrompt);
    return NextResponse.json({ success: true, data: { text: reply }, reply });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Erreur inconnue';
    return NextResponse.json({ success: false, error: message }, { status: 500 });
  }
}
