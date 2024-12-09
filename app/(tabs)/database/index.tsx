import React from 'react';
import { View } from 'react-native';
import { Stack } from 'expo-router';
import { reset } from '@/db/reset';
import ScreenLayoutWrapper from '@/components/ui/ScreenLayoutWrapper';
import TextContrast from '@/components/ui/TextContrast';
import MySimpleButton from '@/components/ui/MySimpleButton';
import { createWorkouts } from '@/db/seed/workouts';
import { useExerciseStore } from '@/store/zustand/exercise/exerciseStore';
import { useTagStore } from '@/store/zustand/tag/tagStore';
import { seedExercisesAndTags } from '@/db/seed/seed';
import {
  deleteDb,
  deleteOtherDbs,
  deleteProxy,
  getDbTables,
  getOtherDbs,
} from './utils';

export default function DatabaseTab() {
  const initExercises = useExerciseStore((state) => state.initExerciseStore);
  const initTags = useTagStore((state) => state.initTagStore);

  return (
    <>
      <Stack.Screen
        options={{
          title: 'Database',
          headerShown: true,
        }}
      />
      <ScreenLayoutWrapper className="gap-2">
        <View className="gap-1">
          <TextContrast className="text-lg font-medium">This DB</TextContrast>
          <MySimpleButton
            title="Find Tables"
            onPress={getDbTables}
            className="bg-blue-500"
          />
          <MySimpleButton
            title="Add Exercises & Tags"
            onPress={async () => {
              await seedExercisesAndTags();
              initExercises();
              initTags();
            }}
            className="bg-blue-500"
          />
          <MySimpleButton
            title="Add Workouts"
            onPress={async () => {
              await createWorkouts();
            }}
            className="bg-blue-500"
          />
          <MySimpleButton
            title="Clear Tables"
            onPress={async () => {
              await reset();
              initExercises();
              initTags();
            }}
            className="bg-orange-500"
          />
          <MySimpleButton
            title="Delete DB"
            onPress={() => deleteProxy('Delete DB', deleteDb)}
            className="bg-red-500"
          />
        </View>
        <View className="gap-1">
          <TextContrast className="text-lg font-medium">Other DBs</TextContrast>
          <MySimpleButton
            title="Find Other DBs"
            onPress={getOtherDbs}
            className="bg-blue-500"
          />
          <MySimpleButton
            title="Delete Other DBs"
            onPress={() => deleteProxy('Delete Other DBs', deleteOtherDbs)}
            className="bg-red-500"
          />
        </View>
      </ScreenLayoutWrapper>
    </>
  );
}
