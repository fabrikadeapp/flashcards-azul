export type Product = {
    id: string;
    slug: string;
    name: string;
    description: string | null;
    image_url: string | null;
    is_active: boolean;
    created_at: string;
};

export type ProductTier = {
    id: string;
    product_id: string;
    name: string;
    price_cents: number;
    currency: string;
    access_days: number;
    stripe_price_id: string;
    is_active: boolean;
    sort_order: number;
    created_at: string;
};

export type Entitlement = {
    id: string;
    user_id: string;
    product_id: string;
    expires_at: string;
    created_at: string;
    updated_at: string;
};

export type OrderStatus = 'pending' | 'paid' | 'failed' | 'refunded';

export type Order = {
    id: string;
    user_id: string | null;
    product_id: string | null;
    tier_id: string | null;
    stripe_checkout_session_id: string | null;
    stripe_payment_intent_id: string | null;
    amount_cents: number | null;
    currency: string | null;
    status: OrderStatus;
    raw_event_id: string | null;
    created_at: string;
    updated_at: string;
};
