# JetHealth — Agent guide

The application lives in [`jethealth/`](./jethealth). It is a Next.js 15/16 App Router app
(TypeScript, Tailwind v4, shadcn/ui) for prudent health triage and care-navigation in
Lazio. Standard scripts are in `jethealth/package.json` (`dev`, `build`, `start`, `lint`)
and setup details are in `jethealth/README.md`. The repo root also contains the original
static prototype in `frontend/` and the build specs `plan.md` / `prompt.md`.

## Cursor Cloud specific instructions

The dev environment uses a **local Supabase stack** (Auth + Postgres) running in Docker —
the production target is Supabase Cloud, but locally everything runs on the VM. Docker and
the Supabase CLI are preinstalled in the VM image; the update script only refreshes npm
deps. Before running or testing the app you must start these services (they are NOT started
by the update script):

1. **Start the Docker daemon** (no systemd in this VM):
   `sudo dockerd > /tmp/dockerd.log 2>&1 &` then wait until `sudo docker info` succeeds.
   `/etc/docker/daemon.json` is configured with `storage-driver: fuse-overlayfs` and
   `features.containerd-snapshotter: false` — this combination is required for Docker to
   work inside the Firecracker VM. Do not change it.
2. **Start Supabase** from the app dir: `cd jethealth && supabase start` (first run pulls
   images; subsequent runs are fast). Get credentials with `supabase status -o env`.
3. **`.env.local`** (gitignored) must contain `NEXT_PUBLIC_SUPABASE_URL`,
   `NEXT_PUBLIC_SUPABASE_ANON_KEY`, `SUPABASE_SERVICE_ROLE_KEY` from `supabase status -o env`,
   plus optional `OPENAI_API_KEY`. If it is missing, recreate it from those values.
4. **Apply DB migrations**: `supabase migration up` (or `supabase db reset` to rebuild from
   scratch — this wipes data). Migrations are in `jethealth/supabase/migrations/`.
5. **Run the app**: `cd jethealth && npm run dev` (http://localhost:3000).
6. **Bootstrap the admin** once per fresh DB: `curl -X POST http://localhost:3000/api/setup`
   creates `admin@jethealth.it` / `admin` (only works when no admin exists yet).

Non-obvious gotchas:
- **OpenAI is optional in dev.** If `OPENAI_API_KEY` is empty, `runTriage` falls back to the
  deterministic rule-based classifier in `src/lib/triage-engine.ts`, so the full flow still
  works without a paid key. Rule-based red-flag detection always runs first and short-circuits
  emergencies before any OpenAI call.
- **Email confirmations are disabled** in `supabase/config.toml` for local dev, so
  registration immediately returns a session (no inbox step). Confirmation emails in local
  mode would otherwise land in Mailpit (http://127.0.0.1:54324).
- **RLS + grants**: migration `002_grants.sql` grants table privileges to the Supabase roles;
  without it the service-role client hits `permission denied for table profiles`. Keep it.
- **API routes are excluded** from the auth-redirect in `src/lib/supabase/middleware.ts`
  (they return 401 themselves); don't reintroduce redirects for `/api/*`.
- The SaluteLazio facilities API requires `page>=1` and the `origin`/`referer: salutelazio.it`
  headers (handled in `src/lib/lazio-api.ts`); it exposes no live waiting times.
