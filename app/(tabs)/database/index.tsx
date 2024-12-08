import React from 'react';
import { View, Alert } from 'react-native';
import { Stack } from 'expo-router';

// expo-sqlite
import * as SQLite from 'expo-sqlite';
import * as FileSystem from 'expo-file-system';

// Drizzle
import { DB_NAME, expoDb } from '@/db/instance';
import { seed } from '@/db/seed/seed';
import { reset } from '@/db/reset';

// Components
import ScreenLayoutWrapper from '@/components/ui/ScreenLayoutWrapper';
import TextContrast from '@/components/ui/TextContrast';
import MySimpleButton from '@/components/ui/MySimpleButton';

const getDbTables = async () => {
  try {
    const result = await expoDb.getAllAsync(
      "SELECT name FROM sqlite_master WHERE type='table';",
    );

    if (result.length === 0) {
      Alert.alert('DB Empty', 'No tables found');
    } else {
      Alert.alert('DB Tables', JSON.stringify(result.map((r: any) => r.name)));
    }
  } catch (error) {
    console.error(error);
  }
};

const deleteDb = () => {
  expoDb.closeSync();
  SQLite.deleteDatabaseSync(DB_NAME);
  Alert.alert(`Deleted DB: ${DB_NAME}`, 'Reload the app to start a new db');
};

const getOtherDbs = async () => {
  try {
    const directory = `${FileSystem.documentDirectory}SQLite`;
    const files = await FileSystem.readDirectoryAsync(directory);

    // Filter for .db files
    const dbFiles = files.filter((file) => file.endsWith('.db'));
    Alert.alert('DBs', JSON.stringify(dbFiles));
  } catch (error) {
    console.error(error);
  }
};

const deleteOtherDbs = async () => {
  try {
    const directory = `${FileSystem.documentDirectory}SQLite`;
    const files = await FileSystem.readDirectoryAsync(directory);

    // Filter for .db files
    const dbFiles = files.filter((file) => file.endsWith('.db'));

    let deletedDbs: string[] = [];

    for (const dbFile of dbFiles) {
      if (dbFile !== DB_NAME) {
        SQLite.deleteDatabaseSync(dbFile);
        deletedDbs.push(dbFile);
      }
    }

    if (deletedDbs.length === 0) {
      Alert.alert('No other DBs were found');
      return;
    }

    Alert.alert(`Deleted DBs`, JSON.stringify(deletedDbs));
  } catch (error) {
    console.error(error);
  }
};

const deleteProxy = (title: string, func: () => any) =>
  Alert.alert(title, 'Are you sure?', [
    {
      text: 'Cancel',
    },
    { text: 'Yes', onPress: () => func() },
  ]);

const seedDb = async () => {
  try {
    const isAlreadySeeded = await seed();
    if (isAlreadySeeded) Alert.alert('Already Seeded DB', '');
    else Alert.alert('Seeded DB', 'Reload the app to see changes');
  } catch (error) {
    console.error('Seeding went wrong:', error);
  }
};

export default function DatabaseTab() {
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
            title="Seed DB"
            onPress={seedDb}
            className="bg-blue-500"
          />
          <MySimpleButton
            title="Clear Tables"
            onPress={() =>
              deleteProxy('Clear Tables', () => {
                reset();
                Alert.alert('Cleared Tables', 'Reload the app to see changes');
              })
            }
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
