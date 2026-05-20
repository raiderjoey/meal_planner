import React from 'react';
import { Link } from 'react-router-dom';
import { MealPlan, MealType } from '../../types/database';
import './SummaryDayCard.css';

interface SummaryDayCardProps {
  day: {
    name: string;
    date: string;
    isToday?: boolean;
  };
  meals: MealPlan[];
}

const SummaryDayCard: React.FC<SummaryDayCardProps> = ({ day, meals }) => {
  const mealTypes: MealType[] = ['breakfast', 'lunch', 'dinner'];

  return (
    <Link to={`/day/${day.date}`} className={`summary-day-card ${day.isToday ? 'is-today' : ''} meal-card-shadow`}>
      <div className="summary-day-header">
        <p className="summary-day-name">{day.name}</p>
        <p className="summary-day-date">{day.date.split('-')[2]}</p>
        {day.isToday && <span className="summary-today-badge">TODAY</span>}
      </div>
      <div className="summary-day-content">
        {mealTypes.map(type => {
          const typeMeals = meals.filter(m => m.scheduled_date === day.date && m.meal_type === type);
          return (
            <div key={type} className="summary-meal-slot">
              <span className="summary-meal-type-label">{type.charAt(0).toUpperCase()}</span>
              <div className="summary-meal-names">
                {typeMeals.length > 0 ? (
                  typeMeals.map(meal => (
                    <div key={meal.id} className="summary-meal-name">
                      {meal.recipe_id ? "Recipe" : (meal.standalone_data?.name || "Meal")}
                    </div>
                  ))
                ) : (
                  <div className="summary-meal-empty">—</div>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </Link>
  );
};

export default SummaryDayCard;
