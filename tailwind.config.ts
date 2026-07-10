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
        // Deep forest / pine — primary brand
        forest: {
          50: '#f2f6f2',
          100: '#e0eae1',
          200: '#c1d5c4',
          300: '#98b89d',
          400: '#6b9472',
          500: '#4a7553',
          600: '#385d41',
          700: '#2c4a35',
          800: '#213a29',
          900: '#183024',
          950: '#0c2418',
        },
        // Sage — secondary / accents
        sage: {
          50: '#f4f7f3',
          100: '#e5ede3',
          200: '#cbd9c8',
          300: '#a6bfa1',
          400: '#7fa079',
          500: '#5f8259',
          600: '#4a6c46',
          700: '#3c5639',
          800: '#324630',
          900: '#2a3b29',
        },
        // Warm Texas gold — used sparingly
        gold: {
          50: '#fbf6ec',
          100: '#f4e6c9',
          200: '#e9cd93',
          300: '#deb35f',
          400: '#d29c3a',
          500: '#be8a3d',
          600: '#a1722f',
          700: '#815a2a',
          800: '#6a4a27',
          900: '#5a3f24',
        },
        // Warm neutral cream backgrounds
        cream: {
          50: '#fdfcf8',
          100: '#faf8f1',
          200: '#f4f1e7',
          300: '#ebe6d7',
        },
        ink: '#1c2620',
        muted: '#5a655c',
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
        soft: '0 2px 8px -2px rgba(24, 48, 36, 0.08), 0 8px 24px -8px rgba(24, 48, 36, 0.10)',
        card: '0 1px 2px rgba(24,48,36,0.04), 0 12px 32px -12px rgba(24,48,36,0.16)',
        lift: '0 18px 48px -18px rgba(24,48,36,0.28)',
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
