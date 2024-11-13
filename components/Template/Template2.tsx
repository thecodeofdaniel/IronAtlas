import { View } from 'react-native';
import React, { useRef } from 'react';
import DraggableFlatList, {
  RenderItemParams,
} from 'react-native-draggable-flatlist';
import { GestureHandlerRootView } from 'react-native-gesture-handler';

import { WorkoutStateFunctions } from '@/store/workout/workoutStore';
import { useExerciseStore } from '@/store/exercise/exerciseStore';

import RowItem from './RowItem';

type TemplateTreeProps = {
  templateMap: TemplateMap;
  actions: WorkoutStateFunctions;
  exerciseMap: ExerciseMap;
  templateChildren: string[];
  level: number;
};

function TemplateTree({
  templateMap,
  actions,
  exerciseMap,
  templateChildren,
  level,
}: TemplateTreeProps) {
  const RenderItem = (params: RenderItemParams<TemplateObj>) => {
    const itemRefs = useRef(new Map());
    return (
      <RowItem
        {...params}
        actions={actions}
        exerciseMap={exerciseMap}
        itemRefs={itemRefs}
      />
    );
  };

  const templateExercises = templateChildren.map((id) => templateMap[id]);

  return (
    <>
      <DraggableFlatList
        data={templateExercises}
        onDragEnd={({ data }) => actions.reorderTemplate(data)}
        keyExtractor={(item) => item.uuid}
        renderItem={(params) => {
          return (
            <View style={{ paddingLeft: 10 * level }}>
              <RenderItem {...params} />
              {params.item.children.length > 0 && (
                <TemplateTree
                  templateMap={templateMap}
                  actions={actions}
                  exerciseMap={exerciseMap}
                  templateChildren={params.item.children}
                  level={level + 1}
                />
              )}
            </View>
          );
        }}
      />
    </>
  );
}

type TemplateScreenProps = {
  template: TemplateMap;
  actions: WorkoutStateFunctions;
};

export default function TemplateScreen2({
  template,
  actions,
}: TemplateScreenProps) {
  const { exerciseMap } = useExerciseStore((state) => state);

  return (
    <>
      <GestureHandlerRootView
        style={{ borderColor: 'black', borderWidth: 1, flex: 1 }}
      >
        <TemplateTree
          templateMap={template}
          actions={actions}
          exerciseMap={exerciseMap}
          templateChildren={template[0].children}
          level={0}
        />
      </GestureHandlerRootView>
    </>
  );
}
