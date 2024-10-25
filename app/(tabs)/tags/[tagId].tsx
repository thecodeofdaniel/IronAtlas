import { useTagStoreWithSetter } from '@/store/tag/tagStore';
import { Stack, useLocalSearchParams } from 'expo-router';
import React, { useMemo } from 'react';
import { View, Text, FlatList } from 'react-native';

function getAllChildren(tagMap: TagMap, tagId: number): Tag[] {
  const tag = tagMap[tagId];

  if (!tag || !tag.children || tag.children.length === 0) {
    return [];
  }

  const children = tag.children.map((childId) => tagMap[childId]);
  const grandchildren = tag.children.flatMap((childId) =>
    getAllChildren(tagMap, childId)
  );

  return [...children, ...grandchildren];
}

export default function TagId() {
  const { tagId: id } = useLocalSearchParams<{ tagId: string }>();
  const { tagMap } = useTagStoreWithSetter();

  const currentTag = tagMap[+id];
  const allChildren = useMemo(() => getAllChildren(tagMap, +id), [tagMap, id]);

  return (
    <>
      <Stack.Screen
        options={{
          title: currentTag.label,
          headerBackTitle: 'Back',
        }}
      />
      <View>
        <Text>Current Tag: {currentTag.label}</Text>
        <Text>All Children:</Text>
        <FlatList
          data={allChildren}
          keyExtractor={(item) => item.id.toString()}
          renderItem={({ item }) => (
            <Text className="text-black">{item.label}</Text>
          )}
        />
      </View>
    </>
  );
}
