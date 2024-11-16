import { drizzle } from 'drizzle-orm/expo-sqlite';
import { openDatabaseSync } from 'expo-sqlite/next';
import * as baseSchema from '@/db/schema';
import * as templateSchema from '@/db/schema/template';
import * as workoutSchema from '@/db/schema/workout';

export const DB_NAME = 'db.db';
export const expoDb = openDatabaseSync(DB_NAME, { enableChangeListener: true });

// Enable foreign key constraints
expoDb.execAsync('PRAGMA foreign_keys = ON;'); // to allow cascade delete

export const db = drizzle(expoDb, {
  schema: { ...baseSchema, ...templateSchema, ...workoutSchema },
  // logger: true,
});
