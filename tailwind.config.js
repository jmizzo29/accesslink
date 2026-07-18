/** @type {import('tailwindcss').Config} */
export default {
  content: [
    './app/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        'access-primary': '#0066cc',
        'access-success': '#22c55e',
        'access-warning': '#f59e0b',
        'access-danger': '#ef4444',
        'access-dark': '#1f2937',
        'access-light': '#f9fafb',
      },
      fontFamily: {
        sans: ['system-ui', 'sans-serif'],
      },
    },
  },
  plugins: [],
};
