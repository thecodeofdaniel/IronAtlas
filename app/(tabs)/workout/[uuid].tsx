import { Pressable, Text, View } from 'react-native';
import React, { useEffect, useState } from 'react';
import { Stack, useLocalSearchParams } from 'expo-router';
import { useTemplateStore } from '@/store/zustand/template/templateStore';
import { useExerciseStore } from '@/store/zustand/exercise/exerciseStore';
import SetsTable from '@/components/SetsTable/SetsTable';
import Animated, {
  useAnimatedStyle,
  withTiming,
  useSharedValue,
} from 'react-native-reanimated';
import { useRouter } from 'expo-router';
import ExerciseHistory from '@/components/ExerciseHistory/ExerciseHistory';
import MyButtonOpacity from '@/components/ui/MyButtonOpacity';
import CountdownTimer from '@/components/CountDownTimer';
import TimerModal from '@/components/TimerModal';

export default function Exercise() {
  // console.log('Render Exercise');
  const { uuid: uuid_param } = useLocalSearchParams<{ uuid: string }>();
  const { template, inWorkout } = useTemplateStore((state) => state);
  const { exerciseMap } = useExerciseStore((state) => state);
  const [isModalVisible, setModalVisible] = useState(false);

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

      <Animated.View
        // style={animatedStyle}
        className="flex h-full flex-col justify-between bg-neutral p-2"
      >
        <View>
          {inWorkout && (
            <>
              <View className="self-start pb-2">
                <MyButtonOpacity
                  onPress={() => setModalVisible(true)}
                  className="w-32 bg-neutral-contrast/90"
                >
                  <CountdownTimer className="text-center font-medium text-neutral-accent" />
                </MyButtonOpacity>
              </View>
              <TimerModal
                isModalVisible={isModalVisible}
                setModalVisible={setModalVisible}
              />
            </>
          )}
        </View>
        {index === null && (
          <SetsTable
            uuid={uuid}
            title={''}
            superSetLength={0}
            index={null}
            setIndex={setIndex}
          />
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
        {inWorkout && (
          <ExerciseHistory
            key={uuid}
            exerciseId={template[uuid].exerciseId!}
            className="h-52"
          />
        )}
      </Animated.View>
    </>
  );
}
