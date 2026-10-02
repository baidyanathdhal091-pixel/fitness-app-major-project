import type { UserProfile, MealPlan, DayMealPlan, Meal, DietType, FitnessGoal, NutritionTargets, NutritionSuggestion, MessAnalysisItem, MessMenu, ShoppingListItem } from '@/types';
import { getMealsByType, mealDatabase } from '@/data/meals';
import { calculateNutritionTargets } from './bmi';

export function generateMealPlan(profile: UserProfile, days: number = 30): MealPlan {
  const targets = calculateNutritionTargets(profile);
  const mealsByType = {
    breakfast: getMealsByType('breakfast', profile.dietType, profile.allergies, profile.goal),
    mid_morning: getMealsByType('mid_morning', profile.dietType, profile.allergies, profile.goal),
    lunch: getMealsByType('lunch', profile.dietType, profile.allergies, profile.goal),
    evening_snack: getMealsByType('evening_snack', profile.dietType, profile.allergies, profile.goal),
    dinner: getMealsByType('dinner', profile.dietType, profile.allergies, profile.goal),
  };

  // Fallback: if no meals match the goal filter, relax goal constraint
  const relaxGoal = (type: Meal['type']) => {
    if (mealsByType[type].length === 0) {
      return mealDatabase.filter((m) => m.type === type && m.dietTypes.includes(profile.dietType) && !m.allergens.some((a) => profile.allergies.includes(a)));
    }
    return mealsByType[type];
  };

  const pools = {
    breakfast: relaxGoal('breakfast'),
    mid_morning: relaxGoal('mid_morning'),
    lunch: relaxGoal('lunch'),
    evening_snack: relaxGoal('evening_snack'),
    dinner: relaxGoal('dinner'),
  };

  // Fallback: if still empty, use all diet-compatible meals
  Object.keys(pools).forEach((key) => {
    const k = key as keyof typeof pools;
    if (pools[k].length === 0) {
      pools[k] = mealDatabase.filter((m) => m.type === k && m.dietTypes.includes(profile.dietType));
    }
    if (pools[k].length === 0) {
      pools[k] = mealDatabase.filter((m) => m.type === k);
    }
  });

  const dayPlans: DayMealPlan[] = [];

  for (let i = 0; i < days; i++) {
    const breakfast = pools.breakfast[i % pools.breakfast.length];
    const midMorning = pools.mid_morning[i % pools.mid_morning.length];
    const lunch = pools.lunch[i % pools.lunch.length];
    const eveningSnack = pools.evening_snack[i % pools.evening_snack.length];
    const dinner = pools.dinner[i % pools.dinner.length];

    const totalCalories = breakfast.estimatedCalories + midMorning.estimatedCalories + lunch.estimatedCalories + eveningSnack.estimatedCalories + dinner.estimatedCalories;
    const totalProteinG = breakfast.estimatedProteinG + midMorning.estimatedProteinG + lunch.estimatedProteinG + eveningSnack.estimatedProteinG + dinner.estimatedProteinG;
    const totalCarbsG = breakfast.estimatedCarbsG + midMorning.estimatedCarbsG + lunch.estimatedCarbsG + eveningSnack.estimatedCarbsG + dinner.estimatedCarbsG;
    const totalFatG = breakfast.estimatedFatG + midMorning.estimatedFatG + lunch.estimatedFatG + eveningSnack.estimatedFatG + dinner.estimatedFatG;
    const totalFiberG = breakfast.estimatedFiberG + midMorning.estimatedFiberG + lunch.estimatedFiberG + eveningSnack.estimatedFiberG + dinner.estimatedFiberG;

    dayPlans.push({
      day: i + 1,
      week: Math.floor(i / 7) + 1,
      breakfast,
      midMorning,
      lunch,
      eveningSnack,
      dinner,
      totalCalories,
      totalProteinG,
      totalCarbsG,
      totalFatG,
      totalFiberG,
    });
  }

  return {
    days: dayPlans,
    generatedAt: new Date().toISOString(),
  };
}

