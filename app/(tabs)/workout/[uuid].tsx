import { View, Text, Pressable } from 'react-native';
import React, { useEffect, useState } from 'react';
import { Stack, useLocalSearchParams, useRouter } from 'expo-router';
import { useWorkoutStore } from '@/store/workout/workoutStore';
import { useExerciseStore } from '@/store/exercise/exerciseStore';
import SetsTable from '@/components/SetsTable/SetsTable';
import {
  GestureHandlerRootView,
  ScrollView,
} from 'react-native-gesture-handler';
import CarouselComp from '@/components/Carousel';
import { Ionicons } from '@expo/vector-icons';

export default function Exercise() {
  const { uuid: uuid_param } = useLocalSearchParams<{ uuid: string }>();
  const router = useRouter();
  const { template } = useWorkoutStore((state) => state);
  const { exerciseMap } = useExerciseStore((state) => state);
  const parentUUID = template[uuid_param].parentId!;
  const superSetLength = template[parentUUID].children.length;

  const isSuperset = template[uuid_param].children.length > 0;
  const isPartOfSuperset = parentUUID !== '0';

  const [index, setIndex] = useState(() => {
    let rtn = null;

    if (isSuperset) {
      rtn = 0;
    }

    if (isPartOfSuperset) {
      const superSetIndex = template[parentUUID].children.indexOf(uuid_param);
      rtn = superSetIndex;
    }

    console.log('Rtn value', rtn);

    return rtn;
  });

  return (
    <>
      {/* <Stack.Screen
        options={{
          headerLeft: () => (
            <Pressable onPress={() => router.dismissAll()}>
              <Ionicons
                name="chevron-back"
                color="black"
                size={24}
                style={{
                  borderColor: 'black',
                  borderWidth: 2,
                }}
              />
            </Pressable>
          ),
        }}
      /> */}
      <GestureHandlerRootView
        style={{
          flex: 1,

          justifyContent: 'center',
          margin: 8,
        }}
      >
        {index === null && (
          <SetsTable
            uuid={uuid_param}
            title={''}
            superSetLength={0}
            index={null}
            setIndex={setIndex}
          />
        )}
        {/* Pressing the superset itself */}
        {index !== null && isSuperset && (
          <SetsTable
            uuid={template[uuid_param].children[index]}
            title=""
            superSetLength={template[uuid_param].children.length}
            index={index}
            setIndex={setIndex}
          />
        )}
        {/* Pressing part of the superset */}
        {index !== null && isPartOfSuperset && (
          <SetsTable
            uuid={template[parentUUID].children[index]}
            title=""
            superSetLength={superSetLength}
            index={index}
            setIndex={setIndex}
          />
        )}
      </GestureHandlerRootView>
    </>
  );
}
