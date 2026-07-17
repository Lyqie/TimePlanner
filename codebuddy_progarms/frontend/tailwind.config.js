import tailwindcssAnimate from 'tailwindcss-animate';

/** @type {import('tailwindcss').Config} */
export default {
  darkMode: 'class',
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      fontFamily: {
        sans: ['Poppins', 'ui-sans-serif', 'system-ui', 'sans-serif'],
      },
      colors: {
        primary: {
          DEFAULT: '#6366F1',
          500: '#8B5CF6',
          400: '#A855F7',
        },
        ink: {
          DEFAULT: '#1E293B',
          soft: '#64748B',
          light: '#F1F5F9',
        },
      },
      boxShadow: {
        glow: '0 10px 40px -10px rgba(99,102,241,0.45)',
        card: '0 8px 30px -12px rgba(15,23,42,0.18)',
      },
      keyframes: {
        breathe: {
          '0%,100%': { transform: 'scale(1)', opacity: '0.85' },
          '50%': { transform: 'scale(1.04)', opacity: '1' },
        },
        floatUp: {
          '0%': { opacity: '0', transform: 'translateY(10px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
      },
      animation: {
        breathe: 'breathe 4s ease-in-out infinite',
        floatUp: 'floatUp 0.35s ease-out both',
      },
    },
  },
  plugins: [tailwindcssAnimate],
};
