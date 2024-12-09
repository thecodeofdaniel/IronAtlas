import { vars } from 'nativewind';

export type Colors = {
  '--neutral': string;
  '--neutral-contrast': string;
  '--neutral-accent': string;
  '--primary': string;
  '--secondary': string;
  '--tertiary': string;
};

type ThemeValues = {
  isDark: boolean;
  colors: Colors;
};

type Theme = {
  dark: ThemeValues;
  light: ThemeValues;
};

// hue, saturation, lightness
export const themes: Theme = {
  dark: {
    isDark: true,
    colors: {
      '--neutral': 'hsl(0, 0%, 16%)',
      '--neutral-accent': 'hsl(0, 0%, 8%)',
      '--neutral-contrast': 'hsl(0, 0%, 100%)',
      '--primary': 'hsl(0, 100%, 63%)',
      '--secondary': 'hsl(292, 41%, 60%)',
      '--tertiary': 'hsl(292, 82%, 21%)',
    },
  },
  light: {
    isDark: false,
    colors: {
      '--neutral': ' hsl(0, 0%, 100%)',
      '--neutral-accent': 'hsl(252, 7%, 82%)',
      '--neutral-contrast': 'hsl(0, 0%, 8%)',
      '--primary': 'hsl(0, 90%, 63%)',
      '--secondary': 'hsl(292, 82%, 30%)',
      '--tertiary': 'hsl(292, 41%, 60%)',
    },
  },
};

// Add this utility function
export function getHSLColor(hslString: string, opacity = 1): string {
  const values = extract(hslString);
  return `hsla(${values}, ${opacity})`;
}

// This will return the 3 values inside the hsl(x, x, x)
function extract(hslString: string): string {
  const match = hslString.match(/\d+, \d+%, \d+%/);
  return match![0];
}

// Function to create the themes object dynamically
function generateTailwindThemes() {
  const tailwindThemes: { [key: string]: any } = {};

  for (const themeName in themes) {
    const themeColors = themes[themeName as keyof Theme]['colors'];
    tailwindThemes[themeName] = {
      colors: vars({
        '--neutral': extract(themeColors['--neutral']),
        '--neutral-contrast': extract(themeColors['--neutral-contrast']),
        '--neutral-accent': extract(themeColors['--neutral-accent']),
        '--primary': extract(themeColors['--primary']),
        '--secondary': extract(themeColors['--secondary']),
        '--tertiary': extract(themeColors['--tertiary']),
      }),
    };
  }

  return tailwindThemes;
}

export const tailwindThemes = generateTailwindThemes();
