import { createContext, useContext, useEffect, useState, useCallback, type ReactNode } from 'react';
import type { UserProfile, AppSettings, DailyTracking, WeightEntry, Habit, ShoppingListItem, WorkoutPlan, MealPlan } from '@/types';
import * as storage from '@/services/storage';
import { generateWorkoutPlan } from '@/lib/workoutEngine';
import { generateMealPlan } from '@/lib/mealEngine';
import { defaultHabits } from '@/data/constants';

interface AppContextValue {
  profile: UserProfile | null;
  settings: AppSettings;
  todayTracking: DailyTracking | null;
  weightHistory: WeightEntry[];
  habits: Habit[];
  shoppingList: ShoppingListItem[];
  workoutPlan: WorkoutPlan | null;
  mealPlan: MealPlan | null;
  isOnboarded: boolean;
  // Actions
  setProfile: (profile: UserProfile) => void;
  updateProfile: (partial: Partial<UserProfile>) => void;
  completeOnboarding: (profile: UserProfile) => void;
  setSettings: (settings: AppSettings) => void;
  updateTodayTracking: (partial: Partial<DailyTracking>) => void;
  addWeight: (weightKg: number) => void;
  addCustomHabit: (name: string, icon: string) => void;
  removeCustomHabit: (id: string) => void;
  setShoppingList: (items: ShoppingListItem[]) => void;
  regeneratePlans: () => void;
  clearAllData: () => void;
  loadDemoProfile: () => void;
  checkInToday: (mood: string, energyLevel: number) => void;
}

const AppContext = createContext<AppContextValue | null>(null);

export function useApp() {
  const ctx = useContext(AppContext);
  if (!ctx) throw new Error('useApp must be used within AppProvider');
  return ctx;
}

