/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        parchment:     '#f4efe4',
        cream:         '#ede6d3',
        'gold-border': '#a07828',
        'gold-light':  'rgba(160,120,40,0.25)',
        charcoal:      '#1c1508',
        taupe:         '#9a8a6a',
        'gold-shimmer':'#a07828',
        ivory:         '#f4efe4',
      },
      fontFamily: {
        display: ['"Cormorant Garamond"', 'serif'],
        body:    ['"EB Garamond"', 'serif'],
        ui:      ['"Josefin Sans"', 'sans-serif'],
      },
    },
  },
  plugins: [],
}
