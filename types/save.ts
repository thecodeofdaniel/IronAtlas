import { sql } from 'drizzle-orm';
import {
  sqliteTable,
  integer,
  text,
  real,
  primaryKey,
  index,
} from 'drizzle-orm/sqlite-core';

export const workout = sqliteTable('workouts', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  name: text('name').notNull(),
  notes: text('notes'),
  date: integer('date', { mode: 'timestamp' }).notNull(),
});

export const volume = sqliteTable('volumes', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  workoutId: integer('workout_id').references(() => workout.id, { onDelete: 'cascade' }),
  isGroup: integer('is_group', { mode: 'boolean' }).notNull(),
  notes: text('notes'),
  index: integer('index').notNull(),
}, (table) => ({
  workoutIdIndex: index('volume_workout_id_index').on(table.workoutId),
  indexIndex: index('volume_index_index').on(table.index),
}));

export const subvolume = sqliteTable('subvolumes', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  volumeId: integer('volume_id').references(() => volume.id, { onDelete: 'cascade' }),
  exerciseId: integer('exercise_id').references(() => exercise.id, { onDelete: 'cascade' }),
  index: integer('index').notNull(),
}, (table) => ({
  volumeIdIndex: index('subvolume_volume_id_index').on(table.volumeId),
  exerciseIdIndex: index('subvolume_exercise_id_index').on(table.exerciseId),
  indexIndex: index('subvolume_index_index').on(table.index),
}));

export const sett = sqliteTable('setts', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  subvolumeId: integer('subvolume_id').references(() => subvolume.id, { onDelete: 'cascade' }),
  weight: real('weight').notNull(),
  reps: integer('reps').notNull(),
  rpe: real('rpe'),
  index: integer('index').notNull(),
  type: text('type').notNull(),
}, (table) => ({
  subvolumeIdIndex: index('sett_subvolume_id_index').on(table.subvolumeId),
  indexIndex: index('sett_index_index').on(table.index),
}));

export const exercise = sqliteTable('exercises', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  name: text('name').notNull(),
  description: text('description'),
});
