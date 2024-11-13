import { Pressable, Text } from 'react-native';
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

export default function Exercise() {
  console.log('Render Exercise');
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
                superSetLength={template[parentUUID].children.length}
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
