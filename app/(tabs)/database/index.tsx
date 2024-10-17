import React from 'react';
import { View, Button, Alert, Text } from 'react-native';
import { Stack } from 'expo-router';

// expo-sqlite
import * as SQLite from 'expo-sqlite';
import * as FileSystem from 'expo-file-system';

// Drizzle
import { DB_NAME, expoDb } from '@/app/_layout';
import { seed } from '@/db/seed';

const getDbTables = async () => {
  try {
    const result = await expoDb.getAllAsync(
      "SELECT name FROM sqlite_master WHERE type='table';"
    );

    if (result.length === 0) {
      Alert.alert('Database is empty', 'No tables found.');
    } else {
      Alert.alert(
        'Database Tables',
        JSON.stringify(result.map((r: any) => r.name))
      );
    }
  } catch (error) {
    console.error(error);
  }
};

const deleteDb = () => {
  expoDb.closeSync();
  SQLite.deleteDatabaseSync(DB_NAME);
  Alert.alert(
    `Deleted database: ${DB_NAME}`,
    'Reload the app to start a new db'
  );
};

const getOtherDbs = async () => {
  try {
    const directory = `${FileSystem.documentDirectory}SQLite`;
    const files = await FileSystem.readDirectoryAsync(directory);

    // Filter for .db files
    const dbFiles = files.filter((file) => file.endsWith('.db'));
    Alert.alert('Found database(s)', JSON.stringify(dbFiles));
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
      Alert.alert('No other dbs were found');
      return;
    }

    Alert.alert(`Deleted dbs`, JSON.stringify(deletedDbs));
  } catch (error) {
    console.error(error);
  }
};

const deleteProxy = (title: string, func: () => any) =>
  Alert.alert(title, 'Are you sure?', [
    {
      text: 'CANCEL',
    },
    { text: 'yes', onPress: () => func() },
  ]);

const seedDb = async () => {
  try {
    await seed();
    Alert.alert('Seeded DB!');
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
      <View
        style={{
          flex: 1,
          alignItems: 'center',
          justifyContent: 'center',
          gap: 6,
        }}
      >
        <Text className="text-xl">This DB</Text>
        <Button title="FIND TABLES" onPress={getDbTables} />
        <Button title="SEED DB" onPress={seedDb} />
        <Button
          title="RESET DB"
          onPress={() => deleteProxy('Delete products', () => {})}
          color={'orange'}
        />
        <Button
          title="DELETE CURRENT DB"
          onPress={() => deleteProxy('Delete current db', deleteDb)}
          color={'red'}
        />
        <Text className="text-xl">Other DBs</Text>
        <Button title="FIND OTHER DBS" onPress={getOtherDbs} />
        <Button
          title="DELETE OTHER DBS"
          onPress={() => deleteProxy('Delete other dbs', deleteOtherDbs)}
          color={'red'}
        />
      </View>
    </>
  );
}
