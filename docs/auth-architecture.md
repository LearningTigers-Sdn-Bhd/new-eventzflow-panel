# Secure Authentication Architecture

## Overview

This application uses a secure, cookie-based authentication system designed to protect against XSS (Cross-Site Scripting) while providing a seamless 30-day session experience.

## Core Principles

1.  **Memory-Only Access Tokens:** The short-lived `access_token` is stored in React memory (Zustand) and is never persisted to `localStorage` or `sessionStorage`.
2.  **HttpOnly Cookies for Refresh Tokens:** The long-lived `refresh_token` is stored in an `HttpOnly`, `Secure` cookie. It is inaccessible to JavaScript, making it safe from XSS token theft.
3.  **Silent Initialization:** On page refresh, the application silently requests a new access token using the cookie before the user sees the interface.
4.  **Global 401 Interceptor:** Any unauthorized response automatically clears the local state and redirects the user to the sign-in page.

## Data Flow

### 1. Login / Sign-In
*   User submits credentials.
*   Backend validates and returns `access_token` and `user` profile in the JSON body.
*   Backend sets the `refresh_token` in an `HttpOnly` cookie.
*   Frontend stores `access_token` and `user` in the memory-only store.

### 2. Application Initialization (The "Silent Refresh")
Since the `access_token` is lost on page refresh, the `AuthProvider` handles restoration:
*   App Mounts -> `isInitialized` is `false`.
*   `AuthProvider` calls `POST /v1/auth/refresh_token` (Browser automatically sends the HttpOnly cookie).
*   **Success:** Backend returns a new `access_token` and the `user` profile. `isInitialized` becomes `true`.
*   **Failure:** `isInitialized` becomes `true`, but `isAuthenticated` remains `false`.

### 3. API Requests
*   `kyClient` automatically attaches the `access_token` to the `Authorization: Bearer <token>` header.
*   The `refreshQueueService` checks if the token is expiring soon *before* the request fires. If yes, it pauses the request, refreshes the token, and then resumes with the new token.

## Key Components

### `AuthProvider` (`src/providers/auth-provider.tsx`)
The root-level wrapper that manages the initialization lifecycle.
*   **`isLoading`**: `true` during the silent refresh attempt.
*   **`isAuthenticated`**: `true` if a user and token are present in memory.

### `useAuth` Hook (`src/hooks/auth/use-auth.ts`)
The primary hook for accessing auth state.
*   **`isInitialized`**: Replaces the old "isHydrated" concept. Indicates the initial session check is complete.
*   **`user`**: The current user profile.
*   **`logout()`**: Function to sign out (calls backend to clear cookie + wipes memory).

### `kyClient` (`src/utils/rest-api.ts`)
*   **`credentials: "include"`**: Required to ensure cookies are sent with every request.
*   **`afterResponse` Interceptor**: Automatically handles 401 errors.

## Usage in Components

### Waiting for Auth Readiness
Always use `isInitialized` to delay queries or hide UI until the session is checked:

```typescript
const { isInitialized } = useAuth();

const { data } = useQuery({
  queryKey: ["data"],
  queryFn: fetchData,
  enabled: isInitialized, // Prevents 401s on page load
});

if (!isInitialized) return <LoadingSpinner />;
```

## Security Comparison

| Feature | Old (Vulnerable) | New (Secure) |
| :--- | :--- | :--- |
| **Storage** | `localStorage` (XSS Vulnerable) | **Memory + HttpOnly Cookie** (XSS Safe) |
| **Persistence** | Permanent in LS | Cookie-based (30 days) |
| **Initial Load** | "Hydration" from Disk | **Initialization** via Silent Refresh |
| **Token Theft** | Easy via `document.cookie` or LS | **Impossible** for JavaScript to read |

## Troubleshooting

### Stuck on "Sign-In" after refresh
*   Check the Network tab for the `/refresh_token` request.
*   Ensure the backend is returning the `user` object in the refresh response.
*   Verify the cookie is being sent (requires `credentials: "include"`).

### 401 Logout Loops
*   Ensure the 401 interceptor in `rest-api.ts` ignores paths containing `/auth/` to prevent infinite logout/refresh loops.
