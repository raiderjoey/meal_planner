import React, { useState, useEffect } from 'react';
import SummaryDayCard from '../../components/Dashboard/SummaryDayCard';
import AddMealModal from '../../components/Dashboard/AddMealModal';
import { useHousehold } from '../../contexts/HouseholdContext';
import { useSystemVersion } from '../../hooks/useSystemVersion';
import { supabase } from '../../lib/supabase';
import { MealPlan, Profile, MealType } from '../../types/database';
import './Dashboard.css';

const Dashboard: React.FC = () => {
  const { household } = useHousehold();
  const { version } = useSystemVersion();
  const [meals, setMeals] = useState<MealPlan[]>([]);
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

    // Fetch meals for the week
    const { data: mealData } = await supabase
      .from('meal_plans')
      .select('*')
      .eq('household_id', household.id)
      .gte('scheduled_date', days[0].date)
      .lte('scheduled_date', days[6].date);

    if (mealData) setMeals(mealData);
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
        {days.map((day) => (
          <SummaryDayCard 
            key={day.date} 
            day={day} 
            meals={meals.filter(m => m.scheduled_date === day.date)} 
          />
        ))}
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
            setIsAddModalOpen(false);
          }}
        />
      )}

      <button 
        className="fab"
        onClick={() => {
          setActiveSlot({ date: days.find(d => d.isToday)?.date || days[0].date, type: 'dinner' });
          setIsAddModalOpen(true);
        }}
      >
        <span className="material-symbols-outlined">add</span>
      </button>

      <footer className="dashboard-footer">
        <span className="version-text">
          {version ? `v${version}` : '...'}
        </span>
      </footer>
    </div>
  );
};

export default Dashboard;

