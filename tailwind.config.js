/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        primary: '#00A3EE',
        secondary: '#0077BE',
        'taxi-yellow': '#FFD700',
      },
      fontFamily: {
        sans: ['Poppins', 'sans-serif'],
        heading: ['Poppins', 'sans-serif'],
        script: ['"Dancing Script"', 'cursive'],
      },
      screens: {
        'xs': '400px',
        // ...other breakpoints
      },
    },
  },
  plugins: [],
}
