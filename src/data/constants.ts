import type { FoodItem, Habit, MessMenuEntry } from '@/types';

export const additionalFoodsList: FoodItem[] = [
  { name: 'Eggs', category: 'protein', dietTypes: ['eggetarian', 'non_vegetarian'], allergens: ['eggs'], estimatedProteinG: 6, estimatedCalories: 78, servingNote: '1 egg' },
  { name: 'Bananas', category: 'fruits', dietTypes: ['vegetarian', 'vegan', 'eggetarian', 'non_vegetarian'], allergens: [], estimatedProteinG: 1.3, estimatedCalories: 105, servingNote: '1 medium' },
  { name: 'Apples', category: 'fruits', dietTypes: ['vegetarian', 'vegan', 'eggetarian', 'non_vegetarian'], allergens: [], estimatedProteinG: 0.5, estimatedCalories: 95, servingNote: '1 medium' },
  { name: 'Oranges', category: 'fruits', dietTypes: ['vegetarian', 'vegan', 'eggetarian', 'non_vegetarian'], allergens: [], estimatedProteinG: 1.2, estimatedCalories: 62, servingNote: '1 medium' },
  { name: 'Milk', category: 'dairy', dietTypes: ['vegetarian', 'eggetarian', 'non_vegetarian'], allergens: ['dairy'], estimatedProteinG: 8, estimatedCalories: 150, servingNote: '1 glass (250ml)' },
  { name: 'Curd', category: 'dairy', dietTypes: ['vegetarian', 'eggetarian', 'non_vegetarian'], allergens: ['dairy'], estimatedProteinG: 9, estimatedCalories: 120, servingNote: '1 bowl (200g)' },
  { name: 'Greek Yogurt', category: 'dairy', dietTypes: ['vegetarian', 'eggetarian', 'non_vegetarian'], allergens: ['dairy'], estimatedProteinG: 15, estimatedCalories: 130, servingNote: '1 bowl (200g)' },
  { name: 'Paneer', category: 'protein', dietTypes: ['vegetarian', 'eggetarian', 'non_vegetarian'], allergens: ['dairy'], estimatedProteinG: 18, estimatedCalories: 280, servingNote: '100g' },
  { name: 'Soy Chunks', category: 'protein', dietTypes: ['vegetarian', 'vegan', 'eggetarian', 'non_vegetarian'], allergens: ['soy'], estimatedProteinG: 52, estimatedCalories: 345, servingNote: '100g dry' },
  { name: 'Almonds', category: 'nuts_seeds', dietTypes: ['vegetarian', 'vegan', 'eggetarian', 'non_vegetarian'], allergens: ['nuts'], estimatedProteinG: 6, estimatedCalories: 164, servingNote: '28g (~23)' },
  { name: 'Walnuts', category: 'nuts_seeds', dietTypes: ['vegetarian', 'vegan', 'eggetarian', 'non_vegetarian'], allergens: ['nuts'], estimatedProteinG: 4.3, estimatedCalories: 185, servingNote: '28g (~14 halves)' },
  { name: 'Peanuts', category: 'nuts_seeds', dietTypes: ['vegetarian', 'vegan', 'eggetarian', 'non_vegetarian'], allergens: ['peanuts'], estimatedProteinG: 7.3, estimatedCalories: 161, servingNote: '28g' },
  { name: 'Peanut Butter', category: 'nuts_seeds', dietTypes: ['vegetarian', 'vegan', 'eggetarian', 'non_vegetarian'], allergens: ['peanuts'], estimatedProteinG: 8, estimatedCalories: 190, servingNote: '2 tbsp' },
  { name: 'Oats', category: 'carbohydrates', dietTypes: ['vegetarian', 'vegan', 'eggetarian', 'non_vegetarian'], allergens: ['gluten'], estimatedProteinG: 5, estimatedCalories: 150, servingNote: '40g dry' },
  { name: 'Sprouts', category: 'protein', dietTypes: ['vegetarian', 'vegan', 'eggetarian', 'non_vegetarian'], allergens: [], estimatedProteinG: 9, estimatedCalories: 80, servingNote: '100g' },
  { name: 'Roasted Chana', category: 'protein', dietTypes: ['vegetarian', 'vegan', 'eggetarian', 'non_vegetarian'], allergens: [], estimatedProteinG: 9, estimatedCalories: 180, servingNote: '50g' },
  { name: 'Tofu', category: 'protein', dietTypes: ['vegetarian', 'vegan', 'eggetarian', 'non_vegetarian'], allergens: ['soy'], estimatedProteinG: 8, estimatedCalories: 76, servingNote: '100g' },
  { name: 'Chia Seeds', category: 'nuts_seeds', dietTypes: ['vegetarian', 'vegan', 'eggetarian', 'non_vegetarian'], allergens: [], estimatedProteinG: 4.7, estimatedCalories: 138, servingNote: '28g' },
  { name: 'Spinach', category: 'vegetables', dietTypes: ['vegetarian', 'vegan', 'eggetarian', 'non_vegetarian'], allergens: [], estimatedProteinG: 2.9, estimatedCalories: 23, servingNote: '100g' },
  { name: 'Sweet Potato', category: 'carbohydrates', dietTypes: ['vegetarian', 'vegan', 'eggetarian', 'non_vegetarian'], allergens: [], estimatedProteinG: 2, estimatedCalories: 86, servingNote: '1 medium' },
  { name: 'Chicken Breast', category: 'protein', dietTypes: ['non_vegetarian'], allergens: [], estimatedProteinG: 31, estimatedCalories: 165, servingNote: '100g' },
  { name: 'Fish', category: 'protein', dietTypes: ['non_vegetarian'], allergens: ['seafood'], estimatedProteinG: 25, estimatedCalories: 180, servingNote: '100g' },
  { name: 'Makhana', category: 'nuts_seeds', dietTypes: ['vegetarian', 'vegan', 'eggetarian', 'non_vegetarian'], allergens: [], estimatedProteinG: 3.9, estimatedCalories: 100, servingNote: '50g' },
  { name: 'Brown Rice', category: 'carbohydrates', dietTypes: ['vegetarian', 'vegan', 'eggetarian', 'non_vegetarian'], allergens: [], estimatedProteinG: 5, estimatedCalories: 215, servingNote: '1 cup cooked' },
];

