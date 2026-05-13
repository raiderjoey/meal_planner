import { useState, useEffect } from 'react';
import { Loader2, CheckCircle2, Circle, Trash2 } from 'lucide-react';
import { pb } from '../lib/pocketbase';

/**
 * Represents an ingredient to be purchased.
 */
interface Ingredient {
  id: string;
  name: string;
  added_to_shopping_list: boolean;
  expand?: {
    meal_id?: {
      name: string;
      day_of_week: string;
    };
  };
}

/**
 * ShoppingList Component
 * 
 * Displays all ingredients added to the shopping list across all meals.
 * Allows users to check off items and clear the entire list.
 * 
 * @returns {JSX.Element} The rendered ShoppingList component.
 */
export default function ShoppingList() {
  const [ingredients, setIngredients] = useState<Ingredient[]>([]);
  const [loading, setLoading] = useState(true);

  /**
   * Fetches all ingredients that are marked as added to the shopping list.
   * Expands the meal reference to display what meal each ingredient is for.
   * 
   * @async
   * @returns {Promise<void>}
   */
  const fetchIngredients = async () => {
    setLoading(true);
    try {
      // Get ingredients that are added to shopping list
      const records = await pb.collection('ingredients').getFullList<Ingredient>({
        filter: 'added_to_shopping_list = true',
        expand: 'meal_id',
        sort: 'name',
      });
      setIngredients(records);
    } catch (error) {
      console.error('Failed to fetch ingredients', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchIngredients();

    pb.collection('ingredients').subscribe('*', function () {
      fetchIngredients();
    });

    return () => {
      pb.collection('ingredients').unsubscribe('*');
    };
  }, []);

  /**
   * Toggles the purchased state of an ingredient. In this implementation,
   * checking off an item removes it from the shopping list entirely.
   * 
   * @async
   * @param {string} id - The ID of the ingredient.
   * @param {boolean} currentlyAdded - Whether it is currently on the list.
   * @returns {Promise<void>}
   */
  const togglePurchased = async (id: string, currentlyAdded: boolean) => {
    try {
      await pb.collection('ingredients').update(id, {
        added_to_shopping_list: !currentlyAdded
      });
    } catch (e) {
      console.error(e);
    }
  };

  /**
   * Clears all items from the shopping list sequentially.
   * 
   * @async
   * @returns {Promise<void>}
   */
  const clearList = async () => {
    if (!confirm('Are you sure you want to clear your shopping list?')) return;
    
    // In a real scenario we'd do a batch update, but PocketBase JS SDK doesn't have native bulk update yet
    // We can just iterate
    for (const item of ingredients) {
      try {
        await pb.collection('ingredients').update(item.id, { added_to_shopping_list: false });
      } catch (e) {
        console.error(e);
      }
    }
  };

  if (loading && ingredients.length === 0) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="w-8 h-8 text-purple-500 animate-spin" />
      </div>
    );
  }

  // Group by meal for better organization? Or just alphabetical. Let's do alphabetical for a shopping list.
  
  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center bg-white/50 p-4 rounded-2xl shadow-sm border border-white/50 backdrop-blur-md">
        <h1 className="text-2xl font-extrabold text-gray-800">
          Shopping List
        </h1>
        {ingredients.length > 0 && (
          <button 
            onClick={clearList}
            className="px-4 py-2 rounded-xl bg-purple-50 hover:bg-purple-100 text-purple-600 transition-colors font-medium text-sm border border-purple-100 flex items-center gap-2 shadow-sm"
          >
            <Trash2 className="w-4 h-4" />
            Clear List
          </button>
        )}
      </div>

      <div className="bg-white/80 backdrop-blur-lg rounded-3xl p-6 shadow-sm border border-purple-50/50">
        {ingredients.length === 0 ? (
          <div className="text-center py-12 text-gray-400">
            <CheckCircle2 className="w-12 h-12 mx-auto mb-3 text-purple-200" />
            <p className="text-lg">Your shopping list is empty.</p>
            <p className="text-sm">Add ingredients from your weekly meals!</p>
          </div>
        ) : (
          <ul className="space-y-2">
            {ingredients.map((ing) => (
              <li 
                key={ing.id} 
                className="flex items-center gap-4 p-3 rounded-xl hover:bg-purple-50/50 transition-colors border border-transparent hover:border-purple-100/50 group cursor-pointer"
                onClick={() => togglePurchased(ing.id, ing.added_to_shopping_list)}
              >
                <div className="text-purple-400 group-hover:text-purple-600 transition-colors">
                  <Circle className="w-6 h-6" />
                </div>
                <div className="flex-1">
                  <span className="font-medium text-gray-800 text-lg">{ing.name}</span>
                  {ing.expand?.meal_id && (
                    <span className="block text-xs text-gray-400 mt-0.5">
                      For: {ing.expand.meal_id.name}
                    </span>
                  )}
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}
