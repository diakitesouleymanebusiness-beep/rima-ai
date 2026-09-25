// ============================================================
// RIMA AI — Client Claude (Anthropic) pour Chat + OCR
// Remplace Mistral — utilise l'API Messages d'Anthropic
// ============================================================

const ANTHROPIC_API_BASE = 'https://api.anthropic.com/v1';
const ANTHROPIC_VERSION  = '2023-06-01';
const MODEL              = 'claude-haiku-4-5-20251001'; // rapide et économique

function getApiKey(): string {
  const key = process.env.ANTHROPIC_API_KEY;
  if (!key) throw new Error('ANTHROPIC_API_KEY manquante dans les variables d\'environnement.');
  return key;
}

// --- Chat Completions ---
export async function mistralChat(
  messages: { role: 'user' | 'assistant' | 'system'; content: string }[],
  systemPrompt?: string
): Promise<string> {
  const apiKey = getApiKey();

  // Séparer le system prompt des messages utilisateur
  const filteredMessages = messages.filter(m => m.role !== 'system');

  const res = await fetch(`${ANTHROPIC_API_BASE}/messages`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'x-api-key': apiKey,
      'anthropic-version': ANTHROPIC_VERSION,
    },
    body: JSON.stringify({
      model: MODEL,
      max_tokens: 500,
      system: systemPrompt ?? 'Tu es RIMA, un assistant vocal bienveillant pour les personnes analphabètes en Afrique. Réponds toujours en 2-3 phrases courtes et simples.',
      messages: filteredMessages.map(m => ({
        role: m.role === 'assistant' ? 'assistant' : 'user',
        content: m.content,
      })),
    }),
  });

  if (!res.ok) {
    const err = await res.text();
    throw new Error(`Claude Chat error ${res.status}: ${err}`);
  }

  const data = await res.json();
  return data.content?.[0]?.text ?? '';
}

// --- Text-to-Speech : utilise l'API OpenAI TTS compatible via Vercel ---
// Fallback : retourne null → le frontend utilisera Web Speech API (gratuit)
export async function mistralTTS(_text: string, _language: string = 'fr'): Promise<ArrayBuffer | null> {
  // TTS géré côté client via Web Speech API (window.speechSynthesis)
  // Aucun appel API serveur nécessaire — gratuit et multilingue
  return null;
}

// --- Speech-to-Text : retourne null → frontend utilise Web Speech API ---
export async function mistralSTT(_audioBlob: Blob, _language: string = 'fr'): Promise<string> {
  // STT géré côté client via Web Speech API (window.SpeechRecognition)
  return '';
}
