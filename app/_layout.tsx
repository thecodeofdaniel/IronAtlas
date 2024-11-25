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

  return <MigrateDB />;
}

function MigrateDB() {
  const { success, error } = useMigrations(db, migrations);

  if (error) {
    return (
      <View>
        <Text>Migration error: {error.message}</Text>
      </View>
    );
  }

  if (!success) {
    return (
      <View>
        <Text>Migration is in progress...</Text>
      </View>
    );
  }

  return <ThemeInit />;
}

function ThemeInit() {
  return (
    <ThemeContextProvider>
      <Init />
    </ThemeContextProvider>
  );
}

function Init() {
  // console.log('Init function');
  useDrizzleStudio(expoDb);
  useInitializeStores();

  const { isDark } = useThemeContext();

  return (
    <>
      <StatusBar style={isDark ? 'light' : 'dark'} />
      <ActionSheetProvider>
        <Stack>
          <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
          <Stack.Screen name="modal" options={{ presentation: 'modal' }} />
        </Stack>
      </ActionSheetProvider>
    </>
  );
}
