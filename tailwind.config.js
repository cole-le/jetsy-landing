/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        sans: ['Inter', 'sans-serif'],
      },
      colors: {
        background: '#F9F9F9',
        accent: '#111827',
        buttonPrimary: '#111827',
        buttonHover: '#000000',
        text: '#111827',
        mutedText: '#6B7280',
        gradient: {
          light: '#F4F4F4',
          blue: '#D1DDFE',
          coral: '#F8A9A5',
        },
      },
      animation: {
        'gradient': 'gradient 8s ease infinite',
        'fade-in': 'fadeIn 0.5s ease-in-out',
        'slide-up': 'slideUp 0.3s ease-out',
        'float': 'float 3s ease-in-out infinite',
        'shine': 'shine 3.5s linear infinite',
        'rainbow-spin': 'rainbowSpin 14s linear infinite',
      },
      keyframes: {
        gradient: {
          '0%, 100%': {
            'background-size': '200% 200%',
            'background-position': 'left center'
          },
          '50%': {
            'background-size': '200% 200%',
            'background-position': 'right center'
          },
        },
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        slideUp: {
          '0%': { transform: 'translateY(10px)', opacity: '0' },
          '100%': { transform: 'translateY(0)', opacity: '1' },
        },
        float: {
          '0%, 100%': { transform: 'translateY(0px)' },
          '50%': { transform: 'translateY(-10px)' },
        },
        shine: {
          '0%': { 'background-position': '0% 0' },
          '100%': { 'background-position': '200% 0' },
        },
        rainbowSpin: {
          '0%': { '--tw-gradient-angle': '0deg' },
          '100%': { '--tw-gradient-angle': '360deg' },
        },
      },
      backgroundImage: {
        'radial-gradient': 'radial-gradient(circle at center, white 0%, #F9F9F9 100%)',
        'lovable-gradient': 'radial-gradient(circle at 50% 85%, #F4F4F4 0%, #E8F2FF 15%, #D1DDFE 30%, #E8D8FF 50%, #F8A9A5 70%, #FFB3B3 85%, #FFE5E5 100%)',
      },
    },
  },
  plugins: [],
} 