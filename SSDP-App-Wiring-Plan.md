# SSDP App Wiring Plan

> Conference-first delivery plan for turning the clickable prototype into a production native mobile app, with full technical implementation detail.

---

## 1. Context and Goal

### Current Reality (as of February 19, 2026)
- The current app in this repo is a **static prototype** (`index.html`, mirrored in `prototype/index.html`), ~2,190 lines of HTML/CSS/JS. Not a production app.
- Prototype inventory: **10 screens**, **5 modals**, **8 courses**, **3 roles**, **100+ interactive elements** — all visual-only with hardcoded data.
- There is **no live backend**, **no auth**, **no database**, and **no native iOS/Android code** yet.
- Live prototype: https://evannison.github.io/SSDPApp/

### Primary Delivery Objective
Deliver a **conference-ready core** by **March 17, 2026** (Conference on Nicotine Harm Reduction, Pittsburgh), then complete remaining features in scheduled releases.

---

## 2. Stakeholder Direction (Weighted to Recent Calls)

### Source Calls Reviewed
- `Kat SSDP App V4.m4a` — 2026-02-19 (9 min, highest weight)
- `Kat SSDP App V4 continued.m4a` — 2026-02-19 (2.4 min, highest weight)
- `Evan and Kat SSDP app pt 2.m4a` — 2026-02-16 (20 min, supporting context)

### High-Priority Requirements (Feb 19 calls)

**Admin dashboard** (password-protected, e.g., login.ssdp.org) must support:
- Role assignment
- Menu editing (including adding/removing website-linked pages)
- Control over news content/source (e.g., pull from recent blog posts)
- Updates without app redeploy

**Must-have conference functionality:**
- HOPE training live
- Nicotine/THR training live
- Ambassador signup flow live

