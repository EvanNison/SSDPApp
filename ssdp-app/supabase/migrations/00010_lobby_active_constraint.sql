-- Ensure only one lobby event can be active at a time
CREATE UNIQUE INDEX IF NOT EXISTS idx_lobby_events_single_active
  ON public.lobby_events (is_active)
  WHERE is_active = true;
