/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./app/**/*.{js,jsx,ts,tsx}",
    "./src/**/*.{js,jsx,ts,tsx}"
  ],
  theme: {
    extend: {
      colors: {
        primary: {
          DEFAULT: '#1A9E5C',
          light: '#E8F7EF',
          dark: '#147D48',
        },
        text: {
          primary: '#1A1A1A',
          secondary: '#6B7280',
          muted: '#9CA3AF',
        },
        background: '#F8F8F8',
        card: '#FFFFFF',
        border: '#EEEEEE',
        sale: '#E53935',
      },
    },
  },
  plugins: [],
};
