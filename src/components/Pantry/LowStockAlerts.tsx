import React from 'react';
import { PantryItem } from '../../types/database';
import './LowStockAlerts.css';

interface LowStockAlertsProps {
  items: PantryItem[];
  onAddToShoppingList: (item: PantryItem) => void;
}

const LowStockAlerts: React.FC<LowStockAlertsProps> = ({ items, onAddToShoppingList }) => {
  const lowStockItems = items.filter(item => item.quantity <= item.low_stock_threshold);

  if (lowStockItems.length === 0) return null;

  return (
    <div className="low-stock-alerts">
      <div className="alerts-header">
        <span className="material-symbols-outlined">warning</span>
        <h3>Low Stock Alerts</h3>
      </div>
      <div className="alerts-list">
        {lowStockItems.map(item => (
          <div key={item.id} className="alert-item">
            <div className="alert-info">
              <span className="item-name">{item.ingredient?.name}</span>
              <span className="item-quantity">
                {item.quantity} {item.unit} left (Threshold: {item.low_stock_threshold})
              </span>
            </div>
            <button 
              className="add-to-list-btn"
              onClick={() => onAddToShoppingList(item)}
            >
              Add to List
            </button>
          </div>
        ))}
      </div>
    </div>
  );
};

export default LowStockAlerts;