export const defaultHabits: Habit[] = [
  { id: 'workout', name: 'Complete Workout', icon: 'Dumbbell', isCustom: false },
  { id: 'water', name: 'Drink Enough Water', icon: 'Droplets', isCustom: false },
  { id: 'meals', name: 'Eat Planned Meals', icon: 'Utensils', isCustom: false },
  { id: 'veggies', name: 'Eat Vegetables/Fruits', icon: 'Apple', isCustom: false },
  { id: 'walk', name: 'Walk / Stay Active', icon: 'Footprints', isCustom: false },
  { id: 'sleep', name: 'Sleep On Time', icon: 'Moon', isCustom: false },
  { id: 'stretch', name: 'Stretch / Mobility', icon: 'Activity', isCustom: false },
];

export const allAllergies = ['Dairy', 'Eggs', 'Peanuts', 'Nuts', 'Gluten', 'Seafood', 'Chicken', 'Soy', 'Other'];

export const allHealthConditions = [
  { value: 'diabetes', label: 'Diabetes / Blood Sugar Concerns' },
  { value: 'high_bp', label: 'High Blood Pressure' },
  { value: 'low_bp', label: 'Low Blood Pressure' },
  { value: 'high_cholesterol', label: 'High Cholesterol' },
  { value: 'anemia', label: 'Low Hemoglobin / Anemia' },
  { value: 'thyroid', label: 'Thyroid Condition' },
  { value: 'asthma', label: 'Asthma' },
  { value: 'cardiovascular', label: 'Heart or Cardiovascular Condition' },
  { value: 'joint_mobility', label: 'Joint or Mobility Problems' },
  { value: 'other', label: 'Other Health Concern' },
  { value: 'none', label: 'None' },
];

export const goalLabels: Record<string, string> = {
  lose_weight: 'Lose Weight',
  gain_weight: 'Gain Weight',
  build_muscle: 'Build Muscle',
  maintain: 'Maintain Current Fitness',
  improve_fitness: 'Improve Overall Fitness',
  improve_endurance: 'Improve Endurance',
  improve_strength: 'Improve Strength',
};

export const activityLabels: Record<string, string> = {
  sedentary: 'Sedentary',
  lightly_active: 'Lightly Active',
  moderately_active: 'Moderately Active',
  very_active: 'Very Active',
  athlete: 'Athlete / Highly Active',
};

export const activityMultipliers: Record<string, number> = {
  sedentary: 1.2,
  lightly_active: 1.375,
  moderately_active: 1.55,
  very_active: 1.725,
  athlete: 1.9,
};

