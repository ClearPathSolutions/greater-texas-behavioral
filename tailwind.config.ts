import type { Config } from 'tailwindcss';

const config: Config = {
  content: [
    './app/**/*.{ts,tsx}',
    './components/**/*.{ts,tsx}',
    './lib/**/*.{ts,tsx}',
  ],
  theme: {
    container: {
      center: true,
      padding: {
        DEFAULT: '1.25rem',
        sm: '1.5rem',
        lg: '2rem',
      },
      screens: {
        '2xl': '1200px',
      },
    },
    extend: {
      colors: {
        // Slate — primary brand (logo wordmark / Texas outline, #474F5D = 700)
        slate: {
          50: '#f3f4f6',
          100: '#e4e6ea',
          200: '#c9cdd5',
          300: '#a3aab6',
          400: '#77808f',
          500: '#5d6676',
          600: '#4f5868',
          700: '#474f5d',
          800: '#383f4b',
          900: '#2a303a',
          950: '#181c23',
        },
        // Tan — accent (logo speech bubbles, #B1AA97 = 400)
        tan: {
          50: '#faf8f4',
          100: '#f2efe7',
          200: '#e2ddd0',
          300: '#cdc7b6',
          400: '#b1aa97',
          500: '#968e79',
          600: '#7a735f',
          700: '#615b49',
          800: '#4d483a',
          900: '#3b372d',
        },
        // Warm neutral cream backgrounds
        cream: {
          50: '#fcfbf9',
          100: '#f8f6f1',
          200: '#f1eee6',
          300: '#e5e1d5',
        },
        ink: '#1f242c',
        muted: '#5c6370',
      },
      fontFamily: {
        sans: ['var(--font-inter)', 'system-ui', 'sans-serif'],
        display: ['var(--font-jakarta)', 'var(--font-inter)', 'system-ui', 'sans-serif'],
      },
      maxWidth: {
        content: '1200px',
        prose: '46rem',
      },
      borderRadius: {
        xl: '0.875rem',
        '2xl': '1.25rem',
        '3xl': '1.75rem',
      },
      boxShadow: {
        soft: '0 2px 8px -2px rgba(42, 48, 58, 0.08), 0 8px 24px -8px rgba(42, 48, 58, 0.10)',
        card: '0 1px 2px rgba(42,48,58,0.04), 0 12px 32px -12px rgba(42,48,58,0.16)',
        lift: '0 18px 48px -18px rgba(42,48,58,0.28)',
      },
      keyframes: {
        'fade-up': {
          '0%': { opacity: '0', transform: 'translateY(16px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        'fade-in': {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        'slide-down': {
          '0%': { opacity: '0', transform: 'translateY(-8px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
      },
      animation: {
        'fade-up': 'fade-up 0.6s cubic-bezier(0.16, 1, 0.3, 1) both',
        'fade-in': 'fade-in 0.5s ease both',
        'slide-down': 'slide-down 0.2s ease both',
      },
    },
  },
  plugins: [],
};

export default config;
