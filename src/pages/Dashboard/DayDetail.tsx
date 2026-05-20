import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import DayHeader from '../../components/Dashboard/DayHeader';
import DetailMealCard from '../../components/Dashboard/DetailMealCard';
import PrepList from '../../components/Dashboard/PrepList';
import { useHousehold } from '../../contexts/HouseholdContext';
import { supabase } from '../../lib/supabase';
import { MealPlan, Recipe, MealParticipant } from '../../types/database';
import { PrepTask } from '../../types/dashboard';
import { getPrepTasks } from '../../utils/prepAggregator';
import './DayDetail.css';

const DayDetail: React.FC = () => {
  const { date } = useParams<{ date: string }>();
  const { household } = useHousehold();
  
  const [meals, setMeals] = useState<(MealPlan & { recipe?: Recipe })[]>([]);
  const [participants, setParticipants] = useState<MealParticipant[]>([]);
  const [prepTasks, setPrepTasks] = useState<PrepTask[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (date && household) {
      fetchDayData();
    }
  }, [date, household]);

  const fetchDayData = async () => {
    if (!date || !household) return;
    setIsLoading(true);

    try {
      // Fetch meals with recipes
      const { data: mealData, error: mealError } = await supabase
        .from('meal_plans')
        .select('*, recipe:recipes(*)')
        .eq('household_id', household.id)
        .eq('scheduled_date', date);

      if (mealError) throw mealError;

      const fetchedMeals = mealData || [];
      setMeals(fetchedMeals);

      // Fetch participants for these meals
      if (fetchedMeals.length > 0) {
        const mealIds = fetchedMeals.map(m => m.id);
        const { data: participantData, error: participantError } = await supabase
          .from('meal_participants')
          .select('*')
          .in('meal_plan_id', mealIds);

        if (participantError) throw participantError;
        setParticipants(participantData || []);
      }

      // Aggregate prep tasks
      const tasks = getPrepTasks(fetchedMeals);
      setPrepTasks(tasks);
    } catch (error) {
      console.error('Error fetching day data:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleTogglePrepTask = (taskId: string) => {
    setPrepTasks(prev => prev.map(task => 
      task.id === taskId ? { ...task, isCompleted: !task.isCompleted } : task
    ));
  };

  if (!date) return <div>Invalid Date</div>;
  if (isLoading) return <div className="loading">Loading day details...</div>;

  return (
    <div className="day-detail-page">
      <DayHeader date={date} />
      
      <div className="day-detail-content">
        <section className="meals-section">
          <h3>Scheduled Meals</h3>
          <div className="meals-list">
            {meals.length > 0 ? (
              meals.map(meal => (
                <DetailMealCard 
                  key={meal.id} 
                  meal={meal} 
                  participants={participants.filter(p => p.meal_plan_id === meal.id)} 
                  tags={[]} // Tags could be fetched from recipe_tags if needed
                />
              ))
            ) : (
              <div className="empty-meals">
                <p>No meals scheduled for this day.</p>
              </div>
            )}
          </div>
        </section>

        <section className="prep-section">
          <h3>Prep List</h3>
          <PrepList tasks={prepTasks} onToggleTask={handleTogglePrepTask} />
        </section>
      </div>
    </div>
  );
};

export default DayDetail;
