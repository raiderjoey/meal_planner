import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook, waitFor, act } from '@testing-library/react';
import { useShoppingList } from '../useShoppingList';
import * as supabaseHelpers from '../../lib/supabase';

vi.mock('../../lib/supabase', () => ({
  getShoppingList: vi.fn(),
  resolveShoppingItem: vi.fn(),
  supabase: {
    rpc: vi.fn()
  }
}));

describe('useShoppingList', () => {
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
    }
  ];

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('fetches shopping list on mount', async () => {
    vi.mocked(supabaseHelpers.getShoppingList).mockResolvedValue(mockItems as any);

    const { result } = renderHook(() => useShoppingList('2026-05-19', '2026-05-26'));

    expect(result.current.loading).toBe(true);

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    expect(result.current.items).toEqual(mockItems);
    expect(supabaseHelpers.getShoppingList).toHaveBeenCalledWith('2026-05-19', '2026-05-26');
  });

  it('handles fetch error', async () => {
    const error = new Error('Fetch failed');
    vi.mocked(supabaseHelpers.getShoppingList).mockRejectedValue(error);

    const { result } = renderHook(() => useShoppingList('2026-05-19', '2026-05-26'));

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    expect(result.current.error).toEqual(error);
  });

  it('resolves an item and refreshes the list', async () => {
    vi.mocked(supabaseHelpers.getShoppingList).mockResolvedValue(mockItems as any);
    vi.mocked(supabaseHelpers.resolveShoppingItem).mockResolvedValue(undefined as any);

    const { result } = renderHook(() => useShoppingList('2026-05-19', '2026-05-26'));

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    await act(async () => {
      await result.current.checkOffItem('ing-1', 2);
    });

    expect(supabaseHelpers.resolveShoppingItem).toHaveBeenCalledWith('ing-1', 2);
    expect(supabaseHelpers.getShoppingList).toHaveBeenCalledTimes(2);
  });
});
