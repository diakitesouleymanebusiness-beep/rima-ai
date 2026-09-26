'use client';
import { useEffect } from 'react';
import { Language } from '@/types';

const COUNTRY_TO_LANG: Record<string, Language> = {
  SN: 'wo', ML: 'bm', GN: 'ff', BF: 'dyu', CI: 'dyu',
  NE: 'ha', NG: 'ha',
  TZ: 'sw', KE: 'sw', UG: 'sw', RW: 'sw',
  MA: 'ar', DZ: 'ar', TN: 'ar', LY: 'ar', EG: 'ar', MR: 'ar', SD: 'ar',
  GH: 'en', ZA: 'en', GB: 'en', US: 'en', CA: 'en', AU: 'en',
  FR: 'fr', BE: 'fr', CH: 'fr', CM: 'fr', CD: 'fr', TG: 'fr', BJ: 'fr',
};

export function useGeoLanguage(
  setLanguage: (lang: Language) => void,
  hasSavedPreference: boolean,
) {
  useEffect(() => {
    if (hasSavedPreference) return;
    const ctrl = new AbortController();
    fetch('https://ipapi.co/json/', { signal: ctrl.signal })
      .then(r => r.json())
      .then((d: { country_code?: string }) => {
        const lang = COUNTRY_TO_LANG[d.country_code ?? ''] ?? 'fr';
        setLanguage(lang);
      })
      .catch(() => {});
    return () => ctrl.abort();
  }, [setLanguage, hasSavedPreference]);
}
