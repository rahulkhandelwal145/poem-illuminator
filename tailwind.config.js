/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        parchment: '#faf6ee',
        cream: '#fffdf8',
        'gold-border': '#b8963e',
        'gold-light': '#d4af6a',
        charcoal: '#1a1208',
        taupe: '#7a6848',
        teal: '#1a5a5a',
        'gold-shimmer': '#c9a84c',
      },
      fontFamily: {
        display: ['"Cormorant Garamond"', 'serif'],
        body: ['"EB Garamond"', 'serif'],
        ui: ['"Josefin Sans"', 'sans-serif'],
      },
    },
  },
  plugins: [],
}
