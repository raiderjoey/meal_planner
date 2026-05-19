import { describe, it, expect } from 'vitest';
import { parseIngredient } from '../ingredientParser';

describe('parseIngredient', () => {
  it('should parse standard quantity, unit, and ingredient', () => {
    expect(parseIngredient('1.5 lbs chicken breast')).toEqual({
      quantity: 1.5,
      unit: 'lbs',
      ingredient: 'chicken breast',
    });
  });

  it('should parse cup measurements', () => {
    expect(parseIngredient('2 cups chopped kale')).toEqual({
      quantity: 2,
      unit: 'cups',
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
      unit: 'lbs',
      ingredient: 'chicken',
    });
  });
});
