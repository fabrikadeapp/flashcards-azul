-- Migration: Commerce Expansion
-- Description: Adds products, tiers, entitlements, orders, audit logs, and webhooks.
-- Safety: Add-only, non-destructive.

-- 1. Create Products Table
CREATE TABLE IF NOT EXISTS public.products (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    slug text UNIQUE NOT NULL,
    name text NOT NULL,
    description text,
    image_url text,
    is_active boolean DEFAULT true,
    created_at timestamptz DEFAULT now(),
    updated_at timestamptz DEFAULT now()
);

-- 2. Create Product Tiers Table
CREATE TABLE IF NOT EXISTS public.product_tiers (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    product_id uuid NOT NULL REFERENCES public.products(id) ON DELETE CASCADE,
    name text NOT NULL,
    price_cents int NOT NULL,
    currency text NOT NULL DEFAULT 'BRL',
    access_days int NOT NULL,
    stripe_price_id text UNIQUE NOT NULL,
    is_active boolean DEFAULT true,
    sort_order int DEFAULT 0,
    created_at timestamptz DEFAULT now(),
    updated_at timestamptz DEFAULT now()
);

-- 3. Create Product Flashcards Pivot Table
CREATE TABLE IF NOT EXISTS public.product_flashcards (
    product_id uuid NOT NULL REFERENCES public.products(id) ON DELETE CASCADE,
    flashcard_id uuid NOT NULL REFERENCES public.flashcards(id) ON DELETE CASCADE,
    PRIMARY KEY (product_id, flashcard_id)
);

-- 4. Create Entitlements Table
CREATE TABLE IF NOT EXISTS public.entitlements (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id uuid NOT NULL, -- Reference to user. We will be careful about the FK to auth.users if it doesn't exist.
    product_id uuid NOT NULL REFERENCES public.products(id) ON DELETE CASCADE,
    expires_at timestamptz NOT NULL,
    created_at timestamptz DEFAULT now(),
    updated_at timestamptz DEFAULT now(),
    UNIQUE (user_id, product_id)
);

-- 5. Create Orders Table
CREATE TABLE IF NOT EXISTS public.orders (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id uuid,
    product_id uuid REFERENCES public.products(id),
    tier_id uuid REFERENCES public.product_tiers(id),
    stripe_checkout_session_id text UNIQUE,
    stripe_payment_intent_id text,
    amount_cents int,
    currency text,
    status text NOT NULL DEFAULT 'pending', -- pending | paid | failed | refunded
    raw_event_id text UNIQUE, -- Stripe event id for idempotency tracking
    created_at timestamptz DEFAULT now(),
    updated_at timestamptz DEFAULT now()
);

-- 6. Create Audit Log Table
CREATE TABLE IF NOT EXISTS public.audit_log (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    created_at timestamptz DEFAULT now(),
    actor_user_id uuid,
    actor_type text NOT NULL, -- 'user' | 'system' | 'admin'
    action text NOT NULL, -- 'checkout_created' | 'payment_confirmed' | 'entitlement_extended' etc.
    entity_type text NOT NULL, -- 'order' | 'entitlement' | 'product' ...
    entity_id uuid,
    metadata jsonb DEFAULT '{}'::jsonb,
    ip text,
    user_agent text
);

-- 7. Create Webhook Events Table
CREATE TABLE IF NOT EXISTS public.webhook_events (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    stripe_event_id text UNIQUE NOT NULL,
    type text NOT NULL,
    received_at timestamptz DEFAULT now(),
    processed_at timestamptz,
    status text NOT NULL DEFAULT 'received', -- received | processed | ignored | failed
    last_error text,
    payload jsonb NOT NULL
);

-- 8. Add Foreign Key to auth.users ONLY if it exists and is intended
-- Since the prompt explicitly asked for it, we will try to add it.
-- If the user uses public.users instead, this might need adjustment.
DO $$
BEGIN
    IF EXISTS (SELECT 1 FROM pg_tables WHERE schemaname = 'auth' AND tablename = 'users') THEN
        ALTER TABLE public.entitlements ADD CONSTRAINT entitlements_user_id_fkey FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE;
        ALTER TABLE public.orders ADD CONSTRAINT orders_user_id_fkey FOREIGN KEY (user_id) REFERENCES auth.users(id);
    END IF;
END $$;

