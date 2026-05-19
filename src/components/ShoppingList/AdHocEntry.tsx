import React, { useState } from 'react';
import { useHousehold } from '../../contexts/HouseholdContext';
import { addAdHocItem } from '../../lib/supabase';
import './AdHocEntry.css';

interface AdHocEntryProps {
  onItemAdded: () => void;
}

const AdHocEntry: React.FC<AdHocEntryProps> = ({ onItemAdded }) => {
  const { household } = useHousehold();
  const [name, setName] = useState('');
  const [quantity, setQuantity] = useState(1);
  const [unit, setUnit] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [lookupLoading, setLookupLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!household || !name) return;

    setIsSubmitting(true);
    try {
      await addAdHocItem({
        household_id: household.id,
        name,
        quantity,
        unit: unit || undefined
      });
      setName('');
      setQuantity(1);
      setUnit('');
      onItemAdded();
    } catch (error) {
      console.error('Failed to add ad-hoc item:', error);
      alert('Failed to add item. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleLookup = async () => {
    if (!name) return;
    setLookupLoading(true);
    // Placeholder for nutrition-lookup Edge Function call
    try {
      // In a real implementation, we would call supabase.functions.invoke('nutrition-lookup', { body: { query: name } })
      console.log('Looking up nutrition for:', name);
      await new Promise(resolve => setTimeout(resolve, 1000)); // Simulate API call
    } finally {
      setLookupLoading(false);
    }
  };

  return (
    <div className="ad-hoc-entry">
      <h3>Add Manual Item</h3>
      <form onSubmit={handleSubmit} className="ad-hoc-form">
        <div className="form-group">
          <label htmlFor="item-name">Item Name</label>
          <div className="input-with-action">
            <input
              id="item-name"
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g. Milk, Eggs..."
              required
            />
            <button 
              type="button" 
              className="lookup-button"
              onClick={handleLookup}
              disabled={!name || lookupLoading}
              title="Lookup nutrition info"
            >
              <span className="material-symbols-outlined">
                {lookupLoading ? 'sync' : 'info'}
              </span>
            </button>
          </div>
        </div>
        <div className="form-row">
          <div className="form-group">
            <label htmlFor="item-quantity">Qty</label>
            <input
              id="item-quantity"
              type="number"
              min="0.1"
              step="0.1"
              value={quantity}
              onChange={(e) => setQuantity(parseFloat(e.target.value))}
              required
            />
          </div>
          <div className="form-group">
            <label htmlFor="item-unit">Unit</label>
            <input
              id="item-unit"
              type="text"
              value={unit}
              onChange={(e) => setUnit(e.target.value)}
              placeholder="pcs, g, ml..."
            />
          </div>
        </div>
        <button type="submit" className="submit-button" disabled={isSubmitting}>
          {isSubmitting ? 'Adding...' : 'Add to List'}
        </button>
      </form>
    </div>
  );
};

export default AdHocEntry;
