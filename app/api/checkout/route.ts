import { NextResponse } from 'next/server';
import { stripe } from '@/lib/stripe';
import { supabaseAdmin as supabase } from '@/lib/supabaseAdmin';
import { auditCommerceAction } from '@/lib/entitlements';
import { FLAGS } from '@/lib/flags';

export const dynamic = 'force-dynamic';

export async function POST(req: Request) {
    try {
        if (FLAGS.DISABLE_CHECKOUT) {
            return NextResponse.json({ error: 'Checkout is temporarily disabled.' }, { status: 503 });
        }

        const { tierId, userId } = await req.json();

        if (!tierId || !userId) {
            return NextResponse.json({ error: 'Missing tierId or userId' }, { status: 400 });
        }

        // 1. Validate Tier and Product
        const { data: tier, error: tierError } = await supabase
            .from('product_tiers')
            .select('*, products(*)')
            .eq('id', tierId)
            .eq('is_active', true)
            .single();

        if (tierError || !tier || !tier.products || !tier.products.is_active) {
            console.error('Tier validation failed:', tierError);
            return NextResponse.json({ error: 'Invalid or inactive tier/product' }, { status: 400 });
        }

        // 2. Create pending order
        const { data: order, error: orderError } = await supabase
            .from('orders')
            .insert({
                user_id: userId,
                product_id: tier.product_id,
                tier_id: tier.id,
                amount_cents: tier.price_cents,
                currency: tier.currency,
                status: 'pending'
            })
            .select()
            .single();

        if (orderError) {
            console.error('Order creation failed:', orderError);
            return NextResponse.json({ error: 'Failed to create order' }, { status: 500 });
        }

        // 3. Create Stripe Checkout Session
        const session = await stripe.checkout.sessions.create({
            payment_method_types: ['card'],
            line_items: [
                {
                    price: tier.stripe_price_id,
                    quantity: 1,
                },
            ],
            mode: 'payment',
            metadata: {
                order_id: order.id,
                user_id: userId,
                product_id: tier.product_id,
                tier_id: tier.id,
                access_days: tier.access_days.toString(),
            },
            success_url: `${process.env.NEXT_PUBLIC_SITE_URL}/app/checkout/success?session_id={CHECKOUT_SESSION_ID}`,
            cancel_url: `${process.env.NEXT_PUBLIC_SITE_URL}/p/${tier.products.slug}?cancelled=true`,
            customer_email: undefined, // Could be fetched from user if email exists
        });

        // 4. Update order with session ID
        await supabase
            .from('orders')
            .update({ stripe_checkout_session_id: session.id })
            .eq('id', order.id);

        // 5. Audit log
        await auditCommerceAction({
            actorUserId: userId,
            actorType: 'user',
            action: 'checkout_created',
            entityType: 'order',
            entityId: order.id,
            metadata: { stripe_session_id: session.id }
        });

        return NextResponse.json({ url: session.url });
    } catch (err: any) {
        console.error('Checkout API Error:', err);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}
