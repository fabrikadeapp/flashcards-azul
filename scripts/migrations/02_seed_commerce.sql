-- Seed Data: Products and Tiers
-- Description: Initial products (A320, A330, Embraer E2, Boeing 737) and tiers.

-- Insert Products
INSERT INTO public.products (slug, name, description, image_url)
VALUES 
('a320', 'Airbus A320', 'Flashcards completos para treinamento operacional A320.', 'https://images.unsplash.com/photo-1569154941061-e231b4725ef1?auto=format&fit=crop&q=80&w=800'),
('a330', 'Airbus A330', 'Flashcards para o gigante da Airbus A330.', 'https://images.unsplash.com/photo-1570710891163-6d3b5c47248b?auto=format&fit=crop&q=80&w=800'),
('e2', 'Embraer E2', 'A nova geração da Embraer em seus bolsos.', 'https://images.unsplash.com/photo-1583094916805-4927282eb17c?auto=format&fit=crop&q=80&w=800'),
('b737', 'Boeing 737', 'Treinamento completo para o clássico e o MAX.', 'https://images.unsplash.com/photo-1540962351504-03099e0a754b?auto=format&fit=crop&q=80&w=800')
ON CONFLICT (slug) DO NOTHING;

-- Insert Tiers for A320
WITH p AS (SELECT id FROM public.products WHERE slug = 'a320' LIMIT 1)
INSERT INTO public.product_tiers (product_id, name, price_cents, access_days, stripe_price_id, sort_order)
SELECT p.id, t.name, t.price, t.days, t.stripe_id, t.ordnung
FROM p, (VALUES 
    ('Starter', 4990, 30, 'price_a320_starter', 0),
    ('Pro', 12990, 90, 'price_a320_pro', 1),
    ('Ultimate', 39990, 365, 'price_a320_ultimate', 2)
) AS t(name, price, days, stripe_id, ordnung)
ON CONFLICT (stripe_price_id) DO NOTHING;

-- Insert Tiers for A330
WITH p AS (SELECT id FROM public.products WHERE slug = 'a330' LIMIT 1)
INSERT INTO public.product_tiers (product_id, name, price_cents, access_days, stripe_price_id, sort_order)
SELECT p.id, t.name, t.price, t.days, t.stripe_id, t.ordnung
FROM p, (VALUES 
    ('Starter', 5990, 30, 'price_a330_starter', 0),
    ('Pro', 14990, 90, 'price_a330_pro', 1),
    ('Ultimate', 44990, 365, 'price_a330_ultimate', 2)
) AS t(name, price, days, stripe_id, ordnung)
ON CONFLICT (stripe_price_id) DO NOTHING;

-- Insert Tiers for E2
WITH p AS (SELECT id FROM public.products WHERE slug = 'e2' LIMIT 1)
INSERT INTO public.product_tiers (product_id, name, price_cents, access_days, stripe_price_id, sort_order)
SELECT p.id, t.name, t.price, t.days, t.stripe_id, t.ordnung
FROM p, (VALUES 
    ('Starter', 4490, 30, 'price_e2_starter', 0),
    ('Pro', 11990, 90, 'price_e2_pro', 1),
    ('Ultimate', 36990, 365, 'price_e2_ultimate', 2)
) AS t(name, price, days, stripe_id, ordnung)
ON CONFLICT (stripe_price_id) DO NOTHING;

-- Insert Tiers for B737
WITH p AS (SELECT id FROM public.products WHERE slug = 'b737' LIMIT 1)
INSERT INTO public.product_tiers (product_id, name, price_cents, access_days, stripe_price_id, sort_order)
SELECT p.id, t.name, t.price, t.days, t.stripe_id, t.ordnung
FROM p, (VALUES 
    ('Starter', 4990, 30, 'price_b737_starter', 0),
    ('Pro', 12990, 90, 'price_b737_pro', 1),
    ('Ultimate', 39990, 365, 'price_b737_ultimate', 2)
) AS t(name, price, days, stripe_id, ordnung)
ON CONFLICT (stripe_price_id) DO NOTHING;
