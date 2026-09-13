import type { Config } from 'tailwindcss';

export default {
  darkMode: ['class'],
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        void: '#08090b',
        panel: '#0f1113',
        'panel-2': '#151719',
        brand: {
          DEFAULT: '#ff1633',
          deep: '#7a0012',
        },
        ink: {
          DEFAULT: '#f2f1ee',
          dim: '#9a9a9c',
        },
        line: 'rgba(255,22,51,0.18)',
      },
      fontFamily: {
        display: ['Orbitron', 'sans-serif'],
        body: ['Rajdhani', 'sans-serif'],
      },
      keyframes: {
        logoSway: {
          '0%, 100%': { transform: 'rotate(-2deg)' },
          '50%': { transform: 'rotate(2deg)' },
        },
        fadeIn: {
          from: { opacity: '0', transform: 'translateY(8px)' },
          to: { opacity: '1', transform: 'translateY(0)' },
        },
      },
      animation: {
        'logo-sway': 'logoSway 5s ease-in-out infinite',
        'fade-in': 'fadeIn .4s ease both',
      },
    },
  },
  plugins: [require('tailwindcss-animate')],
} satisfies Config;
