import type { UserProfile, WorkoutPlan, WorkoutDay, Exercise, ExperienceLevel } from '@/types';
import { exerciseLibrary } from '@/data/exercises';

function pickExercises(
  filters: { muscleGroup?: string; environment?: string[]; difficulty?: string[] },
  count: number,
  excludeIds: string[] = [],
): Exercise[] {
  let pool = exerciseLibrary.filter((ex) => {
    if (excludeIds.includes(ex.id)) return false;
    if (filters.muscleGroup && !ex.muscleGroup.toLowerCase().includes(filters.muscleGroup.toLowerCase())) return false;
    if (filters.environment && !ex.environment.some((env) => filters.environment!.includes(env))) return false;
    if (filters.difficulty && !filters.difficulty.includes(ex.difficulty)) return false;
    return true;
  });

  if (pool.length < count) {
    pool = exerciseLibrary.filter((ex) => !excludeIds.includes(ex.id));
  }

  return pool.slice(0, count);
}

function adjustForExperience(exercises: Exercise[], level: ExperienceLevel): Exercise[] {
  return exercises.map((ex) => {
    const adjusted = { ...ex };
    if (level === 'beginner') {
      adjusted.sets = Math.max(2, ex.sets - 1);
      if (ex.reps.includes('-')) {
        const [low, high] = ex.reps.split('-').map((n) => parseInt(n.trim()));
        adjusted.reps = `${low}-${Math.min(high, 12)}`;
      }
      adjusted.restSeconds = Math.round(ex.restSeconds * 1.25 / 5) * 5;
    } else if (level === 'advanced') {
      adjusted.sets = ex.sets + 1;
      adjusted.restSeconds = Math.round(ex.restSeconds * 0.9 / 5) * 5;
    }
    return adjusted;
  });
}

function getDifficultyLabel(level: ExperienceLevel): string {
  if (level === 'beginner') return 'Beginner';
  if (level === 'intermediate') return 'Intermediate';
  return 'Advanced';
}

