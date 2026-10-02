import type { UserProfile, DailyTracking, WeightEntry, AppSettings, Habit, ShoppingListItem, WorkoutPlan, MealPlan } from '@/types';

const KEYS = {
  PROFILE: 'healthnova_profile',
  TRACKING: 'healthnova_tracking',
  WEIGHT_HISTORY: 'healthnova_weight_history',
  SETTINGS: 'healthnova_settings',
  HABITS: 'healthnova_habits',
  SHOPPING_LIST: 'healthnova_shopping_list',
  WORKOUT_PLAN: 'healthnova_workout_plan',
  MEAL_PLAN: 'healthnova_meal_plan',
  CHECK_INS: 'healthnova_check_ins',
} as const;

function safeGet<T>(key: string, fallback: T): T {
  try {
    const raw = localStorage.getItem(key);
    if (!raw) return fallback;
    return JSON.parse(raw) as T;
  } catch {
    return fallback;
  }
}

function safeSet<T>(key: string, value: T): void {
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch (e) {
    console.error('Failed to save to localStorage:', e);
  }
}

function safeRemove(key: string): void {
  try {
    localStorage.removeItem(key);
  } catch (e) {
    console.error('Failed to remove from localStorage:', e);
  }
}

// Profile
export function getProfile(): UserProfile | null {
  return safeGet<UserProfile | null>(KEYS.PROFILE, null);
}
export function saveProfile(profile: UserProfile): void {
  safeSet(KEYS.PROFILE, profile);
}

// Tracking - stored as map of date -> tracking
export function getAllTracking(): Record<string, DailyTracking> {
  return safeGet<Record<string, DailyTracking>>(KEYS.TRACKING, {});
}

export function getTrackingForDate(date: string): DailyTracking | null {
  const all = getAllTracking();
  return all[date] || null;
}

export function saveTrackingForDate(date: string, tracking: DailyTracking): void {
  const all = getAllTracking();
  all[date] = tracking;
  safeSet(KEYS.TRACKING, all);
}

export function getTodayTracking(): DailyTracking | null {
  return getTrackingForDate(getTodayKey());
}

export function saveTodayTracking(tracking: DailyTracking): void {
  saveTrackingForDate(getTodayKey(), tracking);
}

export function getRecentTracking(days: number): DailyTracking[] {
  const all = getAllTracking();
  const result: DailyTracking[] = [];
  for (let i = 0; i < days; i++) {
    const d = new Date();
    d.setDate(d.getDate() - i);
    const key = formatDateKey(d);
    if (all[key]) result.push(all[key]);
  }
  return result;
}

// Weight history
export function getWeightHistory(): WeightEntry[] {
  return safeGet<WeightEntry[]>(KEYS.WEIGHT_HISTORY, []);
}
export function saveWeightHistory(history: WeightEntry[]): void {
  safeSet(KEYS.WEIGHT_HISTORY, history);
}
export function addWeightEntry(entry: WeightEntry): void {
  const history = getWeightHistory();
  // Replace if same date, otherwise add
  const existingIdx = history.findIndex((e) => e.date === entry.date);
  if (existingIdx >= 0) {
    history[existingIdx] = entry;
  } else {
    history.push(entry);
    history.sort((a, b) => a.date.localeCompare(b.date));
  }
  saveWeightHistory(history);
}

// Settings
const defaultSettings: AppSettings = {
  theme: 'system',
  units: 'metric',
  notifications: {
    workoutReminder: true,
    waterReminder: true,
    mealReminder: true,
    sleepReminder: false,
    dailyCheckIn: true,
  },
  targetSteps: 8000,
  sleepGoalHours: 8,
};

export function getSettings(): AppSettings {
  return safeGet<AppSettings>(KEYS.SETTINGS, defaultSettings);
}
export function saveSettings(settings: AppSettings): void {
  safeSet(KEYS.SETTINGS, settings);
}

// Habits
export function getCustomHabits(): Habit[] {
  return safeGet<Habit[]>(KEYS.HABITS, []);
}
export function saveCustomHabits(habits: Habit[]): void {
  safeSet(KEYS.HABITS, habits);
}

// Shopping list
export function getShoppingList(): ShoppingListItem[] {
  return safeGet<ShoppingListItem[]>(KEYS.SHOPPING_LIST, []);
}
export function saveShoppingList(items: ShoppingListItem[]): void {
  safeSet(KEYS.SHOPPING_LIST, items);
}

// Workout plan
export function getWorkoutPlan(): WorkoutPlan | null {
  return safeGet<WorkoutPlan | null>(KEYS.WORKOUT_PLAN, null);
}
export function saveWorkoutPlan(plan: WorkoutPlan): void {
  safeSet(KEYS.WORKOUT_PLAN, plan);
}

// Meal plan
export function getMealPlan(): MealPlan | null {
  return safeGet<MealPlan | null>(KEYS.MEAL_PLAN, null);
}
export function saveMealPlan(plan: MealPlan): void {
  safeSet(KEYS.MEAL_PLAN, plan);
}

// Check-ins
export function getCheckIns(): Record<string, { mood: string; energyLevel: number }> {
  return safeGet<Record<string, { mood: string; energyLevel: number }>>(KEYS.CHECK_INS, {});
}
export function saveCheckIn(date: string, mood: string, energyLevel: number): void {
  const all = getCheckIns();
  all[date] = { mood, energyLevel };
  safeSet(KEYS.CHECK_INS, all);
}

// Utility
export function getTodayKey(): string {
  return formatDateKey(new Date());
}

export function formatDateKey(d: Date): string {
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
}

export function clearAllData(): void {
  Object.values(KEYS).forEach((key) => safeRemove(key));
}
