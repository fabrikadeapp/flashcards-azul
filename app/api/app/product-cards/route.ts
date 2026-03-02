import { NextResponse } from 'next/server';
import { supabaseAdmin as supabase } from '@/lib/supabaseAdmin';
import { hasActiveEntitlement } from '@/lib/entitlements';

export const dynamic = 'force-dynamic';

export async function GET(req: Request) {
    const { searchParams } = new URL(req.url);
    const slug = searchParams.get('slug');
    const userId = searchParams.get('userId');

    if (!slug || !userId) {
        return NextResponse.json({ error: 'Missing slug or userId' }, { status: 400 });
    }

    try {
        // 1. Get product by slug
        const { data: product } = await supabase
            .from('products')
            .select('id')
            .eq('slug', slug)
            .single();

        if (!product) {
            return NextResponse.json({ error: 'Product not found' }, { status: 404 });
        }

        // 2. Verify entitlement
        const active = await hasActiveEntitlement(userId, product.id);
        if (!active) {
            return NextResponse.json({ error: 'Access denied. No active entitlement found.' }, { status: 403 });
        }

        // 3. Fetch cards via pivot table
        const { data: cardsRaw, error: cardsError } = await supabase
            .from('product_flashcards')
            .select('flashcard:flashcards(*)')
            .eq('product_id', product.id);

        if (cardsError) throw cardsError;

        const cards = (cardsRaw || [])
            .map(item => item.flashcard)
            .filter(Boolean)
            .sort((a: any, b: any) => a.numero - b.numero);

        return NextResponse.json({ cards });
    } catch (err: any) {
        console.error('API Product Cards Error:', err);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}
