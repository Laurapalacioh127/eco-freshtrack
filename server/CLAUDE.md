# server/

Express 5 + TypeScript API (`src/app.ts`). Layers per feature: router → controller → service → repository (+ types). Errors with `@hapi/boom`, handled by `src/middlewares/errorsMiddleware.ts`.

- Config: `src/config/index.ts` is the only reader of `process.env`. Add each new variable there and in `.env.example`.
- Routes are mounted under `/api/<feature>` in `app.ts`. Apply `authMiddleware` per route (or per router mounted on its own `/api/<feature>` prefix), never `app.use(authMiddleware)` globally: login and register must stay public.
- Parameterized SQL only; tables live in `public` and are created in `initDb`. Use CTEs / `json_build_object` instead of several queries for nested data.
- Realtime: emit Supabase Broadcast from the service after the repository call succeeds, fire-and-forget (log failures, never throw). Channel and event names are kebab-case, past tense (`donation-created`).
- Vercel: `export default app`, no `listen` in production, build output stays `dist/app.js`.
