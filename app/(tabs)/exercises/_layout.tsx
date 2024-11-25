import { Slot, Stack } from 'expo-router';
import { useThemeContext } from '@/store/context/themeContext';

export default function Layout() {
  const { colors } = useThemeContext();

  return (
    <Stack
      screenOptions={{
        headerStyle: { backgroundColor: colors['--neutral-accent'] },
        headerTintColor: colors['--neutral-contrast'],
      }}
    />
  );
}
