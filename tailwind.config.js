/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        sage: {
          50: '#f6f7f4',
          100: '#e8ebe3',
          200: '#d3d9ca',
          300: '#b5c0a6',
          400: '#96a57f',
          500: '#7a8a62',
          600: '#5e6d4c',
          700: '#4b563e',
          800: '#3e4634',
          900: '#353c2e',
        },
        mint: {
          50: '#f0fdf6',
          100: '#dcfce9',
          200: '#bbf7d5',
          300: '#86efb8',
          400: '#4ade8c',
          500: '#22c566',
          600: '#16a34e',
          700: '#158041',
          800: '#166538',
          900: '#14532d',
        },
        olive: {
          50: '#f7faf3',
          100: '#ebf2e1',
          200: '#d7e5be',
          300: '#bbd192',
          400: '#9abd67',
          500: '#7ca34a',
          600: '#5f8239',
          700: '#4b662e',
          800: '#3e5228',
          900: '#364523',
        },
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', '-apple-system', 'sans-serif'],
      },
      boxShadow: {
        'soft': '0 2px 8px 0 rgba(0, 0, 0, 0.04), 0 4px 16px 0 rgba(0, 0, 0, 0.06)',
        'card': '0 1px 3px 0 rgba(0, 0, 0, 0.08), 0 4px 12px 0 rgba(0, 0, 0, 0.08)',
        'card-hover': '0 4px 12px 0 rgba(0, 0, 0, 0.12), 0 8px 24px 0 rgba(0, 0, 0, 0.12)',
      },
      animation: {
        'fade-in': 'fadeIn 0.3s ease-out',
        'slide-up': 'slideUp 0.4s ease-out',
        'scale-in': 'scaleIn 0.2s ease-out',
        'bounce-soft': 'bounceSoft 1s infinite',
      },
      keyframes: {
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        slideUp: {
          '0%': { opacity: '0', transform: 'translateY(10px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        scaleIn: {
          '0%': { opacity: '0', transform: 'scale(0.95)' },
          '100%': { opacity: '1', transform: 'scale(1)' },
        },
        bounceSoft: {
          '0%, 100%': { transform: 'translateY(0)' },
          '50%': { transform: 'translateY(-3px)' },
        },
      },
    },
  },
  plugins: [],
};