export function generateWorkoutPlan(profile: UserProfile): WorkoutPlan {
  const days = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];
  const env = [profile.exerciseEnvironment];
  if (profile.exerciseEnvironment === 'mixed') {
    env.push('gym', 'home', 'outdoor');
  }
  const difficultyByLevel: Record<string, string[]> =
    profile.experienceLevel === 'beginner'
      ? ['beginner']
      : profile.experienceLevel === 'intermediate'
        ? ['beginner', 'intermediate']
        : ['intermediate', 'advanced'];

  const workoutDays: WorkoutDay[] = [];
  const availableDays = profile.exerciseDays;

  // Determine workout split based on days available
  let splitPattern: { title: string; focus: string; filters: { muscleGroup: string } | null }[];

  if (availableDays <= 2) {
    splitPattern = [
      { title: 'Full Body A', focus: 'Full Body Strength', filters: { muscleGroup: 'Chest' } },
      { title: 'Full Body B', focus: 'Full Body Strength', filters: { muscleGroup: 'Back' } },
    ];
  } else if (availableDays <= 3) {
    splitPattern = [
      { title: 'Full Body A', focus: 'Upper + Lower', filters: { muscleGroup: 'Chest' } },
      { title: 'Full Body B', focus: 'Upper + Lower', filters: { muscleGroup: 'Back' } },
      { title: 'Full Body C', focus: 'Core + Conditioning', filters: { muscleGroup: 'Core' } },
    ];
  } else if (availableDays <= 4) {
    splitPattern = [
      { title: 'Upper Body', focus: 'Chest, Back, Shoulders, Arms', filters: { muscleGroup: 'Chest' } },
      { title: 'Lower Body', focus: 'Quadriceps, Glutes, Hamstrings', filters: { muscleGroup: 'Quad' } },
      { title: 'Upper Body', focus: 'Back, Shoulders, Arms', filters: { muscleGroup: 'Back' } },
      { title: 'Lower Body + Core', focus: 'Glutes, Hamstrings, Core', filters: { muscleGroup: 'Glutes' } },
    ];
  } else if (availableDays <= 5) {
    splitPattern = [
      { title: 'Upper Body', focus: 'Chest, Shoulders, Triceps', filters: { muscleGroup: 'Chest' } },
      { title: 'Lower Body', focus: 'Quadriceps, Glutes', filters: { muscleGroup: 'Quad' } },
      { title: 'Recovery / Mobility', focus: 'Stretching, Core, Mobility', filters: null },
      { title: 'Upper Body', focus: 'Back, Biceps, Rear Delts', filters: { muscleGroup: 'Back' } },
      { title: 'Lower Body + Core', focus: 'Hamstrings, Glutes, Calves', filters: { muscleGroup: 'Hamstring' } },
    ];
  } else {
    splitPattern = [
      { title: 'Upper Body', focus: 'Chest, Shoulders, Triceps', filters: { muscleGroup: 'Chest' } },
      { title: 'Lower Body', focus: 'Quadriceps, Glutes', filters: { muscleGroup: 'Quad' } },
      { title: 'Cardio / Conditioning', focus: 'Cardio, Core', filters: { muscleGroup: 'Cardio' } },
      { title: 'Upper Body', focus: 'Back, Biceps, Rear Delts', filters: { muscleGroup: 'Back' } },
      { title: 'Lower Body + Core', focus: 'Hamstrings, Glutes, Calves', filters: { muscleGroup: 'Glutes' } },
      { title: 'Cardio / Conditioning', focus: 'Cardio, Mobility', filters: { muscleGroup: 'Cardio' } },
      { title: 'Rest', focus: 'Full Recovery', filters: null },
    ];
  }

  // Map workouts to days of the week
  const exerciseDays: number[] = [];
  const interval = 7 / availableDays;
  for (let i = 0; i < availableDays; i++) {
    exerciseDays.push(Math.floor(i * interval));
  }

  let splitIndex = 0;
  for (let i = 0; i < 7; i++) {
    const isExerciseDay = exerciseDays.includes(i);

    if (isExerciseDay && splitPattern[splitIndex % splitPattern.length].title !== 'Rest') {
      const split = splitPattern[splitIndex % splitPattern.length];
      splitIndex++;

      if (split.title === 'Recovery / Mobility' || split.filters === null) {
        const mobilityExercises = pickExercises(
          { muscleGroup: 'Core', environment: env as string[], difficulty: ['beginner'] },
          4,
        );
        const recoveryExercises = adjustForExperience(mobilityExercises, 'beginner');
        workoutDays.push({
          day: days[i],
          title: split.title,
          focus: split.focus,
          exercises: recoveryExercises,
          estimatedDurationMin: 30 + recoveryExercises.length * 5,
          difficulty: getDifficultyLabel(profile.experienceLevel),
        });
      } else if (split.title === 'Cardio / Conditioning') {
        const cardioExercises = pickExercises(
          { muscleGroup: 'Cardio', environment: env as string[], difficulty: difficultyByLevel[profile.experienceLevel] },
          4,
        );
        const adjusted = adjustForExperience(cardioExercises, profile.experienceLevel);
        workoutDays.push({
          day: days[i],
          title: split.title,
          focus: split.focus,
          exercises: adjusted,
          estimatedDurationMin: 35 + adjusted.length * 6,
          difficulty: getDifficultyLabel(profile.experienceLevel),
        });
      } else {
        const upperExercises = split.title.includes('Upper')
          ? [
              ...pickExercises({ muscleGroup: split.filters.muscleGroup, environment: env as string[], difficulty: difficultyByLevel[profile.experienceLevel] }, 2),
              ...pickExercises({ muscleGroup: 'Shoulder', environment: env as string[], difficulty: difficultyByLevel[profile.experienceLevel] }, 1),
              ...pickExercises({ muscleGroup: 'Bicep', environment: env as string[], difficulty: difficultyByLevel[profile.experienceLevel] }, 1),
              ...pickExercises({ muscleGroup: 'Tricep', environment: env as string[], difficulty: difficultyByLevel[profile.experienceLevel] }, 1),
            ]
          : [];
        const lowerExercises = split.title.includes('Lower')
          ? [
              ...pickExercises({ muscleGroup: split.filters.muscleGroup, environment: env as string[], difficulty: difficultyByLevel[profile.experienceLevel] }, 2),
              ...pickExercises({ muscleGroup: 'Glutes', environment: env as string[], difficulty: difficultyByLevel[profile.experienceLevel] }, 1),
              ...pickExercises({ muscleGroup: 'Calf', environment: env as string[], difficulty: difficultyByLevel[profile.experienceLevel] }, 1),
              ...pickExercises({ muscleGroup: 'Core', environment: env as string[], difficulty: difficultyByLevel[profile.experienceLevel] }, 1),
            ]
          : [];

        const exercises = [...upperExercises, ...lowerExercises];
        const adjusted = adjustForExperience(exercises, profile.experienceLevel);
        const usedIds = adjusted.map((e) => e.id);

        const coreExercises = pickExercises({ muscleGroup: 'Core', environment: env as string[], difficulty: ['beginner'] }, 1, usedIds);
        const finalExercises = [...adjusted, ...adjustForExperience(coreExercises, profile.experienceLevel)];

        workoutDays.push({
          day: days[i],
          title: split.title,
          focus: split.focus,
          exercises: finalExercises,
          estimatedDurationMin: 40 + finalExercises.length * 5,
          difficulty: getDifficultyLabel(profile.experienceLevel),
        });
      }
    } else {
      workoutDays.push({
        day: days[i],
        title: 'Rest',
        focus: 'Full Recovery',
        exercises: [],
        estimatedDurationMin: 0,
        difficulty: '—',
      });
    }
  }

  // Adjust for health conditions
  let adjustedDays = workoutDays;
  if (profile.healthConditions.includes('joint_mobility')) {
    adjustedDays = workoutDays.map((d) => ({
      ...d,
      exercises: d.exercises.map((ex) => {
        if (ex.id === 'squat' || ex.id === 'running') {
          return exerciseLibrary.find((e) => e.id === 'glute_bridge') || ex;
        }
        return ex;
      }),
    }));
  }
  if (profile.healthConditions.includes('asthma') || profile.healthConditions.includes('cardiovascular')) {
    adjustedDays = adjustedDays.map((d) => ({
      ...d,
      exercises: d.exercises.map((ex) => {
        if (ex.id === 'burpees' || ex.id === 'high_knees') {
          return exerciseLibrary.find((e) => e.id === 'walking') || exerciseLibrary.find((e) => e.id === 'cycling') || ex;
        }
        return ex;
      }),
    }));
  }

  return {
    days: adjustedDays,
    generatedAt: new Date().toISOString(),
  };
}

export function getTodayWorkout(plan: WorkoutPlan): WorkoutDay | null {
  const today = new Date().toLocaleDateString('en-US', { weekday: 'long' });
  return plan.days.find((d) => d.day === today) || plan.days[0] || null;
}

export function getDayIndex(dayName: string): number {
  const days = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];
  return days.indexOf(dayName);
}
