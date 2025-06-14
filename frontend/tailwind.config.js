/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: {
          DEFAULT: '#6C63FF',
          50: '#F0EFFF',
          100: '#E1DFFF',
          200: '#C3BFFF',
          300: '#A59FFF',
          400: '#877FFF',
          500: '#6C63FF',
          600: '#4A3FFF',
          700: '#281BFF',
          800: '#0600F6',
          900: '#0500C3',
        },
        secondary: {
          DEFAULT: '#FF6584',
          50: '#FFFFFF',
          100: '#FFFFFF',
          200: '#FFE5EA',
          300: '#FFBDC9',
          400: '#FF91A7',
          500: '#FF6584',
          600: '#FF3861',
          700: '#FF0B3E',
          800: '#DD001F',
          900: '#AA0018',
        },
        tech: {
          DEFAULT: '#00D1FF',
          50: '#E6FAFF',
          100: '#CCF5FF',
          200: '#99EBFF',
          300: '#66E0FF',
          400: '#33D6FF',
          500: '#00D1FF',
          600: '#00A7CC',
          700: '#007D99',
          800: '#005366',
          900: '#002933',
        },
        ethics: {
          DEFAULT: '#9C27B0',
          50: '#F3E5F5',
          100: '#E1BEE7',
          200: '#CE93D8',
          300: '#BA68C8',
          400: '#AB47BC',
          500: '#9C27B0',
          600: '#8E24AA',
          700: '#7B1FA2',
          800: '#6A1B9A',
          900: '#4A148C',
        },
        time: {
          DEFAULT: '#4CAF50',
          50: '#E8F5E9',
          100: '#C8E6C9',
          200: '#A5D6A7',
          300: '#81C784',
          400: '#66BB6A',
          500: '#4CAF50',
          600: '#43A047',
          700: '#388E3C',
          800: '#2E7D32',
          900: '#1B5E20',
        },
        dark: {
          DEFAULT: '#1A1A2E',
          50: '#E6E6EB',
          100: '#CDCDD8',
          200: '#9B9BB0',
          300: '#696988',
          400: '#373760',
          500: '#1A1A2E',
          600: '#16162A',
          700: '#131326',
          800: '#0F0F22',
          900: '#0C0C1E',
        },
      },
      fontFamily: {
        sans: ['Inter', 'sans-serif'],
        display: ['Orbitron', 'sans-serif'],
        mono: ['JetBrains Mono', 'monospace'],
      },
      boxShadow: {
        'neon': '0 0 5px theme("colors.primary.500"), 0 0 20px theme("colors.primary.500")',
        'neon-tech': '0 0 5px theme("colors.tech.500"), 0 0 20px theme("colors.tech.500")',
        'neon-ethics': '0 0 5px theme("colors.ethics.500"), 0 0 20px theme("colors.ethics.500")',
        'neon-time': '0 0 5px theme("colors.time.500"), 0 0 20px theme("colors.time.500")',
      },
      animation: {
        'pulse-slow': 'pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        'glow': 'glow 2s ease-in-out infinite alternate',
      },
      keyframes: {
        glow: {
          '0%': { boxShadow: '0 0 5px theme("colors.primary.500"), 0 0 10px theme("colors.primary.500")' },
          '100%': { boxShadow: '0 0 10px theme("colors.primary.500"), 0 0 20px theme("colors.primary.500")' },
        },
      },
    },
  },
  plugins: [],
}
