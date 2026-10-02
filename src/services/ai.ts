import type { UserProfile, WorkoutPlan, MealPlan, MessMenu, NutritionSuggestion, NutritionTargets, MessAnalysisItem } from '@/types';
import { generateWorkoutPlan } from '@/lib/workoutEngine';
import { generateMealPlan, analyzeMessMenu, generateNutritionSuggestions } from '@/lib/mealEngine';
import { calculateNutritionTargets } from '@/lib/bmi';

/**
 * AI Service Layer
 * 
 * Currently uses deterministic rule-based logic and seed data.
 * This architecture makes it easy to connect OpenAI or another AI provider later.
 * 
 * To connect an AI provider:
 * 1. Replace the function implementations with API calls
 * 2. Add API key to environment variables
 * 3. Add request/response types
 */

export interface AIGenerateWorkoutParams {
  profile: UserProfile;
}

export interface AIGenerateMealPlanParams {
  profile: UserProfile;
  days?: number;
}

export interface AIAnalyzeMessMenuParams {
  menu: MessMenu;
  profile: UserProfile;
}

export interface AIGenerateNutritionSuggestionsParams {
  profile: UserProfile;
  targets: NutritionTargets;
  dayPlan: MealPlan['days'][0] | null;
}

export interface AIAnalyzeUserProfileParams {
  profile: UserProfile;
}

// Workout Plan Generation
export async function generateWorkoutPlanAI(params: AIGenerateWorkoutParams): Promise<WorkoutPlan> {
  // Currently uses deterministic engine
  // Future: call AI API with profile context
  return generateWorkoutPlan(params.profile);
}

// Meal Plan Generation
export async function generateMealPlanAI(params: AIGenerateMealPlanParams): Promise<MealPlan> {
  // Currently uses deterministic engine
  // Future: call AI API with profile and food database
  return generateMealPlan(params.profile, params.days || 30);
}

// Mess Menu Analysis
export async function analyzeMessMenuAI(params: AIAnalyzeMessMenuParams): Promise<MessAnalysisItem[]> {
  // Currently uses keyword-based estimation
  // Future: AI-powered extraction from uploaded images/PDFs
  return analyzeMessMenu(params.menu, params.profile);
}

// Nutrition Suggestions
export async function generateNutritionSuggestionsAI(params: AIGenerateNutritionSuggestionsParams): Promise<NutritionSuggestion[]> {
  // Currently uses rule-based logic
  // Future: AI-powered contextual suggestions
  return generateNutritionSuggestions(params.dayPlan, params.targets, params.profile);
}

// Daily Recommendations
export async function generateDailyRecommendationsAI(profile: UserProfile): Promise<string> {
  // Currently uses rule-based logic
  // Future: AI-powered personalized daily tips
  const tips: string[] = [];
  
  if (profile.goal === 'build_muscle') {
    tips.push('Stay consistent today. Small actions repeated daily create long term results. Focus on hitting your protein target.');
  } else if (profile.goal === 'lose_weight') {
    tips.push('Stay consistent today. Small actions repeated daily create long term results. Focus on portion control and staying active.');
  } else if (profile.goal === 'gain_weight') {
    tips.push('Stay consistent today. Small actions repeated daily create long term results. Make sure you are eating enough calories.');
  } else {
    tips.push('Stay consistent today. Small actions repeated daily create long term results.');
  }

  if (profile.lifestyleType === 'hostel') {
    tips.push('Because you selected a hostel lifestyle, Health Nova will optimize your meals around your mess menu.');
  }

  if (profile.healthConditions.length > 0 && !profile.healthConditions.includes('none')) {
    tips.push('Remember to consult a healthcare professional before making significant changes to your diet or exercise routine.');
  }

  return tips[Math.floor(Math.random() * tips.length)];
}

// User Profile Analysis
export async function analyzeUserProfileAI(params: AIAnalyzeUserProfileParams): Promise<{
  summary: string;
  recommendations: string[];
}> {
  const targets = calculateNutritionTargets(params.profile);
  const recommendations: string[] = [];
  
  recommendations.push(`Your daily calorie target is approximately ${targets.calories} kcal with ${targets.proteinG}g protein.`);
  recommendations.push(`Aim to drink about ${(targets.waterMl / 1000).toFixed(1)}L of water daily.`);
  
  if (params.profile.goal === 'build_muscle' || params.profile.goal === 'improve_strength') {
    recommendations.push('Prioritize progressive overload in your workouts and ensure adequate protein intake.');
  }
  
  if (params.profile.goal === 'lose_weight') {
    recommendations.push('Focus on a moderate calorie deficit, regular exercise, and protein-rich meals.');
  }

  if (params.profile.lifestyleType === 'hostel') {
    recommendations.push('Upload your mess menu to get personalized meal optimization for hostel food.');
  }

  return {
    summary: `Your plan has been customized for your ${params.profile.goal.replace('_', ' ')} goal and ${params.profile.dietType.replace('_', ' ')} dietary preference.`,
    recommendations,
  };
}
