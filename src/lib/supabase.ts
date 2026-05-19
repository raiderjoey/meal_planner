import { createClient } from '@supabase/supabase-js';
import { ShoppingListItem } from '../types/database';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || '';
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || '';

if (!supabaseUrl || !supabaseAnonKey) {
  console.warn('Supabase environment variables are missing.');
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

export const getShoppingList = async (startDate: string, endDate: string): Promise<ShoppingListItem[]> => {
  const { data, error } = await supabase.rpc('get_shopping_list', {
    start_date: startDate,
    end_date: endDate
  });

  if (error) throw error;
  return data || [];
};

export const resolveShoppingItem = async (itemId: string, quantity: number): Promise<void> => {
  const { error } = await supabase.rpc('resolve_shopping_item', {
    p_item_id: itemId,
    p_quantity: quantity
  });

  if (error) throw error;
};

export const addAdHocItem = async (item: {
  household_id: string;
  name: string;
  quantity: number;
  unit?: string;
  ingredient_id?: string;
}): Promise<void> => {
  const { error } = await supabase
    .from('ad_hoc_shopping_items')
    .insert([item]);

  if (error) throw error;
};
