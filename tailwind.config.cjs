/** @type {import('tailwindcss').Config} */
module.exports = {
  darkMode: ['class'],
  content: [
    './audio/**/*.{ts,tsx}',
    './settings/**/*.{ts,tsx}',
    './swr/**/*.{ts,tsx}',
    './shared/**/*.{ts,tsx}'
  ],
  theme: {
    extend: {}
  },
  plugins: []
}

