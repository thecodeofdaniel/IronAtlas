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
    // colors: {
    //   '--neutral': ' hsl(254, 59%, 26%)',
    //   '--neutral-contrast': 'hsl(255, 40%, 96%)',
    //   '--neutral-accent': 'hsl(253, 61%, 19%)',
    //   '--primary': 'hsl(321, 70%, 69%)',
    //   '--secondary': 'hsl(197, 87%, 55%)',
    //   '--tertiary': 'hsl(48, 89%, 57%)',
    // },
    colors: {
      '--neutral': 'hsl(0, 0%, 16%)',
      '--neutral-contrast': 'hsl(0, 0%, 100%)',
      '--neutral-accent': 'hsl(0, 0%, 8%)',
      '--primary': 'hsl(16, 100%, 40%)',
      '--secondary': 'hsl(354, 61%, 22%)',
      '--tertiary': 'hsl(48, 89%, 57%)',
    },
  },
  light: {
    isDark: false,
    colors: {
      '--neutral': ' hsl(0, 0%, 90%)',
      '--neutral-contrast': 'hsl(280, 46%, 14%)',
      '--neutral-accent': 'hsl(219, 14%, 83%)',
      '--primary': 'hsl(183, 47%, 59%)',
      '--secondary': 'hsl(338, 71%, 78%)',
      '--tertiary': 'hsl(39, 84%, 45%)',
    },
  },
};

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
