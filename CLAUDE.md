# FreshTrack

Smart food inventory and anti-waste platform (university project, Ecosistemas de Aplicaciones, Icesi). Monorepo with two independent Vercel deployments.

```
eco-freshtrack/
├── client/   Next.js 16 (App Router), React 19, Tailwind 4, axios. Source under client/src/
└── server/   Express 5, TypeScript, @hapi/boom. Source under server/src/
```

The harness in `.claude/` is the course harness (`JonatanOrdonez/fullstack-harness`) adapted to this repo. Read `.claude/docs/README.md` for the index of patterns; load only the page a task needs.

## Project overrides (these win over the harness docs)

- Client source is under `client/src/` and the alias `@/` points to `client/src/`.
- Shared client state lives in `client/src/providers/<Name>Provider.tsx` (not `context/`). Existing: `AxiosProvider` (the single axios instance), `ProductsProvider`, `InventoryProvider`, `RecipesProvider`, `DonationsProvider`, `UsersProvider`. There is no `lib/axios.ts`: interceptors (Bearer token, refresh, 401 handling) go in `AxiosProvider`.
- Components live in `client/src/components/<Name>/<Name>.tsx` (one folder per component). Shared client types are in `client/src/types.ts`.
- Server entry is `server/src/app.ts` (not `index.ts`). It exports `app` and only calls `listen` when `NODE_ENV !== 'production'` (Vercel serverless). Keep it that way.
- Server feature files are named `<feature>.{router,controller,service,repository,types}.ts` with singular names (`product.router.ts`). Each feature currently has a `data.mock.ts` that the repository reads; those are replaced by PostgreSQL as features move to the database.
- Roles are `household` and `admin`. Two portals: `/user/**` and `/admin/**`, with login pages at `/login/user` and `/login/admin`.

## Language

- Code, comments, identifiers, commit messages, docs: English.
- User-facing UI text and error messages shown to people: Spanish (the app is in Spanish).

## Commands

| Workspace | Install | Dev | Typecheck | Lint | Test |
|-----------|---------|-----|-----------|------|------|
| `server/` | `npm install` | `npm run dev` (port 3001) | `npm run typecheck` | `npm run lint` | `npm test` |
| `client/` | `npm install` | `npm run dev` (port 3000) | `npm run typecheck` | `npm run lint` | `npm test` |

If a script is missing, adding it is part of the tooling step in `.claude/docs/workflow/entrega-3-plan.md`.

## Rules, skills, agents

- Rules in `.claude/rules/` load by file path. Skills are slash commands: `/add-feature`, `/add-server-feature`, `/add-client-feature`, `/add-component`, `/add-context`, `/add-hook`, `/add-db-table`, `/add-realtime`, `/add-auth`, `/add-file-upload`, `/verify`.
- Agents never call each other; the skill runs them in order: `feature-planner` (opus, read-only) → `server-writer` → `client-writer` → `test-writer` → `code-reviewer` (all sonnet).
- The work plan for the current delivery is `.claude/docs/workflow/entrega-3-plan.md`. Run its steps in order, one `/add-feature` per step, and commit after each green step.

## Security

- Never read or edit `.env` files (a hook blocks it). Update `.env.example` instead.
- Secrets (`SUPABASE_SECRET_KEY`, DB password) stay on the server. The client only gets `NEXT_PUBLIC_*` variables.
- Never write passwords, keys or tokens in any tracked file, including this one.

## Before calling a task done

1. `npm run typecheck`, `npm run lint` and `npm test` pass in every touched workspace.
2. `code-reviewer` returned `APPROVED`.
3. The change works against the real app (`npm run dev` in both workspaces).
