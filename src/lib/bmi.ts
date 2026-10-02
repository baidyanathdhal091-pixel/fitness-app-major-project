import type { BMIDetails, FitnessCategory, UserProfile, NutritionTargets } from '@/types';

export function calculateBMI(weightKg: number, heightCm: number): BMIDetails {
  const heightM = heightCm / 100;
  const bmi = weightKg / (heightM * heightM);

  let category: string;
  if (bmi < 18.5) category = 'Underweight';
  else if (bmi < 25) category = 'Healthy Weight';
  else if (bmi < 30) category = 'Overweight';
  else category = 'Obese';

  const healthyRangeLow = 18.5;
  const healthyRangeHigh = 24.9;
  const healthyWeightLow = healthyRangeLow * heightM * heightM;
  const healthyWeightHigh = healthyRangeHigh * heightM * heightM;

  return {
    bmi: Math.round(bmi * 10) / 10,
    category,
    healthyRangeLow,
    healthyRangeHigh,
    healthyWeightLow: Math.round(healthyWeightLow * 10) / 10,
    healthyWeightHigh: Math.round(healthyWeightHigh * 10) / 10,
  };
}

export function getFitnessCategory(profile: UserProfile): FitnessCategory {
  const bmi = calculateBMI(profile.weightKg, profile.heightCm).bmi;
  const goal = profile.goal;

  if (goal === 'build_muscle') {
    return { key: 'muscle_building', label: 'Muscle Building Goal', description: 'Focus on progressive resistance training and adequate protein intake to build muscle mass.' };
  }
  if (goal === 'lose_weight' || (goal === 'improve_fitness' && bmi >= 25)) {
    return { key: 'fat_loss', label: 'Fat Loss Goal', description: 'Focus on a moderate calorie deficit, regular exercise, and protein-rich meals to support healthy fat loss.' };
  }
  if (goal === 'gain_weight') {
    return { key: 'healthy_weight_gain', label: 'Healthy Weight Gain Goal', description: 'Focus on a calorie surplus with nutrient-rich foods and strength training for healthy weight gain.' };
  }
  if (goal === 'improve_endurance') {
    return { key: 'endurance', label: 'Endurance Goal', description: 'Focus on cardiovascular training, consistent hydration, and balanced nutrition for stamina.' };
  }
  if (goal === 'improve_strength') {
    return { key: 'strength', label: 'Strength Goal', description: 'Focus on heavy compound movements, progressive overload, and adequate recovery.' };
  }
  if (goal === 'maintain') {
    return { key: 'maintain', label: 'Maintain Fitness', description: 'Focus on balanced nutrition, regular activity, and consistent habits to maintain your current fitness.' };
  }
  return { key: 'general_fitness', label: 'General Fitness', description: 'Focus on balanced activity, healthy eating, and sustainable habits for overall fitness.' };
}

export function calculateBMR(weightKg: number, heightCm: number, age: number, gender: string): number {
  // Mifflin-St Jeor Equation
  const base = 10 * weightKg + 6.25 * heightCm - 5 * age;
  if (gender === 'male') return base + 5;
  if (gender === 'female') return base - 161;
  return base - 78;
}

export function calculateNutritionTargets(profile: UserProfile): NutritionTargets {
  const bmr = calculateBMR(profile.weightKg, profile.heightCm, profile.age, profile.gender);
  const activityMultipliers: Record<string, number> = {
    sedentary: 1.2,
    lightly_active: 1.375,
    moderately_active: 1.55,
    very_active: 1.725,
    athlete: 1.9,
  };
  const tdee = bmr * (activityMultipliers[profile.activityLevel] || 1.2);

  let calories = tdee;
  switch (profile.goal) {
    case 'lose_weight':
      calories = tdee - 400;
      break;
    case 'gain_weight':
      calories = tdee + 400;
      break;
    case 'build_muscle':
      calories = tdee + 250;
      break;
    case 'improve_endurance':
      calories = tdee + 100;
      break;
    case 'improve_strength':
      calories = tdee + 200;
      break;
    default:
      calories = tdee;
  }

  calories = Math.round(calories / 10) * 10;

  // Macro splits based on goal
  let proteinPerKg = 1.6;
  let fatPct = 0.25;

  switch (profile.goal) {
    case 'build_muscle':
      proteinPerKg = 2.0;
      fatPct = 0.25;
      break;
    case 'lose_weight':
      proteinPerKg = 2.0;
      fatPct = 0.25;
      break;
    case 'improve_strength':
      proteinPerKg = 2.0;
      fatPct = 0.3;
      break;
    case 'gain_weight':
      proteinPerKg = 1.6;
      fatPct = 0.3;
      break;
    case 'improve_endurance':
      proteinPerKg = 1.4;
      fatPct = 0.25;
      break;
    default:
      proteinPerKg = 1.5;
      fatPct = 0.25;
  }

  const proteinG = Math.round(profile.weightKg * proteinPerKg);
  const fatG = Math.round((calories * fatPct) / 9);
  const carbsG = Math.round((calories - proteinG * 4 - fatG * 9) / 4);
  const fiberG = Math.round(calories / 70);
  const waterMl = Math.round(profile.weightKg * 35);

  return { calories, proteinG, carbsG, fatG, fiberG, waterMl };
}

export function cmToFeetInches(cm: number): { feet: number; inches: number } {
  const totalInches = cm / 2.54;
  const feet = Math.floor(totalInches / 12);
  const inches = Math.round(totalInches % 12);
  return { feet, inches };
}

export function feetInchesToCm(feet: number, inches: number): number {
  return Math.round((feet * 12 + inches) * 2.54);
}

export function kgToLbs(kg: number): number {
  return Math.round(kg * 2.205 * 10) / 10;
}

export function lbsToKg(lbs: number): number {
  return Math.round((lbs / 2.205) * 10) / 10;
}
