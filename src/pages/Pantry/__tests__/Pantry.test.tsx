import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import { BrowserRouter } from 'react-router-dom';
import Pantry from '../Pantry';
import * as supabaseLib from '../../../lib/supabase';

// Mock Supabase library
vi.mock('../../../lib/supabase', () => ({
  supabase: {
    from: vi.fn(() => ({
      delete: vi.fn(() => ({
        eq: vi.fn(() => ({ error: null }))
      })),
      upsert: vi.fn(() => ({
        select: vi.fn(() => ({
          single: vi.fn(() => ({ data: { id: '123' }, error: null }))
        }))
      }))
    })),
    rpc: vi.fn(() => Promise.resolve({ data: 'household-123', error: null }))
  },
  getPantryItems: vi.fn(),
  updatePantryItem: vi.fn(),
  addAdHocItem: vi.fn(),
  lookupNutrition: vi.fn()
}));

const mockPantryItems = [
  {
    id: '1',
    household_id: 'h1',
    ingredient_id: 'i1',
    quantity: 5,
    unit: 'pcs',
    is_in_stock: true,
    low_stock_threshold: 2,
    created_at: '',
    updated_at: '',
    ingredient: {
      id: 'i1',
      name: 'Apple',
      category: 'Produce',
      unit: 'pcs'
    }
  },
  {
    id: '2',
    household_id: 'h1',
    ingredient_id: 'i2',
    quantity: 1,
    unit: 'gal',
    is_in_stock: true,
    low_stock_threshold: 2,
    created_at: '',
    updated_at: '',
    ingredient: {
      id: 'i2',
      name: 'Milk',
      category: 'Dairy & Eggs',
      unit: 'gal'
    }
  }
];

describe('Pantry Page', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    (supabaseLib.getPantryItems as any).mockResolvedValue(mockPantryItems);
  });

  it('renders pantry items grouped by category', async () => {
    render(
      <BrowserRouter>
        <Pantry />
      </BrowserRouter>
    );

    expect(screen.getByText(/Loading inventory.../i)).toBeInTheDocument();

    await waitFor(() => {
      expect(screen.getByText('Apple')).toBeInTheDocument();
      expect(screen.getByText('Milk')).toBeInTheDocument();
    });

    expect(screen.getByText(/Produce \(1\)/i)).toBeInTheDocument();
    expect(screen.getByText(/Dairy & Eggs \(1\)/i)).toBeInTheDocument();
  });

  it('displays low stock alerts', async () => {
    render(
      <BrowserRouter>
        <Pantry />
      </BrowserRouter>
    );

    await waitFor(() => {
      expect(screen.getByText(/Low Stock Alerts/i)).toBeInTheDocument();
    });

    expect(screen.getByText(/Milk/i)).toBeInTheDocument();
    expect(screen.queryByText(/Apple/i)).not.toBeInTheDocument(); // Apple is not low stock
  });

  it('filters items by search query', async () => {
    render(
      <BrowserRouter>
        <Pantry />
      </BrowserRouter>
    );

    await waitFor(() => {
      expect(screen.getByText('Apple')).toBeInTheDocument();
    });

    const searchInput = screen.getByPlaceholderText(/Search pantry.../i);
    fireEvent.change(searchInput, { target: { value: 'Milk' } });

    expect(screen.getByText('Milk')).toBeInTheDocument();
    expect(screen.queryByText('Apple')).not.toBeInTheDocument();
  });

  it('opens add item modal when clicking add button', async () => {
    render(
      <BrowserRouter>
        <Pantry />
      </BrowserRouter>
    );

    const addBtn = screen.getByText(/Add Item/i);
    fireEvent.click(addBtn);

    expect(screen.getByText(/Add Pantry Item/i)).toBeInTheDocument();
  });
});
