import { PrepTask } from '../types/dashboard';
import { MealPlan, Recipe } from '../types/database';

/**
 * Extracts prep tasks from recipe instructions based on keywords and markers.
 */
export function getPrepTasks(meals: (MealPlan & { recipe?: Recipe })[]): PrepTask[] {
  const prepTasks: PrepTask[] = [];

  meals.forEach((meal) => {
    if (meal.recipe && meal.recipe.instructions) {
      // Split by newlines or periods followed by space to get individual steps/sentences
      const steps = meal.recipe.instructions.split(/\n|\. /);
      
      steps.forEach((step, index) => {
        const trimmed = step.trim();
        if (!trimmed) return;

        // Keywords and markers for prep tasks
        const isPrep = /prep ahead|marinate|soak|overnight|prepare ahead|\[PREP\]/i.test(trimmed);
        
        if (isPrep) {
          prepTasks.push({
            id: `${meal.recipe_id}-${index}`,
            description: trimmed.replace(/\.$/, ''), // Remove trailing period if it exists
            isCompleted: false,
            recipeId: meal.recipe_id || '',
          });
        }
      });
    }
  });

  return prepTasks;
}
