# User Session Hydration Strategies

**Last Updated:** 2024
**Status:** Active
**Related Files:** `useHydratedStore.ts`, `new-auth-store.ts`

---

## Table of Contents

1. [What is Hydration?](#what-is-hydration)
2. [Why is it Needed?](#why-is-it-needed)
3. [When to Use Hydration](#when-to-use-hydration)
4. [How It Works](#how-it-works)
5. [Implementation Patterns](#implementation-patterns)
6. [Use Cases](#use-cases)
7. [Best Practices](#best-practices)
8. [Troubleshooting](#troubleshooting)

---

## What is Hydration?

**Hydration** is the process of loading persisted data (from `localStorage`, cookies, etc.) into application state on the client-side after the page loads.

In our app, hydration specifically refers to:

```typescript
User visits page → React mounts → Zustand store initializes →
localStorage is read (async) → Store is "hydrated" with auth data
```

### The Hydration Gap

There's a **timing gap** between when React components mount and when stored data is available:

```
┌─────────────────────────────────────────────┐
│  Page Load Timeline                          │
├─────────────────────────────────────────────┤
│  t=0ms:   Browser loads HTML                │
│  t=10ms:  React components mount             │
│  t=20ms:  Components try to access store     │ ⚠️ Store not ready yet!
│  t=50ms:  Zustand loads from localStorage    │
│  t=51ms:  Store is hydrated ✅               │
└─────────────────────────────────────────────┘
```

**Without hydration checks**, components will access `undefined` tokens and API calls will fail with `401 Unauthorized`.

---

## Why is it Needed?

### Problem Scenario

```typescript
// ❌ Without hydration check
const Dashboard = () => {
  // This runs immediately on mount
  const token = useUserSessionStore.getState().sessionCredentials?.accessToken;
  // → Returns: undefined (localStorage not read yet!)

  const { data } = useQuery({
    queryKey: ["events"],
    queryFn: () => fetchEvents(token), // token is undefined!
  });

  // ❌ Result: 401 Unauthorized error
}
```

### Why This Happens

1. **localStorage is Asynchronous** - Reading from disk takes time
2. **React Mounts First** - Components render before data is ready
3. **API Calls Need Tokens** - Without the token, all authenticated requests fail
4. **Race Condition** - Who wins: React Query or localStorage?

### Real-World Example

```typescript
// User opens dashboard
useEffect(() => {
  // This fires BEFORE hydration completes
  const credentials = useUserSessionStore.getState().sessionCredentials;
  console.log(credentials); // null or undefined

  // API call made with no token
  fetch("/api/events", {
    headers: { Authorization: `Bearer ${undefined}` }
  });
  // → 401 Unauthorized
}, []);

// Hydration completes 50ms later (too late!)
useUserSessionStore.persist.onHydrate(() => {
  console.log("Token now available:", sessionCredentials);
});
```

---

## When to Use Hydration

### ✅ Use Hydration When:

1. **Storing Auth Data in localStorage** - Tokens, user info, refresh tokens
2. **Making Authenticated API Calls** - Any request requiring a token
3. **React Query with Authentication** - Wait for token before fetching
4. **SSR Apps with Client Auth** - Next.js with client-side auth
5. **Any Persisted Store** - Zustand, Redux, MobX with localStorage

### ❌ Don't Use Hydration When:

1. **Server-Side Auth** - Cookies via server are available immediately
2. **No Auth Required** - Public API calls
3. **Static Data** - Data that doesn't require authentication
4. **Same-Origin Cookies** - Available synchronously

---

## How It Works

### Architecture Overview

```
┌─────────────────────────────────────────────────────────┐
│  Component                                               │
│                                                          │
│  1. useHydratedStore() hook                             │
│     ↓                                                    │
│  2. useUserSessionStore.persist.hasHydrated()          │
│     - Check if already hydrated (fast path)             │
│     - Returns: true/false                               │
│     ↓                                                    │
│  3. onHydrate() event listener                          │
│     - Wait for hydration event                         │
│     - Sets isHydrated = true when ready                │
│     ↓                                                    │
│  4. React re-renders with isHydrated = true            │
│     ↓                                                    │
│  5. useQuery with enabled: isHydrated                  │
│     ↓                                                    │
│  6. API call executed with token ✅                      │
└─────────────────────────────────────────────────────────┘
```

### Implementation: `useHydratedStore` Hook

```typescript
export function useHydratedStore(): boolean {
  const [isHydrated, setIsHydrated] = useState(false);

  useEffect(() => {
    // Fast path: Already hydrated?
    if (useUserSessionStore.persist.hasHydrated()) {
      setIsHydrated(true);
      return;
    }

    // Slow path: Wait for hydration event
    const unsubscribe = useUserSessionStore.persist.onHydrate(() => {
      setIsHydrated(true);
    });

    return unsubscribe;
  }, []);

  return isHydrated;
}
```

### Flow Diagram

```
User Opens Page
    │
    ├─► React mounts components
    │       │
    │       ├─► useHydratedStore() called
    │       │       │
    │       │       ├─► Check: hasHydrated()?
    │       │       │       │
    │       │       │       ├─► YES: Return true ✅
    │       │       │       │
    │       │       │       └─► NO: Subscribe to onHydrate()
    │       │       │               │
    │       │       │               └─► Return false (waiting...)
    │       │       │
    │       │       └─► isHydrated = false
    │       │
    │       └─► API calls DISABLED (enabled: false)
    │
    ├─► Zustand loads from localStorage (async)
    │       │
    │       ├─► Reads sessionCredentials
    │       ├─► Reads accessToken
    │       └─► Hydrates store
    │           │
    │           └─► Fires onHydrate() event
    │                   │
    │                   └─► setIsHydrated(true)
    │                           │
    │                           └─► Component re-renders
    │                                   │
    │                                   └─► API calls ENABLED ✅
    │                                           │
    │                                           └─► Token attached to requests
    │                                                   │
    │                                                   └─► Success! ✅
```

---

## Implementation Patterns

### Pattern 1: Hook-Based (Recommended)

**Simple, reusable, single line:**

```typescript
import { useHydratedStore } from "@/hooks/use-hydrated-store";

function Dashboard() {
  const isHydrated = useHydratedStore();

  const { data } = useQuery({
    queryKey: ["events"],
    queryFn: getEvents,
    enabled: isHydrated, // ← Wait for hydration
  });

  if (!isHydrated) return <Loading />;
  return <DashboardContent data={data} />;
}
```

**✅ Pros:**
- DRY (Don't Repeat Yourself)
- Reusable across components
- Type-safe
- One line of code

**❌ Cons:**
- Need to import hook in every component
- Manual `if (!isHydrated)` checks

---

### Pattern 2: Component Wrapper

**Automatic hydration check, no manual logic:**

```typescript
import { AuthReady } from "@/components/providers/auth-ready";

function App() {
  return (
    <AuthReady fallback={<LoadingSpinner />}>
      <DashboardPage />
      {/* All children automatically wait for hydration */}
    </AuthReady>
  );
}
```

**✅ Pros:**
- Zero boilerplate in child components
- Automatic handling
- Consistent loading states
- Perfect for route-level wrapping

**❌ Cons:**
- Less granular control
- All children wait, even if some don't need auth

---

### Pattern 3: Manual Check (Anti-Pattern)

**❌ Don't do this:**

```typescript
// BAD: Repetitive, error-prone
function Component1() {
  const [isHydrated, setIsHydrated] = useState(false);

  useEffect(() => {
    const unsubscribe = useUserSessionStore.persist.onHydrate(() => {
      setIsHydrated(true);
    });
    if (useUserSessionStore.persist.hasHydrated()) {
      setIsHydrated(true);
    }
    return unsubscribe;
  }, []);

  const { data } = useQuery({
    queryKey: ["events"],
    queryFn: getEvents,
    enabled: isHydrated,
  });
}

// Now repeat in Component2, Component3, etc... 😭
```

**Why it's bad:**
- Code duplication
- Easy to forget
- Inconsistent behavior
- Hard to maintain

---

## Use Cases

### Use Case 1: Authenticated User Dashboard

**Scenario:** User logs in, token stored in localStorage, opens dashboard

```typescript
// src/app/dashboard/page.tsx
import { useHydratedStore } from "@/hooks/use-hydrated-store";

export default function DashboardPage() {
  const isHydrated = useHydratedStore();

  // Fetch stats and events
  const [
    { data: stats, isLoading: statsLoading },
    { data: events, isLoading: eventsLoading },
  ] = useQueries({
    queries: [
      {
        queryKey: ["dashboard-stats"],
        queryFn: getAllEventsStats,
        enabled: isHydrated, // ✅ Wait for token
      },
      {
        queryKey: ["events-overview"],
        queryFn: getEventsOverview,
        enabled: isHydrated, // ✅ Wait for token
      },
    ],
  });

  // Show loading while waiting for hydration
  if (!isHydrated || statsLoading || eventsLoading) {
    return <DashboardSkeleton />;
  }

  return (
    <div>
      <DashboardStats stats={stats} />
      <AllEventsOverview events={events} />
    </div>
  );
}
```

**Timeline:**
1. User opens page
2. `useHydratedStore()` returns `false` initially
3. React Query waits (queries disabled)
4. Zustand loads token from localStorage
5. `isHydrated` becomes `true`
6. React Query fetches with token ✅
7. Dashboard renders with data

---

### Use Case 2: Non-Authenticated User (Public Pages)

**Scenario:** Visitor opens public events page

```typescript
// src/app/events/page.tsx
export default function EventsPage() {
  // No hydration check needed - public data
  const { data: publicEvents } = useQuery({
    queryKey: ["public-events"],
    queryFn: getPublicEvents,
    enabled: true, // No auth required
  });

  return <PublicEventsList events={publicEvents} />;
}
```

**When to skip hydration:**
- No authentication required
- Public APIs
- Static content
- Public-facing pages

---

### Use Case 3: Mixed Authentication (Public + Private)

**Scenario:** Page has both public and private content

```typescript
// src/app/event/[id]/page.tsx
export default function EventDetailsPage() {
  const isHydrated = useHydratedStore();

  // Public data - no hydration needed
  const { data: event } = useQuery({
    queryKey: ["event", id],
    queryFn: () => getPublicEventDetails(id),
    enabled: true, // Public, no auth
  });

  // Private data - needs hydration
  const { data: analytics } = useQuery({
    queryKey: ["event-analytics", id],
    queryFn: () => getEventAnalytics(id),
    enabled: isHydrated, // ✅ Wait for token
  });

  return (
    <div>
      {/* Public content always shows */}
      <EventDetails event={event} />

      {/* Private content waits for hydration */}
      {isHydrated && analytics && (
        <EventAnalytics analytics={analytics} />
      )}
    </div>
  );
}
```

**Key Point:** Only wait for hydration on authenticated queries!

---

### Use Case 4: Server Components + Client Auth (Next.js 16)

**Scenario:** Using SSR with client-side authentication

```typescript
// src/app/dashboard/page.tsx (Server Component - initial load)
import { DashboardClient } from "./dashboard-client";

export default async function DashboardPage() {
  // Server can't access localStorage
  // But we fetch initial data on server for SEO

  // This won't work (no auth on server):
  // const stats = await getAllEventsStats(); ❌

  // Instead, pass to client component
  return <DashboardClient />;
}

// src/app/dashboard/dashboard-client.tsx (Client Component)
"use client";

export function DashboardClient() {
  const isHydrated = useHydratedStore();

  // Client-side API calls
  const { data } = useQuery({
    queryKey: ["stats"],
    queryFn: getAllEventsStats,
    enabled: isHydrated,
  });

  return <DashboardStats stats={data} />;
}
```

**Why this pattern:**
- Server Components can't access localStorage
- Client Components can't do SSR
- Hybrid approach: server for static, client for dynamic

---

## Best Practices

### 1. Use the Hook (Not Manual Checks)

```typescript
// ✅ Good
const isHydrated = useHydratedStore();

// ❌ Bad
const [isHydrated, setIsHydrated] = useState(false);
useEffect(() => { /* manual logic */ }, []);
```

### 2. Show Loading States

```typescript
// ✅ Good
if (!isHydrated) return <LoadingSpinner />;

// ❌ Bad
if (!isHydrated) return null; // Flash of empty content
```

### 3. Disable Queries Until Hydrated

```typescript
// ✅ Good
const { data } = useQuery({
  queryKey: ["events"],
  queryFn: getEvents,
  enabled: isHydrated,
});

// ❌ Bad
const { data } = useQuery({
  queryKey: ["events"],
  queryFn: getEvents,
  // Missing enabled check
});
```

### 4. Combine with Skeleton Loaders

```typescript
// ✅ Good
const isHydrated = useHydratedStore();
const { data, isLoading } = useQuery({
  queryKey: ["events"],
  queryFn: getEvents,
  enabled: isHydrated,
});

if (!isHydrated || isLoading) return <EventsSkeleton />;

// ❌ Bad - Flash of content
return (
  <>
    {!isHydrated && <Loading />}
    {data && <EventsList />}
  </>
);
```

### 5. Don't Overuse - Only When Needed

```typescript
// ✅ Only check for authenticated requests
const isHydrated = useHydratedStore();

const { data: publicData } = useQuery({
  queryKey: ["public"],
  queryFn: getPublicData,
  enabled: true, // No auth needed
});

const { data: privateData } = useQuery({
  queryKey: ["private"],
  queryFn: getPrivateData,
  enabled: isHydrated, // Auth required
});
```

### 6. Use `initialData` for SSR + Client Hydration

```typescript
// Server Component
export default async function DashboardPage() {
  const token = await getServerToken();
  const initialStats = await getAllEventsStatsServer(token);

  return <DashboardClient initialStats={initialStats} />;
}

// Client Component
export function DashboardClient({ initialStats }) {
  const isHydrated = useHydratedStore();

  const { data } = useQuery({
    queryKey: ["stats"],
    queryFn: getAllEventsStats,
    initialData: initialStats, // Hydrate with server data
    enabled: isHydrated,
  });
}
```

---

## Troubleshooting

### Issue 1: API calls still get 401 errors

**Symptoms:**
- Token appears attached in logs
- Requests return 401 Unauthorized
- Only happens on page refresh

**Solution:**

```typescript
// Check if hydration is working
const isHydrated = useHydratedStore();

useEffect(() => {
  console.log("Hydrated:", isHydrated);
  if (isHydrated) {
    const token = useUserSessionStore.getState().sessionCredentials?.accessToken;
    console.log("Token available:", !!token);
  }
}, [isHydrated]);
```

**Check:**
- Is `enabled: isHydrated` set on queries?
- Is token actually in localStorage?
- Is store persisting correctly?

---

### Issue 2: Double API calls

**Symptoms:**
- Network tab shows 2 identical requests
- Data loads twice

**Cause:** Using `enabled` + `initialData` incorrectly

**Solution:**

```typescript
// ✅ Good - initialData prevents refetch on mount
const { data } = useQuery({
  queryKey: ["events"],
  queryFn: getEvents,
  initialData: serverData, // Prevents duplicate fetch
  enabled: isHydrated,
});

// ❌ Bad - fetches even with initialData
const { data } = useQuery({
  queryKey: ["events"],
  queryFn: getEvents,
  initialData: serverData,
  enabled: isHydrated,
  refetchOnMount: true, // Causes duplicate
});
```

---

### Issue 3: Flash of loading state

**Symptoms:**
- Page shows loading spinner on every navigation
- Brief flash of skeleton

**Solution:** Pre-hydrate on navigation

```typescript
// src/app/layout.tsx
import { useHydratedStore } from "@/hooks/use-hydrated-store";

export function RootLayout({ children }) {
  const isHydrated = useHydratedStore();

  // Keep layout consistent
  return (
    <html>
      <body>
        {!isHydrated && (
          <div className="fixed inset-0 bg-background">
            <LoadingSpinner />
          </div>
        )}
        <div className={isHydrated ? "opacity-100" : "opacity-0"}>
          {children}
        </div>
      </body>
    </html>
  );
}
```

---

### Issue 4: Browser extension blocking requests

**Symptoms:**
- `ERR_BLOCKED_BY_CLIENT` error
- Only on certain endpoints (e.g., `/analytics/*`)
- Token is attached correctly

**Solution:** Rename endpoints to avoid trigger words

```typescript
// ❌ Blocked by ad blockers
fetch("/api/analytics/events_overview");

// ✅ Works fine
fetch("/api/dashboard/events_all");
```

**Or:** Disable extension for localhost

---

## Quick Reference

### For Authenticated Users

```typescript
// 1. Import hook
import { useHydratedStore } from "@/hooks/use-hydrated-store";

// 2. Get hydration status
const isHydrated = useHydratedStore();

// 3. Disable queries until ready
const { data } = useQuery({
  queryKey: ["data"],
  queryFn: fetchData,
  enabled: isHydrated, // ← Important!
});

// 4. Show loading state
if (!isHydrated) return <Loading />;
```

### For Non-Authenticated Users

```typescript
// No hydration check needed
const { data } = useQuery({
  queryKey: ["public-data"],
  queryFn: fetchPublicData,
  enabled: true, // Immediate fetch
});
```

---

## Related Files

- `src/hooks/use-hydrated-store.ts` - Hydration hook
- `src/stores/new-auth-store.ts` - Zustand store with persistence
- `src/app/dashboard/page.tsx` - Example usage
- `src/components/providers/auth-ready.tsx` - Wrapper component
- `src/utils/rest-api.ts` - API client with auth

---

## Summary

**What:** Loading persisted data from storage into app state

**Why:** Race condition between React mounting and localStorage loading

**When:** Any component making authenticated API calls with localStorage auth

**How:** Use `useHydratedStore()` hook or `<AuthReady>` wrapper

**Result:** Zero authentication errors, smooth user experience 🚀
