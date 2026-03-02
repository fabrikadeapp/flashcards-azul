import { NextResponse } from 'next/server';
import { supabaseAdmin as supabase } from '@/lib/supabaseAdmin';

export const dynamic = 'force-dynamic';

export async function POST(req: Request) {
    try {
        const { productId, flashcardIds } = await req.json();

        if (!productId || !flashcardIds) {
            return NextResponse.json({ error: 'Missing productId or flashcardIds' }, { status: 400 });
        }

        // 1. Delete existing associations
        await supabase.from('product_flashcards').delete().eq('product_id', productId);

        // 2. Insert new ones
        const associations = flashcardIds.map((id: string) => ({
            product_id: productId,
            flashcard_id: id
        }));

        if (associations.length > 0) {
            const { error } = await supabase.from('product_flashcards').insert(associations);
            if (error) throw error;
        }

        return NextResponse.json({ success: true });
    } catch (err: any) {
        console.error('Association error:', err);
        return NextResponse.json({ error: err.message }, { status: 500 });
    }
}

export async function GET(req: Request) {
    const { searchParams } = new URL(req.url);
    const productId = searchParams.get('productId');

    if (!productId) {
        return NextResponse.json({ error: 'Missing productId' }, { status: 400 });
    }

    try {
        const { data, error } = await supabase
            .from('product_flashcards')
            .select('flashcard_id')
            .eq('product_id', productId);

        if (error) throw error;
        return NextResponse.json({ success: true, flashcardIds: data.map(i => i.flashcard_id) });
    } catch (err: any) {
        return NextResponse.json({ error: err.message }, { status: 500 });
    }
}
