import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

export const supabase = createClient(supabaseUrl, supabaseAnonKey)

// Service client for API routes - only available on server side
let supabaseAdmin: ReturnType<typeof createClient> | null = null

export function getSupabaseAdmin() {
  if (!supabaseAdmin && typeof window === 'undefined') {
    const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY
    if (serviceRoleKey) {
      supabaseAdmin = createClient(
        supabaseUrl,
        serviceRoleKey,
        { auth: { autoRefreshToken: false, persistSession: false } }
      )
    }
  }
  return supabaseAdmin
}
