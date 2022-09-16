/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./templates/**/*.twig"],
  theme: {
    extend: {
      animation: {
        'vertical': 'hover 2s ease-in-out infinite alternate-reverse both',
      },
      keyframes: {
        hover: {
          '0%': { transform: 'translateY(10px)' },
          '100%': { transform: 'translateY(-10px)'},
        }
      }
    },
  },
  plugins: [],
}
