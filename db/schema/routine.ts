import { sql } from 'drizzle-orm';
import {
  sqliteTable,
  integer,
  text,
  index,
  real,
} from 'drizzle-orm/sqlite-core';
import { exercise } from './exercise+tags';

export const routine = sqliteTable('workout_templates', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  name: text('name').notNull().unique(),
  createdAt: integer('created_at', { mode: 'number' })
    .notNull()
    .default(sql`(unixepoch())`),
});

export const volumeRoutine = sqliteTable(
  'volume_templates',
  {
    id: integer('id').primaryKey({ autoIncrement: true }),
    routineId: integer('workout_template_id')
      .references(() => routine.id, {
        onDelete: 'cascade',
      })
      .notNull(),
    exerciseId: integer('exercise_id')
      .references(() => exercise.id, {
        onDelete: 'cascade',
      })
      .notNull(),
    index: integer('index').notNull(),
    subIndex: integer('sub_index'), // can be null
  },
  (table) => ({
    routineIdIndex: index('workout_template_id_index').on(table.routineId),
    indexIndex: index('volume_template_index_index').on(table.index),
    subIndexIndex: index('volume_template_sub_index_index').on(table.subIndex),
  }),
);

export const settRoutine = sqliteTable(
  'sett_templates',
  {
    id: integer('id').primaryKey({ autoIncrement: true }),
    volumeRoutineId: integer('volume_template_id').references(
      () => volumeRoutine.id,
      {
        onDelete: 'cascade',
      },
    ),
    // For routines, weight and reps could be optional or have default values
    type: text('type').notNull(),
    weight: real('weight'),
    reps: integer('reps'),
    index: integer('index').notNull(),
  },
  (table) => ({
    volumeRoutineIdIndex: index('volume_template_id_index').on(
      table.volumeRoutineId,
    ),
    indexIndex: index('sett_template_index_index').on(table.index),
  }),
);

export type TSelectRoutine = typeof routine.$inferSelect;
export type TInsertRoutine = typeof routine.$inferInsert;
export type TSelectVolumeRoutine = typeof volumeRoutine.$inferSelect;
export type TInsertVolumeRoutine = typeof volumeRoutine.$inferInsert;
export type TSelectSettRoutine = typeof settRoutine.$inferSelect;
export type TInsertSettRoutine = typeof settRoutine.$inferInsert;
