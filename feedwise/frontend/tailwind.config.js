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
        display: ['Playfair Display', 'serif'],
      },
      colors: {
        background: '#FAF9F6', // Off-white/Ivory
        surface: '#FFFFFF', // Pure white
        surfaceHighlight: '#F3F0EA', // Light cream
        primary: '#047857', // Emerald-700
        primaryHover: '#065F46', // Emerald-800
        textBase: '#1F2937', // Charcoal (gray-800)
        textMuted: '#6B7280', // Gray-500
        accent: '#D4AF37', // Gold
        danger: '#DC2626', // Red-600
      },
      animation: {
        'fade-in': 'fadeIn 0.5s ease-out',
        'slide-up': 'slideUp 0.6s cubic-bezier(0.16, 1, 0.3, 1)',
        'pulse-slow': 'pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite',
      },
      keyframes: {
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        slideUp: {
          '0%': { transform: 'translateY(20px)', opacity: '0' },
          '100%': { transform: 'translateY(0)', opacity: '1' },
        }
      },
      boxShadow: {
        'elegant': '0 10px 40px -10px rgba(0,0,0,0.05), 0 1px 3px rgba(0,0,0,0.02)',
        'elegant-hover': '0 20px 40px -10px rgba(0,0,0,0.1), 0 1px 3px rgba(0,0,0,0.05)',
      }
    },
  },
  plugins: [],
}
