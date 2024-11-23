import * as sch from '@/db/schema/index';

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
    subIndex: number | null;
  },
) {
  const exercise = template[exerciseUUID];
  if (!exercise.exerciseId) return;

  const [volumeTemplate] = await tx
    .insert(sch.volumeTemplate)
    .values({
      workoutTemplateId,
      exerciseId: exercise.exerciseId,
      index,
      subIndex,
    })
    .returning({ id: sch.volumeTemplate.id });

  // Batch insert all sets
  await tx.insert(sch.settTemplate).values(
    exercise.sets.map((sett, idx) => ({
      volumeTemplateId: volumeTemplate.id,
      index: idx,
      type: sett.type,
      weight: sett.weight || null, // '' is falsy
      reps: sett.reps || null,
    })),
  );
}

// export async function saveExercisesFromWorkout(
//   tx: any,
//   {
//     template,
//     exerciseUUID,
//     workoutId,
//     index,
//     subIndex,
//   }: {
//     template: TemplateMap;
//     exerciseUUID: string;
//     workoutId: number;
//     index: number;
//     subIndex: number | null;
//   },
// ) {
//   const exercise = template[exerciseUUID];
//   if (!exercise.exerciseId) return;

//   const [volume] = await tx
//     .insert(workoutSchema.volume)
//     .values({
//       // workoutTemplateId: workoutId,
//       // exerciseId: exercise.exerciseId,
//       // index,
//       // subIndex,
//     })
//     .returning({ id: workoutSchema.volume.id });

//   // Batch insert all sets
//   await tx.insert(workoutSchema.sett).values(
//     exercise.sets.map((sett, idx) => ({
//       volumeTemplateId: volume.id,
//       index: idx,
//       type: sett.type,
//       weight: sett.weight || null, // '' is falsy
//       reps: sett.reps || null,
//     })),
//   );
// }

export function generateSettId() {
  const timestamp = Date.now(); // Current timestamp in milliseconds
  const randomNum = Math.floor(Math.random() * 10000); // Random number between 0 and 9999
  return Number(`${timestamp}${randomNum}`);
}
