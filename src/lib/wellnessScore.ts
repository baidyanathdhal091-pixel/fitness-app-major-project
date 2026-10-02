import type { DailyTracking, AppSettings } from '@/types';

export interface WellnessScoreBreakdown {
  workout: number;
  nutrition: number;
  hydration: number;
  sleep: number;
  movement: number;
  total: number;
}

export function calculateWellnessScore(
  tracking: DailyTracking | null,
  settings: AppSettings,
  habitsTotal: number,
): WellnessScoreBreakdown {
  if (!tracking) {
    return { workout: 0, nutrition: 0, hydration: 0, sleep: 0, movement: 0, total: 0 };
  }

  // Workout: 25% - completed = full marks
  const workoutScore = tracking.workoutCompleted ? 25 : 0;

  // Nutrition: 25% - based on meals followed (assume 4 target meals)
  const mealsTarget = 4;
  const nutritionScore = Math.min(25, (tracking.mealsFollowed / mealsTarget) * 25);

  // Hydration: 15% - based on water intake vs 3000ml default
  const waterTarget = 3000;
  const hydrationScore = Math.min(15, (tracking.waterMl / waterTarget) * 15);

  // Sleep: 20% - based on sleep hours vs goal
  const sleepGoal = settings.sleepGoalHours || 8;
  const sleepScore = tracking.sleepHours !== null ? Math.min(20, (tracking.sleepHours / sleepGoal) * 20) : 0;

  // Movement: 15% - based on steps vs target
  const stepTarget = settings.targetSteps || 8000;
  const movementScore = Math.min(15, (tracking.steps / stepTarget) * 15);

  const total = Math.round(workoutScore + nutritionScore + hydrationScore + sleepScore + movementScore);

  return {
    workout: Math.round(workoutScore),
    nutrition: Math.round(nutritionScore),
    hydration: Math.round(hydrationScore),
    sleep: Math.round(sleepScore),
    movement: Math.round(movementScore),
    total,
  };
}

export function getScoreLabel(score: number): { label: string; color: string } {
  if (score >= 80) return { label: 'Excellent', color: 'emerald' };
  if (score >= 60) return { label: 'Good', color: 'blue' };
  if (score >= 40) return { label: 'Fair', color: 'amber' };
  if (score >= 20) return { label: 'Getting Started', color: 'orange' };
  return { label: 'Rest Day', color: 'slate' };
}

export function getSmartAdaptation(
  yesterdayTracking: DailyTracking | null,
  todayTracking: DailyTracking | null,
  recentMissedDays: number,
  mood: string | null,
): string | null {
  if (mood === 'low_energy' || mood === 'tired') {
    return 'You mentioned feeling lower energy today. Consider a lighter session or recovery-focused activity if appropriate for you. Make sure you are eating enough and staying hydrated.';
  }

  if (yesterdayTracking && !yesterdayTracking.workoutCompleted && yesterdayTracking.mood !== 'tired') {
    return 'Yesterday was a rest day from your plan. Today, continue with your scheduled workout rather than attempting to compensate with excessive exercise.';
  }

  if (recentMissedDays >= 3) {
    return 'Your schedule may be too ambitious. Consider adjusting your weekly workout frequency in Settings to a level you can maintain consistently.';
  }

  if (todayTracking && todayTracking.waterMl < 1000) {
    return 'Your water intake is on the lower side today. Consider keeping a water bottle nearby and drinking regularly.';
  }

  return null;
}
