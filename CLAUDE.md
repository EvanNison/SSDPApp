# SSDP App — Project Instructions

## What This Is
SSDP (Students for Sensible Drug Policy) conference app with two components:
- **`ssdp-admin/`** — Next.js 15 admin dashboard (Tailwind CSS v4, App Router)
- **`ssdp-app/`** — Expo React Native mobile app (TypeScript, Expo Router, NativeWind, Zustand)
- **Backend** — Supabase (Postgres, Auth, Storage, Realtime)

## Supabase
- **Project ref:** `rsyofdcqshwnbxhhcgdh`
- **Dashboard:** https://supabase.com/dashboard/project/rsyofdcqshwnbxhhcgdh
- All 12 migrations in `ssdp-app/supabase/migrations/` are already applied to production
- The admin uses a **service role key** (`supabase-admin.ts`) for server-side writes that bypass RLS
- The mobile app uses the **anon key** and relies on RLS policies

## Environment Variables

### ssdp-admin/.env.local (3 required)
```
NEXT_PUBLIC_SUPABASE_URL=https://rsyofdcqshwnbxhhcgdh.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=<from Supabase Settings > API>
SUPABASE_SERVICE_ROLE_KEY=<from Supabase Settings > API — KEEP SECRET>
```

### ssdp-app/.env (2 required)
```
EXPO_PUBLIC_SUPABASE_URL=https://rsyofdcqshwnbxhhcgdh.supabase.co
EXPO_PUBLIC_SUPABASE_ANON_KEY=<from Supabase Settings > API>
```

## Running Locally

```bash
# Admin dashboard
cd ssdp-admin && npm install && npm run dev    # → http://localhost:3000

# Mobile app
cd ssdp-app && npm install && npx expo start --web   # → http://localhost:8081
```

## Key Architecture Decisions
- **NativeWind** (Tailwind for RN) — use `className` on RN components, but Image height/width must use `style={{ }}` not className on web
- **Zustand** for global state — `ssdp-app/stores/useStore.ts` holds session, profile, guest mode
- **Service role key** — only used server-side in `ssdp-admin/src/lib/supabase-admin.ts` for bypassing RLS (news sync, push notifications)
- **PostgREST upsert** — requires proper UNIQUE constraints, not partial indexes with WHERE clauses
- **Expo Push** — tokens stored in `profiles.push_token`, sent via `https://exp.host/--/api/v2/push/send`

## Brand Colors
- Navy: `#003249`, Blue: `#136F8D`, Teal: `#17BEBB`
- Orange: `#FAA732`, Chartreuse: `#DAF702`, Gray: `#636467`
- Fonts: Montserrat 700 (headings), Open Sans 400/600/700 (body)

## Admin Login
- Email: `evan@nisonco.com` / Password: `SSDPadmin2026!`

## Important Files
- `ssdp-app/types/database.ts` — All TypeScript types matching DB schema
- `ssdp-app/constants/config.ts` — App config (roles, Supabase URL, WooCommerce)
- `ssdp-app/constants/Colors.ts` — Brand color exports
- `ssdp-admin/src/components/Sidebar.tsx` — Admin navigation (13 pages)
- `ssdp-admin/src/components/MarkdownEditor.tsx` — Tiptap rich text editor

## What's Done
All code for Releases 1-3 is complete. 34 total screens (17 mobile + 17 admin). Features:
- Auth (register/login/guest), role-based access, ambassador onboarding flow
- 3 courses with 12 modules + 12 quizzes + points system
- Chat (8 channels, realtime), News (WordPress sync), Push notifications
- Action alerts, Lobby Day events, account deletion, offline caching, privacy policy

## What Still Needs External Inputs
- **EAS Builds**: `npx eas login` then `npx eas build --platform all`
- **WooCommerce API keys** from SSDP for in-app shop
- **Campus gradebook data** from SSDP
- **Expungement guide content** from SSDP
- **Apple Developer account** for iOS builds
- **App store metadata**: screenshots, descriptions, reviewer notes
