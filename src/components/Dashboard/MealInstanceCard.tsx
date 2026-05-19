import React from 'react';
import { MealPlan, MealParticipant, ParticipationStatus } from '../../types/database';
import './MealInstanceCard.css';

interface MealInstanceCardProps {
  meal: MealPlan;
  participants: MealParticipant[];
  onStatusToggle: (userId: string, status: ParticipationStatus) => void;
  onPortionChange: (userId: string, multiplier: number) => void;
  onClick?: () => void;
}

const MealInstanceCard: React.FC<MealInstanceCardProps> = ({
  meal,
  participants,
  onStatusToggle,
  onPortionChange,
  onClick
}) => {
  const mealTitle = meal.recipe_id ? "Recipe" : meal.standalone_data?.name || "Standalone Meal";

  return (
    <div className="meal-instance-card meal-card-shadow" onClick={onClick}>
      <div className="meal-instance-header">
        <span className={`meal-type-tag ${meal.meal_type}`}>{meal.meal_type}</span>
        <h4 className="meal-instance-title">{mealTitle}</h4>
      </div>
      
      <div className="meal-participants-list">
        {participants.map((p) => (
          <div key={p.user_id} className="participant-row">
            <div className="participant-info">
              <span className="participant-avatar">
                {/* Avatar logic would go here, using user_id to look up profile */}
                {p.user_id.slice(0, 2).toUpperCase()}
              </span>
              <div className="participant-controls">
                <input 
                  type="range" 
                  min="0.1" 
                  max="3.0" 
                  step="0.1" 
                  value={p.portion_multiplier}
                  onChange={(e) => onPortionChange(p.user_id, parseFloat(e.target.value))}
                  onClick={(e) => e.stopPropagation()}
                />
                <span className="portion-label">{p.portion_multiplier}x</span>
              </div>
            </div>
            <button 
              className={`status-toggle ${p.status}`}
              onClick={(e) => {
                e.stopPropagation();
                onStatusToggle(p.user_id, p.status === 'planned' ? 'consumed' : 'planned');
              }}
            >
              <span className="material-symbols-outlined">
                {p.status === 'consumed' ? 'check_circle' : 'radio_button_unchecked'}
              </span>
            </button>
          </div>
        ))}
      </div>
    </div>
  );
};

export default MealInstanceCard;
