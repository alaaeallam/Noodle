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
        // Wasel brand tokens — primary-color/secondary-color kept as the
        // same value (nile) since every hardcoded usage pairs either with
        // white text; a lighter secondary tint would break that contrast.
        'primary-color': '#0D5C63',
        'secondary-color': '#0D5C63',
        'secondary-border-color': '#111827',
        nile: '#0D5C63',
        'nile-deep': '#083F45',
        'nile-tint': '#E7F0F0',
        mango: '#FFB238',
        chili: '#E4572E',
        mint: '#2E9E6B',
        amber: '#D98E04',
        canvas: '#F6F4EE',
        paper: '#FFFFFF',
        ink: '#1F2428',
        smoke: '#6A7178',
        line: '#E6E1D5',
        'mint-tint': '#E7F4EE',
        'amber-tint': '#FBF1DC',
        'chili-tint': '#FCEAE3',
      },
      fontFamily: {
        display: ['var(--font-display)', 'sans-serif'],
        body: ['var(--font-body)', 'sans-serif'],
        mono: ['var(--font-mono)', 'monospace'],
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
