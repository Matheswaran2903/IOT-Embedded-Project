/** @type {import('tailwindcss').Config} */
// React-style blue palette (cyan #61dafb family) replaces the old purple/pink accents.
const reactBlue = {
  50: '#e8f9ff', 100: '#c9f1ff', 200: '#9ee7fe', 300: '#61dafb', 400: '#2fc0ee',
  450: '#1fb0e0', 500: '#149eca', 600: '#0b7fb0', 700: '#086690', 800: '#0a4f70', 900: '#0d3a54', 950: '#0a2540',
};
export default {
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        lab: { 950: '#0a2540', 900: '#0c3366', 800: '#0f4388', 700: '#1456a8' },
        violet: reactBlue, fuchsia: reactBlue, pink: reactBlue, indigo: reactBlue, purple: reactBlue,
      },
      fontFamily: { sans: ['Inter', 'system-ui', 'Segoe UI', 'Roboto', 'sans-serif'] },
    },
  },
  plugins: [],
};
