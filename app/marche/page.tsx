// ============================================================
// RIMA AI — Page Marché
// ============================================================
'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import BottomNav from '@/components/ui/BottomNav';

const PRICES = [
  { name: 'Mil', price: '150 FCFA/kg', icon: '🌾', trend: '+2%' },
  { name: 'Maïs', price: '120 FCFA/kg', icon: '🌽', trend: '-1%' },
  { name: 'Tomates', price: '200 FCFA/kg', icon: '🍅', trend: '+5%' },
  { name: 'Haricots', price: '280 FCFA/kg', icon: '🫘', trend: '+3%' },
  { name: 'Riz local', price: '350 FCFA/kg', icon: '🍚', trend: '0%' },
  { name: 'Ignames', price: '180 FCFA/kg', icon: '🥔', trend: '-2%' },
];

export default function MarchePage() {
  const router = useRouter();
  const [toast, setToast] = useState('');

  const showToast = (msg: string) => {
    setToast(msg);
    setTimeout(() => setToast(''), 3000);
  };

  return (
    <div className="rima-app">
      {/* Header */}
      <header className="rima-header">
        <div className="rima-header-left">
          <button
            onClick={() => router.push('/')}
            style={{ background: '#f3f4f6', border: 'none', borderRadius: '50%', width: 36, height: 36, display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' }}
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="#374151">
              <path d="M20 11H7.83l5.59-5.59L12 4l-8 8 8 8 1.41-1.41L7.83 13H20v-2z"/>
            </svg>
          </button>
          <div>
            <div className="rima-logo-title">🛒 Marché</div>
            <div className="rima-logo-sub">Prix du jour</div>
          </div>
        </div>
        <span style={{ background: '#fef3c7', color: '#d97706', fontSize: 11, fontWeight: 700, padding: '4px 10px', borderRadius: 20 }}>
          BIENTÔT
        </span>
      </header>

      <main style={{ paddingBottom: 80, padding: '0 0 80px 0' }}>
        {/* Hero bientôt disponible */}
        <div style={{ background: 'linear-gradient(135deg, #16a34a, #15803d)', margin: 16, borderRadius: 20, padding: 28, textAlign: 'center', color: 'white' }}>
          <div style={{ fontSize: 48, marginBottom: 12 }}>🛒</div>
          <h2 style={{ fontSize: 22, fontWeight: 800, marginBottom: 8 }}>Marché Vocal</h2>
          <p style={{ fontSize: 14, opacity: 0.9, lineHeight: 1.5, marginBottom: 16 }}>
            Consultez les prix du marché et vendez vos récoltes par la voix. Sans lire, sans écrire.
          </p>
          <div style={{ background: 'rgba(255,255,255,0.2)', borderRadius: 12, padding: '10px 16px', fontSize: 13, fontWeight: 600 }}>
            🚧 Lancement prévu — Phase 2
          </div>
        </div>

        {/* Prix aperçu */}
        <div style={{ padding: '0 16px' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 }}>
            <h3 style={{ fontSize: 15, fontWeight: 700, color: '#374151' }}>Aperçu des prix (simulation)</h3>
            <span style={{ fontSize: 11, color: '#9ca3af' }}>Dakar · Aujourd&apos;hui</span>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
            {PRICES.map((item) => (
              <div key={item.name} className="rima-card" style={{ padding: 14, opacity: 0.75 }}>
                <div style={{ fontSize: 28, marginBottom: 6 }}>{item.icon}</div>
                <div style={{ fontWeight: 700, fontSize: 14, color: '#374151' }}>{item.name}</div>
                <div style={{ fontWeight: 800, fontSize: 16, color: '#16a34a' }}>{item.price}</div>
                <div style={{ fontSize: 11, color: item.trend.startsWith('+') ? '#16a34a' : item.trend === '0%' ? '#9ca3af' : '#ef4444', marginTop: 2 }}>
                  {item.trend}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Alertes */}
        <div style={{ padding: '16px 16px 0' }}>
          <div className="rima-card" style={{ padding: 20 }}>
            <h4 style={{ fontWeight: 700, fontSize: 15, marginBottom: 8 }}>🔔 Alerte prix</h4>
            <p style={{ fontSize: 13, color: '#6b7280', marginBottom: 16, lineHeight: 1.5 }}>
              Recevez une alerte vocale quand les prix de vos produits changent.
            </p>
            <button
              onClick={() => showToast('✅ Alerte enregistrée ! Vous serez notifié au lancement.')}
              style={{ width: '100%', background: '#16a34a', color: 'white', border: 'none', borderRadius: 12, padding: '14px', fontSize: 15, fontWeight: 700, cursor: 'pointer' }}
            >
              🔔 Alertez-moi quand disponible
            </button>
          </div>
        </div>

        {/* Fonctionnalités à venir */}
        <div style={{ padding: '16px 16px 0' }}>
          <div className="rima-card" style={{ padding: 20 }}>
            <h4 style={{ fontWeight: 700, fontSize: 15, marginBottom: 12, color: '#374151' }}>🚀 Prochainement</h4>
            {[
              { icon: '🗣️', title: 'Vente vocale', desc: 'Annoncez vos récoltes par la voix' },
              { icon: '📍', title: 'Marchés locaux', desc: 'Trouvez les marchés les plus proches' },
              { icon: '💰', title: 'Mobile Money', desc: 'Paiements sans smartphone' },
              { icon: '📊', title: 'Tendances', desc: 'Meilleur moment pour vendre' },
            ].map(f => (
              <div key={f.title} style={{ display: 'flex', gap: 12, marginBottom: 14, alignItems: 'flex-start' }}>
                <span style={{ fontSize: 22 }}>{f.icon}</span>
                <div>
                  <div style={{ fontWeight: 600, fontSize: 13, color: '#374151' }}>{f.title}</div>
                  <div style={{ fontSize: 12, color: '#9ca3af' }}>{f.desc}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </main>

      {/* Toast */}
      {toast && (
        <div style={{ position: 'fixed', bottom: 90, left: '50%', transform: 'translateX(-50%)', background: '#1f2937', color: 'white', padding: '12px 20px', borderRadius: 12, fontSize: 14, fontWeight: 600, zIndex: 999, whiteSpace: 'nowrap', boxShadow: '0 4px 20px rgba(0,0,0,0.3)' }}>
          {toast}
        </div>
      )}

      <BottomNav />
    </div>
  );
}