export function getTodayMealPlan(plan: MealPlan): DayMealPlan | null {
  const dayOfYear = Math.floor((Date.now() - new Date(new Date().getFullYear(), 0, 0).getTime()) / 86400000);
  return plan.days[dayOfYear % plan.days.length] || plan.days[0] || null;
}

export function getMealPlanForDay(plan: MealPlan, day: number): DayMealPlan | null {
  return plan.days.find((d) => d.day === day) || null;
}

export function getMealPlanForWeek(plan: MealPlan, week: number): DayMealPlan[] {
  return plan.days.filter((d) => d.week === week);
}

export function generateNutritionSuggestions(
  dayPlan: DayMealPlan | null,
  targets: NutritionTargets,
  profile: UserProfile,
): NutritionSuggestion[] {
  if (!dayPlan) return [];
  const suggestions: NutritionSuggestion[] = [];

  const proteinRatio = dayPlan.totalProteinG / targets.proteinG;
  const carbRatio = dayPlan.totalCarbsG / targets.carbsG;
  const fiberRatio = dayPlan.totalFiberG / targets.fiberG;
  const calorieRatio = dayPlan.totalCalories / targets.calories;

  // Protein check
  if (proteinRatio < 0.7) {
    const proteinFoods = profile.dietType === 'vegan'
      ? 'soy chunks, tofu, sprouts, lentils, or peanut butter'
      : profile.dietType === 'vegetarian'
        ? 'eggs (if eggetarian), paneer, curd, soy chunks, sprouts, or lentils'
        : 'eggs, chicken, fish, paneer, curd, or soy chunks';
    suggestions.push({
      type: 'low_protein',
      message: `Your total protein intake today is estimated at ${dayPlan.totalProteinG}g, which may be below your target of ${targets.proteinG}g.`,
      recommendation: `Consider adding ${proteinFoods} to your meals to help reach your protein target.`,
    });
  }

  // Carb check
  if (carbRatio > 1.3 && (profile.goal === 'lose_weight' || profile.goal === 'improve_fitness')) {
    suggestions.push({
      type: 'high_carb',
      message: 'Your meals today contain several carbohydrate sources. Depending on your daily target, consider keeping the additional rice or roti portion moderate.',
      recommendation: 'Consider balancing with more protein-rich foods and vegetables.',
    });
  }

  // Fiber check
  if (fiberRatio < 0.6) {
    suggestions.push({
      type: 'low_fiber',
      message: 'Your fiber intake appears low today. Vegetables, fruits, and whole grains are good fiber sources.',
      recommendation: 'Consider adding a serving of vegetables, salad, or fresh fruit to your meals.',
    });
  }

  // Calorie check
  if (calorieRatio < 0.8 && (profile.goal === 'gain_weight' || profile.goal === 'build_muscle')) {
    suggestions.push({
      type: 'low_calorie',
      message: `Your estimated calorie intake today is around ${dayPlan.totalCalories}, which may be below your target of ${targets.calories} for your ${profile.goal.replace('_', ' ')} goal.`,
      recommendation: 'Consider adding nutrient-rich calorie sources like nuts, peanut butter, bananas, or an extra serving at meals.',
    });
  }

  if (calorieRatio > 1.2 && profile.goal === 'lose_weight') {
    suggestions.push({
      type: 'high_calorie',
      message: `Your estimated calorie intake today is around ${dayPlan.totalCalories}, which is above your target of ${targets.calories}.`,
      recommendation: 'Consider reducing portion sizes slightly, especially of calorie-dense foods, while keeping protein and vegetables adequate.',
    });
  }

  if (suggestions.length === 0) {
    suggestions.push({
      type: 'good_balance',
      message: 'Your meals today appear reasonably balanced for your goals.',
      recommendation: 'Continue maintaining variety in your food choices and stay consistent with your plan.',
    });
  }

  return suggestions;
}

