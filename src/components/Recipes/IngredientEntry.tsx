import React, { useState } from 'react';
import { parseIngredient, ParsedIngredient } from '../../utils/ingredientParser';
import './IngredientEntry.css';

interface IngredientEntryProps {
  onAdd: (ingredient: ParsedIngredient & { raw: string }) => void;
}

const IngredientEntry: React.FC<IngredientEntryProps> = ({ onAdd }) => {
  const [inputValue, setInputValue] = useState('');
  const [parsed, setParsed] = useState<ParsedIngredient | null>(null);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setInputValue(value);
    if (value.trim()) {
      setParsed(parseIngredient(value));
    } else {
      setParsed(null);
    }
  };

  const handleAdd = () => {
    if (inputValue.trim()) {
      const result = parseIngredient(inputValue);
      onAdd({ ...result, raw: inputValue });
      setInputValue('');
      setParsed(null);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleAdd();
    }
  };

  return (
    <div className="ingredient-entry">
      <div className="input-group">
        <input
          type="text"
          value={inputValue}
          onChange={handleInputChange}
          onKeyDown={handleKeyDown}
          placeholder="e.g., 2 cups chopped kale"
          className="ingredient-input"
        />
        <button onClick={handleAdd} className="add-button" disabled={!inputValue.trim()}>
          Add
        </button>
      </div>
      
      {parsed && (inputValue.trim()) && (
        <div className="parsed-preview">
          <span className="preview-label">Preview:</span>
          <div className="preview-chips">
            {parsed.quantity > 0 && (
              <span className="chip quantity">{parsed.quantity}</span>
            )}
            {parsed.unit && (
              <span className="chip unit">{parsed.unit}</span>
            )}
            {parsed.ingredient && (
              <span className="chip ingredient">{parsed.ingredient}</span>
            )}
            {!parsed.ingredient && !parsed.unit && parsed.quantity === 0 && (
              <span className="chip placeholder">Start typing...</span>
            )}
          </div>
          <div className="interactive-correction-hint">
            Click to correct (Future Phase)
          </div>
        </div>
      )}
    </div>
  );
};

export default IngredientEntry;
