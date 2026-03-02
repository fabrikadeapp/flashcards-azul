import { NextResponse } from 'next/server';
import { hasActiveEntitlement } from '@/lib/entitlements';

export const dynamic = 'force-dynamic';

export async function GET(req: Request) {
    const { searchParams } = new URL(req.url);
    const userId = searchParams.get('userId');
    const productId = searchParams.get('productId');

    if (!userId || !productId) {
        return NextResponse.json({ error: 'Missing userId or productId' }, { status: 400 });
    }

    try {
        const active = await hasActiveEntitlement(userId, productId);
        return NextResponse.json({ active });
    } catch (err: any) {
        console.error('API Verify Access Error:', err);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}
