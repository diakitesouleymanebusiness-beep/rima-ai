import type { Config } from 'tailwindcss';

const config: Config = {
  content: [
    './pages/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
    './app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      // Palette nature/verte pour RIMA AI
      colors: {
        primary: {
          50:  '#f0fdf4',
          100: '#dcfce7',
          200: '#bbf7d0',
          300: '#86efac',
          400: '#4ade80',
          500: '#22c55e',  // vert principal
          600: '#16a34a',
          700: '#15803d',
          800: '#166534',
          900: '#14532d',
        },
        earth: {
          50:  '#fefce8',
          100: '#fef9c3',
          200: '#fef08a',
          300: '#fde047',
          400: '#facc15',  // jaune terre
          500: '#eab308',
          600: '#ca8a04',
          700: '#a16207',
          800: '#854d0e',
          900: '#713f12',
        },
        sky: {
          500: '#3b82f6',  // bleu ciel
          600: '#2563eb',
        },
      },
      // Animation de zoom pour l'éducation
      keyframes: {
        letterZoom: {
          '0%':   { transform: 'scale(1)', opacity: '0.7' },
          '50%':  { transform: 'scale(1.4)', opacity: '1' },
          '100%': { transform: 'scale(1)', opacity: '1' },
        },
        pulse_glow: {
          '0%, 100%': { boxShadow: '0 0 0 0 rgba(34,197,94,0.4)' },
          '50%':       { boxShadow: '0 0 0 20px rgba(34,197,94,0)' },
        },
        fadeInUp: {
          from: { opacity: '0', transform: 'translateY(20px)' },
          to:   { opacity: '1', transform: 'translateY(0)' },
        },
      },
      animation: {
        letterZoom:  'letterZoom 0.8s ease-in-out',
        pulseGlow:   'pulse_glow 1.5s infinite',
        fadeInUp:    'fadeInUp 0.4s ease-out',
      },
    },
  },
  plugins: [],
};

export default config;
