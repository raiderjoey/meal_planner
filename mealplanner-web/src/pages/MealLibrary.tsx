import React, { useState, useEffect } from 'react';
import { pb } from '../lib/pocketbase';
import type { Recipe } from '../types';
import { Loader2 } from 'lucide-react';
import { Button, Card, PageHeader, Badge, IconButton } from '../components/ui';

const MealLibrary: React.FC = () => {
  const [recipes, setRecipes] = useState<Recipe[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchRecipes = async () => {
    try {
      const records = await pb.collection('recipes').getFullList<Recipe>({
        sort: '-created',
      });
      setRecipes(records);
    } catch (error) {
      console.error('Failed to fetch recipes:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const init = async () => {
      await fetchRecipes();
    };
    init();

    const unsubscribe = pb.collection('recipes').subscribe('*', fetchRecipes);
    return () => {
      unsubscribe.then(unsub => unsub());
    };
  }, []);

  const getImageUrl = (recipe: Recipe) => {
    if (!recipe.image) return 'https://images.unsplash.com/photo-1547592166-23ac45744acd?auto=format&fit=crop&q=80&w=800';
    return pb.files.getURL(recipe, recipe.image);
  };

  if (loading && recipes.length === 0) {
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
      {recipes.length > 0 ? (
        <section className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-gutter">
          {/* Large Featured Card (First Recipe) */}
          {recipes.slice(0, 1).map((recipe) => (
            <Card key={recipe.id} className="lg:col-span-2 lg:row-span-2 overflow-hidden hover:custom-shadow-hover transition-all group flex flex-col" hoverable>
              <div className="relative h-[400px] overflow-hidden">
                <img 
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" 
                  src={getImageUrl(recipe)} 
                  alt={recipe.name}
                />
                <div className="absolute top-4 left-4 flex gap-2">
                  {recipe.tags && Array.isArray(recipe.tags) && recipe.tags.slice(0, 2).map(tag => (
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
                  <h3 className="font-headline-md text-headline-md text-on-background">{recipe.name}</h3>
                  {recipe.prep_time && (
                    <span className="text-tertiary flex items-center gap-1 font-label-sm text-label-sm">
                      <span className="material-symbols-outlined text-sm">schedule</span> {recipe.prep_time}
                    </span>
                  )}
                </div>
                <p className="text-body-md text-on-surface-variant flex-grow line-clamp-3">{recipe.description}</p>
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
          {recipes.slice(1).map((recipe) => (
            <Card key={recipe.id} className="overflow-hidden hover:custom-shadow-hover transition-all group" hoverable>
              <div className="h-48 overflow-hidden">
                <img 
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" 
                  src={getImageUrl(recipe)} 
                  alt={recipe.name}
                />
              </div>
              <div className="p-md">
                <div className="flex gap-2 mb-2">
                  {recipe.tags && Array.isArray(recipe.tags) && (
                    <span className="text-tertiary font-label-sm text-label-sm">{recipe.tags[0]}</span>
                  )}
                </div>
                <h3 className="font-headline-sm text-headline-sm text-on-background mb-1 line-clamp-1">{recipe.name}</h3>
                <div className="flex items-center gap-4 text-on-surface-variant font-label-sm text-label-sm mt-4">
                  {recipe.prep_time && (
                    <span className="flex items-center gap-1"><span className="material-symbols-outlined text-sm">schedule</span> {recipe.prep_time}</span>
                  )}
                  {recipe.servings && (
                    <span className="flex items-center gap-1"><span className="material-symbols-outlined text-sm">flatware</span> {recipe.servings}</span>
                  )}
                  {recipe.calories && (
                    <span className="flex items-center gap-1"><span className="material-symbols-outlined text-sm">bolt</span> {recipe.calories}</span>
                  )}
                </div>
              </div>
            </Card>
          ))}
        </section>
      ) : (
        <div className="text-center py-xl bg-surface-container-lowest rounded-xl border-2 border-dashed border-outline-variant">
          <p className="text-on-surface-variant font-body-lg">No recipes found in your library.</p>
          <button className="mt-md text-primary font-label-md hover:underline cursor-pointer">Add your first recipe</button>
        </div>
      )}

      {/* Pagination */}
      {recipes.length > 0 && (
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
