import React from 'react';
import { PrepTask } from '../../types/dashboard';
import './PrepList.css';

interface PrepListProps {
  tasks: PrepTask[];
  onToggleTask: (taskId: string) => void;
}

const PrepList: React.FC<PrepListProps> = ({ tasks, onToggleTask }) => {
  if (tasks.length === 0) {
    return (
      <div className="prep-empty">
        <span className="material-symbols-outlined">check_circle</span>
        <p>No prep tasks for today!</p>
      </div>
    );
  }

  return (
    <ul className="prep-list">
      {tasks.map((task) => (
        <li key={task.id} className={`prep-item ${task.isCompleted ? 'completed' : ''}`}>
          <label>
            <input
              type="checkbox"
              checked={task.isCompleted}
              onChange={() => onToggleTask(task.id)}
            />
            <span className="prep-description">{task.description}</span>
          </label>
        </li>
      ))}
    </ul>
  );
};

export default PrepList;
