import { sql } from 'drizzle-orm';
import {
  sqliteTable,
  integer,
  text,
  primaryKey,
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

export type TSelectExercise = typeof exercise.$inferSelect;
export type TInsertExercise = typeof exercise.$inferInsert;
export type TSelectTag = typeof tag.$inferSelect;
export type TInsertTag = typeof tag.$inferInsert;
