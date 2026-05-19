import React from 'react';
import './RecipeCard.css';

interface RecipeCardProps {
  id: string;
  title: string;
  image_url?: string;
  tags?: string[];
  onClick?: () => void;
}

const RecipeCard: React.FC<RecipeCardProps> = ({ title, image_url, tags, onClick }) => {
  return (
    <div className="recipe-card meal-card-shadow" onClick={onClick}>
      <div className="recipe-card-image-container">
        {image_url ? (
          <img src={image_url} alt={title} className="recipe-card-image" />
        ) : (
          <div className="recipe-card-placeholder">
            <span className="material-symbols-outlined">restaurant</span>
          </div>
        )}
      </div>
      <div className="recipe-card-content">
        <h3 className="recipe-card-title">{title}</h3>
        {tags && tags.length > 0 && (
          <div className="recipe-card-tags">
            {tags.slice(0, 3).map((tag, idx) => (
              <span key={idx} className="recipe-tag-chip">{tag}</span>
            ))}
            {tags.length > 3 && (
              <span className="recipe-tag-more">+{tags.length - 3}</span>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default RecipeCard;
