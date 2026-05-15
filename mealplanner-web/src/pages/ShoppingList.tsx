import { useState, useEffect } from 'react';
import { Loader2 } from 'lucide-react';
import { pb } from '../lib/pocketbase';
import type { ShoppingItem } from '../types';
import { Button, Card, PageHeader, Badge } from '../components/ui';

const CATEGORY_MAP: Record<string, string> = {
  'Produce': 'eco',
  'Grains': 'bakery_dining',
  'Dairy & Eggs': 'egg',
  'Meat': 'kebab_dining',
  'Pantry': 'liquor',
  'Other': 'shopping_basket'
};

const ORDERED_CATEGORIES: ShoppingItem['category'][] = ["Produce", "Grains", "Dairy & Eggs", "Meat", "Pantry", "Other"];

export default function ShoppingList() {
  const [items, setItems] = useState<ShoppingItem[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchItems = async () => {
    try {
      const records = await pb.collection('shopping_items').getFullList<ShoppingItem>({
        sort: 'name',
      });
      setItems(records);
    } catch (error) {
      console.error('Failed to fetch shopping items', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const init = async () => {
      await fetchItems();
    };
    init();
    
    const unsubscribe = pb.collection('shopping_items').subscribe('*', fetchItems);
    return () => {
      unsubscribe.then(unsub => unsub());
    };
  }, []);

  const toggleChecked = async (item: ShoppingItem) => {
    try {
      await pb.collection('shopping_items').update(item.id, {
        checked: !item.checked
      });
    } catch (error) {
      console.error('Failed to update item', error);
    }
  };

  const clearChecked = async () => {
    const checkedItems = items.filter(item => item.checked);
    if (checkedItems.length === 0) return;
    if (!confirm(`Remove ${checkedItems.length} checked items from shopping list?`)) return;
    
    try {
      await Promise.all(checkedItems.map(item => pb.collection('shopping_items').delete(item.id)));
    } catch (e) {
      console.error('Failed to clear checked items', e);
    }
  };

  if (loading && items.length === 0) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="w-8 h-8 text-primary animate-spin" />
      </div>
    );
  }

  const grouped = items.reduce((acc, item) => {
    const cat = item.category || 'Other';
    if (!acc[cat]) acc[cat] = [];
    acc[cat].push(item);
    return acc;
  }, {} as Record<string, ShoppingItem[]>);

  const activeCategories = ORDERED_CATEGORIES.filter(c => grouped[c]?.length > 0);

  const ShoppingItemRow = ({ item, isMobile = false }: { item: ShoppingItem, isMobile?: boolean }) => (
    <div 
      key={item.id} 
      className={`flex items-center p-sm hover:bg-surface-container-low rounded-lg transition-all group cursor-pointer ${item.checked ? 'opacity-60' : ''} ${isMobile ? 'bg-surface-container-lowest shadow-sm border border-surface-container' : ''}`}
      onClick={() => toggleChecked(item)}
    >
      <input 
        className={`${isMobile ? 'w-7 h-7' : 'w-6 h-6'} rounded-lg border-outline-variant text-primary focus:ring-primary-fixed-dim transition-all cursor-pointer`} 
        type="checkbox" 
        checked={item.checked}
        readOnly
      />
      <div className={`${isMobile ? 'ml-4' : 'ml-4'} flex-1`}>
        <div className="flex justify-between items-center">
          <p className={`font-body-md text-body-md text-on-surface ${item.checked ? 'line-through' : ''}`}>{item.name}</p>
          {item.quantity && <span className="text-on-surface-variant text-sm">{item.quantity}</span>}
        </div>
        {item.manual && (
          <p className="font-body-sm text-body-sm text-on-surface-variant text-xs italic">Added manually</p>
        )}
      </div>
    </div>
  );

  return (
    <div className="space-y-lg">
      <PageHeader 
        title="Shopping List" 
        description="Aggregated from your Weekly Meal Plan"
      >
        {items.some(i => i.checked) && (
          <Button onClick={clearChecked} variant="tonal" className="bg-error-container text-on-error-container">
            <span className="material-symbols-outlined mr-2">delete_sweep</span>
            Clear
          </Button>
        )}
        <Button variant="ghost" className="bg-surface-container-high hidden md:flex">
          <span className="material-symbols-outlined mr-2">share</span>
          Share
        </Button>
        <Button className="hidden md:flex">
          <span className="material-symbols-outlined mr-2">print</span>
          Print
        </Button>
      </PageHeader>

      {/* Mobile-only Summary/Header (Optional but nice to match design) */}
      <section className="flex flex-col gap-2 md:hidden">
        <h2 className="font-headline-lg text-[32px] text-on-surface">Weekly Grocery List</h2>
        <p className="text-on-surface-variant font-body-sm">Organized for your curated meal plan.</p>
      </section>

      {/* Mobile Collapsible View */}
      <div className="space-y-md md:hidden">
        {activeCategories.map(cat => (
          <details key={cat} className="group" open>
            <summary className="list-none flex items-center justify-between py-2 border-b border-outline-variant cursor-pointer">
              <div className="flex items-center gap-3">
                <span className="material-symbols-outlined text-primary">{CATEGORY_MAP[cat]}</span>
                <h3 className="font-headline-sm text-headline-sm text-on-surface">{cat}</h3>
              </div>
              <span className="material-symbols-outlined transition-transform group-open:rotate-180">expand_more</span>
            </summary>
            <div className="pt-4 space-y-3">
              {grouped[cat]?.map(item => (
                <ShoppingItemRow key={item.id} item={item} isMobile />
              ))}
            </div>
          </details>
        ))}
      </div>

      {/* Desktop Bento Grid Layout */}
      <div className="hidden md:grid grid-cols-1 md:grid-cols-12 gap-gutter">
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
                {grouped[cat]?.map(item => (
                  <ShoppingItemRow key={item.id} item={item} />
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
                {grouped[cat]?.map(item => (
                  <ShoppingItemRow key={item.id} item={item} />
                ))}
              </div>
            </Card>
          ))}
        </div>
      </div>

      {/* Seasonal Savvy Tip (Matches Mobile & Desktop) */}
      <section className="mt-lg">
        <div className="bg-tertiary-fixed rounded-2xl p-6 flex flex-col md:flex-row gap-4 border border-outline-variant">
          <div className="flex items-center gap-2">
            <span className="material-symbols-outlined text-primary" style={{ fontVariationSettings: "'FILL' 1" }}>lightbulb</span>
            <h4 className="font-label-md text-on-tertiary-fixed text-primary uppercase font-bold">Seasonal Savvy Tip</h4>
          </div>
          <div className="flex flex-col md:flex-row gap-4 items-center">
            <p className="font-body-sm text-on-tertiary-fixed-variant leading-relaxed flex-1">
              It's peak Asparagus season! Consider swapping your green beans for fresh local asparagus to get the best nutritional value and flavor this week. Local farms are seeing high yields right now.
            </p>
            <div className="h-32 w-full md:w-64 rounded-xl overflow-hidden shadow-sm flex-shrink-0">
              <img 
                className="w-full h-full object-cover" 
                src="https://images.unsplash.com/photo-1592489637182-8c172d6d7826?auto=format&fit=crop&q=80&w=400" 
                alt="Seasonal produce"
              />
            </div>
          </div>
        </div>
      </section>

      {/* FAB for adding custom items */}
      <Button 
        size="icon"
        className="fixed bottom-24 right-6 w-14 h-14 shadow-xl z-40"
      >
        <span className="material-symbols-outlined text-3xl">add</span>
      </Button>
    </div>
  );
}
