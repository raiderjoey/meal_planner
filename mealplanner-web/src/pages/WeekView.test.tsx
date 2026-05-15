import { render, screen, waitFor } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import WeekView from './WeekView';
import { MemoryRouter } from 'react-router-dom';

// Mock PocketBase
const collectionMock = {
  getFullList: vi.fn().mockResolvedValue([]),
  subscribe: vi.fn().mockResolvedValue(() => {}),
};

vi.mock('../lib/pocketbase', () => ({
  pb: {
    collection: vi.fn(() => collectionMock),
    files: {
      getURL: vi.fn(),
    },
  },
}));

describe('WeekView component', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    collectionMock.getFullList.mockResolvedValue([]);
  });

  it('renders loading state initially', () => {
    collectionMock.getFullList.mockReturnValue(new Promise(() => {}));
    
    render(
      <MemoryRouter>
        <WeekView />
      </MemoryRouter>
    );
    
    expect(document.querySelector('.animate-spin')).toBeInTheDocument();
  });

  it('renders meals when fetched', async () => {
    const mockMealPlans = [
      {
        id: '1',
        date: '2026-05-15 12:00:00.000Z',
        slot: 'lunch',
        meal: 'meal1',
        expand: {
          meal: {
            id: 'meal1',
            name: 'Test Meal',
            image: 'test.jpg'
          }
        }
      }
    ];

    collectionMock.getFullList.mockResolvedValue(mockMealPlans);

    render(
      <MemoryRouter>
        <WeekView />
      </MemoryRouter>
    );

    await waitFor(() => {
      expect(screen.queryByRole('status')).not.toBeInTheDocument();
    });

    expect(screen.getByText('Your Weekly Plan')).toBeInTheDocument();
  });

  it('renders the full component structure to guard against structural corruption', async () => {
    collectionMock.getFullList.mockResolvedValue([]);

    render(
      <MemoryRouter>
        <WeekView />
      </MemoryRouter>
    );

    // Wait for loading to finish
    await waitFor(() => {
      expect(screen.queryByRole('status')).not.toBeInTheDocument();
    });

    // Check for elements at the top, middle, and bottom of the component
    // Top
    expect(screen.getByText('Your Weekly Plan')).toBeInTheDocument();
    
    // Middle (Grid section header - though labels are dynamic, the categories are constant)
    expect(screen.getAllByText('Breakfast').length).toBeGreaterThan(0);
    
    // Bottom sections
    expect(screen.getByText('Prep for Tomorrow')).toBeInTheDocument();
    expect(screen.getByText('Weekly Goal')).toBeInTheDocument();
  });
});
