import { describe, it, expect } from 'vitest';
import { getPrepTasks } from '../prepAggregator';
import { MealPlan, Recipe } from '../../types/database';

describe('prepAggregator', () => {
  it('should extract prep tasks from recipe instructions', () => {
    const meals: (MealPlan & { recipe?: Recipe })[] = [
      {
        id: 'meal-1',
        household_id: 'house-1',
        scheduled_date: '2026-05-20',
        meal_type: 'dinner',
        recipe_id: 'recipe-1',
        created_at: '',
        updated_at: '',
        recipe: {
          id: 'recipe-1',
          household_id: 'house-1',
          title: 'Marinated Chicken',
          instructions: 'Prep ahead: Marinate chicken for 2 hours. Cook chicken in a pan. Serve with rice.',
          created_at: '',
          updated_at: ''
        }
      }
    ];

    const tasks = getPrepTasks(meals);
    expect(tasks).toHaveLength(1);
    expect(tasks[0].description).toBe('Prep ahead: Marinate chicken for 2 hours');
    expect(tasks[0].recipeId).toBe('recipe-1');
  });

  it('should identify multiple prep tasks in one recipe', () => {
    const meals: (MealPlan & { recipe?: Recipe })[] = [
      {
        id: 'meal-1',
        household_id: 'house-1',
        scheduled_date: '2026-05-20',
        meal_type: 'dinner',
        recipe_id: 'recipe-1',
        created_at: '',
        updated_at: '',
        recipe: {
          id: 'recipe-1',
          household_id: 'house-1',
          title: 'Complex Dish',
          instructions: 'Soak beans overnight. [PREP] Chop vegetables. Boil water.',
          created_at: '',
          updated_at: ''
        }
      }
    ];

    const tasks = getPrepTasks(meals);
    expect(tasks).toHaveLength(2);
    expect(tasks[0].description).toBe('Soak beans overnight');
    expect(tasks[1].description).toBe('[PREP] Chop vegetables');
  });

  it('should handle multiple meals', () => {
    const meals: (MealPlan & { recipe?: Recipe })[] = [
      {
        id: 'meal-1',
        household_id: 'house-1',
        scheduled_date: '2026-05-20',
        meal_type: 'lunch',
        recipe_id: 'recipe-1',
        created_at: '',
        updated_at: '',
        recipe: {
          id: 'recipe-1',
          household_id: 'house-1',
          title: 'Salad',
          instructions: 'Prepare ahead: Wash greens.',
          created_at: '',
          updated_at: ''
        }
      },
      {
        id: 'meal-2',
        household_id: 'house-1',
        scheduled_date: '2026-05-20',
        meal_type: 'dinner',
        recipe_id: 'recipe-2',
        created_at: '',
        updated_at: '',
        recipe: {
          id: 'recipe-2',
          household_id: 'house-1',
          title: 'Steak',
          instructions: 'Marinate steak.',
          created_at: '',
          updated_at: ''
        }
      }
    ];

    const tasks = getPrepTasks(meals);
    expect(tasks).toHaveLength(2);
    expect(tasks.map(t => t.recipeId)).toContain('recipe-1');
    expect(tasks.map(t => t.recipeId)).toContain('recipe-2');
  });

  it('should return empty array if no prep tasks found', () => {
    const meals: (MealPlan & { recipe?: Recipe })[] = [
      {
        id: 'meal-1',
        household_id: 'house-1',
        scheduled_date: '2026-05-20',
        meal_type: 'dinner',
        recipe_id: 'recipe-1',
        created_at: '',
        updated_at: '',
        recipe: {
          id: 'recipe-1',
          household_id: 'house-1',
          title: 'Quick Pasta',
          instructions: 'Boil pasta. Add sauce. Eat.',
          created_at: '',
          updated_at: ''
        }
      }
    ];

    const tasks = getPrepTasks(meals);
    expect(tasks).toHaveLength(0);
  });

  it('should handle meals without recipes', () => {
    const meals: (MealPlan & { recipe?: Recipe })[] = [
      {
        id: 'meal-1',
        household_id: 'house-1',
        scheduled_date: '2026-05-20',
        meal_type: 'dinner',
        created_at: '',
        updated_at: '',
        standalone_data: {
          name: 'Apple',
          nutrition: { calories: 95, protein: 0.5, fat: 0.3, carbs: 25 }
        }
      }
    ];

    const tasks = getPrepTasks(meals);
    expect(tasks).toHaveLength(0);
  });
});
