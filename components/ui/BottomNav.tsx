'use client';
import { useRouter, usePathname } from 'next/navigation';

const NAV_ITEMS = [
  { path: '/', label: 'Accueil', icon: (active: boolean) => (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="currentColor">
      <path d="M10 20v-6h4v6h5v-8h3L12 3 2 12h3v8z"/>
    </svg>
  )},
  { path: '/agriculture', label: 'Champs', icon: (active: boolean) => (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="currentColor">
      <path d="M17 8C8 10 5.9 16.17 3.82 21.34L5.71 22l1-2.3A4.49 4.49 0 0 0 8 20C19 20 22 3 22 3c-1 2-8 2-8 2z"/>
    </svg>
  )},
  { path: '/sante', label: 'Santé', icon: (active: boolean) => (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="currentColor">
      <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z"/>
    </svg>
  )},
  { path: '/marche', label: 'Marché', icon: (active: boolean) => (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="currentColor">
      <path d="M11 9H9V2H7v7H5V2H3v7c0 2.12 1.66 3.84 3.75 3.97V22h2.5v-9.03C11.34 12.84 13 11.12 13 9V2h-2v7zm5-3v8h2.5v8H21V2c-2.76 0-5 2.24-5 4z"/>
    </svg>
  )},
  { path: '/assistant', label: 'Aide', icon: (active: boolean) => (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="currentColor">
      <path d="M12 14c1.66 0 2.99-1.34 2.99-3L15 5c0-1.66-1.34-3-3-3S9 3.34 9 5v6c0 1.66 1.34 3 3 3zm5.3-3c0 3-2.54 5.1-5.3 5.1S6.7 14 6.7 11H5c0 3.41 2.72 6.23 6 6.72V21h2v-3.28c3.28-.48 6-3.3 6-6.72h-1.7z"/>
    </svg>
  )},
];

export default function BottomNav() {
  const router = useRouter();
  const pathname = usePathname();

  return (
    <nav className="rima-bottom-nav">
      {NAV_ITEMS.map(item => {
        const active = pathname === item.path;
        return (
          <button
            key={item.path}
            className={`nav-item${active ? ' nav-item-active' : ''}`}
            onClick={() => router.push(item.path)}
          >
            {item.icon(active)}
            <span>{item.label}</span>
          </button>
        );
      })}
    </nav>
  );
}
