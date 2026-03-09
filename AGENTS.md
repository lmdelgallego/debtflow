# AGENTS.md

This file provides guidance to Codex (Codex.ai/code) when working with code in this repository.

## Project Overview

DebtFlow is a micro-SaaS for managing personal debts using the avalanche method. It helps users track incomes, expenses, and debts to calculate available monthly cash flow and recommend optimal payment order. The UI is in Spanish.

## Commands

```bash
pnpm dev          # Start dev server (localhost:3000)
pnpm build        # Production build
pnpm lint         # Run ESLint
pnpm lint --fix   # Fix ESLint issues
pnpm typecheck    # TypeScript type checking (tsc --noEmit)
```

## Tech Stack

- **Framework:** Next.js 16 (App Router, React 19, TypeScript)
- **Auth & Database:** Supabase (Auth + PostgreSQL), cookie-based sessions via @supabase/ssr
- **UI:** shadcn/ui (new-york style) + Radix UI + Tailwind CSS 4 (OKLCh colors)
- **Forms:** React Hook Form + Zod validation
- **Charts:** Recharts
- **Package Manager:** pnpm

## Architecture

### Routing (App Router with Route Groups)

- `app/(auth)/` — Auth pages (signin, signup) with centered layout
- `app/(root)/` — Protected app pages with Navbar + Sidebar layout
  - `(pages)/dashboard/` — Main dashboard
  - `(pages)/incomes/` — Income management (full CRUD, charts, statistics)
  - `(pages)/expenses/` — Expense management
- `app/instruments/` — Debt instruments page

### Key Directories

- `components/ui/` — shadcn/Radix primitives (button, card, dialog, form, etc.)
- `components/incomes/`, `components/expenses/` — Feature-specific components
- `lib/supabase/` — Supabase clients: `server.ts` (server components), `client.ts` (browser), `middleware.ts` (session refresh)
- `lib/actions/` — Server actions for data mutations (`{feature}.action.ts` naming)
- `context/` — React Context providers (auth-context.tsx)
- `constants/` — App constants (sidebar nav links)
- `types/` — Shared TypeScript interfaces

### Auth Flow

Middleware (`middleware.ts`) guards all routes. Public paths: `/`, `/signin`, `/signup`, `/auth/callback`. Unauthenticated users redirect to `/signin?next=...`. Authenticated users on auth pages redirect to `/dashboard`. `AuthContext` provides `useAuth()` hook for client components.

### Data Flow Pattern

Client components call server actions (`lib/actions/`) which: check auth via `supabase.auth.getUser()`, query the database with `user_id` filtering, and return `{ data, error }` tuples. Client updates local state and shows toast notifications via custom `useToast()` hook.

### Server Actions Convention

All server actions follow `'use server'` directive, authenticate the user, and return `{ data, error }` or `{ success, error }` objects. Pagination uses Supabase `.range(offset, offset + pageSize - 1)` with separate count queries. Each action file provides two fetch variants: `fetchAll{Feature}()` (unpaginated, for charts/calculations) and `fetch{Feature}(page, pageSize)` (paginated, for tables).

### Toast System

Custom toast implementation in `components/ui/Toast.tsx` using React Context. Usage: `const { addToast } = useToast()` then `addToast(message, 'success' | 'error' | 'warning' | 'info')`.

### Form Pattern

Forms use React Hook Form + Zod + shadcn Form components:
```tsx
const form = useForm<z.infer<typeof schema>>({
  resolver: zodResolver(schema),
  defaultValues: { ... }
})
// Render with <Form>, <FormField>, <FormControl> from components/ui/form
```

## Environment Variables

Copy `.env_example` to `.env.local`:
```
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY=
```

## Styling

Dark mode by default. CSS variables defined in `globals.css` using OKLCh color space. Use the `cn()` utility from `lib/utils.ts` for merging Tailwind classes. Components follow shadcn/ui patterns — add new ones via the shadcn CLI.

## Path Aliases

`@/*` maps to the project root (configured in tsconfig.json).

## Database

Uses Supabase PostgreSQL directly (no ORM). Prisma is in devDependencies with an empty schema — not currently used. All queries go through `@supabase/supabase-js` in server actions.
