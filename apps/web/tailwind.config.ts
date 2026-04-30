import type { Config } from "tailwindcss";
import tailwindcssAnimate from "tailwindcss-animate";



const config: Config = {

  darkMode: "class",

  content: [

    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",

    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",

    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",

  ],

  theme: {

    extend: {

      /* ── Forest Intelligence colour palette ─────────────────────────── */

      colors: {

        background: "var(--background)",
        foreground: "var(--foreground)",
        card: "var(--card)",
        "card-foreground": "var(--card-foreground)",
        popover: "var(--popover)",
        "popover-foreground": "var(--popover-foreground)",
        primary: {
          DEFAULT: "var(--primary)",
          foreground: "var(--primary-foreground)",
        },
        secondary: {
          DEFAULT: "var(--secondary)",
          foreground: "var(--secondary-foreground)",
        },
        muted: {
          DEFAULT: "var(--muted)",
          foreground: "var(--muted-foreground)",
        },
        accent: {
          DEFAULT: "var(--accent)",
          foreground: "var(--accent-foreground)",
        },
        destructive: "var(--destructive)",
        border: "var(--border)",
        input: "var(--input)",
        ring: "var(--ring)",
        chart: {
          "1": "var(--chart-1)",
          "2": "var(--chart-2)",
          "3": "var(--chart-3)",
          "4": "var(--chart-4)",
          "5": "var(--chart-5)",
        },
        sidebar: {
          DEFAULT: "var(--sidebar)",
          foreground: "var(--sidebar-foreground)",
          primary: "var(--sidebar-primary)",
          "primary-foreground": "var(--sidebar-primary-foreground)",
          accent: "var(--sidebar-accent)",
          "accent-foreground": "var(--sidebar-accent-foreground)",
          border: "var(--sidebar-border)",
          ring: "var(--sidebar-ring)",
        },

        fi: {

          /* Surfaces */

          surface:           "#131313",

          "surface-dim":     "#131313",

          "surface-bright":  "#393939",

          "container-lowest":"#0e0e0e",

          "container-low":   "#1c1b1b",

          container:         "#201f1f",

          "container-high":  "#2a2a2a",

          "container-highest":"#353534",



          /* Text */

          "on-surface":      "#e5e2e1",

          "on-surface-v":    "#c0c9bb",



          /* Borders */

          outline:           "#8a9386",

          "outline-v":       "#41493e",



          /* Primary green */

          primary:           "#91d78a",

          "on-primary":      "#003909",

          "primary-c":       "#1b5e20",

          "on-primary-c":    "#90d689",

          "primary-fixed":   "#acf4a4",

          "primary-fixed-d": "#91d78a",



          /* Secondary */

          secondary:         "#88d982",

          "secondary-c":     "#005b14",



          /* Tertiary */

          tertiary:          "#b1ceb2",

          "tertiary-c":      "#3e5842",



          /* Error */

          error:             "#ffb4ab",

          "error-c":         "#93000a",



          background:        "#131313",

        },

      },



      /* ── Typography ─────────────────────────────────────────────────── */

      fontFamily: {

        display: ["Manrope", "sans-serif"],

        body:    ["Inter", "sans-serif"],

        sans:    ["Inter", "sans-serif"],

      },

      fontSize: {

        "headline-xl": ["32px", { lineHeight: "40px", letterSpacing: "-0.02em", fontWeight: "700" }],

        "headline-lg": ["24px", { lineHeight: "32px", letterSpacing: "-0.01em", fontWeight: "600" }],

        "headline-md": ["20px", { lineHeight: "28px", fontWeight: "600" }],

        "body-lg":     ["16px", { lineHeight: "24px", fontWeight: "400" }],

        "body-md":     ["14px", { lineHeight: "20px", fontWeight: "400" }],

        "label-bold":  ["12px", { lineHeight: "16px", letterSpacing: "0.05em", fontWeight: "700" }],

        "stats":       ["40px", { lineHeight: "48px", fontWeight: "700" }],

      },



      /* ── Border radius ──────────────────────────────────────────────── */

      borderRadius: {

        sm:      "0.25rem",

        DEFAULT: "0.5rem",

        md:      "0.75rem",

        lg:      "1rem",

        xl:      "1.5rem",

        full:    "9999px",

      },



      /* ── Spacing (8px grid) ─────────────────────────────────────────── */

      spacing: {

        xs:     "4px",

        sm:     "12px",

        base:   "8px",

        gutter: "16px",

        // md, lg, xl covered by Tailwind defaults (6, 10, 16 = 24, 40, 64)

      },



      /* ── Shadows ────────────────────────────────────────────────────── */

      boxShadow: {

        "fi-card":   "0 1px 3px rgba(0,0,0,0.5), 0 1px 2px rgba(0,0,0,0.3)",

        "fi-modal":  "0 8px 16px rgba(0,0,0,0.6)",

        "fi-glow":   "0 0 24px rgba(145,215,138,0.15)",

        "fi-glow-lg":"0 0 48px rgba(145,215,138,0.12)",

      },



      /* ── Background radials ─────────────────────────────────────────── */

      backgroundImage: {

        "fi-grid":

          "linear-gradient(#41493e 1px, transparent 1px), linear-gradient(90deg, #41493e 1px, transparent 1px)",

        "fi-radial-green":

          "radial-gradient(circle at 50% 50%, rgba(27,94,32,0.25) 0%, transparent 70%)",

      },

      backgroundSize: {

        "fi-grid-64": "64px 64px",

        "fi-grid-32": "32px 32px",

      },



      /* ── Keyframes ──────────────────────────────────────────────────── */

      keyframes: {

        "fi-fade-in": {

          from: { opacity: "0", transform: "translateY(12px)" },

          to:   { opacity: "1", transform: "translateY(0)" },

        },

        "fi-slide-up": {

          from: { opacity: "0", transform: "translateY(24px)" },

          to:   { opacity: "1", transform: "translateY(0)" },

        },

        "fi-glow-pulse": {

          "0%, 100%": { boxShadow: "0 0 0 0 rgba(145,215,138,0)" },

          "50%":      { boxShadow: "0 0 16px 4px rgba(145,215,138,0.15)" },

        },

      },

      animation: {

        "fi-fade-in":   "fi-fade-in 0.5s ease both",

        "fi-slide-up":  "fi-slide-up 0.6s cubic-bezier(0.22,1,0.36,1) both",

        "fi-glow":      "fi-glow-pulse 2.5s ease-in-out infinite",

      },

    },

  },

  plugins: [tailwindcssAnimate],

};



export default config;

