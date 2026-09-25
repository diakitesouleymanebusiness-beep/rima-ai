# 🎙️ RIMA AI — Application Vocale pour Analphabètes en Afrique

> **MVP pour le Mistral AI Accelerator Bootcamp 2026**  
> Co-organisé par French Tech Nairobi × Qhala Trust × Mistral AI

## 🌍 Description

RIMA AI est une interface vocale accessible aux personnes analphabètes en Afrique. Elle couvre :
- 🤖 **Assistant quotidien** — Contacts, appels, navigation, lecture de documents, traduction
- 🏥 **Santé** — Analyse vocale de symptômes avec orientation et conseils
- 🌾 **Agriculture** — Identification de maladies de plantes avec conseils BIO (Plant.id + Mistral)
- 📚 **Éducation** — Apprentissage des lettres avec feedback vocal et gamification
- 🎮 **Jeu participatif** — Collecte de traductions en langues africaines (couche phonétique IPA)

---

## 🚀 Installation & Démarrage rapide

### 1. Prérequis

- **Node.js** 18+ : https://nodejs.org/
- **Git** : https://git-scm.com/

### 2. Cloner et installer

```bash
git clone <votre-repo>
cd rima-ai
npm install
```

### 3. Configurer les clés API

Copiez le fichier d'environnement :

```bash
cp .env.local .env.local.backup
```

Ouvrez `.env.local` et remplissez vos clés :

```bash
# Mistral AI — OBLIGATOIRE (gratuit)
# https://console.mistral.ai/ → API Keys → Create new key
MISTRAL_API_KEY=sk-xxxxxxxxxxxxxxxxxxxxx

# Plant.id — Pour l'agriculture (100 analyses/jour gratuit)
# https://admin.kindwise.com/ → API Keys
PLANT_ID_API_KEY=xxxxxxxxxxxxxxxxxxxx

# PlantNet — Fallback agriculture (500 req/jour gratuit)
# https://my.plantnet.org/ → Mon compte → Clé API
PLANTNET_API_KEY=xxxxxxxxxxxxxxxxxxxx
```

### 4. Lancer en local

```bash
npm run dev
```

Ouvrez http://localhost:3000 dans votre navigateur.

---

## 🌐 Déploiement sur Vercel (gratuit, lien permanent)

### Méthode 1 — GitHub + Vercel (recommandée)

1. **Poussez votre code sur GitHub** :
   ```bash
   git init
   git add .
   git commit -m "feat: RIMA AI MVP"
   git remote add origin https://github.com/VOTRE_COMPTE/rima-ai.git
   git push -u origin main
   ```

2. **Connectez Vercel** :
   - Allez sur https://vercel.com/new
   - Cliquez **"Import Git Repository"**
   - Sélectionnez votre repo `rima-ai`

3. **Ajoutez les variables d'environnement** dans Vercel :
   - `Settings` → `Environment Variables`
   - Ajoutez : `MISTRAL_API_KEY`, `PLANT_ID_API_KEY`, `PLANTNET_API_KEY`

4. **Déployez** → Vercel vous donne un lien permanent : `rima-ai.vercel.app`

### Méthode 2 — Vercel CLI

```bash
npm install -g vercel
vercel login
vercel --prod
```

> ⚠️ **Note Vercel Hobby Plan** : Usage non commercial uniquement. Les bannières publicitaires dans l'app sont simulées (statiques), conformément aux règles Vercel.

---

## 🔑 Obtenir les clés API gratuitement

| Service | Lien | Limite gratuite |
|---------|------|-----------------|
| **Mistral AI** (TTS + STT + Chat) | https://console.mistral.ai/ | 1B tokens/mois |
| **Plant.id** | https://admin.kindwise.com/ | 100 analyses/jour |
| **PlantNet** | https://my.plantnet.org/ | 500 req/jour |

---

## 🏗️ Structure du projet

```
rima-ai/
├── app/
│   ├── page.tsx              # Accueil avec les 3 boutons principaux
│   ├── health/page.tsx       # 🏥 Santé — Analyse de symptômes
│   ├── agriculture/page.tsx  # 🌾 Agriculture — Analyse de plantes
│   ├── education/page.tsx    # 📚 Éducation — Apprentissage des lettres
│   ├── assistant/page.tsx    # 🤖 Assistant — Contacts, appels, etc.
│   ├── game/page.tsx         # 🎮 Jeu participatif — Collecte de langues
│   └── api/
│       ├── chat/route.ts     # POST /api/chat — Mistral Chat
│       ├── tts/route.ts      # POST /api/tts — Voxtral TTS
│       ├── stt/route.ts      # POST /api/stt — Voxtral STT
│       ├── plant-analyze/    # POST /api/plant-analyze — Plant.id + Mistral
│       └── ocr/route.ts      # POST /api/ocr — OCR documents
├── components/
│   ├── ui/                   # LoadingSpinner, AdBanner, ComingSoonButton…
│   ├── voice/                # VoiceRecorder, TextInput, SpeakButton
│   └── sections/             # MainNavButton
├── lib/
│   ├── mistral.ts            # Client Mistral AI (Chat, TTS, STT)
│   └── utils.ts              # Utilitaires (storage, speakText…)
├── types/index.ts            # Types TypeScript
├── .env.local                # Variables d'environnement (à remplir)
├── vercel.json               # Config déploiement Vercel
└── README.md                 # Ce fichier
```

---

## ✨ Fonctionnalités MVP

### ✅ Implémentées
- [x] Interface 100% vocale + mode texte fallback (démo PC)
- [x] Accueil personnalisé en 3 langues (FR, EN, AR)
- [x] **Santé** : Analyse de symptômes vocaux + conseils + urgences
- [x] **Agriculture** : Photo de plante → Plant.id/PlantNet → Conseil BIO (🌱 badge)
- [x] **Éducation** : Apprentissage lettres → zoom → vert/rouge → score
- [x] **Assistant** : Contacts vocaux/photo, appels, navigation, traduction
- [x] **Jeu participatif** : Collecte de langues africaines + couche phonétique IPA
- [x] Boutons "Coming Soon" pour toutes les autres fonctionnalités
- [x] Bannière publicitaire simulée (pas d'AdSense — règles Vercel Hobby)
- [x] Gamification : points locaux + classement simulé
- [x] Arabe RTL (droite à gauche)

### 🚀 Coming Soon
- [ ] GPS hôpitaux, RDV médecin
- [ ] Prix du marché, météo locale
- [ ] SMS vocal, calculatrice vocale
- [ ] Écriture, mathématiques de base
- [ ] Mobile Money rewards

---

## 🛠️ Stack technique

| Couche | Technologie |
|--------|-------------|
| Framework | Next.js 14 (App Router) |
| UI | Tailwind CSS |
| Langage | TypeScript |
| Chat IA | Mistral AI (`mistral-small-latest`) |
| TTS | Voxtral (`voxtral-mini-tts-2603`) |
| STT | Voxtral (`voxtral-mini-2602`) |
| Plantes | Plant.id v2 + PlantNet (fallback) |
| Déploiement | Vercel (Hobby, gratuit) |

---

## 📋 Concours

- **Mistral AI Accelerator Bootcamp 2026**
- Organisateurs : French Tech Nairobi × Qhala Trust
- Candidature : https://lnkd.in/eTDPdvzS

---

*RIMA AI — © 2026 — Souleymane Diakité*
