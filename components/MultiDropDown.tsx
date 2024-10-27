// import React, { useState } from 'react';
// import { StyleSheet, View, TouchableOpacity, Text } from 'react-native';
// import { MultiSelect } from 'react-native-element-dropdown';
// import AntDesign from '@expo/vector-icons/AntDesign';
// import { ScrollView } from 'react-native-gesture-handler';

// const data = [
//   { label: 'Item 1', value: '1' },
//   { label: 'Item 2', value: '2' },
//   { label: 'Item 3', value: '3' },
//   { label: 'Item 4', value: '4' },
//   { label: 'Item 5', value: '5' },
//   { label: 'Item 6', value: '6' },
//   { label: 'Item 7', value: '7' },
//   { label: 'Item 8', value: '8' },
// ];

// export default function MultiDropDown() {
//   const [selected, setSelected] = useState([]);

//   // Render the list items
//   const renderItem = (item) => {
//     return (
//       <View style={styles.item} className="">
//         <Text style={styles.selectedTextStyle}>{item.label}</Text>
//         {/* <AntDesign style={styles.icon} color="black" name="Safety" size={20} /> */}
//       </View>
//     );
//   };

//   return (
//     <View className="border border-purple-500 flex flex-col justify-self-center">
//       {/* <ScrollView className="flex-1"> */}
//       <MultiSelect
//         style={styles.dropdown}
//         placeholderStyle={styles.placeholderStyle}
//         selectedTextStyle={styles.selectedTextStyle}
//         inputSearchStyle={styles.inputSearchStyle}
//         iconStyle={styles.iconStyle}
//         data={data}
//         labelField="label"
//         valueField="value"
//         placeholder="Select item"
//         value={selected}
//         search
//         searchPlaceholder="Search..."
//         onChange={(item) => {
//           setSelected(item);
//         }}
//         // itemContainerStyle={{backgroundColor: 'green'}}
//         // renderLeftIcon={() => (
//         //   <AntDesign
//         //     style={styles.icon}
//         //     color="black"
//         //     name="Safety"
//         //     size={20}
//         //   />
//         // )}
//         renderItem={renderItem}
//         renderSelectedItem={(item, unSelect) => (
//           <TouchableOpacity onPress={() => unSelect && unSelect(item)}>
//             <View
//               className="p-2 flex flex-row items-center shadow-lg bg-white ml-2"
//               style={styles.selectedStyle}
//             >
//               <Text style={styles.textSelectedStyle}>{item.label}</Text>
//               <AntDesign color="black" name="delete" size={17} />
//             </View>
//           </TouchableOpacity>
//         )}
//       />
//       {/* </ScrollView> */}
//     </View>
//   );
// }

// // export default MultiSelectComponent;

// const styles = StyleSheet.create({
//   // container: { padding: 16 },
//   dropdown: {
//     height: 50,
//     backgroundColor: 'white',
//     borderRadius: 12,
//     padding: 12,
//     shadowColor: '#000',
//     shadowOffset: {
//       width: 0,
//       height: 1,
//     },
//     shadowOpacity: 0.2,
//     shadowRadius: 1.41,
//     elevation: 2,
//     borderWidth: 1, // Width of the border
//     borderColor: '#0000ff', // Color of the border
//     // borderRadius: 5,
//   },
//   placeholderStyle: {
//     fontSize: 16,
//   },
//   selectedTextStyle: {
//     fontSize: 14,
//   },
//   iconStyle: {
//     width: 20,
//     height: 20,
//   },
//   inputSearchStyle: {
//     height: 40,
//     fontSize: 16,
//   },
//   icon: {
//     marginRight: 5,
//   },
//   // items in list
//   item: {
//     padding: 17,
//     flexDirection: 'row',
//     justifyContent: 'space-between',
//     alignItems: 'center',
//   },
//   selectedStyle: {
//     shadowColor: '#000',
//     shadowOffset: {
//       width: 0,
//       height: 1,
//     },
//     shadowOpacity: 0.2,
//     shadowRadius: 1.41,
//     elevation: 2,
//   },
//   textSelectedStyle: {
//     marginRight: 5,
//     fontSize: 16,
//   },
// });

import React, { useState } from 'react';
import { StyleSheet, View } from 'react-native';
import { MultiSelect } from 'react-native-element-dropdown';
import AntDesign from '@expo/vector-icons/AntDesign';
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
