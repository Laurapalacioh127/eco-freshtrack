# client/

Next.js 16 App Router. This is NOT the Next.js older tutorials describe: check `node_modules/next/dist/docs/` before using a Next API you are unsure about (see `AGENTS.md`).

- All HTTP goes through the axios instance from `AxiosProvider` (`useAxios()`), and only providers call it. Components and pages never call axios and never run network effects; they read provider hooks.
- Providers: `client/src/providers/<Name>Provider.tsx` with a typed context value, a `use<Name>` hook that throws outside its provider, and `onInit` inside `useEffect`. Session-scoped providers get `key={user?.id ?? 'anonymous'}` so data resets on logout.
- Auth: `AuthProvider` owns `login`, `register`, `logout`, `user`, `isReady`; the session (user + tokens) is saved in `localStorage` through `src/utils/authStorage.ts`; `AxiosProvider` injects `Authorization: Bearer <token>`, refreshes the token on 401 once, and logs out on an expired session. Protected pages use a `PrivateRoute` wrapper that redirects to the right login page by role.
- Realtime: subscribe with `supabase.channel(...).on('broadcast', { event }, cb).subscribe()` inside the provider `useEffect`, return `supabase.removeChannel(...)`, make handlers idempotent by `id`.
- Env: only `src/utils/config.ts` reads `process.env`: `NEXT_PUBLIC_API_URL`, `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY`. Document them in `.env.example`.
- UI: Tailwind 4, existing design tokens in `src/app/globals.css`, UI text in Spanish. Show loading, empty and error states and toasts for failed actions.
