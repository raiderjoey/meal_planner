import React from 'react';
import { PantryItem } from '../../types/database';
import './PantryTable.css';

interface PantryTableProps {
  items: PantryItem[];
  onUpdateQuantity: (id: string, newQuantity: number) => void;
  onDeleteItem: (id: string) => void;
}

const CATEGORY_ICONS: Record<string, string> = {
  'Produce': 'eco',
  'Dairy & Eggs': 'egg',
  'Meat & Seafood': 'set_meal',
  'Dry Goods & Grains': 'bakery_dining',
  'Spices & Oils': 'water_drop',
  'Frozen': 'ac_unit',
  'Other': 'inventory_2'
};

const PantryTable: React.FC<PantryTableProps> = ({ items, onUpdateQuantity, onDeleteItem }) => {
  const groupedItems = items.reduce((acc, item) => {
    const category = item.ingredient?.category || 'Other';
    if (!acc[category]) acc[category] = [];
    acc[category].push(item);
    return acc;
  }, {} as Record<string, PantryItem[]>);

  const categories = Object.keys(groupedItems).sort();

  return (
    <div className="pantry-inventory">
      {categories.map(category => (
        <div key={category} className="category-section">
          <div className="category-header">
            <span className="material-symbols-outlined">
              {CATEGORY_ICONS[category] || CATEGORY_ICONS['Other']}
            </span>
            <h4>{category} ({groupedItems[category].length})</h4>
          </div>
          <div className="inventory-grid">
            {groupedItems[category].map(item => (
              <div key={item.id} className="pantry-card">
                <div className="card-header">
                  <span className="item-name">{item.ingredient?.name}</span>
                  <button 
                    className="delete-btn"
                    onClick={() => onDeleteItem(item.id)}
                  >
                    <span className="material-symbols-outlined">delete</span>
                  </button>
                </div>
                <div className="card-body">
                  <div className="quantity-control">
                    <button 
                      onClick={() => onUpdateQuantity(item.id, Math.max(0, item.quantity - 1))}
                      disabled={item.quantity <= 0}
                    >
                      <span className="material-symbols-outlined">remove</span>
                    </button>
                    <span className="quantity-display">
                      {item.quantity} {item.unit}
                    </span>
                    <button 
                      onClick={() => onUpdateQuantity(item.id, item.quantity + 1)}
                    >
                      <span className="material-symbols-outlined">add</span>
                    </button>
                  </div>
                  {item.quantity <= item.low_stock_threshold && (
                    <div className="low-stock-tag">Low Stock</div>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
};

export default PantryTable;
