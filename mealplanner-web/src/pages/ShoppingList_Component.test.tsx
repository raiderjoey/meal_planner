import { render, screen, waitFor } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import ShoppingList from './ShoppingList';
import { pb } from '../lib/pocketbase';
import { MemoryRouter } from 'react-router-dom';

// Mock PocketBase
const collectionMock = {
  getFullList: vi.fn().mockResolvedValue([]),
  subscribe: vi.fn().mockResolvedValue(() => {}),
  update: vi.fn().mockResolvedValue({}),
};

vi.mock('../lib/pocketbase', () => ({
  pb: {
    collection: vi.fn(() => collectionMock),
  },
}));

describe('ShoppingList component', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    collectionMock.getFullList.mockResolvedValue([]);
    // Mock confirm
    vi.stubGlobal('confirm', vi.fn(() => true));
  });

  it('renders loading state initially', () => {
    collectionMock.getFullList.mockReturnValue(new Promise(() => {}));
    
    render(
      <MemoryRouter>
        <ShoppingList />
      </MemoryRouter>
    );
    
    expect(document.querySelector('.animate-spin')).toBeInTheDocument();
  });

  it('renders categorized ingredients', async () => {
    const mockIngredients = [
      { id: '1', name: 'Spinach', added_to_shopping_list: true, category: 'Produce' },
      { id: '2', name: 'Chicken', added_to_shopping_list: true, category: 'Meat' },
    ];

    collectionMock.getFullList.mockResolvedValue(mockIngredients);

    render(
      <MemoryRouter>
        <ShoppingList />
      </MemoryRouter>
    );

    await waitFor(() => {
      expect(screen.queryByRole('status')).not.toBeInTheDocument();
    });

    expect(screen.getByText('Produce')).toBeInTheDocument();
    expect(screen.getByText('Meat')).toBeInTheDocument();
    expect(screen.getByText('Spinach')).toBeInTheDocument();
    expect(screen.getByText('Chicken')).toBeInTheDocument();
  });
});
