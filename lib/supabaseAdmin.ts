import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.SUPABASE_URL || 'https://placeholder.supabase.co'
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || 'placeholder'

// Este cliente deve ser usado APENAS em Route Handlers (servidor)
// pois ele ignora as regras de RLS (Row Level Security)
export const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey)
