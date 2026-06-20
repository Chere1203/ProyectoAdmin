/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      colors: {
        primary: '#1B4F72',
        secondary: '#2874A6',
        accent: '#F39C12',
      },
    },
  },
  plugins: [],
};
