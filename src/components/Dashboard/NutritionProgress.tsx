import React from 'react';
import { Nutrition } from '../../types/database';
import './NutritionProgress.css';

interface NutritionProgressProps {
  planned: Nutrition;
  consumed: Nutrition;
  target?: Nutrition;
}

const NutritionProgress: React.FC<NutritionProgressProps> = ({
  planned,
  consumed,
  target = { calories: 2000, protein: 50, fat: 70, carbs: 250 } // Default targets
}) => {
  const calculatePercent = (val: number, max: number) => Math.min((val / max) * 100, 100);

  return (
    <div className="nutrition-progress">
      <div className="progress-group">
        <div className="progress-labels">
          <span className="label">Calories</span>
          <span className="value">{consumed.calories} / {planned.calories} kcal</span>
        </div>
        <div className="dual-progress-bar">
          <div 
            className="bar-planned" 
            style={{ width: `${calculatePercent(planned.calories, target.calories)}%` }}
          />
          <div 
            className="bar-consumed" 
            style={{ width: `${calculatePercent(consumed.calories, target.calories)}%` }}
          />
        </div>
      </div>

      <div className="macro-progress">
        <div className="macro-item">
          <span className="macro-label">P</span>
          <div className="macro-bar">
            <div className="macro-fill" style={{ width: `${calculatePercent(consumed.protein, planned.protein || 1)}%` }} />
          </div>
        </div>
        <div className="macro-item">
          <span className="macro-label">C</span>
          <div className="macro-bar">
            <div className="macro-fill" style={{ width: `${calculatePercent(consumed.carbs, planned.carbs || 1)}%` }} />
          </div>
        </div>
        <div className="macro-item">
          <span className="macro-label">F</span>
          <div className="macro-bar">
            <div className="macro-fill" style={{ width: `${calculatePercent(consumed.fat, planned.fat || 1)}%` }} />
          </div>
        </div>
      </div>
    </div>
  );
};

export default NutritionProgress;
