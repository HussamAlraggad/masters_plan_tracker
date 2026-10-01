import type { Config } from 'tailwindcss';

const config: Config = {
  darkMode: 'class',
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        glass: {
          light: 'rgba(255,255,255,0.08)',
          medium: 'rgba(255,255,255,0.12)',
          dark: 'rgba(255,255,255,0.04)',
          border: 'rgba(255,255,255,0.18)',
        },
        accent: {
          DEFAULT: '#06b6d4',
          hover: '#0891b2',
          glow: 'rgba(6,182,212,0.4)',
        },
        status: {
          pending: '#6b7280',
          registered: '#f59e0b',
          passed: '#10b981',
          failed: '#ef4444',
        },
      },
      backdropBlur: {
        glass: '16px',
        heavy: '24px',
      },
      animation: {
        float: 'float 6s ease-in-out infinite',
        orbit: 'orbit 20s linear infinite',
        'pulse-glow': 'pulse-glow 3s ease-in-out infinite',
      },
      keyframes: {
        float: {
          '0%, 100%': { transform: 'translateY(0)' },
          '50%': { transform: 'translateY(-8px)' },
        },
        orbit: {
          '0%': { transform: 'rotate(0deg) translateX(40px) rotate(0deg)' },
          '100%': { transform: 'rotate(360deg) translateX(40px) rotate(-360deg)' },
        },
        'pulse-glow': {
          '0%, 100%': { boxShadow: '0 0 20px rgba(6,182,212,0.2)' },
          '50%': { boxShadow: '0 0 40px rgba(6,182,212,0.5)' },
        },
      },
    },
  },
  plugins: [require('daisyui')],
  daisyui: {
    themes: [
      {
        dark: {
          primary: '#06b6d4',
          secondary: '#1e293b',
          accent: '#06b6d4',
          neutral: '#0f172a',
          'base-100': '#020617',
          info: '#06b6d4',
          success: '#10b981',
          warning: '#f59e0b',
          error: '#ef4444',
        },
      },
    ],
    darkTheme: 'dark',
    base: true,
    styled: true,
    utils: true,
    prefix: '',
    logs: false,
    themeRoot: ':root',
  },
};

export default config;