import { supabase } from './supabase';

export async function awardPoints(
  userId: string,
  points: number,
  reason: string,
  sourceType?: string,
  sourceId?: string
) {
  // Insert points log entry
  const { error: logError } = await supabase
    .from('points_log')
    .insert({
      user_id: userId,
      points,
      reason,
      source_type: sourceType,
      source_id: sourceId,
    });

  if (logError) {
    console.error('Failed to log points:', logError);
    // Don't throw — still update the profile total
  }

  // Update profile total points
  const { data: profile, error: fetchError } = await supabase
    .from('profiles')
    .select('points, chapter_id')
    .eq('id', userId)
    .single();

  if (fetchError) throw fetchError;

  const newTotal = (profile.points || 0) + points;

  const { error: updateError } = await supabase
    .from('profiles')
    .update({ points: newTotal })
    .eq('id', userId);

  if (updateError) throw updateError;

  // Chapter total_points is updated automatically via a Postgres trigger
  // on points_log insert (see migration 00008)

  return newTotal;
}
