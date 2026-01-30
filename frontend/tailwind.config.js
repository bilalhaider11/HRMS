/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/**/*.{js,jsx,ts,tsx}",
  ],
  darkMode: 'class',
  theme: {
    extend: {
      fontFamily: {
        gilroy: ['Gilroy', 'sans-serif'],
        inter: ['Inter', 'sans-serif'],
        poppins: ['Poppins', 'sans-serif'],
        urbanist: ['Urbanist', 'sans-serif'],
      },
      backgroundColor: {
        'ryeo-blue-bg': '#3575d5',
        'blue-800': '#4267B2',
        'primary-900': '#259DA8',
      },
      colors: {
        'light-red': '#ff0000',
        'light-blue': '#3575d5',
        'white-600': "#FFFFFFB8",
        'black-600': "#292D3F",
        'light-black': '#2e2f3a',
        'black-500': '#5f5f67',
        'primary-900': '#259DA8',
        'border-light-color': " #FFFFFF21"
      }
    },
  },
  plugins: [],
}
