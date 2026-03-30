/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
        mono: ['JetBrains Mono', 'monospace'],
      },
      animation: {
        'pulse-slow':  'pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        'pulse-ring':  'pulse-ring 2s ease-out infinite',
        'fade-up':     'fade-up 0.6s ease forwards',
        'fade-in':     'fade-in 0.4s ease forwards',
        'scale-in':    'scale-in 0.5s cubic-bezier(0.34,1.56,0.64,1) forwards',
        'shimmer':     'shimmer 2.5s ease-in-out infinite',
        'float':       'float 4s ease-in-out infinite',
        'bar-fill':    'bar-fill 1s cubic-bezier(0.34,1.2,0.64,1) forwards',
        'scan-line':   'scan-line 2s ease-in-out infinite',
        'orb-drift':   'orb-drift 20s ease-in-out infinite alternate',
      },
      keyframes: {
        'fade-up': {
          from: { opacity: '0', transform: 'translateY(24px)' },
          to:   { opacity: '1', transform: 'translateY(0)' },
        },
        'fade-in': {
          from: { opacity: '0' },
          to:   { opacity: '1' },
        },
        'scale-in': {
          from: { opacity: '0', transform: 'scale(0.92)' },
          to:   { opacity: '1', transform: 'scale(1)' },
        },
        'shimmer': {
          '0%':   { transform: 'translateX(-100%)' },
          '100%': { transform: 'translateX(400%)' },
        },
        'float': {
          '0%, 100%': { transform: 'translateY(0px)' },
          '50%':      { transform: 'translateY(-8px)' },
        },
        'bar-fill': {
          from: { transform: 'scaleY(0)' },
          to:   { transform: 'scaleY(1)' },
        },
        'pulse-ring': {
          '0%':   { transform: 'scale(0.8)', opacity: '1' },
          '100%': { transform: 'scale(2)',   opacity: '0' },
        },
        'scan-line': {
          '0%':   { transform: 'translateY(-100%)' },
          '100%': { transform: 'translateY(400%)' },
        },
        'orb-drift': {
          '0%':   { transform: 'translate(0, 0) scale(1)' },
          '33%':  { transform: 'translate(40px, -30px) scale(1.05)' },
          '66%':  { transform: 'translate(-20px, 50px) scale(0.95)' },
          '100%': { transform: 'translate(30px, 20px) scale(1.02)' },
        },
      },
      colors: {
        brand: {
          blue:   '#3b82f6',
          purple: '#8b5cf6',
          cyan:   '#06b6d4',
        },
      },
    },
  },
  plugins: [],
};
