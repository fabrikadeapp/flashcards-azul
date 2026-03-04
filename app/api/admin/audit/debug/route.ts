import { NextResponse } from 'next/server';
import { supabaseAdmin as supabase, isSupabaseAdminConfigured } from '@/lib/supabaseAdmin';

export const dynamic = 'force-dynamic';

export async function GET() {
    try {
        const hasKey = !!process.env.SUPABASE_SERVICE_ROLE_KEY;
        const keyPrefix = process.env.SUPABASE_SERVICE_ROLE_KEY ? process.env.SUPABASE_SERVICE_ROLE_KEY.substring(0, 10) : 'none';

        const { data: logs, error } = await supabase
            .from('audit_logs')
            .select('*')
            .order('timestamp', { ascending: false });

        return NextResponse.json({
            success: true,
            logs: logs,
            error: error,
            hasKey,
            keyPrefix,
            isConfigured: isSupabaseAdminConfigured,
            url: process.env.NEXT_PUBLIC_SUPABASE_URL
        });
    } catch (err: any) {
        return NextResponse.json({ error: err.message }, { status: 500 });
    }
}
