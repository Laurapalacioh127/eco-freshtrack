<div align="center">

# 🍓 FreshTrack

**Smart food inventory and anti-waste platform: one place for households and one for the team that keeps food moving.**

![Next.js](https://img.shields.io/badge/Next.js-16.4-black?logo=nextdotjs)
![React](https://img.shields.io/badge/React-19.3-61DAFB?logo=react&logoColor=black)
![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-4-38B2AC?logo=tailwindcss&logoColor=white)
![Express](https://img.shields.io/badge/Express-5.3-000000?logo=express)
![TypeScript](https://img.shields.io/badge/TypeScript-strict-3178C6?logo=typescript&logoColor=white)
![Supabase](https://img.shields.io/badge/Supabase-Auth%20%7C%20Postgres%20%7C%20Realtime-3ECF8E?logo=supabase&logoColor=white)
![Vercel](https://img.shields.io/badge/Deployed_on-Vercel-000000?logo=vercel)

[Live app](https://eco-freshtrack-client.vercel.app) · [API](https://eco-freshtrack.vercel.app) · [Repository](https://github.com/Laurapalacioh127/eco-freshtrack)

</div>

---

## Table of contents

1. [What is FreshTrack](#1-what-is-freshtrack)
2. [Live links](#2-live-links)
3. [The problem and why two apps](#3-the-problem-and-why-two-apps)
4. [Features by portal](#4-features-by-portal)
5. [How it works](#5-how-it-works)
6. [Authentication and security](#6-authentication-and-security)
7. [Real-time](#7-real-time)
8. [External API and physical input](#8-external-api-and-physical-input)
9. [Tech stack](#9-tech-stack)
10. [Project structure and architecture](#10-project-structure-and-architecture)
11. [API reference](#11-api-reference)
12. [Database](#12-database)
13. [Getting started](#13-getting-started)
14. [Deployment on Vercel](#14-deployment-on-vercel)
15. [AI-assisted workflow](#15-ai-assisted-workflow)
16. [Testing](#16-testing)
17. [Credits and acknowledgements](#17-credits-and-acknowledgements)

---

## 1. What is FreshTrack

FreshTrack is a smart food inventory and anti-waste platform with **two connected portals**:

- **Household portal** (`/user`): people register the food they have at home, see what is about to expire, scan products by barcode, browse and share recipes, and donate food they will not use.
- **Admin team portal** (`/admin`): the FreshTrack team follows a live activity feed, moderates recipes submitted by households, manages donations and maintains the master product catalog.

Both portals share one backend, and actions in one show up in the other in real time.

> 🎓 **Academic project.** FreshTrack is a student project for the **"Ecosistemas de Aplicaciones" (Application Ecosystems)** course at **Universidad Icesi**, built by **Laura Palacio** and **Mariana Quintero**. It has no commercial purpose.

The user interface is in Spanish. The code, comments and documentation are in English.

## 2. Live links

| What | URL |
| --- | --- |
| Client (Next.js) | https://eco-freshtrack-client.vercel.app |
| Server (Express REST API) | https://eco-freshtrack.vercel.app |
| Repository | https://github.com/Laurapalacioh127/eco-freshtrack |

## 3. The problem and why two apps

A lot of food is thrown away at home simply because people forget what they bought or when it expires. Food that is still good but will not be eaten could go to someone else, but there is rarely an easy way to offer it.

FreshTrack attacks this from two sides, which is why it is **two apps sharing one backend**:

| | Household portal | Admin team portal |
| --- | --- | --- |
| **Who** | People managing food at home | The FreshTrack operations team |
| **Goal** | Know what they have, use it before it expires, give away the surplus | Review what households share, coordinate donations, keep catalog data clean |
| **Sees** | Only their own inventory, donations and notifications | All donations and recipes across the platform |

The two audiences need different screens, permissions and data scopes. The flows still depend on each other: a household donates and the team approves it, or a household submits a recipe and the team moderates it. So both portals talk to the same API, and real-time events keep them in sync.

## 4. Features by portal

### 🏠 Household portal (`/user`, role `household`)

| Feature | What it does |
| --- | --- |
| **Home dashboard** | Greets the user, shows inventory counters (registered, expiring soon, expired), items close to expiring and a donation summary. |
| **Inventory** | Lists the user's food items with category filters and an expiration status computed on the server (`ok`, `soon` = 3 days or less, `expired`). Each item has a detail page. |
| **Manual add** | Form to add an item with name, category (fixed category list), quantity and expiration date. |
| **Barcode scanner** | Scans a product barcode with the camera, looks it up in Open Food Facts through the server, and pre-fills the add form with the product name and category. Includes a manual barcode entry screen. |
| **Recipes** | Browse approved recipes plus your own submissions, and submit new recipes (title, time, difficulty, servings, ingredients, steps). Submissions go to admin moderation, and you can track their status. |
| **Donations** | Pick items from your inventory, create a donation (zone, items, expiration label) and follow its status (`pending` → `approved` → `completed`) on a status timeline. |
| **Smart shopping list** | Read-only view of the user's shopping items. See [Known limitations](#known-limitations--roadmap). |
| **Profile** | Shows the user's account data and donation summary. |
| **Notifications** | Real-time notification bell: you are notified when your recipe is reviewed or your donation changes status. |

### 🛠️ Admin team portal (`/admin`, role `admin`)

| Feature | What it does |
| --- | --- |
| **Live feed** | Operations home with counters (pending donations, recipes to review, catalog size), a feed of recent donations and recipes that updates in real time, and an impact summary. |
| **Recipe moderation** | Queue of submitted recipes with a review panel to approve or reject each one. The author is notified. |
| **Donations** | All donations on the platform, with actions to move them through `pending` → `approved` → `completed`. The donor is notified. |
| **Master catalog** | Searchable product catalog (name, category, shelf life in days, substitutes) and a modal to add new products. |
| **Settings** | Informational page with settings sections (notifications, team and permissions, operation zones). |
| **Notifications** | Real-time bell: admins are notified of every new recipe submission and every new household donation. |

### Known limitations / roadmap

We want to be honest about what is not finished yet:

- **Smart shopping list is read-only.** The page reads `shopping_items` from the database, but nothing in the app writes to that table yet. There is no automatic suggestion engine, and checking an item off only lasts while you are on the page (it is not saved to the server). Planned: generate suggestions from low or expired inventory and save the checked state.
- **Inventory is create and read only.** There are no edit, delete or "consumed" actions for inventory items yet.
- **Catalog is create and read only.** Admins can add products but not edit or delete them.
- **Admin settings are informational.** The settings cards do not have working controls yet.
- **Recipe ingredient matching is not implemented.** `ingredients_available` is set equal to the total number of ingredients when a recipe is created. It is not compared with the user's inventory.
- **Points and kg saved are not calculated.** The `users` table has `points` and `kg_saved` columns, but no feature updates them yet.
- **Admin accounts are created manually.** Self-registration always creates a `household` profile. An admin is promoted by changing `role` in `public.users`.
- **No user management screen.** `GET /api/users` and `GET /api/users/:id` exist for admins, but no admin page uses them yet.
- **The `donation_stats` table is deprecated.** It is kept for compatibility. The donation summary is now computed from `donations`.

## 5. How it works

### User flow

1. **Choose a portal.** The landing page (`/`) lets you pick the household portal or the team portal.
2. **Sign up or log in.** Households register at `/login/user`, and admins log in at `/login/admin`. The client sends the credentials to the server, the server authenticates against Supabase Auth and returns the user profile with an access token and a refresh token.
3. **Fill the inventory.** The household adds items by hand, or scans a barcode: the camera reads the code, the server looks it up in Open Food Facts, and the form comes back pre-filled.
4. **Watch expirations.** The server computes each item's status from its expiration date, and the home page highlights what to use first.
5. **Act on surplus.** The household submits a recipe or donates items. The server saves it, broadcasts a real-time event, and creates notifications for every admin.
6. **The team reacts live.** The admin feed, recipe queue and donation board update right away. The admin approves or rejects a recipe, or advances a donation.
7. **The loop closes.** The household gets a real-time notification and sees the new status.

### Architecture

```
                     ┌──────────────────────────────┐
                     │   Client: Next.js 16 (Vercel) │
                     │  /user portal   /admin portal │
                     │  Providers + axios + JWT      │
                     └──────┬──────────────▲─────────┘
               REST + Bearer│              │ Broadcast subscribe
                            │              │ (publishable key)
                            ▼              │
┌────────────────────────────────────┐   ┌─┴──────────────────────┐
│  Server: Express 5 (Vercel)        │   │  Supabase Realtime     │
│  router → controller → service →   ├──►│  channels: donations,  │
│  repository                        │   │  recipes, notifications│
│  authMiddleware + requireRole      │   └────────────────────────┘
└───┬───────────────┬────────────┬───┘      ▲ httpSend (secret key)
    │               │            │          │ (from the services)
    │ signUp/login/ │ SQL (pg)   │ fetch
    │ refresh/      │            │
    │ getUser       ▼            ▼
    ▼        ┌─────────────┐  ┌──────────────────┐
┌──────────┐ │ PostgreSQL  │  │ Open Food Facts  │
│ Supabase │ │ (Supabase,  │  │ public API v2    │
│ Auth     │ │ tx pooler)  │  └──────────────────┘
└──────────┘ └─────────────┘
```

The client never talks to the database or to Supabase Auth directly. Its only direct Supabase connection is subscribing to Realtime Broadcast channels with the publishable key.

## 6. Authentication and security

- **Supabase Auth through the server.** `POST /api/auth/register`, `/login` and `/refresh` call Supabase Auth from the server (`signUp`, `signInWithPassword`, `refreshSession`). Each call uses its own short-lived client, so sessions are never shared between concurrent requests. When you register, the server also creates a profile row in `public.users` with role `household`. If creating that profile fails, the orphan Auth user is deleted.
- **JWT Bearer token on the client.** The session (user, access token, refresh token, expiry) is stored in `localStorage` by `client/src/utils/authStorage.ts` and exposed through `AuthProvider` (`login`, `register`, `logout`, `user`, `isReady`).
- **Axios interceptor with refresh.** `AxiosProvider` owns the single axios instance:
  - It adds `Authorization: Bearer <accessToken>` to every request.
  - On a `401` it calls `/api/auth/refresh` **once** and retries the request. Concurrent 401s share one refresh request.
  - If the refresh token is gone, it clears the session and logs out ("session expired").
  - Auth endpoints themselves never trigger a refresh.
- **Protected routes.** The `/user` and `/admin` layouts are wrapped in `PrivateRoute`. Without a session, or with the other role's session, it redirects to the matching login page.
- **`authMiddleware`.** It is mounted per router on each protected `/api/<feature>` prefix, never globally, so login and register stay public. It checks the `Bearer` header, validates the token with Supabase (`auth.getUser`), loads the profile (and therefore the role) from `public.users`, and sets `req.user`.
- **Role-based authorization.** `requireRole('admin')` or `requireRole('household')` guards specific routes (see the [API reference](#11-api-reference)). Data is also scoped by user: households only see their own inventory, donations and notifications, and the recipes they can see are approved recipes plus their own. Admins see everything.
- **Secrets stay on the server.** `SUPABASE_SECRET_KEY` and the database password only exist in the server environment. The client only receives `NEXT_PUBLIC_*` variables. Row Level Security is enabled on every table, so the public key cannot read data directly.
- **Errors** are raised with `@hapi/boom` and turned into JSON by `errorsMiddleware`. If Supabase cannot be reached, the server answers `502`, not `401`, so a valid session is not dropped by mistake.
- **Input safety.** All SQL is parameterized, ids are validated as UUIDs, and only Open Food Facts–hosted image URLs are passed to the client.

## 7. Real-time

FreshTrack uses **Supabase Realtime Broadcast**. The server emits events with `channel.httpSend` using the secret key. These calls are fire-and-forget: a failed broadcast is logged and never fails the HTTP request. The client subscribes with the publishable key inside providers. Handlers are idempotent by `id`, and channels are removed on unmount.

| Channel | Event | Emitted by (server) | Payload | Subscribed by (client) |
| --- | --- | --- | --- | --- |
| `donations` | `donation-created` | `createDonationService` | Full donation | `DonationsProvider` (both portals) |
| `donations` | `donation-status-changed` | `updateDonationStatusService` | Full donation | `DonationsProvider` (both portals) |
| `recipes` | `recipe-submitted` | `submitRecipeService` | Full recipe | `RecipesProvider` (both portals) |
| `recipes` | `recipe-reviewed` | `moderateRecipeService` | Full recipe | `RecipesProvider` (both portals) |
| `notifications` | `notification-created` | `notification.service` (after inserting rows) | `{ id, userId }` | `NotificationsProvider` (both portals) |

Notification payloads only carry ids. When an event is for the current user, the client fetches the details through the authenticated REST API, so scoping is still enforced by the server. Who gets notified:

- New recipe submitted → every admin (`recipe-submitted`)
- Recipe approved or rejected → the recipe author (`recipe-reviewed`)
- New household donation → every admin (`donation-created`)
- Donation status changed → the donor (`donation-status-changed`)

## 8. External API and physical input

### Open Food Facts lookup (server)

`GET /api/products/barcode/:code` calls the public **Open Food Facts API v2** (`/api/v2/product/<code>.json`) from the server:

- It requests only the fields it needs and sends a constant, non-personal `User-Agent` (`FreshTrack/1.0 (student project)`).
- It uses a configurable timeout (`OPEN_FOOD_FACTS_TIMEOUT_MS`, default 5000 ms). A timeout returns `504`, and other upstream failures return `502`.
- It picks the Spanish name first and falls back to other name fields. It takes the first category, and only accepts images hosted on `images.openfoodfacts.org`.
- Unknown products return `404` with a Spanish message.

### Camera barcode scanning (client)

The `useBarcodeScanner` hook (`client/src/hooks/useBarcodeScanner.ts`) drives the `/user/scan` screen:

1. It opens the rear camera with `getUserMedia`.
2. It uses the native **`BarcodeDetector`** API when the browser has it (EAN-13, EAN-8, UPC-A, UPC-E).
3. Otherwise it falls back to **`@zxing/browser`**.
4. If there is no camera support, or permission is denied, it shows a clear message and the **manual input** screen (`/user/scan/manual`) lets the user type the code.

The detected code is normalized and looked up through `ScanProvider`. On `/user/scan/result` the user confirms and adds the item to their inventory.

## 9. Tech stack

Versions come from `client/package.json` and `server/package.json`.

### Client

| Package | Version |
| --- | --- |
| next | 16.4.3 (App Router) |
| react / react-dom | 19.3.0 |
| tailwindcss | ^4 |
| axios | ^1.20.0 |
| @supabase/supabase-js | ^2.119.2 (Realtime only) |
| @zxing/browser / @zxing/library | ^0.2.1 / ^0.23.0 |
| typescript | ^5 |
| vitest | ^5.1.1 |
| @testing-library/react | ^16.3.3 |
| jsdom | ^29.1.1 |

### Server

| Package | Version |
| --- | --- |
| express | ^5.3.0 |
| typescript | ~6.0.0 |
| @supabase/supabase-js | ^2.119.2 |
| pg | ^8.23.1 |
| @hapi/boom | ^10.0.1 |
| cors | ^2.8.6 |
| dotenv | ^18.0.9 |
| tsx | ^4.23.15 |
| supertest | ^7.3.2 |
| eslint | ^9.39.5 |

**Platform:** Supabase (Auth, PostgreSQL, Realtime) and Vercel (two projects).

## 10. Project structure and architecture

```
eco-freshtrack/
├── CLAUDE.md                 Project instructions for Claude Code
├── .claude/                  AI harness: agents, skills, rules, hooks, docs
├── server/                   Express 5 + TypeScript API
│   ├── .env.example
│   ├── src/
│   │   ├── app.ts            Express app (exported for Vercel; listens only outside production)
│   │   ├── config/           index.ts (env), supabase.ts (clients), realtime.ts (channels + broadcast)
│   │   ├── db/               db.ts (pg pool, initDb DDL), cleanup.ts (idempotent data cleanup)
│   │   ├── middlewares/      authMiddleware.ts (auth + requireRole), errorsMiddleware.ts
│   │   ├── features/
│   │   │   ├── auth/         auth.{router,controller,service,repository,types}.ts
│   │   │   ├── barcode/      Open Food Facts lookup
│   │   │   ├── products/     Master catalog
│   │   │   ├── inventory/    Inventory items + shopping list
│   │   │   ├── recipes/      Recipes + moderation
│   │   │   ├── donations/    Donations + summary
│   │   │   ├── notifications/
│   │   │   └── users/
│   │   └── utils/            categories, isUuid, readText
│   └── test/                 node:test + supertest, one folder per feature
└── client/                   Next.js 16 app
    ├── .env.example
    ├── src/
    │   ├── app/              App Router pages
    │   │   ├── login/{user,admin}/
    │   │   ├── user/         home, inventory, scan, recipes, donate, shopping-list, profile
    │   │   └── admin/        home (feed), recipes, donations, catalog, settings
    │   ├── components/       <Name>/<Name>.tsx, one folder per component
    │   ├── hooks/            useBarcodeScanner, useLogout
    │   ├── providers/        Axios, Auth, Toast, Users, Products, Inventory,
    │   │                     Recipes, Donations, Notifications, Scan
    │   ├── utils/            config, authStorage, realtime, supabase, form validators…
    │   └── types.ts          Shared client types
    └── test/                 Vitest + Testing Library
```

### Server layered architecture

Each feature follows the same four layers (plus `types`):

```
HTTP request → router → controller → service → repository → PostgreSQL / Supabase / Open Food Facts
```

| Layer | Responsibility |
| --- | --- |
| **Router** | Maps method and path to a controller. Applies `requireRole` where needed. |
| **Controller** | Reads and validates the request input, calls the service, sends JSON with the right status code. |
| **Service** | Business rules (expiration status, scoping, notifications, real-time broadcasts). Throws Boom errors. |
| **Repository** | The only layer that touches data: parameterized SQL through `pg` (with transactions where needed) or the external HTTP API. |

### Client provider pattern

- `AxiosProvider` creates the **single** axios instance (base URL from `NEXT_PUBLIC_API_URL`, token, refresh interceptor) and exposes it with `useAxios()`.
- Feature providers (`InventoryProvider`, `RecipesProvider`, `DonationsProvider`, …) are the **only** code that calls the API. Each one loads its data in `useEffect`, exposes state plus actions (`addItem`, `submitRecipe`, `createDonation`, `moderateRecipe`, …) through a typed `use<Name>()` hook, and subscribes to its real-time channel.
- Session-scoped providers are keyed by the user id, so their data resets on logout.
- Pages and components only read provider hooks. They never call axios directly. Every screen handles loading, empty and error states, and failed actions show a toast.

## 11. API reference

Base URL: `https://eco-freshtrack.vercel.app` (local: `http://localhost:3001`). Every route except `/` and `/api/auth/*` requires `Authorization: Bearer <accessToken>`.

| Method | Path | Auth | Role | Description |
| --- | --- | --- | --- | --- |
| GET | `/` | No | — | Health text (`FreshTrack API`) |
| POST | `/api/auth/register` | No | — | Create account (household) and return session |
| POST | `/api/auth/login` | No | — | Log in and return session |
| POST | `/api/auth/refresh` | No | — | Exchange refresh token for a new session |
| GET | `/api/products` | Yes | Any | List catalog products |
| GET | `/api/products/:id` | Yes | Any | Get one product |
| POST | `/api/products` | Yes | admin | Create catalog product |
| GET | `/api/products/barcode/:code` | Yes | Any | Look up a barcode in Open Food Facts |
| GET | `/api/inventory` | Yes | Any (own items) | List inventory (optional category filter) |
| POST | `/api/inventory` | Yes | Any (own items) | Add inventory item |
| GET | `/api/inventory/summary` | Yes | Any (own items) | Registered / expiring soon / expired counts |
| GET | `/api/inventory/shopping-list` | Yes | Any (own items) | List shopping items |
| GET | `/api/inventory/:id` | Yes | Any (own items) | Get one inventory item |
| GET | `/api/recipes` | Yes | Any (scoped) | List recipes (admin: all; household: approved + own) |
| POST | `/api/recipes` | Yes | household | Submit a recipe for moderation |
| GET | `/api/recipes/:id` | Yes | Any (scoped) | Get one recipe |
| PATCH | `/api/recipes/:id/status` | Yes | admin | Approve or reject a recipe |
| GET | `/api/donations` | Yes | Any (scoped) | List donations (admin: all; household: own) |
| POST | `/api/donations` | Yes | household, admin | Create a donation |
| GET | `/api/donations/summary` | Yes | Any (scoped) | Totals by status |
| GET | `/api/donations/:id` | Yes | Any (scoped) | Get one donation |
| PATCH | `/api/donations/:id/status` | Yes | admin | Change donation status |
| GET | `/api/users/me` | Yes | Any | Current user profile |
| GET | `/api/users` | Yes | admin | List users |
| GET | `/api/users/:id` | Yes | admin | Get one user |
| GET | `/api/notifications` | Yes | Any (own) | List my notifications |
| PATCH | `/api/notifications/:id/read` | Yes | Any (own) | Mark a notification as read |

## 12. Database

PostgreSQL on Supabase, accessed with `pg` through the transaction pooler. Tables live in `public` and are created idempotently by `initDb()` in `server/src/db/db.ts`. RLS is enabled on all of them.

| Table | Description |
| --- | --- |
| `users` | App profile per Supabase Auth user: name, email, role (`household` / `admin`), points, kg saved. |
| `products` | Master catalog: name, category, shelf life in days, substitutes (`TEXT[]`). |
| `inventory_items` | A household's food items: name, category, quantity, expiration date. |
| `shopping_items` | Shopping list entries per user: name, quantity, reason, checked flag. |
| `recipes` | Recipes with author, time, difficulty, servings, ingredient counts and moderation status (`pending` / `approved` / `rejected`). |
| `recipe_ingredients` | Ordered ingredients of a recipe (`recipe_id`, `position`). |
| `recipe_steps` | Ordered preparation steps of a recipe (`recipe_id`, `position`). |
| `donations` | Donations: donor, zone, items, expiration label, status (`pending` / `approved` / `completed`). |
| `donation_stats` | Deprecated single-row stats table. Nothing reads it any more. |
| `notifications` | Per-user notifications with type, message and read flag. |

When the server starts locally it also runs `cleanup.ts`. This idempotently removes the demo rows that older versions inserted, and normalizes old category names to the fixed category list.

## 13. Getting started

### Prerequisites

- Node.js (a version that supports `node --test` with module mocks, such as current LTS) and npm
- A [Supabase](https://supabase.com) project
- Git

### Supabase setup

1. Create a Supabase project.
2. In **Project Settings → API**, copy the project URL, the **publishable** key (for the client) and the **secret** key (server only).
3. In **Project Settings → Database**, copy the **transaction pooler** connection details (host, port `6543`, user, password).
4. Realtime Broadcast works out of the box. You do not need to create tables for it.
5. Tables are created automatically the first time the server starts locally (`initDb`).
6. To get an admin account, register normally, then change that user's `role` to `admin` in `public.users`.

### Environment variables

Copy each `.env.example` and fill in your own values. Never commit real values.

**`server/.env`**

| Variable | Purpose |
| --- | --- |
| `PORT` | Local port (default `3001`) |
| `NODE_ENV` | `development` / `production` / `test` |
| `DB_HOST` | Supabase transaction pooler host |
| `DB_PORT` | Pooler port (default `6543`) |
| `DB_USER` | Database user |
| `DB_PASSWORD` | Database password |
| `DB_NAME` | Database name (default `postgres`) |
| `DB_SSL` | `true` unless set to `false` |
| `SUPABASE_URL` | Supabase project URL |
| `SUPABASE_SECRET_KEY` | Supabase secret key (server only) |
| `OPEN_FOOD_FACTS_URL` | Open Food Facts base URL (default `https://world.openfoodfacts.org`) |
| `OPEN_FOOD_FACTS_TIMEOUT_MS` | Lookup timeout (default `5000`) |

**`client/.env.local`**

| Variable | Purpose |
| --- | --- |
| `NEXT_PUBLIC_API_URL` | Server base URL (local: `http://localhost:3001`) |
| `NEXT_PUBLIC_SUPABASE_URL` | Supabase project URL (for Realtime) |
| `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY` | Supabase publishable key (for Realtime) |

### Run locally

```bash
# Terminal 1: server
cd server
cp .env.example .env        # then fill it in
npm install
npm run dev                 # http://localhost:3001

# Terminal 2: client
cd client
cp .env.example .env.local  # then fill it in
npm install
npm run dev                 # http://localhost:3000
```

### Checks

| Workspace | Typecheck | Lint | Test |
| --- | --- | --- | --- |
| `server/` | `npm run typecheck` | `npm run lint` | `npm test` |
| `client/` | `npm run typecheck` | `npm run lint` | `npm test` |

## 14. Deployment on Vercel

The repository is deployed as **two Vercel projects** from the same repo. Each push to `main` redeploys them.

| Project | Root Directory | Required environment variables (names only) |
| --- | --- | --- |
| Server | `server` | `NODE_ENV=production`, `DB_HOST`, `DB_PORT`, `DB_USER`, `DB_PASSWORD`, `DB_NAME`, `DB_SSL`, `SUPABASE_URL`, `SUPABASE_SECRET_KEY` (optional: `OPEN_FOOD_FACTS_URL`, `OPEN_FOOD_FACTS_TIMEOUT_MS`) |
| Client | `client` | `NEXT_PUBLIC_API_URL` (public server URL), `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY` |

On Vercel the server runs as a serverless function: `app.ts` does `export default app` and only calls `listen` outside production. Because `initDb` runs when the server starts locally, create the tables by starting the server locally once against the same database before relying on the deployed API.

## 15. AI-assisted workflow

FreshTrack was built with **Claude Code** and a project harness in `.claude/`. The harness was adapted from the course harness [`JonatanOrdonez/fullstack-harness`](https://github.com/JonatanOrdonez/fullstack-harness) to this repo's layout.

| Piece | Where | What it does |
| --- | --- | --- |
| **CLAUDE.md files** | `CLAUDE.md`, `server/CLAUDE.md`, `client/CLAUDE.md` | Project conventions and overrides: folder layout, layers, auth, realtime, language rules, the "done" checklist. |
| **Skills** (slash commands) | `.claude/skills/` | `/add-feature`, `/add-server-feature`, `/add-client-feature`, `/add-component`, `/add-context`, `/add-hook`, `/add-db-table`, `/add-realtime`, `/add-auth`, `/add-file-upload`, `/verify`. |
| **Agents** | `.claude/agents/` | `feature-planner` (read-only, plans the API contract, tables, files and tests), `server-writer`, `client-writer`, `test-writer`, `code-reviewer` (read-only, returns `APPROVED` or change requests). |
| **Rules** | `.claude/rules/` | Short rules loaded by file path (server layers, DB, errors and auth, client components/contexts/hooks, tests, TypeScript style). |
| **Hooks** | `.claude/settings.json`, `.claude/scripts/hooks/` | `block-env.sh` blocks any access to `.env` files. `post-edit.sh` lints each edited file. `stop.sh` runs typecheck, lint and tests in changed workspaces before Claude can finish. |
| **Docs** | `.claude/docs/` | On-demand pattern pages (server, client, workflow) plus the delivery plan and the review checklist. |
| **Headless runner** | `.claude/scripts/harness.sh` | Runs the full plan → implement → test → review loop non-interactively. |

**The loop.** Each feature goes through `/add-feature`, which runs the agents in order. Agents never call each other:

```
feature-planner ──► server-writer ──► client-writer ──► test-writer ──► code-reviewer
     (plan)          (implement)        (implement)        (test)          (review)
                                                                              │
                     ◄─────────── fix and re-review until APPROVED ──────────┘
```

A task counts as done only when typecheck, lint and tests pass in every touched workspace, the reviewer says `APPROVED`, and the change works in the real app. Every line was still reviewed and owned by the team.

## 16. Testing

```bash
cd server && npm test   # node:test + supertest (tsx, module mocks)
cd client && npm test   # Vitest + Testing Library (jsdom)
```

**Server (`server/test/`)**

- Route tests for every feature with `supertest`: status codes, validation, auth (`401`) and role checks (`403`).
- Service tests: expiration status, scoping, notifications, error mapping.
- Real-time and notification tests: services broadcast the right channel and event, and notify the right users.
- Open Food Facts repository and service tests: timeout, upstream errors, not found, field mapping.
- Config and utility tests, plus DB integration tests (`initDb` and cleanup are idempotent). These are **skipped automatically when no database is configured**.

**Client (`client/test/`)**

- Providers: `AxiosProvider` (Bearer header, single refresh, logout on expired session), `AuthProvider`, the data providers including their real-time handlers, `ScanProvider`, `ToastProvider`.
- Components: forms and their validation (auth, inventory, donation, recipe, product, manual barcode), `PrivateRoute`, `NotificationBell`, `RecipeReviewPanel`, sidebars, badges, empty states.
- Hooks: `useBarcodeScanner` (BarcodeDetector, fallback, permission errors), `useLogout`.
- Pages: admin pages, admin catalog, new recipe, user profile.
- Utils: form validators, barcode normalization, categories, config, auth storage, realtime helpers.

## 17. Credits and acknowledgements

- **[Open Food Facts](https://world.openfoodfacts.org)**: the free, open, collaborative food products database behind our barcode lookup. Product data is available under the Open Database License.
- **[Supabase](https://supabase.com)**: authentication, PostgreSQL and Realtime.
- **[Vercel](https://vercel.com)**: hosting for both the client and the server.
- **[ZXing](https://github.com/zxing-js/browser)**: barcode decoding fallback in the browser.
- **Course instructor** of *Ecosistemas de Aplicaciones* at Universidad Icesi, for the guidance and the original fullstack harness this project's workflow is built on.

**Authors:** Laura Palacio and Mariana Quintero.

---

> ⚠️ **Disclaimer:** FreshTrack is an academic project developed for a university course. It has no commercial purpose, comes with no warranties, and is not meant for production use with real personal data.
