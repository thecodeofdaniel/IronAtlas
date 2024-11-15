import { sql } from 'drizzle-orm';
import {
  sqliteTable,
  integer,
  text,
  index,
  real,
} from 'drizzle-orm/sqlite-core';
import { exercise } from '.';

export const workoutTemplate = sqliteTable('workout_templates', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  name: text('name').notNull(),
  notes: text('notes'),
  createdAt: integer('created_at', { mode: 'number' })
    .notNull()
    .default(sql`(unixepoch())`),
});

export type TSelectWorkoutTemplate = typeof workoutTemplate.$inferSelect;
export type TInsertWorkoutTemplate = typeof workoutTemplate.$inferInsert;

export const volumeTemplate = sqliteTable(
  'volume_templates',
  {
    id: integer('id').primaryKey({ autoIncrement: true }),
    workoutTemplateId: integer('workout_template_id')
      .references(() => workoutTemplate.id, {
        onDelete: 'cascade',
      })
      .notNull(),
    exerciseId: integer('exercise_id')
      .references(() => exercise.id, {
        onDelete: 'cascade',
      })
      .notNull(),
    notes: text('notes'),
    index: integer('index').notNull(),
    subIndex: integer('sub_index'), // can be null
  },
  (table) => ({
    workoutTemplateIdIndex: index('workout_template_id_index').on(
      table.workoutTemplateId,
    ),
    indexIndex: index('volume_template_index_index').on(table.index),
  }),
);

export const settTemplate = sqliteTable(
  'sett_templates',
  {
    id: integer('id').primaryKey({ autoIncrement: true }),
    volumeTemplateId: integer('volume_template_id').references(
      () => volumeTemplate.id,
      {
        onDelete: 'cascade',
      },
    ),
    // For templates, weight and reps could be optional or have default values
    weight: real('weight'),
    reps: integer('reps'),
    rpe: real('rpe'),
    index: integer('index').notNull(),
    type: text('type').notNull(),
  },
  (table) => ({
    volumeTemplateIdIndex: index('volume_template_id_index').on(
      table.volumeTemplateId,
    ),
    indexIndex: index('sett_template_index_index').on(table.index),
  }),
);
