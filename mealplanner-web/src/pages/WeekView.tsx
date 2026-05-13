import { useState, useEffect } from 'react';
import { format, startOfWeek, addDays } from 'date-fns';
import { Plus, Trash2, Loader2, Utensils } from 'lucide-react';
import { pb } from '../lib/pocketbase';

/**
 * Represents an ingredient tied to a meal.
 */
interface Ingredient {
  id: string;
  name: string;
  added_to_shopping_list: boolean;
}

/**
 * Represents a meal planned for a specific day.
 */
interface Meal {
  id: string;
  day_of_week: string; // ISO Date string for the specific day
  name: string;
  expand?: {
    'ingredients_via_meal_id': Ingredient[];
  };
}

/**
 * WeekView Component
 * 
 * Displays a 7-day grid for planning meals across the week.
 * Handles fetching, adding, and updating meals and ingredients.
 * 
 * @returns {JSX.Element} The rendered WeekView component.
 */
export default function WeekView() {
  const [currentWeekStart, setCurrentWeekStart] = useState(startOfWeek(new Date(), { weekStartsOn: 1 }));
  const [meals, setMeals] = useState<Meal[]>([]);
  const [loading, setLoading] = useState(true);

  // Form states
  const [editingDay, setEditingDay] = useState<string | null>(null);
  const [mealName, setMealName] = useState('');


  const days = Array.from({ length: 7 }).map((_, i) => addDays(currentWeekStart, i));

  /**
   * Fetches the full list of meals and their expanded ingredients
   * from the PocketBase backend.
   * 
   * @async
   * @returns {Promise<void>}
   */
  const fetchMeals = async () => {
    setLoading(true);
    try {
      const records = await pb.collection('meals').getFullList<Meal>({
        sort: 'day_of_week',
        expand: 'ingredients_via_meal_id',
      });
      setMeals(records);
    } catch (error) {
      console.error('Failed to fetch meals', error);
      // Collections might not exist yet, so we ignore gracefully in UI
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMeals();
    
    // Subscribe to realtime changes
    pb.collection('meals').subscribe('*', function () {
      fetchMeals();
    });
    pb.collection('ingredients').subscribe('*', function () {
      fetchMeals();
    });

    return () => {
      pb.collection('meals').unsubscribe('*');
      pb.collection('ingredients').unsubscribe('*');
    };
  }, []);

  /**
   * Saves a meal for a specific day. Creates a new meal record if
   * one doesn't exist, otherwise updates the existing record.
   * 
   * @async
   * @param {string} dayString - The ISO date string for the target day.
   * @returns {Promise<void>}
   */
  const saveMeal = async (dayString: string) => {
    if (!mealName.trim()) return;
    try {
      // Check if meal exists for this day
      const existing = meals.find(m => m.day_of_week === dayString);
      if (existing) {
        await pb.collection('meals').update(existing.id, { name: mealName });
      } else {
        await pb.collection('meals').create({ day_of_week: dayString, name: mealName });
      }
      setEditingDay(null);
      setMealName('');
    } catch (e) {
      console.error(e);
      alert('Error saving meal. Make sure PocketBase collections are created.');
    }
  };

  /**
   * Adds a new ingredient to a specific meal.
   * 
   * @async
   * @param {string} mealId - The ID of the meal.
   * @returns {Promise<void>}
   */
  const addIngredient = async (mealId: string, name: string) => {
    if (!name.trim()) return;
    try {
      await pb.collection('ingredients').create({
        meal_id: mealId,
        name: name.trim(),
        added_to_shopping_list: true
      });

    } catch (e) {
      console.error(e);
    }
  };

  /**
   * Removes an ingredient from the database.
   * 
   * @async
   * @param {string} id - The ID of the ingredient to remove.
   * @returns {Promise<void>}
   */
  const removeIngredient = async (id: string) => {
    try {
      await pb.collection('ingredients').delete(id);
    } catch (e) {
      console.error(e);
    }
  };

  if (loading && meals.length === 0) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="w-8 h-8 text-indigo-500 animate-spin" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center bg-white/50 p-4 rounded-2xl shadow-sm border border-white/50 backdrop-blur-md">
        <h1 className="text-2xl font-extrabold text-gray-800">
          Week of {format(currentWeekStart, 'MMMM do, yyyy')}
        </h1>
        <div className="flex gap-2">
          <button 
            onClick={() => setCurrentWeekStart(addDays(currentWeekStart, -7))}
            className="px-4 py-2 rounded-xl bg-white shadow-sm border border-gray-100 hover:bg-gray-50 hover:shadow-md transition-all font-medium text-gray-600"
          >
            Previous
          </button>
          <button 
            onClick={() => setCurrentWeekStart(addDays(currentWeekStart, 7))}
            className="px-4 py-2 rounded-xl bg-white shadow-sm border border-gray-100 hover:bg-gray-50 hover:shadow-md transition-all font-medium text-gray-600"
          >
            Next
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {days.map((day) => {
          const dayString = format(day, 'yyyy-MM-dd');
          const meal = meals.find(m => m.day_of_week === dayString);
          const ingredients = meal?.expand?.['ingredients_via_meal_id'] || [];
          const isEditing = editingDay === dayString;

          return (
            <div 
              key={dayString} 
              className="bg-white/80 backdrop-blur-lg rounded-3xl p-6 shadow-sm border border-indigo-50/50 hover:shadow-md transition-all hover:-translate-y-1 group flex flex-col"
            >
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-bold text-lg text-indigo-950 flex items-center gap-2">
                  <span className="bg-indigo-100 text-indigo-700 p-2 rounded-xl text-sm w-12 text-center shadow-inner">
                    {format(day, 'EEE')}
                  </span>
                  {format(day, 'MMM d')}
                </h3>
                {!isEditing && (
                  <button 
                    onClick={() => {
                      setEditingDay(dayString);
                      setMealName(meal?.name || '');
                    }}
                    className="p-2 text-gray-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-full transition-colors opacity-0 group-hover:opacity-100 focus:opacity-100"
                  >
                    <Utensils className="w-4 h-4" />
                  </button>
                )}
              </div>

              {isEditing ? (
                <div className="space-y-3 flex-1">
                  <input
                    type="text"
                    value={mealName}
                    onChange={(e) => setMealName(e.target.value)}
                    placeholder="E.g., Spaghetti Bolognese"
                    className="w-full px-4 py-2 rounded-xl border border-indigo-100 focus:ring-2 focus:ring-indigo-400 focus:border-indigo-400 outline-none transition-all"
                    autoFocus
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') saveMeal(dayString);
                      if (e.key === 'Escape') setEditingDay(null);
                    }}
                  />
                  <div className="flex gap-2">
                    <button 
                      onClick={() => saveMeal(dayString)}
                      className="flex-1 bg-indigo-500 hover:bg-indigo-600 text-white py-2 rounded-xl text-sm font-medium transition-colors shadow-sm"
                    >
                      Save
                    </button>
                    <button 
                      onClick={() => setEditingDay(null)}
                      className="flex-1 bg-gray-100 hover:bg-gray-200 text-gray-600 py-2 rounded-xl text-sm font-medium transition-colors"
                    >
                      Cancel
                    </button>
                  </div>
                </div>
              ) : (
                <div className="flex-1 flex flex-col">
                  {meal ? (
                    <>
                      <div className="font-semibold text-gray-800 text-lg mb-4 bg-indigo-50/50 p-3 rounded-2xl border border-indigo-100/50">
                        {meal.name}
                      </div>
                      
                      <div className="space-y-2 flex-1">
                        <h4 className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2">Ingredients</h4>
                        <ul className="space-y-1.5">
                          {ingredients.map((ing: Ingredient) => (
                            <li key={ing.id} className="text-sm text-gray-600 flex justify-between items-center group/item p-1.5 hover:bg-gray-50 rounded-lg transition-colors">
                              <span className="flex items-center gap-2">
                                <span className={`w-1.5 h-1.5 rounded-full ${ing.added_to_shopping_list ? 'bg-purple-400' : 'bg-gray-300'}`}></span>
                                {ing.name}
                              </span>
                              <button 
                                onClick={() => removeIngredient(ing.id)}
                                className="text-red-400 hover:text-red-600 opacity-0 group-hover/item:opacity-100 transition-opacity p-1"
                              >
                                <Trash2 className="w-3 h-3" />
                              </button>
                            </li>
                          ))}
                        </ul>
                      </div>
                      
                      <div className="mt-4 pt-4 border-t border-gray-100 flex gap-2">
                        <input
                          type="text"
                          placeholder="Add ingredient..."
                          className="flex-1 text-sm px-3 py-1.5 rounded-lg border border-gray-200 focus:border-indigo-400 focus:ring-1 focus:ring-indigo-400 outline-none transition-all"
                          onKeyDown={(e) => {
                            if (e.key === 'Enter') {
                              const val = e.currentTarget.value;
                              addIngredient(meal.id, val);
                              e.currentTarget.value = '';
                            }
                          }}
                        />
                        <button 
                          className="p-1.5 bg-indigo-50 text-indigo-600 hover:bg-indigo-100 rounded-lg transition-colors"
                          onClick={(e) => {
                            const input = e.currentTarget.previousElementSibling as HTMLInputElement;
                            addIngredient(meal.id, input.value);
                            input.value = '';
                          }}
                        >
                          <Plus className="w-4 h-4" />
                        </button>
                      </div>
                    </>
                  ) : (
                    <div className="flex-1 flex flex-col items-center justify-center text-gray-400 space-y-3 py-8 bg-gray-50/50 rounded-2xl border border-dashed border-gray-200">
                      <Utensils className="w-8 h-8 text-gray-300" />
                      <span className="text-sm">No meal planned</span>
                    </div>
                  )}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