// Mess menu estimation keywords
const nutritionKeywords: Record<string, { proteinG: number; carbsG: number; fatG: number; fiberG: number; calories: number }> = {
  rice: { proteinG: 4, carbsG: 45, fatG: 1, fiberG: 1, calories: 205 },
  roti: { proteinG: 3, carbsG: 18, fatG: 3, fiberG: 3, calories: 120 },
  dal: { proteinG: 9, carbsG: 20, fatG: 1, fiberG: 6, calories: 130 },
  paneer: { proteinG: 14, carbsG: 5, fatG: 15, fiberG: 1, calories: 265 },
  chicken: { proteinG: 25, carbsG: 2, fatG: 8, fiberG: 0, calories: 180 },
  fish: { proteinG: 22, carbsG: 0, fatG: 6, fiberG: 0, calories: 140 },
  egg: { proteinG: 6, carbsG: 1, fatG: 5, fiberG: 0, calories: 78 },
  vegetables: { proteinG: 2, carbsG: 10, fatG: 1, fiberG: 4, calories: 60 },
  sabji: { proteinG: 3, carbsG: 12, fatG: 5, fiberG: 3, calories: 100 },
  curd: { proteinG: 9, carbsG: 8, fatG: 4, fiberG: 0, calories: 100 },
  poha: { proteinG: 4, carbsG: 25, fatG: 4, fiberG: 2, calories: 170 },
  idli: { proteinG: 3, carbsG: 18, fatG: 1, fiberG: 2, calories: 100 },
  sambar: { proteinG: 5, carbsG: 15, fatG: 2, fiberG: 5, calories: 100 },
  upma: { proteinG: 3, carbsG: 22, fatG: 5, fiberG: 2, calories: 150 },
  chole: { proteinG: 12, carbsG: 30, fatG: 5, fiberG: 10, calories: 210 },
  rajma: { proteinG: 11, carbsG: 28, fatG: 5, fiberG: 11, calories: 200 },
  paratha: { proteinG: 5, carbsG: 30, fatG: 10, fiberG: 3, calories: 230 },
  sprouts: { proteinG: 7, carbsG: 12, fatG: 1, fiberG: 5, calories: 90 },
  salad: { proteinG: 1, carbsG: 5, fatG: 1, fiberG: 3, calories: 30 },
  khichdi: { proteinG: 8, carbsG: 35, fatG: 6, fiberG: 4, calories: 220 },
  soy: { proteinG: 26, carbsG: 20, fatG: 6, fiberG: 5, calories: 240 },
  biscuits: { proteinG: 1, carbsG: 12, fatG: 4, fiberG: 1, calories: 85 },
  tea: { proteinG: 0, carbsG: 5, fatG: 1, fiberG: 0, calories: 30 },
  puri: { proteinG: 3, carbsG: 25, fatG: 12, fiberG: 1, calories: 220 },
};

export function estimateMealNutrition(mealDescription: string): { proteinG: number; carbsG: number; fatG: number; fiberG: number; calories: number } {
  const lower = mealDescription.toLowerCase();
  let totals = { proteinG: 0, carbsG: 0, fatG: 0, fiberG: 0, calories: 0 };
  let matched = false;

  for (const [keyword, values] of Object.entries(nutritionKeywords)) {
    if (lower.includes(keyword)) {
      totals.proteinG += values.proteinG;
      totals.carbsG += values.carbsG;
      totals.fatG += values.fatG;
      totals.fiberG += values.fiberG;
      totals.calories += values.calories;
      matched = true;
    }
  }

  if (!matched) {
    return { proteinG: 8, carbsG: 40, fatG: 8, fiberG: 3, calories: 260 };
  }

  return totals;
}

