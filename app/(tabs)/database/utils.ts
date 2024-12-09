import { Alert } from 'react-native';
import { DB_NAME, expoDb } from '@/db/instance';
import * as SQLite from 'expo-sqlite';
import * as FileSystem from 'expo-file-system';

export async function getDbTables() {
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
}

export function deleteDb() {
  expoDb.closeSync();
  SQLite.deleteDatabaseSync(DB_NAME);
  Alert.alert(`Deleted DB: ${DB_NAME}`, 'Reload the app to start a new db');
}

export async function getOtherDbs() {
  try {
    const directory = `${FileSystem.documentDirectory}SQLite`;
    const files = await FileSystem.readDirectoryAsync(directory);

    // Filter for .db files
    const dbFiles = files.filter((file) => file.endsWith('.db'));
    Alert.alert('DBs', JSON.stringify(dbFiles));
  } catch (error) {
    console.error(error);
  }
}

export async function deleteOtherDbs() {
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
}

export function deleteProxy(title: string, func: () => any) {
  return Alert.alert(title, 'Are you sure?', [
    {
      text: 'Cancel',
    },
    { text: 'Yes', onPress: () => func() },
  ]);
}
