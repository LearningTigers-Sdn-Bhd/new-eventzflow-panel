# EventzFlow Panel

Next.js 16 (App Router, TypeScript strict) admin panel for the EventzFlow event-management system. Talks to the Rails API (`../eventz-flow-backend`, port 3000) over REST.

## Runtime: Bun only

- Install: `bun install` / `bun add <pkg>` / `bun remove <pkg>`
- Run: `bun run <script>`, `bunx <cmd>`, `bun <file>`
- Lock file: `bun.lock`. **Never run npm, yarn, or pnpm** — they create conflicting lock files.

## Commands (all verified against package.json)

```bash
bun run dev          # dev server → http://localhost:3001
bun run build        # production build (Turbopack)
bun run start        # serve production build
bun run check        # Biome lint + format check — run before every commit
bun run check:fix    # auto-fix lint + format
bun test             # run colocated *.test.ts / *.test.tsx files
bun run ruler:apply  # regenerate CLAUDE.md / AGENTS.md / editor configs from .ruler/
```

Formatting is Biome (`biome.json`): **tab indentation**, LF line endings, organized imports, sorted Tailwind classes in `clsx`/`cva`/`cn`. Do not hand-format against it.

## Environment

`.env.local` (gitignored):

```bash
NEXT_PUBLIC_API_URL=<backend base URL>   # e.g. http://localhost:3000
```

Never put secrets in `NEXT_PUBLIC_*` variables — they are shipped to the browser.

## Directory map (verified)

- `src/app/` — App Router routes. Route groups: `(auth)/` authenticated, `(public)/` public, `(workshop)/` workshop flows; plus `app/api/` route handlers.
- `src/components/`
  - `ui/` — shadcn/ui primitives (add via `bunx shadcn@latest add <name>`)
  - `pages/` — page sections. **Not routes** — kept here so Next.js doesn't create routes from them.
  - `layout/`, `dialogs/`, `sidebars/`, `pdf-reports/`, etc.
- `src/providers/auth-provider.tsx` — auth initialization lifecycle (see Auth below).
- `src/hooks/` — custom hooks, `use-` prefix. Subfolders: `auth/`, `api/`, `query/`, `public-registration/`, `rsvp/`, `tts/`.
- `src/lib/api/{module}/` — one folder per backend resource (~60 modules). Fixed file pattern:
  - `request.ts` — request types (Zod schemas where runtime validation is needed, e.g. auth)
  - `response.ts` — response types (plain TypeScript interfaces)
  - `endpoints.ts` — functions that call the API
  - `index.ts` — re-exports the public surface
- `src/stores/` — Zustand stores (`new-auth-store.ts` = session, `dialog-store.ts`, etc.)
- `src/services/refresh-queue.ts` — serializes token refreshes (single refresh in flight).
- `src/utils/rest-api.ts` — HTTP clients: `kyClient` (authenticated, `credentials: "include"`), `kyPublicClient`, `restClient` / `publicRestClient` wrappers.

Imports always use the `@/` alias (`@/components/ui/button`).

## Authentication (matches current code — do not reintroduce old patterns)

Source of truth: `src/stores/new-auth-store.ts`, `src/providers/auth-provider.tsx`, `src/utils/rest-api.ts`. Full design: `docs/auth-architecture.md`.

- **Refresh token**: HttpOnly Secure cookie set by the backend. JavaScript never reads or stores it. Every authenticated client must use `credentials: "include"`.
- **Access token**: short-lived (~15 min), held in `useUserSessionStore` (Zustand `persist`, shared across tabs). This persistence is deliberate — acceptable only because the token is short-lived. Never extend its lifetime or persist the refresh token.
- **Startup**: `AuthProvider` performs a silent `POST /v1/auth/refresh_token` on mount (browser sends the cookie) to restore the session.
- **Requests**: `kyClient` injects `Authorization: Bearer <token>`; `refresh-queue.ts` refreshes proactively when the token expires within 2 minutes and enforces a 30 s minimum between refreshes.
- **401 handling**: interceptor in `rest-api.ts` clears state and redirects to sign-in, but ignores `/auth/` paths to prevent logout loops.

Component usage:

```typescript
import { useAuth } from "@/hooks/auth/use-auth";

const { user, isAuthenticated, isInitialized, logout } = useAuth();

// Gate queries on isInitialized to avoid 401s during startup:
useQuery({ queryKey: ["events"], queryFn: getEvents, enabled: isInitialized });
```

Forbidden (old, removed patterns — do NOT restore them): `isHydrated`, `use-hydrated-store`, storing refresh tokens in localStorage, calling the API without `kyClient`/`kyPublicClient`.

## Adding a feature (recipe)

1. Create `src/lib/api/{feature}/` with `request.ts`, `response.ts`, `endpoints.ts`, `index.ts` — copy the shape of an existing module (e.g. `src/lib/api/event/`).
2. Use plain TS interfaces for responses; add Zod only where user input needs runtime validation.
3. Wrap endpoints in TanStack Query (`useQuery` / `useMutation`) inside a hook in `src/hooks/`.
4. Build UI from existing `src/components/ui/` primitives before adding anything new.
5. Colocate a `*.test.ts` next to non-trivial logic; run `bun test`.
6. Run `bun run check:fix` before committing.

## Security rules (non-negotiable)

- Sanitize any user/CMS-provided HTML with `isomorphic-dompurify` before rendering (including via `html-react-parser`). Never use `dangerouslySetInnerHTML` on raw input.
- Validate user input at the boundary (Zod) for auth and public registration flows.
- Auth rules above: refresh token stays in the HttpOnly cookie, always `credentials: "include"`, never log tokens.

## Docs worth reading before touching related code

- `docs/auth-architecture.md` — auth design
- `docs/rest-api-client.md`, `docs/rest-api-integration.md` — HTTP client + API module patterns
- `docs/universal-dialog-usage.md` — dialog system
- `docs/features/` — feature-specific guides (events, import, lucky-draw, scan)
