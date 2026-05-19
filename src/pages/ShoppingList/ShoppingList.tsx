import React, { useState } from 'react';
import { useShoppingList } from '../../hooks/useShoppingList';
import AdHocEntry from '../../components/ShoppingList/AdHocEntry';
import './ShoppingList.css';

const ShoppingList: React.FC = () => {
  const today = new Date().toISOString().split('T')[0];
  const nextWeek = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];
  
  const [startDate, setStartDate] = useState(today);
  const [endDate, setEndDate] = useState(nextWeek);
  
  const { items, loading, error, refresh, checkOffItem } = useShoppingList(startDate, endDate);

  const handleResolve = async (itemId: string | null, adHocId: string | null, quantity: number) => {
    const id = adHocId || itemId;
    if (!id) return;

    try {
      await checkOffItem(id, quantity);
    } catch (err) {
      console.error('Failed to resolve item:', err);
    }
  };

  if (error) {
    return (
      <div className="shopping-list-page error">
        <span className="material-symbols-outlined">error</span>
        <p>Error loading shopping list: {error.message}</p>
        <button onClick={refresh}>Retry</button>
      </div>
    );
  }

  return (
    <div className="shopping-list-page">
      <header className="page-header">
        <div className="header-title">
          <h1>Shopping List</h1>
          <p className="subtitle">Rolling window: {startDate} to {endDate}</p>
        </div>
        <div className="date-controls">
          <div className="control-group">
            <label htmlFor="start-date">From</label>
            <input 
              id="start-date"
              type="date" 
              value={startDate} 
              onChange={(e) => setStartDate(e.target.value)} 
            />
          </div>
          <div className="control-group">
            <label htmlFor="end-date">To</label>
            <input 
              id="end-date"
              type="date" 
              value={endDate} 
              onChange={(e) => setEndDate(e.target.value)} 
            />
          </div>
        </div>
      </header>

      <div className="page-content">
        <aside className="sidebar">
          <AdHocEntry onItemAdded={refresh} />
        </aside>

        <main className="list-container">
          {loading ? (
            <div className="loading-state">
              <span className="material-symbols-outlined spin">sync</span>
              <p>Updating list...</p>
            </div>
          ) : items.length === 0 ? (
            <div className="empty-state">
              <span className="material-symbols-outlined">shopping_basket</span>
              <p>Your shopping list is empty for this period.</p>
              <p className="hint">Add items manually or plan some meals!</p>
            </div>
          ) : (
            <div className="items-grid">
              {items.map((item, index) => (
                <div key={`${item.source}-${item.ad_hoc_id || item.ingredient_id}-${index}`} className="shopping-item-card">
                  <div className="item-info">
                    <span className={`source-tag ${item.source}`}>
                      {item.source === 'recipe' ? 'Recipe' : 'Manual'}
                    </span>
                    <h3 className="item-name">{item.name}</h3>
                    <p className="item-quantity">
                      {item.buy_quantity} {item.unit}
                      {item.pantry_quantity > 0 && (
                        <span className="pantry-info">
                          ({item.pantry_quantity} {item.unit} in pantry)
                        </span>
                      )}
                    </p>
                  </div>
                  <button 
                    className="resolve-button"
                    onClick={() => handleResolve(item.ingredient_id, item.ad_hoc_id, item.buy_quantity)}
                    title="Mark as bought"
                  >
                    <span className="material-symbols-outlined">check_circle</span>
                  </button>
                </div>
              ))}
            </div>
          )}
        </main>
      </div>
    </div>
  );
};

export default ShoppingList;
