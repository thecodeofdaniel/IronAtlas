import { useEffect } from 'react';
import { View, Text } from 'react-native';
import { Stack } from 'expo-router';
import { useFonts } from 'expo-font';
import 'react-native-reanimated';
import * as SplashScreen from 'expo-splash-screen';
import { StatusBar } from 'expo-status-bar';

// Drizzle Stuff
import { useDrizzleStudio } from 'expo-drizzle-studio-plugin';
import { useMigrations } from 'drizzle-orm/expo-sqlite/migrator';
import migrations from '@/db/drizzle/migrations';
import { ActionSheetProvider } from '@expo/react-native-action-sheet';

// Import the database instance
import { expoDb, db } from '@/db/instance';

// Init stores
import { useInitializeStores } from '@/hooks/useInitializeStores';

// NativeWind
import '../global.css';
import ThemeContextProvider, {
  useThemeContext,
} from '@/store/context/themeContext';
import ScreenLayoutWrapper from '@/components/ui/ScreenLayoutWrapper';
import TextContrast from '@/components/ui/TextContrast';

// Prevent the splash screen from auto-hiding before asset loading is complete.
SplashScreen.preventAutoHideAsync();

export default function RootLayout() {
  const [loaded] = useFonts({
    SpaceMono: require('../assets/fonts/SpaceMono-Regular.ttf'),
  });

  useEffect(() => {
    if (loaded) {
      SplashScreen.hideAsync();
    }
  }, [loaded]);

  if (!loaded) {
    return null;
  }

  return <ThemeInit />;
}

function ThemeInit() {
  return (
    <ThemeContextProvider>
      <MigrateDB />
    </ThemeContextProvider>
  );
}

function MigrateDB() {
  const { success, error } = useMigrations(db, migrations);

  if (error) {
    return (
      <ScreenLayoutWrapper className="items-center justify-center">
        <TextContrast>Migration error: {error.message}</TextContrast>
      </ScreenLayoutWrapper>
    );
  }

  if (!success) {
    return (
      <ScreenLayoutWrapper className="items-center justify-center">
        <TextContrast>Migration is in progress...</TextContrast>
      </ScreenLayoutWrapper>
    );
  }

  return <Init />;
}

function Init() {
  useDrizzleStudio(expoDb);
  useInitializeStores();

  const { colors, isDark } = useThemeContext();

  return (
    <>
      <StatusBar style={isDark ? 'light' : 'dark'} />
      <ActionSheetProvider>
        <Stack>
          <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
          <Stack.Screen
            name="modal"
            options={{
              presentation: 'modal',
              headerStyle: { backgroundColor: colors['--neutral-accent'] },
              headerTintColor: colors['--neutral-contrast'],
            }}
          />
        </Stack>
      </ActionSheetProvider>
    </>
  );
}
