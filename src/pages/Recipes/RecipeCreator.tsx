import React, { useState } from 'react';
import IngredientEntry from '../../components/Recipes/IngredientEntry';
import { ParsedIngredient } from '../../utils/ingredientParser';
import './RecipeCreator.css';

type Step = 'basics' | 'ingredients' | 'instructions' | 'review';

interface RecipeIngredient extends ParsedIngredient {
  raw: string;
}

const RecipeCreator: React.FC = () => {
  const [currentStep, setCurrentStep] = useState<Step>('basics');
  const [title, setTitle] = useState('');
  const [ingredients, setIngredients] = useState<RecipeIngredient[]>([]);
  const [instructions, setInstructions] = useState('');

  const addIngredient = (ingredient: RecipeIngredient) => {
    setIngredients([...ingredients, ingredient]);
  };

  const removeIngredient = (index: number) => {
    setIngredients(ingredients.filter((_, i) => i !== index));
  };

  const nextStep = () => {
    if (currentStep === 'basics') setCurrentStep('ingredients');
    else if (currentStep === 'ingredients') setCurrentStep('instructions');
    else if (currentStep === 'instructions') setCurrentStep('review');
  };

  const prevStep = () => {
    if (currentStep === 'ingredients') setCurrentStep('basics');
    else if (currentStep === 'instructions') setCurrentStep('ingredients');
    else if (currentStep === 'review') setCurrentStep('instructions');
  };

  const handleSubmit = () => {
    // Implement database persistence in Task 6 or when requested
    console.log({ title, ingredients, instructions });
    alert('Recipe saved (locally)! Implementation of DB persistence is coming next.');
  };

  return (
    <div className="recipe-creator-page">
      <div className="creator-container">
        <header className="creator-header">
          <h1 className="creator-title">Create New Recipe</h1>
          <div className="stepper">
            <div className={`step ${currentStep === 'basics' ? 'active' : ''}`}>1. Basics</div>
            <div className={`step ${currentStep === 'ingredients' ? 'active' : ''}`}>2. Ingredients</div>
            <div className={`step ${currentStep === 'instructions' ? 'active' : ''}`}>3. Instructions</div>
            <div className={`step ${currentStep === 'review' ? 'active' : ''}`}>4. Review</div>
          </div>
        </header>

        <main className="creator-main">
          {currentStep === 'basics' && (
            <div className="step-content">
              <label htmlFor="title">Recipe Title</label>
              <input
                id="title"
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="Give your recipe a name..."
                className="title-input"
              />
              <div className="creator-actions">
                <button 
                  onClick={nextStep} 
                  className="primary-button"
                  disabled={!title.trim()}
                >
                  Next: Ingredients
                </button>
              </div>
            </div>
          )}

          {currentStep === 'ingredients' && (
            <div className="step-content">
              <h2>Add Ingredients</h2>
              <p className="helper-text">Type ingredients naturally. We'll parse them for you.</p>
              
              <IngredientEntry onAdd={addIngredient} />

              <div className="ingredients-list">
                {ingredients.map((ing, idx) => (
                  <div key={idx} className="ingredient-row">
                    <span className="ing-raw">{ing.raw}</span>
                    <button onClick={() => removeIngredient(idx)} className="remove-button">
                      <span className="material-symbols-outlined">delete</span>
                    </button>
                  </div>
                ))}
              </div>

              <div className="creator-actions">
                <button onClick={prevStep} className="secondary-button">Back</button>
                <button 
                  onClick={nextStep} 
                  className="primary-button"
                  disabled={ingredients.length === 0}
                >
                  Next: Instructions
                </button>
              </div>
            </div>
          )}

          {currentStep === 'instructions' && (
            <div className="step-content">
              <h2>Instructions</h2>
              <textarea
                value={instructions}
                onChange={(e) => setInstructions(e.target.value)}
                placeholder="How do you make it?"
                className="instructions-textarea"
                rows={10}
              />
              <div className="creator-actions">
                <button onClick={prevStep} className="secondary-button">Back</button>
                <button 
                  onClick={nextStep} 
                  className="primary-button"
                  disabled={!instructions.trim()}
                >
                  Next: Review
                </button>
              </div>
            </div>
          )}

          {currentStep === 'review' && (
            <div className="step-content review-step">
              <h2>Review Your Recipe</h2>
              <div className="review-section">
                <h3>{title}</h3>
                <div className="review-ingredients">
                  <h4>Ingredients</h4>
                  <ul>
                    {ingredients.map((ing, idx) => (
                      <li key={idx}>{ing.raw}</li>
                    ))}
                  </ul>
                </div>
                <div className="review-instructions">
                  <h4>Instructions</h4>
                  <p>{instructions}</p>
                </div>
              </div>
              <div className="creator-actions">
                <button onClick={prevStep} className="secondary-button">Back</button>
                <button onClick={handleSubmit} className="primary-button success">
                  Save Recipe
                </button>
              </div>
            </div>
          )}
        </main>
      </div>
    </div>
  );
};

export default RecipeCreator;
