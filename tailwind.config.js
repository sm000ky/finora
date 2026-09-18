/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  darkMode: 'class',
  theme: {
    extend: {
      fontFamily: {
        heading: ['"Fredoka"', 'sans-serif'],
        cute: ['"Baloo 2"', 'sans-serif'],
        body: ['"Nunito"', 'sans-serif'],
      },
      colors: {
        pastel: {
          pink: '#ff8bb7',
          rose: '#ff659f',
          lavender: '#b892ff',
          deepLav: '#8357eb',
          mint: '#5fe0b9',
          darkMint: '#179c78',
          peach: '#ffb570',
          amber: '#f59e0b',
          sky: '#7cd4fd',
          cream: '#fff9fd',
          darkBg: '#181424',
          darkCard: '#241c35',
          darkBorder: '#3d3056',
        }
      },
      animation: {
        'float': 'float 3s ease-in-out infinite',
        'wiggle': 'wiggle 1s ease-in-out infinite',
        'pulse-soft': 'pulse 2.5s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        'fadeIn': 'fadeIn 0.3s ease-out',
      },
      keyframes: {
        float: {
          '0%, 100%': { transform: 'translateY(0px)' },
          '50%': { transform: 'translateY(-6px)' },
        },
        wiggle: {
          '0%, 100%': { transform: 'rotate(-3deg)' },
          '50%': { transform: 'rotate(3deg)' },
        },
        fadeIn: {
          '0%': { opacity: '0', transform: 'scale(0.98)' },
          '100%': { opacity: '1', transform: 'scale(1)' },
        }
      }
    },
  },
  plugins: [],
}
