import React from 'react';
import { useNavigate } from 'react-router-dom';
import './DayHeader.css';

interface DayHeaderProps {
  date: string; // ISO string YYYY-MM-DD
}

const DayHeader: React.FC<DayHeaderProps> = ({ date }) => {
  const navigate = useNavigate();
  const currentDate = new Date(date);

  const formatDate = (d: Date) => {
    // Use UTC to avoid timezone shifts when parsing YYYY-MM-DD
    const utcDate = new Date(d.getTime() + d.getTimezoneOffset() * 60000);
    return utcDate.toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' });
  };

  const navigateToDate = (offset: number) => {
    const newDate = new Date(currentDate);
    newDate.setDate(newDate.getDate() + offset);
    const dateString = newDate.toISOString().split('T')[0];
    navigate(`/day/${dateString}`);
  };

  return (
    <div className="day-header">
      <button className="nav-button" onClick={() => navigateToDate(-1)} aria-label="Previous day">
        <span className="material-symbols-outlined">chevron_left</span>
      </button>
      <div className="current-day-info">
        <h1>{formatDate(currentDate)}</h1>
      </div>
      <button className="nav-button" onClick={() => navigateToDate(1)} aria-label="Next day">
        <span className="material-symbols-outlined">chevron_right</span>
      </button>
    </div>
  );
};

export default DayHeader;
