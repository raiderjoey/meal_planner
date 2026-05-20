import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor, fireEvent } from '@testing-library/react';
import '@testing-library/jest-dom';
import { BrowserRouter, useParams, useNavigate } from 'react-router-dom';
import DayDetail from '../DayDetail';
import * as HouseholdContext from '../../../contexts/HouseholdContext';
import { supabase } from '../../../lib/supabase';

// Mock react-router-dom
vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual('react-router-dom');
  return {
    ...actual,
    useParams: vi.fn(),
    useNavigate: vi.fn(),
  };
});

// Mock HouseholdContext
vi.mock('../../../contexts/HouseholdContext', () => ({
  useHousehold: vi.fn(),
}));

// Mock Supabase
vi.mock('../../../lib/supabase', () => ({
  supabase: {
    from: vi.fn(() => ({
      select: vi.fn(() => ({
        eq: vi.fn(() => ({
          eq: vi.fn(() => Promise.resolve({ data: [], error: null })),
          in: vi.fn(() => Promise.resolve({ data: [], error: null })),
        })),
        in: vi.fn(() => Promise.resolve({ data: [], error: null })),
      })),
    })),
  },
}));

const mockHousehold = { id: 'house-1', name: 'Test House' };
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
  },
];

const mockParticipants = [
  {
    household_id: 'house-1',
    meal_plan_id: 'meal-1',
    user_id: 'user-1',
    portion_multiplier: 1,
    status: 'planned',
  },
];

describe('DayDetail Page', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    (vi.mocked(HouseholdContext.useHousehold) as any).mockReturnValue({
      household: mockHousehold,
      loading: false,
    });
    (vi.mocked(useParams) as any).mockReturnValue({
      date: mockDate,
    });
    (vi.mocked(useNavigate) as any).mockReturnValue(mockNavigate);
  });

  it('renders loading state initially', () => {
    (supabase.from as any).mockReturnValue({
      select: vi.fn(() => ({
        eq: vi.fn(() => ({
          eq: vi.fn(() => new Promise(() => {})), // Never resolves
        })),
      })),
    });

    render(
      <BrowserRouter>
        <DayDetail />
      </BrowserRouter>
    );

    expect(screen.getByText(/Loading day details.../i)).toBeInTheDocument();
  });

  it('renders meals and prep tasks after loading', async () => {
    (supabase.from as any).mockImplementation((table: string) => {
      if (table === 'meal_plans') {
        return {
          select: vi.fn(() => ({
            eq: vi.fn(() => ({
              eq: vi.fn(() => Promise.resolve({ data: mockMeals, error: null })),
            })),
          })),
        };
      }
      if (table === 'meal_participants') {
        return {
          select: vi.fn(() => ({
            in: vi.fn(() => Promise.resolve({ data: mockParticipants, error: null })),
          })),
        };
      }
      return {
        select: vi.fn(() => ({
          eq: vi.fn(() => Promise.resolve({ data: [], error: null })),
        })),
      };
    });

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
    (supabase.from as any).mockReturnValue({
      select: vi.fn(() => ({
        eq: vi.fn(() => ({
          eq: vi.fn(() => Promise.resolve({ data: [], error: null })),
        })),
      })),
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
    (supabase.from as any).mockImplementation((table: string) => {
      if (table === 'meal_plans') {
        return {
          select: vi.fn(() => ({
            eq: vi.fn(() => ({
              eq: vi.fn(() => Promise.resolve({ data: mockMeals, error: null })),
            })),
          })),
        };
      }
      return {
        select: vi.fn(() => ({
          in: vi.fn(() => Promise.resolve({ data: mockParticipants, error: null })),
        })),
      };
    });

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
    (supabase.from as any).mockReturnValue({
      select: vi.fn(() => ({
        eq: vi.fn(() => ({
          eq: vi.fn(() => Promise.resolve({ data: [], error: null })),
        })),
      })),
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

