import { Pressable, Text, View } from 'react-native';
import React, { useEffect, useState } from 'react';
import { Link, Stack, useLocalSearchParams } from 'expo-router';
import { useWorkoutStore } from '@/store/workout/workoutStore';
import { useExerciseStore } from '@/store/exercise/exerciseStore';
import SetsTable from '@/components/SetsTable/SetsTable';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import Animated, {
  useAnimatedStyle,
  withTiming,
  useSharedValue,
} from 'react-native-reanimated';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import ExerciseHistory from '@/components/ExerciseHistory';

export default function Exercise() {
  // console.log('Render Exercise');
  const { uuid: uuid_param } = useLocalSearchParams<{ uuid: string }>();
  const { template } = useWorkoutStore((state) => state);
  const { exerciseMap } = useExerciseStore((state) => state);

  const router = useRouter();

  const parentUUID = template[uuid_param].parentId!;
  const isSuperset = template[uuid_param].children.length > 0;
  const isPartOfSuperset = parentUUID !== '0';

  const [index, setIndex] = useState(() => {
    if (isSuperset) return 0;

    if (isPartOfSuperset)
      return template[parentUUID].children.indexOf(uuid_param);

    return null;
  });

  // Create shared values for the animation
  const opacity = useSharedValue(1);

  // Watch for index changes
  useEffect(() => {
    if (index !== null) {
      opacity.value = 0;
      opacity.value = withTiming(1, { duration: 200 });
    }
  }, [index]);

  // Create animated style
  const animatedStyle = useAnimatedStyle(() => {
    return {
      opacity: opacity.value,
    };
  });

  let uuid = uuid_param;

  if (index === null) {
    uuid = uuid_param;
  } else if (index !== null && isSuperset) {
    uuid = template[uuid_param].children[index];
  } else if (index !== null && isPartOfSuperset) {
    uuid = template[parentUUID].children[index];
  }

  // console.log('Current uuid:', uuid);

  return (
    <>
      <Stack.Screen
        options={{
          title:
            isSuperset || isPartOfSuperset
              ? 'Superset'
              : exerciseMap[template[uuid_param].exerciseId!].label,
          headerBackVisible: true,
          headerBackTitle: 'Back',
          headerLeft: (props) =>
            props.canGoBack && (
              <Pressable onPress={() => router.push('../')}></Pressable>
            ),
        }}
      />
      <GestureHandlerRootView
        style={{
          flex: 1,
          // padding: 8,
          justifyContent: 'center',
          borderColor: 'blue',
          borderWidth: 10,
          height: '100%',
        }}
      >
        <Animated.View
          style={animatedStyle}
          className="flex h-full flex-col justify-between"
        >
          <View></View>
          {index === null && (
            <View className="flex flex-1 flex-col justify-center border">
              <SetsTable
                uuid={uuid}
                title={''}
                superSetLength={0}
                index={null}
                setIndex={setIndex}
              />
            </View>
          )}
          {/* Pressing the superset itself */}
          {index !== null && isSuperset && (
            <SetsTable
              uuid={uuid}
              title=""
              superSetLength={template[uuid_param].children.length}
              index={index}
              setIndex={setIndex}
            />
          )}
          {/* Pressing part of the superset */}
          {index !== null && isPartOfSuperset && (
            <SetsTable
              uuid={uuid}
              title=""
              superSetLength={template[parentUUID].children.length}
              index={index}
              setIndex={setIndex}
            />
          )}
          <ExerciseHistory key={uuid} uuid={uuid} />
        </Animated.View>
      </GestureHandlerRootView>
    </>
  );
}
