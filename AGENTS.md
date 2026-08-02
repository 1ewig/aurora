# AGENTS.md

<!-- INSFORGE:START -->
## InsForge backend

This project uses [InsForge](https://insforge.dev): an all-in-one, open-source Postgres-based backend (BaaS) that gives this app a database, authentication, file storage, edge functions, realtime, an AI model gateway, and payments through one platform.

- **Project:** **Aurora** (API base `https://4eu5wk8i.us-east.insforge.app`)
- **Skills:** these InsForge skills are installed for supported coding agents. Reach for them before implementing any InsForge feature instead of guessing the API:
  - `insforge`: app code with the `@insforge/sdk` client (database CRUD, auth, storage, edge functions, realtime, AI, email, and Stripe payments).
  - `insforge-cli`: backend and infrastructure via the `insforge` CLI (projects, SQL, migrations, RLS policies, storage buckets, functions, secrets, payment setup, schedules, deploys).
  - `insforge-debug`: diagnosing failures (SDK/HTTP errors, RLS denials, auth and OAuth issues) and running security or performance audits.
  - `insforge-integrations`: wiring external auth providers (Clerk, Auth0, WorkOS, Better Auth, etc.) for JWT-based RLS, or the OKX x402 payment facilitator.
  - `find-skills`: discovering additional skills on demand.
- **Credentials:** app code reads keys from `.env.local`; the CLI reads `.insforge/project.json`. Never hardcode or commit keys.

Key patterns:

- Database inserts take an array: `insert([{ ... }])`.
- Reference users with `auth.users(id)`; use `auth.uid()` in RLS policies.
- For storage uploads, persist both the returned `url` and `key`.
<!-- INSFORGE:END -->

## Runtime & Commands

- **Use `bun`**, not npm/pnpm
- `bun run dev` — dev server
- `bun run build` — builds + typechecks (no separate `typecheck` command)
- `bun run lint` — ESLint
- `bun run test` — Vitest (single run), tests in `__tests__/`
- `bun run test -- __tests__/api/categories.test.ts` — single test file
- `bun run test:watch` — Vitest watch mode

## Architecture

- **`docs/SUMMARY.md` is the single architecture reference** — read it before modifying anything: mental model, domain models, routing, API map, and the mandatory conventions in §9. Keep it in sync when architecture, routes, or schema change.
- **4-layer unidirectional**: Page (server) → `XxxClient.tsx` (client bridge) → Hooks/Stores → Presentational (pure props, zero store/hook imports)
- **`@/` alias** → `src/`
- **No ORM**: raw `pg` Pool via `@/utils/db`, parameterized `$1, $2`
- **Auth**: Better Auth handles auth (email/password), *not* InsForge auth
- **Guest checkout is default**: `orders.user_id` is nullable

## Middleware Caveat

`src/proxy.ts` is named `proxy.ts` and exports `proxy`, not `middleware.ts` / `middleware`. It is **not active** as Next.js middleware. To activate: rename to `middleware.ts` and export as `middleware`.

## InsForge Usage

- Used for: Postgres DB, object storage (5 buckets: `product-media`, `lookbook-media`, `editorial-media`, `material-media`, `category-media`), JWT bridge for client auth
- Dual clients: `src/lib/insforge.ts` (browser with auto JWT refresh) vs `src/lib/insforge.server.ts` (server)

## Verification Order

`bun run lint` → `bun run test` → `bun run build`

## Testing

- Vitest 4, config in `vitest.config.ts`
- 21 test files across `__tests__/api/` (12), `__tests__/stores/` (2), `__tests__/utils/` (7)
- Tests mock the DB via `vi.mock` (shared helpers in `__tests__/utils/mocks.ts`) — no live database required

## .gitignore

Excludes `.insforge` and all AI agent config dirs (`.agent`, `.claude`, `.github/copilot*`, etc.).
