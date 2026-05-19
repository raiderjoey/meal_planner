import { describe, it, expect } from 'vitest';
import { calculateScaledNutrition, calculateTotalNutrition } from '../nutritionCalculator';
import { Nutrition } from '../../types/database';

describe('calculateScaledNutrition', () => {
  it('scales nutrition for 1.5 portions with fiber', () => {
    const baseNutrition: Nutrition = {
      calories: 400,
      protein: 20,
      fat: 15,
      carbs: 45,
      fiber: 5
    };
    const multiplier = 1.5;
    const expected: Nutrition = {
      calories: 600,
      protein: 30,
      fat: 22.5,
      carbs: 67.5,
      fiber: 7.5
    };
    expect(calculateScaledNutrition(baseNutrition, multiplier)).toEqual(expected);
  });

  it('scales nutrition for 0.5 portion without fiber', () => {
    const baseNutrition: Nutrition = {
      calories: 500,
      protein: 25,
      fat: 20,
      carbs: 50
    };
    const multiplier = 0.5;
    const expected: Nutrition = {
      calories: 250,
      protein: 12.5,
      fat: 10,
      carbs: 25
    };
    const result = calculateScaledNutrition(baseNutrition, multiplier);
    expect(result).toEqual(expected);
    expect(result.fiber).toBeUndefined();
  });

  it('rounds values to 1 decimal place', () => {
    const baseNutrition: Nutrition = {
      calories: 10,
      protein: 10,
      fat: 10,
      carbs: 10,
      fiber: 10
    };
    const multiplier = 1.33;
    const expected: Nutrition = {
      calories: 13.3,
      protein: 13.3,
      fat: 13.3,
      carbs: 13.3,
      fiber: 13.3
    };
    expect(calculateScaledNutrition(baseNutrition, multiplier)).toEqual(expected);
  });

  it('handles missing or zero fields', () => {
    const incompleteNutrition = {
      calories: 100,
      protein: 0,
      fat: 0,
      carbs: 0
    } as Nutrition;
    const result = calculateScaledNutrition(incompleteNutrition, 2);
    expect(result.calories).toBe(200);
    expect(result.protein).toBe(0);
  });

  it('handles zero multiplier', () => {
    const baseNutrition: Nutrition = {
      calories: 100,
      protein: 10,
      fat: 10,
      carbs: 10
    };
    const result = calculateScaledNutrition(baseNutrition, 0);
    expect(result).toEqual({
      calories: 0,
      protein: 0,
      fat: 0,
      carbs: 0
    });
  });
});

describe('calculateTotalNutrition', () => {
  it('aggregates nutrition for multiple participants with varying multipliers', () => {
    const baseNutrition: Nutrition = {
      calories: 400,
      protein: 20,
      fat: 15,
      carbs: 45
    };
    const participants = [
      { portion_multiplier: 1.0 },
      { portion_multiplier: 0.5 },
      { portion_multiplier: 1.5 }
    ];
    // Total multiplier = 1.0 + 0.5 + 1.5 = 3.0
    const expected: Nutrition = {
      calories: 1200,
      protein: 60,
      fat: 45,
      carbs: 135
    };
    expect(calculateTotalNutrition(baseNutrition, participants)).toEqual(expected);
  });
});
