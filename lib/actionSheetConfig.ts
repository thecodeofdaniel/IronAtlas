import { ActionSheetOptions } from '@expo/react-native-action-sheet';
import { Colors } from '@/constants/theme';

export const getActionSheetStyle = (
  colors: Colors,
): Partial<ActionSheetOptions> => {
  return {
    containerStyle: {
      backgroundColor: colors['--neutral'],
    },
    textStyle: {
      color: colors['--neutral-contrast'],
    },
    titleTextStyle: {
      color: colors['--neutral-contrast'],
      opacity: 0.7,
      fontWeight: 'bold',
    },
    messageTextStyle: { color: colors['--neutral-contrast'], opacity: 0.6 },
  };
};
