/** @type {import('tailwindcss').Config} */
module.exports = {
  // NOTE: Update this to include the paths to all of your component files.
  content: ['./app/**/*.{js,jsx,ts,tsx}', './components/**/*.{js,jsx,ts,tsx}'],
  presets: [require('nativewind/preset')],
  theme: {
    extend: {
      colors: {
        neutral: 'hsl(var(--neutral) / <alpha-value> )',
        'neutral-accent': 'hsl(var(--neutral-accent) / <alpha-value> )',
        'neutral-contrast': 'hsl(var(--neutral-contrast) / <alpha-value> )',
        primary: 'hsl(var(--primary) / <alpha-value> )',
        secondary: 'hsl(var(--secondary) / <alpha-value> )',
        tertiary: 'hsl(var(--tertiary) / <alpha-value> )',
      },
      textColor: {
        DEFAULT: 'hsl(var(--neutral-contrast) / <alpha-value> )',
      },
    },
  },
  plugins: [],
};