export function AppProvider({ children }: { children: ReactNode }) {
  const [profile, setProfileState] = useState<UserProfile | null>(null);
  const [settings, setSettingsState] = useState<AppSettings>(storage.getSettings());
  const [todayTracking, setTodayTracking] = useState<DailyTracking | null>(null);
  const [weightHistory, setWeightHistory] = useState<WeightEntry[]>([]);
  const [habits, setHabits] = useState<Habit[]>([]);
  const [shoppingList, setShoppingListState] = useState<ShoppingListItem[]>([]);
  const [workoutPlan, setWorkoutPlan] = useState<WorkoutPlan | null>(null);
  const [mealPlan, setMealPlan] = useState<MealPlan | null>(null);

  // Load from storage on mount
  useEffect(() => {
    const loadedProfile = storage.getProfile();
    setProfileState(loadedProfile);
    setSettingsState(storage.getSettings());
    setTodayTracking(storage.getTodayTracking());
    setWeightHistory(storage.getWeightHistory());
    setHabits([...defaultHabits, ...storage.getCustomHabits()]);
    setShoppingListState(storage.getShoppingList());
    setWorkoutPlan(storage.getWorkoutPlan());
    setMealPlan(storage.getMealPlan());
  }, []);

  // Apply theme
  useEffect(() => {
    const applyTheme = () => {
      const theme = settings.theme;
      const isDark =
        theme === 'dark' ||
        (theme === 'system' && window.matchMedia('(prefers-color-scheme: dark)').matches);
      document.documentElement.classList.toggle('dark', isDark);
    };
    applyTheme();
    if (settings.theme === 'system') {
      const mq = window.matchMedia('(prefers-color-scheme: dark)');
      mq.addEventListener('change', applyTheme);
      return () => mq.removeEventListener('change', applyTheme);
    }
  }, [settings.theme]);

  const setProfile = useCallback((p: UserProfile) => {
    setProfileState(p);
    storage.saveProfile(p);
  }, []);

  const updateProfile = useCallback((partial: Partial<UserProfile>) => {
    setProfileState((prev) => {
      if (!prev) return prev;
      const updated = { ...prev, ...partial };
      storage.saveProfile(updated);
      return updated;
    });
  }, []);

  const regeneratePlans = useCallback(() => {
    setProfileState((prev) => {
      if (!prev) return prev;
      const wp = generateWorkoutPlan(prev);
      const mp = generateMealPlan(prev);
      setWorkoutPlan(wp);
      setMealPlan(mp);
      storage.saveWorkoutPlan(wp);
      storage.saveMealPlan(mp);
      return prev;
    });
  }, []);

  const completeOnboarding = useCallback((p: UserProfile) => {
    const wp = generateWorkoutPlan(p);
    const mp = generateMealPlan(p);
    setProfileState(p);
    setWorkoutPlan(wp);
    setMealPlan(mp);
    storage.saveProfile(p);
    storage.saveWorkoutPlan(wp);
    storage.saveMealPlan(mp);

    // Initialize today's tracking
    const todayKey = storage.getTodayKey();
    const tracking: DailyTracking = {
      date: todayKey,
      waterMl: 0,
      steps: 0,
      bedtime: null,
      wakeTime: null,
      sleepHours: null,
      workoutCompleted: false,
      workoutCompletedExercises: [],
      habitsCompleted: [],
      mealsFollowed: 0,
      mood: null,
      energyLevel: null,
    };
    setTodayTracking(tracking);
    storage.saveTodayTracking(tracking);

    // Add initial weight entry
    const weightEntry: WeightEntry = {
      date: todayKey,
      weightKg: p.weightKg,
    };
    storage.addWeightEntry(weightEntry);
    setWeightHistory(storage.getWeightHistory());
  }, []);

  const setSettings = useCallback((s: AppSettings) => {
    setSettingsState(s);
    storage.saveSettings(s);
  }, []);

  const updateTodayTracking = useCallback((partial: Partial<DailyTracking>) => {
    setTodayTracking((prev) => {
      const todayKey = storage.getTodayKey();
      const updated: DailyTracking = {
        date: todayKey,
        waterMl: 0,
        steps: 0,
        bedtime: null,
        wakeTime: null,
        sleepHours: null,
        workoutCompleted: false,
        workoutCompletedExercises: [],
        habitsCompleted: [],
        mealsFollowed: 0,
        mood: null,
        energyLevel: null,
        ...prev,
        ...partial,
      };
      storage.saveTodayTracking(updated);
      return updated;
    });
  }, []);

  const addWeight = useCallback((weightKg: number) => {
    const entry: WeightEntry = {
      date: storage.getTodayKey(),
      weightKg,
    };
    storage.addWeightEntry(entry);
    setWeightHistory(storage.getWeightHistory());
    setProfileState((prev) => {
      if (!prev) return prev;
      const updated = { ...prev, weightKg };
      storage.saveProfile(updated);
      return updated;
    });
  }, []);

  const addCustomHabit = useCallback((name: string, icon: string) => {
    const newHabit: Habit = {
      id: `custom_${Date.now()}`,
      name,
      icon,
      isCustom: true,
    };
    setHabits((prev) => {
      const customHabits = prev.filter((h) => h.isCustom);
      const updated = [...defaultHabits, ...customHabits, newHabit];
      storage.saveCustomHabits(updated.filter((h) => h.isCustom));
      return updated;
    });
  }, []);

  const removeCustomHabit = useCallback((id: string) => {
    setHabits((prev) => {
      const updated = prev.filter((h) => h.id !== id);
      storage.saveCustomHabits(updated.filter((h) => h.isCustom));
      return updated;
    });
  }, []);

  const setShoppingList = useCallback((items: ShoppingListItem[]) => {
    setShoppingListState(items);
    storage.saveShoppingList(items);
  }, []);

  const clearAllData = useCallback(() => {
    storage.clearAllData();
    setProfileState(null);
    setTodayTracking(null);
    setWeightHistory([]);
    setShoppingListState([]);
    setWorkoutPlan(null);
    setMealPlan(null);
    setHabits(defaultHabits);
    setSettingsState(storage.getSettings());
  }, []);

  const loadDemoProfile = useCallback(() => {
    const demoProfile: UserProfile = {
      name: 'Madhav',
      age: 21,
      gender: 'male',
      heightCm: 175,
      weightKg: 68,
      goal: 'build_muscle',
      secondaryGoals: ['maintain'],
      activityLevel: 'moderately_active',
      exerciseDays: 5,
      exerciseEnvironment: 'gym',
      experienceLevel: 'intermediate',
      healthConditions: ['none'],
      otherCondition: '',
      dietType: 'non_vegetarian',
      allergies: [],
      eatsEggs: true,
      eatsFish: true,
      eatsChicken: true,
      lifestyleType: 'hostel',
      messMenu: {
        entries: [
          { day: 'Monday', breakfast: 'Poha + Tea', lunch: 'Rice + Dal + Mixed Veg + Roti + Curd', dinner: 'Roti + Paneer Sabji + Dal + Rice', snacks: 'Biscuits + Tea' },
          { day: 'Tuesday', breakfast: 'Idli + Sambar + Chutney', lunch: 'Rice + Rajma + Roti + Sabji + Curd', dinner: 'Roti + Chole + Rice + Salad', snacks: 'Sprouts + Tea' },
          { day: 'Wednesday', breakfast: 'Upma + Tea', lunch: 'Rice + Dal + Aloo Sabji + Roti + Curd', dinner: 'Roti + Dal + Rice + Sabji', snacks: 'Poha + Tea' },
          { day: 'Thursday', breakfast: 'Poha + Boiled Egg', lunch: 'Rice + Chole + Roti + Sabji + Curd', dinner: 'Roti + Paneer + Rice + Dal', snacks: 'Biscuits + Tea' },
          { day: 'Friday', breakfast: 'Aloo Paratha + Curd', lunch: 'Rice + Dal + Mixed Veg + Roti + Curd', dinner: 'Roti + Rajma + Rice + Salad', snacks: 'Sprouts + Tea' },
          { day: 'Saturday', breakfast: 'Idli + Sambar', lunch: 'Rice + Dal + Roti + Sabji + Curd', dinner: 'Roti + Dal + Rice + Sabji', snacks: 'Poha + Tea' },
          { day: 'Sunday', breakfast: 'Puri + Sabji + Tea', lunch: 'Rice + Dal + Special Sabji + Roti + Ice Cream', dinner: 'Roti + Paneer + Rice + Dal', snacks: 'Sweets + Tea' },
        ],
        source: 'text',
        uploadedAt: new Date().toISOString(),
      },
      additionalFoods: ['Eggs', 'Bananas', 'Milk', 'Curd', 'Soy Chunks', 'Peanuts', 'Oats'],
      targetWeightKg: 74,
      onboardingCompleted: true,
      createdAt: new Date().toISOString(),
    };
    completeOnboarding(demoProfile);
  }, [completeOnboarding]);

  const checkInToday = useCallback((mood: string, energyLevel: number) => {
    storage.saveCheckIn(storage.getTodayKey(), mood, energyLevel);
    updateTodayTracking({ mood: mood as DailyTracking['mood'], energyLevel });
  }, [updateTodayTracking]);

  const isOnboarded = profile?.onboardingCompleted === true;

  return (
    <AppContext.Provider
      value={{
        profile,
        settings,
        todayTracking,
        weightHistory,
        habits,
        shoppingList,
        workoutPlan,
        mealPlan,
        isOnboarded,
        setProfile,
        updateProfile,
        completeOnboarding,
        setSettings,
        updateTodayTracking,
        addWeight,
        addCustomHabit,
        removeCustomHabit,
        setShoppingList,
        regeneratePlans,
        clearAllData,
        loadDemoProfile,
        checkInToday,
      }}
    >
      {children}
    </AppContext.Provider>
  );
}
