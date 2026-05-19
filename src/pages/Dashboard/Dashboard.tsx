import React from 'react';
import './Dashboard.css';

const Dashboard: React.FC = () => {
  const days = [
    { name: 'Mon', date: '15' },
    { name: 'Tue', date: '16' },
    { name: 'Wed', date: '17', isToday: true },
    { name: 'Thu', date: '18' },
    { name: 'Fri', date: '19' },
    { name: 'Sat', date: '20' },
    { name: 'Sun', date: '21' },
  ];

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
          <span className="week-range">May 15 - May 21</span>
          <button className="icon-button">
            <span className="material-symbols-outlined">chevron_right</span>
          </button>
        </div>
      </section>

      <div className="weekly-grid">
        {days.map((day) => (
          <div 
            key={day.name} 
            className={`day-card ${day.isToday ? 'is-today' : ''} meal-card-shadow`}
          >
            <div className="day-header">
              <p className="day-name">{day.name}</p>
              <p className="day-date">{day.date}</p>
              {day.isToday && <span className="today-badge">TODAY</span>}
            </div>
            <div className="day-content">
              {/* Slots would go here */}
              {[1, 2, 3].map((slot) => (
                <button key={slot} className="add-meal-btn">
                  <span className="material-symbols-outlined">restaurant_menu</span>
                  Add Meal
                </button>
              ))}
            </div>
          </div>
        ))}
      </div>

      <section className="prep-summary">
        <div className="prep-card">
          <div className="prep-info">
            <h3 className="headline-sm">Prep for Monday Morning</h3>
            <p className="body-sm">Don't forget to soak your overnight oats and chop the garden salad ingredients for tomorrow's lunch.</p>
          </div>
          <button className="primary-btn">View Prep List</button>
        </div>
        <div className="goal-card meal-card-shadow">
          <h3 className="goal-title">Weekly Goal</h3>
          <div className="goal-progress-info">
            <span className="body-sm">80% Plant-Based</span>
            <span className="goal-achieved">65% Achieved</span>
          </div>
          <div className="progress-bar">
            <div className="progress-fill" style={{ width: '65%' }}></div>
          </div>
          <button className="text-link">
            View full nutrition breakdown 
            <span className="material-symbols-outlined">arrow_forward</span>
          </button>
        </div>
      </section>

      <button className="fab">
        <span className="material-symbols-outlined">add</span>
      </button>
    </div>
  );
};

export default Dashboard;
