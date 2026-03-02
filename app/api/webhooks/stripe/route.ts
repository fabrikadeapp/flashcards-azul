import { NextResponse } from 'next/server';
import { stripe } from '@/lib/stripe';
import { supabaseAdmin as supabase } from '@/lib/supabaseAdmin';
import { grantOrExtendEntitlement, auditCommerceAction } from '@/lib/entitlements';
import Stripe from 'stripe';

export const dynamic = 'force-dynamic';

export async function POST(req: Request) {
    const body = await req.text();
    const sig = req.headers.get('stripe-signature');

    if (!sig || !process.env.STRIPE_WEBHOOK_SECRET) {
        return NextResponse.json({ error: 'Missing signature or secret' }, { status: 400 });
    }

    let event: Stripe.Event;

    try {
        event = stripe.webhooks.constructEvent(body, sig, process.env.STRIPE_WEBHOOK_SECRET);
    } catch (err: any) {
        console.error('Webhook signature verification failed:', err.message);
        return NextResponse.json({ error: `Webhook Error: ${err.message}` }, { status: 400 });
    }

    // 1. Log and check for duplicate events (Idempotency)
    const { data: existingEvent, error: eventCheckError } = await supabase
        .from('webhook_events')
        .select('id, status')
        .eq('stripe_event_id', event.id)
        .maybeSingle();

    if (existingEvent && existingEvent.status === 'processed') {
        console.log(`Event ${event.id} already processed. Skipping.`);
        return NextResponse.json({ received: true });
    }

    if (!existingEvent) {
        // Insert as received
        await supabase.from('webhook_events').insert({
            stripe_event_id: event.id,
            type: event.type,
            payload: event as any,
            status: 'received'
        });
    }

    try {
        // 2. Handle specific events
        if (event.type === 'checkout.session.completed') {
            const session = event.data.object as Stripe.Checkout.Session;
            const metadata = session.metadata;

            if (!metadata || !metadata.order_id || !metadata.user_id || !metadata.product_id || !metadata.access_days) {
                throw new Error('Missing metadata in checkout session');
            }

            const { order_id, user_id, product_id, access_days } = metadata;

            // Update order status
            const { data: order, error: orderError } = await supabase
                .from('orders')
                .update({
                    status: 'paid',
                    stripe_payment_intent_id: session.payment_intent as string,
                    updated_at: new Date().toISOString()
                })
                .eq('id', order_id)
                .select()
                .single();

            if (orderError) throw orderError;

            // Grant Entitlement
            const entitlement = await grantOrExtendEntitlement(
                user_id,
                product_id,
                parseInt(access_days)
            );

            if (!entitlement) throw new Error('Failed to grant entitlement');

            // Audit
            await auditCommerceAction({
                actorUserId: user_id,
                actorType: 'system',
                action: 'payment_confirmed',
                entityType: 'order',
                entityId: order_id,
                metadata: { stripe_event_id: event.id }
            });

            await auditCommerceAction({
                actorUserId: user_id,
                actorType: 'system',
                action: 'entitlement_extended',
                entityType: 'entitlement',
                entityId: entitlement.id,
                metadata: {
                    old_expires_at: (entitlement as any).old_expires_at, // If RPC returned it
                    new_expires_at: entitlement.expires_at,
                    access_days
                }
            });
        }

        // 3. Mark as processed
        await supabase.from('webhook_events').update({
            status: 'processed',
            processed_at: new Date().toISOString()
        }).eq('stripe_event_id', event.id);

        return NextResponse.json({ received: true });

    } catch (err: any) {
        console.error(`Error processing webhook ${event.id}:`, err);

        await supabase.from('webhook_events').update({
            status: 'failed',
            last_error: err.message
        }).eq('stripe_event_id', event.id);

        return NextResponse.json({ error: 'Processing failed' }, { status: 500 });
    }
}
