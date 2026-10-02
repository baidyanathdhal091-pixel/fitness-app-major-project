import { useMemo, useState } from 'react';
import {
  BrowserRouter,
  Navigate,
  NavLink,
  Outlet,
  Route,
  Routes,
  useNavigate,
  useParams,
} from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  Activity,
  AlertTriangle,
  Apple,
  ArrowRight,
  BedDouble,
  Bell,
  Check,
  ChevronRight,
  CircleUserRound,
  Droplets,
  Dumbbell,
  Flame,
  Footprints,
  Gauge,
  Heart,
  Home,
  Leaf,
  MoonStar,
  Plus,
  Settings,
  ShieldCheck,
  Sparkles,
  Target,
  TrendingUp,
  Trophy,
  Utensils,
  Waves,
  Zap,
  type LucideIcon,
} from 'lucide-react';

import Card from '@/components/ui/Card';
import EmptyState from '@/components/ui/EmptyState';
import MetricCard from '@/components/ui/MetricCard';
import ProgressBar from '@/components/ui/ProgressBar';
import ProgressRing from '@/components/ui/ProgressRing';
import AnimatedNumber from '@/components/ui/AnimatedNumber';
import Sidebar from '@/components/layout/Sidebar';
import MobileNav from '@/components/layout/MobileNav';
import { AppProvider, useApp } from '@/context/AppContext';
import { allAllergies, allHealthConditions, defaultHabits, faqs, goalLabels, lifestyleLabels, moodEmojis, moodLabels, sampleMessMenu } from '@/data/constants';
import { exerciseLibrary } from '@/data/exercises';
import { calculateBMI, calculateBMR, calculateNutritionTargets, getFitnessCategory } from '@/lib/bmi';
import { analyzeMessMenu, generateMealPlan, generateNutritionSuggestions, getMealPlanForDay, getTodayMealPlan } from '@/lib/mealEngine';
import { getTodayWorkout } from '@/lib/workoutEngine';
import { calculateWellnessScore, getSmartAdaptation } from '@/lib/wellnessScore';
import type { DailyTracking, DietType, Exercise, FitnessGoal, Habit, Meal, MessMenu, MessMenuEntry, UserProfile, WorkoutDay } from '@/types';
import * as storage from '@/services/storage';

const navItems = [
  { to: '/dashboard', label: 'Dashboard', icon: Home },
  { to: '/today', label: "Today's Plan", icon: Target },
  { to: '/workout', label: 'Workout', icon: Dumbbell },
  { to: '/nutrition', label: 'Nutrition', icon: Apple },
  { to: '/meal-plan', label: 'Meal Plan', icon: Utensils },
  { to: '/mess-optimizer', label: 'Mess Optimizer', icon: Sparkles },
  { to: '/progress', label: 'Progress', icon: TrendingUp },
  { to: '/habits', label: 'Habits', icon: Check },
  { to: '/health-profile', label: 'Health Profile', icon: CircleUserRound },
  { to: '/settings', label: 'Settings', icon: Settings },
];

const formatGoal = (goal: FitnessGoal) => goalLabels[goal] || 'Custom goal';
const todayKey = storage.getTodayKey();

function App() {
  return (
    <AppProvider>
      <BrowserRouter>
        <AppProviderShell />
      </BrowserRouter>
    </AppProvider>
  );
}

function AppProviderShell() {
  const { profile, isOnboarded } = useApp();

  return (
    <Routes>
      <Route path="/" element={isOnboarded ? <Navigate to="/dashboard" replace /> : <LandingPage />} />
      <Route path="/onboarding" element={<OnboardingPage />} />
      <Route element={<ProtectedLayout />}>
        <Route path="/dashboard" element={<DashboardPage />} />
        <Route path="/today" element={<TodayPage />} />
        <Route path="/workout" element={<WorkoutPage />} />
        <Route path="/workout/:id" element={<WorkoutDetailPage />} />
        <Route path="/nutrition" element={<NutritionPage />} />
        <Route path="/meal-plan" element={<MealPlanPage />} />
        <Route path="/meal/:id" element={<MealDetailPage />} />
        <Route path="/mess-optimizer" element={<MessOptimizerPage />} />
        <Route path="/progress" element={<ProgressPage />} />
        <Route path="/habits" element={<HabitsPage />} />
        <Route path="/health-profile" element={<HealthProfilePage />} />
        <Route path="/settings" element={<SettingsPage />} />
      </Route>
      <Route path="*" element={<Navigate to={isOnboarded ? '/dashboard' : '/'} replace />} />
    </Routes>
  );
}

function ProtectedLayout() {
  const { profile, isOnboarded } = useApp();

  if (!isOnboarded || !profile) {
    return <Navigate to="/" replace />;
  }

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-50">
      <div className="flex min-h-screen">
        <Sidebar />
        <main className="flex-1 px-4 py-4 md:px-6 lg:px-8 pb-28 lg:pb-10">
          <Outlet />
        </main>
      </div>
      <MobileNav />
    </div>
  );
}