**Splash and auth copy** (Kat dictated verbatim):
- Headline: *"We are Students for Sensible Drug Policy, the largest youth-led network dedicated to replacing the War on Drugs with principles rooted in evidence, compassion, and human rights — policies that make sense."*
- `Get Started` → **"Join SSDP"** (or "Join Our Movement")
- `Already have an account` → **"Login"** (not ambassador-specific, since users aren't ambassadors yet)

**Branding direction:**
- Stronger SSDP style-guide alignment (completed in prototype — brand colors, Montserrat + Open Sans)
- More SSDP people/action imagery — "human faces, FOMO-type stuff"
- Splash screen design reference: Kat pointed to ssdp.org front page layout as visual inspiration
- Kat: *"If we just start putting our actual information and make it like an actual app, we're ready to go."*
- Kat explicitly endorsed Shop Sensibly: *"I like Shop Sensibly. I told you that I like this."*

**Deferred until ready, but explicitly tracked:**
- Campus gradebook (when data is current)
- Expungement guide (when content is available)

### Lower Priority (Feb 16 call)
- Board AI/technology committee (organizational, not app-blocking)
- AI policy for board approval (organizational)

---

## 3. Planning Principles (Locked)

1. Conference date governs scope.
2. Any feature not required for conference readiness is deferred to a named release.
3. Deferred features are tracked in this plan with dependency/target release.
4. No implementation assumptions are left ambiguous for the engineering team.

---

## 4. Architecture (Locked Decision)

### Product Stack
| Layer | Technology | Purpose |
|-------|-----------|---------|
| Mobile app | **Expo React Native** + TypeScript + Expo Router + NativeWind | Cross-platform iOS + Android. File-based routing. Tailwind styling. |
| State management | **Zustand** | Lightweight global state (auth, role, UI) |
| Forms | **React Hook Form + Zod** | Quiz forms, registration, reports. Type-safe validation. |
| Backend | **Supabase** (Postgres, Auth, Storage, Realtime, Edge Functions) | Database, auth, file storage, real-time chat, server-side logic |
| Admin dashboard | **Next.js 15** (App Router) + shadcn/ui + Tailwind | Web-only admin interface with professional UI components |
| Dev environment | **Replit** | Cloud IDE, AI-assisted development, admin dashboard deployment |
| Mobile builds | **EAS Build** (Expo) | iOS TestFlight + Android internal testing builds |

### How It Fits Together
- **Replit** is the development environment and hosts the admin dashboard via Replit Deployments
- **Supabase** is a separate hosted cloud service — Replit connects to it via HTTPS API
- **EAS Build** compiles the React Native code into native iOS/Android binaries (Replit can't do native builds)
- Both the mobile app and admin dashboard connect to the same Supabase project

### Content Integrations
| Source | Endpoint | Use |
|--------|----------|-----|
| SSDP Blog | `ssdp.org/wp-json/wp/v2/posts` (confirmed working) | News feed — returns titles, content, excerpts, dates, featured images, categories |
| SSDP Store | `ssdp.org/wp-json/wc/v3/products` (WooCommerce, needs API keys) | Shop Sensibly product listings |
| Course content | Supabase DB (admin-authored) | Modules, quizzes, videos — managed via admin dashboard |
| SSDP photos | `ssdp.org/wp-content/uploads/` + Supabase Storage + SSDP Google Drive (shared by Kat) | Hero images, event photos |

### System Diagram
```
┌──────────────────────────────────────────────────┐
│                    USERS                          │
│   ┌────────────┐           ┌────────────────┐    │
│   │  iOS App   │           │  Android App   │    │
│   │  (Expo)    │           │  (Expo)        │    │
│   └──────┬─────┘           └───────┬────────┘    │
│          └───────────┬─────────────┘              │
│            ┌─────────▼─────────┐                  │
│            │   Expo Router     │                  │
│            │   Tab + Stack Nav │                  │
│            └─────────┬─────────┘                  │
└──────────────────────┼────────────────────────────┘
                       │
             ┌─────────▼──────────┐
             │      Supabase      │
             │  ┌───────────────┐ │
             │  │  PostgreSQL   │ │ ← All app data
             │  ├───────────────┤ │
             │  │  Auth         │ │ ← Register, Login, Sessions
             │  ├───────────────┤ │
             │  │  Realtime     │ │ ← Live chat
             │  ├───────────────┤ │
             │  │  Storage      │ │ ← Images, uploads
             │  ├───────────────┤ │
             │  │  Edge Funcs   │ │ ← Points calc, WP/WC proxy,
             │  │               │ │   push triggers
             │  └───────────────┘ │
             └─────────┬──────────┘
                       │
        ┌──────────────┼──────────────┐
        │              │              │
  ┌─────▼─────┐  ┌────▼────────┐  ┌──▼──────────────┐
  │   Admin   │  │  ssdp.org   │  │  Expo Push       │
  │   Dash    │  │  WordPress  │  │  Notification     │
  │  (Next.js │  │  REST API   │  │  Service          │
  │  Replit)  │  │  + WooComm  │  │                   │
  └───────────┘  └─────────────┘  └───────────────────┘
```

---

## 5. Database Schema

### Core Tables

```sql
-- ============================================
-- USERS & ORGANIZATION
-- ============================================

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
  options jsonb not null,            -- ["Option A", "Option B", "Option C", "Option D"]
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
```

### Row Level Security (RLS)
| Table | Read | Write |
|-------|------|-------|
| profiles | Own profile; admins read all | Own profile; admins update any |
| courses, modules, quizzes | All authenticated users | Admin/staff only |
| user_progress | Own records | Own records |
| chat_messages | If user role meets channel requirement | Same |
| news, menu_items | All users | Admin/staff only |
| points_log | Own records; admins all | System only (Edge Functions) |
| notifications | Own only | Admin/system only |

---

## 6. Release Train

### Release 0: Foundation
**Window:** Feb 20–Feb 24, 2026

| # | Task | Details |
|---|------|---------|
| 0.1 | Init Expo project in Replit | `npx create-expo-app ssdp-app --template tabs` with Expo Router, TypeScript |
| 0.2 | Configure NativeWind | SSDP brand colors as Tailwind theme: JW Blue #136F8D, Orange #FAA732, Teal #17BEBB, Navy #003249, Chartreuse #DAF702, Gray #636467. Montserrat + Open Sans fonts. |
| 0.3 | Stand up Supabase | Create project, run all migrations from Section 5, configure RLS policies |
| 0.4 | Auth baseline | Supabase Auth client with `expo-secure-store`. Register/Login/Guest flows. Profile creation trigger on `auth.users` insert. |
| 0.5 | Role model | Zustand store with profile + role. Conditional rendering per role (mirrors prototype's `data-role`). |
| 0.6 | Tab navigation | 5 bottom tabs: Home, Academy, Shop, Chat, More. Stack navigators within each tab. |
| 0.7 | Init admin in Replit | Separate Repl: `npx create-next-app ssdp-admin` with App Router, shadcn/ui, Tailwind, same Supabase client |
| 0.8 | CI checks | TypeScript strict mode, ESLint, migration validation |

**Exit Criteria:** Engineers can run app + admin against staging Supabase. Auth and role data model exists end-to-end.

### Release 1: Conference Core (Hard Deadline)
**Window:** Feb 25–Mar 13, 2026 (build) + Mar 14–Mar 16 (stabilization)
**Deadline:** Mar 17, 2026

| # | Task | Details |
|---|------|---------|
| 1.1 | Onboarding/auth copy | Splash with Kat's verbatim text. "Join SSDP" + "Login" buttons. |
| 1.2 | Home screen | Role-based greeting, progress card (points + courses from DB), quick actions, featured CTA |
| 1.3 | News feed | Supabase Edge Function fetches from `ssdp.org/wp-json/wp/v2/posts`, caches in `news` table. App shows combined WP + admin news. |
| 1.4 | Academy screen | Course list from DB, grouped by `track` (drug_education / internal_onboarding). Per-user progress. Role-based locks. |
| 1.5 | Course detail + module viewer | Module list with checkmarks. Content via markdown rendering. Video embed. Prev/next navigation. |
| 1.6 | Quiz system | 4-option MCQ → validate → show explanation → award points → update `user_progress` |
| 1.7 | **Author HOPE content** | 5 modules (see Section 8). 300-500 words each + 1 quiz. Seed into DB. |
| 1.8 | **Author THR content** | 4 modules (see Section 8). 300-500 words each + 1 quiz. Seed into DB. |
| 1.9 | **Author Ambassador content** | 3 modules (see Section 8). Ambassador agreement as final step. |
| 1.10 | Ambassador signup flow | Complete course → sign agreement → `ambassador_agreements` insert (status: submitted) → admin approval → role upgrade → unlock features |
| 1.11 | Points system | Award on: module completion, correct quiz, course completion bonus. Update `profiles.points` + `chapters.total_points`. Insert `points_log`. |
| 1.12 | User profile | Name, avatar upload (Supabase Storage), chapter, role badge, points, courses completed |
| 1.13 | Notification list | Pull from `notifications` table. Bell icon with unread count. Mark as read. |
| 1.14 | Admin: auth & guard | Login page, role check (admin/staff), redirect unauthorized |
| 1.15 | Admin: user manager | Searchable list, role assignment dropdown, view user progress |
| 1.16 | Admin: course CRUD | Create/edit courses, modules, quizzes. Rich text editor. Publish toggle. |
| 1.17 | Admin: menu editor | Visual list, drag-reorder, add/remove items, link type (screen/external/webview), role requirement, visibility toggle |
| 1.18 | Admin: news manager | WP sync toggle + manual announcements. Tag assignment. Preview. |
| 1.19 | Branding pass | SSDP style guide compliance. Add more people/action photos. |
| 1.20 | TestFlight + Android builds | EAS Build for iOS TestFlight and Android internal testing |
| 1.21 | Deploy admin on Replit | Replit Deployment (Reserved VM). Custom domain login.ssdp.org when DNS ready. |

**Out of Scope for Release 1:** Campus gradebook, expungement guide, advanced deep linking, offline cache, full analytics, push campaign automation.

**Exit Criteria:**
- New user can register/login and complete HOPE + THR learning paths
- Ambassador signup flow completes and role changes correctly
- Admin can modify roles/menu/news without redeploy
- Basic points tracking works across all course activities
- App installable on iOS and Android physical devices

### Release 2: Store Compliance, Submission & Hardening
**Window:** Mar 18–Apr 10, 2026

**Scope:**
- Bug and UX hardening from conference + beta feedback
- Expand admin controls for moderation and operations
- Implement account deletion feature (required by both stores)
- Complete all store compliance requirements (see checklists below)
- Submit for production review on both platforms

#### iOS App Store Compliance Checklist

| # | Requirement | Details |
|---|------------|---------|
| 2.1 | **Privacy Policy** | Hosted URL (e.g., ssdp.org/app-privacy) describing all data collected: email, name, chapter, course progress, points, chat messages, photos. Must be publicly accessible. |
| 2.2 | **App Privacy Labels** | Declare in App Store Connect: data types collected (contact info, usage data, identifiers), purpose (app functionality), whether linked to identity. |
| 2.3 | **App Tracking Transparency** | Declare "does not track" (no cross-app tracking). If analytics added later, re-evaluate. |
| 2.4 | **Content Rating Questionnaire** | Drug/alcohol references = "Infrequent/Mild" (educational context). Expect 12+ or 17+ rating. |
| 2.5 | **Drug Education Reviewer Note** | Apple Guideline 1.4.3 rejects apps that encourage drug use. Include reviewer note: *"This app provides evidence-based drug education and harm reduction training for college students through Students for Sensible Drug Policy, a 501(c)(3) nonprofit. Content is educational, aligned with SAMHSA and FDA guidance, and does not encourage illegal drug use."* |
| 2.6 | **Account Deletion** | Required since 2022. "Delete Account" in profile settings → Supabase cascading delete of all user data. |
| 2.7 | **Minimum iOS Version** | iOS 16+ (covers ~95% active devices). Set in `app.json`. |
| 2.8 | **App Icon** | 1024x1024 PNG, no transparency. SSDP branded. |
| 2.9 | **Screenshots** | Min 3, recommended 6. Required: 6.7" (iPhone 15 Pro Max) + 6.5" (iPhone 11 Pro Max). iPad optional. |
| 2.10 | **Description + Support URL** | Short subtitle (30 chars) + full description. Emphasize educational mission, nonprofit. Support URL: ssdp.org/contact. |

#### Google Play Store Compliance Checklist

| # | Requirement | Details |
|---|------------|---------|
| 2.11 | **Privacy Policy** | Same hosted URL as iOS. Required in Play Console. |
| 2.12 | **Data Safety Section** | Declare: data types collected, encrypted in transit (yes — Supabase HTTPS), users can request deletion (yes), no data shared with third parties. |
| 2.13 | **Content Rating (IARC)** | Complete IARC questionnaire. Drug education → expect T (Teen) or higher. |
| 2.14 | **Target Audience** | Declare **18+** to avoid COPPA (under 13) and Google Families Policy (under 18) complexity. SSDP is a college organization — users are predominantly 18+. |
| 2.15 | **Drug Content Policy** | Google prohibits facilitating sale of controlled substances but allows educational content. Frame as nonprofit harm reduction education. |
| 2.16 | **Account Deletion** | Same as iOS. Required by Google since 2023. |
| 2.17 | **Feature Graphic** | 1024x500 PNG for Play Store listing header. |
| 2.18 | **Screenshots** | Min 2, recommended 8. Phone + optional tablet. |
| 2.19 | **Descriptions** | Short (80 chars) + Full (4000 chars). Emphasize educational, nonprofit, harm reduction. |
| 2.20 | **Category + Ads** | Category: Education. Ads: No. |

#### Critical Compliance Decisions

| Decision | Recommendation | Rationale |
|----------|---------------|-----------|
| **Target age** | **18+** on both platforms | Avoids COPPA/Families Policy complexity. SSDP is college students. This is a store metadata declaration — younger users can still download. |
| **Content framing** | Lead with "evidence-based harm reduction education" and "501(c)(3) nonprofit" everywhere | Both stores scrutinize drug-related content. Educational framing from a registered nonprofit citing SAMHSA/FDA/WHO is the strongest defense against rejection. |
| **Account deletion** | Implement in Release 2, test thoroughly | Hard requirement for both stores. Supabase `auth.users` delete cascades to `profiles` and all related tables. |
| **Privacy policy** | Publish at `ssdp.org/app-privacy` before submission | Must be a public URL, not behind auth. SSDP web admin creates the page. |

**Exit Criteria:**
- All checklist items above completed
- Submission-ready binaries for both platforms
- No unresolved critical defects from conference flows
- Account deletion implemented and tested
- Privacy policy published and accessible
- Reviewer notes addressing educational drug content prepared for both platforms

### Release 3: Deferred Feature Delivery
**Window:** Apr 11–May 15, 2026

**Scope:**
- Campus gradebook integration (after data refresh confirmation)
- Expungement guide (after approved content available)
- Chat system (Supabase Realtime channels, role-gated access)
- Shop Sensibly with WooCommerce full sync (if credentials ready)
- Local business map (react-native-maps)
- Lobby Day tools (event schedule, meeting check-off, report form)
- Push notifications (Expo Push API)
- Action alert full lifecycle
- Offline module caching
- Deep linking
- Analytics

**Exit Criteria:** Deferred features shipped only when dependencies satisfied.

---

## 7. March 17 Conference Scope Matrix

### Must-Have (Conference Blockers)
- Auth (`Join SSDP`, `Login`) and guest mode
- HOPE + THR courses with working quizzes and explanations
- Ambassador onboarding and agreement flow
- Role-based gating and progressive unlock
- Basic points system (earn on course completion, quiz answers)
- Basic profile with points display
- Admin role management, menu editing, news/source controls
- SSDP brand/copy updates from Feb 19 calls
- iOS TestFlight + Android internal build distributed

### Should-Have (If No Risk to Must-Haves)
- Initial role-gated chat channels
- Basic action-alert scaffolding
- Notification bell with in-app notifications

### Explicitly Deferred
- Campus gradebook (pending fresh data)
- Expungement guide (pending source content)
- Shop Sensibly with WooCommerce
- Local business map
- Lobby Day tools
- Public ambassador/chapter directory at full depth
- Advanced deep linking / analytics / offline
- Push notifications

---

## 8. Content Authoring Plan (Critical Path)

Course content **does not exist** and must be written from scratch. This is the biggest risk to the March 17 deadline.

### HOPE: Overdose Prevention Training (5 Modules, ~1 hour)

| # | Module | Content Scope | Quiz |
|---|--------|--------------|------|
| 1 | What is an Opioid Overdose | Definition, types of opioids (prescription, heroin, fentanyl), why overdoses happen, risk factors | Identifying risk factors |
| 2 | Recognizing the Signs | Physical signs (breathing, pupils, skin color, responsiveness), when to act | Which symptom is NOT an overdose sign |
| 3 | Good Samaritan Laws | What's protected, state variation, SSDP advocacy, overcoming fear of calling 911 | Legal protections |
| 4 | Naloxone: How to Save a Life | What naloxone is, nasal vs injection, step-by-step, where to get it | Correct administration steps |
| 5 | After an Overdose & Harm Reduction | Follow-up care, resources, harm reduction philosophy, campus advocacy | Core harm reduction principles |

### THR: Tobacco Harm Reduction (4 Modules, ~45 min)

| # | Module | Content Scope | Quiz |
|---|--------|--------------|------|
| 1 | What is Tobacco Harm Reduction | THR definition, 480K US deaths/year, SSDP's evidence-based approach | Primary driver of tobacco disease |
| 2 | The Continuum of Risk | Combustible → heated → vaping → pouches/snus → NRT, relative risk evidence | Ranking products by risk |
| 3 | Global Perspectives & Policy | UK NHS endorsement, Sweden snus, FDA framework, WHO position, flavor bans | International policy approaches |
| 4 | Advocacy & SSDP's Role | Policy recommendations, countering misinformation, campus advocacy, SSDP conference | Effective advocacy strategies |

### Become an SSDP Ambassador (3 Modules, ~20 min)

| # | Module | Content Scope | Assessment |
|---|--------|--------------|------------|
| 1 | What is an Ambassador | Role definition, what you unlock, expectations | None |
| 2 | The Points System | How points work (5-25 pts), earning actions, chapter competition | None |
| 3 | Your Commitment | Pledge items, code of conduct | **Ambassador Agreement** (formal signature) |

### Authoring Process
1. **Research & draft** from authoritative sources (SAMHSA, NIDA, FDA, WHO, UK NHS, SSDP policy briefs on ssdp.org)
2. **Target length**: 300-500 words per module (mobile-optimized, scannable)
3. **Review with Kat** for accuracy and SSDP philosophical alignment
4. **Seed into database** via SQL for March 17. Admin dashboard for ongoing edits.
5. **Video**: Text + quiz only for MVP. Video embeds in later release.
6. **Content freeze**: Mar 10. Only bug fixes after that.

---

## 9. Admin Dashboard Detailed Spec

### Dashboard Home
- Stat cards: total users, active ambassadors, courses completed (this month), points awarded
- Recent activity: last 10 signups, last 10 course completions
- Active action alerts with response rate

### Course Manager
- Table: courses with title, track, modules count, published status, completion count
- Create/edit: title, description, track, duration, hero image upload, required role, sort order
- Within course: ordered module list. Add/edit/delete/reorder.
- Within module: rich text editor (Tiptap), video URL, quiz builder (question + 4 options + correct answer + explanation)
- One-click publish/unpublish (immediately reflects in app)

### News Manager
- **WordPress Sync**: Toggle auto-import from `ssdp.org/wp-json/wp/v2/posts`. Maps WP title/excerpt/image/link → news table. Auto-tags from WP categories.
- **Manual**: Create with title, body, tag, image upload, external URL
- Card preview

### User Manager
- Searchable table: name, email, role, chapter, points, joined date
- User detail: profile, role dropdown (editable), points history, course progress, reports
- Bulk role assignment

### Menu Editor
- Visual list grouped by section (Account / SSDP / Support)
- Drag-reorder within sections
- Add: label, icon, link type (screen / external URL / webview), link value, required role, section
- Visibility toggle
- *Fulfills Kat's requirement: "admin controls, adding and taking away pages in that menu"*

### Action Alert Manager
- Create/edit: title, description, bill number, CTA, contact info, points reward
- Activate/deactivate
- Response metrics

### Chapter Manager
- Table: name, university, total points, member count, active status
- Create/edit chapter details
- View members

---

## 10. Project Structure

```
ssdp-app/                            # Expo mobile app (Replit)
├── app/                             # Expo Router screens
│   ├── (auth)/
│   │   ├── welcome.tsx              # Splash with Kat's copy
│   │   ├── register.tsx             # "Join SSDP"
│   │   └── login.tsx
│   ├── (tabs)/
│   │   ├── _layout.tsx              # Tab bar config
│   │   ├── index.tsx                # Home
│   │   ├── academy/
│   │   │   ├── index.tsx            # Course list
│   │   │   └── [courseId].tsx        # Course detail + modules
│   │   ├── shop/index.tsx           # Shop Sensibly
│   │   ├── chat/
│   │   │   ├── index.tsx            # Channel list
│   │   │   └── [channelId].tsx      # Chat room
│   │   └── more/
│   │       ├── index.tsx            # Profile + menu
│   │       ├── profile.tsx
│   │       ├── notifications.tsx
│   │       └── points.tsx
│   ├── lobby/[eventId].tsx
│   ├── alert/[alertId].tsx
│   ├── ambassador-agreement.tsx
│   └── _layout.tsx                  # Root layout (auth guard)
├── components/                      # Shared UI
├── lib/
│   ├── supabase.ts                  # Client init
│   ├── auth.ts
│   ├── points.ts
│   ├── wordpress.ts                 # WP REST API client
│   └── woocommerce.ts              # WC API client
├── stores/useStore.ts               # Zustand
├── hooks/                           # Data hooks
├── constants/
│   ├── colors.ts                    # Brand palette
│   └── config.ts                    # API URLs
├── app.json                         # Expo config
├── tailwind.config.js               # NativeWind theme
└── eas.json                         # EAS Build config

ssdp-admin/                          # Next.js admin (separate Repl)
├── app/
│   ├── (auth)/login/page.tsx
│   ├── (dashboard)/
│   │   ├── page.tsx                 # Dashboard home
│   │   ├── courses/                 # Course CRUD
│   │   ├── news/page.tsx            # News + WP sync
│   │   ├── users/                   # User management
│   │   ├── menu/page.tsx            # Menu editor
│   │   ├── alerts/page.tsx
│   │   ├── chapters/page.tsx
│   │   └── lobby/page.tsx
│   └── layout.tsx
├── components/                      # shadcn/ui based
├── lib/supabase.ts
└── package.json
```

---

## 11. Infrastructure & Costs

### Monthly Costs at Launch
| Service | Tier | Cost | What You Get |
|---------|------|------|-------------|
| Replit | Core ($20/mo, already subscribed) | $20 | Cloud IDE, AI dev, admin dashboard hosting |
| Supabase | Free | $0 | 500MB DB, 1GB storage, 50K MAU, Realtime, Auth, Edge Functions |
| Expo EAS | Free | $0 | 30 builds/month, OTA updates |
| Apple Developer | Annual | $99/yr (~$8/mo) | TestFlight + App Store |
| Google Play | One-time | $25 | Play Store |
| **Total** | | **~$28/month** | Replit already paid; rest is free tier |

### Domain Setup
- **login.ssdp.org** → CNAME to Replit Deployment (admin dashboard)
- **Requires**: DNS access to ssdp.org (Kat/SSDP IT)
- **Default if DNS not ready**: use `ssdp-admin.replit.app`

---

## 12. Test and Acceptance Plan

### Core User Journeys
- Register/login → complete HOPE (all 5 modules + quizzes) → points update
- Complete THR (all 4 modules + quizzes) → progress and completion update
- Complete Ambassador course → submit agreement → admin approves → role transition → features unlocked

### Admin Journeys
- Change user role → verify mobile permission change
- Add/remove/reorder menu links → verify no redeploy needed
- Update news source → verify app reflects update
- Publish new course → verify it appears in Academy

### Device Coverage
- Physical iOS and Android phones before conference
- Mar 14-16 stabilization window: defect triage only, no new features

---

## 13. Risk Register

| Risk | Impact | Mitigation |
|------|--------|------------|
| Scope creep before Mar 17 | Missed conference | Hard scope gate; additions go to Release 2/3 ledger |
| App store timing uncertainty | Delayed public listing | Conference relies on TestFlight/internal, not public approval |
| Content readiness (HOPE/THR) | Incomplete training | Content freeze Mar 10; publish only validated modules |
| Admin workflow gaps | Manual bottlenecks | Role/menu/news controls are non-negotiable in Release 1 |
| Apple Developer account missing | No TestFlight | Create immediately during Release 0 |
| **App Store rejection for drug content** | Delayed public release | Prepare detailed reviewer notes explaining 501(c)(3) nonprofit educational mission, cite SAMHSA/FDA alignment. Frame all content as harm reduction education, not promotion. Set target age 18+. Have appeal ready. |
| **Privacy policy not ready** | Blocks both store submissions | Draft during Release 1, publish on ssdp.org before Release 2 submission. Kat/SSDP web admin must create the page. |
| **COPPA/age compliance** | Legal liability, store removal | Declare 18+ target audience on both platforms. Do not collect data from users who identify as under 13. Add age gate at registration if needed. |

---

## 14. Dependencies and Open Inputs

| Item | Needed By | Default if Missing |
|------|-----------|--------------------|
| Apple Developer account ($99/yr) | Release 0 | Create ASAP — takes 24-48hrs to activate |
| Google Play account ($25) | Release 0 | Create during Release 0 |
| SSDP style guide + image assets | Release 1 | Use public assets from ssdp.org |
| DNS access for login.ssdp.org | Release 1 | Use ssdp-admin.replit.app |
| Content review (Kat) | Mar 10 freeze | Draft → Kat review → publish. Parallelize with dev. |
| Privacy policy page on ssdp.org | Release 2 | Draft during Release 1; Kat/SSDP web admin publishes at ssdp.org/app-privacy |
| Account deletion feature | Release 2 | Required by both App Store and Google Play. Supabase cascading deletes. |
| WooCommerce API credentials | Release 3 | Keep Shop Sensibly as manual/affiliate links |
| Gradebook data source | Release 3 | Keep hidden until verified |
| Expungement guide content | Release 3 | Keep hidden until provided |

---

## 15. Deferred Feature Tracking Ledger

| Feature | Status | Dependency | Target Release | Notes |
|---------|--------|------------|----------------|-------|
| Campus gradebook | Deferred | Refreshed data source | Release 3 | Do not launch stale data. Kat's UX direction: users should be able to "find and update your page" (their chapter's page). |
| Expungement guide | Deferred | Approved SSDP content | Release 3 | Add as menu-managed content |
| Chat system | Deferred | Core stability | Release 3 | Supabase Realtime, role-gated |
| Shop Sensibly (WooCommerce) | Deferred | API credentials | Release 3 | Manual/affiliate links first |
| Local business map | Deferred | Data quality | Release 3 | Avoid empty map UX |
| Lobby Day tools | Deferred | Event schedule | Release 3 | Schedule + report form |
| Push notifications | Deferred | Expo Push + admin UI | Release 3 | Expo Push API |
| Ambassador/chapter directory | Deferred | Privacy rules | Release 2/3 | Start read-only |
| Deep linking | Deferred | Stable route map | Release 3+ | Not needed for conference |
| Offline caching | Deferred | QA bandwidth | Release 3+ | After core stability |
| Analytics | Deferred | Event schema | Release 2/3 | Critical events only first |

---

## 16. Reference URLs

| Resource | URL | Purpose |
|----------|-----|---------|
| Current prototype | https://evannison.github.io/SSDPApp/ | Visual reference |
| Prototype source | `prototype/index.html` in this repo | Design patterns, copy, layout |
| SSDP Blog API | `ssdp.org/wp-json/wp/v2/posts` | News feed |
| SSDP Store API | `ssdp.org/wp-json/wc/v3/products` (needs auth) | Shop products |
| SSDP Photos | `ssdp.org/wp-content/uploads/` | App imagery |
| SSDP Flickr | `flickr.com/photos/ssdp/` | Additional photos (3,743+) |
| Supabase Docs | `supabase.com/docs` | Backend reference |
| Expo Docs | `docs.expo.dev` | Mobile framework |
| Expo Router | `docs.expo.dev/router/introduction/` | Navigation |
| Replit Docs | `docs.replit.com` | IDE + Deployments |
