import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor, fireEvent } from '@testing-library/react';
import '@testing-library/jest-dom';
import { BrowserRouter, useParams, useNavigate } from 'react-router-dom';
import DayDetail from '../DayDetail';
import * as useMealPlanningModule from '../../../hooks/useMealPlanning';

// Mock react-router-dom
vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual('react-router-dom');
  return {
    ...actual,
    useParams: vi.fn(),
    useNavigate: vi.fn(),
  };
});

// Mock useMealPlanning hook
vi.mock('../../../hooks/useMealPlanning', () => ({
  useMealPlanning: vi.fn(),
}));

const mockDate = '2026-05-20';
const mockNavigate = vi.fn();

const mockMeals = [
  {
    id: 'meal-1',
    household_id: 'house-1',
    scheduled_date: mockDate,
    meal_type: 'dinner',
    recipe_id: 'recipe-1',
    recipe: {
      id: 'recipe-1',
      title: 'Test Recipe',
      instructions: 'Prep ahead: Do something.\nCook it.',
    },
    participants: [
      {
        household_id: 'house-1',
        meal_plan_id: 'meal-1',
        user_id: 'user-1',
        portion_multiplier: 1,
        status: 'planned',
      },
    ],
  },
];

describe('DayDetail Page', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    (vi.mocked(useParams) as any).mockReturnValue({
      date: mockDate,
    });
    (vi.mocked(useNavigate) as any).mockReturnValue(mockNavigate);
    (vi.mocked(useMealPlanningModule.useMealPlanning) as any).mockReturnValue({
      meals: mockMeals,
      isLoading: false,
      error: null,
      addMeal: vi.fn(),
    });
  });

  it('renders loading state initially', () => {
    (vi.mocked(useMealPlanningModule.useMealPlanning) as any).mockReturnValue({
      meals: [],
      isLoading: true,
      error: null,
      addMeal: vi.fn(),
    });

    render(
      <BrowserRouter>
        <DayDetail />
      </BrowserRouter>
    );

    expect(screen.getByText(/Loading day details.../i)).toBeInTheDocument();
  });

  it('renders meals and prep tasks after loading', async () => {
    render(
      <BrowserRouter>
        <DayDetail />
      </BrowserRouter>
    );

    await waitFor(() => {
      // Current implementation renders "Recipe" for meals with recipe_id
      expect(screen.getByText('Recipe')).toBeInTheDocument();
      expect(screen.getByText('Prep ahead: Do something')).toBeInTheDocument();
    });
  });

  it('handles empty states', async () => {
    (vi.mocked(useMealPlanningModule.useMealPlanning) as any).mockReturnValue({
      meals: [],
      isLoading: false,
      error: null,
      addMeal: vi.fn(),
    });

    render(
      <BrowserRouter>
        <DayDetail />
      </BrowserRouter>
    );

    await waitFor(() => {
      expect(screen.getByText(/No meals scheduled for this day/i)).toBeInTheDocument();
      expect(screen.getByText(/No prep tasks for today/i)).toBeInTheDocument();
    });
  });

  it('toggles prep task completion', async () => {
    render(
      <BrowserRouter>
        <DayDetail />
      </BrowserRouter>
    );

    await waitFor(() => {
      expect(screen.getByText('Prep ahead: Do something')).toBeInTheDocument();
    });

    const checkbox = screen.getByRole('checkbox');
    expect(checkbox).not.toBeChecked();

    fireEvent.click(checkbox);
    expect(checkbox).toBeChecked();
  });

  it('navigates to previous and next days', async () => {
    (vi.mocked(useMealPlanningModule.useMealPlanning) as any).mockReturnValue({
      meals: [],
      isLoading: false,
      error: null,
      addMeal: vi.fn(),
    });

    render(
      <BrowserRouter>
        <DayDetail />
      </BrowserRouter>
    );

    await waitFor(() => {
      expect(screen.getByText(/Wednesday, May 20, 2026/i)).toBeInTheDocument();
    });

    const prevButton = screen.getByLabelText('Previous day');
    const nextButton = screen.getByLabelText('Next day');

    fireEvent.click(prevButton);
    expect(mockNavigate).toHaveBeenCalledWith('/day/2026-05-19');

    fireEvent.click(nextButton);
    expect(mockNavigate).toHaveBeenCalledWith('/day/2026-05-21');
  });
});


