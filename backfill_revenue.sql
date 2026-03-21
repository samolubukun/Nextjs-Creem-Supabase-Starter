-- SQL to backfill total_spent_cents from legacy transaction logs
-- Run this in your Supabase SQL Editor if your Admin Dashboard is showing 0 revenue

DO $$
DECLARE
    r RECORD;
    v_total_spent INTEGER;
BEGIN
    FOR r IN SELECT id FROM public.profiles LOOP
        -- Calculate total spent from transaction descriptions [PRICE:XXXX]
        SELECT COALESCE(SUM((substring(description from '\[PRICE:(\d+)\]'))::integer), 0)
        INTO v_total_spent
        FROM public.credit_transactions
        WHERE user_id = r.id;

        -- Update the profile if the calculated value is greater than 0
        IF v_total_spent > 0 THEN
            UPDATE public.profiles
            SET total_spent_cents = GREATEST(total_spent_cents, v_total_spent)
            WHERE id = r.id;
        END IF;
    END LOOP;
END $$;
