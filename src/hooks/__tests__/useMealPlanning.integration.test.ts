import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import { createClient, SupabaseClient } from '@supabase/supabase-js';

// Use environment variables or defaults for local Supabase
// In a real CI environment, these would be injected.
// For local development, they should match the output of `supabase status`.
// @ts-ignore
const supabaseUrl = process.env.VITE_SUPABASE_URL || 'http://localhost:54321';
// @ts-ignore
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || ''; 
// @ts-ignore
const supabaseAnonKey = process.env.VITE_SUPABASE_ANON_KEY || '';

describe('useMealPlanning Integration', () => {
  let serviceClient: SupabaseClient;
  let testUser: { id: string; email: string };
  let testHouseholdId: string;

  beforeAll(async () => {
    if (!supabaseServiceKey) {
      console.warn('SUPABASE_SERVICE_ROLE_KEY not found. Integration tests requiring admin privileges will be skipped.');
      return;
    }

    serviceClient = createClient(supabaseUrl, supabaseServiceKey, {
      auth: {
        autoRefreshToken: false,
        persistSession: false
      }
    });

    // 1. Create a test user (requires service role key)
    const email = `test-${Date.now()}@example.com`;
    const { data: authData, error: authError } = await serviceClient.auth.admin.createUser({
      email,
      password: 'password123',
      email_confirm: true
    });

    if (authError) throw authError;
    testUser = { id: authData.user.id, email };

    // 2. Create a test household
    const { data: householdData, error: householdError } = await serviceClient
      .from('households')
      .insert({ name: 'Test Household' })
      .select()
      .single();

    if (householdError) throw householdError;
    testHouseholdId = householdData.id;

    // 3. Create a profile for the test user
    const { error: profileError } = await serviceClient
      .from('profiles')
      .insert({
        id: testUser.id,
        household_id: testHouseholdId,
        full_name: 'Test User',
        role: 'member'
      });

    if (profileError) throw profileError;
  });

  afterAll(async () => {
    if (serviceClient && testUser && supabaseServiceKey) {
      // Cleanup: Delete the test user (cascades to profile, meal_participants, etc.)
      await serviceClient.auth.admin.deleteUser(testUser.id);
      // Delete household
      await serviceClient.from('households').delete().eq('id', testHouseholdId);
    }
  });

  it('successfully creates a meal with participants via RPC', async () => {
    if (!supabaseServiceKey) {
      console.log('Skipping integration test: SUPABASE_SERVICE_ROLE_KEY missing');
      return;
    }

    // Sign in as the test user to get an authenticated client
    const { data: signInData, error: signInError } = await serviceClient.auth.signInWithPassword({
      email: testUser.email,
      password: 'password123'
    });

    if (signInError) throw signInError;

    const authClient = createClient(supabaseUrl, supabaseAnonKey, {
      global: {
        headers: {
          Authorization: `Bearer ${signInData.session.access_token}`
        }
      }
    });

    const scheduledDate = new Date().toISOString().split('T')[0];
    const mealType = 'dinner';
    const standaloneData = { 
      name: 'Integration Test Pasta', 
      nutrition: { calories: 500, protein: 20, fat: 15, carbs: 60 } 
    };

    // Call the RPC
    const { data: mealId, error: rpcError } = await authClient.rpc('create_meal_with_participants', {
      p_household_id: testHouseholdId,
      p_scheduled_date: scheduledDate,
      p_meal_type: mealType,
      p_standalone_data: standaloneData,
      p_participant_ids: [testUser.id]
    });

    if (rpcError) {
      console.error('RPC Error:', rpcError);
    }
    expect(rpcError).toBeNull();
    expect(mealId).toBeDefined();

    // Verify meal_plans record using service client (bypassing RLS for verification)
    const { data: mealPlan, error: mealPlanError } = await serviceClient
      .from('meal_plans')
      .select('*')
      .eq('id', mealId)
      .single();

    expect(mealPlanError).toBeNull();
    expect(mealPlan.household_id).toBe(testHouseholdId);
    expect(mealPlan.meal_type).toBe(mealType);
    expect(mealPlan.standalone_data).toEqual(standaloneData);

    // Verify meal_participants record
    const { data: participants, error: participantsError } = await serviceClient
      .from('meal_participants')
      .select('*')
      .eq('meal_plan_id', mealId);

    expect(participantsError).toBeNull();
    expect(participants).toHaveLength(1);
    if (participants) {
      expect(participants[0].user_id).toBe(testUser.id);
    }
  });

  it('fails when using an unauthorized household ID', async () => {
    if (!supabaseServiceKey) return;

    // Create another household that the user doesn't belong to
    const { data: otherHousehold, error: otherError } = await serviceClient
      .from('households')
      .insert({ name: 'Other Household' })
      .select()
      .single();
    
    if (otherError) throw otherError;

    // Sign in
    const { data: signInData } = await serviceClient.auth.signInWithPassword({
      email: testUser.email,
      password: 'password123'
    });

    const authClient = createClient(supabaseUrl, supabaseAnonKey, {
      global: {
        headers: {
          Authorization: `Bearer ${signInData.session!.access_token}`
        }
      }
    });

    // Call the RPC with the wrong household ID
    const { error: rpcError } = await authClient.rpc('create_meal_with_participants', {
      p_household_id: otherHousehold.id,
      p_scheduled_date: new Date().toISOString().split('T')[0],
      p_meal_type: 'lunch',
      p_standalone_data: { 
        name: 'Unauthorized Meal', 
        nutrition: { calories: 0, protein: 0, fat: 0, carbs: 0 } 
      },
      p_participant_ids: []
    });

    expect(rpcError).toBeDefined();
    expect(rpcError?.message).toContain('Unauthorized: Household ID mismatch');

    // Cleanup other household
    await serviceClient.from('households').delete().eq('id', otherHousehold.id);
  });
});
