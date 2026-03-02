import { NextResponse } from 'next/server';
import { supabaseAdmin as supabase } from '@/lib/supabaseAdmin';

export const dynamic = 'force-dynamic';

export async function GET(req: Request) {
    const { searchParams } = new URL(req.url);
    const productId = searchParams.get('productId');

    if (!productId) {
        return NextResponse.json({ error: 'Missing productId' }, { status: 400 });
    }

    try {
        const { data, error } = await supabase
            .from('product_tiers')
            .select('*')
            .eq('product_id', productId)
            .order('sort_order', { ascending: true });

        if (error) throw error;
        return NextResponse.json({ success: true, tiers: data });
    } catch (err: any) {
        return NextResponse.json({ error: err.message }, { status: 500 });
    }
}

export async function POST(req: Request) {
    try {
        const tier = await req.json();
        const { data, error } = await supabase.from('product_tiers').insert([tier]).select().single();
        if (error) throw error;
        return NextResponse.json({ success: true, tier: data });
    } catch (err: any) {
        return NextResponse.json({ error: err.message }, { status: 500 });
    }
}

export async function PUT(req: Request) {
    try {
        const { id, ...updates } = await req.json();
        const { data, error } = await supabase.from('product_tiers').update(updates).eq('id', id).select().single();
        if (error) throw error;
        return NextResponse.json({ success: true, tier: data });
    } catch (err: any) {
        return NextResponse.json({ error: err.message }, { status: 500 });
    }
}
