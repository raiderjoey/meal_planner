-- Migration: Pantry Enhancements
-- Description: Adds category to ingredients and low_stock_threshold to pantry_items.

-- Add category to ingredients
ALTER TABLE ingredients ADD COLUMN category text;

-- Add low_stock_threshold to pantry_items
ALTER TABLE pantry_items ADD COLUMN low_stock_threshold numeric DEFAULT 0;

-- Add index for category to improve filtering performance
CREATE INDEX idx_ingredients_category ON ingredients(category);

-- Add comments for clarity
COMMENT ON COLUMN ingredients.category IS 'The category of the ingredient (e.g., Produce, Dairy, Pantry).';
COMMENT ON COLUMN pantry_items.low_stock_threshold IS 'The quantity at which the item is considered low stock.';
