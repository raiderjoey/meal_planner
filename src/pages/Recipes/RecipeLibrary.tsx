import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import RecipeCard from '../../components/Recipes/RecipeCard';
import './RecipeLibrary.css';

// Mock data for initial UI implementation
const MOCK_RECIPES = [
  { id: '1', title: 'Grilled Salmon with Asparagus', tags: ['High Protein', 'Healthy', 'Dinner'] },
  { id: '2', title: 'Quinoa Buddha Bowl', tags: ['Vegan', 'Meal Prep', 'Lunch'] },
  { id: '3', title: 'Berry Smoothie Bowl', tags: ['Breakfast', 'Quick'] },
  { id: '4', title: 'Slow Cooker Beef Stew', tags: ['Comfort Food', 'Dinner'] },
  { id: '5', title: 'Caprese Salad', tags: ['Appetizer', 'Vegetarian'] },
  { id: '6', title: 'Roasted Vegetable Pasta', tags: ['Dinner', 'Vegetarian'] },
];

const MOCK_COLLECTIONS = [
  { id: '1', name: 'Favorites', icon: 'favorite' },
  { id: '2', name: 'Meal Prep Sundays', icon: 'calendar_today' },
  { id: '3', name: 'Quick Weeknight Dinners', icon: 'schedule' },
];

const MOCK_TAGS = ['Vegan', 'High Protein', 'Low Carb', 'Gluten Free', 'Dairy Free', 'Quick', 'Dinner', 'Breakfast'];

const RecipeLibrary: React.FC = () => {
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCollection, setSelectedCollection] = useState<string | null>(null);
  const [selectedTags, setSelectedTags] = useState<string[]>([]);

  const toggleTag = (tag: string) => {
    if (selectedTags.includes(tag)) {
      setSelectedTags(selectedTags.filter(t => t !== tag));
    } else {
      setSelectedTags([...selectedTags, tag]);
    }
  };

  return (
    <div className="recipe-library">
      <header className="library-header">
        <div className="header-top">
          <h1 className="headline-lg">Recipe Library</h1>
          <button 
            className="primary-btn"
            onClick={() => navigate('/recipes/new')}
          >
            <span className="material-symbols-outlined">add</span>
            Create New
          </button>
        </div>
        <div className="search-filter-bar">
          <div className="search-box">
            <span className="material-symbols-outlined">search</span>
            <input 
              type="text" 
              placeholder="Search your library..." 
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <div className="sort-dropdown">
            <span className="material-symbols-outlined">sort</span>
            <select>
              <option>Recently Added</option>
              <option>Alphabetical</option>
              <option>Highest Rated</option>
            </select>
          </div>
        </div>
      </header>

      <div className="library-layout">
        <aside className="library-sidebar">
          <div className="sidebar-section">
            <h3 className="section-title">Collections</h3>
            <ul className="sidebar-list">
              <li 
                className={`sidebar-item ${selectedCollection === null ? 'active' : ''}`}
                onClick={() => setSelectedCollection(null)}
              >
                <span className="material-symbols-outlined">all_inclusive</span>
                All Recipes
              </li>
              {MOCK_COLLECTIONS.map(col => (
                <li 
                  key={col.id} 
                  className={`sidebar-item ${selectedCollection === col.id ? 'active' : ''}`}
                  onClick={() => setSelectedCollection(col.id)}
                >
                  <span className="material-symbols-outlined">{col.icon}</span>
                  {col.name}
                </li>
              ))}
            </ul>
          </div>

          <div className="sidebar-section">
            <h3 className="section-title">Common Tags</h3>
            <div className="tags-cloud">
              {MOCK_TAGS.map(tag => (
                <button 
                  key={tag} 
                  className={`tag-filter ${selectedTags.includes(tag) ? 'active' : ''}`}
                  onClick={() => toggleTag(tag)}
                >
                  {tag}
                </button>
              ))}
            </div>
          </div>
        </aside>

        <main className="library-grid-container">
          <div className="recipe-bento-grid">
            {MOCK_RECIPES.map(recipe => (
              <RecipeCard 
                key={recipe.id}
                id={recipe.id}
                title={recipe.title}
                tags={recipe.tags}
              />
            ))}
          </div>
          
          {MOCK_RECIPES.length === 0 && (
            <div className="empty-state">
              <span className="material-symbols-outlined">menu_book</span>
              <h3>No recipes found</h3>
              <p>Try adjusting your filters or search terms.</p>
            </div>
          )}
        </main>
      </div>
    </div>
  );
};

export default RecipeLibrary;
