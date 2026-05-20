import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import ShoppingList from './ShoppingList';
import { useShoppingList } from '../../hooks/useShoppingList';
import { useHousehold } from '../../contexts/HouseholdContext';
import { addAdHocItem } from '../../lib/supabase';

// Mock the hooks and lib
vi.mock('../../hooks/useShoppingList');
vi.mock('../../contexts/HouseholdContext');
vi.mock('../../lib/supabase', () => ({
  supabase: {
    auth: {
      getSession: vi.fn().mockResolvedValue({ data: { session: null } }),
      onAuthStateChange: vi.fn().mockReturnValue({ data: { subscription: { unsubscribe: vi.fn() } } }),
    },
    from: vi.fn(),
    rpc: vi.fn(),
  },
  getShoppingList: vi.fn(),
  resolveShoppingItem: vi.fn(),
  addAdHocItem: vi.fn(),
}));

describe('ShoppingList Page', () => {
  const mockItems = [
    {
      ingredient_id: 'ing-1',
      ad_hoc_id: null,
      name: 'Milk',
      required_quantity: 2,
      pantry_quantity: 0,
      buy_quantity: 2,
      unit: 'L',
      source: 'recipe'
    },
    {
      ingredient_id: null,
      ad_hoc_id: 'adhoc-1',
      name: 'Eggs',
      required_quantity: 12,
      pantry_quantity: 0,
      buy_quantity: 12,
      unit: 'pcs',
      source: 'ad_hoc'
    }
  ];

  const mockRefresh = vi.fn();
  const mockCheckOffItem = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
    (useHousehold as any).mockReturnValue({
      household: { id: 'house-1', name: 'Test Home' },
      loading: false
    });
    (useShoppingList as any).mockReturnValue({
      items: mockItems,
      loading: false,
      error: null,
      refresh: mockRefresh,
      checkOffItem: mockCheckOffItem
    });
  });

  it('renders the shopping list items', () => {
    render(<ShoppingList />);
    expect(screen.getByText('Shopping List')).toBeDefined();
    expect(screen.getByText('Milk')).toBeDefined();
    expect(screen.getByText('Eggs')).toBeDefined();
    expect(screen.getByText('2 L')).toBeDefined();
    expect(screen.getByText('12 pcs')).toBeDefined();
  });

  it('shows empty state when no items', () => {
    (useShoppingList as any).mockReturnValue({
      items: [],
      loading: false,
      error: null,
      refresh: mockRefresh,
      checkOffItem: mockCheckOffItem
    });
    render(<ShoppingList />);
    expect(screen.getByText(/Your shopping list is empty/i)).toBeDefined();
  });

  it('calls checkOffItem when resolve button is clicked', async () => {
    render(<ShoppingList />);
    const resolveButtons = screen.getAllByTitle('Mark as bought');
    fireEvent.click(resolveButtons[0]);
    
    expect(mockCheckOffItem).toHaveBeenCalledWith('ing-1', 2);
  });

  it('updates date range when inputs change', async () => {
    render(<ShoppingList />);
    const fromInput = screen.getByLabelText('From');
    const toInput = screen.getByLabelText('To');

    fireEvent.change(fromInput, { target: { value: '2026-06-01' } });
    fireEvent.change(toInput, { target: { value: '2026-06-07' } });

    expect(useShoppingList).toHaveBeenCalledWith('2026-06-01', '2026-06-07');
  });

  it('submits ad-hoc item correctly', async () => {
    render(<ShoppingList />);
    
    const nameInput = screen.getByLabelText(/Item Name/i);
    const qtyInput = screen.getByLabelText(/Qty/i);
    const unitInput = screen.getByLabelText(/Unit/i);
    const submitButton = screen.getByText(/Add to List/i);

    fireEvent.change(nameInput, { target: { value: 'Apples' } });
    fireEvent.change(qtyInput, { target: { value: '5' } });
    fireEvent.change(unitInput, { target: { value: 'pcs' } });
    
    fireEvent.click(submitButton);

    await waitFor(() => {
      expect(addAdHocItem).toHaveBeenCalledWith({
        household_id: 'house-1',
        name: 'Apples',
        quantity: 5,
        unit: 'pcs'
      });
    });

    expect(mockRefresh).toHaveBeenCalled();
  });
});
