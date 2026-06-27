# JetHealth

AI-powered health triage and care-navigation system for the Lazio region (Rome, Italy). Describes symptoms, assesses urgency, and suggests the most appropriate next step — from self-care to emergency department — with a real-time map of nearby facilities.

## Features

- **AI Triage** — Describe symptoms in free text; the system asks clarifying questions and classifies urgency (low / medium / high / emergency) using OpenAI GPT-4o
- **Red Flag Detection** — Deterministic rule-based engine catches emergencies instantly before AI is called
- **Facility Finder** — Real-time query to Salute Lazio API showing nearby Pronto Soccorso on an OpenStreetMap
- **Composite Ranking** — Facilities ranked by distance and clinical match
- **PDF Report** — Downloadable medical summary (jsPDF, client-side)
- **Triage History** — Saved sessions (with user consent)
- **Admin Panel** — Dashboard with triage analytics, user management, configurable AI settings, API monitoring
- **Docker Ready** — Single-container deployment, Supabase is cloud-hosted

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Framework | Next.js 16 (App Router, RSC) |
| Language | TypeScript |
| UI | Shadcn UI + Tailwind CSS v4 |
| AI | OpenAI API (GPT-4o) |
| Database | Supabase PostgreSQL (RLS) |
| Auth | Supabase Auth (email + password) |
| Maps | Leaflet + React-Leaflet + OpenStreetMap |
| Facilities API | server.salutelazio.it |
| PDF | jsPDF |
| Validation | Zod |
| Deployment | Docker (standalone) |

## Getting Started

### Prerequisites

- Node.js 22+
- A Supabase project (cloud)
- An OpenAI API key

### Installation

```bash
git clone <repo-url> && cd jethealth
npm install
cp .env.example .env.local
# Fill in your keys in .env.local
```

### Environment Variables

```
NEXT_PUBLIC_SUPABASE_URL=https://xxxxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJ...
SUPABASE_SERVICE_ROLE_KEY=eyJ...
OPENAI_API_KEY=sk-...
```

### Database Setup

The schema is applied via Supabase migrations (already run on the cloud project). Tables use the `jh_` prefix:

- `jh_profiles` — User profiles
- `jh_app_settings` — Admin-configurable settings
- `jh_triage_history` — Saved triage results
- `jh_feedback` — User feedback (1-5 stars)
- `jh_api_call_logs` — External API call monitoring

### Bootstrap Admin

```bash
curl -X POST http://localhost:3000/api/setup
```

Creates the first admin account: `admin@jethealth.it` / `admin`

### Run Development Server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

### Docker

```bash
docker compose up --build
```

## Project Structure

```
src/
├── app/
│   ├── page.tsx                    # Landing page
│   ├── auth/                       # Login, Register, Forgot Password
│   ├── (protected)/                # Auth-required routes
│   │   ├── dashboard/              # User home
│   │   ├── triage/                 # Symptom intake + clarify flow
│   │   ├── results/                # Triage results + emergency
│   │   ├── facilities/             # Map + ranked list
│   │   ├── history/                # Past triages
│   │   └── profile/                # User settings
│   ├── admin/                      # Admin panel
│   │   ├── dashboard/              # Analytics
│   │   ├── users/                  # User management
│   │   ├── settings/               # App configuration
│   │   └── api-monitor/            # API call logs
│   └── api/
│       ├── triage/                 # POST: clarify + classify
│       ├── facilities/             # GET: search + rank
│       └── setup/                  # POST: bootstrap admin
├── components/
│   ├── ui/                         # Shadcn components
│   └── facility-map.tsx            # Leaflet map component
├── lib/
│   ├── supabase/                   # Client, server, middleware
│   ├── openai-triage.ts            # OpenAI classification
│   ├── triage-engine.ts            # Rule-based red-flag detection
│   ├── triage-schema.ts            # Zod schemas
│   ├── lazio-api.ts                # Salute Lazio API adapter
│   ├── facility-ranking.ts         # Composite ranking algorithm
│   └── pdf-export.ts               # jsPDF generation
└── middleware.ts                   # Auth guard
```

## Safety & Compliance

- Does NOT provide diagnoses — only health navigation guidance
- Conservative: escalates in case of doubt
- Consent collected at registration; data saved only if user agrees
- Account deletion removes all associated data (GDPR)
- Medical disclaimer on every page
- API logs contain only technical metadata, never symptom data

## License

MIT
