/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["web/themes/custom/portfolio/templates/**/*.twig", "./portfolio.theme"],
  theme: {
    screens:{
      'xs' : '360px',
      // => @media (min-width: 360px) { ... }

      'sm': '640px',
      // => @media (min-width: 640px) { ... }

      'md': '768px',
      // => @media (min-width: 768px) { ... }

      'lg': '1024px',
      // => @media (min-width: 1024px) { ... }

      'xl': '1280px',
      // => @media (min-width: 1280px) { ... }

      '2xl': '1536px',
      // => @media (min-width: 1536px) { ... }
    },
    extend: {
      colors: {
        'PHP': '#f55729',
        'CSS3': '#f5b52d',
        'HTML5': '#de0666',
        'JavaScript': '#46a8f5',
        'Sass': '#de0666',
        'Drupal': '#2c0fba',
      },
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
