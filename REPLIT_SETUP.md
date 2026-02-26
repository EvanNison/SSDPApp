# Replit Setup Guide

## Step 1: Import from GitHub

1. Create a new Replit from GitHub
2. Import this repository
3. It will auto-detect the `.replit` config and use Node.js 20

## Step 2: Add Secrets

In Replit, go to **Tools > Secrets** and add these environment variables:

### For Admin Dashboard (ssdp-admin)

| Key | Value | Where to Find |
|-----|-------|---------------|
| `NEXT_PUBLIC_SUPABASE_URL` | `https://rsyofdcqshwnbxhhcgdh.supabase.co` | Supabase Dashboard > Settings > API |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | *(JWT starting with eyJ...)* | Supabase Dashboard > Settings > API > `anon` `public` |
| `SUPABASE_SERVICE_ROLE_KEY` | *(JWT starting with eyJ...)* | Supabase Dashboard > Settings > API > `service_role` **KEEP SECRET** |

### For Mobile App (ssdp-app) — only if running mobile from Replit

| Key | Value | Where to Find |
|-----|-------|---------------|
| `EXPO_PUBLIC_SUPABASE_URL` | `https://rsyofdcqshwnbxhhcgdh.supabase.co` | Same as above |
| `EXPO_PUBLIC_SUPABASE_ANON_KEY` | *(same anon key as above)* | Same as above |

**Important:** Replit secrets are automatically available as environment variables. Next.js will pick up `NEXT_PUBLIC_*` vars automatically.

## Step 3: Create .env Files

Replit secrets work for most things, but Next.js also reads `.env.local`. In the Replit shell:

```bash
# Create admin env file
cat > ssdp-admin/.env.local << 'EOF'
NEXT_PUBLIC_SUPABASE_URL=https://rsyofdcqshwnbxhhcgdh.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=<paste your anon key>
SUPABASE_SERVICE_ROLE_KEY=<paste your service role key>
EOF

# Create mobile app env file (if running mobile)
cat > ssdp-app/.env << 'EOF'
EXPO_PUBLIC_SUPABASE_URL=https://rsyofdcqshwnbxhhcgdh.supabase.co
EXPO_PUBLIC_SUPABASE_ANON_KEY=<paste your anon key>
EOF
```

## Step 4: Install & Run

The `.replit` file auto-runs the admin dashboard. If it doesn't start:

```bash
cd ssdp-admin && npm install && npm run dev
```

For the mobile app in a separate shell tab:

```bash
cd ssdp-app && npm install && npx expo start --web
```

## Step 5: Verify

1. **Admin:** Open the Replit webview — should show login page
2. **Login:** `evan@nisonco.com` / `SSDPadmin2026!`
3. **Check:** Dashboard shows 2 users, Courses shows 3 courses, News shows 10 articles

## Supabase Keys Reference

All keys are in the Supabase dashboard:
**https://supabase.com/dashboard/project/rsyofdcqshwnbxhhcgdh/settings/api**

- **Project URL:** `https://rsyofdcqshwnbxhhcgdh.supabase.co`
- **anon/public key:** Used by both admin (NEXT_PUBLIC_) and mobile (EXPO_PUBLIC_)
- **service_role key:** Used ONLY by admin server-side code — never expose to client

## Database

All migrations are already applied to Supabase. No database setup needed.

If you ever need to run new migrations:
```bash
cd ssdp-app && npx supabase db push --linked
```

## Project Structure

```
SSDPApp/
├── ssdp-admin/          # Next.js 15 admin dashboard
│   ├── src/app/         # App Router pages
│   │   ├── (dashboard)/ # 13 admin pages
│   │   ├── api/         # 2 API routes (send-push, sync-news)
│   │   └── login/       # Auth page
│   ├── src/components/  # Sidebar, MarkdownEditor
│   └── src/lib/         # Supabase clients (anon + admin)
│
├── ssdp-app/            # Expo React Native mobile app
│   ├── app/             # Expo Router file-based routing
│   │   ├── (auth)/      # Welcome, Login, Register
│   │   ├── (tabs)/      # Home, Academy, Shop, Chat, More
│   │   ├── alert/       # Action alert detail modal
│   │   └── lobby/       # Lobby event detail modal
│   ├── lib/             # Supabase, auth, points, cache, notifications
│   ├── stores/          # Zustand global state
│   ├── types/           # TypeScript types
│   └── supabase/        # Migration files (already applied)
│
├── CLAUDE.md            # AI assistant context
├── README.md            # Full project documentation
├── .replit              # Replit run configuration
└── replit.nix           # Nix dependencies (Node.js 20)
```

## Troubleshooting

**"Failed to fetch" errors:** Check that `.env.local` exists with correct keys

**Build errors:** Run `npx tsc --noEmit` in the relevant directory to check types

**WordPress sync returns 0:** Make sure `SUPABASE_SERVICE_ROLE_KEY` is set in `.env.local`

**Push notifications not sending:** The Expo Push API requires real device tokens — won't work in web/simulator
