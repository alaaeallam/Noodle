import type { Config } from 'tailwindcss';

const config = {
  darkMode: ['class'],
  content: [
    './pages/**/*.{ts,tsx}',
    './components/**/*.{ts,tsx}',
    './app/**/*.{ts,tsx}',
    './src/**/*.{ts,tsx}',
    './lib/**/*.{ts,tsx}',
  ],
  // content: ["app/**/*.{ts,tsx}", "components/**/*.{ts,tsx}"],
  prefix: '',
  theme: {
    container: {
      center: true,
      padding: '2rem',
      screens: {
        '2xl': '1400px',
      },
    },

    extend: {
      transitionProperty: {
        // Customize or disable transition properties
        none: 'none',
      },
      colors: {
        // BTB brand tokens (Between The Buns — mirrors apps/store colors.ts).
        // Token names are legacy from the Wasel theme: nile = brand red,
        // nile-deep = brand black, mango = red CTA. primary/secondary stay
        // equal since every usage pairs them with white text.
        'primary-color': '#FF1D02',
        'secondary-color': '#FF1D02',
        'secondary-border-color': '#111827',
        nile: '#FF1D02',
        'nile-deep': '#0A0A0A',
        'nile-tint': '#FFE8E5',
        mango: '#FF1D02',
        chili: '#E4572E',
        mint: '#2E9E6B',
        amber: '#D98E04',
        canvas: '#F4F2EF',
        paper: '#FFFFFF',
        ink: '#0A0A0A',
        smoke: '#6B6B6B',
        line: '#E4E1DD',
        'mint-tint': '#E7F4EE',
        'amber-tint': '#FBF1DC',
        'chili-tint': '#FCEAE3',
      },
      fontFamily: {
        display: ['var(--font-display)', 'sans-serif'],
        body: ['var(--font-body)', 'sans-serif'],
        mono: ['var(--font-mono)', 'monospace'],
        brand: ['var(--font-brand)', 'Impact', 'sans-serif'],
      },
      borderRadius: {
        card: '14px',
        btn: '10px',
      },
      width: {
        'custom-button': '110px',
        'app-bar-search-width': '408px',
      },
      height: {
        'custom-button': '45px',
      },
      fontSize: {
        'heading-1': '20px',
        'heading-2': '36px',
        'card-h1': '16px',
        'card-h2': '',
        'btn-h': '',
      },
    },
  },
  plugins: [],
} satisfies Config;

export default config;
