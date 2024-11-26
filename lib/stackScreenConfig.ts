import { Colors } from '@/constants/theme';

export const getStackScreenOptions = (colors: Colors) => ({
  headerStyle: { backgroundColor: colors['--neutral-accent'] },
  headerTintColor: colors['--neutral-contrast'],
});
