export type Gender = 'male' | 'female' | 'other';

export type FitnessGoal =
  | 'lose_weight'
  | 'gain_weight'
  | 'build_muscle'
  | 'maintain'
  | 'improve_fitness'
  | 'improve_endurance'
  | 'improve_strength';

export type ActivityLevel =
  | 'sedentary'
  | 'lightly_active'
  | 'moderately_active'
  | 'very_active'
  | 'athlete';

export type ExerciseEnvironment = 'gym' | 'home' | 'outdoor' | 'mixed';

export type DietType = 'vegetarian' | 'non_vegetarian' | 'eggetarian' | 'vegan';

export type LifestyleType = 'hostel' | 'home' | 'outside';

export type ExperienceLevel = 'beginner' | 'intermediate' | 'advanced';

export type UnitSystem = 'metric' | 'imperial';

export type ThemePreference = 'light' | 'dark' | 'system';

export type Mood = 'great' | 'good' | 'okay' | 'low_energy' | 'tired';

export type HealthCondition =
  | 'diabetes'
  | 'high_bp'
  | 'low_bp'
  | 'high_cholesterol'
  | 'anemia'
  | 'thyroid'
  | 'asthma'
  | 'cardiovascular'
  | 'joint_mobility'
  | 'other'
  | 'none';

export interface UserProfile {
  name: string;
  age: number;
  gender: Gender;
  heightCm: number;
  weightKg: number;
  goal: FitnessGoal;
  secondaryGoals: FitnessGoal[];
  activityLevel: ActivityLevel;
  exerciseDays: number;
  exerciseEnvironment: ExerciseEnvironment;
  experienceLevel: ExperienceLevel;
  healthConditions: HealthCondition[];
  otherCondition: string;
  dietType: DietType;
  allergies: string[];
  eatsEggs: boolean;
  eatsFish: boolean;
  eatsChicken: boolean;
  lifestyleType: LifestyleType;
  messMenu: MessMenu | null;
  additionalFoods: string[];
  targetWeightKg: number | null;
  onboardingCompleted: boolean;
  createdAt: string;
}

export interface MessMenuEntry {
  day: string;
  breakfast: string;
  lunch: string;
  dinner: string;
  snacks: string;
}

export interface MessMenu {
  entries: MessMenuEntry[];
  source: 'text' | 'manual';
  uploadedAt: string;
}

export interface Exercise {
  id: string;
  name: string;
  muscleGroup: string;
  equipment: string;
  difficulty: 'beginner' | 'intermediate' | 'advanced';
  sets: number;
  reps: string;
  restSeconds: number;
  instructions: string;
  safetyNotes: string;
  alternative: string;
  environment: ExerciseEnvironment[];
}

export interface WorkoutDay {
  day: string;
  title: string;
  focus: string;
  exercises: Exercise[];
  estimatedDurationMin: number;
  difficulty: string;
}

export interface WorkoutPlan {
  days: WorkoutDay[];
  generatedAt: string;
}

export interface Meal {
  id: string;
  name: string;
  type: 'breakfast' | 'mid_morning' | 'lunch' | 'evening_snack' | 'dinner';
  ingredients: string[];
  estimatedCalories: number;
  estimatedProteinG: number;
  estimatedCarbsG: number;
  estimatedFatG: number;
  estimatedFiberG: number;
  prepTimeMin: number;
  suitableForGoals: FitnessGoal[];
  dietTypes: DietType[];
  allergens: string[];
  alternatives: string[];
}

export interface DayMealPlan {
  day: number;
  week: number;
  breakfast: Meal;
  midMorning: Meal;
  lunch: Meal;
  eveningSnack: Meal;
  dinner: Meal;
  totalCalories: number;
  totalProteinG: number;
  totalCarbsG: number;
  totalFatG: number;
  totalFiberG: number;
}

export interface MealPlan {
  days: DayMealPlan[];
  generatedAt: string;
}

export interface NutritionTargets {
  calories: number;
  proteinG: number;
  carbsG: number;
  fatG: number;
  fiberG: number;
  waterMl: number;
}

export interface FoodItem {
  name: string;
  category: 'protein' | 'carbohydrates' | 'fruits' | 'vegetables' | 'dairy' | 'nuts_seeds' | 'other';
  dietTypes: DietType[];
  allergens: string[];
  estimatedProteinG: number;
  estimatedCalories: number;
  servingNote: string;
}

export interface Habit {
  id: string;
  name: string;
  icon: string;
  isCustom: boolean;
}

export interface DailyTracking {
  date: string;
  waterMl: number;
  steps: number;
  bedtime: string | null;
  wakeTime: string | null;
  sleepHours: number | null;
  workoutCompleted: boolean;
  workoutCompletedExercises: string[];
  habitsCompleted: string[];
  mealsFollowed: number;
  mood: Mood | null;
  energyLevel: number | null;
}

export interface WeightEntry {
  date: string;
  weightKg: number;
}

export interface DailyCheckIn {
  date: string;
  mood: Mood;
  energyLevel: number;
}

export interface AppSettings {
  theme: ThemePreference;
  units: UnitSystem;
  notifications: {
    workoutReminder: boolean;
    waterReminder: boolean;
    mealReminder: boolean;
    sleepReminder: boolean;
    dailyCheckIn: boolean;
  };
  targetSteps: number;
  sleepGoalHours: number;
}

export interface BMIDetails {
  bmi: number;
  category: string;
  healthyRangeLow: number;
  healthyRangeHigh: number;
  healthyWeightLow: number;
  healthyWeightHigh: number;
}

export interface FitnessCategory {
  key: string;
  label: string;
  description: string;
}

export interface MessAnalysisItem {
  day: string;
  meal: string;
  messFood: string;
  estimatedProteinG: number;
  estimatedCarbsG: number;
  estimatedFatG: number;
  estimatedCalories: number;
  estimatedFiberG: number;
  nutritionalGaps: string[];
  recommendedAdditions: string[];
  reduceItems: string[];
}

export interface NutritionSuggestion {
  type: 'low_protein' | 'high_carb' | 'low_vegetable' | 'low_fiber' | 'good_balance' | 'low_calorie' | 'high_calorie';
  message: string;
  recommendation: string;
}

export interface ShoppingListItem {
  id: string;
  name: string;
  category: string;
  checked: boolean;
  isCustom: boolean;
}
