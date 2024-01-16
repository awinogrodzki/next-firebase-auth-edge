/** @type {import('tailwindcss').Config} */
module.exports = {
  darkMode: 'class',
  content: [
    './components/**/*.{js,tsx}',
    './pages/**/*.{md,mdx}',
    './theme.config.{js,tsx}'
  ],
  theme: {
    extend: {
      fontSize: {
        '2xs': ['0.69rem', { lineHeight: '1' }],
        '5xl': ['3rem', { lineHeight: '1.2' }]
      },
      colors: {
        slate: {
          50: "#E1F8F9",
          100: "#C3F2F4",
          200: "#87E5E8",
          300: "#50D9DD",
          400: "#25BBC1",
          500: "#198185",
          600: "#0E4749",
          700: "#0B3638",
          800: "#072527",
          900: "#031111",
          950: "#020809"
        },
        gray: {
          50: "#E1F8F9",
          100: "#C3F2F4",
          200: "#87E5E8",
          300: "#50D9DD",
          400: "#25BBC1",
          500: "#198185",
          600: "#0E4749",
          700: "#0B3638",
          800: "#072527",
          900: "#031111",
          950: "#020809"
        },
        primary: '#B3F2DD'
      }
    },
    fontFamily: {
      sans: ['Inter', 'sans-serif'],
      mono: [
        'Monaco',
        'ui-monospace',
        'SFMono-Regular',
        'Menlo',
        'Consolas',
        'Liberation Mono',
        'Courier New',
        'monospace'
      ]
    }
  }
};
