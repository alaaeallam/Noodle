import type { Config } from "tailwindcss";

const config = {
  darkMode: ["class"],
  content: [
    "./pages/**/*.{ts,tsx}",
    "./components/**/*.{ts,tsx}",
    "./app/**/*.{ts,tsx}",
    "./src/**/*.{ts,tsx}",
    "./lib/**/*.{ts,tsx}",
  ],
  // content: ["app/**/*.{ts,tsx}", "components/**/*.{ts,tsx}"],
  prefix: "",
  theme: {
    container: {
      center: true,
      padding: "2rem",
      screens: {
        "2xl": "1400px",
      },
    },

    extend: {
      transitionProperty: {
        // Customize or disable transition properties
        none: "none",
      },
      // BTB brand (same palette as the mobile apps): red accent, near-black
      // chrome/text, cream surfaces, warm grey borders. The stock template's
      // accent palettes (sky/blue) are remapped onto BTB red so links and
      // highlights follow the brand; green stays green for success states.
      colors: {
        "primary-color": "#FF1D02",
        "secondary-color": "#F4F2EF",
        "secondary-border-color": "#0A0A0A",
        btb: {
          red: "#FF1D02",
          "red-dark": "#E01800",
          black: "#0A0A0A",
          cream: "#F4F2EF",
          border: "#E4E1DD",
          grey: "#6B6B6B",
        },
        sky: {
          50: "#FFF1EF",
          100: "#FFE0DB",
          200: "#FFC2B8",
          300: "#FF9585",
          400: "#FF5A42",
          500: "#FF1D02",
          600: "#E01800",
          700: "#B81400",
          800: "#8F1000",
          900: "#6B0C00",
          950: "#3D0700",
        },
        blue: {
          50: "#FFF1EF",
          100: "#FFE0DB",
          200: "#FFC2B8",
          300: "#FF9585",
          400: "#FF5A42",
          500: "#FF1D02",
          600: "#E01800",
          700: "#B81400",
          800: "#8F1000",
          900: "#6B0C00",
          950: "#3D0700",
        },
      },
      width: {
        "custom-button": "110px",
        "app-bar-search-width": "408px",
      },
      height: {
        "custom-button": "45px",
      },
      fontSize: {
        "heading-1": "20px",
        "heading-2": "36px",
        "card-h1": "16px",
        "card-h2": "",
        "btn-h": "",
      },
      fontFamily: {
        sans: ["var(--font-archivo)", "Archivo", "system-ui", "sans-serif"],
        // `font-inter` is used all over the stock markup - point it at the
        // brand body face instead of an unloaded Inter.
        inter: ["var(--font-archivo)", "Archivo", "system-ui", "sans-serif"],
        display: ["var(--font-anton)", "Anton", "Impact", "sans-serif"],
      },
      // Square corners everywhere, like the mobile apps. `full` is kept for
      // genuinely round things (spinners, avatars, count badges).
      borderRadius: {
        none: "0",
        sm: "0",
        DEFAULT: "0",
        md: "0",
        lg: "0",
        xl: "0",
        "2xl": "0",
        "3xl": "0",
      },
      scale: {
        102: '1.02',
      },
    },
  },
  plugins: [require("tailwind-scrollbar")],
} satisfies Config;

export default config;
