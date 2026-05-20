import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    // 1. Validate JWT
    const authHeader = req.headers.get('Authorization')
    if (!authHeader) {
      return new Response(
        JSON.stringify({ error: 'No authorization header' }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 401 }
      )
    }

    const supabaseUrl = Deno.env.get('SUPABASE_URL') ?? ''
    const supabaseAnonKey = Deno.env.get('SUPABASE_ANON_KEY') ?? ''
    const supabase = createClient(supabaseUrl, supabaseAnonKey, {
      global: { headers: { Authorization: authHeader } },
    })

    const { data: { user }, error: authError } = await supabase.auth.getUser()
    if (authError || !user) {
      return new Response(
        JSON.stringify({ error: 'Invalid token' }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 401 }
      )
    }

    // 2. Parse Request
    const { query } = await req.json()
    if (!query) {
      return new Response(
        JSON.stringify({ error: 'Query parameter is required' }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 400 }
      )
    }

    // 3. Fetch from USDA API
    const apiKey = Deno.env.get('USDA_API_KEY')
    if (!apiKey) {
      console.error('USDA_API_KEY is not set')
      return new Response(
        JSON.stringify({ error: 'Internal server error: API key missing' }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 500 }
      )
    }

    const usdaUrl = `https://api.nal.usda.gov/fdc/v1/foods/search?api_key=${apiKey}&query=${encodeURIComponent(query)}&pageSize=1`
    const response = await fetch(usdaUrl)

    if (!response.ok) {
      const errorText = await response.text()
      console.error(`USDA API error: ${response.status} ${errorText}`)
      return new Response(
        JSON.stringify({ error: 'Failed to fetch data from USDA API' }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 502 }
      )
    }

    const data = await response.json()
    if (!data.foods || data.foods.length === 0) {
      return new Response(
        JSON.stringify({ error: 'No food items found' }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 404 }
      )
    }

    const food = data.foods[0]
    const nutrients = food.foodNutrients || []

    // Helper to find nutrient value
    const getNutrient = (nameOrId: string | number) => {
      const nutrient = nutrients.find((n: any) => 
        n.nutrientName?.toLowerCase().includes(String(nameOrId).toLowerCase()) || 
        n.nutrientId === nameOrId ||
        n.nutrientNumber === String(nameOrId)
      )
      return nutrient ? nutrient.value : 0
    }

    // Mapping USDA nutrients to our format
    // Energy (kcal) is often 1008 or 208
    const calories = getNutrient('Energy') || getNutrient(1008) || getNutrient(208)
    const protein = getNutrient('Protein') || getNutrient(1003) || getNutrient(203)
    const fat = getNutrient('Total lipid') || getNutrient(1004) || getNutrient(204)
    const carbs = getNutrient('Carbohydrate') || getNutrient(1005) || getNutrient(205)

    const result = {
      name: food.description,
      calories: Math.round(calories),
      protein: Number(protein.toFixed(1)),
      fat: Number(fat.toFixed(1)),
      carbs: Number(carbs.toFixed(1)),
      unit: '100g' // USDA search results are typically per 100g
    }

    return new Response(
      JSON.stringify(result),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 200 }
    )

  } catch (error) {
    console.error(`Function error: ${error.message}`)
    return new Response(
      JSON.stringify({ error: error.message }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 500 }
    )
  }
})
