import React, { useState, useEffect, useMemo } from 'react';
import { useParams } from 'react-router-dom';
import DayHeader from '../../components/Dashboard/DayHeader';
import DetailMealCard from '../../components/Dashboard/DetailMealCard';
import PrepList from '../../components/Dashboard/PrepList';
import AddMealModal from '../../components/Dashboard/AddMealModal';
import { useHousehold } from '../../contexts/HouseholdContext';
import { useMealPlanning } from '../../hooks/useMealPlanning';
import { supabase } from '../../lib/supabase';
import { PrepTask } from '../../types/dashboard';
import { Profile } from '../../types/database';
import { getPrepTasks } from '../../utils/prepAggregator';
import './DayDetail.css';

const DayDetail: React.FC = () => {
  const { date } = useParams<{ date: string }>();
  const { household } = useHousehold();
  
  const dateRange = useMemo(() => ({
    start: date || '',
    end: date || ''
  }), [date]);

  const { meals, addMeal, isLoading } = useMealPlanning(dateRange);
  const [prepTasks, setPrepTasks] = useState<PrepTask[]>([]);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [householdProfiles, setHouseholdProfiles] = useState<Profile[]>([]);

  useEffect(() => {
    if (household) {
      fetchProfiles();
    }
  }, [household]);

  const fetchProfiles = async () => {
    if (!household) return;

    const { data: profiles } = await supabase
      .from('profiles')
      .select('*')
      .eq('household_id', household.id);
    
    if (profiles) setHouseholdProfiles(profiles);
  };

  useEffect(() => {
    if (meals.length > 0) {
      const tasks = getPrepTasks(meals);
      setPrepTasks(tasks);
    } else {
      setPrepTasks([]);
    }
  }, [meals]);

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
                  participants={meal.participants} 
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

      {isAddModalOpen && (
        <AddMealModal
          date={date}
          mealType="dinner"
          householdProfiles={householdProfiles}
          onClose={() => setIsAddModalOpen(false)}
          onSave={async (data) => {
            try {
              await addMeal({
                scheduledDate: date,
                mealType: 'dinner',
                recipeId: data.recipeId,
                standaloneData: data.standaloneData,
                participantIds: data.participants.map(p => p.user_id)
              });
              setIsAddModalOpen(false);
            } catch (err) {
              console.error('Failed to add meal:', err);
              alert('Failed to add meal. Please try again.');
            }
          }}
        />
      )}

      <button className="fab" onClick={() => setIsAddModalOpen(true)}>
        <span className="material-symbols-outlined">add</span>
      </button>
    </div>
  );
};

export default DayDetail;