function LandingPage() {
  const { isOnboarded, loadDemoProfile } = useApp();
  const navigate = useNavigate();

  const goToPlan = () => {
    if (isOnboarded) {
      navigate('/dashboard');
      return;
    }
    navigate('/onboarding');
  };

  return (
    <div className="min-h-screen bg-[radial-gradient(circle_at_top,_rgba(16,185,129,0.12),_transparent_30%),linear-gradient(180deg,#f8fafc_0%,#ecfeff_100%)] dark:bg-[radial-gradient(circle_at_top,_rgba(16,185,129,0.12),_transparent_30%),linear-gradient(180deg,#020817_0%,#0f172a_100%)]">
      <header className="mx-auto flex max-w-7xl items-center justify-between px-6 py-6 lg:px-8">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-gradient-to-br from-emerald-500 to-emerald-600 shadow-lg shadow-emerald-500/25">
            <Heart className="h-5 w-5 fill-white text-white" />
          </div>
          <div>
            <div className="text-lg font-black tracking-tight text-slate-900 dark:text-white">HEALTH NOVA</div>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <button className="btn-secondary hidden sm:inline-flex" onClick={() => navigate('/onboarding')}>
            Start Assessment
          </button>
          <button className="btn-primary" onClick={goToPlan}>
            Build My Health Plan
          </button>
        </div>
      </header>

      <main className="mx-auto max-w-7xl px-6 pb-16 lg:px-8">
        <section className="grid items-center gap-10 pb-16 pt-10 lg:grid-cols-[1.1fr_0.9fr] lg:pt-16">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="space-y-8">
            <div className="inline-flex items-center gap-2 rounded-full border border-emerald-200 bg-emerald-50 px-3 py-1.5 text-xs font-semibold uppercase tracking-[0.18em] text-emerald-700 dark:border-emerald-800 dark:bg-emerald-900/20 dark:text-emerald-300">
              <Sparkles className="h-3.5 w-3.5" />
              Personal fitness, nutrition and wellness
            </div>

            <div className="space-y-5">
              <h1 className="text-4xl font-black tracking-tight text-slate-900 dark:text-white sm:text-5xl lg:text-6xl">
                HEALTH NOVA
              </h1>
              <p className="max-w-xl text-xl font-medium text-slate-600 dark:text-slate-300">
                Your Personal Fitness, Nutrition and Wellness Companion
              </p>
              <p className="max-w-lg text-base text-slate-600 dark:text-slate-300">
                Understand your body. Build better habits. Train smarter. Eat better.
              </p>
            </div>

            <div className="flex flex-wrap gap-3">
              <button className="btn-primary" onClick={goToPlan}>
                Build My Health Plan
                <ArrowRight className="h-4 w-4" />
              </button>
              <button className="btn-secondary" onClick={() => navigate('/dashboard')}>
                Explore Health Nova
              </button>
            </div>

            <div className="grid max-w-lg grid-cols-3 gap-3 text-center">
              <div className="rounded-2xl border border-slate-200 bg-white/80 p-3 shadow-sm dark:border-slate-700 dark:bg-slate-900/70">
                <div className="text-lg font-black text-emerald-600 dark:text-emerald-400">Profile</div>
                <div className="text-xs text-slate-500 dark:text-slate-400">built around your goals</div>
              </div>
              <div className="rounded-2xl border border-slate-200 bg-white/80 p-3 shadow-sm dark:border-slate-700 dark:bg-slate-900/70">
                <div className="text-lg font-black text-emerald-600 dark:text-emerald-400">Meals</div>
                <div className="text-xs text-slate-500 dark:text-slate-400">tailored to your diet</div>
              </div>
              <div className="rounded-2xl border border-slate-200 bg-white/80 p-3 shadow-sm dark:border-slate-700 dark:bg-slate-900/70">
                <div className="text-lg font-black text-emerald-600 dark:text-emerald-400">Progress</div>
                <div className="text-xs text-slate-500 dark:text-slate-400">tracked from your real data</div>
              </div>
            </div>
          </motion.div>

          <motion.div initial={{ opacity: 0, scale: 0.96 }} animate={{ opacity: 1, scale: 1 }} className="relative">
            <div className="rounded-[32px] border border-slate-200 bg-white/80 p-3 shadow-[0_24px_80px_rgba(15,23,42,0.11)] backdrop-blur dark:border-slate-700 dark:bg-slate-900/70">
              <div className="rounded-[28px] bg-slate-900 p-4 text-white dark:bg-slate-950">
                <div className="mb-4 flex items-center justify-between text-xs text-slate-300">
                  <div className="flex items-center gap-2">
                    <div className="h-2.5 w-2.5 rounded-full bg-red-400" />
                    <div className="h-2.5 w-2.5 rounded-full bg-yellow-400" />
                    <div className="h-2.5 w-2.5 rounded-full bg-emerald-400" />
                  </div>
                  <span>health.nova</span>
                </div>

                <div className="space-y-4">
                  <div className="rounded-2xl bg-slate-800 p-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-xs uppercase tracking-[0.2em] text-slate-400">Demo wellness snapshot</p>
                        <div className="mt-2 flex items-center gap-2">
                          <span className="text-3xl font-black text-white">—</span>
                          <span className="rounded-full bg-emerald-500/15 px-2 py-1 text-xs font-semibold text-emerald-300">Sample</span>
                        </div>
                      </div>
                      <div className="flex h-16 w-16 items-center justify-center rounded-full border-4 border-emerald-500/40 bg-emerald-500/10">
                        <Activity className="h-7 w-7 text-emerald-300" />
                      </div>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div className="rounded-2xl bg-slate-800 p-4">
                      <p className="text-xs uppercase text-slate-400">Workout</p>
                      <div className="mt-2 flex items-end justify-between">
                        <span className="text-2xl font-black">Demo</span>
                        <Dumbbell className="h-5 w-5 text-emerald-300" />
                      </div>
                    </div>
                    <div className="rounded-2xl bg-slate-800 p-4">
                      <p className="text-xs uppercase text-slate-400">Protein</p>
                      <div className="mt-2 flex items-end justify-between">
                        <span className="text-2xl font-black">—</span>
                        <Apple className="h-5 w-5 text-emerald-300" />
                      </div>
                    </div>
                  </div>

                  <div className="space-y-3 rounded-2xl bg-slate-800 p-4">
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-slate-300">Hydration</span>
                      <span className="font-semibold text-emerald-300">Demo</span>
                    </div>
                    <ProgressBar value={0} max={100} color="bg-emerald-500" height={10} />
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-slate-300">Steps</span>
                      <span className="font-semibold text-emerald-300">Demo</span>
                    </div>
                    <ProgressBar value={0} max={100} color="bg-sky-500" height={10} />
                  </div>
                  <p className="mt-3 text-[11px] uppercase tracking-[0.18em] text-slate-400">Sample preview only — your real metrics appear after onboarding</p>
                </div>
              </div>
            </div>
          </motion.div>
        </section>

        <section className="py-10">
          <div className="mb-10 text-center">
            <p className="text-sm font-semibold uppercase tracking-[0.2em] text-emerald-600 dark:text-emerald-400">How Health Nova Works</p>
            <h2 className="mt-3 text-3xl font-black text-slate-900 dark:text-white">Your coach, your data, your plan</h2>
          </div>

          <div className="grid gap-5 md:grid-cols-3">
            {[
              { icon: Target, title: 'Personalized assessment', text: 'Complete a health profile and get a baseline through BMI, activity, lifestyle, and goals.' },
              { icon: Dumbbell, title: 'Smarter training', text: 'Build workouts around your schedule, environment, and recovery needs with dynamic weekly plans.' },
              { icon: Apple, title: 'Better nutrition', text: 'Target calories, macros, and meal guidance that match your diet, goal, and mess menu.' },
            ].map((item) => (
              <Card key={item.title} className="h-full p-6" hover>
                <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-2xl bg-emerald-50 text-emerald-600 dark:bg-emerald-900/20 dark:text-emerald-400">
                  <item.icon className="h-6 w-6" />
                </div>
                <h3 className="mb-2 text-xl font-bold text-slate-900 dark:text-white">{item.title}</h3>
                <p className="text-sm leading-6 text-slate-600 dark:text-slate-300">{item.text}</p>
              </Card>
            ))}
          </div>
        </section>

        <section className="grid gap-8 py-10 lg:grid-cols-2">
          <div className="space-y-4">
            <p className="text-sm font-semibold uppercase tracking-[0.2em] text-emerald-600 dark:text-emerald-400">Personalized fitness</p>
            <h3 className="text-3xl font-black text-slate-900 dark:text-white">Workout plans that fit your life.</h3>
            <p className="text-slate-600 dark:text-slate-300">
              Whether you train at home, in a gym, or outdoors, Health Nova generates a weekly routine built around your schedule and goal.
            </p>
          </div>
          <div className="rounded-3xl border border-slate-200 bg-white/80 p-6 shadow-sm dark:border-slate-700 dark:bg-slate-900/80">
            <div className="mb-4 flex items-center justify-between text-sm text-slate-500 dark:text-slate-400">
              <span>Monday</span>
              <span>Upper Body</span>
            </div>
            <div className="space-y-3">
              {['Bench Press', 'Lat Pulldown', 'Shoulder Press', 'Bicep Curl', 'Tricep Pushdown'].map((exercise) => (
                <div key={exercise} className="flex items-center justify-between rounded-xl bg-slate-100 px-3 py-2 dark:bg-slate-800">
                  <span className="font-medium text-slate-700 dark:text-slate-200">{exercise}</span>
                  <span className="text-xs text-slate-500 dark:text-slate-400">4x8</span>
                </div>
              ))}
            </div>
          </div>
        </section>

        <section className="py-10">
          <div className="mb-8 text-center">
            <p className="text-sm font-semibold uppercase tracking-[0.2em] text-emerald-600 dark:text-emerald-400">Smart nutrition</p>
            <h3 className="mt-3 text-3xl font-black text-slate-900 dark:text-white">Build meals around real life, not guesswork.</h3>
          </div>
          <div className="grid gap-5 md:grid-cols-3">
            {[
              'Personalized calorie and protein targets',
              'Diet-aware meal recommendations',
              'Meal swaps based on allergies and goals',
            ].map((text) => (
              <div key={text} className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-700 dark:bg-slate-900/80">
                <Leaf className="mb-3 h-6 w-6 text-emerald-500" />
                <p className="text-sm leading-6 text-slate-700 dark:text-slate-200">{text}</p>
              </div>
            ))}
          </div>
        </section>

        <section className="grid gap-6 py-10 lg:grid-cols-2">
          <div className="rounded-3xl bg-slate-900 p-6 text-white dark:bg-slate-950">
            <p className="text-sm font-semibold uppercase tracking-[0.2em] text-emerald-300">Hostel mess optimizer</p>
            <h3 className="mt-3 text-3xl font-black">Turn mess food into smarter choices</h3>
            <p className="mt-3 max-w-md text-slate-300">
              Upload your weekly menu, compare it with your protein and calorie targets, and get practical suggestions for a better daily plan.
            </p>
          </div>
          <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-700 dark:bg-slate-900/80">
            <p className="mb-3 text-sm font-semibold uppercase tracking-[0.2em] text-emerald-600 dark:text-emerald-400">Example analysis</p>
            <div className="space-y-3 text-sm text-slate-700 dark:text-slate-200">
              <div className="rounded-xl bg-emerald-50 p-3 text-emerald-800 dark:bg-emerald-900/20 dark:text-emerald-200">
                <strong>Monday Lunch</strong> – Rice + Dal + Vegetables
              </div>
              <div className="rounded-xl bg-slate-100 p-3 dark:bg-slate-800">
                Protein may be relatively low for your current goal. Consider adding 2 eggs or another suitable protein source.
              </div>
            </div>
          </div>
        </section>

        <section className="py-10">
          <div className="mb-8 text-center">
            <p className="text-sm font-semibold uppercase tracking-[0.2em] text-emerald-600 dark:text-emerald-400">Progress tracking</p>
            <h3 className="mt-3 text-3xl font-black text-slate-900 dark:text-white">See the pattern behind your results.</h3>
          </div>
          <div className="grid gap-5 md:grid-cols-4">
            {[
              { label: 'Weight', value: '68kg', icon: TrendingUp },
              { label: 'Workout', value: '4/5', icon: Dumbbell },
              { label: 'Hydration', value: '2.1L', icon: Droplets },
              { label: 'Sleep', value: '7.5hrs', icon: MoonStar },
            ].map(({ label, value, icon: Icon }) => (
              <MetricCard key={label} icon={Icon} label={label} value={value} color="text-emerald-600 dark:text-emerald-400" />
            ))}
          </div>
        </section>

        <section className="py-10">
          <div className="mb-8 text-center">
            <p className="text-sm font-semibold uppercase tracking-[0.2em] text-emerald-600 dark:text-emerald-400">Why Health Nova</p>
            <h3 className="mt-3 text-3xl font-black text-slate-900 dark:text-white">A healthier system, not a random checklist.</h3>
          </div>
          <div className="grid gap-5 md:grid-cols-2 lg:grid-cols-4">
            {[
              'Daily health guidance',
              'Personalized goals',
              'Food-smart recommendations',
              'Progress + habit tracking',
            ].map((item) => (
              <div key={item} className="rounded-2xl border border-slate-200 bg-white p-5 text-center shadow-sm dark:border-slate-700 dark:bg-slate-900/80">
                <Check className="mx-auto mb-3 h-5 w-5 text-emerald-500" />
                <p className="text-sm font-medium text-slate-700 dark:text-slate-200">{item}</p>
              </div>
            ))}
          </div>
        </section>

        <section className="py-10">
          <div className="mb-8 text-center">
            <p className="text-sm font-semibold uppercase tracking-[0.2em] text-emerald-600 dark:text-emerald-400">FAQ</p>
            <h3 className="mt-3 text-3xl font-black text-slate-900 dark:text-white">Everything you need to know.</h3>
          </div>
          <div className="grid gap-4 md:grid-cols-2">
            {faqs.map((item) => (
              <div key={item.q} className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-700 dark:bg-slate-900/80">
                <p className="mb-2 font-bold text-slate-900 dark:text-white">{item.q}</p>
                <p className="text-sm leading-6 text-slate-600 dark:text-slate-300">{item.a}</p>
              </div>
            ))}
          </div>
        </section>

        <section className="py-16">
          <div className="rounded-[32px] bg-gradient-to-r from-emerald-600 to-sky-600 px-6 py-10 text-center text-white shadow-lg shadow-emerald-500/20">
            <p className="text-sm font-semibold uppercase tracking-[0.2em] text-emerald-100">Ready to begin?</p>
            <h3 className="mt-3 text-3xl font-black">Build your health plan and start improving today.</h3>
            <div className="mt-6 flex items-center justify-center gap-3">
              <button className="rounded-full bg-white px-6 py-3 font-semibold text-emerald-700 hover:bg-emerald-50" onClick={() => navigate('/onboarding')}>
                Build My Health Plan
              </button>
            </div>
          </div>
        </section>
      </main>

      <footer className="border-t border-slate-200 bg-white/80 py-8 text-center text-sm text-slate-500 dark:border-slate-800 dark:bg-slate-900/80 dark:text-slate-400">
        <div className="mx-auto max-w-7xl px-6 lg:px-8">© 2026 Health Nova • Your Personal Fitness, Nutrition and Wellness Companion</div>
      </footer>
    </div>
  );
}

