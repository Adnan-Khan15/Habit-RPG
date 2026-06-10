/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        bg: {
          primary: '#0f0f1a',
          card: '#1a1a2e',
          elevated: '#16213e',
        },
        accent: {
          gold: '#f5c842',
          purple: '#7c3aed',
          red: '#ef4444',
          green: '#22c55e',
        },
        text: {
          primary: '#f1f5f9',
          muted: '#64748b',
        },
        border: '#1e293b',
      },
      fontFamily: {
        display: ['Cinzel', 'serif'],
        body: ['Inter', 'sans-serif'],
        mono: ['JetBrains Mono', 'monospace'],
      },
      animation: {
        'float-up': 'floatUp 0.6s ease-out forwards',
        'scale-bounce': 'scaleBounce 0.3s ease-out',
        'fade-in': 'fadeIn 0.2s ease-out',
        'particle-burst': 'particleBurst 0.8s ease-out forwards',
      },
      keyframes: {
        floatUp: {
          '0%': { opacity: '1', transform: 'translateY(0) scale(1)' },
          '100%': { opacity: '0', transform: 'translateY(-40px) scale(1.2)' },
        },
        scaleBounce: {
          '0%': { transform: 'scale(1)' },
          '50%': { transform: 'scale(1.15)' },
          '100%': { transform: 'scale(1)' },
        },
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        particleBurst: {
          '0%': { transform: 'scale(0) rotate(0deg)', opacity: '1' },
          '100%': { transform: 'scale(2) rotate(180deg)', opacity: '0' },
        },
      },
    },
  },
  plugins: [],
};
