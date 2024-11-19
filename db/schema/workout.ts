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
  notes: text('notes'),
  date: integer('date', { mode: 'timestamp' }).notNull(),
  duration: integer('duration').notNull(),
});

export const volume = sqliteTable(
  'volumes',
  {
    id: integer('id').primaryKey({ autoIncrement: true }),
    workoutId: integer('workout_id')
      .references(() => workout.id, {
        onDelete: 'cascade',
      })
      .notNull(),
    exerciseId: integer('exercise_id')
      .references(() => exercise.id, {
        onDelete: 'cascade',
      })
      .notNull(),
    // notes: text('notes'),
    index: integer('index').notNull(),
    subIndex: integer('sub_index'), // order within group
  },
  (table) => ({
    workoutIdIndex: index('workout_id_index').on(table.workoutId),
    indexIndex: index('volume_index_index').on(table.index),
    subIndexIndex: index('volume_sub_index_index').on(table.subIndex),
  }),
);

export const sett = sqliteTable(
  'setts',
  {
    id: integer('id').primaryKey({ autoIncrement: true }),
    volumeId: integer('volume_id')
      .references(() => volume.id, {
        onDelete: 'cascade',
      })
      .notNull(),
    type: text('type').notNull(),
    weight: real('weight').notNull(),
    reps: integer('reps').notNull(),
    index: integer('index').notNull(),
  },
  (table) => ({
    volumeIdIndex: index('volume_id_index').on(table.volumeId),
    indexIndex: index('sett_index_index').on(table.index),
  }),
);