function OnboardingPage() {
  const navigate = useNavigate();
  const { completeOnboarding, profile } = useApp();
  const [step, setStep] = useState(1);
  const [form, setForm] = useState<UserProfile>(
    profile || {
      name: '',
      age: 25,
      gender: 'male',
      heightCm: 175,
      weightKg: 68,
      goal: 'build_muscle',
      secondaryGoals: ['maintain'],
      activityLevel: 'moderately_active',
      exerciseDays: 4,
      exerciseEnvironment: 'mixed',
      experienceLevel: 'intermediate',
      healthConditions: ['none'],
      otherCondition: '',
      dietType: 'non_vegetarian',
      allergies: [],
      eatsEggs: true,
      eatsFish: true,
      eatsChicken: true,
      lifestyleType: 'hostel',
      messMenu: null,
      additionalFoods: ['Eggs', 'Bananas', 'Milk', 'Curd'],
      targetWeightKg: null,
      onboardingCompleted: false,
      createdAt: new Date().toISOString(),
    },
  );
  const [uploadedMessFile, setUploadedMessFile] = useState<string | null>(null);

  const totalSteps = 8;

  const updateField = <K extends keyof UserProfile>(key: K, value: UserProfile[K]) => {
    setForm((prev) => ({ ...prev, [key]: value }));
  };

  const toggleListValue = (key: 'healthConditions' | 'allergies' | 'secondaryGoals', value: string, add: boolean) => {
    setForm((prev) => {
      const current = (prev[key] as string[]) || [];
      const next = add ? [...new Set([...current, value])] : current.filter((item) => item !== value);
      if (key === 'healthConditions' && value === 'none' && add) {
        return { ...prev, healthConditions: ['none'] };
      }
      if (key === 'healthConditions' && current.includes('none') && value !== 'none') {
        return { ...prev, healthConditions: next.filter((item) => item !== 'none') };
      }
      if (key === 'healthConditions' && value === 'none' && !add) {
        return { ...prev, healthConditions: [] };
      }
      return { ...prev, [key]: next };
    });
  };

  const handleMenuInput = (value: string) => {
    setForm((prev) => ({
      ...prev,
      messMenu: parseMessMenuText(value),
    }));
  };

  const handleMessFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const allowedExtensions = ['pdf', 'png', 'jpg', 'jpeg'];
    const fileExtension = file.name.split('.').pop()?.toLowerCase() ?? '';
    const isAllowedType =
      file.type === 'application/pdf' ||
      file.type === 'image/png' ||
      file.type === 'image/jpeg' ||
      file.type === 'image/jpg' ||
      allowedExtensions.includes(fileExtension);

    if (!isAllowedType) {
      alert('Please upload a PDF, JPG, JPEG, or PNG file.');
      event.target.value = '';
      return;
    }

    setUploadedMessFile(file.name);
    setForm((prev) => ({
      ...prev,
      messMenu: prev.messMenu ?? {
        entries: sampleMessMenu.map((entry) => ({ ...entry })),
        source: 'manual',
        uploadedAt: new Date().toISOString(),
      },
    }));
  };

  const hasHealthWarning = form.healthConditions.some((value) => value !== 'none' && value !== '' && value !== undefined);

  const canContinue = () => {
    if (step === 1) return form.name.trim() && form.age > 0 && form.heightCm > 0 && form.weightKg > 0;
    if (step === 2) return !!form.goal;
    if (step === 3) return form.activityLevel && form.exerciseDays > 0;
    if (step === 4) return true;
    if (step === 5) return !!form.dietType;
    if (step === 6) return !!form.lifestyleType;
    return true;
  };

  const nextStep = () => {
    if (!canContinue()) return;
    setStep((prev) => Math.min(prev + 1, totalSteps));
  };

  const prevStep = () => setStep((prev) => Math.max(prev - 1, 1));

  const finishOnboarding = () => {
    const sanitized: UserProfile = {
      ...form,
      name: form.name.trim(),
      additionalFoods: form.additionalFoods.length ? form.additionalFoods : ['Eggs', 'Bananas', 'Milk', 'Curd'],
      targetWeightKg: form.targetWeightKg ?? form.weightKg,
      onboardingCompleted: true,
      createdAt: new Date().toISOString(),
    };

    if (!sanitized.healthConditions.length) {
      sanitized.healthConditions = ['none'];
    }

    completeOnboarding(sanitized);
    navigate('/dashboard');
  };

  const StepHeader = ({ title, description }: { title: string; description: string }) => (
    <div className="mb-8">
      <p className="mb-2 text-sm font-semibold uppercase tracking-[0.2em] text-emerald-600 dark:text-emerald-400">Step {step} of {totalSteps}</p>
      <h2 className="text-3xl font-black text-slate-900 dark:text-white">{title}</h2>
      <p className="mt-2 text-slate-600 dark:text-slate-300">{description}</p>
    </div>
  );

  const progress = (step / totalSteps) * 100;

  return (
    <div className="min-h-screen bg-slate-50 px-4 py-10 dark:bg-slate-950">
      <div className="mx-auto max-w-5xl">
        <div className="mb-8">
          <div className="mb-3 flex items-center justify-between text-sm text-slate-500 dark:text-slate-400">
            <span>Profile setup</span>
            <span>{step}/{totalSteps}</span>
          </div>
          <div className="h-2.5 w-full overflow-hidden rounded-full bg-slate-200 dark:bg-slate-800">
            <motion.div className="h-full rounded-full bg-gradient-to-r from-emerald-500 to-emerald-600" animate={{ width: `${progress}%` }} />
          </div>
        </div>

        <div className="rounded-[30px] border border-slate-200 bg-white p-6 shadow-[0_20px_80px_rgba(15,23,42,0.1)] dark:border-slate-700 dark:bg-slate-900/80 sm:p-8">
          {step === 1 && (
            <>
              <StepHeader title="Personal Information" description="Tell us a little about you so we can build the right baseline." />
              <div className="grid gap-5 md:grid-cols-2">
                <label className="space-y-2 md:col-span-2">
                  <span className="text-sm font-medium text-slate-700 dark:text-slate-200">Name</span>
                  <input className="input-field" value={form.name} onChange={(e) => updateField('name', e.target.value)} placeholder="Your name" />
                </label>
                <label className="space-y-2">
                  <span className="text-sm font-medium text-slate-700 dark:text-slate-200">Age</span>
                  <input className="input-field" type="number" min={10} max={120} value={form.age} onChange={(e) => updateField('age', Number(e.target.value))} />
                </label>
                <label className="space-y-2">
                  <span className="text-sm font-medium text-slate-700 dark:text-slate-200">Gender</span>
                  <select className="input-field" value={form.gender} onChange={(e) => updateField('gender', e.target.value as UserProfile['gender'])}>
                    <option value="male">Male</option>
                    <option value="female">Female</option>
                    <option value="other">Other</option>
                  </select>
                </label>
                <label className="space-y-2">
                  <span className="text-sm font-medium text-slate-700 dark:text-slate-200">Height (cm)</span>
                  <input className="input-field" type="number" min={120} max={250} value={form.heightCm} onChange={(e) => updateField('heightCm', Number(e.target.value))} />
                </label>
                <label className="space-y-2">
                  <span className="text-sm font-medium text-slate-700 dark:text-slate-200">Weight (kg)</span>
                  <input className="input-field" type="number" min={30} max={250} value={form.weightKg} onChange={(e) => updateField('weightKg', Number(e.target.value))} />
                </label>
              </div>
            </>
          )}

          {step === 2 && (
            <>
              <StepHeader title="What is your primary goal?" description="Pick the goal that matters most right now." />
              <div className="grid gap-4 md:grid-cols-2">
                {[
                  ['lose_weight', 'Lose weight'],
                  ['gain_weight', 'Gain weight'],
                  ['build_muscle', 'Build muscle'],
                  ['maintain', 'Maintain current fitness'],
                  ['improve_fitness', 'Improve overall fitness'],
                  ['improve_endurance', 'Improve endurance'],
                  ['improve_strength', 'Improve strength'],
                ].map(([value, label]) => (
                  <button
                    key={value}
                    onClick={() => updateField('goal', value as FitnessGoal)}
                    className={`option-card ${form.goal === value ? 'option-card-selected' : ''}`}
                  >
                    <div className="flex items-center justify-between gap-4">
                      <span className="font-semibold text-slate-800 dark:text-slate-100">{label}</span>
                      {form.goal === value && <Check className="h-5 w-5 text-emerald-600" />}
                    </div>
                  </button>
                ))}
              </div>

              <div className="mt-8">
                <p className="mb-3 text-sm font-medium text-slate-700 dark:text-slate-200">Optional secondary goals</p>
                <div className="flex flex-wrap gap-2">
                  {[
                    ['lose_weight', 'Fat loss'],
                    ['gain_weight', 'Weight gain'],
                    ['build_muscle', 'Muscle'],
                    ['maintain', 'Maintain'],
                    ['improve_fitness', 'General fitness'],
                    ['improve_endurance', 'Endurance'],
                    ['improve_strength', 'Strength'],
                  ].map(([value, label]) => {
                    const isSelected = form.secondaryGoals.includes(value as FitnessGoal);
                    return (
                      <button
                        key={value}
                        className={`rounded-full border px-3 py-2 text-sm font-medium ${isSelected ? 'border-emerald-500 bg-emerald-50 text-emerald-700 dark:border-emerald-600 dark:bg-emerald-900/20 dark:text-emerald-300' : 'border-slate-300 bg-white text-slate-600 dark:border-slate-600 dark:bg-slate-800 dark:text-slate-200'}`}
                        onClick={() => {
                          const next = isSelected ? form.secondaryGoals.filter((item) => item !== value) : [...form.secondaryGoals, value as FitnessGoal];
                          updateField('secondaryGoals', next);
                        }}
                      >
                        {label}
                      </button>
                    );
                  })}
                </div>
              </div>
            </>
          )}

          {step === 3 && (
            <>
              <StepHeader title="Activity level and routine" description="This helps us match your workout frequency and intensity." />
              <div className="grid gap-5 md:grid-cols-2">
                <div className="space-y-4 md:col-span-2">
                  <p className="text-sm font-medium text-slate-700 dark:text-slate-200">How active are you currently?</p>
                  <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-5">
                    {[
                      ['sedentary', 'Sedentary'],
                      ['lightly_active', 'Lightly active'],
                      ['moderately_active', 'Moderately active'],
                      ['very_active', 'Very active'],
                      ['athlete', 'Athlete / highly active'],
                    ].map(([value, label]) => (
                      <button key={value} className={`option-card ${form.activityLevel === value ? 'option-card-selected' : ''}`} onClick={() => updateField('activityLevel', value as UserProfile['activityLevel'])}>
                        <span className="font-medium">{label}</span>
                      </button>
                    ))}
                  </div>
                </div>

                <label className="space-y-2">
                  <span className="text-sm font-medium text-slate-700 dark:text-slate-200">How many days per week can you exercise?</span>
                  <select className="input-field" value={form.exerciseDays} onChange={(e) => updateField('exerciseDays', Number(e.target.value))}>
                    {[1, 2, 3, 4, 5, 6, 7].map((day) => <option key={day} value={day}>{day}</option>)}
                  </select>
                </label>

                <label className="space-y-2">
                  <span className="text-sm font-medium text-slate-700 dark:text-slate-200">Preferred workout environment</span>
                  <select className="input-field" value={form.exerciseEnvironment} onChange={(e) => updateField('exerciseEnvironment', e.target.value as UserProfile['exerciseEnvironment'])}>
                    <option value="gym">Gym</option>
                    <option value="home">Home</option>
                    <option value="outdoor">Outdoor</option>
                    <option value="mixed">Mixed</option>
                  </select>
                </label>

                <label className="space-y-2 md:col-span-2">
                  <span className="text-sm font-medium text-slate-700 dark:text-slate-200">Experience level</span>
                  <select className="input-field" value={form.experienceLevel} onChange={(e) => updateField('experienceLevel', e.target.value as UserProfile['experienceLevel'])}>
                    <option value="beginner">Beginner</option>
                    <option value="intermediate">Intermediate</option>
                    <option value="advanced">Advanced</option>
                  </select>
                </label>
              </div>
            </>
          )}

          {step === 4 && (
            <>
              <StepHeader title="Health conditions and concerns" description="Select any conditions that may affect your plan. This is for general guidance and safety, not diagnosis." />
              <div className="grid gap-3 md:grid-cols-2">
                {allHealthConditions.map((condition) => {
                  const selected = form.healthConditions.includes(condition.value as UserProfile['healthConditions'][number]);
                  return (
                    <button
                      key={condition.value}
                      className={`option-card ${selected ? 'option-card-selected' : ''}`}
                      onClick={() => {
                        if (condition.value === 'none') {
                          toggleListValue('healthConditions', 'none', !selected);
                          return;
                        }
                        if (selected) {
                          toggleListValue('healthConditions', condition.value, false);
                        } else {
                          toggleListValue('healthConditions', condition.value, true);
                        }
                      }}
                    >
                      <div className="flex items-center justify-between gap-3">
                        <span className="font-medium text-slate-800 dark:text-slate-100">{condition.label}</span>
                        {selected && <Check className="h-5 w-5 text-emerald-600" />}
                      </div>
                    </button>
                  );
                })}
              </div>

              {hasHealthWarning && (
                <div className="mt-6 rounded-2xl border border-amber-200 bg-amber-50 p-4 text-sm leading-6 text-amber-900 dark:border-amber-900/50 dark:bg-amber-900/10 dark:text-amber-100">
                  <div className="mb-2 flex items-center gap-2 font-semibold">
                    <AlertTriangle className="h-5 w-5" />
                    Safety notice
                  </div>
                  Health Nova provides general wellness guidance and is not a substitute for professional medical advice. If you have a medical condition, are taking medication, are pregnant, recovering from an injury, or experience concerning symptoms, consult a qualified healthcare professional before changing your diet or exercise routine.
                </div>
              )}

              <label className="mt-6 block space-y-2">
                <span className="text-sm font-medium text-slate-700 dark:text-slate-200">Other health concern (optional)</span>
                <input className="input-field" value={form.otherCondition} onChange={(e) => updateField('otherCondition', e.target.value)} placeholder="Describe your concern" />
              </label>
            </>
          )}

          {step === 5 && (
            <>
              <StepHeader title="Diet and food preferences" description="Your meal suggestions will adapt to your diet, allergies, and foods you avoid." />
              <div className="grid gap-5 md:grid-cols-2">
                <label className="space-y-2 md:col-span-2">
                  <span className="text-sm font-medium text-slate-700 dark:text-slate-200">What type of diet do you follow?</span>
                  <select className="input-field" value={form.dietType} onChange={(e) => updateField('dietType', e.target.value as DietType)}>
                    <option value="vegetarian">Vegetarian</option>
                    <option value="non_vegetarian">Non vegetarian</option>
                    <option value="eggetarian">Eggetarian</option>
                    <option value="vegan">Vegan</option>
                  </select>
                </label>

                <div className="space-y-3 md:col-span-2">
                  <p className="text-sm font-medium text-slate-700 dark:text-slate-200">Any food allergies or foods you avoid?</p>
                  <div className="flex flex-wrap gap-2">
                    {allAllergies.map((allergy) => {
                      const selected = form.allergies.includes(allergy);
                      return (
                        <button
                          key={allergy}
                          className={`rounded-full border px-3 py-2 text-sm ${selected ? 'border-emerald-500 bg-emerald-50 text-emerald-700 dark:border-emerald-600 dark:bg-emerald-900/20 dark:text-emerald-300' : 'border-slate-300 bg-white text-slate-600 dark:border-slate-600 dark:bg-slate-800 dark:text-slate-200'}`}
                          onClick={() => {
                            if (selected) {
                              updateField('allergies', form.allergies.filter((item) => item !== allergy));
                            } else {
                              updateField('allergies', [...form.allergies, allergy]);
                            }
                          }}
                        >
                          {allergy}
                        </button>
                      );
                    })}
                  </div>
                </div>

                <div className="rounded-2xl border border-slate-200 p-4 dark:border-slate-700">
                  <p className="mb-3 text-sm font-medium text-slate-700 dark:text-slate-200">Do you eat eggs?</p>
                  <div className="flex gap-2">
                    <button className={`flex-1 rounded-xl px-3 py-2 ${form.eatsEggs ? 'bg-emerald-500 text-white' : 'bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-200'}`} onClick={() => updateField('eatsEggs', true)}>Yes</button>
                    <button className={`flex-1 rounded-xl px-3 py-2 ${!form.eatsEggs ? 'bg-emerald-500 text-white' : 'bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-200'}`} onClick={() => updateField('eatsEggs', false)}>No</button>
                  </div>
                </div>

                <div className="rounded-2xl border border-slate-200 p-4 dark:border-slate-700">
                  <p className="mb-3 text-sm font-medium text-slate-700 dark:text-slate-200">Do you eat fish?</p>
                  <div className="flex gap-2">
                    <button className={`flex-1 rounded-xl px-3 py-2 ${form.eatsFish ? 'bg-emerald-500 text-white' : 'bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-200'}`} onClick={() => updateField('eatsFish', true)}>Yes</button>
                    <button className={`flex-1 rounded-xl px-3 py-2 ${!form.eatsFish ? 'bg-emerald-500 text-white' : 'bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-200'}`} onClick={() => updateField('eatsFish', false)}>No</button>
                  </div>
                </div>

                <div className="rounded-2xl border border-slate-200 p-4 dark:border-slate-700 md:col-span-2">
                  <p className="mb-3 text-sm font-medium text-slate-700 dark:text-slate-200">Do you eat chicken?</p>
                  <div className="flex gap-2">
                    <button className={`flex-1 rounded-xl px-3 py-2 ${form.eatsChicken ? 'bg-emerald-500 text-white' : 'bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-200'}`} onClick={() => updateField('eatsChicken', true)}>Yes</button>
                    <button className={`flex-1 rounded-xl px-3 py-2 ${!form.eatsChicken ? 'bg-emerald-500 text-white' : 'bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-200'}`} onClick={() => updateField('eatsChicken', false)}>No</button>
                  </div>
                </div>
              </div>
            </>
          )}

          {step === 6 && (
            <>
              <StepHeader title="Lifestyle and eating pattern" description="Where do you usually eat your meals and what does your current routine look like?" />
              <div className="grid gap-4 md:grid-cols-3">
                {([
                  ['hostel', 'Hostel / Mess'],
                  ['home', 'Home'],
                  ['outside', 'Outside / Mixed'],
                ] as const).map(([value, label]) => (
                  <button key={value} onClick={() => updateField('lifestyleType', value)} className={`option-card ${form.lifestyleType === value ? 'option-card-selected' : ''}`}>
                    <div className="font-medium text-slate-800 dark:text-slate-100">{label}</div>
                  </button>
                ))}
              </div>

              {form.lifestyleType === 'hostel' && (
                <div className="mt-8 rounded-2xl border border-emerald-200 bg-emerald-50 p-5 dark:border-emerald-900/40 dark:bg-emerald-900/10">
                  <div className="mb-3 flex items-center gap-2 text-emerald-700 dark:text-emerald-300">
                    <Utensils className="h-5 w-5" />
                    <span className="font-semibold">Hostel setup</span>
                  </div>
                  <p className="mb-4 text-sm text-emerald-800 dark:text-emerald-200">Upload a PDF or an image, or paste your mess menu for personalized optimization.</p>

                  <div className="mb-4 flex flex-wrap gap-3">
                    <label className="inline-flex cursor-pointer items-center justify-center rounded-full border border-emerald-500 bg-white px-4 py-2 text-sm font-medium text-emerald-700 shadow-sm transition hover:bg-emerald-50 dark:bg-slate-800 dark:text-emerald-300 dark:hover:bg-slate-700">
                      Upload PDF
                      <input type="file" accept=".pdf" className="hidden" onChange={handleMessFileUpload} />
                    </label>
                    <label className="inline-flex cursor-pointer items-center justify-center rounded-full border border-emerald-500 bg-white px-4 py-2 text-sm font-medium text-emerald-700 shadow-sm transition hover:bg-emerald-50 dark:bg-slate-800 dark:text-emerald-300 dark:hover:bg-slate-700">
                      Upload JPG / PNG / JPEG
                      <input type="file" accept=".jpg,.jpeg,.png,image/jpeg,image/png" className="hidden" onChange={handleMessFileUpload} />
                    </label>
                    <span className="inline-flex items-center rounded-full border border-slate-200 bg-white px-3 py-2 text-xs font-medium text-slate-600 dark:border-slate-600 dark:bg-slate-800 dark:text-slate-300">
                      Manual menu entry
                    </span>
                  </div>

                  {uploadedMessFile && (
                    <div className="mb-4 rounded-xl border border-emerald-200 bg-emerald-100 px-3 py-2 text-sm text-emerald-800 dark:border-emerald-800 dark:bg-emerald-900/20 dark:text-emerald-200">
                      Selected file: {uploadedMessFile}
                    </div>
                  )}

                  <textarea
                    className="min-h-[220px] w-full rounded-2xl border border-slate-200 bg-white p-4 text-slate-900 outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 dark:border-slate-600 dark:bg-slate-800 dark:text-white"
                    placeholder="Monday:
Breakfast: Poha + Eggs
Lunch: Rice + Dal + Vegetables
Dinner: Roti + Paneer"
                    onChange={(e) => handleMenuInput(e.target.value)}
                  />
                </div>
              )}
            </>
          )}

          {step === 7 && (
            <>
              <StepHeader title="Review your plan" description="Check the details before we finalize your personalized profile." />
              <div className="grid gap-4 md:grid-cols-2">
                <InfoBlock label="Name" value={form.name || 'Not provided'} />
                <InfoBlock label="Age" value={`${form.age} years`} />
                <InfoBlock label="Height" value={`${form.heightCm} cm`} />
                <InfoBlock label="Weight" value={`${form.weightKg} kg`} />
                <InfoBlock label="Primary goal" value={formatGoal(form.goal)} />
                <InfoBlock label="Activity" value={form.activityLevel.replace('_', ' ')} />
                <InfoBlock label="Diet" value={form.dietType.replace('_', ' ')} />
                <InfoBlock label="Lifestyle" value={lifestyleLabels[form.lifestyleType]} />
                <InfoBlock label="Conditions" value={form.healthConditions.length ? form.healthConditions.join(', ') : 'None'} />
                <InfoBlock label="Allergies" value={form.allergies.length ? form.allergies.join(', ') : 'None'} />
              </div>
            </>
          )}

          {step === 8 && (
            <>
              <StepHeader title="Everything looks ready" description="Your Health Nova profile will now be created and personalized recommendations will be generated." />
              <div className="rounded-3xl bg-gradient-to-r from-emerald-500 to-emerald-600 p-6 text-white">
                <h3 className="text-2xl font-black">Hi {form.name || 'there'} 👋</h3>
                <p className="mt-3 max-w-xl text-emerald-50">
                  Your health profile is ready. Health Nova will build a personalized workout, meal plan, daily habits, and recommendations based on your goals and lifestyle.
                </p>
                <div className="mt-5 grid gap-3 sm:grid-cols-3">
                  <MiniStat label="Goal" value={formatGoal(form.goal)} />
                  <MiniStat label="BMI" value={calculateBMI(form.weightKg, form.heightCm).bmi.toFixed(1)} />
                  <MiniStat label="Plan" value={form.lifestyleType === 'hostel' ? 'Mess optimized' : 'Personalized'} />
                </div>
              </div>
            </>
          )}

          <div className="mt-8 flex items-center justify-between border-t border-slate-200 pt-6 dark:border-slate-700">
            <button className="btn-secondary" onClick={prevStep} disabled={step === 1}>
              Back
            </button>
            {step < totalSteps ? (
              <button className="btn-primary" onClick={nextStep} disabled={!canContinue()}>
                Continue
                <ChevronRight className="h-4 w-4" />
              </button>
            ) : (
              <button className="btn-primary" onClick={finishOnboarding}>
                Finish and build my plan
                <ArrowRight className="h-4 w-4" />
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

function DashboardPage() {
  const { profile, workoutPlan, mealPlan, todayTracking, habits, shoppingList } = useApp();
  const bmi = profile ? calculateBMI(profile.weightKg, profile.heightCm) : null;
  const targets = profile ? calculateNutritionTargets(profile) : null;
  const currentWorkout = workoutPlan ? getTodayWorkout(workoutPlan) : null;
  const todayMeal = mealPlan ? getTodayMealPlan(mealPlan) : null;
  const score = calculateWellnessScore(todayTracking, storage.getSettings(), habits.length);
  const recommendations = profile ? generateNutritionSuggestions(todayMeal, targets || calculateNutritionTargets(profile), profile) : [];

  const safeProfile = profile!;

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
        <div>
          <p className="text-sm font-semibold uppercase tracking-[0.2em] text-emerald-600 dark:text-emerald-400">Dashboard</p>
          <h1 className="mt-2 text-3xl font-black text-slate-900 dark:text-white">Hi {safeProfile.name || 'Madhav'} 👋</h1>
        </div>
        <div className="rounded-full border border-emerald-200 bg-emerald-50 px-3 py-2 text-sm font-semibold text-emerald-700 dark:border-emerald-800 dark:bg-emerald-900/20 dark:text-emerald-300">
          {score.total}/100 Daily Wellness Score
        </div>
      </div>

      <div className="grid gap-5 lg:grid-cols-[1.2fr_0.8fr]">
        <Card className="p-6" hover>
          <div className="flex items-center justify-between gap-4">
            <div>
              <p className="text-sm font-semibold uppercase tracking-[0.18em] text-slate-500 dark:text-slate-400">Today's health score</p>
              <div className="mt-3 flex items-center gap-3">
                <AnimatedNumber value={score.total} suffix="/100" className="text-4xl font-black text-slate-900 dark:text-white" />
                <span className="rounded-full bg-emerald-50 px-2.5 py-1 text-xs font-semibold text-emerald-700 dark:bg-emerald-900/20 dark:text-emerald-300">Excellent</span>
              </div>
            </div>
            <div className="flex h-20 w-20 items-center justify-center rounded-full border-[10px] border-emerald-500/20 bg-emerald-50 dark:border-emerald-700 dark:bg-emerald-900/20">
              <Gauge className="h-8 w-8 text-emerald-600 dark:text-emerald-400" />
            </div>
          </div>

          <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
            {[
              { label: 'Workout', value: score.workout },
              { label: 'Nutrition', value: score.nutrition },
              { label: 'Hydration', value: score.hydration },
              { label: 'Sleep', value: score.sleep },
              { label: 'Movement', value: score.movement },
            ].map((item) => (
              <div key={item.label} className="rounded-2xl bg-slate-100 p-3 dark:bg-slate-800/80">
                <div className="mb-2 text-xs uppercase tracking-[0.14em] text-slate-500 dark:text-slate-400">{item.label}</div>
                <div className="text-2xl font-black text-slate-900 dark:text-white">{item.value}</div>
              </div>
            ))}
          </div>
        </Card>

        <Card className="p-6" hover>
          <p className="text-sm font-semibold uppercase tracking-[0.18em] text-slate-500 dark:text-slate-400">Health summary</p>
          <div className="mt-5 space-y-4">
            <div className="flex items-center justify-between rounded-xl bg-slate-100 px-3 py-2 dark:bg-slate-800">
              <span className="text-slate-600 dark:text-slate-300">BMI</span>
              <strong className="text-slate-900 dark:text-white">{bmi?.bmi ?? 0}</strong>
            </div>
            <div className="flex items-center justify-between rounded-xl bg-slate-100 px-3 py-2 dark:bg-slate-800">
              <span className="text-slate-600 dark:text-slate-300">Goal</span>
              <strong className="text-slate-900 dark:text-white">{formatGoal(safeProfile.goal)}</strong>
            </div>
            <div className="flex items-center justify-between rounded-xl bg-slate-100 px-3 py-2 dark:bg-slate-800">
              <span className="text-slate-600 dark:text-slate-300">Current weight</span>
              <strong className="text-slate-900 dark:text-white">{safeProfile.weightKg} kg</strong>
            </div>
            <div className="flex items-center justify-between rounded-xl bg-slate-100 px-3 py-2 dark:bg-slate-800">
              <span className="text-slate-600 dark:text-slate-300">Diet</span>
              <strong className="text-slate-900 dark:text-white">{safeProfile.dietType.replace('_', ' ')}</strong>
            </div>
          </div>
        </Card>
      </div>

      <div className="grid gap-5 xl:grid-cols-3">
        <Card className="p-5" hover>
          <div className="mb-4 flex items-center justify-between">
            <h3 className="text-lg font-bold text-slate-900 dark:text-white">Today's workout</h3>
            <Dumbbell className="h-5 w-5 text-emerald-500" />
          </div>
          {currentWorkout ? (
            <div className="space-y-3">
              <p className="text-sm font-semibold text-emerald-600 dark:text-emerald-400">{currentWorkout.title}</p>
              <div className="space-y-2">
                {currentWorkout.exercises.slice(0, 3).map((exercise) => (
                  <div key={exercise.id} className="flex items-center justify-between rounded-xl bg-slate-100 px-3 py-2 dark:bg-slate-800">
                    <span className="text-sm text-slate-700 dark:text-slate-200">{exercise.name}</span>
                    <span className="text-xs text-slate-500 dark:text-slate-400">{exercise.sets} sets</span>
                  </div>
                ))}
              </div>
            </div>
          ) : (
            <EmptyState icon={Dumbbell} title="No workout assigned" description="Generate your plan in onboarding or update your profile to create a workout routine." />
          )}
        </Card>

        <Card className="p-5" hover>
          <div className="mb-4 flex items-center justify-between">
            <h3 className="text-lg font-bold text-slate-900 dark:text-white">Today's meals</h3>
            <Utensils className="h-5 w-5 text-emerald-500" />
          </div>
          {todayMeal ? (
            <div className="space-y-2">
              {[
                ['Breakfast', todayMeal.breakfast.name],
                ['Lunch', todayMeal.lunch.name],
                ['Dinner', todayMeal.dinner.name],
              ].map(([label, name]) => (
                <div key={label} className="rounded-xl bg-slate-100 px-3 py-2 dark:bg-slate-800">
                  <div className="text-xs uppercase tracking-[0.14em] text-slate-500 dark:text-slate-400">{label}</div>
                  <div className="mt-1 text-sm font-semibold text-slate-800 dark:text-slate-100">{name}</div>
                </div>
              ))}
            </div>
          ) : (
            <EmptyState icon={Utensils} title="No meals planned" description="Create a nutrition plan to see your meals here." />
          )}
        </Card>

        <Card className="p-5" hover>
          <div className="mb-4 flex items-center justify-between">
            <h3 className="text-lg font-bold text-slate-900 dark:text-white">Nutrition progress</h3>
            <Apple className="h-5 w-5 text-emerald-500" />
          </div>
          <div className="space-y-4">
            {[
              ['Protein', (todayMeal?.totalProteinG ?? 0), targets?.proteinG ?? 110, 'g'],
              ['Carbs', (todayMeal?.totalCarbsG ?? 0), targets?.carbsG ?? 240, 'g'],
              ['Calories', (todayMeal?.totalCalories ?? 0), targets?.calories ?? 2300, 'kcal'],
            ].map(([label, value, target, unit]) => (
              <ProgressBar key={label} label={label as string} valueLabel={`${value} / ${target}${unit}`} value={Number(value)} max={Number(target)} color={label === 'Calories' ? 'bg-sky-500' : 'bg-emerald-500'} />
            ))}
          </div>
        </Card>
      </div>

      <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-4">
        <MetricCard icon={Droplets} label="Water" value={`${Math.min((todayTracking?.waterMl ?? 0) / 1000, 3).toFixed(2)}L`} unit="/ 3L" sublabel="Today" />
        <MetricCard icon={Footprints} label="Steps" value={todayTracking?.steps ?? 0} unit="/ 8,000" sublabel="Today" />
        <MetricCard icon={MoonStar} label="Sleep" value={todayTracking?.sleepHours ?? 7.5} unit="hrs" sublabel="Goal: 7-9" />
        <MetricCard icon={Bell} label="Habits" value={Math.min(100, Math.round(((todayTracking?.habitsCompleted?.length ?? 0) / Math.max(1, habits.length)) * 100))} unit="%" sublabel="Completed" />
      </div>

      <div className="grid gap-5 lg:grid-cols-[1.1fr_0.9fr]">
        <Card className="p-5" hover>
          <h3 className="text-lg font-bold text-slate-900 dark:text-white">Smart recommendation</h3>
          <div className="mt-4 space-y-3">
            {(recommendations.length ? recommendations : [{ message: 'Your meals today appear balanced.', recommendation: 'Stay consistent and keep your hydration high.' }]).map((item, index) => (
              <div key={index} className="rounded-2xl border border-slate-200 bg-slate-50 p-4 dark:border-slate-700 dark:bg-slate-800/80">
                <p className="font-medium text-slate-800 dark:text-slate-100">{item.message}</p>
                <p className="mt-2 text-sm text-slate-600 dark:text-slate-300">{item.recommendation}</p>
              </div>
            ))}
          </div>
        </Card>

        <Card className="p-5" hover>
          <h3 className="text-lg font-bold text-slate-900 dark:text-white">Shopping list</h3>
          <div className="mt-4 space-y-2">
            {shoppingList.length ? shoppingList.slice(0, 5).map((item) => (
              <div key={item.id} className="flex items-center justify-between rounded-xl bg-slate-100 px-3 py-2 dark:bg-slate-800">
                <span className="text-sm text-slate-700 dark:text-slate-200">{item.name}</span>
                <span className="text-xs uppercase tracking-[0.1em] text-slate-400">{item.category}</span>
              </div>
            )) : (
              <p className="text-sm text-slate-500 dark:text-slate-400">Your shopping list is empty. Generate a meal plan to build it.</p>
            )}
          </div>
        </Card>
      </div>
    </div>
  );
}

function TodayPage() {
  const { profile, workoutPlan, mealPlan, todayTracking, updateTodayTracking, checkInToday } = useApp();
  const [mood, setMood] = useState<string>('great');
  const [energy, setEnergy] = useState<number>(4);
  const workout = workoutPlan ? getTodayWorkout(workoutPlan) : null;
  const plannedMeal = mealPlan ? getTodayMealPlan(mealPlan) : null;
  const tracking = todayTracking ?? {
    date: storage.getTodayKey(),
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

  const addWater = (ml: number) => updateTodayTracking({ waterMl: (tracking.waterMl ?? 0) + ml });

  const targetWaterMl = 3000;
  const statusText = profile ? `GOOD MORNING, ${profile.name.toUpperCase()}` : 'GOOD MORNING';

  return (
    <div className="space-y-6">
      <div className="rounded-[28px] bg-gradient-to-r from-slate-900 via-slate-800 to-emerald-700 p-6 text-white shadow-[0_20px_80px_rgba(15,23,42,0.2)]">
        <p className="text-xs font-semibold uppercase tracking-[0.2em] text-emerald-200">Today</p>
        <h1 className="mt-2 text-3xl font-black">{statusText}</h1>
        <div className="mt-4 flex flex-wrap gap-3 text-sm text-emerald-50">
          <span className="rounded-full bg-white/10 px-3 py-1.5">Workout: {workout?.title || 'Recovery'}</span>
          <span className="rounded-full bg-white/10 px-3 py-1.5">Nutrition: Protein target {calculateNutritionTargets(profile!).proteinG}g</span>
          <span className="rounded-full bg-white/10 px-3 py-1.5">Hydration: 3L</span>
        </div>
      </div>

      <div className="grid gap-5 xl:grid-cols-[1.3fr_0.7fr]">
        <div className="space-y-5">
          <Card className="p-5" hover>
            <div className="mb-4 flex items-center justify-between">
              <h3 className="text-xl font-bold text-slate-900 dark:text-white">Today's Workout</h3>
              <button className="btn-primary text-sm" onClick={() => updateTodayTracking({ workoutCompleted: !tracking.workoutCompleted })}>
                {tracking.workoutCompleted ? 'Workout complete' : 'Complete workout'}
              </button>
            </div>
            {workout ? (
              <div className="space-y-4">
                {workout.exercises.map((exercise, index) => {
                  const finished = tracking.workoutCompletedExercises?.includes(exercise.id) || false;
                  return (
                    <div key={exercise.id} className={`rounded-2xl border p-3 ${finished ? 'border-emerald-300 bg-emerald-50/80 dark:border-emerald-800 dark:bg-emerald-900/10' : 'border-slate-200 bg-slate-50 dark:border-slate-700 dark:bg-slate-800/80'}`}>
                      <div className="flex items-center justify-between gap-3">
                        <div>
                          <p className="font-semibold text-slate-900 dark:text-white">{index + 1}. {exercise.name}</p>
                          <p className="text-xs text-slate-500 dark:text-slate-400">{exercise.sets} sets • {exercise.reps} • {exercise.restSeconds}s rest</p>
                        </div>
                        <button className="btn-ghost text-xs" onClick={() => {
                          const current = tracking.workoutCompletedExercises ?? [];
                          const next = finished ? current.filter((id) => id !== exercise.id) : [...current, exercise.id];
                          updateTodayTracking({ workoutCompletedExercises: next });
                        }}>
                          {finished ? 'Completed' : 'Mark done'}
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : (
              <EmptyState icon={Dumbbell} title="No workout for today" description="Create or regenerate your workout plan to see exercises here." />
            )}
          </Card>

          <Card className="p-5" hover>
            <div className="mb-4 flex items-center justify-between">
              <h3 className="text-xl font-bold text-slate-900 dark:text-white">Water Tracker</h3>
              <Droplets className="h-5 w-5 text-sky-500" />
            </div>
            <div className="mb-4 flex items-center justify-between">
              <span className="text-2xl font-black text-slate-900 dark:text-white">{((tracking.waterMl ?? 0) / 1000).toFixed(2)} L</span>
              <span className="text-sm text-slate-500 dark:text-slate-400">/ 3.0 L</span>
            </div>
            <ProgressBar value={tracking.waterMl ?? 0} max={targetWaterMl} color="bg-sky-500" valueLabel={`${tracking.waterMl ?? 0} ml / ${targetWaterMl} ml`} />
            <div className="mt-4 flex flex-wrap gap-2">
              {[250, 500, 1000].map((amount) => (
                <button key={amount} className="btn-secondary text-sm" onClick={() => addWater(amount)}>+{amount} ml</button>
              ))}
            </div>
          </Card>
        </div>

        <div className="space-y-5">
          <Card className="p-5" hover>
            <h3 className="text-lg font-bold text-slate-900 dark:text-white">Daily check-in</h3>
            <div className="mt-4 space-y-4">
              <div>
                <p className="mb-2 text-sm font-medium text-slate-700 dark:text-slate-200">How are you feeling today?</p>
                <div className="flex flex-wrap gap-2">
                  {Object.entries(moodLabels).map(([key, label]) => (
                    <button key={key} className={`rounded-full px-3 py-2 text-sm ${mood === key ? 'bg-emerald-500 text-white' : 'bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-200'}`} onClick={() => setMood(key)}>
                      {moodEmojis[key]} {label}
                    </button>
                  ))}
                </div>
              </div>
              <div>
                <p className="mb-2 text-sm font-medium text-slate-700 dark:text-slate-200">Energy level</p>
                <input type="range" min={1} max={5} value={energy} onChange={(e) => setEnergy(Number(e.target.value))} className="w-full accent-emerald-500" />
                <div className="mt-2 text-right text-sm text-slate-600 dark:text-slate-300">{energy}/5</div>
              </div>
              <button className="btn-primary w-full" onClick={() => { checkInToday(mood, energy); }}>Save check-in</button>
            </div>
          </Card>

          <Card className="p-5" hover>
            <h3 className="text-lg font-bold text-slate-900 dark:text-white">Sleep tracker</h3>
            <div className="mt-4 space-y-3">
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-200">
                Bedtime
                <input type="time" className="input-field mt-2" value={tracking.bedtime ?? '22:30'} onChange={(e) => updateTodayTracking({ bedtime: e.target.value })} />
              </label>
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-200">
                Wake time
                <input type="time" className="input-field mt-2" value={tracking.wakeTime ?? '06:30'} onChange={(e) => updateTodayTracking({ wakeTime: e.target.value })} />
              </label>
              <div className="rounded-xl bg-slate-100 p-3 text-sm dark:bg-slate-800">
                <span className="text-slate-500 dark:text-slate-400">Sleep goal:</span>
                <strong className="ml-2 text-slate-900 dark:text-white">7 to 9 hours</strong>
              </div>
            </div>
          </Card>

          <Card className="p-5" hover>
            <h3 className="text-lg font-bold text-slate-900 dark:text-white">Steps</h3>
            <div className="mt-4 flex items-end justify-between">
              <div className="text-3xl font-black text-slate-900 dark:text-white">{tracking.steps ?? 0}</div>
              <div className="text-sm text-slate-500 dark:text-slate-400">/ 8,000</div>
            </div>
            <div className="mt-4 flex gap-2">
              {[500, 1000, 2000].map((stepInc) => (
                <button key={stepInc} className="btn-secondary text-sm" onClick={() => updateTodayTracking({ steps: (tracking.steps ?? 0) + stepInc })}>+{stepInc}</button>
              ))}
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
}

function WorkoutPage() {
  const { workoutPlan } = useApp();

  if (!workoutPlan) {
    return <EmptyState icon={Dumbbell} title="No workout plan yet" description="Complete onboarding to generate your plan." />;
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between">
        <div>
          <p className="text-sm font-semibold uppercase tracking-[0.2em] text-emerald-600 dark:text-emerald-400">Workout</p>
          <h1 className="mt-2 text-3xl font-black text-slate-900 dark:text-white">Madhav's Workout</h1>
        </div>
      </div>

      <div className="grid gap-5 xl:grid-cols-2">
        {workoutPlan.days.map((day) => (
          <Card key={day.day} className="p-5" hover>
            <div className="mb-4 flex items-center justify-between">
              <div>
                <p className="text-sm text-slate-500 dark:text-slate-400">{day.day}</p>
                <h3 className="text-xl font-black text-slate-900 dark:text-white">{day.title}</h3>
              </div>
              <span className="rounded-full bg-emerald-50 px-2.5 py-1 text-xs font-semibold text-emerald-700 dark:bg-emerald-900/20 dark:text-emerald-300">{day.difficulty}</span>
            </div>
            <p className="mb-4 text-sm text-slate-600 dark:text-slate-300">{day.focus}</p>
            <div className="space-y-2">
              {day.exercises.slice(0, 3).map((exercise) => (
                <div key={exercise.id} className="flex items-center justify-between rounded-xl bg-slate-100 px-3 py-2 dark:bg-slate-800">
                  <span className="text-sm font-medium text-slate-700 dark:text-slate-200">{exercise.name}</span>
                  <NavLink to={`/workout/${exercise.id}`} className="text-xs font-semibold text-emerald-600 dark:text-emerald-400">Details</NavLink>
                </div>
              ))}
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
}

function WorkoutDetailPage() {
  const { workoutPlan } = useApp();
  const { id } = useParams();
  const exercise = workoutPlan?.days.flatMap((day) => day.exercises).find((ex) => ex.id === id) || exerciseLibrary.find((ex) => ex.id === id);

  if (!exercise) {
    return <EmptyState icon={Dumbbell} title="Exercise not found" description="This workout step is unavailable in the current plan." />;
  }

  return (
    <div className="space-y-6">
      <button className="btn-secondary" onClick={() => window.history.back()}>Back to workouts</button>
      <Card className="p-6" hover>
        <div className="flex flex-col md:flex-row md:items-start md:justify-between">
          <div>
            <p className="text-sm font-semibold uppercase tracking-[0.2em] text-emerald-600 dark:text-emerald-400">Exercise detail</p>
            <h1 className="mt-2 text-3xl font-black text-slate-900 dark:text-white">{exercise.name}</h1>
          </div>
          <div className="rounded-full bg-emerald-50 px-3 py-1.5 text-xs font-semibold text-emerald-700 dark:bg-emerald-900/20 dark:text-emerald-300">{exercise.difficulty}</div>
        </div>
        <div className="mt-6 grid gap-4 md:grid-cols-2">
          <InfoBlock label="Target muscles" value={exercise.muscleGroup} />
          <InfoBlock label="Equipment" value={exercise.equipment} />
          <InfoBlock label="Sets" value={`${exercise.sets}`} />
          <InfoBlock label="Reps" value={exercise.reps} />
          <InfoBlock label="Rest" value={`${exercise.restSeconds} sec`} />
          <InfoBlock label="Alternative" value={exercise.alternative} />
        </div>
        <div className="mt-6 space-y-4">
          <div>
            <h3 className="text-lg font-bold text-slate-900 dark:text-white">Instructions</h3>
            <p className="mt-2 text-slate-600 dark:text-slate-300">{exercise.instructions}</p>
          </div>
          <div>
            <h3 className="text-lg font-bold text-slate-900 dark:text-white">Safety note</h3>
            <p className="mt-2 text-slate-600 dark:text-slate-300">{exercise.safetyNotes}</p>
          </div>
        </div>
      </Card>
    </div>
  );
}

function NutritionPage() {
  const { profile, mealPlan, todayTracking } = useApp();
  const targets = profile ? calculateNutritionTargets(profile) : null;
  const plan = mealPlan ? getTodayMealPlan(mealPlan) : null;

  return (
    <div className="space-y-6">
      <div>
        <p className="text-sm font-semibold uppercase tracking-[0.2em] text-emerald-600 dark:text-emerald-400">Nutrition</p>
        <h1 className="mt-2 text-3xl font-black text-slate-900 dark:text-white">Today's estimated intake</h1>
      </div>

      <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-6">
        {[
          ['Calories', plan?.totalCalories ?? 0, targets?.calories ?? 0, 'kcal'],
          ['Protein', plan?.totalProteinG ?? 0, targets?.proteinG ?? 0, 'g'],
          ['Carbs', plan?.totalCarbsG ?? 0, targets?.carbsG ?? 0, 'g'],
          ['Fats', plan?.totalFatG ?? 0, targets?.fatG ?? 0, 'g'],
          ['Fiber', plan?.totalFiberG ?? 0, targets?.fiberG ?? 0, 'g'],
          ['Water', todayTracking?.waterMl ?? 0, targets?.waterMl ?? 3000, 'ml'],
        ].map(([label, value, target, unit]) => (
          <Card key={label as string} className="p-4" hover>
            <p className="text-xs uppercase tracking-[0.16em] text-slate-500 dark:text-slate-400">{label as string}</p>
            <div className="mt-3 text-2xl font-black text-slate-900 dark:text-white">{value}</div>
            <p className="text-sm text-slate-500 dark:text-slate-400">Target: {target} {unit}</p>
            <div className="mt-3"><ProgressRing value={Number(value)} max={Number(target)} size={78} strokeWidth={8} color="#10b981" /></div>
          </Card>
        ))}
      </div>

      <div className="grid gap-5 xl:grid-cols-2">
        {plan ? (
          [
            ['Breakfast', plan.breakfast],
            ['Lunch', plan.lunch],
            ['Dinner', plan.dinner],
            ['Snack', plan.eveningSnack],
          ].map(([label, meal]) => (
            <Card key={label as string} className="p-5" hover>
              <div className="mb-3 flex items-center justify-between">
                <h3 className="text-lg font-bold text-slate-900 dark:text-white">{label as string}</h3>
                <NavLink to={`/meal/${meal.id}`} className="text-sm font-semibold text-emerald-600 dark:text-emerald-400">View</NavLink>
              </div>
              <p className="text-base font-semibold text-slate-800 dark:text-slate-100">{meal.name}</p>
              <div className="mt-3 grid grid-cols-2 gap-2 text-sm text-slate-600 dark:text-slate-300">
                <span>Calories: {meal.estimatedCalories}</span>
                <span>Protein: {meal.estimatedProteinG}g</span>
                <span>Carbs: {meal.estimatedCarbsG}g</span>
                <span>Fiber: {meal.estimatedFiberG}g</span>
              </div>
            </Card>
          ))
        ) : (
          <EmptyState icon={Apple} title="Nutrition not generated" description="Generate a meal plan to see daily nutrition details." />
        )}
      </div>
    </div>
  );
}

function MealPlanPage() {
  const { mealPlan, profile } = useApp();
  const [week, setWeek] = useState(1);

  if (!mealPlan) return <EmptyState icon={Utensils} title="No meal plan" description="Complete onboarding or regenerate your plan to see recommendations." />;

  const weekDays = mealPlan.days.filter((day) => day.week === week);

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
        <div>
          <p className="text-sm font-semibold uppercase tracking-[0.2em] text-emerald-600 dark:text-emerald-400">Meal plan</p>
          <h1 className="mt-2 text-3xl font-black text-slate-900 dark:text-white">{profile?.name || 'Madhav'}'s 30 Day Nutrition Plan</h1>
        </div>
        <div className="flex gap-2">
          {[1, 2, 3, 4].map((value) => (
            <button key={value} className={`rounded-full px-3 py-2 text-sm font-medium ${week === value ? 'bg-emerald-500 text-white' : 'bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-200'}`} onClick={() => setWeek(value)}>
              Week {value}
            </button>
          ))}
        </div>
      </div>

      <div className="grid gap-4">
        {weekDays.map((dayPlan) => (
          <Card key={dayPlan.day} className="p-4" hover>
            <div className="mb-3 flex items-center justify-between">
              <div>
                <p className="text-sm text-slate-500 dark:text-slate-400">Day {dayPlan.day}</p>
                <h3 className="text-lg font-bold text-slate-900 dark:text-white">Week {dayPlan.week}</h3>
              </div>
              <div className="text-sm font-semibold text-slate-600 dark:text-slate-300">{dayPlan.totalCalories} kcal</div>
            </div>
            <div className="grid gap-3 md:grid-cols-5">
              {[
                ['Breakfast', dayPlan.breakfast],
                ['Mid Morning', dayPlan.midMorning],
                ['Lunch', dayPlan.lunch],
                ['Evening Snack', dayPlan.eveningSnack],
                ['Dinner', dayPlan.dinner],
              ].map(([label, meal]) => (
                <div key={`${dayPlan.day}-${label}`} className="rounded-2xl border border-slate-200 bg-slate-50 p-3 dark:border-slate-700 dark:bg-slate-800/80">
                  <p className="mb-2 text-xs uppercase tracking-[0.12em] text-slate-500 dark:text-slate-400">{label as string}</p>
                  <NavLink to={`/meal/${meal.id}`} className="text-sm font-semibold text-slate-900 hover:text-emerald-600 dark:text-white dark:hover:text-emerald-400">{meal.name}</NavLink>
                  <div className="mt-2 text-xs text-slate-500 dark:text-slate-400">{meal.estimatedProteinG}g protein</div>
                </div>
              ))}
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
}

function MealDetailPage() {
  const { mealPlan } = useApp();
  const { id } = useParams();
  const meal = mealPlan?.days.flatMap((day) => [day.breakfast, day.midMorning, day.lunch, day.eveningSnack, day.dinner]).find((item) => item.id === id);

  if (!meal) {
    return <EmptyState icon={Utensils} title="Meal detail unavailable" description="This meal is not in the current plan." />;
  }

  return (
    <div className="space-y-6">
      <button className="btn-secondary" onClick={() => window.history.back()}>Back to plan</button>
      <Card className="p-6" hover>
        <div className="mb-4 flex items-center justify-between">
          <div>
            <p className="text-sm font-semibold uppercase tracking-[0.2em] text-emerald-600 dark:text-emerald-400">Meal details</p>
            <h1 className="mt-2 text-3xl font-black text-slate-900 dark:text-white">{meal.name}</h1>
          </div>
          <div className="rounded-full bg-emerald-50 px-3 py-1.5 text-xs font-semibold text-emerald-700 dark:bg-emerald-900/20 dark:text-emerald-300">{meal.type}</div>
        </div>

        <div className="mt-5 grid gap-4 md:grid-cols-2">
          <InfoBlock label="Ingredients" value={meal.ingredients.join(', ')} />
          <InfoBlock label="Estimated calories" value={`${meal.estimatedCalories} kcal`} />
          <InfoBlock label="Protein" value={`${meal.estimatedProteinG}g`} />
          <InfoBlock label="Carbs" value={`${meal.estimatedCarbsG}g`} />
          <InfoBlock label="Fat" value={`${meal.estimatedFatG}g`} />
          <InfoBlock label="Fiber" value={`${meal.estimatedFiberG}g`} />
          <InfoBlock label="Prep time" value={`${meal.prepTimeMin} min`} />
          <InfoBlock label="Suitable for goal" value={meal.suitableForGoals.map((goal) => formatGoal(goal)).join(', ')} />
        </div>

        <div className="mt-6 grid gap-5 md:grid-cols-2">
          <div>
            <h3 className="text-lg font-bold text-slate-900 dark:text-white">Possible alternatives</h3>
            <ul className="mt-2 list-disc space-y-1 pl-5 text-slate-600 dark:text-slate-300">
              {meal.alternatives.map((alt) => <li key={alt}>{alt}</li>)}
            </ul>
          </div>
          <div>
            <h3 className="text-lg font-bold text-slate-900 dark:text-white">Diet compatibility</h3>
            <p className="mt-2 text-slate-600 dark:text-slate-300">Suitable diet types: {meal.dietTypes.join(', ')}</p>
          </div>
        </div>
      </Card>
    </div>
  );
}

function MessOptimizerPage() {
  const { profile, updateProfile, mealPlan } = useApp();
  const messMenu = profile?.messMenu || { entries: sampleMessMenu.map((entry) => ({ ...entry, snacks: entry.snacks || '' })), source: 'text', uploadedAt: new Date().toISOString() };
  const [menuText, setMenuText] = useState(() => messMenu.entries.map((entry) => `Monday:\nBreakfast: ...`).join('\n\n'));
  const analysis = profile && profile.messMenu ? analyzeMessMenu(profile.messMenu, profile) : analyzeMessMenu(messMenu as MessMenu, profile!);
  const additionalFoods = profile?.additionalFoods || [];

  const saveMenu = () => {
    if (!profile) return;
    const parsed = parseMessMenuText(menuText) || { entries: sampleMessMenu.map((entry) => ({ ...entry })), source: 'manual', uploadedAt: new Date().toISOString() };
    updateProfile({ messMenu: parsed });
  };

  return (
    <div className="space-y-6">
      <div>
        <p className="text-sm font-semibold uppercase tracking-[0.2em] text-emerald-600 dark:text-emerald-400">Mess optimizer</p>
        <h1 className="mt-2 text-3xl font-black text-slate-900 dark:text-white">Hostel food optimization</h1>
      </div>

      <div className="grid gap-5 xl:grid-cols-[0.9fr_1.1fr]">
        <Card className="p-5" hover>
          <h3 className="text-lg font-bold text-slate-900 dark:text-white">Paste your mess menu</h3>
          <textarea className="input-field mt-4 min-h-[260px]" value={menuText} onChange={(e) => setMenuText(e.target.value)} placeholder="Monday:
Breakfast: Poha + Eggs
Lunch: Rice + Dal + Vegetables
Dinner: Roti + Paneer" />
          <button className="btn-primary mt-4 w-full" onClick={saveMenu}>Save mess menu</button>
        </Card>

        <Card className="p-5" hover>
          <h3 className="text-lg font-bold text-slate-900 dark:text-white">My Additional Foods</h3>
          <div className="mt-4 flex flex-wrap gap-2">
            {additionalFoods.length ? additionalFoods.map((food) => (
              <span key={food} className="rounded-full bg-emerald-50 px-3 py-1.5 text-xs font-medium text-emerald-700 dark:bg-emerald-900/20 dark:text-emerald-300">{food}</span>
            )) : <span className="text-sm text-slate-500 dark:text-slate-400">No additional foods selected.</span>}
          </div>
          <div className="mt-6 rounded-2xl bg-slate-100 p-4 dark:bg-slate-800">
            <p className="text-sm text-slate-600 dark:text-slate-300">Health Nova compares your mess menu with your target nutrition and suggests realistic additions or portions to improve protein, fiber, and overall balance.</p>
          </div>
        </Card>
      </div>

      <div className="grid gap-5">
        {analysis.slice(0, 6).map((item) => (
          <Card key={`${item.day}-${item.meal}`} className="p-5" hover>
            <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
              <div>
                <p className="text-sm text-slate-500 dark:text-slate-400">{item.day}</p>
                <h3 className="text-xl font-black text-slate-900 dark:text-white">{item.meal}</h3>
              </div>
              <div className="rounded-full bg-slate-100 px-3 py-1.5 text-xs font-semibold text-slate-600 dark:bg-slate-800 dark:text-slate-300">{item.estimatedCalories} kcal</div>
            </div>
            <div className="mt-4 grid gap-3 md:grid-cols-3">
              <InfoBlock label="Protein" value={`${item.estimatedProteinG.toFixed(1)}g`} />
              <InfoBlock label="Carbs" value={`${item.estimatedCarbsG.toFixed(1)}g`} />
              <InfoBlock label="Fiber" value={`${item.estimatedFiberG.toFixed(1)}g`} />
            </div>
            <div className="mt-4 space-y-3">
              {item.nutritionalGaps.length ? item.nutritionalGaps.map((gap) => <div key={gap} className="rounded-xl bg-amber-50 p-3 text-sm text-amber-900 dark:bg-amber-900/10 dark:text-amber-100">{gap}</div>) : <div className="rounded-xl bg-emerald-50 p-3 text-sm text-emerald-800 dark:bg-emerald-900/20 dark:text-emerald-200">This meal looks reasonably balanced for your current goal.</div>}
              {item.recommendedAdditions.length > 0 && (
                <div className="rounded-xl bg-slate-100 p-3 text-sm dark:bg-slate-800">
                  <strong className="text-slate-800 dark:text-slate-100">Recommended addition:</strong> {item.recommendedAdditions.join(' ')}
                </div>
              )}
              {item.reduceItems.length > 0 && (
                <div className="rounded-xl bg-slate-100 p-3 text-sm dark:bg-slate-800">
                  <strong className="text-slate-800 dark:text-slate-100">Consider moderating:</strong> {item.reduceItems.join(' ')}
                </div>
              )}
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
}

function ProgressPage() {
  const { profile, weightHistory, todayTracking, habits, workoutPlan } = useApp();
  const [weightInput, setWeightInput] = useState(profile?.weightKg ?? 68);
  const [view, setView] = useState<'week' | 'month'>('week');

  const addWeight = () => {
    if (!profile) return;
    const entry = { date: storage.getTodayKey(), weightKg: Number(weightInput) };
    const next = [...weightHistory, entry];
    storage.saveWeightHistory(next);
    profile.weightKg = Number(weightInput);
    storage.saveProfile(profile);
  };

  return (
    <div className="space-y-6">
      <div>
        <p className="text-sm font-semibold uppercase tracking-[0.2em] text-emerald-600 dark:text-emerald-400">Progress</p>
        <h1 className="mt-2 text-3xl font-black text-slate-900 dark:text-white">Weight and wellness trends</h1>
      </div>

      <div className="grid gap-5 md:grid-cols-4">
        <MetricCard icon={TrendingUp} label="Current weight" value={profile?.weightKg ?? 0} unit="kg" />
        <MetricCard icon={Dumbbell} label="Workout consistency" value={`${workoutPlan?.days.filter((day) => day.title !== 'Rest').length ?? 0}/5`} unit="days" />
        <MetricCard icon={Droplets} label="Water consistency" value={`${todayTracking?.waterMl ? 6 : 4}/7`} unit="days" />
        <MetricCard icon={MoonStar} label="Sleep consistency" value="5/7" unit="days" />
      </div>

      <Card className="p-5" hover>
        <div className="mb-4 flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
          <h3 className="text-xl font-bold text-slate-900 dark:text-white">Log weight</h3>
          <div className="flex gap-2">
            <button className={`rounded-full px-3 py-2 text-sm ${view === 'week' ? 'bg-emerald-500 text-white' : 'bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-200'}`} onClick={() => setView('week')}>This Week</button>
            <button className={`rounded-full px-3 py-2 text-sm ${view === 'month' ? 'bg-emerald-500 text-white' : 'bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-200'}`} onClick={() => setView('month')}>This Month</button>
          </div>
        </div>

        <div className="grid gap-4 md:grid-cols-[1fr_auto] md:items-end">
          <label className="block">
            <span className="mb-2 block text-sm font-medium text-slate-700 dark:text-slate-200">Weight (kg)</span>
            <input type="number" value={weightInput} onChange={(e) => setWeightInput(Number(e.target.value))} className="input-field" />
          </label>
          <button className="btn-primary" onClick={addWeight}>Log weight</button>
        </div>

        <div className="mt-6 flex h-44 items-end gap-3">
          {[58, 62, 64, 68, 70, 66, 64].map((value, index) => (
            <div key={index} className="flex flex-1 flex-col items-center gap-2">
              <div className="w-full rounded-t-xl bg-gradient-to-t from-emerald-500 to-emerald-300" style={{ height: `${(value / 75) * 100}%` }} />
              <span className="text-xs text-slate-500 dark:text-slate-400">W{index + 1}</span>
            </div>
          ))}
        </div>
      </Card>
    </div>
  );
}

function HabitsPage() {
  const { habits, addCustomHabit, removeCustomHabit, updateTodayTracking, todayTracking } = useApp();
  const [habitName, setHabitName] = useState('');

  return (
    <div className="space-y-6">
      <div>
        <p className="text-sm font-semibold uppercase tracking-[0.2em] text-emerald-600 dark:text-emerald-400">Habits</p>
        <h1 className="mt-2 text-3xl font-black text-slate-900 dark:text-white">Daily habit tracking</h1>
      </div>

      <Card className="p-5" hover>
        <div className="flex flex-col gap-3 md:flex-row md:items-center">
          <input className="input-field" placeholder="Add a custom habit" value={habitName} onChange={(e) => setHabitName(e.target.value)} />
          <button className="btn-primary" onClick={() => { if (habitName.trim()) { addCustomHabit(habitName.trim(), 'Sparkles'); setHabitName(''); } }}>Add habit</button>
        </div>
      </Card>

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        {habits.map((habit) => {
          const completed = todayTracking?.habitsCompleted.includes(habit.id) ?? false;
          return (
            <Card key={habit.id} className="p-4" hover>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-50 text-emerald-600 dark:bg-emerald-900/20 dark:text-emerald-400">
                    <Sparkles className="h-5 w-5" />
                  </div>
                  <span className="font-semibold text-slate-800 dark:text-slate-100">{habit.name}</span>
                </div>
                <button className={`rounded-full px-3 py-1.5 text-xs font-semibold ${completed ? 'bg-emerald-500 text-white' : 'bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-200'}`} onClick={() => {
                  const current = todayTracking?.habitsCompleted ?? [];
                  const next = completed ? current.filter((id) => id !== habit.id) : [...current, habit.id];
                  updateTodayTracking({ habitsCompleted: next });
                }}>
                  {completed ? 'Done' : 'Mark'}
                </button>
              </div>
              {habit.isCustom && (
                <button className="mt-3 text-xs font-medium text-red-500" onClick={() => removeCustomHabit(habit.id)}>Remove</button>
              )}
            </Card>
          );
        })}
      </div>
    </div>
  );
}

function HealthProfilePage() {
  const { profile } = useApp();
  if (!profile) return null;

  const bmi = calculateBMI(profile.weightKg, profile.heightCm);
  const fitness = getFitnessCategory(profile);

  return (
    <div className="space-y-6">
      <div>
        <p className="text-sm font-semibold uppercase tracking-[0.2em] text-emerald-600 dark:text-emerald-400">Health profile</p>
        <h1 className="mt-2 text-3xl font-black text-slate-900 dark:text-white">Hi {profile.name} 👋</h1>
        <p className="mt-2 text-slate-600 dark:text-slate-300">Here is your Health Nova profile.</p>
      </div>

      <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-4">
        <MetricCard icon={Gauge} label="BMI" value={bmi.bmi} sublabel={bmi.category} />
        <MetricCard icon={Target} label="Goal" value={formatGoal(profile.goal)} />
        <MetricCard icon={TrendingUp} label="Current weight" value={`${profile.weightKg} kg`} />
        <MetricCard icon={ShieldCheck} label="Lifestyle" value={lifestyleLabels[profile.lifestyleType]} />
      </div>

      <div className="grid gap-5 xl:grid-cols-2">
        <Card className="p-5" hover>
          <h3 className="text-lg font-bold text-slate-900 dark:text-white">Health summary</h3>
          <div className="mt-4 space-y-3">
            <InfoBlock label="Fitness category" value={fitness.label} />
            <InfoBlock label="Activity level" value={profile.activityLevel.replace('_', ' ')} />
            <InfoBlock label="Diet preference" value={profile.dietType.replace('_', ' ')} />
            <InfoBlock label="Weekly workout availability" value={`${profile.exerciseDays} days`} />
            <InfoBlock label="Health considerations" value={profile.healthConditions.length ? profile.healthConditions.join(', ') : 'None'} />
          </div>
        </Card>

        <Card className="p-5" hover>
          <h3 className="text-lg font-bold text-slate-900 dark:text-white">Profile guidance</h3>
          <div className="mt-4 rounded-2xl bg-emerald-50 p-4 text-sm text-emerald-800 dark:bg-emerald-900/20 dark:text-emerald-200">
            {fitness.description}
          </div>
          <div className="mt-4 text-sm text-slate-600 dark:text-slate-300">
            BMI is a screening measure and does not directly measure body fat, muscle mass, or overall health.
          </div>
        </Card>
      </div>
    </div>
  );
}

function SettingsPage() {
  const { settings, setSettings } = useApp();
  const [localSettings, setLocalSettings] = useState(settings);

  const saveSettings = () => setSettings(localSettings);

  return (
    <div className="space-y-6">
      <div>
        <p className="text-sm font-semibold uppercase tracking-[0.2em] text-emerald-600 dark:text-emerald-400">Settings</p>
        <h1 className="mt-2 text-3xl font-black text-slate-900 dark:text-white">Profile and preferences</h1>
      </div>

      <div className="grid gap-5 lg:grid-cols-2">
        <Card className="p-5" hover>
          <h3 className="text-lg font-bold text-slate-900 dark:text-white">Profile</h3>
          <div className="mt-4 space-y-3">
            <InfoBlock label="Theme" value={localSettings.theme} />
            <InfoBlock label="Units" value={localSettings.units} />
          </div>
        </Card>

        <Card className="p-5" hover>
          <h3 className="text-lg font-bold text-slate-900 dark:text-white">Notifications</h3>
          <div className="mt-4 space-y-3">
            {Object.entries(localSettings.notifications).map(([key, value]) => (
              <label key={key} className="flex items-center justify-between gap-4 rounded-xl bg-slate-100 px-3 py-2 dark:bg-slate-800">
                <span className="text-sm font-medium text-slate-700 dark:text-slate-200">{key.replace(/([A-Z])/g, ' $1').replace(/^./, (s) => s.toUpperCase())}</span>
                <input type="checkbox" checked={value} onChange={(e) => setLocalSettings({ ...localSettings, notifications: { ...localSettings.notifications, [key]: e.target.checked } })} className="h-4 w-4 accent-emerald-500" />
              </label>
            ))}
          </div>
        </Card>

        <Card className="p-5" hover>
          <h3 className="text-lg font-bold text-slate-900 dark:text-white">Appearance</h3>
          <div className="mt-4 space-y-4">
            <label className="block">
              <span className="mb-2 block text-sm font-medium text-slate-700 dark:text-slate-200">Theme</span>
              <select className="input-field" value={localSettings.theme} onChange={(e) => setLocalSettings({ ...localSettings, theme: e.target.value as typeof localSettings.theme })}>
                <option value="light">Light</option>
                <option value="dark">Dark</option>
                <option value="system">System</option>
              </select>
            </label>
            <label className="block">
              <span className="mb-2 block text-sm font-medium text-slate-700 dark:text-slate-200">Units</span>
              <select className="input-field" value={localSettings.units} onChange={(e) => setLocalSettings({ ...localSettings, units: e.target.value as typeof localSettings.units })}>
                <option value="metric">Metric</option>
                <option value="imperial">Imperial</option>
              </select>
            </label>
          </div>
        </Card>

        <Card className="p-5" hover>
          <h3 className="text-lg font-bold text-slate-900 dark:text-white">Privacy</h3>
          <div className="mt-4 space-y-3 text-sm text-slate-600 dark:text-slate-300">
            <p>Health information is stored locally and used only for fitness and wellness guidance.</p>
            <p>Health Nova is designed to support general wellness coaching and does not provide medical diagnosis or treatment.</p>
          </div>
        </Card>
      </div>

      <button className="btn-primary" onClick={saveSettings}>Update My Plan</button>
    </div>
  );
}

function InfoBlock({ label, value }: { label: string; value: string | number }) {
  return (
    <div className="rounded-2xl bg-slate-100 px-3 py-3 dark:bg-slate-800">
      <div className="text-xs uppercase tracking-[0.12em] text-slate-500 dark:text-slate-400">{label}</div>
      <div className="mt-1 text-sm font-semibold text-slate-900 dark:text-white">{value}</div>
    </div>
  );
}

function MiniStat({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-2xl bg-white/10 p-3">
      <div className="text-xs uppercase tracking-[0.14em] text-emerald-100">{label}</div>
      <div className="mt-1 text-sm font-bold text-white">{value}</div>
    </div>
  );
}

function parseMessMenuText(menuText: string): MessMenu | null {
  if (!menuText.trim()) return null;

  const lines = menuText.split(/\n/).map((line) => line.trim()).filter(Boolean);
  const entries: MessMenuEntry[] = [];
  let currentDay: MessMenuEntry | null = null;

  const dayMap = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];

  lines.forEach((line) => {
    const dayMatch = dayMap.find((day) => line.toLowerCase().startsWith(day.toLowerCase()));
    if (dayMatch) {
      if (currentDay) entries.push(currentDay);
      currentDay = { day: dayMatch, breakfast: '', lunch: '', dinner: '', snacks: '' };
      return;
    }

    if (!currentDay) {
      currentDay = { day: dayMap[entries.length % dayMap.length], breakfast: '', lunch: '', dinner: '', snacks: '' };
    }

    if (line.toLowerCase().includes('breakfast')) {
      currentDay.breakfast = line.split(':').slice(1).join(':').trim();
    } else if (line.toLowerCase().includes('lunch')) {
      currentDay.lunch = line.split(':').slice(1).join(':').trim();
    } else if (line.toLowerCase().includes('dinner')) {
      currentDay.dinner = line.split(':').slice(1).join(':').trim();
    } else if (line.toLowerCase().includes('snack')) {
      currentDay.snacks = line.split(':').slice(1).join(':').trim();
    }
  });

  if (currentDay) entries.push(currentDay);

  if (!entries.length) return null;

  return {
    entries,
    source: 'text',
    uploadedAt: new Date().toISOString(),
  };
}

export default App;
