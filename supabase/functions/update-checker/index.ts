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

    // 2. Fetch current version from system_info table
    const { data: systemInfo, error: dbError } = await supabase
      .from('system_info')
      .select('current_version')
      .eq('id', 1)
      .single()

    if (dbError || !systemInfo) {
      console.error('Database error fetching system_info:', dbError)
      return new Response(
        JSON.stringify({ error: 'Failed to fetch current system version' }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 500 }
      )
    }

    const currentVersion = systemInfo.current_version

    // 3. Fetch latest version from GitHub
    // Default to raiderjoey/meal_planner if GITHUB_REPO env var is not set
    const githubRepo = Deno.env.get('GITHUB_REPO') || 'raiderjoey/meal_planner'
    const githubUrl = `https://raw.githubusercontent.com/${githubRepo}/main/package.json`
    const githubToken = Deno.env.get('GITHUB_TOKEN')
    
    const headers: Record<string, string> = {}
    if (githubToken) {
      headers['Authorization'] = `token ${githubToken}`
    }

    const ghResponse = await fetch(githubUrl, { headers })
    if (!ghResponse.ok) {
      console.error(`GitHub fetch error: ${ghResponse.status} for ${githubUrl}`)
      return new Response(
        JSON.stringify({ 
          error: 'Failed to fetch latest version from GitHub',
          details: `GitHub returned ${ghResponse.status}`
        }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 502 }
      )
    }

    const pkgJson = await ghResponse.json()
    const latestVersion = pkgJson.version

    // 4. Compare versions
    const updateAvailable = latestVersion !== currentVersion

    return new Response(
      JSON.stringify({
        currentVersion,
        latestVersion,
        updateAvailable
      }),
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
