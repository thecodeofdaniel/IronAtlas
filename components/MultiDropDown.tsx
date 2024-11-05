import React, { useMemo } from 'react';
import { StyleSheet, View } from 'react-native';
import { MultiSelect } from 'react-native-element-dropdown';
import { Ionicons } from '@expo/vector-icons';
import { useFilterExerciseStore } from '@/store/filterExercises/filterExercisesStore';
import { useExerciseStore } from '@/store/exercise/exerciseStore';
import { useTagStore } from '@/store/tag/tagStore';

// db stuff
import { db } from '@/db/instance';
import * as schema from '@/db/schema';
import { asc } from 'drizzle-orm';

export default function MultiSelectComponent() {
  const tagSet = useTagStore((state) => state.tagSet);
  const { selectedTags, setSelectedTags } = useFilterExerciseStore(
    (state) => state,
  );

  const tags = useMemo(() => {
    console.log('Run db function to get all tags');
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

  return (
    <View className="p-1">
      <MultiSelect
        style={styles.dropdown}
        placeholderStyle={styles.placeholderStyle}
        selectedTextStyle={styles.selectedTextStyle}
        inputSearchStyle={styles.inputSearchStyle}
        // iconStyle={styles.iconStyle}
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
          <Ionicons name={visible ? 'chevron-up' : 'chevron-down'} size={18} />
        )}
        // renderLeftIcon={() => (
        //   <AntDesign
        //     style={styles.icon}
        //     color="black"
        //     name="Safety"
        //     size={20}
        //   />
        // )}
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
  // iconStyle: {
  //   width: 20,
  //   height: 20,
  // },
  inputSearchStyle: {
    height: 40,
    fontSize: 16,
  },
  icon: {
    marginRight: 5,
  },
  selectedStyle: {
    borderRadius: 12,
    // backgroundColor: 'green',
    // padding: 0,
    // margin: 0,
  },
});
