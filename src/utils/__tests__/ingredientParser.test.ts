import { describe, it, expect } from 'vitest';
import { parseIngredient } from '../ingredientParser';

describe('parseIngredient', () => {
  it('should parse standard quantity, unit, and ingredient', () => {
    expect(parseIngredient('1.5 lbs chicken breast')).toEqual({
      quantity: 1.5,
      unit: 'lb',
      ingredient: 'chicken breast',
    });
  });

  it('should parse cup measurements', () => {
    expect(parseIngredient('2 cups chopped kale')).toEqual({
      quantity: 2,
      unit: 'cup',
      ingredient: 'chopped kale',
    });
  });

  it('should parse ingredients without units', () => {
    expect(parseIngredient('1 onion')).toEqual({
      quantity: 1,
      unit: null,
      ingredient: 'onion',
    });
  });

  it('should parse word-based quantities', () => {
    expect(parseIngredient('half cup milk')).toEqual({
      quantity: 0.5,
      unit: 'cup',
      ingredient: 'milk',
    });
    expect(parseIngredient('one cup milk')).toEqual({
      quantity: 1,
      unit: 'cup',
      ingredient: 'milk',
    });
  });

  it('should parse fraction quantities', () => {
    expect(parseIngredient('1/2 cup milk')).toEqual({
      quantity: 0.5,
      unit: 'cup',
      ingredient: 'milk',
    });
  });

  it('should parse mixed fraction quantities', () => {
    expect(parseIngredient('1 1/2 lbs chicken')).toEqual({
      quantity: 1.5,
      unit: 'lb',
      ingredient: 'chicken',
    });
  });

  it('should handle ingredients without quantity or unit', () => {
    expect(parseIngredient('salt')).toEqual({
      quantity: 0,
      unit: null,
      ingredient: 'salt',
    });
    expect(parseIngredient('chicken breast')).toEqual({
      quantity: 0,
      unit: null,
      ingredient: 'chicken breast',
    });
  });

  it('should handle quantities attached to units', () => {
    expect(parseIngredient('1lb chicken')).toEqual({
      quantity: 1,
      unit: 'lb',
      ingredient: 'chicken',
    });
  });

  it('should handle "of" noise words', () => {
    expect(parseIngredient('1 cup of sugar')).toEqual({
      quantity: 1,
      unit: 'cup',
      ingredient: 'sugar',
    });
    expect(parseIngredient('2 tablespoons of olive oil')).toEqual({
      quantity: 2,
      unit: 'tablespoon',
      ingredient: 'olive oil',
    });
  });

  it('should normalize units to singular form', () => {
    expect(parseIngredient('2 cups flour')).toEqual({
      quantity: 2,
      unit: 'cup',
      ingredient: 'flour',
    });
    expect(parseIngredient('1.5 lbs beef')).toEqual({
      quantity: 1.5,
      unit: 'lb',
      ingredient: 'beef',
    });
  });

  it('should handle empty strings', () => {
    expect(parseIngredient('')).toEqual({
      quantity: 0,
      unit: null,
      ingredient: '',
    });
    expect(parseIngredient('   ')).toEqual({
      quantity: 0,
      unit: null,
      ingredient: '',
    });
  });
});
