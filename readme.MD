# sitio-dashboard

Staff-facing **SPA** for **Sítio** — feature **001-school-trip-payments**: schools → school trips → trip detail (passengers, payments, status). Built with TanStack Start (**SPA / client-rendered**), TanStack Router, and shadcn/ui (Base UI preset). Specs live in the sibling design-notes repo.

## Environment

| Variable         | Description |
|------------------|-------------|
| `VITE_API_URL`   | Base URL of the Nest API (no trailing slash), e.g. `http://localhost:3000`. Used by the dashboard client for fetch calls (wired in depth in Phase 2). |

Example `.env` / shell:

```bash
VITE_API_URL=http://localhost:3000
```

**Note:** The dev server may use port **3000** by default; align API port or set `VITE_API_URL` to the backend’s actual origin.

## Scripts

```bash
pnpm install
pnpm run dev         # Vite dev server
pnpm run build
pnpm run preview
pnpm run test        # Vitest
pnpm run typecheck
pnpm run lint        # Biome check + format fixes
pnpm run format      # Biome format only
```

## Stack

- TanStack Start (template + shadcn preset `b1Fk0lmym`, base **base**)
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

(Project files live at this repo root; TanStack Query, Form, Zustand, and API client wiring follow in Phase 2.)
