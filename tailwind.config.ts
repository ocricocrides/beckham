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
        skeletonPulse: {
          '0%': { backgroundPosition: '200% 0' },
          '100%': { backgroundPosition: '-200% 0' },
        },
        // Letra entrando no texto que gira: sobe de baixo, desembaça e gira de leve até assentar.
        charIn: {
          '0%': { opacity: '0', transform: 'translateY(0.7em) rotate(6deg) scale(.9)', filter: 'blur(6px)' },
          '100%': { opacity: '1', transform: 'translateY(0) rotate(0) scale(1)', filter: 'blur(0)' },
        },
        // Título do player estilo Spotify: parado um tempo, desliza até o fim, para e volta (alternate).
        titleScroll: {
          '0%, 18%': { transform: 'translateX(0)' },
          '82%, 100%': { transform: 'translateX(var(--scroll-dist))' },
        },
        // Versão sem deslocamento pra quem pede menos movimento no sistema: só aparece e desembaça.
        charFade: {
          '0%': { opacity: '0', filter: 'blur(6px)' },
          '100%': { opacity: '1', filter: 'blur(0)' },
        },
        liveDot: {
          '0%, 100%': { opacity: '1', transform: 'scale(1)' },
          '50%': { opacity: '.35', transform: 'scale(.8)' },
        },
      },
      animation: {
        'logo-sway': 'logoSway 5s ease-in-out infinite',
        'fade-in': 'fadeIn .5s ease',
        'skeleton-pulse': 'skeletonPulse 1.4s ease-in-out infinite',
        'live-dot': 'liveDot 1.6s ease-in-out infinite',
      },
      transitionTimingFunction: {
        // Saída "expo": começa rápido e desacelera longo — dá a sensação macia em vez de seca.
        'out-expo': 'cubic-bezier(0.16, 1, 0.3, 1)',
        // Passa um pouquinho do ponto e volta (barras do gráfico, cards).
        spring: 'cubic-bezier(0.34, 1.56, 0.64, 1)',
      },
    },
  },
  plugins: [require('tailwindcss-animate')],
} satisfies Config;