export const dietLabels: Record<string, string> = {
  vegetarian: 'Vegetarian',
  non_vegetarian: 'Non-Vegetarian',
  eggetarian: 'Eggetarian',
  vegan: 'Vegan',
};

export const lifestyleLabels: Record<string, string> = {
  hostel: 'Hostel / Mess',
  home: 'Home',
  outside: 'Outside / Mixed',
};

export const environmentLabels: Record<string, string> = {
  gym: 'Gym',
  home: 'Home',
  outdoor: 'Outdoor',
  mixed: 'Mixed',
};

export const experienceLabels: Record<string, string> = {
  beginner: 'Beginner',
  intermediate: 'Intermediate',
  advanced: 'Advanced',
};

export const moodLabels: Record<string, string> = {
  great: 'Great',
  good: 'Good',
  okay: 'Okay',
  low_energy: 'Low Energy',
  tired: 'Tired',
};

export const moodEmojis: Record<string, string> = {
  great: '\u{1F60A}',
  good: '\u{1F642}',
  okay: '\u{1F610}',
  low_energy: '\u{1F614}',
  tired: '\u{1F634}',
};

export const sampleMessMenu: MessMenuEntry[] = [
  { day: 'Monday', breakfast: 'Poha + Tea', lunch: 'Rice + Dal + Mixed Veg + Roti + Curd', dinner: 'Roti + Paneer Sabji + Dal + Rice', snacks: 'Biscuits + Tea' },
  { day: 'Tuesday', breakfast: 'Idli + Sambar + Chutney', lunch: 'Rice + Rajma + Roti + Sabji + Curd', dinner: 'Roti + Chole + Rice + Salad', snacks: 'Sprouts + Tea' },
  { day: 'Wednesday', breakfast: 'Upma + Tea', lunch: 'Rice + Dal + Aloo Sabji + Roti + Curd', dinner: 'Roti + Dal + Rice + Sabji', snacks: 'Poha + Tea' },
  { day: 'Thursday', breakfast: 'Poha + Boiled Egg', lunch: 'Rice + Chole + Roti + Sabji + Curd', dinner: 'Roti + Paneer + Rice + Dal', snacks: 'Biscuits + Tea' },
  { day: 'Friday', breakfast: 'Aloo Paratha + Curd', lunch: 'Rice + Dal + Mixed Veg + Roti + Curd', dinner: 'Roti + Rajma + Rice + Salad', snacks: 'Sprouts + Tea' },
  { day: 'Saturday', breakfast: 'Idli + Sambar', lunch: 'Rice + Dal + Roti + Sabji + Curd', dinner: 'Roti + Dal + Rice + Sabji', snacks: 'Poha + Tea' },
  { day: 'Sunday', breakfast: 'Puri + Sabji + Tea', lunch: 'Rice + Dal + Special Sabji + Roti + Ice Cream', dinner: 'Roti + Paneer + Rice + Dal', snacks: 'Sweets + Tea' },
];

export const faqs = [
  {
    q: 'Is Health Nova a medical app?',
    a: 'No. Health Nova provides general wellness guidance and is not a substitute for professional medical advice. If you have a medical condition, are taking medication, are pregnant, recovering from an injury, or experience concerning symptoms, consult a qualified healthcare professional before changing your diet or exercise routine.',
  },
  {
    q: 'How does the hostel mess optimizer work?',
    a: 'You upload or enter your weekly mess menu. Health Nova organizes it by day and meal, estimates the nutritional composition of each meal, and compares it against your personalized nutrition targets. It then suggests additions or adjustments to help you meet your protein, calorie, and nutrient goals.',
  },
  {
    q: 'Are the nutrition numbers exact?',
    a: 'No. All nutritional values are estimates meant to guide your food choices. Actual values depend on portion sizes, ingredients, and preparation methods. Use them as a helpful reference, not as exact measurements.',
  },
  {
    q: 'Can I use Health Nova if I am vegetarian or vegan?',
    a: 'Yes. Health Nova fully supports vegetarian, vegan, eggetarian, and non-vegetarian diets. Your meal plan, food recommendations, and mess optimization are all tailored to your dietary preference and allergies.',
  },
  {
    q: 'Is my health data stored securely?',
    a: 'In this version, your data is stored locally on your device using browser storage. It does not leave your device. The architecture is designed so a secure backend can be connected in the future.',
  },
  {
    q: 'Can I edit my profile after onboarding?',
    a: 'Yes. You can update your weight, goal, activity level, diet, allergies, health conditions, workout preferences, mess menu, and additional foods at any time from the Health Profile or Settings pages.',
  },
];
