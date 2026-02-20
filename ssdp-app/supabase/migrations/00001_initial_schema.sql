-- ============================================
-- SSDP App Initial Schema
-- Run against a new Supabase project
-- ============================================

-- Enable UUID generation
create extension if not exists "pgcrypto";

-- ============================================
-- USERS & ORGANIZATION
-- ============================================

create table public.chapters (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  university text,
  city text,
  state text,
  total_points integer default 0,
  is_active boolean default true,
  created_at timestamptz default now()
);

create table public.profiles (
  id uuid references auth.users on delete cascade primary key,
  email text not null,
  full_name text,
  avatar_url text,
  role text default 'registered'
    check (role in ('guest','registered','ambassador',
                    'committee_member','committee_chair','board','staff','admin')),
  chapter_id uuid references chapters(id),
  points integer default 0,
  bio text,
  push_token text,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- Auto-create profile on user signup
create or replace function public.handle_new_user()
returns trigger as $$
begin
  insert into public.profiles (id, email, full_name)
  values (
    new.id,
    new.email,
    coalesce(new.raw_user_meta_data->>'full_name', '')
  );
  return new;
end;
$$ language plpgsql security definer;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- ============================================
-- EDUCATION / COURSES
-- ============================================

create table public.courses (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  description text,
  track text check (track in ('drug_education', 'internal_onboarding')),
  duration_minutes integer,
  module_count integer default 0,
  hero_image_url text,
  required_role text default 'registered',
  sort_order integer default 0,
  is_published boolean default false,
  partner_name text,
  points_bonus integer default 20,
  created_at timestamptz default now()
);

create table public.modules (
  id uuid primary key default gen_random_uuid(),
  course_id uuid references courses(id) on delete cascade,
  title text not null,
  content_markdown text,
  video_url text,
  video_duration text,
  sort_order integer default 0,
  points_reward integer default 10,
  created_at timestamptz default now()
);

create table public.quizzes (
  id uuid primary key default gen_random_uuid(),
  module_id uuid references modules(id) on delete cascade,
  question text not null,
  options jsonb not null,
  correct_index integer not null,
  explanation text,
  points_reward integer default 5
);

create table public.user_progress (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references profiles(id) on delete cascade,
  course_id uuid references courses(id) on delete cascade,
  current_module integer default 1,
  completed_modules jsonb default '[]'::jsonb,
  quiz_scores jsonb default '{}'::jsonb,
  completed_at timestamptz,
  points_earned integer default 0,
  unique(user_id, course_id)
);

create table public.ambassador_agreements (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references profiles(id) on delete cascade unique,
  commitments jsonb,
  status text default 'submitted' check (status in ('submitted','approved','rejected')),
  reviewer_id uuid references profiles(id),
  signed_at timestamptz default now(),
  reviewed_at timestamptz
);

-- ============================================
-- COMMUNICATION
-- ============================================

create table public.chat_channels (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  description text,
  required_role text default 'ambassador',
  is_chapter_channel boolean default false,
  chapter_id uuid references chapters(id),
  sort_order integer default 0,
  created_at timestamptz default now()
);

create table public.chat_messages (
  id uuid primary key default gen_random_uuid(),
  channel_id uuid references chat_channels(id) on delete cascade,
  user_id uuid references profiles(id) on delete cascade,
  content text not null,
  created_at timestamptz default now()
);

create table public.notifications (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references profiles(id) on delete cascade,
  title text not null,
  body text,
  type text check (type in ('urgent','course','event','points','system')),
  action_url text,
  is_read boolean default false,
  created_at timestamptz default now()
);

create table public.action_alerts (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  description text,
  bill_number text,
  call_to_action text,
  target_contact text,
  points_reward integer default 25,
  is_active boolean default true,
  created_at timestamptz default now()
);

create table public.alert_responses (
  id uuid primary key default gen_random_uuid(),
  alert_id uuid references action_alerts(id) on delete cascade,
  user_id uuid references profiles(id) on delete cascade,
  completed_at timestamptz default now(),
  points_earned integer,
  unique(alert_id, user_id)
);

-- ============================================
-- NEWS & CONTENT
-- ============================================

create table public.news (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  body text,
  excerpt text,
  tag text check (tag in ('event','urgent','policy','win','course')),
  image_url text,
  external_url text,
  source text default 'admin' check (source in ('admin','wordpress')),
  wp_post_id integer,
  is_published boolean default true,
  published_at timestamptz default now()
);

create table public.menu_items (
  id uuid primary key default gen_random_uuid(),
  label text not null,
  icon text,
  link_type text check (link_type in ('screen','external','webview')),
  link_value text,
  required_role text default 'guest',
  section text check (section in ('account','ssdp','support')),
  sort_order integer default 0,
  is_visible boolean default true
);

-- ============================================
-- ENGAGEMENT & GAMIFICATION
-- ============================================

create table public.points_log (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references profiles(id) on delete cascade,
  points integer not null,
  reason text not null,
  source_type text,
  source_id uuid,
  created_at timestamptz default now()
);

create table public.activity_reports (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references profiles(id) on delete cascade,
  report_type text not null,
  contact_name text,
  summary text,
  photo_urls jsonb default '[]'::jsonb,
  points_earned integer default 10,
  created_at timestamptz default now()
);

-- ============================================
-- EVENTS
-- ============================================

create table public.lobby_events (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  event_date date,
  location text,
  description text,
  schedule jsonb,
  talking_points jsonb,
  is_active boolean default false,
  created_at timestamptz default now()
);

-- ============================================
-- SHOP (supplements WooCommerce data)
-- ============================================

create table public.local_businesses (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  address text,
  city text,
  state text,
  latitude decimal,
  longitude decimal,
  category text,
  description text,
  is_verified boolean default false,
  created_at timestamptz default now()
);

-- ============================================
-- INDEXES
-- ============================================

create index idx_profiles_role on profiles(role);
create index idx_profiles_chapter on profiles(chapter_id);
create index idx_modules_course on modules(course_id);
create index idx_quizzes_module on quizzes(module_id);
create index idx_user_progress_user on user_progress(user_id);
create index idx_user_progress_course on user_progress(course_id);
create index idx_chat_messages_channel on chat_messages(channel_id);
create index idx_chat_messages_created on chat_messages(created_at);
create index idx_notifications_user on notifications(user_id);
create index idx_notifications_read on notifications(user_id, is_read);
create index idx_news_published on news(published_at desc);
create index idx_points_log_user on points_log(user_id);
create index idx_menu_items_section on menu_items(section, sort_order);
