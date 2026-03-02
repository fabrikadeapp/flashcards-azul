import { NextResponse } from 'next/server';
import { supabaseAdmin as supabase } from '@/lib/supabaseAdmin';

export const dynamic = 'force-dynamic';

export async function GET(req: Request) {
    const { searchParams } = new URL(req.url);
    const userId = searchParams.get('userId');

    if (!userId) {
        return NextResponse.json({ error: 'Missing userId' }, { status: 400 });
    }

    try {
        const { data, error } = await supabase
            .from('entitlements')
            .select('*, product:products(*)')
            .eq('user_id', userId)
            .gt('expires_at', new Date().toISOString())
            .order('expires_at', { ascending: true });

        if (error) throw error;

        return NextResponse.json({ entitlements: data || [] });
    } catch (err: any) {
        console.error('API Entitlements Error:', err);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}
