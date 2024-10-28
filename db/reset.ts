import { db } from '@/db/instance';
import * as schema from '@/db/schema';

export async function reset() {
  await db.delete(schema.tag);
  await db.delete(schema.exercise);
  await db.delete(schema.exerciseTags);
}
