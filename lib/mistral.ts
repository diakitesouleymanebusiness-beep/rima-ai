const GROQ_API_BASE = 'https://api.groq.com/openai/v1';
const MODEL = 'qwen/qwen3.8-27b';

function getApiKey(): string {
  const key = process.env.GROQ_API_KEY;
  if (!key) throw new Error('GROQ_API_KEY manquante');
  return key;
}

export async function mistralChat(
  messages: { role: 'user' | 'assistant' | 'system'; content: string }[],
  systemPrompt?: string
): Promise<string> {
  const apiKey = getApiKey();
  const allMessages = [
    { role: 'system', content: systemPrompt ?? 'Tu es RIMA, un assistant vocal pour analphabetes en Afrique. Reponds en 2-3 phrases simples.' },
    ...messages.filter(m => m.role !== 'system').map(m => ({ role: m.role as string, content: m.content }))
  ];
  const res = await fetch(`${GROQ_API_BASE}/chat/completions`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${apiKey}` },
    body: JSON.stringify({ model: MODEL, max_tokens: 500, messages: allMessages })
  });
  if (!res.ok) { const err = await res.text(); throw new Error(`Groq error ${res.status}: ${err}`); }
  const data = await res.json();
  return (data.choices?.[0]?.message?.content as string) ?? '';
}

export async function mistralTTS(_text: string, _language = 'fr'): Promise<ArrayBuffer | null> { return null; }
export async function mistralSTT(_audioBlob: Blob, _language = 'fr'): Promise<string> { return ''; }
