import React, { useMemo } from 'react';
import { StyleSheet, View } from 'react-native';
import { MultiSelect } from 'react-native-element-dropdown';
import { Ionicons } from '@expo/vector-icons';
import { useFilterExerciseStore } from '@/store/zustand/filterExercises/filterExercisesStore';
import { useExerciseStore } from '@/store/zustand/exercise/exerciseStore';
import { useTagStore } from '@/store/zustand/tag/tagStore';

// db stuff
import { db } from '@/db/instance';
import * as schema from '@/db/schema';
import { asc } from 'drizzle-orm';
import { useThemeContext } from '@/store/context/themeContext';

export default function MultiSelectComponent() {
  const { colors } = useThemeContext();
  const tagSet = useTagStore((state) => state.tagSet);
  const { selectedTags, setSelectedTags } = useFilterExerciseStore(
    (state) => state,
  );

  const tags = useMemo(() => {
    // console.log('Run db function to get all tags');
    return db
      .select({ label: schema.tag.label, value: schema.tag.id })
      .from(schema.tag)
      .orderBy(asc(schema.tag.label))
      .all()
      .map((tag) => ({
        ...tag,
        value: String(tag.value),
      }));
  }, [tagSet]);

  const textColor = colors['--neutral-contrast'];

  return (
    <View className="p-1">
      <MultiSelect
        style={styles.dropdown}
        placeholderStyle={[styles.placeholderStyle, { color: textColor }]}
        selectedTextStyle={styles.selectedTextStyle}
        inputSearchStyle={[
          styles.inputSearchStyle,
          { color: textColor, borderColor: textColor },
        ]}
        iconStyle={[styles.iconStyle]}
        containerStyle={{ backgroundColor: colors['--neutral'] }}
        activeColor={colors['--neutral-accent']}
        itemTextStyle={{ color: textColor }}
        search
        alwaysRenderSelectedItem
        data={tags}
        labelField="label"
        valueField="value"
        placeholder="Select tags to filter"
        searchPlaceholder="Search..."
        value={selectedTags}
        onChange={(newTags) => {
          setSelectedTags(newTags);
        }}
        renderRightIcon={(visible) => (
          <Ionicons
            name={visible ? 'chevron-up' : 'chevron-down'}
            size={18}
            color={textColor}
          />
        )}
        selectedStyle={styles.selectedStyle}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  dropdown: {
    height: 40,
    backgroundColor: 'transparent',
    borderBottomColor: 'gray',
    borderBottomWidth: 0.5,
  },
  placeholderStyle: {
    fontSize: 16,
  },
  selectedTextStyle: {
    fontSize: 14,
  },
  iconStyle: {
    width: 20,
    height: 20,
  },
  inputSearchStyle: {
    height: 40,
    fontSize: 16,
  },
  icon: {
    marginRight: 5,
  },
  selectedStyle: {
    borderRadius: 12,
    borderWidth: 1,
    padding: 0,
    margin: 0,
  },
});
