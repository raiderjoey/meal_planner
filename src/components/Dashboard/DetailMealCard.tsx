import React from 'react';
import { MealPlan, MealParticipant } from '../../types/database';
import './DetailMealCard.css';

interface DetailMealCardProps {
  meal: MealPlan;
  participants: MealParticipant[];
  imageUrl?: string;
  tags?: string[];
}

const DetailMealCard: React.FC<DetailMealCardProps> = ({
  meal,
  participants,
  imageUrl,
  tags = []
}) => {
  const mealTitle = meal.recipe_id ? "Recipe" : meal.standalone_data?.name || "Standalone Meal";

  return (
    <div className="detail-meal-card meal-card-shadow">
      {imageUrl && (
        <div className="meal-image-container">
          <img src={imageUrl} alt={mealTitle} className="meal-image" />
        </div>
      )}
      <div className="meal-content">
        <div className="meal-header">
          <span className={`meal-type-tag ${meal.meal_type}`}>{meal.meal_type}</span>
          <h2 className="meal-title">{mealTitle}</h2>
        </div>
        
        {tags.length > 0 && (
          <div className="meal-tags">
            {tags.map(tag => (
              <span key={tag} className="meal-tag">{tag}</span>
            ))}
          </div>
        )}

        <div className="meal-participants">
          <h3>Participants</h3>
          <div className="participants-grid">
            {participants.map(p => (
              <div key={p.user_id} className="participant-detail">
                <span className="participant-avatar">
                  {p.user_id.slice(0, 2).toUpperCase()}
                </span>
                <span className="portion-info">{p.portion_multiplier}x portion</span>
                <span className={`status-badge ${p.status}`}>{p.status}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default DetailMealCard;
