import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import '@testing-library/jest-dom';
import RecipeCard from '../RecipeCard';

describe('RecipeCard', () => {
  const mockProps = {
    id: '1',
    title: 'Test Recipe',
    tags: ['Tag1', 'Tag2', 'Tag3', 'Tag4'],
    onClick: vi.fn(),
  };

  it('renders the recipe title', () => {
    render(<RecipeCard {...mockProps} />);
    expect(screen.getByText('Test Recipe')).toBeInTheDocument();
  });

  it('renders a placeholder when no image is provided', () => {
    render(<RecipeCard {...mockProps} />);
    const placeholder = screen.getByText('restaurant');
    expect(placeholder).toBeInTheDocument();
  });

  it('renders tags (up to 3 and a "more" count)', () => {
    render(<RecipeCard {...mockProps} />);
    expect(screen.getByText('Tag1')).toBeInTheDocument();
    expect(screen.getByText('Tag2')).toBeInTheDocument();
    expect(screen.getByText('Tag3')).toBeInTheDocument();
    expect(screen.queryByText('Tag4')).not.toBeInTheDocument();
    expect(screen.getByText('+1')).toBeInTheDocument();
  });

  it('calls onClick when the card is clicked', () => {
    render(<RecipeCard {...mockProps} />);
    fireEvent.click(screen.getByText('Test Recipe').closest('.recipe-card')!);
    expect(mockProps.onClick).toHaveBeenCalledTimes(1);
  });
});