export function analyzeMessMenu(menu: MessMenu, profile: UserProfile): MessAnalysisItem[] {
  const targets = calculateNutritionTargets(profile);
  const perMealProtein = targets.proteinG / 3;
  const perMealCalories = targets.calories / 3;
  const perMealCarbs = targets.carbsG / 3;

  return menu.entries.map((entry) => {
    const meals = [
      { mealName: 'Breakfast', food: entry.breakfast },
      { mealName: 'Lunch', food: entry.lunch },
      { mealName: 'Dinner', food: entry.dinner },
    ];

    return meals.map((m) => {
      const nutrition = estimateMealNutrition(m.food);
      const gaps: string[] = [];
      const additions: string[] = [];
      const reduce: string[] = [];

      // Protein gap
      if (nutrition.proteinG < perMealProtein * 0.6) {
        gaps.push(`Protein may be relatively low for your current goal (estimated ${nutrition.proteinG}g vs target ~${Math.round(perMealProtein)}g).`);
        if (profile.dietType === 'vegan') {
          additions.push('Consider adding soy chunks, tofu, or sprouts.');
        } else if (profile.dietType === 'vegetarian') {
          additions.push('Consider adding paneer, curd, soy chunks, or sprouts.');
        } else if (profile.dietType === 'eggetarian') {
          additions.push('Consider adding 2 eggs or paneer.');
        } else {
          additions.push('Consider adding eggs, chicken, or fish if available.');
        }
      }

      // Carb check
      if (nutrition.carbsG > perMealCarbs * 1.3) {
        reduce.push('Your meal already contains a substantial carbohydrate source. Depending on your daily target, consider keeping the additional rice or roti portion moderate.');
      }

      // Fiber gap
      if (nutrition.fiberG < 4) {
        gaps.push('Fiber intake may be low for this meal.');
        additions.push('Consider adding a serving of vegetables or salad.');
      }

      // Calorie check
      if (nutrition.calories < perMealCalories * 0.6 && (profile.goal === 'gain_weight' || profile.goal === 'build_muscle')) {
        gaps.push(`Calories may be below your target for this meal (estimated ${nutrition.calories} vs ~${Math.round(perMealCalories)}).`);
        additions.push('Consider adding nuts, banana, or an extra portion.');
      }

      return {
        day: entry.day,
        meal: m.mealName,
        messFood: m.food,
        estimatedProteinG: nutrition.proteinG,
        estimatedCarbsG: nutrition.carbsG,
        estimatedFatG: nutrition.fatG,
        estimatedCalories: nutrition.calories,
        estimatedFiberG: nutrition.fiberG,
        nutritionalGaps: gaps,
        recommendedAdditions: additions,
        reduceItems: reduce,
      };
    });
  }).flat();
}

// Food swap system
const foodSwaps: Record<string, { vegetarian: string; vegan: string; non_vegetarian: string; eggetarian: string }> = {
  chicken: { vegetarian: 'Paneer, Soy Chunks, or Dal', vegan: 'Tofu, Soy Chunks, or Lentils', non_vegetarian: 'Chicken', eggetarian: 'Eggs or Paneer' },
  fish: { vegetarian: 'Paneer, Soy Chunks, or Curd', vegan: 'Tofu, Soy Chunks, or Lentils', non_vegetarian: 'Fish', eggetarian: 'Eggs or Paneer' },
  eggs: { vegetarian: 'Paneer, Greek Yogurt, or Soy Chunks', vegan: 'Tofu, Soy Chunks, or Chickpea Flour', non_vegetarian: 'Eggs', eggetarian: 'Eggs' },
  milk: { vegetarian: 'Milk or Curd', vegan: 'Soy Milk, Almond Milk, or Oat Milk', non_vegetarian: 'Milk or Curd', eggetarian: 'Milk or Curd' },
  paneer: { vegetarian: 'Paneer', vegan: 'Tofu', non_vegetarian: 'Chicken or Eggs', eggetarian: 'Eggs or Paneer' },
  rice: { vegetarian: 'Roti, Jowar, or Brown Rice', vegan: 'Roti, Jowar, or Brown Rice', non_vegetarian: 'Roti, Jowar, or Brown Rice', eggetarian: 'Roti, Jowar, or Brown Rice' },
};

