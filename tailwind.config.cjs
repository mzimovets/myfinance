const { heroui } = require('@heroui/react')

/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './index.html',
    './src/**/*.{js,ts,jsx,tsx}',
    './node_modules/@heroui/theme/dist/**/*.{js,ts,jsx,tsx}',
  ],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        brand: {
          50: '#f0f5ff',
          100: '#dfe9ff',
          200: '#c1d3ff',
          300: '#97b4ff',
          400: '#6a8cff',
          500: '#4361ee',
          600: '#3547d1',
          700: '#2b38a8',
          800: '#252f83',
          900: '#212a67',
        },
      },
      fontFamily: {
        sans: ['"Space Grotesk"', 'system-ui', 'sans-serif'],
      },
      borderRadius: {
        xl2: '1.25rem',
      },
    },
  },
  plugins: [
    heroui({
      themes: {
        light: {
          colors: {
            background: '#f6f7fb',
            primary: {
              DEFAULT: '#4361ee',
              foreground: '#ffffff',
            },
          },
        },
        dark: {
          colors: {
            background: '#0b0d14',
            primary: {
              DEFAULT: '#6a8cff',
              foreground: '#0b0d14',
            },
          },
        },
      },
    }),
  ],
}
