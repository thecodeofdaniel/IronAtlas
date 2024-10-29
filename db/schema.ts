import { sql } from 'drizzle-orm';
import {
  sqliteTable,
  integer,
  text,
  primaryKey,
  index,
  real,
  type AnySQLiteColumn,
} from 'drizzle-orm/sqlite-core';

export const exercise = sqliteTable('exercises', {
  id: integer('id', { mode: 'number' }).primaryKey({ autoIncrement: true }),
  label: text('label').notNull(),
  value: text('value').notNull(),
  index: integer('index').notNull(),
});

export const tag = sqliteTable('tags', {
  id: integer('id', { mode: 'number' }).primaryKey({ autoIncrement: true }),
  label: text('label').notNull(),
  value: text('value').notNull(),
  parentId: integer('parent_id', { mode: 'number' }).references(
    (): AnySQLiteColumn => tag.id
  ),
  index: integer('index').notNull(),
  isOpen: integer('is_open', { mode: 'boolean' }).notNull(),
});

export const exerciseTags = sqliteTable(
  'exercise_tags',
  {
    exerciseId: integer('exercise_id', { mode: 'number' })
      .notNull()
      // when exercise is deleted, so are the tags associated
      .references(() => exercise.id, { onDelete: 'cascade' }),
    tagId: integer('tag_id', { mode: 'number' })
      .notNull()
      // when tag is deleted, so are the exercises associated
      .references(() => tag.id, { onDelete: 'cascade' }),
  },
  (table) => ({
    pk: primaryKey({ columns: [table.exerciseId, table.tagId] }),
  })
);

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
    isGroup: integer('is_group', { mode: 'boolean' }).notNull(),
    notes: text('notes'),
    index: integer('index').notNull(),
  },
  (table) => ({
    workoutIdIndex: index('volume_workout_id_index').on(table.workoutId),
    indexIndex: index('volume_index_index').on(table.index),
  })
);

export const subvolume = sqliteTable(
  'subvolumes',
  {
    id: integer('id').primaryKey({ autoIncrement: true }),
    volumeId: integer('volume_id').references(() => volume.id, {
      onDelete: 'cascade',
    }),
    exerciseId: integer('exercise_id').references(() => exercise.id, {
      onDelete: 'cascade',
    }),
    index: integer('index').notNull(),
  },
  (table) => ({
    volumeIdIndex: index('subvolume_volume_id_index').on(table.volumeId),
    exerciseIdIndex: index('subvolume_exercise_id_index').on(table.exerciseId),
    indexIndex: index('subvolume_index_index').on(table.index),
  })
);

export const sett = sqliteTable(
  'setts',
  {
    id: integer('id').primaryKey({ autoIncrement: true }),
    subvolumeId: integer('subvolume_id').references(() => subvolume.id, {
      onDelete: 'cascade',
    }),
    weight: real('weight').notNull(),
    reps: integer('reps').notNull(),
    rpe: real('rpe'),
    index: integer('index').notNull(),
    type: text('type').notNull(),
  },
  (table) => ({
    subvolumeIdIndex: index('sett_subvolume_id_index').on(table.subvolumeId),
    indexIndex: index('sett_index_index').on(table.index),
  })
);

// New templates table
export const template = sqliteTable(
  'templates',
  {
    id: integer('id').primaryKey({ autoIncrement: true }),
    name: text('name').notNull(),
    notes: text('notes'),
  },
  (table) => ({
    nameIndex: index('template_name_index').on(table.name),
  })
);

// Updated template_exercises table to include subIndex
export const templateExercise = sqliteTable(
  'template_exercises',
  {
    id: integer('id').primaryKey({ autoIncrement: true }),
    templateId: integer('template_id').references(() => template.id),
    exerciseId: integer('exercise_id').references(() => exercise.id),
    index: integer('index').notNull(), // Main order of exercises in the template
    subIndex: integer('sub_index').notNull(), // Order within a group
    sets: integer('sets'),
    reps: integer('reps'),
  },
  (table) => ({
    templateIdIndex: index('template_template_id_index').on(table.templateId),
    exerciseIdIndex: index('template_exercise_id_index').on(table.exerciseId),
    indexIndex: index('template_index_index').on(table.index),
    subIndexIndex: index('template_sub_index_index').on(table.subIndex),
  })
);

export type TSelectExercise = typeof exercise.$inferSelect;
export type TInsertExercise = typeof exercise.$inferInsert;
export type TSelectTag = typeof tag.$inferSelect;
export type TInsertTag = typeof tag.$inferInsert;
