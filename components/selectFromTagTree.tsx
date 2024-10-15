import { FlatList, TouchableOpacity, View, Text } from 'react-native';
import { getAllParentIds } from '@/utils/utils';
import clsx from 'clsx';

type SelectFromTagTreeProps = {
  tagMap: TagMap; // Accept itemMap as a prop
  tagChildren: number[]; // Accept item IDs as a prop
  level: number;
  selected: {
    chosen: number[];
    preSelected: Set<number>;
  };
  setSelected: React.Dispatch<
    React.SetStateAction<{
      chosen: number[];
      preSelected: Set<number>;
    }>
  >;
};

export default function SelectFromTagTree({
  tagMap,
  tagChildren,
  level = 0,
  selected,
  setSelected,
}: SelectFromTagTreeProps) {
  const RenderItem = ({ item }: { item: Tag }) => {
    return (
      <TouchableOpacity
        className={clsx('p-2 my-[1] bg-blue-800', {
          'opacity-20': selected.preSelected.has(item.id),
          'bg-red-500':
            selected.chosen.includes(item.id) ||
            selected.preSelected.has(item.id),
        })}
        disabled={selected.preSelected.has(item.id)}
        onPress={() =>
          setSelected((prev) => {
            // Determine if chosen id is already included in array
            const isAlreadySelected = prev.chosen.includes(item.id);
            let newChosenList: number[] = isAlreadySelected
              ? prev.chosen.filter((id) => id !== item.id) // remove from array
              : [...prev.chosen, item.id]; // add to array

            // Add preSelected ids to set according to chosen ids
            const preSelectedSet = new Set<number>();
            for (const chosen of newChosenList) {
              const parentIds = getAllParentIds(tagMap, chosen);
              parentIds.forEach((id) => preSelectedSet.add(id));
            }

            return {
              chosen: newChosenList,
              preSelected: preSelectedSet,
            };
          })
        }
      >
        {/* Tags and options */}
        <View className="flex flex-row items-center justify-between flex-1">
          <Text className="text-white">{item.label}</Text>
        </View>
      </TouchableOpacity>
    );
  };

  const tags = tagChildren.map((id) => tagMap[id]);

  return (
    <FlatList
      data={tags}
      keyExtractor={(item) => item.id.toString()}
      renderItem={({ item }) => {
        return (
          <View key={item.id} style={{ paddingLeft: 3 * level }}>
            <RenderItem item={item} />
            {item.children.length > 0 &&
              // prevents chosen id from showing children
              !selected.chosen.includes(item.id) && (
                <SelectFromTagTree
                  tagMap={tagMap}
                  tagChildren={item.children}
                  level={level + 1}
                  selected={selected}
                  setSelected={setSelected}
                />
              )}
          </View>
        );
      }}
    />
  );
}
