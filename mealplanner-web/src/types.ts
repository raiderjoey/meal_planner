export type Slot = 'breakfast' | 'lunch' | 'dinner' | 'snack';

export interface IngredientTemplate {
  name: string;
  quantity: string;
  unit: string;
  category: string;
}

export interface PrepStepTemplate {
  description: string;
  time_offset_days: number;
}

export interface Meal {
  id: string;
  name: string;
  description: string;
  image: string;
  ingredients: IngredientTemplate[];
  prep_steps: PrepStepTemplate[];
  tags: string[];
  created: string;
  updated: string;
}

export interface MealPlan {
  id: string;
  date: string; // ISO Date string
  slot: Slot;
  meal: string;
  expand?: {
    meal?: Meal;
  };
}

export interface PrepTask {
  id: string;
  description: string;
  completed: boolean;
  due_date: string; // ISO Date string
  meal_plan: string;
  expand?: {
    meal_plan?: MealPlan;
  };
}

export interface ShoppingItem {
  id: string;
  name: string;
  quantity: string;
  category: 'Produce' | 'Grains' | 'Dairy & Eggs' | 'Meat' | 'Pantry' | 'Other';
  checked: boolean;
  manual: boolean;
  created: string;
  updated: string;
}
