import { useState, useEffect, useCallback } from 'react';
import { supabase } from '../lib/supabase';
import { useHousehold } from '../contexts/HouseholdContext';
import { MealPlan, Recipe, MealType, Nutrition, MealParticipant } from '../types/database';

export interface MealWithDetails extends MealPlan {
  recipe?: Recipe;
  participants: MealParticipant[];
}

interface DateRange {
  start: string;
  end: string;
}

interface AddMealParams {
  scheduledDate: string;
  mealType: MealType;
  recipeId?: string;
  standaloneData?: {
    name: string;
    nutrition: Nutrition;
  };
  participantIds: string[];
}

export const useMealPlanning = (dateRange: DateRange) => {
  const { household } = useHousehold();
  const [meals, setMeals] = useState<MealWithDetails[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  const fetchRecipe = useCallback(async (recipeId: string): Promise<Recipe | undefined> => {
    const { data, error } = await supabase
      .from('recipes')
      .select('*')
      .eq('id', recipeId)
      .single();
    
    if (error) {
      console.error('Error fetching recipe for realtime update:', error);
      return undefined;
    }
    return data;
  }, []);

  const fetchParticipants = useCallback(async (mealId: string): Promise<MealParticipant[]> => {
    const { data, error } = await supabase
      .from('meal_participants')
      .select('*')
      .eq('meal_plan_id', mealId);
    
    if (error) {
      console.error('Error fetching participants for realtime update:', error);
      return [];
    }
    return data || [];
  }, []);

  const enrichMeal = useCallback(async (meal: MealPlan): Promise<MealWithDetails> => {
    const [recipe, participants] = await Promise.all([
      meal.recipe_id ? fetchRecipe(meal.recipe_id) : Promise.resolve(undefined),
      fetchParticipants(meal.id)
    ]);
    return { ...meal, recipe, participants };
  }, [fetchRecipe, fetchParticipants]);

  const fetchMeals = useCallback(async () => {
    if (!household?.id) return;

    try {
      setIsLoading(true);
      const { data, error } = await supabase
        .from('meal_plans')
        .select(`
          *,
          recipe:recipes(*),
          participants:meal_participants(*)
        `)
        .eq('household_id', household.id)
        .gte('scheduled_date', dateRange.start)
        .lte('scheduled_date', dateRange.end)
        .order('scheduled_date', { ascending: true });

      if (error) throw error;
      setMeals(data || []);
    } catch (err: any) {
      setError(err);
    } finally {
      setIsLoading(false);
    }
  }, [household?.id, dateRange.start, dateRange.end]);

  useEffect(() => {
    fetchMeals();

    if (!household?.id) return;

    const mealPlansChannel = supabase
      .channel(`meal_plans_changes_${household.id}`)
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'meal_plans',
          filter: `household_id=eq.${household.id}`,
        },
        async (payload) => {
          if (payload.eventType === 'INSERT') {
            const newMeal = payload.new as MealPlan;
            
            if (newMeal.scheduled_date >= dateRange.start && newMeal.scheduled_date <= dateRange.end) {
              const enriched = await enrichMeal(newMeal);
              setMeals((prev) => [...prev, enriched].sort((a, b) => a.scheduled_date.localeCompare(b.scheduled_date)));
            }
          } else if (payload.eventType === 'UPDATE') {
            const updatedMeal = payload.new as MealPlan;
            
            if (updatedMeal.scheduled_date >= dateRange.start && updatedMeal.scheduled_date <= dateRange.end) {
              const enriched = await enrichMeal(updatedMeal);
              setMeals((prev) => {
                const exists = prev.some(m => m.id === enriched.id);
                if (exists) {
                  return prev.map((m) => (m.id === enriched.id ? enriched : m));
                } else {
                  return [...prev, enriched].sort((a, b) => a.scheduled_date.localeCompare(b.scheduled_date));
                }
              });
            } else {
              setMeals((prev) => prev.filter((m) => m.id !== updatedMeal.id));
            }
          } else if (payload.eventType === 'DELETE') {
            setMeals((prev) => prev.filter((m) => m.id !== payload.old.id));
          }
        }
      )
      .subscribe();

    const participantsChannel = supabase
      .channel(`meal_participants_changes_${household.id}`)
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'meal_participants',
          filter: `household_id=eq.${household.id}`,
        },
        async (payload) => {
          const participant = (payload.new || payload.old) as MealParticipant;
          const mealId = participant.meal_plan_id;
          
          const updatedParticipants = await fetchParticipants(mealId);
          setMeals((prev) => prev.map((m) => 
            m.id === mealId ? { ...m, participants: updatedParticipants } : m
          ));
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(mealPlansChannel);
      supabase.removeChannel(participantsChannel);
    };
  }, [household?.id, dateRange.start, dateRange.end, fetchMeals, enrichMeal, fetchParticipants]);

  const addMeal = async (params: AddMealParams) => {
    if (!household?.id) throw new Error('No household selected');

    try {
      const { data, error } = await supabase.rpc('create_meal_with_participants', {
        p_household_id: household.id,
        p_scheduled_date: params.scheduledDate,
        p_meal_type: params.mealType,
        p_recipe_id: params.recipeId,
        p_standalone_data: params.standaloneData,
        p_participant_ids: params.participantIds
      });

      if (error) throw error;
      return data; // Returns the new meal ID
    } catch (err: any) {
      console.error('Error adding meal:', err);
      throw err;
    }
  };

  return {
    meals,
    addMeal,
    isLoading,
    error,
    refresh: fetchMeals
  };
};
