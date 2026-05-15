import { useState, useEffect } from 'react';
import { Loader2 } from 'lucide-react';
import { pb } from '../lib/pocketbase';
import type { Ingredient } from '../types';
import { Button, Card, PageHeader, Badge } from '../components/ui';

const CATEGORY_MAP: Record<string, string> = {
  'Produce': 'eco',
  'Grains': 'bakery_dining',
  'Dairy & Eggs': 'egg',
  'Meat': 'kebab_dining',
  'Pantry': 'liquor',
  'Other': 'shopping_basket'
};

const ORDERED_CATEGORIES = ["Produce", "Grains", "Dairy & Eggs", "Meat", "Pantry", "Other"];

// Simple heuristic for categorization until schema is updated
export const getHeuristicCategory = (name: string): string => {
const getHeuristicCategory = (name: string): string => {
  const n = name.toLowerCase();
  if (n.includes('spinach') || n.includes('tomato') || n.includes('potato') || n.includes('basil') || n.includes('kale') || n.includes('pepper')) return 'Produce';
  if (n.includes('quinoa') || n.includes('bread') || n.includes('loaf') || n.includes('rice') || n.includes('pasta')) return 'Grains';
  if (n.includes('yogurt') || n.includes('butter') || n.includes('egg') || n.includes('cheese') || n.includes('milk')) return 'Dairy & Eggs';
  if (n.includes('chicken') || n.includes('beef') || n.includes('pork') || n.includes('fish') || n.includes('salmon')) return 'Meat';
  return 'Other';
};

export default function ShoppingList() {
  const [ingredients, setIngredients] = useState<Ingredient[]>([]);
  const [loading, setLoading] = useState(true);
  const [checkedItems, setCheckedItems] = useState<Set<string>>(new Set());

  const fetchIngredients = async () => {
    try {
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
    const init = async () => {
      await fetchIngredients();
    };
    init();
    
    const unsubscribeIngredients = pb.collection('ingredients').subscribe('*', fetchIngredients);
    return () => {
      unsubscribeIngredients.then(unsub => unsub());
    };
  }, []);

  const toggleChecked = (id: string) => {
    setCheckedItems(prev => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const clearChecked = async () => {
    if (!confirm('Remove checked items from shopping list?')) return;
    for (const id of Array.from(checkedItems)) {
      try {
        await pb.collection('ingredients').update(id, { added_to_shopping_list: false });
      } catch (e) {
        console.error(e);
      }
    }
    setCheckedItems(new Set());
  };

  if (loading && ingredients.length === 0) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="w-8 h-8 text-primary animate-spin" />
      </div>
    );
  }

  const grouped = ingredients.reduce((acc, ing) => {
    const cat = ing.category || getHeuristicCategory(ing.name);
    if (!acc[cat]) acc[cat] = [];
    acc[cat].push(ing);
    return acc;
  }, {} as Record<string, Ingredient[]>);

  const activeCategories = ORDERED_CATEGORIES.filter(c => grouped[c]?.length > 0);

  return (
    <div className="space-y-lg">
      <PageHeader 
        title="Shopping List" 
        description="Aggregated from your Weekly Meal Plan"
      >
        {checkedItems.size > 0 && (
          <Button onClick={clearChecked} variant="tonal" className="bg-error-container text-on-error-container">
            <span className="material-symbols-outlined mr-2">delete_sweep</span>
            Clear Checked
          </Button>
        )}
        <Button variant="ghost" className="bg-surface-container-high">
          <span className="material-symbols-outlined mr-2">share</span>
          Share
        </Button>
        <Button>
          <span className="material-symbols-outlined mr-2">print</span>
          Print
        </Button>
      </PageHeader>

      {/* Main Content: Bento-style Grid for Categories */}
      <div className="grid grid-cols-1 md:grid-cols-12 gap-gutter">
        {/* Left Column: Larger Categories */}
        <div className="md:col-span-8 space-y-gutter">
          {activeCategories.filter(c => c === 'Produce' || c === 'Other' || c === 'Meat').map(cat => (
            <Card key={cat} className="p-md">
              <div className="flex items-center gap-3 mb-md">
                <div className={`w-10 h-10 rounded-lg ${cat === 'Produce' ? 'bg-primary-fixed text-primary' : cat === 'Meat' ? 'bg-error-container text-on-error-container' : 'bg-surface-container text-tertiary'} flex items-center justify-center`}>
                  <span className="material-symbols-outlined">{CATEGORY_MAP[cat]}</span>
                </div>
                <h2 className="font-headline-sm text-headline-sm text-on-surface">{cat}</h2>
                <Badge variant="surface" className="ml-auto">
                  {grouped[cat]?.length || 0} Items
                </Badge>
              </div>
              <div className="space-y-sm">
                {grouped[cat]?.map(ing => (
                  <div 
                    key={ing.id} 
                    className={`flex items-center p-sm hover:bg-surface-container-low rounded-lg transition-all group cursor-pointer ${checkedItems.has(ing.id) ? 'opacity-60' : ''}`}
                    onClick={() => toggleChecked(ing.id)}
                  >
                    <input 
                      className="w-6 h-6 rounded-lg border-outline-variant text-primary focus:ring-primary-fixed-dim transition-all cursor-pointer" 
                      type="checkbox" 
                      checked={checkedItems.has(ing.id)}
                      readOnly
                    />
                    <div className="ml-4 flex-1">
                      <div className="flex justify-between items-center">
                        <p className={`font-body-md text-body-md text-on-surface ${checkedItems.has(ing.id) ? 'line-through' : ''}`}>{ing.name}</p>
                        {ing.quantity && <span className="text-on-surface-variant text-sm">{ing.quantity}</span>}
                      </div>
                      {ing.expand?.meal_id && (
                        <p className="font-body-sm text-body-sm text-on-surface-variant">For: {ing.expand.meal_id.name}</p>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </Card>
          ))}
        </div>

        {/* Right Column: Smaller Categories */}
        <div className="md:col-span-4 space-y-gutter">
          {activeCategories.filter(c => c === 'Grains' || c === 'Dairy & Eggs' || c === 'Pantry').map(cat => (
            <Card key={cat} className={`p-md ${cat === 'Dairy & Eggs' ? 'bg-tertiary-fixed/30 border-tertiary-fixed-dim/20' : ''}`}>
              <div className="flex items-center gap-3 mb-md">
                <div className={`w-10 h-10 rounded-lg ${cat === 'Grains' ? 'bg-secondary-fixed text-secondary' : 'bg-white/60 text-tertiary'} flex items-center justify-center`}>
                  <span className="material-symbols-outlined">{CATEGORY_MAP[cat]}</span>
                </div>
                <h2 className="font-headline-sm text-headline-sm text-on-surface">{cat}</h2>
              </div>
              <div className="space-y-sm">
                {grouped[cat]?.map(ing => (
                  <div 
                    key={ing.id} 
                    className={`flex items-center p-sm hover:bg-surface-container-low rounded-lg transition-all group cursor-pointer ${checkedItems.has(ing.id) ? 'opacity-60' : ''}`}
                    onClick={() => toggleChecked(ing.id)}
                  >
                    <input 
                      className="w-5 h-5 rounded-lg border-outline-variant text-primary focus:ring-primary-fixed-dim transition-all cursor-pointer" 
                      type="checkbox" 
                      checked={checkedItems.has(ing.id)}
                      readOnly
                    />
                    <div className="ml-3 flex-1">
                      <div className="flex justify-between items-center">
                        <p className={`font-body-md text-body-md text-on-surface ${checkedItems.has(ing.id) ? 'line-through' : ''}`}>{ing.name}</p>
                        {ing.quantity && <span className="text-on-surface-variant text-xs">{ing.quantity}</span>}
                      </div>
                      {ing.expand?.meal_id && (
                        <p className="font-body-sm text-body-sm text-on-surface-variant text-xs">For: {ing.expand.meal_id.name}</p>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </Card>
          ))}
        </div>

        {/* Seasonal Feature */}
        <section className="md:col-span-12">
          <div className="relative overflow-hidden rounded-xl bg-primary-container p-lg flex flex-col md:flex-row items-center gap-lg">
            <div className="z-10 text-center md:text-left text-on-primary-container">
              <h3 className="font-headline-md text-headline-md mb-sm">Seasonal Savvy</h3>
              <p className="font-body-lg text-body-lg opacity-90 max-w-xl">
                Heirloom tomatoes are at their peak freshness this month. We've automatically highlighted them for your favorite caprese salad meal plan!
              </p>
            </div>
            <div className="relative w-full md:w-64 h-48 md:h-32 rounded-lg overflow-hidden flex-shrink-0 shadow-lg">
              <img 
                className="w-full h-full object-cover" 
                src="https://images.unsplash.com/photo-1592489637182-8c172d6d7826?auto=format&fit=crop&q=80&w=400" 
                alt="Seasonal produce"
              />
            </div>
          </div>
        </section>
      </div>

      {/* FAB for adding custom items */}
      <Button 
        size="icon"
        className="fixed bottom-8 right-8 w-14 h-14 shadow-xl z-40"
      >
        <span className="material-symbols-outlined text-3xl">add</span>
      </Button>
    </div>
  );
}
