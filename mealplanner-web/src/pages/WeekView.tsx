import { useState, useEffect } from 'react';
import { format, startOfWeek, addDays } from 'date-fns';
import { Plus, Trash2, Loader2, Utensils, ChevronDown, ChevronUp } from 'lucide-react';
import { pb } from '../lib/pocketbase';

/**
 * Represents an ingredient tied to a meal.
 */
interface Ingredient {
  id: string;
  name: string;
  added_to_shopping_list: boolean;
}

type Category = 'breakfast' | 'lunch' | 'dinner' | 'dessert' | 'snack';

const CATEGORY_ORDER: Category[] = ['breakfast', 'lunch', 'dinner', 'dessert', 'snack'];

/**
 * Represents a meal planned for a specific day.
 */
interface Meal {
  id: string;
  day_of_week: string; // ISO Date string for the specific day
  name: string;
  category: Category;
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
  const [expandedMeals, setExpandedMeals] = useState<Set<string>>(new Set());

  // Form states
  const [addingTo, setAddingTo] = useState<{ day: string, category: Category } | null>(null);
  const [editingMealId, setEditingMealId] = useState<string | null>(null);
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
      // Handle existing data without category gracefully
      const normalized = records.map(r => ({
        ...r,
        category: r.category || 'dinner'
      }));
      setMeals(normalized);
    } catch (error: any) {
      console.error('Failed to fetch meals:', error.message || error);
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

  const toggleExpand = (mealId: string) => {
    setExpandedMeals(prev => {
      const next = new Set(prev);
      if (next.has(mealId)) {
        next.delete(mealId);
      } else {
        next.add(mealId);
      }
      return next;
    });
  };

  /**
   * Saves a meal. Creates a new record if addingTo is set,
   * or updates an existing record if editingMealId is set.
   * 
   * @async
   * @returns {Promise<void>}
   */
  const saveMeal = async () => {
    if (!mealName.trim()) return;
    try {
      if (editingMealId) {
        await pb.collection('meals').update(editingMealId, { name: mealName });
      } else if (addingTo) {
        await pb.collection('meals').create({ 
          day_of_week: addingTo.day, 
          name: mealName,
          category: addingTo.category 
        });
      }
      setAddingTo(null);
      setEditingMealId(null);
      setMealName('');
    } catch (e: any) {
      console.error('Error saving meal:', e.message || e);
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

    } catch (e: any) {
      console.error('Error adding ingredient:', e.message || e);
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
    } catch (e: any) {
      console.error('Error removing ingredient:', e.message || e);
    }
  };

  /**
   * Deletes a meal and its associated ingredients.
   * 
   * @async
   * @param {string} mealId - The ID of the meal to delete.
   * @returns {Promise<void>}
   */
  const deleteMeal = async (mealId: string) => {
    if (!window.confirm('Are you sure you want to delete this meal and all its ingredients?')) {
      return;
    }
    try {
      await pb.collection('meals').delete(mealId);
    } catch (e: any) {
      console.error('Failed to delete meal:', e.message || e);
    }
  };

  const [isAddingAny, setIsAddingAny] = useState<string | null>(null);

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
          const mealsByDay = meals.filter(m => m.day_of_week === dayString);
          const hasMeals = mealsByDay.length > 0;
          
          // Group meals by category
          const groupedMeals = CATEGORY_ORDER.reduce((acc, cat) => {
            const categoryMeals = mealsByDay.filter(m => m.category === cat);
            if (categoryMeals.length > 0) acc[cat] = categoryMeals;
            return acc;
          }, {} as Record<Category, Meal[]>);

          return (
            <div 
              key={dayString} 
              className="bg-white/80 backdrop-blur-lg rounded-3xl p-6 shadow-sm border border-indigo-50/50 hover:shadow-md transition-all group flex flex-col min-h-[300px]"
            >
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-bold text-lg text-indigo-950 flex items-center gap-2">
                  <span className="bg-indigo-100 text-indigo-700 p-2 rounded-xl text-sm w-12 text-center shadow-inner">
                    {format(day, 'EEE')}
                  </span>
                  {format(day, 'MMM d')}
                </h3>
                {hasMeals && !isAddingAny && !addingTo && !editingMealId && (
                  <button 
                    onClick={() => setIsAddingAny(dayString)}
                    className="p-2 text-indigo-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-full transition-colors"
                    title="Add meal"
                  >
                    <Plus className="w-5 h-5" />
                  </button>
                )}
              </div>

              <div className="flex-1 flex flex-col space-y-6">
                {!hasMeals && !isAddingAny && !addingTo && (
                  <div className="flex-1 flex flex-col items-center justify-center text-gray-400 space-y-3 py-8 bg-gray-50/50 rounded-2xl border border-dashed border-gray-200">
                    <Utensils className="w-8 h-8 text-gray-300" />
                    <span className="text-sm">No meals planned</span>
                    <button 
                      onClick={() => setIsAddingAny(dayString)}
                      className="text-xs font-semibold text-indigo-500 hover:text-indigo-600 bg-indigo-50 px-3 py-1.5 rounded-xl transition-colors border border-indigo-100"
                    >
                      + Add Meal
                    </button>
                  </div>
                )}

                {isAddingAny === dayString && (
                  <div className="bg-indigo-50/30 p-4 rounded-2xl border border-indigo-100/50 animate-in fade-in zoom-in duration-200">
                    <p className="text-xs font-bold text-indigo-400 uppercase tracking-widest mb-3 text-center">Select Category</p>
                    <div className="grid grid-cols-2 gap-2">
                      {CATEGORY_ORDER.map(cat => (
                        <button 
                          key={cat}
                          onClick={() => {
                            setAddingTo({ day: dayString, category: cat });
                            setIsAddingAny(null);
                            setMealName('');
                          }}
                          className="text-xs font-bold text-gray-600 bg-white border border-gray-100 p-2.5 rounded-xl hover:bg-indigo-500 hover:text-white hover:border-indigo-500 transition-all capitalize shadow-sm"
                        >
                          {cat}
                        </button>
                      ))}
                      <button 
                        onClick={() => setIsAddingAny(null)}
                        className="col-span-2 text-xs font-medium text-gray-400 hover:text-gray-600 py-2 mt-1"
                      >
                        Cancel
                      </button>
                    </div>
                  </div>
                )}

                {((addingTo?.day === dayString) || (editingMealId && mealsByDay.some(m => m.id === editingMealId))) && (
                  <div className="space-y-3 animate-in fade-in slide-in-from-top-2 duration-200">
                    {addingTo && (
                      <div className="flex items-center gap-2">
                        <span className="text-[10px] font-bold uppercase tracking-wider text-indigo-500 bg-indigo-50 px-2 py-0.5 rounded-md border border-indigo-100">
                          New {addingTo.category}
                        </span>
                      </div>
                    )}
                    {editingMealId && (
                       <div className="flex items-center gap-2">
                        <span className="text-[10px] font-bold uppercase tracking-wider text-amber-500 bg-amber-50 px-2 py-0.5 rounded-md border border-amber-100">
                          Editing {meals.find(m => m.id === editingMealId)?.category}
                        </span>
                      </div>
                    )}
                    <input
                      type="text"
                      value={mealName}
                      onChange={(e) => setMealName(e.target.value)}
                      placeholder="E.g., Spaghetti Bolognese"
                      className="w-full px-4 py-2 rounded-xl border border-indigo-100 focus:ring-2 focus:ring-indigo-400 focus:border-indigo-400 outline-none transition-all shadow-inner"
                      autoFocus
                      onKeyDown={(e) => {
                        if (e.key === 'Enter') saveMeal();
                        if (e.key === 'Escape') {
                          setAddingTo(null);
                          setEditingMealId(null);
                          setMealName('');
                        }
                      }}
                    />
                    <div className="flex gap-2">
                      <button 
                        onClick={() => saveMeal()}
                        className="flex-1 bg-indigo-500 hover:bg-indigo-600 text-white py-2 rounded-xl text-sm font-medium transition-colors shadow-md shadow-indigo-200"
                      >
                        Save
                      </button>
                      <button 
                        onClick={() => {
                          setAddingTo(null);
                          setEditingMealId(null);
                          setMealName('');
                        }}
                        className="flex-1 bg-gray-100 hover:bg-gray-200 text-gray-600 py-2 rounded-xl text-sm font-medium transition-colors"
                      >
                        Cancel
                      </button>
                    </div>
                  </div>
                )}

                {Object.entries(groupedMeals).map(([category, categoryMeals]) => (
                  <div key={category} className="space-y-4">
                    <div className="flex items-center gap-2">
                      <span className="text-[10px] font-extrabold uppercase tracking-wider text-indigo-400/80 bg-indigo-50/50 px-2 py-0.5 rounded-md border border-indigo-100/30">
                        {category}
                      </span>
                      <div className="flex-1 h-px bg-gradient-to-r from-indigo-100/50 to-transparent"></div>
                    </div>
                    
                    <div className="space-y-6">
                      {categoryMeals.map((meal) => {
                        const ingredients = meal.expand?.['ingredients_via_meal_id'] || [];
                        const isExpanded = expandedMeals.has(meal.id);
                        const displayedIngredients = isExpanded ? ingredients : ingredients.slice(0, 3);
                        const hasMore = ingredients.length > 3;

                        return (
                          <div key={meal.id} className="group/meal relative bg-white/50 rounded-2xl p-4 border border-transparent hover:border-indigo-100 hover:bg-white transition-all">
                            <div className="flex items-start justify-between mb-3">
                              <div className="font-semibold text-gray-800 leading-tight">
                                {meal.name}
                              </div>
                              <div className="flex gap-1 opacity-0 group-hover/meal:opacity-100 transition-opacity">
                                <button 
                                  onClick={() => {
                                    setEditingMealId(meal.id);
                                    setMealName(meal.name);
                                    setAddingTo(null);
                                  }}
                                  className="p-1.5 text-gray-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition-colors"
                                >
                                  <Utensils className="w-3.5 h-3.5" />
                                </button>
                                <button 
                                  onClick={() => deleteMeal(meal.id)}
                                  className="p-1.5 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                                >
                                  <Trash2 className="w-3.5 h-3.5" />
                                </button>
                              </div>
                            </div>

                            <div className="space-y-2">
                              <ul className="space-y-1">
                                {displayedIngredients.map((ing) => (
                                  <li key={ing.id} className="text-xs text-gray-500 flex justify-between items-center group/ing p-1 hover:bg-gray-50 rounded-md transition-colors">
                                    <span className="flex items-center gap-2">
                                      <span className={`w-1 h-1 rounded-full ${ing.added_to_shopping_list ? 'bg-purple-400' : 'bg-gray-300'}`}></span>
                                      {ing.name}
                                    </span>
                                    <button 
                                      onClick={() => removeIngredient(ing.id)}
                                      className="text-red-300 hover:text-red-500 opacity-0 group-hover/ing:opacity-100 transition-opacity"
                                    >
                                      <Trash2 className="w-2.5 h-2.5" />
                                    </button>
                                  </li>
                                ))}
                              </ul>
                              
                              {hasMore && (
                                <button 
                                  onClick={() => toggleExpand(meal.id)}
                                  className="text-[10px] font-bold text-indigo-400 hover:text-indigo-600 flex items-center gap-1 transition-colors"
                                >
                                  {isExpanded ? (
                                    <><ChevronUp className="w-2.5 h-2.5" /> Show less</>
                                  ) : (
                                    <><ChevronDown className="w-2.5 h-2.5" /> {ingredients.length - 3} more...</>
                                  )}
                                </button>
                              )}

                              <div className="pt-2 flex gap-2">
                                <input
                                  type="text"
                                  placeholder="Add ingredient..."
                                  className="flex-1 text-[11px] px-2 py-1 rounded-lg border border-gray-100 focus:border-indigo-300 focus:ring-1 focus:ring-indigo-300 outline-none transition-all bg-white/50"
                                  onKeyDown={(e) => {
                                    if (e.key === 'Enter') {
                                      const val = e.currentTarget.value;
                                      addIngredient(meal.id, val);
                                      e.currentTarget.value = '';
                                    }
                                  }}
                                />
                                <button 
                                  className="p-1 bg-indigo-50 text-indigo-600 hover:bg-indigo-100 rounded-lg transition-colors"
                                  onClick={(e) => {
                                    const input = e.currentTarget.previousElementSibling as HTMLInputElement;
                                    addIngredient(meal.id, input.value);
                                    input.value = '';
                                  }}
                                >
                                  <Plus className="w-3 h-3" />
                                </button>
                              </div>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
