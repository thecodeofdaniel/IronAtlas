import { useThemeContext } from '@/store/context/themeContext';
import { Slot, Stack } from 'expo-router';

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
