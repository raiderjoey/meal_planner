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
}

export type MealType = 'breakfast' | 'lunch' | 'dinner' | 'dessert' | 'drinks' | 'snacks';
export type ParticipationStatus = 'planned' | 'consumed';

export interface Nutrition {
  calories: number;
  protein: number;
  fat: number;
  carbs: number;
  fiber?: number;
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
