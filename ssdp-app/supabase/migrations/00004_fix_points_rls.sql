-- ============================================
-- Fix: Allow authenticated users to insert their own points
-- The existing points_insert_service policy only allows admin/staff,
-- but the mobile app's awardPoints() inserts from the client side.
-- ============================================

CREATE POLICY "points_insert_own" ON public.points_log
  FOR INSERT WITH CHECK (user_id = auth.uid());
