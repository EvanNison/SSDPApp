# SSDP App

Students for Sensible Drug Policy — mobile app + admin dashboard.

## Architecture

| Component | Directory | Stack | Dev Port |
|-----------|-----------|-------|----------|
| Mobile App | `ssdp-app/` | Expo (React Native) + TypeScript + Expo Router + NativeWind + Zustand | 8081 |
| Admin Dashboard | `ssdp-admin/` | Next.js 15 (App Router) + Tailwind CSS v4 | 3000 |
| Backend | Supabase | Postgres + Auth + Storage + Realtime | hosted |

**Supabase Project:** `rsyofdcqshwnbxhhcgdh` ([Dashboard](https://supabase.com/dashboard/project/rsyofdcqshwnbxhhcgdh))

## Quick Start

### 1. Install dependencies

```bash
cd ssdp-admin && npm install
cd ../ssdp-app && npm install
```

### 2. Set up environment variables

**Admin dashboard** — create `ssdp-admin/.env.local`:
```
NEXT_PUBLIC_SUPABASE_URL=https://rsyofdcqshwnbxhhcgdh.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=<anon key from Supabase dashboard>
SUPABASE_SERVICE_ROLE_KEY=<service role key from Supabase dashboard>
```

**Mobile app** — create `ssdp-app/.env`:
```
EXPO_PUBLIC_SUPABASE_URL=https://rsyofdcqshwnbxhhcgdh.supabase.co
EXPO_PUBLIC_SUPABASE_ANON_KEY=<anon key from Supabase dashboard>
```

Get keys from: **Supabase Dashboard → Settings → API**

### 3. Run dev servers

```bash
# Admin dashboard
cd ssdp-admin && npm run dev

# Mobile app (separate terminal)
cd ssdp-app && npx expo start --web
```

### 4. Login

**Admin:** Navigate to `http://localhost:3000/login`
- Email: `evan@nisonco.com`
- Password: `SSDPadmin2026!`

**Mobile app:** Open `http://localhost:8081` and tap "Continue as Guest" or login.

---

## Database

All migrations are in `ssdp-app/supabase/migrations/` and have already been applied to the live Supabase project. No migration steps needed unless starting fresh.

### Migration List (already applied)
| # | File | Purpose |
|---|------|---------|
| 1 | `00001_initial_schema.sql` | Full schema: profiles, courses, modules, quizzes, chapters, chat, notifications, news, etc. |
| 2 | `00002_rls_policies.sql` | Row-level security policies for all tables |
| 3 | `00003_seed_courses.sql` | Seed 3 courses + 12 modules + 12 quizzes |
| 4 | `00004_fix_points_rls.sql` | Fix points_log RLS for user inserts |
| 5 | `00005_account_deletion.sql` | `delete_own_account()` RPC function |
| 6 | `00006_avatars_storage.sql` | Avatars storage bucket + policies |
| 7 | `00007_news_wp_unique.sql` | Partial unique index on news.wp_post_id |
| 8 | `00008_chapter_points_trigger.sql` | Auto-update chapter total_points on points_log insert |
| 9 | `00009_ambassador_course_flag.sql` | `is_ambassador_course` boolean on courses table |
| 10 | `00010_lobby_active_constraint.sql` | Only one active lobby event at a time |
| 11 | `00011_news_wp_constraint_fix.sql` | Proper UNIQUE constraint on wp_post_id |
| 12 | `00012_seed_chat_channels.sql` | Seed 5 default chat channels |

### Key Tables
`profiles`, `chapters`, `courses`, `modules`, `quizzes`, `user_progress`, `points_log`, `chat_channels`, `chat_messages`, `notifications`, `action_alerts`, `alert_responses`, `lobby_events`, `ambassador_agreements`, `news`, `menu_items`, `activity_reports`, `local_businesses`

---

## Feature Map

### Mobile App (17 screens)

**Tabs:**
- **Home** — Hero banner, greeting, quick actions, action alerts, lobby day, featured course, latest news
- **Academy** — Course list by track (Drug Ed / Onboarding), progress bars, module viewer, quizzes
- **Shop** — Category cards linking to ssdp.org/shop (WooCommerce deferred)
- **Chat** — 8 channels with realtime messaging, role-gated access
- **More** — Profile, notifications, points history, reports, news feed, privacy policy

**Auth:** Welcome, Login, Register, Guest mode

**Modals:** Action alert detail, Lobby event schedule, Ambassador agreement

### Admin Dashboard (13 pages + 2 APIs)

**Pages:** Dashboard, Courses (with module/quiz editor), Users, News (WordPress sync), Menu editor, Chapters, Ambassadors, Chat channels, Notifications (push-enabled), Reports, Alerts, Lobby Day events

**APIs:**
- `POST /api/send-push` — Send push notifications via Expo Push API + create in-app notifications
- `POST /api/sync-news` — Sync articles from ssdp.org WordPress

---

## Brand

| Token | Value |
|-------|-------|
| Navy | `#003249` |
| Blue | `#136F8D` |
| Teal | `#17BEBB` |
| Orange | `#FAA732` |
| Chartreuse | `#DAF702` |
| Gray | `#636467` |
| Heading Font | Montserrat 700 Bold |
| Body Font | Open Sans 400/600/700 |

---

## Remaining Work

### Needs External Inputs
- **EAS Builds** — Run `eas login` then `eas build` for iOS/Android
- **WooCommerce** — Needs API credentials from SSDP for in-app shop
- **Campus Gradebook** — Needs data from SSDP
- **Expungement Guide** — Needs approved content from SSDP
- **Apple Developer Account** — Required for TestFlight / App Store
- **Privacy Policy URL** — Publish at ssdp.org/app-privacy for store compliance

### Store Submission Checklist
- [ ] EAS login + first build (`eas build --platform all`)
- [ ] App Store screenshots (6.7" iPhone, 12.9" iPad)
- [ ] App Store description & keywords
- [ ] Content rating: 17+ (drug education context)
- [ ] Reviewer notes explaining 501(c)(3) nonprofit educational mission
- [ ] Privacy policy URL
- [ ] Google Play data safety section
