# Entrega 3 plan (FreshTrack)

Goal: real login with Supabase Auth, protected endpoints, real database, realtime with Supabase Broadcast, both apps on Vercel. Run the steps in order with the harness. After each step: `/verify`, run the app, commit, push (Vercel redeploys).

Rubric coverage: architecture + features (1,2,4), provider pattern (3), env vars (5), sockets (6), working prototype with toasts/loading/validation (7), screens + protected routes (8), session management (9), being able to justify decisions (10).

## Before step 1 (manual, Supabase dashboard)

1. Create a Supabase project. Authentication > Providers > Email: turn off "Confirm email".
2. Connect > Transaction pooler: values for `DB_HOST`, `DB_PORT=6543`, `DB_USER`, `DB_NAME=postgres`, `DB_PASSWORD`. Project URL, Secret key and Publishable key from API Keys.
3. Put them in `server/.env` and `client/.env.local` yourself (Claude never reads them). The names go in the `.env.example` files.

## Step 1: tooling and env

```
/add-feature tooling: add typecheck, lint and test scripts to server and client (tsx + node:test for server, Vitest + Testing Library for client), make server/src/config/index.ts export DB_*, SUPABASE_URL and SUPABASE_SECRET_KEY, create client/src/utils/config.ts reading the NEXT_PUBLIC_* variables, and keep both .env.example files documented. No behavior change.
```

## Step 2: database replaces the mocks

```
/add-feature database: create the tables (users, products, inventory_items, recipes, donations) in initDb with public. prefixes and foreign keys, seed them from the existing data.mock.ts files once, and switch each feature repository from the mock to PostgreSQL via pg. Keep the same GET contracts so the client does not change. Use a CTE or json_build_object where a response has nested data.
```

## Step 3: authentication (server)

```
/add-auth server: auth feature with POST /api/auth/register, POST /api/auth/login and POST /api/auth/refresh using the Supabase SDK, authMiddleware validating the Bearer token with supabase.auth.getUser(), and roles household/admin (requireRole). Apply authMiddleware per router on /api/products, /api/inventory, /api/recipes, /api/donations and /api/users; login/register/refresh stay public. Admin-only routes (recipe moderation, catalog) use requireRole('admin'). Inventory and donations are scoped to the logged-in user.
```

## Step 4: authentication (client)

```
/add-auth client: AuthProvider with login, register, logout, user, isReady; session saved in localStorage (user + accessToken + refreshToken) via src/utils/authStorage.ts; AxiosProvider interceptors that send Authorization: Bearer, call /api/auth/refresh once on 401 and retry, and log out + redirect when the session is expired; PrivateRoute wrapper for /user/** and /admin/** that redirects to /login/user or /login/admin by role; real forms in AuthScreen with validation, loading state and error toast. Session-scoped providers use key={user?.id ?? 'anonymous'}.
```

## Step 5: realtime (Supabase Broadcast)

```
/add-realtime donations on channel donations: events donation-created and donation-status-changed (payload = the donation); recipes on channel recipes: events recipe-submitted and recipe-reviewed. The server emits from the service after the DB write (fire-and-forget); the admin live feed and donation/recipe lists update in DonationsProvider and RecipesProvider without reloading, with idempotent handlers and channel cleanup.
```

## Step 6: UX polish for the demo

```
/add-feature polish: global toast provider for errors and successes, loading/creating/deleting states on every action button, empty states with dedicated UI, form validation messages, logout button in both sidebars.
```

## Step 7: deploy (manual)

- Server Vercel project (Root Directory `server`): `DB_HOST`, `DB_PORT`, `DB_USER`, `DB_PASSWORD`, `DB_NAME`, `SUPABASE_URL`, `SUPABASE_SECRET_KEY`.
- Client Vercel project (Root Directory `client`): `NEXT_PUBLIC_API_URL` = server production domain (no trailing `/`, no `/api`), `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY`.
- Run the server locally once so `initDb` creates the tables in Supabase (Vercel does not run it).
- Redeploy the client after changing any `NEXT_PUBLIC_*`. Disable Deployment Protection on production.
- Test the full flow on the Vercel URLs: register, login, protected data, realtime between two browsers, logout, expired session.

## If time runs short (minimum cut)

Steps 1, 3, 4 and 5 are the core of the rubric (auth, session, sockets). Do step 2 only for the features those steps need (users, donations, recipes) and leave the rest on mocks.

## Be able to explain (sustentación)

Providers vs prop drilling; why features are split by folder; why one CTE instead of several queries; JWT flow (register → token → Bearer header → middleware → `getUser`); authentication vs authorization (`requireRole`); why the secret key is server-only; why Broadcast is emitted from the service after the DB write; what could come next.
