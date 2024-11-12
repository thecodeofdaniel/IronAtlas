import {
  sqliteTable,
  integer,
  text,
  index,
  real,
} from 'drizzle-orm/sqlite-core';
import { exercise } from '.';

export const workout = sqliteTable('workouts', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  name: text('name').notNull(),
  notes: text('notes'),
  date: integer('date', { mode: 'timestamp' }).notNull(),
});

export const volume = sqliteTable(
  'volumes',
  {
    id: integer('id').primaryKey({ autoIncrement: true }),
    workoutId: integer('workout_id').references(() => workout.id, {
      onDelete: 'cascade',
    }),
    exerciseId: integer('exercise_id').references(() => exercise.id, {
      onDelete: 'cascade',
    }),
    notes: text('notes'),
    index: integer('index').notNull(),
    subIndex: integer('sub_index').default(0).notNull(), // order within group
  },
  (table) => ({
    workoutIdIndex: index('workout_id_index').on(table.workoutId),
    indexIndex: index('volume_index_index').on(table.index),
  }),
);

export const sett = sqliteTable(
  'setts',
  {
    id: integer('id').primaryKey({ autoIncrement: true }),
    volumeId: integer('volume_id').references(() => volume.id, {
      onDelete: 'cascade',
    }),
    weight: real('weight').notNull(),
    reps: integer('reps').notNull(),
    rpe: real('rpe'),
    index: integer('index').notNull(),
    type: text('type').notNull(),
  },
  (table) => ({
    volumeIdIndex: index('volume_id_index').on(table.volumeId),
    indexIndex: index('sett_index_index').on(table.index),
  }),
);
