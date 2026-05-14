const path = require('path');

/** @type {import('tailwindcss').Config} */
module.exports = {
  darkMode: 'class',
  content: [
    path.join(__dirname, 'templates/**/*.html.twig'),
    path.join(__dirname, 'assets/js/*.js'),
    path.join(__dirname, '../../modules/custom/portfolio_calendar/**/*.html.twig'),
    path.join(__dirname, '../../modules/custom/portfolio_calendar/js/*.js'),
  ],
  theme: {
    extend: {
      colors: {
        emerald: {
          500: '#10b981',
          600: '#059669',
        },
        orange: {
          500: '#f97316',
          600: '#ea580c',
        },
      },
    },
  },
  plugins: [],
};
