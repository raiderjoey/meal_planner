export interface Household {
  id: string;
  name: string;
  created_at: string;
}

export interface Profile {
  id: string;
  household_id: string;
  full_name: string;
  avatar_url?: string;
  role: 'member' | 'admin';
}

export interface SystemInfo {
  id: number;
  current_version: string;
  updated_at: string;
}

export interface SystemUpdate {
  id: string;
  target_version: string;
  status: 'pending' | 'in_progress' | 'completed' | 'failed';
  log_output: string | null;
  created_at: string;
  updated_at: string;
  created_by: string;
}

export interface Recipe {
  id: string;
  household_id: string;
  title: string;
  instructions: string | null;
  image_url?: string;
  created_at: string;
  updated_at: string;
}

export type MealType = 'breakfast' | 'lunch' | 'dinner' | 'dessert' | 'drinks' | 'snacks';
export type ParticipationStatus = 'planned' | 'consumed';

export interface Nutrition {
  calories: number;
  protein: number;
  fat: number;
  carbs: number;
  fiber?: number;
  sodium?: number;
  sugar?: number;
}

export interface Ingredient {
  id: string;
  household_id: string;
  name: string;
  calories: number;
  fat: number;
  sodium: number;
  protein: number;
  fiber: number;
  carbs: number;
  sugar: number;
  unit: string;
  category?: string;
  created_at: string;
  updated_at: string;
}

export interface PantryItem {
  id: string;
  household_id: string;
  ingredient_id: string;
  quantity: number;
  unit: string;
  is_in_stock: boolean;
  low_stock_threshold: number;
  created_at: string;
  updated_at: string;
  ingredient?: Ingredient;
}

export interface MealPlan {
  id: string;
  household_id: string;
  scheduled_date: string;
  meal_type: MealType;
  recipe_id?: string;
  standalone_data?: {
    name: string;
    nutrition: Nutrition;
  };
  created_at: string;
  updated_at: string;
}

export interface MealParticipant {
  household_id: string;
  meal_plan_id: string;
  user_id: string;
  portion_multiplier: number;
  status: ParticipationStatus;
}

export interface AdHocShoppingItem {
  id: string;
  household_id: string;
  ingredient_id?: string;
  name: string;
  quantity: number;
  unit?: string;
  is_resolved: boolean;
  created_at: string;
  updated_at: string;
}

export interface ShoppingListItem {
  ingredient_id: string | null;
  ad_hoc_id: string | null;
  name: string;
  required_quantity: number;
  pantry_quantity: number;
  buy_quantity: number;
  unit: string | null;
  source: 'recipe' | 'ad_hoc';
}
