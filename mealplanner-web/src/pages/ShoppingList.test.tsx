import { describe, it, expect } from 'vitest';
import { getHeuristicCategory } from './ShoppingList';

describe('ShoppingList - getHeuristicCategory', () => {
  it('should categorize spinach as Produce', () => {
    expect(getHeuristicCategory('Fresh Spinach')).toBe('Produce');
  });

  it('should categorize bread as Grains', () => {
    expect(getHeuristicCategory('Whole Wheat Bread')).toBe('Grains');
  });

  it('should categorize chicken as Meat', () => {
    expect(getHeuristicCategory('Chicken Breast')).toBe('Meat');
  });

  it('should categorize milk as Dairy & Eggs', () => {
    expect(getHeuristicCategory('Whole Milk')).toBe('Dairy & Eggs');
  });

  it('should categorize unknown items as Other', () => {
    expect(getHeuristicCategory('Salt')).toBe('Other');
  });

  it('should be case insensitive', () => {
    expect(getHeuristicCategory('CHICKEN')).toBe('Meat');
  });
});
