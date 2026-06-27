# JetHealth - Architecture & Decisions

## Key Architectural Decisions

### Database
- **Supabase Cloud** (PostgreSQL) - project `htxlqassurrrajnlefyb`
- All tables use `jh_` prefix (e.g., `jh_profiles`, `jh_triage_history`)
- RLS enabled on all tables with helper function `is_admin()`
- Trigger `handle_new_user()` auto-creates profile on auth.users INSERT

### Authentication
- Supabase Auth with email+password
- Consent to data storage is collected at registration (stored in `jh_profiles.consent_data_storage`)
- Middleware refreshes tokens and guards routes:
  - Public: `/`, `/auth/*`
  - Protected: `/(protected)/*` 
  - Admin: `/admin/*` (requires `role = 'admin'` in jh_profiles)
- Bootstrap endpoint: `POST /api/setup` creates first admin (admin@jethealth.it / admin)

### AI Triage Flow
1. User describes symptoms (free text or quick examples)
2. `POST /api/triage` action="clarify" → red-flag check → OpenAI generates 3-4 questions
3. User answers clarifying questions (multi-select buttons)
4. `POST /api/triage` action="classify" → red-flag check → OpenAI final triage
5. Result: urgencyLevel (low/medium/high/emergency), actionLabel, explanation, nextSteps, watchFor, specialtyNeeds, confidence

### Red Flag Engine
- Rule-based (deterministic) runs BEFORE OpenAI
- Catches: chest pain, breathing difficulty, loss of consciousness, stroke signs, hemorrhage, seizures, anaphylaxis
- If triggered → immediate emergency screen, skips OpenAI

### Facilities
- API: `server.salutelazio.it` (proxied server-side to avoid CORS)
- Facility types: 006 = Pronto Soccorso
- Ranking: composite score (clinical match 40-55% + distance 30% + availability 15-30%)
- KNOWN LIMITATION: no public waiting time data from API
- Maps: Leaflet + OpenStreetMap tiles (no API key needed)

### PDF Export
- Client-side with jsPDF
- Contains: patient info, symptoms, triage result, recommended action, disclaimer
- No server storage of PDF

### Admin Panel
- Dashboard: triage stats, urgency distribution, user count, avg feedback
- Users: list, roles visible
- Settings: configurable AI model, API URL, search radius, disclaimer text (stored in `jh_app_settings`)
- API Monitor: logs of all external API calls (OpenAI, SaluteLazio)

## Tech Stack
- Next.js 16 (App Router, RSC, Server Actions)
- TypeScript
- Shadcn UI + Tailwind CSS v4
- Supabase (PostgreSQL + Auth + RLS)
- OpenAI API (gpt-4o)
- Leaflet + react-leaflet + OSM
- jsPDF
- Zod validation
- Docker (standalone output)

## Environment Variables
```
NEXT_PUBLIC_SUPABASE_URL
NEXT_PUBLIC_SUPABASE_ANON_KEY
SUPABASE_SERVICE_ROLE_KEY
OPENAI_API_KEY
```

## Tables (jh_ prefix)
- `jh_profiles` - user profiles (extends auth.users)
- `jh_app_settings` - admin-configurable settings
- `jh_triage_history` - saved triage results (if consent given)
- `jh_feedback` - 1-5 star ratings post-triage
- `jh_api_call_logs` - technical API monitoring logs
