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
          50: '#ecfdf5',
          100: '#d1fae5',
          200: '#a7f3d0',
          300: '#6ee7b7',
          400: '#34d399',
          500: '#10b981',
          600: '#059669',
          700: '#047857',
          800: '#065f46',
          900: '#064e3b',
        },
        orange: {
          50: '#fff7ed',
          100: '#ffedd5',
          200: '#fed7aa',
          300: '#fdba74',
          400: '#fb923c',
          500: '#f97316',
          600: '#ea580c',
          700: '#c2410c',
          800: '#9a3412',
          900: '#7c2d12',
        },
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', '-apple-system', 'sans-serif'],
        mono: ['Fira Code', 'ui-monospace', 'monospace'],
      },
      typography: ({ theme }) => ({
        DEFAULT: {
          css: {
            '--tw-prose-body': theme('colors.gray[700]'),
            '--tw-prose-headings': theme('colors.gray[900]'),
            '--tw-prose-links': theme('colors.emerald[500]'),
            '--tw-prose-bold': theme('colors.gray[900]'),
            '--tw-prose-counters': theme('colors.emerald[500]'),
            '--tw-prose-bullets': theme('colors.emerald[500]'),
            '--tw-prose-hr': theme('colors.gray[100]'),
            '--tw-prose-quotes': theme('colors.gray[700]'),
            '--tw-prose-quote-borders': theme('colors.emerald[500]'),
            '--tw-prose-code': theme('colors.gray[800]'),
            '--tw-prose-pre-code': theme('colors.gray[100]'),
            '--tw-prose-pre-bg': theme('colors.gray[900]'),
            '--tw-prose-th-borders': theme('colors.gray[200]'),
            '--tw-prose-td-borders': theme('colors.gray[200]'),
            '--tw-prose-kbd': theme('colors.gray[900]'),
            '--tw-prose-kbd-shadows': 'none',
            maxWidth: '75ch',
            fontSize: '1.0625rem',
            lineHeight: '1.75',
            a: {
              textDecoration: 'none',
              fontWeight: '500',
              '&:hover': { textDecoration: 'underline' },
            },
            'h1, h2, h3, h4': {
              fontWeight: '700',
              letterSpacing: '-0.025em',
            },
            h2: {
              fontSize: '1.5rem',
              marginTop: '2.5rem',
              marginBottom: '1rem',
              paddingBottom: '0.5rem',
              borderBottom: `1px solid ${theme('colors.gray[100]')}`,
            },
            h3: {
              fontSize: '1.25rem',
              marginTop: '2rem',
              marginBottom: '0.75rem',
            },
            h4: {
              fontSize: '1.125rem',
              marginTop: '1.5rem',
              marginBottom: '0.5rem',
            },
            blockquote: {
              fontWeight: '400',
              fontStyle: 'normal',
              borderLeftColor: theme('colors.emerald[500]'),
              backgroundColor: 'rgba(16, 185, 129, 0.05)',
              borderTopRightRadius: '0.75rem',
              borderBottomRightRadius: '0.75rem',
              paddingTop: '0.25rem',
              paddingBottom: '0.25rem',
              paddingLeft: '1.5rem',
            },
            'code::before': { content: 'none' },
            'code::after': { content: 'none' },
            code: {
              backgroundColor: theme('colors.gray[100]'),
              padding: '0.125rem 0.375rem',
              borderRadius: '0.25rem',
              fontSize: '0.875rem',
              fontWeight: '400',
            },
            'li::marker': { color: theme('colors.emerald[500]') },
            img: {
              borderRadius: '0.75rem',
              boxShadow: `0 4px 6px -1px ${theme('colors.black / 0.1')}, 0 2px 4px -2px ${theme('colors.black / 0.1')}`,
            },
            hr: { borderColor: theme('colors.gray[100]') },
          },
        },
        invert: {
          css: {
            '--tw-prose-body': theme('colors.gray[300]'),
            '--tw-prose-headings': theme('colors.white'),
            '--tw-prose-links': theme('colors.emerald[400]'),
            '--tw-prose-bold': theme('colors.white'),
            '--tw-prose-counters': theme('colors.emerald[400]'),
            '--tw-prose-bullets': theme('colors.emerald[400]'),
            '--tw-prose-hr': theme('colors.gray[800]'),
            '--tw-prose-quotes': theme('colors.gray[300]'),
            '--tw-prose-quote-borders': theme('colors.emerald[500]'),
            '--tw-prose-code': theme('colors.gray[200]'),
            '--tw-prose-pre-code': theme('colors.gray[200]'),
            '--tw-prose-pre-bg': 'rgb(0 0 0 / 0.5)',
            '--tw-prose-th-borders': theme('colors.gray[700]'),
            '--tw-prose-td-borders': theme('colors.gray[700]'),
            '--tw-prose-kbd': theme('colors.white'),
            blockquote: {
              backgroundColor: 'rgba(16, 185, 129, 0.05)',
            },
            h2: {
              borderBottomColor: theme('colors.gray[800]'),
            },
            code: {
              backgroundColor: theme('colors.gray[800]'),
            },
            hr: { borderColor: theme('colors.gray[800]') },
          },
        },
      }),
      keyframes: {
        'fade-in': {
          '0%': { opacity: '0', transform: 'translateY(12px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        'fade-in-scale': {
          '0%': { opacity: '0', transform: 'scale(0.97)' },
          '100%': { opacity: '1', transform: 'scale(1)' },
        },
        shimmer: {
          '0%': { backgroundPosition: '-200% 0' },
          '100%': { backgroundPosition: '200% 0' },
        },
      },
      animation: {
        'fade-in': 'fade-in 0.5s ease-out forwards',
        'fade-in-scale': 'fade-in-scale 0.4s ease-out forwards',
        'shimmer': 'shimmer 2s infinite linear',
      },
    },
  },
  plugins: [
    require('@tailwindcss/typography'),
  ],
};
