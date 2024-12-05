import React, { useState, useRef, useEffect } from 'react';
import DraggableFlatList, {
  RenderItemParams,
} from 'react-native-draggable-flatlist';
import { GestureHandlerRootView } from 'react-native-gesture-handler';

import { useWorkoutStore } from '@/store/workout/workoutStore';

import SetsTableHeader from './SetsTableHeader';
import SetTableRow from './SetsTableRow';
import SetsTableFooter from './SetsTableFooter';

type Props = {
  title: string;
  uuid: string;
  superSetLength: number;
  index: number | null;
  setIndex: React.Dispatch<React.SetStateAction<number | null>>;
};

export default function SetsTable({
  title,
  uuid,
  superSetLength,
  index,
  setIndex,
}: Props) {
  // console.log('Render SetsTable');
  const itemRefs = useRef(new Map());
  const { template, reorderSets, editSet } = useWorkoutStore((state) => state);

  const renderItem = (params: RenderItemParams<SettType>) => {
    const onPressDelete = () => {
      const newSets = template[uuid].sets.filter(
        (set) => set.key !== params.item.key,
      );
      reorderSets(uuid, newSets);
    };

    return (
      <SetTableRow
        {...params}
        itemRefs={itemRefs}
        uuid={uuid}
        editSet={editSet}
        onPressDelete={onPressDelete}
        setsLength={template[uuid].sets.length}
      />
    );
  };

  return (
    // <View>
    <GestureHandlerRootView
      style={{
        flex: 1,
        justifyContent: 'center',
      }}
    >
      <DraggableFlatList
        keyExtractor={(item) => item.key.toString()}
        data={template[uuid].sets}
        renderItem={renderItem}
        onDragEnd={({ data }) => {
          reorderSets(uuid, data);
        }}
        activationDistance={20}
        ListHeaderComponent={() => <SetsTableHeader uuid={uuid} />}
        ListFooterComponent={() => (
          <SetsTableFooter
            uuid={uuid}
            superSetLength={superSetLength}
            setIndex={setIndex}
            index={index}
          />
        )}
      />
    </GestureHandlerRootView>
    // </View>
  );
}
