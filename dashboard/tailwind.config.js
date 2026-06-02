/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        // Warm-light theme (inspired by Heights Church: cream / charcoal / taupe)
        background: "#FAF9F8", // page background (warm cream)
        surface: "#FFFFFF",    // cards / panels
        stone: "#F3F0EB",      // secondary warm panel (tabs track, soft fills)
        ink: "#171413",        // primary text (warm charcoal)
        muted: "#6F6862",      // secondary text
        line: "#E7E1D9",       // borders / hairlines
        primary: "#463A38",    // espresso-taupe (buttons, accents)
        accent: "#7A5C4E",     // warm accent (links, eyebrows)
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', '-apple-system', 'sans-serif'],
        display: ['"Cormorant Garamond"', 'Georgia', 'serif'],
      },
      animation: {
        'pulse-slow': 'pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite',
      }
    },
  },
  plugins: [],
}
