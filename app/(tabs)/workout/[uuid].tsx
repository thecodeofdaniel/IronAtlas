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
import Animated, {
  useAnimatedStyle,
  withTiming,
  useSharedValue,
  withSpring,
} from 'react-native-reanimated';

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

  // Create shared values for the animation
  const translateX = useSharedValue(0);
  const opacity = useSharedValue(1);

  // Watch for index changes
  useEffect(() => {
    if (index !== null) {
      // Reset position for new content
      // translateX.value = 100; // Start off-screen
      opacity.value = 0;

      // Animate in
      // translateX.value = withSpring(0);
      opacity.value = withTiming(1, { duration: 200 });
    }
  }, [index]);

  // Create animated style
  const animatedStyle = useAnimatedStyle(() => {
    return {
      // transform: [{ translateX: translateX.value }],
      opacity: opacity.value,
    };
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
      <Stack.Screen
        options={{
          title:
            isSuperset || isPartOfSuperset
              ? 'Superset'
              : exerciseMap[template[uuid_param].exerciseId!].label,
        }}
      />
      <GestureHandlerRootView
        style={{
          flex: 1,
          justifyContent: 'center',
          margin: 8,
        }}
      >
        <Animated.View style={animatedStyle}>
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
            <>
              <Text>Yo</Text>
              <SetsTable
                uuid={template[parentUUID].children[index]}
                title=""
                superSetLength={superSetLength}
                index={index}
                setIndex={setIndex}
              />
            </>
          )}
        </Animated.View>
      </GestureHandlerRootView>
    </>
  );
}
