-- ============================================
-- Row Level Security Policies
-- ============================================

-- Enable RLS on all tables
alter table public.profiles enable row level security;
alter table public.chapters enable row level security;
alter table public.courses enable row level security;
alter table public.modules enable row level security;
alter table public.quizzes enable row level security;
alter table public.user_progress enable row level security;
alter table public.ambassador_agreements enable row level security;
alter table public.chat_channels enable row level security;
alter table public.chat_messages enable row level security;
alter table public.notifications enable row level security;
alter table public.action_alerts enable row level security;
alter table public.alert_responses enable row level security;
alter table public.news enable row level security;
alter table public.menu_items enable row level security;
alter table public.points_log enable row level security;
alter table public.activity_reports enable row level security;
alter table public.lobby_events enable row level security;
alter table public.local_businesses enable row level security;

-- Helper: check if current user is admin or staff
create or replace function public.is_admin_or_staff()
returns boolean as $$
  select exists (
    select 1 from public.profiles
    where id = auth.uid()
    and role in ('admin', 'staff')
  );
$$ language sql security definer stable;

-- ============================================
-- PROFILES
-- ============================================

-- Users can read their own profile; admins can read all
create policy "profiles_select_own" on public.profiles
  for select using (id = auth.uid() or public.is_admin_or_staff());

-- Users can update their own profile
create policy "profiles_update_own" on public.profiles
  for update using (id = auth.uid())
  with check (id = auth.uid());

-- Admins can update any profile (e.g., role changes)
create policy "profiles_update_admin" on public.profiles
  for update using (public.is_admin_or_staff());

-- ============================================
-- CHAPTERS
-- ============================================

create policy "chapters_select_all" on public.chapters
  for select using (true);

create policy "chapters_modify_admin" on public.chapters
  for all using (public.is_admin_or_staff());

-- ============================================
-- COURSES, MODULES, QUIZZES (read: all auth; write: admin)
-- ============================================

create policy "courses_select_published" on public.courses
  for select using (is_published = true or public.is_admin_or_staff());

create policy "courses_modify_admin" on public.courses
  for all using (public.is_admin_or_staff());

create policy "modules_select_all" on public.modules
  for select using (true);

create policy "modules_modify_admin" on public.modules
  for all using (public.is_admin_or_staff());

create policy "quizzes_select_all" on public.quizzes
  for select using (true);

create policy "quizzes_modify_admin" on public.quizzes
  for all using (public.is_admin_or_staff());

-- ============================================
-- USER PROGRESS
-- ============================================

create policy "progress_select_own" on public.user_progress
  for select using (user_id = auth.uid() or public.is_admin_or_staff());

create policy "progress_insert_own" on public.user_progress
  for insert with check (user_id = auth.uid());

create policy "progress_update_own" on public.user_progress
  for update using (user_id = auth.uid())
  with check (user_id = auth.uid());

-- ============================================
-- AMBASSADOR AGREEMENTS
-- ============================================

create policy "agreements_select_own" on public.ambassador_agreements
  for select using (user_id = auth.uid() or public.is_admin_or_staff());

create policy "agreements_insert_own" on public.ambassador_agreements
  for insert with check (user_id = auth.uid());

create policy "agreements_update_admin" on public.ambassador_agreements
  for update using (public.is_admin_or_staff());

-- ============================================
-- CHAT
-- ============================================

create policy "channels_select_all" on public.chat_channels
  for select using (true);

create policy "channels_modify_admin" on public.chat_channels
  for all using (public.is_admin_or_staff());

-- Users can read/write messages if authenticated
create policy "messages_select_auth" on public.chat_messages
  for select using (auth.uid() is not null);

create policy "messages_insert_auth" on public.chat_messages
  for insert with check (user_id = auth.uid());

-- ============================================
-- NOTIFICATIONS
-- ============================================

create policy "notifications_select_own" on public.notifications
  for select using (user_id = auth.uid());

create policy "notifications_update_own" on public.notifications
  for update using (user_id = auth.uid())
  with check (user_id = auth.uid());

create policy "notifications_insert_admin" on public.notifications
  for insert with check (public.is_admin_or_staff());

-- ============================================
-- ACTION ALERTS
-- ============================================

create policy "alerts_select_active" on public.action_alerts
  for select using (is_active = true or public.is_admin_or_staff());

create policy "alerts_modify_admin" on public.action_alerts
  for all using (public.is_admin_or_staff());

create policy "alert_responses_select_own" on public.alert_responses
  for select using (user_id = auth.uid() or public.is_admin_or_staff());

create policy "alert_responses_insert_own" on public.alert_responses
  for insert with check (user_id = auth.uid());

-- ============================================
-- NEWS & MENU
-- ============================================

create policy "news_select_published" on public.news
  for select using (is_published = true or public.is_admin_or_staff());

create policy "news_modify_admin" on public.news
  for all using (public.is_admin_or_staff());

create policy "menu_select_visible" on public.menu_items
  for select using (is_visible = true or public.is_admin_or_staff());

create policy "menu_modify_admin" on public.menu_items
  for all using (public.is_admin_or_staff());

-- ============================================
-- POINTS & ACTIVITY
-- ============================================

create policy "points_select_own" on public.points_log
  for select using (user_id = auth.uid() or public.is_admin_or_staff());

-- Points are inserted by edge functions (service role), not directly by users
create policy "points_insert_service" on public.points_log
  for insert with check (public.is_admin_or_staff());

create policy "reports_select_own" on public.activity_reports
  for select using (user_id = auth.uid() or public.is_admin_or_staff());

create policy "reports_insert_own" on public.activity_reports
  for insert with check (user_id = auth.uid());

-- ============================================
-- EVENTS & SHOP
-- ============================================

create policy "events_select_active" on public.lobby_events
  for select using (is_active = true or public.is_admin_or_staff());

create policy "events_modify_admin" on public.lobby_events
  for all using (public.is_admin_or_staff());

create policy "businesses_select_all" on public.local_businesses
  for select using (true);

create policy "businesses_modify_admin" on public.local_businesses
  for all using (public.is_admin_or_staff());
