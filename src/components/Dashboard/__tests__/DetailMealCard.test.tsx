import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom';
import { describe, it, expect } from 'vitest';
import DetailMealCard from '../DetailMealCard';
import { MealPlan, MealParticipant } from '../../../types/database';

describe('DetailMealCard', () => {
  const mockMeal: MealPlan = {
    id: '1',
    household_id: 'h1',
    scheduled_date: '2026-05-20',
    meal_type: 'lunch',
    standalone_data: {
      name: 'Test Meal',
      nutrition: { calories: 100, protein: 10, fat: 10, carbs: 10 }
    },
    created_at: '',
    updated_at: ''
  };

  const mockParticipants: MealParticipant[] = [
    {
      household_id: 'h1',
      meal_plan_id: '1',
      user_id: 'user1',
      portion_multiplier: 1,
      status: 'planned'
    }
  ];

  it('renders meal title and type', () => {
    render(<DetailMealCard meal={mockMeal} participants={mockParticipants} />);
    
    expect(screen.getByText('Test Meal')).toBeInTheDocument();
    expect(screen.getByText('lunch')).toBeInTheDocument();
  });

  it('renders participants info', () => {
    render(<DetailMealCard meal={mockMeal} participants={mockParticipants} />);
    
    expect(screen.getByText('Participants')).toBeInTheDocument();
    expect(screen.getByText('1x portion')).toBeInTheDocument();
    expect(screen.getByText('planned')).toBeInTheDocument();
  });

  it('renders tags when provided', () => {
    render(<DetailMealCard meal={mockMeal} participants={mockParticipants} tags={['Tag1', 'Tag2']} />);
    
    expect(screen.getByText('Tag1')).toBeInTheDocument();
    expect(screen.getByText('Tag2')).toBeInTheDocument();
  });

  it('renders image when provided', () => {
    const imageUrl = 'https://example.com/image.jpg';
    render(<DetailMealCard meal={mockMeal} participants={mockParticipants} imageUrl={imageUrl} />);
    
    const img = screen.getByAltText('Test Meal');
    expect(img).toBeInTheDocument();
    expect(img).toHaveAttribute('src', imageUrl);
  });
});
