import {
  ReactNode,
  useState,
  createContext,
  useContext,
  useEffect,
} from 'react';
import { View } from 'react-native';
import { colorScheme } from 'nativewind';
import AsyncStorage from '@react-native-async-storage/async-storage';

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

const THEME_STORAGE_KEY = '@theme_preference';

export default function ThemeContextProvider({
  children,
}: ThemeContextProviderProps) {
  const [theme, setTheme] = useState<ThemeKeys>('light');

  // Load saved theme when app starts
  useEffect(() => {
    loadSavedTheme();
  }, []);

  // Load theme from AsyncStorage
  async function loadSavedTheme() {
    try {
      const savedTheme = await AsyncStorage.getItem(THEME_STORAGE_KEY);
      if (savedTheme && (savedTheme === 'light' || savedTheme === 'dark')) {
        setTheme(savedTheme);
        colorScheme.set(savedTheme);
      }
    } catch (error) {
      console.error('Error loading theme:', error);
    }
  }

  // Modified handleTheme to save preference
  async function handleTheme() {
    try {
      const newTheme = theme === 'dark' ? 'light' : 'dark';
      await AsyncStorage.setItem(THEME_STORAGE_KEY, newTheme);
      setTheme(newTheme);
      colorScheme.set(newTheme);
    } catch (error) {
      console.error('Error saving theme:', error);
    }
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
