/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './src/app/**/*.{js,ts,jsx,tsx}',
    './src/components/**/*.{js,ts,jsx,tsx}',
  ],
  theme: {
    extend: {
      colors: {
        primary: '#1e40af', // Deep blue
        secondary: '#0f172a', // Midnight black
        accent: '#38bdf8', // Light blue for highlights
      },
      fontFamily: {
        sans: ['Inter', 'sans-serif'], // Clean UI font
      },
      backgroundImage: {
        grid: "radial-gradient(circle at 1px 1px, #ffffff11 1px, transparent 0)",
      },
      boxShadow: {
        neon: '0 0 10px #38bdf8, 0 0 20px #38bdf8, 0 0 30px #38bdf8',
      },
      animation: {
        'fade-in': 'fadeIn 0.5s ease-out',
        'neon-flicker': 'neonFlicker 1.8s infinite ease-in-out',
        'dot-pulse': 'dotPulse 1s infinite ease-in-out',
        blink: 'blink 1s step-start infinite',
      },
      keyframes: {
        fadeIn: {
          '0%': { opacity: 0 },
          '100%': { opacity: 1 },
        },
        neonFlicker: {
          '0%': { boxShadow: '0 0 5px #38bdf8, 0 0 10px #38bdf8' },
          '5%': { boxShadow: '0 0 20px #38bdf8, 0 0 40px #38bdf8' },
          '10%': { boxShadow: '0 0 6px #38bdf8, 0 0 12px #38bdf8' },
          '15%': { boxShadow: '0 0 25px #38bdf8, 0 0 50px #38bdf8' },
          '20%': { boxShadow: '0 0 5px #38bdf8, 0 0 10px #38bdf8' },
          '25%': { boxShadow: '0 0 30px #38bdf8, 0 0 60px #38bdf8' },
          '30%, 100%': { boxShadow: '0 0 20px #38bdf8, 0 0 40px #38bdf8' },
        },
        dotPulse: {
          '0%': { transform: 'scale(1)', opacity: 1 },
          '50%': { transform: 'scale(1.5)', opacity: 0.5 },
          '100%': { transform: 'scale(1)', opacity: 1 },
        },
        blink: {
          '0%, 100%': { opacity: 1 },
          '50%': { opacity: 0 },
        },
      },
    },
  },
  plugins: [],
};
