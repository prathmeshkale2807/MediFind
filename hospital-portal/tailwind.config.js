/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      colors: {
        primary: {
          50: '#EFF6FF',
          100: '#DBEAFE',
          500: '#3B82F6',
          600: '#2563EB',
          700: '#1D4ED8',
          900: '#1E3A8A',
        },
        available: {
          light: '#DCFCE7',
          DEFAULT: '#16A34A',
          dark: '#15803D',
        },
        occupied: {
          light: '#FEE2E2',
          DEFAULT: '#DC2626',
          dark: '#B91C1C',
        },
        ink: '#0F172A',
        muted: '#64748B',
      },
      fontFamily: {
        display: ['"Manrope"', 'sans-serif'],
        body: ['"Plus Jakarta Sans"', 'sans-serif'],
      },
      boxShadow: {
        card: '0 2px 10px rgba(15, 23, 42, 0.06)',
        'card-hover': '0 12px 30px rgba(37, 99, 235, 0.15)',
      },
      keyframes: {
        pulseLine: {
          '0%, 100%': { opacity: 0.3 },
          '50%': { opacity: 1 },
        },
      },
      animation: {
        pulseLine: 'pulseLine 2s ease-in-out infinite',
      },
    },
  },
  plugins: [],
}
