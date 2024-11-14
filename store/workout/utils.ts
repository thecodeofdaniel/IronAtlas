import * as templateSchema from '@/db/schema/template';

// Helper function to save individual exercises
export async function saveExerciseToTemplate(
  tx: any,
  {
    template,
    exerciseUUID,
    workoutTemplateId,
    index,
    subIndex,
  }: {
    template: TemplateMap;
    exerciseUUID: string;
    workoutTemplateId: number;
    index: number;
    subIndex?: number;
  },
) {
  const exercise = template[exerciseUUID];
  if (!exercise.exerciseId) return;

  const [volumeTemplate] = await tx
    .insert(templateSchema.volumeTemplate)
    .values({
      workoutTemplateId,
      exerciseId: exercise.exerciseId,
      index,
      subIndex,
    })
    .returning({ id: templateSchema.volumeTemplate.id });

  // Batch insert all sets
  await tx.insert(templateSchema.settTemplate).values(
    exercise.sets.map((sett, idx) => ({
      volumeTemplateId: volumeTemplate.id,
      index: idx,
      type: sett.type,
      weight: +sett.weight || 0,
      reps: +sett.reps || 0,
    })),
  );
}
