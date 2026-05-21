/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      fontFamily: {
        sans: ['Geist', 'system-ui', 'sans-serif'],
        display: ['Fraunces', 'Georgia', 'serif'],
        mono: ['Geist Mono', 'ui-monospace', 'monospace'],
      },
      colors: {
        // Paleta inspirada en arquitectura mediterránea:
        // verde oliva sobre crema, con acentos terracota.
        olive: {
          50: '#f6f7f2',
          100: '#e9ecdf',
          200: '#d3d9bf',
          300: '#b3bf94',
          400: '#94a571',
          500: '#778856',
          600: '#5d6c42',
          700: '#485436',
          800: '#3b442e',
          900: '#333a29',
          950: '#1a1f13',
        },
        cream: {
          50: '#fdfcf8',
          100: '#faf7ec',
          200: '#f3ecd2',
          300: '#ebdfb1',
          400: '#dfca88',
          500: '#d4b566',
        },
        clay: {
          400: '#d28560',
          500: '#c66a40',
          600: '#b25334',
          700: '#94422c',
        },
      },
      boxShadow: {
        soft: '0 1px 2px 0 rgba(26, 31, 19, 0.04), 0 1px 8px -1px rgba(26, 31, 19, 0.06)',
      },
    },
  },
  plugins: [],
};
