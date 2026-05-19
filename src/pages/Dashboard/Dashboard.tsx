import React, { useState, useEffect } from 'react';
import MealInstanceCard from '../../components/Dashboard/MealInstanceCard';
import AddMealModal from '../../components/Dashboard/AddMealModal';
import NutritionProgress from '../../components/Dashboard/NutritionProgress';
import { useHousehold } from '../../contexts/HouseholdContext';
import { supabase } from '../../lib/supabase';
import { MealPlan, MealParticipant, Profile, MealType, ParticipationStatus, Nutrition } from '../../types/database';
import { calculateTotalNutrition } from '../../utils/nutritionCalculator';
import './Dashboard.css';

const Dashboard: React.FC = () => {
  const { household, profile } = useHousehold();
  const [meals, setMeals] = useState<MealPlan[]>([]);
  const [participants, setParticipants] = useState<MealParticipant[]>([]);
  const [householdProfiles, setHouseholdProfiles] = useState<Profile[]>([]);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [activeSlot, setActiveSlot] = useState<{ date: string; type: MealType } | null>(null);

  const days = [
    { name: 'Mon', date: '2026-05-18' },
    { name: 'Tue', date: '2026-05-19', isToday: true },
    { name: 'Wed', date: '2026-05-20' },
    { name: 'Thu', date: '2026-05-21' },
    { name: 'Fri', date: '2026-05-22' },
    { name: 'Sat', date: '2026-05-23' },
    { name: 'Sun', date: '2026-05-24' },
  ];

  const mealTypes: MealType[] = ['breakfast', 'lunch', 'dinner'];

  useEffect(() => {
    if (household) {
      fetchHouseholdData();
    }
  }, [household]);

  const fetchHouseholdData = async () => {
    if (!household) return;

    // Fetch household profiles
    const { data: profiles } = await supabase
      .from('profiles')
      .select('*')
      .eq('household_id', household.id);
    
    if (profiles) setHouseholdProfiles(profiles);
  };

  const getDailyNutrition = (date: string) => {
    const dayMeals = meals.filter(m => m.scheduled_date === date);
    
    const initial: Nutrition = { calories: 0, protein: 0, fat: 0, carbs: 0, fiber: 0 };
    
    const planned = dayMeals.reduce((acc, meal) => {
      const mealParts = participants.filter(p => p.meal_plan_id === meal.id);
      // Mock base nutrition for now if it's a standalone meal without data
      const base = meal.standalone_data?.nutrition || { calories: 500, protein: 20, fat: 15, carbs: 60 };
      const scaled = calculateTotalNutrition(base, mealParts);
      
      return {
        calories: acc.calories + scaled.calories,
        protein: acc.protein + scaled.protein,
        fat: acc.fat + scaled.fat,
        carbs: acc.carbs + scaled.carbs,
        fiber: (acc.fiber || 0) + (scaled.fiber || 0)
      };
    }, initial);

    const consumed = dayMeals.reduce((acc, meal) => {
      const mealParts = participants.filter(p => p.meal_plan_id === meal.id && p.status === 'consumed');
      if (mealParts.length === 0) return acc;
      
      const base = meal.standalone_data?.nutrition || { calories: 500, protein: 20, fat: 15, carbs: 60 };
      const scaled = calculateTotalNutrition(base, mealParts);
      
      return {
        calories: acc.calories + scaled.calories,
        protein: acc.protein + scaled.protein,
        fat: acc.fat + scaled.fat,
        carbs: acc.carbs + scaled.carbs,
        fiber: (acc.fiber || 0) + (scaled.fiber || 0)
      };
    }, initial);

    return { planned, consumed };
  };

  const handleStatusToggle = (mealId: string, userId: string, status: ParticipationStatus) => {
    setParticipants(prev => prev.map(p => 
      (p.meal_plan_id === mealId && p.user_id === userId) ? { ...p, status } : p
    ));
  };

  const handlePortionChange = (mealId: string, userId: string, multiplier: number) => {
    setParticipants(prev => prev.map(p => 
      (p.meal_plan_id === mealId && p.user_id === userId) ? { ...p, portion_multiplier: multiplier } : p
    ));
  };

  return (
    <div className="dashboard">
      <section className="dashboard-header">
        <div className="header-text">
          <h1 className="headline-lg">Your Weekly Plan</h1>
          <p className="body-md">Fresh, organized, and nourishing meals for your week.</p>
        </div>
        <div className="week-nav">
          <button className="icon-button">
            <span className="material-symbols-outlined">chevron_left</span>
          </button>
          <span className="week-range">May 18 - May 24</span>
          <button className="icon-button">
            <span className="material-symbols-outlined">chevron_right</span>
          </button>
        </div>
      </section>

      <div className="weekly-grid">
        {days.map((day) => {
          const { planned, consumed } = getDailyNutrition(day.date);
          
          return (
            <div 
              key={day.date} 
              className={`day-card ${day.isToday ? 'is-today' : ''} meal-card-shadow`}
            >
              <div className="day-header">
                <p className="day-name">{day.name}</p>
                <p className="day-date">{day.date.split('-')[2]}</p>
                {day.isToday && <span className="today-badge">TODAY</span>}
              </div>
              <div className="day-content">
                <NutritionProgress planned={planned} consumed={consumed} />
                
                {mealTypes.map(type => {
                  const dayMeals = meals.filter(m => m.scheduled_date === day.date && m.meal_type === type);
                  
                  return (
                    <div key={type} className="meal-slot">
                      {dayMeals.length > 0 ? (
                        dayMeals.map(meal => (
                          <MealInstanceCard
                            key={meal.id}
                            meal={meal}
                            participants={participants.filter(p => p.meal_plan_id === meal.id)}
                            onStatusToggle={(uid, status) => handleStatusToggle(meal.id, uid, status)}
                            onPortionChange={(uid, mult) => handlePortionChange(meal.id, uid, mult)}
                          />
                        ))
                      ) : (
                        <button 
                          className="add-meal-btn"
                          onClick={() => {
                            setActiveSlot({ date: day.date, type });
                            setIsAddModalOpen(true);
                          }}
                        >
                          <span className="material-symbols-outlined">add</span>
                          {type}
                        </button>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          );
        })}
      </div>

      {isAddModalOpen && activeSlot && (
        <AddMealModal
          date={activeSlot.date}
          mealType={activeSlot.type}
          householdProfiles={householdProfiles}
          onClose={() => setIsAddModalOpen(false)}
          onSave={(data) => {
            const newMeal: MealPlan = {
              id: Math.random().toString(36).substr(2, 9),
              household_id: household?.id || '',
              scheduled_date: activeSlot.date,
              meal_type: activeSlot.type,
              recipe_id: data.recipeId,
              standalone_data: data.standaloneData,
              created_at: new Date().toISOString(),
              updated_at: new Date().toISOString()
            };
            
            setMeals(prev => [...prev, newMeal]);
            
            const newParticipants: MealParticipant[] = data.participants.map(p => ({
              household_id: household?.id || '',
              meal_plan_id: newMeal.id,
              user_id: p.user_id,
              portion_multiplier: p.portion_multiplier,
              status: 'planned'
            }));
            
            setParticipants(prev => [...prev, ...newParticipants]);
            setIsAddModalOpen(false);
          }}
        />
      )}

      <button className="fab">
        <span className="material-symbols-outlined">add</span>
      </button>
    </div>
  );
};

export default Dashboard;
