import React from 'react';
import { StyleSheet, View } from 'react-native';
import { MultiSelect } from 'react-native-element-dropdown';
import { Ionicons } from '@expo/vector-icons';

type MultiSelectProps = {
  tags: { label: string; value: string }[];
  selected: string[];
  setSelected: React.Dispatch<React.SetStateAction<string[]>>;
};

export default function MultiSelectComponent({
  tags,
  selected,
  setSelected,
}: MultiSelectProps) {
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
        value={selected}
        onChange={(item) => {
          setSelected(item);
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
