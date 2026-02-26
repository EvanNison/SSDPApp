-- Add unique constraint on wp_post_id so upsert works correctly
-- Only applies to non-null values (WordPress-sourced articles)
CREATE UNIQUE INDEX IF NOT EXISTS idx_news_wp_post_id_unique
  ON public.news (wp_post_id)
  WHERE wp_post_id IS NOT NULL;
