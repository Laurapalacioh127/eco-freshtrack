---
name: add-context
description: Adds a React context (provider + use hook) to client/src/providers that loads data from the API and exposes actions. Use for shared client state.
argument-hint: "<Domain, e.g. Rooms>"
---

# Add a context

Argument: the domain (for example `Rooms`).

1. Read `.claude/rules/client-contexts.md` and `.claude/docs/client/contexts.md` (provider template, status machine, idempotent updates, per-user reset).
2. If realtime is involved, also read `.claude/docs/client/realtime-subscription.md`.
3. Add shared types to `client/src/types.ts` if missing.
4. Create `client/src/providers/<Name>Provider.tsx` exporting `<Name>Provider` and `use<Name>`.
5. Mount the provider in the page or layout that needs it, as low in the tree as possible.
6. Add tests (`renderHook` with the provider as wrapper, `@/lib/axios` mocked) per `.claude/docs/client/testing.md`.
7. Run `npm run typecheck`, `npm run lint` and `npm test` in `client/`.
