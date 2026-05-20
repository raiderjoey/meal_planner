import React, { useState, useEffect } from 'react';
import { lookupNutrition } from '../../lib/supabase';
import { Nutrition } from '../../types/database';
import './AddPantryItemModal.css';

interface AddPantryItemModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAdd: (item: {
    name: string;
    quantity: number;
    unit: string;
    category: string;
    lowStockThreshold: number;
    nutrition: Nutrition;
  }) => void;
}

const CATEGORIES = [
  'Produce',
  'Dairy & Eggs',
  'Meat & Seafood',
  'Dry Goods & Grains',
  'Spices & Oils',
  'Frozen',
  'Other'
];

const AddPantryItemModal: React.FC<AddPantryItemModalProps> = ({ isOpen, onClose, onAdd }) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [isSearching, setIsSearching] = useState(false);
  const [nutritionData, setNutritionData] = useState<{ name: string; nutrition: Nutrition; unit: string } | null>(null);
  const [quantity, setQuantity] = useState(1);
  const [unit, setUnit] = useState('');
  const [category, setCategory] = useState('Other');
  const [lowStockThreshold, setLowStockThreshold] = useState(0);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!isOpen) {
      setSearchQuery('');
      setNutritionData(null);
      setQuantity(1);
      setUnit('');
      setCategory('Other');
      setLowStockThreshold(0);
      setError(null);
    }
  }, [isOpen]);

  const handleSearch = async () => {
    if (!searchQuery.trim()) return;
    
    setIsSearching(true);
    setError(null);
    try {
      const result = await lookupNutrition(searchQuery);
      setNutritionData(result);
      setUnit(result.unit || '');
    } catch (err) {
      console.error('Search failed:', err);
      setError('Could not find nutrition data. You can still add it manually.');
      setNutritionData({
        name: searchQuery,
        nutrition: { calories: 0, protein: 0, fat: 0, carbs: 0 },
        unit: 'units'
      });
      setUnit('units');
    } finally {
      setIsSearching(false);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!nutritionData) return;

    onAdd({
      name: nutritionData.name,
      quantity,
      unit,
      category,
      lowStockThreshold,
      nutrition: nutritionData.nutrition
    });
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="modal-overlay">
      <div className="modal-content">
        <div className="modal-header">
          <h2>Add Pantry Item</h2>
          <button className="close-btn" onClick={onClose}>
            <span className="material-symbols-outlined">close</span>
          </button>
        </div>

        <div className="search-section">
          <div className="search-input-group">
            <input 
              type="text" 
              placeholder="Search ingredient (e.g., 'Chicken Breast')"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
            />
            <button onClick={handleSearch} disabled={isSearching}>
              {isSearching ? '...' : <span className="material-symbols-outlined">search</span>}
            </button>
          </div>
          {error && <p className="search-error">{error}</p>}
        </div>

        {nutritionData && (
          <form onSubmit={handleSubmit} className="item-form">
            <div className="nutrition-preview">
              <h4>{nutritionData.name}</h4>
              <div className="nutrition-grid">
                <span>Cal: {nutritionData.nutrition.calories}</span>
                <span>Pro: {nutritionData.nutrition.protein}g</span>
                <span>Fat: {nutritionData.nutrition.fat}g</span>
                <span>Carb: {nutritionData.nutrition.carbs}g</span>
              </div>
            </div>

            <div className="form-grid">
              <div className="form-group">
                <label>Category</label>
                <select value={category} onChange={(e) => setCategory(e.target.value)}>
                  {CATEGORIES.map(cat => <option key={cat} value={cat}>{cat}</option>)}
                </select>
              </div>

              <div className="form-group">
                <label>Quantity</label>
                <div className="quantity-input">
                  <input 
                    type="number" 
                    step="0.1"
                    value={quantity} 
                    onChange={(e) => setQuantity(parseFloat(e.target.value))}
                    required
                  />
                  <input 
                    type="text" 
                    placeholder="Unit"
                    value={unit}
                    onChange={(e) => setUnit(e.target.value)}
                    required
                  />
                </div>
              </div>

              <div className="form-group">
                <label>Low Stock Threshold</label>
                <input 
                  type="number" 
                  step="0.1"
                  value={lowStockThreshold} 
                  onChange={(e) => setLowStockThreshold(parseFloat(e.target.value))}
                />
              </div>
            </div>

            <button type="submit" className="submit-btn">Add to Pantry</button>
          </form>
        )}
      </div>
    </div>
  );
};

export default AddPantryItemModal;
