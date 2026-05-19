import React, { useState } from 'react';
import { MealType, Nutrition, Profile } from '../../types/database';
import './AddMealModal.css';

interface AddMealModalProps {
  date: string;
  mealType: MealType;
  householdProfiles: Profile[];
  onClose: () => void;
  onSave: (data: {
    recipeId?: string;
    standaloneData?: { name: string; nutrition: Nutrition };
    participants: { user_id: string; portion_multiplier: number }[];
  }) => void;
}

const MOCK_RECIPES = [
  { id: '1', title: 'Grilled Salmon with Asparagus', nutrition: { calories: 450, protein: 35, fat: 25, carbs: 10 } },
  { id: '2', title: 'Quinoa Buddha Bowl', nutrition: { calories: 520, protein: 18, fat: 12, carbs: 75 } },
];

const AddMealModal: React.FC<AddMealModalProps> = ({
  date,
  mealType,
  householdProfiles,
  onClose,
  onSave
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedRecipe, setSelectedRecipe] = useState<typeof MOCK_RECIPES[0] | null>(null);
  const [standaloneName, setStandaloneName] = useState('');
  const [selectedParticipants, setSelectedParticipants] = useState<string[]>(
    householdProfiles.map(p => p.id)
  );

  const filteredRecipes = MOCK_RECIPES.filter(r => 
    r.title.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleSave = () => {
    const participants = selectedParticipants.map(userId => ({
      user_id: userId,
      portion_multiplier: 1.0 // Default for new meals
    }));

    if (selectedRecipe) {
      onSave({
        recipeId: selectedRecipe.id,
        participants
      });
    } else if (standaloneName) {
      onSave({
        standaloneData: {
          name: standaloneName,
          nutrition: { calories: 0, protein: 0, fat: 0, carbs: 0 } // In real app, fetch from API
        },
        participants
      });
    }
  };

  const toggleParticipant = (userId: string) => {
    setSelectedParticipants(prev => 
      prev.includes(userId) ? prev.filter(id => id !== userId) : [...prev, userId]
    );
  };

  return (
    <div className="modal-overlay">
      <div className="modal-content meal-card-shadow">
        <div className="modal-header">
          <h2 className="headline-sm">Add {mealType}</h2>
          <button className="icon-button" onClick={onClose}>
            <span className="material-symbols-outlined">close</span>
          </button>
        </div>

        <div className="modal-body">
          <section className="search-section">
            <div className="search-box">
              <span className="material-symbols-outlined">search</span>
              <input 
                type="text" 
                placeholder="Search recipes or add custom..." 
                value={searchTerm}
                onChange={(e) => {
                  setSearchTerm(e.target.value);
                  setSelectedRecipe(null);
                  setStandaloneName(e.target.value);
                }}
              />
            </div>
            
            {searchTerm && !selectedRecipe && (
              <div className="search-results">
                {filteredRecipes.map(r => (
                  <div 
                    key={r.id} 
                    className="search-result-item"
                    onClick={() => {
                      setSelectedRecipe(r);
                      setSearchTerm(r.title);
                    }}
                  >
                    <span className="material-symbols-outlined">restaurant</span>
                    {r.title}
                  </div>
                ))}
                <div 
                  className="search-result-item custom"
                  onClick={() => setStandaloneName(searchTerm)}
                >
                  <span className="material-symbols-outlined">add</span>
                  Add "{searchTerm}" as custom meal
                </div>
              </div>
            )}
          </section>

          <section className="participation-section">
            <h3 className="section-title">Who's participating?</h3>
            <div className="participants-grid">
              {householdProfiles.map(profile => (
                <div 
                  key={profile.id} 
                  className={`participant-chip ${selectedParticipants.includes(profile.id) ? 'active' : ''}`}
                  onClick={() => toggleParticipant(profile.id)}
                >
                  <span className="participant-avatar">
                    {profile.full_name.slice(0, 1)}
                  </span>
                  <span className="participant-name">{profile.full_name}</span>
                  {selectedParticipants.includes(profile.id) && (
                    <span className="material-symbols-outlined check">check_circle</span>
                  )}
                </div>
              ))}
            </div>
          </section>
        </div>

        <div className="modal-footer">
          <button className="text-btn" onClick={onClose}>Cancel</button>
          <button 
            className="primary-btn" 
            disabled={!selectedRecipe && !standaloneName}
            onClick={handleSave}
          >
            Schedule Meal
          </button>
        </div>
      </div>
    </div>
  );
};

export default AddMealModal;
