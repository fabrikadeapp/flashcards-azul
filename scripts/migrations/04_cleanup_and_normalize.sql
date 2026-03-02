-- cleanup_duplicates.sql
-- Run this in Supabase SQL Editor to find and remove duplicate emails before normalization.

DO $$
DECLARE
    r RECORD;
BEGIN
    -- 1. Identificar registros que vão colidir após a normalização
    -- Manteremos apenas o registro mais antigo (menor data ou ID)
    FOR r IN (
        SELECT lower(trim(email)) as clean_email, count(*) 
        FROM public.users 
        GROUP BY lower(trim(email)) 
        HAVING count(*) > 1
    ) LOOP
        RAISE NOTICE 'Resolvendo duplicidade para: %', r.clean_email;
        
        -- Deleta todos exceto o primeiro (mais antigo) para esse e-mail limpo
        DELETE FROM public.users 
        WHERE id IN (
            SELECT id FROM (
                SELECT id, row_number() OVER (PARTITION BY lower(trim(email)) ORDER BY created_at ASC) as rn
                FROM public.users
                WHERE lower(trim(email)) = r.clean_email
            ) as duplicates
            WHERE rn > 1
        );
    END LOOP;
END $$;

-- 2. Agora que as duplicatas foram removidas, pode normalizar com segurança
UPDATE public.users SET email = lower(trim(email));

-- 3. Criar o índice único insensível a maiúsculas (se não existir)
CREATE UNIQUE INDEX IF NOT EXISTS idx_users_email_normalized ON public.users (lower(trim(email)));

-- 4. Garantir que o trigger de normalização automática esteja ativo
CREATE OR REPLACE FUNCTION public.normalize_email_trigger()
RETURNS TRIGGER AS $$
BEGIN
    NEW.email = lower(trim(NEW.email));
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS tr_users_normalize_email ON public.users;
CREATE TRIGGER tr_users_normalize_email
    BEFORE INSERT OR UPDATE OF email ON public.users
    FOR EACH ROW EXECUTE FUNCTION public.normalize_email_trigger();
