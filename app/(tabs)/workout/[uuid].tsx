import { View, Text, Pressable } from 'react-native';
import React, { useEffect } from 'react';
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

  let title;
  let uuid;

  const exerciseId = template[uuid_param].exerciseId; // if null, then superset
  title = exerciseId ? exerciseMap[exerciseId].label : '';

  // useEffect(() => {
  //   if (!exerciseId)
  //     router.push({
  //       pathname: '/(tabs)/workout/[uuid]',
  //       params: { uuid: template[uuid].children[0] },
  //     });
  // }, []);

  // let title;
  // let childUUID;

  if (!exerciseId) {
    uuid = template[uuid_param].children[0];
    title = exerciseMap[template[uuid].exerciseId!].label;
  }

  return (
    <>
      <Stack.Screen
        // options={{
        //   title: title,
        // }}
        options={{
          // animation: !exerciseId ? 'fade' : 'default',
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
      />
      <GestureHandlerRootView
        style={{
          flex: 1,
          // borderColor: 'black',
          // borderWidth: 2,
          justifyContent: 'center',
          margin: 8,
        }}
      >
        {/* {exerciseId ? (
          <SetsTable title={title} uuid={uuid} />
        ) : (
          <CarouselComp uuids={template[uuid].children} />
        )} */}
        {/* <SetsTable uuid={uuid_param} title={title} /> */}
        {/* TODO: Pass in the index,  */}
        {exerciseId ? (
          <SetsTable uuid={uuid_param} title={title} />
        ) : (
          <SetsTable
            uuid={template[uuid_param].children[0]}
            title={
              exerciseMap[
                template[template[uuid_param].children[0]].exerciseId!
              ].label
            }
          />
        )}
      </GestureHandlerRootView>
    </>
  );
}
