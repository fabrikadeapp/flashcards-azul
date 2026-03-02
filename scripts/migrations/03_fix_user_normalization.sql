-- Migration: Fix User Email Normalization
-- Description: Ensures all emails are unique regardless of case and whitespace.
-- Safety: Non-destructive to data, but may fail if duplicates already exist (requires manual cleanup).

-- 1. Create a function to normalize email
CREATE OR REPLACE FUNCTION public.normalize_email(p_email text)
RETURNS text AS $$
BEGIN
    RETURN lower(trim(p_email));
END;
$$ LANGUAGE plpgsql IMMUTABLE;

-- 2. Update existing entries (be careful with duplicates)
-- This might fail if there are already "user@example.com" and "User@Example.com"
-- We will try to merge them or just lowercase them.
UPDATE public.users SET email = public.normalize_email(email);

-- 3. Add a unique index on the normalized email if it doesn't exist
-- We use a unique constraint on the lower(email) to be sure.
-- First, drop any existing unique constraint on email if we want to replace it.
-- But wait, let's just add the index.
CREATE UNIQUE INDEX IF NOT EXISTS idx_users_email_normalized ON public.users (public.normalize_email(email));

-- 4. Add a trigger to auto-normalize email on insert/update
CREATE OR REPLACE FUNCTION public.tr_normalize_user_email()
RETURNS TRIGGER AS $$
BEGIN
    NEW.email = public.normalize_email(NEW.email);
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS tr_users_normalize_email ON public.users;
CREATE TRIGGER tr_users_normalize_email
    BEFORE INSERT OR UPDATE OF email ON public.users
    FOR EACH ROW EXECUTE FUNCTION public.tr_normalize_user_email();