-- 9. Create Indexes
CREATE INDEX IF NOT EXISTS idx_entitlements_user_product ON public.entitlements (user_id, product_id);
CREATE INDEX IF NOT EXISTS idx_entitlements_user_expires ON public.entitlements (user_id, expires_at);
CREATE INDEX IF NOT EXISTS idx_product_tiers_product_active ON public.product_tiers (product_id, is_active, sort_order);
CREATE INDEX IF NOT EXISTS idx_products_slug_active ON public.products (slug, is_active);
CREATE INDEX IF NOT EXISTS idx_webhook_events_stripe_id ON public.webhook_events (stripe_event_id);
CREATE INDEX IF NOT EXISTS idx_orders_checkout_session ON public.orders (stripe_checkout_session_id);
CREATE INDEX IF NOT EXISTS idx_orders_user_created ON public.orders (user_id, created_at);

-- 10. Helper Functions

-- Function: has_active_entitlement
CREATE OR REPLACE FUNCTION public.has_active_entitlement(p_user_id uuid, p_product_id uuid)
RETURNS boolean
LANGUAGE sql
SECURITY DEFINER
STABLE
AS $$
    SELECT EXISTS (
        SELECT 1 FROM public.entitlements
        WHERE user_id = p_user_id
          AND product_id = p_product_id
          AND expires_at > now()
    );
$$;

-- Function: extend_entitlement
CREATE OR REPLACE FUNCTION public.extend_entitlement(p_user_id uuid, p_product_id uuid, p_access_days int)
RETURNS public.entitlements
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    v_entitlement public.entitlements;
    v_now timestamptz := now();
BEGIN
    INSERT INTO public.entitlements (user_id, product_id, expires_at, updated_at)
    VALUES (p_user_id, p_product_id, v_now + (p_access_days * interval '1 day'), v_now)
    ON CONFLICT (user_id, product_id)
    DO UPDATE SET
        expires_at = CASE
            WHEN public.entitlements.expires_at > now() THEN public.entitlements.expires_at + (p_access_days * interval '1 day')
            ELSE now() + (p_access_days * interval '1 day')
        END,
        updated_at = v_now
    RETURNING * INTO v_entitlement;

    RETURN v_entitlement;
END;
$$;

-- 11. Triggers for updated_at
CREATE OR REPLACE FUNCTION public.handle_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER tr_products_updated_at BEFORE UPDATE ON public.products FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();
CREATE TRIGGER tr_product_tiers_updated_at BEFORE UPDATE ON public.product_tiers FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();
CREATE TRIGGER tr_entitlements_updated_at BEFORE UPDATE ON public.entitlements FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();
CREATE TRIGGER tr_orders_updated_at BEFORE UPDATE ON public.orders FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

-- 12. RLS Policies

ALTER TABLE public.products ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.product_tiers ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.product_flashcards ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.entitlements ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.audit_log ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.webhook_events ENABLE ROW LEVEL SECURITY;

-- Products: Public read if active
CREATE POLICY "Public read active products" ON public.products
    FOR SELECT USING (is_active = true);

-- Product Tiers: Public read if active and product is active
CREATE POLICY "Public read active tiers" ON public.product_tiers
    FOR SELECT USING (
        is_active = true AND
        EXISTS (SELECT 1 FROM public.products WHERE id = product_id AND is_active = true)
    );

-- Entitlements: User can SELECT only their own
CREATE POLICY "Users view own entitlements" ON public.entitlements
    FOR SELECT USING (auth.uid() = user_id);

-- Orders: User can SELECT only their own
CREATE POLICY "Users view own orders" ON public.orders
    FOR SELECT USING (auth.uid() = user_id);

-- Flashcards access enhancement (Careful: Add-only)
-- Note: We don't modify existing flashcards RLS, but we can add a new policy.
-- If existing RLS already allows, this won't hurt.
CREATE POLICY "Access flashcards via entitlement" ON public.flashcards
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM public.product_flashcards pf
            JOIN public.entitlements e ON e.product_id = pf.product_id
            WHERE pf.flashcard_id = id
              AND e.user_id = auth.uid()
              AND e.expires_at > now()
        )
    );

-- Audit log: User can SELECT their own
CREATE POLICY "Users view own audit sessions" ON public.audit_log
    FOR SELECT USING (auth.uid() = actor_user_id);

-- Admin policies (assuming role 'admin' or similar, but simplified for now to Service Role)
-- Service role ignores RLS anyway.
