// ============================================================
// RIMA AI — Composant : Bannière publicitaire SIMULÉE
// (Pas de vrai AdSense — interdit sur le plan Hobby Vercel)
// ============================================================

export default function AdBanner() {
  return (
    <div className="w-full bg-gradient-to-r from-gray-100 to-gray-200 border border-dashed border-gray-400 rounded-xl p-3 flex items-center justify-center gap-3 mt-4 min-h-[60px]">
      {/* Icône simulée */}
      <div className="w-10 h-10 bg-gray-300 rounded-lg flex items-center justify-center flex-shrink-0">
        <span className="text-lg">📣</span>
      </div>
      <div className="text-center">
        <p className="text-xs font-semibold text-gray-500 uppercase tracking-widest">
          Espace Publicitaire
        </p>
        <p className="text-xs text-gray-400">
          Votre annonce ici — Soutenez RIMA AI
        </p>
      </div>
      <div className="w-10 h-10 bg-gray-300 rounded-lg flex items-center justify-center flex-shrink-0">
        <span className="text-lg">🌍</span>
      </div>
    </div>
  );
}
