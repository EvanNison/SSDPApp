-- ============================================
-- Account Deletion RPC
-- Required by iOS App Store (2022) and Google Play (2023)
-- Allows authenticated users to delete their own account
-- ============================================

create or replace function public.delete_own_account()
returns void as $$
begin
  -- Delete the user from auth.users (cascades to profiles and all related tables)
  delete from auth.users where id = auth.uid();
end;
$$ language plpgsql security definer;

-- Only authenticated users can call this
grant execute on function public.delete_own_account() to authenticated;
