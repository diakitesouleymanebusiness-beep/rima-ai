// ============================================================
// RIMA AI — API Route : Analyse de plante
// POST /api/plant-analyze
// Body: { imageBase64: string, language?: string }
// Returns: { plantName, diseaseName, confidence, bioAdvice, source }
// ============================================================
import { NextRequest, NextResponse } from 'next/server';
import { mistralChat } from '@/lib/mistral';

// --- Plant.id API ---
async function analyzePlantId(imageBase64: string): Promise<{ name: string; disease: string; confidence: number } | null> {
  const key = process.env.PLANT_ID_API_KEY;
  if (!key) return null;

  const res = await fetch('https://api.plant.id/v2/identify', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', 'Api-Key': key },
    body: JSON.stringify({
      images: [imageBase64],
      plant_language: 'fr',
      plant_details: ['common_names', 'description'],
      disease_details: ['description', 'treatment'],
    }),
  });

  if (!res.ok) return null;
  const data = await res.json();

  const suggestion  = data.suggestions?.[0];
  const disease     = data.health_assessment?.diseases?.[0];
  if (!suggestion) return null;

  return {
    name:       suggestion.plant_name ?? 'Plante inconnue',
    disease:    disease?.name ?? 'Aucune maladie détectée',
    confidence: Math.round((suggestion.probability ?? 0) * 100),
  };
}

// --- PlantNet API (fallback) ---
async function analyzePlantNet(imageBase64: string): Promise<{ name: string; disease: string; confidence: number } | null> {
  const key = process.env.PLANTNET_API_KEY;
  if (!key) return null;

  // Convertir base64 en Blob
  const binary = Buffer.from(imageBase64.replace(/^data:image\/\w+;base64,/, ''), 'base64');
  const formData = new FormData();
  formData.append('images', new Blob([binary], { type: 'image/jpeg' }), 'plant.jpg');
  formData.append('organs', 'leaf');

  const res = await fetch(
    `https://my-api.plantnet.org/v2/identify/all?api-key=${key}&lang=fr&include-related-images=false`,
    { method: 'POST', body: formData }
  );
  if (!res.ok) return null;
  const data = await res.json();

  const result = data.results?.[0];
  if (!result) return null;

  return {
    name:       result.species?.commonNames?.[0] ?? result.species?.scientificName ?? 'Plante inconnue',
    disease:    'Analyse visuelle — consultez un agronome local',
    confidence: Math.round((result.score ?? 0) * 100),
  };
}

// --- Enrichissement BIO via Mistral ---
async function getBioAdvice(plantName: string, diseaseName: string, language: string): Promise<string> {
  const lang = language === 'ar' ? 'arabe' : language === 'en' ? 'anglais' : 'français';
  const prompt = `La plante "${plantName}" présente la maladie/problème "${diseaseName}".
Propose en ${lang} des solutions BIOLOGIQUES locales : compost, purin, rotation, plantes répulsives.
Évite les traitements chimiques sauf en dernier recours.
Réponds en 3 points maximum, de façon simple pour un agriculteur non lettré.`;

  return mistralChat([{ role: 'user', content: prompt }],
    'Tu es un expert en agriculture biologique africaine. Tes conseils sont simples, pratiques et adaptés aux ressources locales disponibles.');
}

export async function POST(req: NextRequest) {
  try {
    const { imageBase64, language = 'fr' } = await req.json();

    if (!imageBase64) {
      return NextResponse.json({ error: 'imageBase64 requis' }, { status: 400 });
    }

    // Essai Plant.id en priorité
    let result = await analyzePlantId(imageBase64);
    let source: 'plant.id' | 'plantnet' = 'plant.id';

    // Fallback PlantNet
    if (!result) {
      result = await analyzePlantNet(imageBase64);
      source = 'plantnet';
    }

    // Fallback générique si les deux APIs échouent
    if (!result) {
      result = { name: 'Plante non identifiée', disease: 'Analyse impossible', confidence: 0 };
    }

    // Enrichissement BIO via Mistral
    const bioAdvice = await getBioAdvice(result.name, result.disease, language);

    return NextResponse.json({
      success: true,
      data: {
        plantName:  result.name,
        diseaseName: result.disease,
        confidence: result.confidence,
        bioAdvice,
        source,
      },
    });
  } catch (err: any) {
    console.error('[API/plant-analyze]', err.message);
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}
