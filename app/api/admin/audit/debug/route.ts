import { NextResponse } from 'next/server';
import { supabaseAdmin as supabase, isSupabaseAdminConfigured } from '@/lib/supabaseAdmin';

export const dynamic = 'force-dynamic';
export const fetchCache = 'force-no-store';

export async function GET() {
    try {
        const hasKey = !!process.env.SUPABASE_SERVICE_ROLE_KEY;
        const keyPrefix = process.env.SUPABASE_SERVICE_ROLE_KEY ? process.env.SUPABASE_SERVICE_ROLE_KEY.substring(0, 10) : 'none';

        // Use custom un-cached query
        const { data: logs, error } = await supabase
            .from('audit_logs')
            .select('*', { count: 'exact' })
            .order('timestamp', { ascending: false });

        return NextResponse.json({
            success: true,
            logs: logs,
            error: error,
            count: logs?.length || 0,
            hasKey,
            keyPrefix,
            isConfigured: isSupabaseAdminConfigured,
            urlLength: process.env.NEXT_PUBLIC_SUPABASE_URL?.length
        });
    } catch (err: any) {
        return NextResponse.json({ error: err.message }, { status: 500 });
    }
}
