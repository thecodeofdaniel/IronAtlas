import { drizzle } from 'drizzle-orm/expo-sqlite';
import { openDatabaseSync } from 'expo-sqlite/next';
import * as schema from '@/db/schema';

export const DB_NAME = 'db.db';
export const expoDb = openDatabaseSync(DB_NAME, { enableChangeListener: true });
export const db = drizzle(expoDb, { schema });
