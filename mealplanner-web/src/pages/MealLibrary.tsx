import React, { useState, useEffect } from 'react';
import { pb } from '../lib/pocketbase';
import type { Meal } from '../types';
import { Loader2 } from 'lucide-react';
import { Button, Card, PageHeader, Badge, IconButton } from '../components/ui';

const MealLibrary: React.FC = () => {
  const [meals, setMeals] = useState<Meal[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchMeals = async () => {
    try {
      const records = await pb.collection('meals').getFullList<Meal>({
        sort: '-created',
      });
      setMeals(records);
    } catch (error) {
      console.error('Failed to fetch meals:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const init = async () => {
      await fetchMeals();
    };
    init();

    const unsubscribe = pb.collection('meals').subscribe('*', fetchMeals);
    return () => {
      unsubscribe.then(unsub => unsub());
    };
  }, []);

  const getImageUrl = (meal: Meal) => {
    if (!meal.image) return 'https://images.unsplash.com/photo-1547592166-23ac45744acd?auto=format&fit=crop&q=80&w=800';
    return pb.files.getURL(meal, meal.image);
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
        title="Meal Library" 
        description="Browse your curated collection of farm-fresh recipes and planned meals. Organized for health and simplicity."
      >
        <Button className="flex items-center gap-2">
          <span className="material-symbols-outlined">add</span>
          Create New Meal
        </Button>
      </PageHeader>

      {/* Filter Bar */}
      <section className="flex flex-wrap items-center gap-md bg-surface-container-low p-sm rounded-xl">
        <div className="flex items-center gap-sm px-2">
          <span className="material-symbols-outlined text-primary">filter_list</span>
          <span className="font-label-md text-label-md text-tertiary">Quick Filters:</span>
        </div>
        <div className="flex flex-wrap gap-xs">
          <Button variant="tonal" size="sm">All Recipes</Button>
          <Button variant="ghost" size="sm" className="bg-surface-container-high hover:bg-primary-fixed">Vegetarian</Button>
          <Button variant="ghost" size="sm" className="bg-surface-container-high hover:bg-primary-fixed">High Protein</Button>
          <Button variant="ghost" size="sm" className="bg-surface-container-high hover:bg-primary-fixed">Under 30 Min</Button>
          <Button variant="ghost" size="sm" className="bg-surface-container-high hover:bg-primary-fixed">Gluten-Free</Button>
        </div>
        <div className="ml-auto hidden lg:block">
          <Button variant="ghost" size="sm" className="text-primary flex items-center gap-1">
            Advanced Filters
            <span className="material-symbols-outlined">expand_more</span>
          </Button>
        </div>
      </section>

      {/* Bento Grid Layout */}
      {meals.length > 0 ? (
        <section className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-gutter">
          {/* Large Featured Card (First Meal) */}
          {meals.slice(0, 1).map((meal) => (
            <Card key={meal.id} className="lg:col-span-2 lg:row-span-2 overflow-hidden hover:custom-shadow-hover transition-all group flex flex-col" hoverable>
              <div className="relative h-[400px] overflow-hidden">
                <img 
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" 
                  src={getImageUrl(meal)} 
                  alt={meal.name}
                />
                <div className="absolute top-4 left-4 flex gap-2">
                  {meal.tags && Array.isArray(meal.tags) && meal.tags.slice(0, 2).map(tag => (
                    <Badge key={tag} variant="surface" className="bg-white/90 backdrop-blur-md text-primary">{tag}</Badge>
                  ))}
                </div>
                <IconButton 
                  icon="favorite" 
                  className="absolute top-4 right-4 bg-white/90 backdrop-blur-md text-error shadow-sm"
                  style={{ fontVariationSettings: "'FILL' 1" }}
                />
              </div>
              <div className="p-md flex flex-col flex-grow">
                <div className="flex justify-between items-start mb-2">
                  <h3 className="font-headline-md text-headline-md text-on-background">{meal.name}</h3>
                </div>
                <p className="text-body-md text-on-surface-variant flex-grow line-clamp-3">{meal.description}</p>
                <div className="mt-md flex items-center justify-between">
                  <div className="flex -space-x-2">
                    <div className="w-8 h-8 rounded-full bg-secondary-fixed border-2 border-white flex items-center justify-center text-[10px] font-bold">HP</div>
                    <div className="w-8 h-8 rounded-full bg-primary-fixed border-2 border-white flex items-center justify-center text-[10px] font-bold text-primary">RS</div>
                  </div>
                  <button className="text-primary font-label-md text-label-md hover:underline cursor-pointer">View Recipe</button>
                </div>
              </div>
            </Card>
          ))}

          {/* Regular Cards */}
          {meals.slice(1).map((meal) => (
            <Card key={meal.id} className="overflow-hidden hover:custom-shadow-hover transition-all group" hoverable>
              <div className="h-48 overflow-hidden">
                <img 
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" 
                  src={getImageUrl(meal)} 
                  alt={meal.name}
                />
              </div>
              <div className="p-md">
                <div className="flex gap-2 mb-2">
                  {meal.tags && Array.isArray(meal.tags) && (
                    <span className="text-tertiary font-label-sm text-label-sm">{meal.tags[0]}</span>
                  )}
                </div>
                <h3 className="font-headline-sm text-headline-sm text-on-background mb-1 line-clamp-1">{meal.name}</h3>
                <div className="flex items-center gap-4 text-on-surface-variant font-label-sm text-label-sm mt-4">
                  <span className="flex items-center gap-1"><span className="material-symbols-outlined text-sm">flatware</span> {meal.ingredients?.length || 0} Ingredients</span>
                </div>
              </div>
            </Card>
          ))}
        </section>
      ) : (
        <div className="text-center py-xl bg-surface-container-lowest rounded-xl border-2 border-dashed border-outline-variant">
          <p className="text-on-surface-variant font-body-lg">No meals found in your library.</p>
          <button className="mt-md text-primary font-label-md hover:underline cursor-pointer">Add your first meal</button>
        </div>
      )}

      {/* Pagination */}
      {meals.length > 0 && (
        <div className="mt-xl flex justify-center">
          <Button variant="outline" className="flex items-center gap-2">
            Show More Recipes
            <span className="material-symbols-outlined">keyboard_arrow_down</span>
          </Button>
        </div>
      )}
    </div>
  );
};

export default MealLibrary;
