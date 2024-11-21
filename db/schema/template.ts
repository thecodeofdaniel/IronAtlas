import { sql } from 'drizzle-orm';
import {
  sqliteTable,
  integer,
  text,
  index,
  real,
} from 'drizzle-orm/sqlite-core';
import { exercise } from './exercise+tags';

export const workoutTemplate = sqliteTable('workout_templates', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  name: text('name').notNull().unique(),
  createdAt: integer('created_at', { mode: 'number' })
    .notNull()
    .default(sql`(unixepoch())`),
});

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
    index: integer('index').notNull(),
    subIndex: integer('sub_index'), // can be null
  },
  (table) => ({
    workoutTemplateIdIndex: index('workout_template_id_index').on(
      table.workoutTemplateId,
    ),
    indexIndex: index('volume_template_index_index').on(table.index),
    subIndexIndex: index('volume_template_sub_index_index').on(table.subIndex),
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
    type: text('type').notNull(),
    weight: real('weight'),
    reps: integer('reps'),
    index: integer('index').notNull(),
  },
  (table) => ({
    volumeTemplateIdIndex: index('volume_template_id_index').on(
      table.volumeTemplateId,
    ),
    indexIndex: index('sett_template_index_index').on(table.index),
  }),
);

export type TSelectWorkoutTemplate = typeof workoutTemplate.$inferSelect;
export type TInsertWorkoutTemplate = typeof workoutTemplate.$inferInsert;
export type TSelectVolumeTemplate = typeof volumeTemplate.$inferSelect;
export type TInsertVolumeTemplate = typeof volumeTemplate.$inferInsert;
export type TSelectSettTemplate = typeof settTemplate.$inferSelect;
export type TInsertSettTemplate = typeof settTemplate.$inferInsert;
