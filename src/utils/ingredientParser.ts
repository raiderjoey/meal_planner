export interface ParsedIngredient {
  quantity: number;
  unit: string | null;
  ingredient: string;
}

const KNOWN_UNITS = [
  'cups', 'cup',
  'lbs', 'lb',
  'oz', 'ounces', 'ounce',
  'tsp', 'teaspoon', 'teaspoons',
  'tbsp', 'tablespoon', 'tablespoons',
  'g', 'gram', 'grams',
  'kg', 'kilogram', 'kilograms',
  'ml', 'milliliter', 'milliliters',
  'l', 'liter', 'liters',
  'pinch', 'dash', 'clove', 'cloves', 'can', 'packet',
];

const WORD_NUMBERS: Record<string, number> = {
  half: 0.5,
  one: 1,
  two: 2,
  three: 3,
  four: 4,
  five: 5,
  six: 6,
  seven: 7,
  eight: 8,
  nine: 9,
  ten: 10,
};

function parseNumber(input: string): number {
  if (input.includes('/')) {
    const [num, den] = input.split('/').map(Number);
    if (den && !isNaN(num) && !isNaN(den)) {
      return num / den;
    }
  }
  return parseFloat(input);
}

export function parseIngredient(input: string): ParsedIngredient {
  if (!input.trim()) {
    return { quantity: 0, unit: null, ingredient: '' };
  }

  const parts = input.trim().split(/\s+/);
  const firstPart = parts[0].toLowerCase();
  let quantity = parseNumber(firstPart);
  let unit: string | null = null;
  let ingredientStartIdx = 1;

  if (isNaN(quantity)) {
    if (firstPart in WORD_NUMBERS) {
      quantity = WORD_NUMBERS[firstPart];
    } else {
      quantity = 0;
      ingredientStartIdx = 0;
    }
  }

  // Check if the second part is a fraction (e.g., "1 1/2")
  if (ingredientStartIdx === 1 && parts.length > 1 && parts[1].includes('/')) {
    const fraction = parseNumber(parts[1]);
    if (!isNaN(fraction)) {
      quantity += fraction;
      ingredientStartIdx = 2;
    }
  }

  if (parts.length > ingredientStartIdx) {
    const potentialUnit = parts[ingredientStartIdx].toLowerCase();
    if (KNOWN_UNITS.includes(potentialUnit)) {
      unit = potentialUnit;
      ingredientStartIdx++;
    }
  }

  const ingredient = parts.slice(ingredientStartIdx).join(' ');

  return { quantity, unit, ingredient };
}
