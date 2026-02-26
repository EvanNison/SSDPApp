-- Automatically update chapter total_points when points are logged
-- This runs server-side and bypasses RLS

CREATE OR REPLACE FUNCTION public.update_chapter_points()
RETURNS trigger AS $$
BEGIN
  UPDATE public.chapters
  SET total_points = total_points + NEW.points
  WHERE id = (
    SELECT chapter_id FROM public.profiles WHERE id = NEW.user_id
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER on_points_log_insert
  AFTER INSERT ON public.points_log
  FOR EACH ROW
  EXECUTE FUNCTION public.update_chapter_points();
