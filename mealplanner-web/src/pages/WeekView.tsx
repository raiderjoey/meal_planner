import { useState, useEffect } from 'react';
import { format, startOfWeek, addDays, isSameDay } from 'date-fns';
import { Loader2 } from 'lucide-react';
import { pb } from '../lib/pocketbase';
import { Link } from 'react-router-dom';
import type { Meal, Category } from '../types';
import { Button, Card, PageHeader, IconButton } from '../components/ui';

const CATEGORY_LABELS: Record<Category, string> = {
  breakfast: 'Breakfast',
  lunch: 'Lunch',
  dinner: 'Dinner',
  dessert: 'Dessert',
  snack: 'Snack'
};

const CATEGORY_ORDER: Category[] = ['breakfast', 'lunch', 'dinner', 'dessert', 'snack'];

const DEFAULT_MEAL_IMAGE = 'https://images.unsplash.com/photo-1547592166-23ac45744acd?auto=format&fit=crop&q=80&w=200';

export default function WeekView() {
  const [currentWeekStart, setCurrentWeekStart] = useState(startOfWeek(new Date(), { weekStartsOn: 1 }));
  const [meals, setMeals] = useState<Meal[]>([]);
  const [loading, setLoading] = useState(true);

  // Form states
  const [addingTo, setAddingTo] = useState<{ day: string, category: Category } | null>(null);
  const [mealName, setMealName] = useState('');

  const days = Array.from({ length: 7 }).map((_, i) => addDays(currentWeekStart, i));
  const today = new Date();

  const fetchMeals = async () => {
    try {
      const records = await pb.collection('meals').getFullList<Meal>({
        sort: 'day_of_week',
        expand: 'ingredients_via_meal_id,recipe_id',
      });
      setMeals(records);
    } catch (error) {
      console.error('Failed to fetch meals:', error instanceof Error ? error.message : error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const init = async () => {
      await fetchMeals();
    };
    init();
    
    const unsubscribeMeals = pb.collection('meals').subscribe('*', fetchMeals);
    return () => {
      unsubscribeMeals.then(unsub => unsub());
    };
  }, []);

  const saveMeal = async () => {
    if (!mealName.trim() || !addingTo) return;
    try {
      await pb.collection('meals').create({ 
        day_of_week: addingTo.day, 
        name: mealName.trim(),
        category: addingTo.category 
      });
      setAddingTo(null);
      setMealName('');
    } catch (e) {
      console.error('Error saving meal:', e instanceof Error ? e.message : e);
    }
  };

  const deleteMeal = async (id: string) => {
    if (!confirm('Are you sure you want to delete this meal?')) return;
    try {
      await pb.collection('meals').delete(id);
      // fetchMeals is called by the subscription
    } catch (e) {
      console.error('Error deleting meal:', e instanceof Error ? e.message : e);
  const getMealImage = (meal: Meal) => {
    if (meal.expand?.recipe_id?.image) {
      return pb.files.getURL(meal.expand.recipe_id, meal.expand.recipe_id.image);
    }
    return DEFAULT_MEAL_IMAGE;
  };

  const getMealImage = (meal: Meal) => {
    if (meal.expand?.recipe_id?.image) {
      return pb.files.getURL(meal.expand.recipe_id, meal.expand.recipe_id.image);
    }
    return DEFAULT_MEAL_IMAGE;
  };

  if (loading && meals.length === 0) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="w-8 h-8 text-primary animate-spin" />
      </div>
    );
  }

  return (
    <div className="space-y-lg">
      <PageHeader 
        title="Your Weekly Plan" 
        description="Fresh, organized, and nourishing meals for your week."
      >
        <div className="flex items-center bg-surface-container rounded-full p-1.5 shadow-sm">
          <IconButton 
            icon="chevron_left"
            onClick={() => setCurrentWeekStart(addDays(currentWeekStart, -7))}
            className="hover:bg-white"
          />
          <span className="px-md font-label-md text-label-md text-on-surface-variant font-bold">
            {format(currentWeekStart, 'MMM d')} - {format(addDays(currentWeekStart, 6), 'MMM d')}
          </span>
          <IconButton 
            icon="chevron_right"
            onClick={() => setCurrentWeekStart(addDays(currentWeekStart, 7))}
            className="hover:bg-white"
          />
        </div>
      </PageHeader>

      {/* Weekly Grid Layout */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-7 gap-gutter items-start">
        {days.map((day) => {
          const dayString = format(day, 'yyyy-MM-dd');
          const isToday = isSameDay(day, today);
          const dayMeals = meals.filter(m => m.day_of_week === dayString);

          return (
            <Card 
              key={dayString} 
              className={`overflow-hidden flex flex-col h-full transition-all ${
                isToday ? 'border-2 border-primary/20 relative' : ''
              }`}
            >
              {isToday && (
                <div className="absolute top-2 right-2 bg-primary text-white text-[10px] px-2 py-0.5 rounded-full font-bold z-10">TODAY</div>
              )}
              
              <div className={`${isToday ? 'bg-primary-fixed border-primary-fixed-dim' : 'bg-surface-container-low border-surface-variant'} p-sm text-center border-b`}>
                <p className={`font-label-sm text-label-sm uppercase tracking-widest ${isToday ? 'text-on-primary-fixed-variant' : 'text-tertiary'}`}>
                  {format(day, 'EEE')}
                </p>
                <p className={`font-headline-sm text-headline-sm ${isToday ? 'text-on-primary-fixed' : 'text-on-surface'}`}>
                  {format(day, 'd')}
                </p>
              </div>
const deleteMeal = async (id: string) => {
  if (!confirm('Are you sure you want to delete this meal?')) return;
  try {
    await pb.collection('meals').delete(id);
  } catch (e) {
    console.error('Error deleting meal:', e instanceof Error ? e.message : e);
  }
};

const getMealImage = (meal: Meal) => {
...
              {CATEGORY_ORDER.map(category => {
                const meal = dayMeals.find(m => m.category === category);
                const isAdding = addingTo?.day === dayString && addingTo?.category === category;

              <div className="flex-1 p-sm space-y-md">
                {CATEGORY_ORDER.map(category => {
                  const meal = dayMeals.find(m => m.category === category);
                  const isAdding = addingTo?.day === dayString && addingTo?.category === category;

                  return (
                    <div key={category} className="group relative">
                      <p className="font-label-sm text-label-sm text-on-surface-variant/60 mb-1">{CATEGORY_LABELS[category]}</p>

                      {meal ? (
                        <div className="flex items-center gap-3 cursor-pointer group-hover:opacity-80 transition-opacity pr-8">
                          <div className="w-10 h-10 rounded-lg overflow-hidden bg-surface-container flex-shrink-0">
                            <img 
                              className="w-full h-full object-cover" 
                              src={getMealImage(meal)} 
                              alt={meal.name} 
                            />
                          </div>
                          <p className="font-body-sm text-body-sm font-semibold text-on-surface line-clamp-2">{meal.name}</p>
                          <button 
                            onClick={(e) => {
                              e.stopPropagation();
                              deleteMeal(meal.id);
                            }}
                            className="absolute right-0 top-1/2 -translate-y-1/2 opacity-0 group-hover:opacity-100 p-1 text-on-surface-variant hover:text-error transition-all"
                          >
                            <span className="material-symbols-outlined text-[18px]">delete</span>
                          </button>
                        </div>
                      ) : isAdding ? (
                        <div className="flex flex-col gap-2 animate-in fade-in zoom-in duration-200">
                          <input
                            type="text"
                            value={mealName}
                            onChange={(e) => setMealName(e.target.value)}
                            placeholder="Meal name..."
                            className="w-full px-2 py-1 text-xs rounded-lg border border-primary outline-none"
                            autoFocus
                            onKeyDown={(e) => {
                              if (e.key === 'Enter') saveMeal();
                              if (e.key === 'Escape') setAddingTo(null);
                            }}
                          />
                          <div className="flex gap-1">
                            <Button onClick={saveMeal} size="sm" className="flex-1 py-1 rounded-md text-[10px]">Save</Button>
                            <Button onClick={() => setAddingTo(null)} variant="ghost" size="sm" className="flex-1 py-1 rounded-md text-[10px] bg-surface-container hover:bg-surface-container-high">X</Button>
                          </div>
                        </div>
                      ) : (
                        <button 
                          onClick={() => {
                            setAddingTo({ day: dayString, category });
                            setMealName('');
                          }}
                          className="w-full flex flex-col justify-center border-2 border-dashed border-outline-variant rounded-lg p-2 hover:border-primary transition-colors text-center bg-surface group-hover:bg-white cursor-pointer"
                        >
                          <span className="material-symbols-outlined text-primary text-[20px]">add</span>
                          <p className="font-label-sm text-label-sm text-primary">Add {CATEGORY_LABELS[category]}</p>
                        </button>
                return (
                  <div key={category} className="group relative">
                    <p className="font-label-sm text-label-sm text-on-surface-variant/60 mb-1">{CATEGORY_LABELS[category]}</p>

                    {meal ? (
                      <div className="flex items-center gap-3 cursor-pointer group-hover:opacity-80 transition-opacity pr-8">
                        <div className="w-10 h-10 rounded-lg overflow-hidden bg-surface-container flex-shrink-0">
                          <img 
                            className="w-full h-full object-cover" 
                            src={getMealImage(meal)} 
                            alt={meal.name} 
                          />
                        </div>
                        <p className="font-body-sm text-body-sm font-semibold text-on-surface line-clamp-2">{meal.name}</p>
                        <button 
                          onClick={(e) => {
                            e.stopPropagation();
                            deleteMeal(meal.id);
                          }}
                          className="absolute right-0 top-6 opacity-0 group-hover:opacity-100 p-1 text-on-surface-variant hover:text-error transition-all"
                        >
                          <span className="material-symbols-outlined text-[18px]">delete</span>
                        </button>
                      </div>
                    ) : isAdding ? (
                        <div className="flex flex-col gap-2 animate-in fade-in zoom-in duration-200">
                          <input
                            type="text"
                            value={mealName}
                            onChange={(e) => setMealName(e.target.value)}
                            placeholder="Meal name..."
                            className="w-full px-2 py-1 text-xs rounded-lg border border-primary outline-none"
                            autoFocus
                            onKeyDown={(e) => {
                              if (e.key === 'Enter') saveMeal();
                              if (e.key === 'Escape') setAddingTo(null);
                            }}
                          />
                          <div className="flex gap-1">
                            <Button onClick={saveMeal} size="sm" className="flex-1 py-1 rounded-md text-[10px]">Save</Button>
                            <Button onClick={() => setAddingTo(null)} variant="ghost" size="sm" className="flex-1 py-1 rounded-md text-[10px] bg-surface-container hover:bg-surface-container-high">X</Button>
                          </div>
                        </div>
                      ) : (
                        <button 
                          onClick={() => {
                            setAddingTo({ day: dayString, category });
                            setMealName('');
                          }}
                          className="w-full flex flex-col justify-center border-2 border-dashed border-outline-variant rounded-lg p-2 hover:border-primary transition-colors text-center bg-surface group-hover:bg-white cursor-pointer"
                        >
                          <span className="material-symbols-outlined text-primary text-[20px]">add</span>
                          <p className="font-label-sm text-label-sm text-primary">Add {CATEGORY_LABELS[category]}</p>
                        </button>
                      )}
                    </div>
                  );
                })}
              </div>
            </Card>
          );
        })}
      </div>

      {/* Meal Summary & Prep */}
      <section className="mt-xl grid grid-cols-1 lg:grid-cols-3 gap-gutter">
        <div className="lg:col-span-2 bg-tertiary-fixed rounded-xl p-6 flex flex-col md:flex-row items-center gap-lg border border-tertiary-fixed-dim">
          <div className="flex-grow">
            <h3 className="font-headline-sm text-headline-sm text-on-tertiary-fixed mb-2">Prep for Tomorrow</h3>
            <p className="font-body-sm text-body-sm text-on-tertiary-fixed-variant">
              Check your prep list to stay ahead of your morning routine and evening meals.
            </p>
          </div>
          <Link to="/prep-list">
            <Button size="lg" className="whitespace-nowrap">View Prep List</Button>
          </Link>
        </div>
        
        <Card className="p-6 flex flex-col justify-between">
          <div>
            <h3 className="font-label-md text-label-md text-on-surface-variant font-bold mb-4 uppercase">Weekly Goal</h3>
            <div className="flex items-center justify-between mb-2">
              <span className="font-body-sm text-body-sm">80% Plant-Based</span>
              <span className="font-label-sm text-label-sm text-primary">65% Achieved</span>
            </div>
            <div className="w-full bg-surface-container h-2 rounded-full overflow-hidden">
              <div className="bg-primary h-full w-[65%]"></div>
            </div>
          </div>
          <button className="text-secondary font-label-sm text-label-sm mt-4 flex items-center gap-1 hover:underline cursor-pointer">
            View full nutrition breakdown <span className="material-symbols-outlined text-[16px]">arrow_forward</span>
          </button>
        </Card>
      </section>

      {/* FAB for adding meals globally */}
      <Button 
        size="icon"
        className="fixed bottom-margin-desktop right-margin-desktop w-14 h-14 shadow-xl z-40 md:hidden lg:flex"
        onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
      >
        <span className="material-symbols-outlined text-[32px]">add</span>
      </Button>
    </div>
  );
}
