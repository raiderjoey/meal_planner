export interface ParsedIngredient {
  quantity: number;
  unit: string | null;
  ingredient: string;
}

const UNIT_MAP: Record<string, string> = {
  cups: 'cup',
  lbs: 'lb',
  ounces: 'ounce',
  oz: 'ounce',
  teaspoons: 'teaspoon',
  tsp: 'teaspoon',
  tablespoons: 'tablespoon',
  tbsp: 'tablespoon',
  grams: 'gram',
  g: 'gram',
  kilograms: 'kilogram',
  kg: 'kilogram',
  milliliters: 'milliliter',
  ml: 'milliliter',
  liters: 'liter',
  l: 'liter',
  cloves: 'clove',
};

const KNOWN_UNITS = [
  ...Object.keys(UNIT_MAP),
  ...Object.values(UNIT_MAP),
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

function normalizeUnit(unit: string | null): string | null {
  if (!unit) return null;
  return UNIT_MAP[unit.toLowerCase()] || unit.toLowerCase();
}

export function parseIngredient(input: string): ParsedIngredient {
  const trimmed = input.trim();
  if (!trimmed) {
    return { quantity: 0, unit: null, ingredient: '' };
  }

  const parts = trimmed.split(/\s+/);
  const firstPart = parts[0].toLowerCase();
  let quantity = 0;
  let unit: string | null = null;
  let ingredientStartIdx = 1;

  // 1. Try to handle attached units first (e.g., "1lb")
  // We want to avoid parseFloat stopping early on "1lb" and thinking it's just "1"
  const attachedMatch = firstPart.match(/^(\d+(?:\.\d+)?|\d+\/\d+)([a-zA-Z]+)$/);
  
  if (attachedMatch) {
    const potentialUnit = attachedMatch[2].toLowerCase();
    if (KNOWN_UNITS.includes(potentialUnit)) {
      quantity = parseNumber(attachedMatch[1]);
      unit = normalizeUnit(potentialUnit);
    } else {
      // Not a known unit, treat the whole first part as possibly a number
      quantity = parseNumber(firstPart);
    }
  } else {
    quantity = parseNumber(firstPart);
  }

  if (isNaN(quantity)) {
    if (firstPart in WORD_NUMBERS) {
      // 2. Handle word-based quantities
      quantity = WORD_NUMBERS[firstPart];
    } else {
      // 3. No quantity found
      quantity = 0;
      ingredientStartIdx = 0;
    }
  } else if (!attachedMatch) {
    // Check if the second part is a fraction (e.g., "1 1/2")
    if (parts.length > 1 && parts[1].includes('/')) {
      const fraction = parseNumber(parts[1]);
      if (!isNaN(fraction)) {
        quantity += fraction;
        ingredientStartIdx = 2;
      }
    }
  }

  // 4. Look for unit if not already found from attached match
  if (!unit && parts.length > ingredientStartIdx) {
    const potentialUnit = parts[ingredientStartIdx].toLowerCase();
    if (KNOWN_UNITS.includes(potentialUnit)) {
      unit = normalizeUnit(potentialUnit);
      ingredientStartIdx++;
    }
  }

  // 5. Handle "of" noise words (only if a unit was found)
  if (unit && parts.length > ingredientStartIdx && parts[ingredientStartIdx].toLowerCase() === 'of') {
    ingredientStartIdx++;
  }

  const ingredient = parts.slice(ingredientStartIdx).join(' ');

  return { quantity, unit, ingredient };
}
