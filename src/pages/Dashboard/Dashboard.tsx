import React, { useState, useEffect } from 'react';
import SummaryDayCard from '../../components/Dashboard/SummaryDayCard';
import AddMealModal from '../../components/Dashboard/AddMealModal';
import { useHousehold } from '../../contexts/HouseholdContext';
import { useSystemVersion } from '../../hooks/useSystemVersion';
import { useMealPlanning } from '../../hooks/useMealPlanning';
import { supabase } from '../../lib/supabase';
import { Profile, MealType } from '../../types/database';
import './Dashboard.css';

const Dashboard: React.FC = () => {
  const { household } = useHousehold();
  const { version } = useSystemVersion();
  
  const days = [
    { name: 'Mon', date: '2026-05-18' },
    { name: 'Tue', date: '2026-05-19', isToday: true },
    { name: 'Wed', date: '2026-05-20' },
    { name: 'Thu', date: '2026-05-21' },
    { name: 'Fri', date: '2026-05-22' },
    { name: 'Sat', date: '2026-05-23' },
    { name: 'Sun', date: '2026-05-24' },
  ];

  const { meals, addMeal, isLoading } = useMealPlanning({ 
    start: days[0].date, 
    end: days[6].date 
  });

  const [householdProfiles, setHouseholdProfiles] = useState<Profile[]>([]);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [activeSlot, setActiveSlot] = useState<{ date: string; type: MealType } | null>(null);

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

  if (isLoading) {
    return (
      <div className="dashboard-loading">
        <p className="body-md">Loading your weekly plan...</p>
      </div>
    );
  }

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
          onSave={async (data) => {
            try {
              await addMeal({
                scheduledDate: activeSlot.date,
                mealType: activeSlot.type,
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

