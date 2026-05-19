import { Nutrition } from '../types/database';

/**
 * Scales nutrition values by a multiplier and rounds to 1 decimal place.
 */
export function calculateScaledNutrition(baseNutrition: Nutrition, multiplier: number): Nutrition {
  const scale = (val: number) => Math.round(val * multiplier * 10) / 10;

  const scaled: Nutrition = {
    calories: scale(baseNutrition.calories),
    protein: scale(baseNutrition.protein),
    fat: scale(baseNutrition.fat),
    carbs: scale(baseNutrition.carbs),
  };

  if (baseNutrition.fiber !== undefined) {
    scaled.fiber = scale(baseNutrition.fiber);
  }

  return scaled;
}

/**
 * Aggregates total nutrition for a list of participants by summing their portion multipliers.
 */
export function calculateTotalNutrition(
  baseNutrition: Nutrition,
  participants: { portion_multiplier: number }[]
): Nutrition {
  const totalMultiplier = participants.reduce((sum, p) => sum + p.portion_multiplier, 0);
  return calculateScaledNutrition(baseNutrition, totalMultiplier);
}
