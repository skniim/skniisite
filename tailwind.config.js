/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        retro: {
          black: "#0b0b14",
          purple: "#2d1b4e",
          pink: "#ff2a6d",
          cyan: "#05d9e8",
          blue: "#00567a",
          yellow: "#f9c80e",
        }
      },
      animation: {
        'scanline': 'scanline 8s linear infinite',
        'flicker': 'flicker 0.15s infinite',
        'glow': 'glow 2s ease-in-out infinite alternate',
      },
      keyframes: {
        scanline: {
          '0%': { transform: 'translateY(-100%)' },
          '100%': { transform: 'translateY(100%)' },
        },
        flicker: {
          '0%': { opacity: '0.97' },
          '5%': { opacity: '0.95' },
          '10%': { opacity: '0.9' },
          '15%': { opacity: '0.98' },
          '20%': { opacity: '0.92' },
          '100%': { opacity: '1' },
        },
        glow: {
          'from': { 'text-shadow': '0 0 10px #ff2a6d, 0 0 20px #ff2a6d' },
          'to': { 'text-shadow': '0 0 20px #05d9e8, 0 0 30px #05d9e8' },
        }
      }
    },
  },
  plugins: [],
}
