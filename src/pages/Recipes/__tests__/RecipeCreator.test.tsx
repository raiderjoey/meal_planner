import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import '@testing-library/jest-dom';
import RecipeCreator from '../RecipeCreator';

describe('RecipeCreator', () => {
  it('renders the first step (Basics) by default', () => {
    render(<RecipeCreator />);
    expect(screen.getByText('Create New Recipe')).toBeInTheDocument();
    expect(screen.getByLabelText('Recipe Title')).toBeInTheDocument();
  });

  it('disables the Next button if title is empty', () => {
    render(<RecipeCreator />);
    const nextButton = screen.getByText('Next: Ingredients');
    expect(nextButton).toBeDisabled();
  });

  it('enables the Next button after entering a title', () => {
    render(<RecipeCreator />);
    const titleInput = screen.getByLabelText('Recipe Title');
    fireEvent.change(titleInput, { target: { value: 'My Secret Soup' } });
    
    const nextButton = screen.getByText('Next: Ingredients');
    expect(nextButton).not.toBeDisabled();
  });

  it('navigates through steps', () => {
    render(<RecipeCreator />);
    
    // Step 1: Basics
    fireEvent.change(screen.getByLabelText('Recipe Title'), { target: { value: 'Recipe' } });
    fireEvent.click(screen.getByText('Next: Ingredients'));
    
    // Step 2: Ingredients
    expect(screen.getByText('Add Ingredients')).toBeInTheDocument();
    
    // Add an ingredient to enable Next
    const ingInput = screen.getByPlaceholderText('e.g., 2 cups chopped kale');
    fireEvent.change(ingInput, { target: { value: '1 cup salt' } });
    fireEvent.click(screen.getByText('Add'));
    
    fireEvent.click(screen.getByText('Next: Instructions'));
    
    // Step 3: Instructions
    expect(screen.getByPlaceholderText('How do you make it?')).toBeInTheDocument();
  });
});
