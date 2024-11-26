import { Slot, Stack } from 'expo-router';
import { useThemeContext } from '@/store/context/themeContext';
import { getStackScreenOptions } from '@/lib/stackScreenConfig';

export default function Layout() {
  const { colors } = useThemeContext();

  return (
    <Stack
      screenOptions={{
        ...getStackScreenOptions(colors),
      }}
    />
  );
}
