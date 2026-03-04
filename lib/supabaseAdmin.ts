import { createClient } from '@supabase/supabase-js'

const sanitizeEnv = (val?: string) => (val || '').replace(/[\n\r]|\\n|"|'/g, '').trim();

const supabaseUrl = sanitizeEnv(process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.SUPABASE_URL);
const supabaseServiceKey = sanitizeEnv(process.env.SUPABASE_SERVICE_ROLE_KEY);

export const isSupabaseAdminConfigured = !!supabaseUrl && !!supabaseServiceKey && supabaseServiceKey !== 'placeholder'

// Este cliente deve ser usado APENAS em Route Handlers (servidor)
// pois ele ignora as regras de RLS (Row Level Security)
export const supabaseAdmin = createClient(
    supabaseUrl || 'https://placeholder.supabase.co',
    supabaseServiceKey || 'placeholder',
    {
        auth: { persistSession: false },
        global: {
            fetch: (url, options) => {
                return fetch(url, { ...options, cache: 'no-store' });
            }
        }
    }
)
