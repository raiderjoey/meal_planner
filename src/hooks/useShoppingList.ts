import { useState, useEffect, useCallback } from 'react';
import { ShoppingListItem } from '../types/database';
import { getShoppingList, resolveShoppingItem } from '../lib/supabase';

export function useShoppingList(startDate: string, endDate: string) {
  const [items, setItems] = useState<ShoppingListItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  const fetchList = useCallback(async () => {
    try {
      setLoading(true);
      const data = await getShoppingList(startDate, endDate);
      setItems(data);
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Failed to fetch shopping list'));
    } finally {
      setLoading(false);
    }
  }, [startDate, endDate]);

  useEffect(() => {
    fetchList();
  }, [fetchList]);

  const checkOffItem = async (itemId: string, quantity: number) => {
    try {
      await resolveShoppingItem(itemId, quantity);
      // Refresh the list after resolving
      await fetchList();
    } catch (err) {
      const error = err instanceof Error ? err : new Error('Failed to resolve item');
      setError(error);
      throw error;
    }
  };

  return {
    items,
    loading,
    error,
    refresh: fetchList,
    checkOffItem
  };
}
