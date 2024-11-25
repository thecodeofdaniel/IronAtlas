import { ReactNode, useState, createContext, useContext } from 'react';
import { View } from 'react-native';
import { colorScheme } from 'nativewind';

import { themes, tailwindThemes, Colors } from '../../constants/theme';

type ThemeContext = {
  themeName: string;
  isDark: boolean;
  colors: Colors;
  setTheme: () => void;
};

type ThemeContextProviderProps = {
  children: ReactNode;
};

type ThemeKeys = keyof typeof themes;

const ThemeContext = createContext<ThemeContext | null>(null);

export default function ThemeContextProvider({
  children,
}: ThemeContextProviderProps) {
  const [theme, setTheme] = useState<ThemeKeys>('light'); // Initialize with "light"

  function handleTheme() {
    setTheme((prevThemeName) => {
      if (prevThemeName === 'dark') {
        colorScheme.set('light');
        return 'light';
      } else {
        colorScheme.set('dark');
        return 'dark';
      }
    });
  }

  return (
    <ThemeContext.Provider
      value={{
        themeName: theme,
        isDark: themes[theme].isDark, // Determine if the theme is dark based on the selected theme
        colors: themes[theme].colors, // Access colors based on the selected theme
        setTheme: handleTheme,
      }}
    >
      <View style={tailwindThemes[theme]['colors']} className="flex-1">
        {children}
      </View>
    </ThemeContext.Provider>
  );
}

export function useThemeContext() {
  const context = useContext(ThemeContext);

  if (!context) {
    throw new Error(
      'useThemeContext must be used within a ThemeContextProvider',
    );
  }

  return context;
}
