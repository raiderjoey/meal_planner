import { useState, useEffect } from 'react';
import { format, startOfWeek, addDays, isSameDay, parseISO } from 'date-fns';
import { Loader2 } from 'lucide-react';
import { pb } from '../lib/pocketbase';
import { Link } from 'react-router-dom';
import type { Meal, MealPlan, Slot } from '../types';
import { Button, Card, PageHeader, IconButton } from '../components/ui';

const SLOT_LABELS: Record<Slot, string> = {
  breakfast: 'Breakfast',
  lunch: 'Lunch',
  dinner: 'Dinner',
  snack: 'Snack'
};

const SLOT_ORDER: Slot[] = ['breakfast', 'lunch', 'dinner', 'snack'];

const DEFAULT_MEAL_IMAGE = 'https://images.unsplash.com/photo-1547592166-23ac45744acd?auto=format&fit=crop&q=80&w=200';

export default function WeekView() {
  const [currentWeekStart, setCurrentWeekStart] = useState(startOfWeek(new Date(), { weekStartsOn: 1 }));
  const [mealPlans, setMealPlans] = useState<MealPlan[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedDayIndex, setSelectedDayIndex] = useState(new Date().getDay() === 0 ? 6 : new Date().getDay() - 1); // 0-indexed Mon-Sun

  // Form states
  const [addingTo, setAddingTo] = useState<{ date: string, slot: Slot } | null>(null);
  const [mealName, setMealName] = useState('');

  const days = Array.from({ length: 7 }).map((_, i) => addDays(currentWeekStart, i));
  const today = new Date();

  const fetchMealPlans = async () => {
    try {
      const startDate = format(currentWeekStart, 'yyyy-MM-dd');
      const endDate = format(addDays(currentWeekStart, 6), 'yyyy-MM-dd');
      
      const records = await pb.collection('meal_plans').getFullList<MealPlan>({
        filter: `date >= "${startDate} 00:00:00" && date <= "${endDate} 23:59:59"`,
        sort: 'date',
        expand: 'meal',
      });
      setMealPlans(records);
    } catch (error) {
      console.error('Failed to fetch meal plans:', error instanceof Error ? error.message : error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const init = async () => {
      await fetchMealPlans();
    };
    init();
    
    const unsubscribeMealPlans = pb.collection('meal_plans').subscribe('*', fetchMealPlans);
    return () => {
      unsubscribeMealPlans.then(unsub => unsub());
    };
  }, [currentWeekStart]);

  const saveMealPlan = async () => {
    if (!mealName.trim() || !addingTo) return;
    try {
      // Step 1: Create or select a meal
      const newMeal = await pb.collection('meals').create<Meal>({ 
        name: mealName.trim(),
        ingredients: [],
        prep_steps: []
      });
      
      // Step 2: Create a meal_plan linked to the meal
      const mealPlan = await pb.collection('meal_plans').create<MealPlan>({
        date: addingTo.date + ' 12:00:00.000Z',
        slot: addingTo.slot,
        meal: newMeal.id
      });

      // Automated Sync (Optional logic could go here)
      
      setAddingTo(null);
      setMealName('');
    } catch (e) {
      console.error('Error saving meal plan:', e instanceof Error ? e.message : e);
    }
  };

  const deleteMealPlan = async (id: string) => {
    if (!confirm('Are you sure you want to remove this meal from the plan?')) return;
    try {
      await pb.collection('meal_plans').delete(id);
    } catch (e) {
      console.error('Error deleting meal plan:', e instanceof Error ? e.message : e);
    }
  };

  const getMealImage = (meal?: Meal) => {
    if (meal?.image) {
      return pb.files.getURL(meal, meal.image);
    }
    return DEFAULT_MEAL_IMAGE;
  };

  if (loading && mealPlans.length === 0) {
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

      {/* Weekly Summary Section (Mobile Only) */}
      <section className="flex flex-col gap-4 md:hidden">
        <div className="flex justify-between items-end">
          <div className="flex flex-col">
            <span className="font-label-sm text-label-sm text-tertiary uppercase tracking-wider">Weekly Overview</span>
            <h2 className="font-headline-lg text-[32px] text-on-surface">Your Meal Progress</h2>
          </div>
          <div className="flex flex-col items-end">
            <span className="font-headline-sm text-headline-sm text-primary">65%</span>
            <span className="font-label-sm text-label-sm text-outline">Complete</span>
          </div>
        </div>
        <div className="w-full h-3 bg-surface-container rounded-full overflow-hidden">
          <div className="h-full bg-primary-container w-[65%] rounded-full shadow-sm"></div>
        </div>
        <div className="grid grid-cols-2 gap-4 mt-2">
          <div className="bg-surface-container-low p-4 rounded-xl flex flex-col gap-1 border border-outline-variant/30">
            <span className="font-label-sm text-label-sm text-tertiary">Nutrients</span>
            <span className="font-label-md text-label-md text-on-surface">1,840 kcal / day</span>
          </div>
          <div className="bg-surface-container-low p-4 rounded-xl flex flex-col gap-1 border border-outline-variant/30">
            <span className="font-label-sm text-label-sm text-tertiary">Saved</span>
            <span className="font-label-md text-label-md text-on-surface">$42.50 this week</span>
          </div>
        </div>
      </section>

      {/* Horizontal Day Selector (Mobile Only) */}
      <section className="flex flex-col gap-4 md:hidden">
        <div className="flex justify-between items-center">
          <h3 className="font-headline-sm text-headline-sm text-on-surface">Week {format(currentWeekStart, 'w')}</h3>
        </div>
        <div className="flex overflow-x-auto gap-3 pb-4 hide-scrollbar snap-x">
          {days.map((day, idx) => (
            <div 
              key={idx}
              onClick={() => setSelectedDayIndex(idx)}
              className={`snap-center min-w-[64px] flex flex-col items-center gap-2 p-3 rounded-full cursor-pointer transition-all ${
                selectedDayIndex === idx 
                  ? 'bg-primary-container text-on-primary-container shadow-md ring-2 ring-primary-container ring-offset-2' 
                  : 'bg-surface-container-low text-on-surface-variant'
              }`}
            >
              <span className="font-label-sm text-label-sm">{format(day, 'EEE')}</span>
              <span className={`w-8 h-8 flex items-center justify-center font-label-md text-label-md rounded-full ${selectedDayIndex === idx ? 'bg-surface text-primary' : ''}`}>
                {format(day, 'd')}
              </span>
            </div>
          ))}
        </div>
      </section>

      {/* Weekly Grid Layout */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-7 gap-gutter items-start">
        {days.map((day, idx) => {
          const dayString = format(day, 'yyyy-MM-dd');
          const isToday = isSameDay(day, today);
          const dayMeals = mealPlans.filter(m => m.date.startsWith(dayString));
          
          // On mobile, only show the selected day
          const isVisible = selectedDayIndex === idx;

          return (
            <Card 
              key={dayString} 
              className={`overflow-hidden flex flex-col h-full transition-all ${
                isToday ? 'border-2 border-primary/20 relative' : ''
              } ${!isVisible ? 'hidden md:flex' : 'flex'}`}
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

              <div className="flex-1 p-sm space-y-md">
                {SLOT_ORDER.map(slot => {
                  const mealPlan = dayMeals.find(m => m.slot === slot);
                  const isAdding = addingTo?.date === dayString && addingTo?.slot === slot;

                  return (
                    <div key={slot} className="group relative">
                      <p className="font-label-sm text-label-sm text-on-surface-variant/60 mb-1">{SLOT_LABELS[slot]}</p>

                      {mealPlan && mealPlan.expand?.meal ? (
                        <div className="flex items-center gap-3 cursor-pointer group-hover:opacity-80 transition-opacity pr-8">
                          <div className="w-10 h-10 rounded-lg overflow-hidden bg-surface-container flex-shrink-0">
                            <img 
                              className="w-full h-full object-cover" 
                              src={getMealImage(mealPlan.expand.meal)} 
                              alt={mealPlan.expand.meal.name} 
                            />
                          </div>
                          <p className="font-body-sm text-body-sm font-semibold text-on-surface line-clamp-2">{mealPlan.expand.meal.name}</p>
                          <button 
                            onClick={(e) => {
                              e.stopPropagation();
                              deleteMealPlan(mealPlan.id);
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
                              if (e.key === 'Enter') saveMealPlan();
                              if (e.key === 'Escape') setAddingTo(null);
                            }}
                          />
                          <div className="flex gap-1">
                            <Button onClick={saveMealPlan} size="sm" className="flex-1 py-1 rounded-md text-[10px]">Save</Button>
                            <Button onClick={() => setAddingTo(null)} variant="ghost" size="sm" className="flex-1 py-1 rounded-md text-[10px] bg-surface-container hover:bg-surface-container-high">X</Button>
                          </div>
                        </div>
                      ) : (
                        <button 
                          onClick={() => {
                            setAddingTo({ date: dayString, slot });
                            setMealName('');
                          }}
                          className="w-full flex flex-col justify-center border-2 border-dashed border-outline-variant rounded-lg p-2 hover:border-primary transition-colors text-center bg-surface group-hover:bg-white cursor-pointer"
                        >
                          <span className="material-symbols-outlined text-primary text-[20px]">add</span>
                          <p className="font-label-sm text-label-sm text-primary">Add {SLOT_LABELS[slot]}</p>
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
