export type Category = 'breakfast' | 'lunch' | 'dinner' | 'dessert' | 'snack';

export interface Recipe {
  id: string;
  name: string;
  image: string;
  prep_time: string;
  servings: number;
  calories: number;
  tags: string[];
  description: string;
  instructions: string;
}

export interface Meal {
  id: string;
  day_of_week: string; // ISO Date string
  name: string;
  category: Category;
  recipe_id: string;
  expand?: {
    recipe_id?: Recipe;
    'ingredients_via_meal_id'?: Ingredient[];
  };
}

export interface Ingredient {
  id: string;
  meal_id: string;
  name: string;
  added_to_shopping_list: boolean;
  category: 'Produce' | 'Grains' | 'Dairy & Eggs' | 'Meat' | 'Pantry' | 'Other';
  quantity: string;
  expand?: {
    meal_id?: Meal;
  };
}

export interface PrepTask {
  id: string;
  title: string;
  meal_id: string;
  is_completed: boolean;
  priority: string;
  target_date: string; // ISO Date string
  expand?: {
    meal_id?: Meal;
  };
}
