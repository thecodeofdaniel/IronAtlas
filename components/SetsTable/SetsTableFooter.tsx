import React from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import MyButtonOpacity from '../ui/MyButtonOpacity';
import { useTemplateStore } from '@/store/zustand/template/templateStore';
import { useThemeContext } from '@/store/context/themeContext';
import VoiceButton from './VoiceButton';

const ARROW_ICON_SIZE = 24;

type Props = {
  uuid: string;
  superSetLength: number;
  index: number | null;
  setIndex: React.Dispatch<React.SetStateAction<number | null>>;
};

export default function SetsTableFooter({
  uuid,
  superSetLength,
  index,
  setIndex,
}: Props) {
  const addSet = useTemplateStore((state) => state.addSet);
  const { colors } = useThemeContext();

  return (
    <>
      <View className="flex flex-row items-center justify-center py-2">
        {index !== null && (
          <TouchableOpacity
            onPress={() =>
              setIndex((prev) => {
                const prevIndex = prev! - 1;
                if (prevIndex < 0) return superSetLength - 1;
                return prevIndex;
              })
            }
            className="px-4"
          >
            <Ionicons
              name="chevron-back"
              color={colors['--neutral-contrast']}
              size={ARROW_ICON_SIZE}
            />
          </TouchableOpacity>
        )}
        <View className="flex-1">
          <MyButtonOpacity onPress={() => addSet(uuid)} className="flex-1">
            <Text className="text-center text-xl font-medium text-white">
              Add set
            </Text>
          </MyButtonOpacity>
          <VoiceButton uuid={uuid} />
        </View>
        {index !== null && (
          <TouchableOpacity
            onPress={() =>
              setIndex((prev) => {
                const nextIndex = prev! + 1;
                if (nextIndex >= superSetLength) return 0;
                return nextIndex;
              })
            }
            className="px-4"
          >
            <Ionicons
              name="chevron-forward"
              size={ARROW_ICON_SIZE}
              color={colors['--neutral-contrast']}
            />
          </TouchableOpacity>
        )}
      </View>
      {index !== null && (
        <Text className="text-center font-medium text-neutral-contrast">
          {index + 1} of {superSetLength}
        </Text>
      )}
    </>
  );
}
