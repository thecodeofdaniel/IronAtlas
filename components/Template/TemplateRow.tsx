import React from 'react';
import { View } from 'react-native';
import { TemplateStateFunctions } from '@/store/zustand/template/templateStore';
import { Link } from 'expo-router';
import SwipeableItem, { OpenDirection } from 'react-native-swipeable-item';
import { ScaleDecorator } from 'react-native-draggable-flatlist';
import UnderlayLeft from './UnderLayLeft';
import SupersetOptions from './SupersetOptions';
import SupersetAddIcon from './SupersetAddIcon';
import MyButton from '@/components/ui/MyButton';
import { cn } from '@/lib/utils';
import TextContrast from '@/components/ui/TextContrast';

type Props = {
  drag: () => void;
  getIndex: () => number | undefined;
  isActive: boolean;
  item: TemplateObj;
  actions: TemplateStateFunctions;
  exerciseMap: ExerciseMap;
  itemRefs: React.MutableRefObject<Map<any, any>>;
};

export default function TemplateRow({
  drag,
  getIndex,
  isActive,
  item,
  actions,
  exerciseMap,
  itemRefs,
}: Props) {
  const isSuperset = item.exerciseId === null;

  return (
    <>
      <ScaleDecorator activeScale={1}>
        <SwipeableItem
          key={item.uuid}
          item={item}
          ref={(ref) => {
            if (ref && !itemRefs.current.get(item.uuid)) {
              itemRefs.current.set(item.uuid, ref);
            }
          }}
          onChange={({ openDirection }) => {
            if (openDirection !== OpenDirection.NONE) {
              [...itemRefs.current.entries()].forEach(([key, ref]) => {
                if (key !== item.uuid && ref) ref.close();
              });
            }
          }}
          overSwipe={20}
          snapPointsLeft={[100]}
          renderUnderlayLeft={() => (
            <UnderlayLeft
              drag={drag}
              onPressDelete={() => actions.deleteExercise(item.uuid)}
            />
          )}
        >
          <Link
            href={{
              pathname: '/(tabs)/workout/[uuid]',
              params: { uuid: item.uuid },
            }}
            asChild
          >
            <MyButton
              onLongPress={drag}
              disabled={isActive}
              className={cn('mb-[1] py-0 pl-2 pr-0', {
                'bg-blue-500': isActive,
              })}
            >
              <View className="flex flex-1 flex-row items-center justify-between">
                <TextContrast className="text-white">
                  {item.exerciseId === null
                    ? 'Superset'
                    : exerciseMap[item.exerciseId].label}
                </TextContrast>
                {isSuperset ? (
                  <SupersetOptions uuid={item.uuid} isSuperset={isSuperset} />
                ) : (
                  <SupersetAddIcon isSuperset={isSuperset} />
                )}
              </View>
            </MyButton>
          </Link>
        </SwipeableItem>
      </ScaleDecorator>
    </>
  );
}
