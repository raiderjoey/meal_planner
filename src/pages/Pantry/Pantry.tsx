import React, { useState, useEffect } from 'react';
import { supabase, getPantryItems, updatePantryItem, addAdHocItem } from '../../lib/supabase';
import { PantryItem, Nutrition } from '../../types/database';
import LowStockAlerts from '../../components/Pantry/LowStockAlerts';
import PantryTable from '../../components/Pantry/PantryTable';
import AddPantryItemModal from '../../components/Pantry/AddPantryItemModal';
import './Pantry.css';

const Pantry: React.FC = () => {
  const [items, setItems] = useState<PantryItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    fetchPantry();
  }, []);

  const fetchPantry = async () => {
    setIsLoading(true);
    try {
      const data = await getPantryItems();
      setItems(data);
    } catch (error) {
      console.error('Error fetching pantry:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleUpdateQuantity = async (id: string, newQuantity: number) => {
    try {
      await updatePantryItem(id, { quantity: newQuantity });
      setItems(items.map(item => item.id === id ? { ...item, quantity: newQuantity } : item));
    } catch (error) {
      console.error('Error updating quantity:', error);
    }
  };

  const handleDeleteItem = async (id: string) => {
    if (!confirm('Are you sure you want to remove this item from your pantry?')) return;
    
    try {
      const { error } = await supabase.from('pantry_items').delete().eq('id', id);
      if (error) throw error;
      setItems(items.filter(item => item.id !== id));
    } catch (error) {
      console.error('Error deleting item:', error);
    }
  };

  const handleAddItem = async (newItem: {
    name: string;
    quantity: number;
    unit: string;
    category: string;
    lowStockThreshold: number;
    nutrition: Nutrition;
  }) => {
    try {
      const { data: householdId } = await supabase.rpc('get_current_user_household_id');
      
      // 1. Ensure ingredient exists
      const { data: ingredient, error: ingError } = await supabase
        .from('ingredients')
        .upsert({
          household_id: householdId,
          name: newItem.name,
          category: newItem.category,
          unit: newItem.unit,
          ...newItem.nutrition
        }, { onConflict: 'household_id,name' })
        .select()
        .single();

      if (ingError) throw ingError;

      // 2. Add to pantry
      const { error: pantryError } = await supabase
        .from('pantry_items')
        .upsert({
          household_id: householdId,
          ingredient_id: ingredient.id,
          quantity: newItem.quantity,
          unit: newItem.unit,
          low_stock_threshold: newItem.lowStockThreshold
        }, { onConflict: 'household_id,ingredient_id' });

      if (pantryError) throw pantryError;

      fetchPantry();
    } catch (error) {
      console.error('Error adding item:', error);
    }
  };

  const handleAddToShoppingList = async (item: PantryItem) => {
    try {
      const { data: householdId } = await supabase.rpc('get_current_user_household_id');
      await addAdHocItem({
        household_id: householdId,
        name: item.ingredient?.name || 'Unknown Item',
        quantity: item.low_stock_threshold * 2, // Suggest double the threshold
        unit: item.unit,
        ingredient_id: item.ingredient_id
      });
      alert(`${item.ingredient?.name} added to shopping list!`);
    } catch (error) {
      console.error('Error adding to shopping list:', error);
    }
  };

  const filteredItems = items.filter(item => 
    item.ingredient?.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    item.ingredient?.category?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="pantry-page">
      <header className="pantry-header">
        <div className="header-main">
          <h1>Pantry Inventory</h1>
          <button className="add-item-btn" onClick={() => setIsModalOpen(true)}>
            <span className="material-symbols-outlined">add</span>
            Add Item
          </button>
        </div>
        <div className="search-bar">
          <span className="material-symbols-outlined">search</span>
          <input 
            type="text" 
            placeholder="Search pantry..." 
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
      </header>

      <main className="pantry-content">
        {isLoading ? (
          <div className="loading">Loading inventory...</div>
        ) : (
          <>
            <LowStockAlerts 
              items={items} 
              onAddToShoppingList={handleAddToShoppingList} 
            />
            
            {filteredItems.length > 0 ? (
              <PantryTable 
                items={filteredItems} 
                onUpdateQuantity={handleUpdateQuantity}
                onDeleteItem={handleDeleteItem}
              />
            ) : (
              <div className="empty-state">
                <span className="material-symbols-outlined">inventory_2</span>
                <p>{searchQuery ? 'No items match your search.' : 'Your pantry is empty.'}</p>
                {!searchQuery && (
                  <button onClick={() => setIsModalOpen(true)}>Add your first item</button>
                )}
              </div>
            )}
          </>
        )}
      </main>

      <AddPantryItemModal 
        isOpen={isModalOpen} 
        onClose={() => setIsModalOpen(false)}
        onAdd={handleAddItem}
      />
    </div>
  );
};

export default Pantry;
