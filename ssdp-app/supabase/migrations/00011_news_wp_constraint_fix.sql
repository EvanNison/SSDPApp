-- Drop the partial unique index (doesn't work with PostgREST upsert)
DROP INDEX IF EXISTS idx_news_wp_post_id_unique;

-- Add a proper unique constraint instead
-- NULL values are allowed (for admin-created posts) — PostgreSQL allows multiple NULLs in unique columns
ALTER TABLE public.news ADD CONSTRAINT news_wp_post_id_unique UNIQUE (wp_post_id);