export function getFoodSwap(food: string, dietType: DietType): string | null {
  const lower = food.toLowerCase();
  for (const [key, swaps] of Object.entries(foodSwaps)) {
    if (lower.includes(key)) {
      return swaps[dietType];
    }
  }
  return null;
}

// Shopping list generator
export function generateShoppingList(mealPlan: MealPlan, week: number, profile: UserProfile): ShoppingListItem[] {
  const weekMeals = getMealPlanForWeek(mealPlan, week);
  const ingredientMap = new Map<string, Set<string>>();

  weekMeals.forEach((day) => {
    [day.breakfast, day.midMorning, day.lunch, day.eveningSnack, day.dinner].forEach((meal) => {
      meal.ingredients.forEach((ing) => {
        const key = ing.toLowerCase().trim();
        if (!ingredientMap.has(key)) {
          ingredientMap.set(key, new Set());
        }
        ingredientMap.get(key)!.add(meal.name);
      });
    });
  });

  const categoryMap: Record<string, string> = {
    rice: 'carbohydrates', roti: 'carbohydrates', bread: 'carbohydrates', oats: 'carbohydrates',
    'brown rice': 'carbohydrates', 'whole wheat': 'carbohydrates', semolina: 'carbohydrates',
    'flattened rice': 'carbohydrates', rava: 'carbohydrates', quinoa: 'carbohydrates',
    dal: 'protein', 'moong dal': 'protein', 'urad dal': 'protein', chickpeas: 'protein',
    'kidney beans': 'protein', 'soy chunks': 'protein', paneer: 'protein', tofu: 'protein',
    chicken: 'protein', fish: 'protein', eggs: 'protein', egg: 'protein',
    sprouts: 'protein', 'roasted chana': 'protein',
    banana: 'fruits', apple: 'fruits', orange: 'fruits', lemon: 'fruits',
    milk: 'dairy', curd: 'dairy', 'greek yogurt': 'dairy', yogurt: 'dairy', butter: 'dairy',
    'soy milk': 'dairy', cream: 'dairy',
    almonds: 'nuts_seeds', walnuts: 'nuts_seeds', 'peanut butter': 'nuts_seeds',
    peanuts: 'nuts_seeds', 'chia seeds': 'nuts_seeds', 'pumpkin seeds': 'nuts_seeds',
    'sunflower seeds': 'nuts_seeds', makhana: 'nuts_seeds', 'fox nuts': 'nuts_seeds',
    spinach: 'vegetables', tomato: 'vegetables', onion: 'vegetables',
    cucumber: 'vegetables', carrot: 'vegetables', lettuce: 'vegetables',
    vegetables: 'vegetables', 'mixed vegetables': 'vegetables',
  };

  const items: ShoppingListItem[] = [];
  let idCounter = 0;

  ingredientMap.forEach((_, ingredient) => {
    let category = 'other';
    for (const [key, cat] of Object.entries(categoryMap)) {
      if (ingredient.includes(key)) {
        category = cat;
        break;
      }
    }
    items.push({
      id: `shop_${idCounter++}`,
      name: ingredient.charAt(0).toUpperCase() + ingredient.slice(1),
      category,
      checked: false,
      isCustom: false,
    });
  });

  return items.sort((a, b) => {
    const catOrder = ['protein', 'carbohydrates', 'fruits', 'vegetables', 'dairy', 'nuts_seeds', 'other'];
    const catDiff = catOrder.indexOf(a.category) - catOrder.indexOf(b.category);
    if (catDiff !== 0) return catDiff;
    return a.name.localeCompare(b.name);
  });
}
