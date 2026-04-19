# sitio-dashboard

Staff-facing **SPA** for **Sítio** — feature **001-school-trip-payments**: schools → school trips → trip detail (passengers, payments, status). Built with TanStack Start (**SPA / client-rendered**), TanStack Router, and shadcn/ui (Base UI preset). Specs live in the sibling design-notes repo.

## Environment

| Variable         | Description |
|------------------|-------------|
| `VITE_API_URL`   | Base URL of the Nest API **including** the `/api` global prefix, no trailing slash (matches OpenAPI `servers`). Example: `http://localhost:3000/api`. Used by `src/lib/api-client.ts`. |

Copy `.env.example` to `.env` and adjust if your API runs on another host or port.

Example:

```bash
VITE_API_URL=http://localhost:3000/api
```

**Note:** The Vite dev server defaults to port **5173** (`vite.config.ts`) so it does not clash with the API on **3000**.

## Scripts

```bash
pnpm install
pnpm run dev         # Vite dev server
pnpm run build
pnpm run preview
pnpm run test        # Vitest (see vite.config.ts `test`; uses `--pool=forks`)
pnpm run typecheck
pnpm run lint        # Biome check + format fixes
pnpm run format      # Biome format only
```

## Stack

- TanStack Start (template + shadcn preset `b1Fk0lmym`, base **base**), client-rendered SPA

### Wix payment events (mock)

The school-scoped **Integração Wix** screen (`/schools/:schoolId/integrations/wix`) uses the same `ListDetailLayout` list–detail shell as Trips: list column (keys + table) and detail column (selected event payload). Narrow detail when nothing is selected matches the M3 list–detail pattern used elsewhere in the app.
- TanStack Query (`QueryClientProvider` in `src/routes/__root.tsx`), Zustand (theme + UI toggles), Zod (DTOs in `src/lib/schemas/`)
- TypeScript **strict** (`tsconfig.json`)
- Tailwind CSS v4, Biome for lint/format

## Design references

- [Quickstart](../sitio-design-notes/specs/001-school-trip-payments/quickstart.md) (sibling repo under the same parent folder as this repo)
- OpenAPI: `sitio-design-notes/specs/001-school-trip-payments/contracts/openapi.yaml`

## Scaffold

Initialized with:

```bash
pnpm dlx shadcn@latest init --preset b1Fk0lmym --base base --template start -y -n sitio-dashboard
```

(Project files live at this repo root; TanStack Form wiring follows in later user-story tasks.)
