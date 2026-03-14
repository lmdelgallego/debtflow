# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

DebtFlow is a micro-SaaS for managing personal debts using the avalanche method. It helps users track incomes, expenses, and debts to calculate available monthly cash flow and recommend optimal payment order. The UI is in Spanish.

## Monorepo Structure

```
debtflow/
├── apps/
│   ├── web/          → Next.js 16 (frontend web)
│   ├── api/          → NestJS (backend REST API)
│   └── mobile/       → Expo React Native
├── packages/
│   ├── types/        → Shared TypeScript interfaces (@debtflow/types)
│   ├── utils/        → Pure business logic (@debtflow/utils)
│   ├── validators/   → Zod schemas (@debtflow/validators)
│   ├── api-client/   → Typed HTTP client (@debtflow/api-client)
│   └── config/       → Shared TSConfig bases
├── turbo.json
├── package.json      → Root workspace config
└── pnpm-workspace.yaml
```

## Commands

```bash
# Root (Turborepo)
pnpm dev              # Start all dev servers
pnpm build            # Production build all
pnpm lint             # Run ESLint across workspace
pnpm typecheck        # TypeScript type checking

# Filtered
pnpm dev:web          # Start web dev server (localhost:3000)
pnpm dev:api          # Start API dev server (localhost:3001)
pnpm dev:mobile       # Start Expo dev server

# Within apps/web
pnpm --filter @debtflow/web dev
pnpm --filter @debtflow/web build
pnpm --filter @debtflow/web lint --fix
pnpm --filter @debtflow/web typecheck
```

## Tech Stack

### Web (`apps/web`)
- **Framework:** Next.js 16 (App Router, React 19, TypeScript)
- **Auth:** Supabase SSR (cookie-based sessions via @supabase/ssr)
- **UI:** shadcn/ui (new-york style) + Radix UI + Tailwind CSS 4 (OKLCh colors)
- **Forms:** React Hook Form + Zod validation (schemas from @debtflow/validators)
- **Charts:** Recharts

### API (`apps/api`)
- **Framework:** NestJS 11
- **Auth:** JWT verification via Supabase `auth.getUser(token)`
- **Database:** Supabase PostgreSQL (service_role_key)
- **Validation:** @debtflow/validators (Zod schemas)

### Mobile (`apps/mobile`)
- **Framework:** Expo (React Native) with Expo Router
- **Auth:** Supabase with AsyncStorage
- **Data:** @debtflow/api-client

### Shared Packages
- **@debtflow/types:** Zero-dep TypeScript interfaces (Income, Expense, Debt, Avalanche, Payoff, API response generics)
- **@debtflow/utils:** Pure business logic (calculateAvalanche, payoff projections, date utils)
- **@debtflow/validators:** Zod schemas (income, expense, debt, auth forms)
- **@debtflow/api-client:** Typed HTTP client wrapping the NestJS API (uses native fetch)
- **@debtflow/config:** Shared TSConfig bases
- **Package Manager:** pnpm with workspaces + Turborepo

## Architecture

### Web Routing (App Router with Route Groups)

- `apps/web/app/(auth)/` — Auth pages (signin, signup) with centered layout
- `apps/web/app/(root)/` — Protected app pages with Navbar + Sidebar layout
  - `(pages)/dashboard/` — Main dashboard
  - `(pages)/incomes/` — Income management (full CRUD, charts, statistics)
  - `(pages)/expenses/` — Expense management
- `apps/web/app/instruments/` — Debt instruments page

### Web Key Directories

- `apps/web/components/ui/` — shadcn/Radix primitives
- `apps/web/components/incomes/`, `expenses/`, `debts/` — Feature components
- `apps/web/lib/supabase/` — Supabase clients (server, browser, middleware)
- `apps/web/lib/actions/` — Server actions (`{feature}.action.ts`)
- `apps/web/context/` — React Context providers (auth-context.tsx)

### API Structure (NestJS)

- `apps/api/src/common/guards/auth.guard.ts` — JWT verification
- `apps/api/src/common/decorators/current-user.ts` — @CurrentUser() decorator
- `apps/api/src/common/supabase/` — Supabase service (service_role_key)
- `apps/api/src/{incomes,expenses,debts,dashboard}/` — Feature modules (controller + service)

### API Endpoints

| Method | Route | Description |
|--------|-------|-------------|
| GET | /api/incomes | Paginated list |
| GET | /api/incomes/all | All (unpaginated) |
| POST | /api/incomes | Create |
| PATCH | /api/incomes/:id | Update |
| DELETE | /api/incomes/:id | Delete |
| GET | /api/expenses | Paginated list |
| GET | /api/expenses/all | All (unpaginated) |
| POST | /api/expenses | Create |
| PATCH | /api/expenses/:id | Update |
| DELETE | /api/expenses/:id | Delete |
| POST | /api/expenses/sync-recurring | Sync recurring expenses |
| GET | /api/debts | Paginated list |
| GET | /api/debts/all | All (unpaginated) |
| POST | /api/debts | Create |
| PATCH | /api/debts/:id | Update |
| DELETE | /api/debts/:id | Delete |
| POST | /api/debts/:id/pay | Pay debt |
| GET | /api/dashboard/summary | Dashboard summary |

### Auth Flow

**Web:** Middleware (`middleware.ts`) guards routes. `AuthContext` provides `useAuth()` hook. Supabase SSR with cookies.

**API:** `AuthGuard` extracts Bearer token from Authorization header, verifies via `supabase.auth.getUser(token)`, attaches user to request.

**Mobile:** Supabase with AsyncStorage for persisted sessions. Token passed to api-client automatically.

### Data Flow Pattern

**Web (current):** Components call server actions → Supabase queries → return `{ data, error }` tuples.

**API:** Controllers → Services → Supabase queries. Services throw on error, NestJS handles HTTP responses.

**Mobile/Future web:** Components → api-client → NestJS API → Supabase.

### Form Pattern

Forms use React Hook Form + shared Zod schemas from @debtflow/validators:
```tsx
import { incomeSchema, type IncomeFormValues } from '@debtflow/validators'
const form = useForm<IncomeFormValues>({
  resolver: zodResolver(incomeSchema),
  defaultValues: { ... }
})
```

### Toast System

Custom toast implementation in `apps/web/components/ui/Toast.tsx` using React Context. Usage: `const { addToast } = useToast()` then `addToast(message, 'success' | 'error' | 'warning' | 'info')`.

## Environment Variables

### Web (`apps/web/.env.local`)
```
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY=
```

### API (`apps/api/.env`)
```
SUPABASE_URL=
SUPABASE_SERVICE_ROLE_KEY=
PORT=3001
CORS_ORIGIN=http://localhost:3000
```

### Mobile (`apps/mobile/.env`)
```
EXPO_PUBLIC_SUPABASE_URL=
EXPO_PUBLIC_SUPABASE_PUBLISHABLE_KEY=
EXPO_PUBLIC_API_URL=http://localhost:3001
```

## Styling (Web)

Dark mode by default. CSS variables defined in `globals.css` using OKLCh color space. Use the `cn()` utility from `lib/utils.ts` for merging Tailwind classes. Components follow shadcn/ui patterns.

## Path Aliases

- **Web:** `@/*` maps to `apps/web/*`
- **Mobile:** `@/*` maps to `apps/mobile/*`

## Database

Uses Supabase PostgreSQL directly (no ORM). All queries go through `@supabase/supabase-js`.
