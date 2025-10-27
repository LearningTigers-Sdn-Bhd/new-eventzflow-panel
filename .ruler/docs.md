# Project Documentation

This project has comprehensive documentation in the `./docs` directory.

## IMPORTANT: This Project Uses Bun

**ALWAYS use Bun commands and configuration:**
- Package manager: `bun` (not npm or yarn)
- Runtime: `bun` (not node)
- Scripts: `bun run <script>`
- Package installation: `bun add <package>` or `bun install`
- Execution: `bun <file>` or `bunx <command>`
- Lock file: `bun.lockb` (not package-lock.json or yarn.lock)
- Config: `bunfig.toml` (not .npmrc)

## Architecture Overview

This is a **single Next.js 16 application** using:
- **Client-side REST API** integration with external backend
- **Zustand** for state management with persistence
- **TanStack Query** for data fetching and caching
- **ky** HTTP client for authenticated API calls
- Token-based authentication with automatic refresh

## Frontend Structure

Complete guide to the `src/` directory structure:

- **`src/app/`** - Next.js App Router (file-based routing)
  - `(auth)/` - Authenticated route group
  - `(public)/` - Public route group
  - `layout.tsx` - Root layout
- **`src/components/`** - Reusable React components
  - **`ui/`** - shadcn/ui components (Button, Input, Dialog, etc.)
  - **`pages/`** - Page sections (NOT routes - prevents Next.js from creating routes)
  - **`providers/`** - Context providers
- **`src/hooks/`** - Custom React hooks (prefix with `use-`)
  - `use-auth.ts` - Authentication state and actions
  - `use-scanner.ts` - QR code scanning functionality
  - `use-hydrated-store.ts` - Store hydration utilities
- **`src/layout/`** - Layout components
- **`src/lib/`** - Library code and configurations
  - **`lib/api/`** - API modules (auth, event, ticket, etc.)
  - **`lib/api/{module}/`** - Each API module follows the pattern:
    - `request.ts` - Request schemas and validation (may use Zod)
    - `response.ts` - Response types and schemas (TypeScript interfaces)
    - `endpoints.ts` - API endpoint functions
    - `index.ts` - Re-exports all public APIs
- **`src/stores/`** - Zustand state stores
  - `new-auth-store.ts` - User session and authentication state
  - `dialog-store.ts` - Dialog management
- **`src/services/`** - Service utilities
  - `refresh-queue.ts` - Token refresh queue service
- **`src/utils/`** - Utility functions
  - `rest-api.ts` - REST API client configuration (ky + auth)
  - `error-handler.ts` - Error extraction utilities

**Import aliases:** Use `@/` for all imports (e.g., `@/components/ui/button`)

## REST API Integration

**File**: `./docs/rest-api-integration.md`

### API Module Structure

All API modules follow a consistent pattern under `src/lib/api/`:

```
src/lib/api/
├── auth/
│   ├── request.ts      # Request schemas and validation
│   ├── response.ts     # Response types and schemas
│   ├── endpoints.ts    # API endpoint functions
│   └── index.ts        # Re-exports all public APIs
├── event/
│   ├── request.ts
│   ├── response.ts
│   ├── endpoints.ts
│   └── index.ts
└── ...
```

### Validation Patterns

- **Auth Module**: Uses Zod schemas for both request AND response validation
- **Other Modules**: Use TypeScript types only (no runtime validation)
  - Request types: Pure TypeScript interfaces
  - Response types: Pure TypeScript interfaces

### Usage

```typescript
// Import from module root
import { login, register, logout } from "@/lib/api/auth";
import { getEvents, createEvent } from "@/lib/api/event";

// Use with TanStack Query
const { data: events } = useQuery({
  queryKey: ["events"],
  queryFn: getEvents,
});
```

**Additional documentation:**
- `./docs/rest-api-client.md` - REST client implementation details
- `./docs/rest-api-integration.md` - Complete API module guide

## Authentication Flow

**Files**: `src/stores/new-auth-store.ts`, `src/lib/api/auth/endpoints.ts`

### Token-Based Authentication

The app uses token-based authentication with automatic refresh:

1. **Session Storage** - Zustand store with `persist` middleware
2. **Token Refresh** - Automatic refresh when token expires (within 5 minutes)
3. **HTTP Client** - `ky` client with automatic token injection
4. **Refresh Queue** - Prevents multiple simultaneous refresh attempts

### Key Components

- **Store**: `useUserSessionStore` (Zustand with localStorage persistence)
- **Hook**: `useAuth()` - Access authentication state and actions
- **Endpoints**: `login()`, `register()`, `logout()`, `refreshToken()`
- **Client**: `restClient` in `src/utils/rest-api.ts`

### Usage

```typescript
// Use auth hook
import { useAuth } from "@/hooks/use-auth";

const MyComponent = () => {
  const { user, isAuthenticated, isHydrated, logout } = useAuth();

  if (!isHydrated) return <Loading />;
  if (!isAuthenticated) return <LoginForm />;

  return <Dashboard />;
};

// Direct API calls
import { login } from "@/lib/api/auth";

const handleLogin = async (email: string, password: string) => {
  try {
    const response = await login(email, password);
    // Session automatically stored in Zustand store
  } catch (error) {
    // Handle error
  }
};
```

**Additional documentation:**
- `./docs/user-session-hydration-strats.md` - Session hydration strategies
- `./docs/refresh-queue-strategy.md` - Token refresh queue implementation

## When to Use Each Approach

**For REST API calls:**
1. **Default**: Use API modules in `src/lib/api/{module}/`
2. **Pattern**: Import from module root (e.g., `@/lib/api/auth`)
3. **Integration**: Use with TanStack Query for caching and state management

**For new features:**
1. Create API module in `src/lib/api/{feature-name}/`
2. Follow the pattern: `request.ts`, `response.ts`, `endpoints.ts`, `index.ts`
3. Use TypeScript types for responses (no runtime validation needed by default)
4. Use Zod for request validation when needed (auth module uses Zod for both)
5. Export functions from `index.ts`
6. Use in components with `useQuery` or `useMutation`

**For authentication:**
1. Use `useAuth()` hook for authentication state
2. Use `login()`, `register()`, `logout()` from `@/lib/api/auth`
3. Store hydration is handled automatically via Zustand persist

## Quick Commands (ALL MUST USE BUN)

```bash
# Development
bun run dev                 # Start dev server on port 3001
bun run build              # Build for production
bun run start              # Start production server
bun run lint               # Lint code
bun run lint:fix           # Fix linting issues
bun run format             # Format code
bun run check              # Check code
bun run check:fix          # Fix code issues

# Package management
bun add <package>          # Install package
bun install               # Install all dependencies
bun remove <package>      # Remove package

# Execution
bun <file>                # Run TypeScript/JavaScript file directly
bunx <command>            # Execute package command

# Ruler commands
bun run ruler:apply       # Apply ruler rules
```

## Environment Variables

```bash
# .env.local
NEXT_PUBLIC_API_URL=https://api.yourbackend.com
```

## Additional Documentation

Refer to the following files in `./docs/` for detailed guides:

- `rest-api-integration.md` - API module structure and patterns
- `rest-api-client.md` - REST client implementation details
- `user-session-hydration-strats.md` - Session hydration strategies
- `refresh-queue-strategy.md` - Token refresh queue
- `features/scan/*.md` - Scan feature documentation
