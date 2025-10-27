# Proactive Token Refresh Queue Strategy

## Overview

The proactive token refresh queue service prevents multiple simultaneous token refresh requests when concurrent API calls detect an expired token. Unlike reactive approaches that handle 401 errors, this strategy proactively checks token expiration before making requests.

## Problem Statement

### The Race Condition Problem

Without a queue mechanism, when multiple API requests are made concurrently and the token has expired:

```javascript
// Time 0ms: Token expired, 3 requests fire simultaneously
Request A → 401 error → Starts refresh → POST /refresh_token
Request B → 401 error → Starts refresh → POST /refresh_token  ❌ Duplicate
Request C → 401 error → Starts refresh → POST /refresh_token  ❌ Duplicate
```

**Result:** 3 backend API calls to the refresh endpoint, potential race conditions, and wasted resources.

### The Solution

```javascript
// Time 0ms: Token expired, 3 requests fire simultaneously
Request A → Check token → Start refresh → POST /refresh_token
Request B → Check token → Wait for refresh in progress → Queue
Request C → Check token → Wait for refresh in progress → Queue

// Time 100ms: Refresh completes
Request A, B, C → Execute with new token
```

**Result:** Only 1 backend API call, all requests use the new token.

## Architecture

### Components

```
┌─────────────────────────────────────────────────────────────┐
│                   RefreshQueueService                        │
├─────────────────────────────────────────────────────────────┤
│  - refreshPromise: Shared refresh operation                 │
│  - excludedEndpoints: Auth routes that skip refresh         │
│                                                              │
│  Methods:                                                    │
│  - waitForRefreshIfNeeded(request) → Promise<boolean>       │
│  - startRefresh() → Promise<string>                         │
│  - shouldRefreshToken() → boolean                           │
│  - shouldExcludeEndpoint(url) → boolean                     │
└─────────────────────────────────────────────────────────────┘
                           │
                           │ Used by
                           ▼
┌─────────────────────────────────────────────────────────────┐
│              kyClient beforeRequest Hook                     │
├─────────────────────────────────────────────────────────────┤
│  1. Call refreshQueueService.waitForRefreshIfNeeded()      │
│  2. If refresh occurred, get new token from store          │
│  3. Attach token to request header                         │
│  4. Let request proceed                                    │
└─────────────────────────────────────────────────────────────┘
```

## Implementation Details

### Service File: `src/services/refresh-queue.ts`

```typescript
class RefreshQueueService {
    private refreshPromise: Promise<string> | null = null;

    async waitForRefreshIfNeeded(request: KyRequest): Promise<boolean> {
        // 1. Skip excluded endpoints (login, register, logout, refresh_token)
        if (this.shouldExcludeEndpoint(request.url)) {
            return false;
        }

        // 2. Check if token is expiring
        if (!this.shouldRefreshToken()) {
            return false;
        }

        // 3. Wait for refresh (or start if not in progress)
        await this.startRefresh();
        return true;
    }

    private async startRefresh(): Promise<string> {
        // If already refreshing, return existing promise
        if (this.refreshPromise) {
            return this.refreshPromise;
        }

        // Create new refresh promise
        this.refreshPromise = (async () => {
            const newToken = await refreshToken();
            return newToken;
        })();

        return this.refreshPromise;
    }
}
```

### Integration: `src/utils/rest-api.ts`

```typescript
hooks: {
    beforeRequest: [
        async (request) => {
            // 1. Check if refresh is needed
            try {
                await refreshQueueService.waitForRefreshIfNeeded(request);
            } catch (error) {
                console.error("Token refresh failed:", error);
            }

            // 2. Attach token to request
            if (!request.headers.has("Authorization")) {
                const credentials = useUserSessionStore.getState().sessionCredentials;
                if (credentials?.accessToken) {
                    request.headers.set("Authorization", `Bearer ${credentials.accessToken}`);
                }
            }
        }
    ]
}
```

## Flow Diagrams

### Normal Flow (Token Valid)

```
Request → beforeRequest → Check token
    ↓
Token valid? YES
    ↓
Attach token → Proceed with request
```

### Token Expiring Flow (First Request)

```
Request A → beforeRequest → Check token
    ↓
Token expiring? YES
    ↓
Start refresh → POST /refresh_token
    ↓
Update store with new token
    ↓
Attach new token → Proceed with request
```

### Token Expiring Flow (Concurrent Requests)

```
Request A → beforeRequest → Check token → Start refresh
Request B → beforeRequest → Check token → Wait for refresh ⏱️
Request C → beforeRequest → Check token → Wait for refresh ⏱️
    ↓
Refresh completes (single API call)
    ↓
All requests get new token → Proceed
```

## Key Features

### 1. Shared Promise Pattern

Instead of tracking a boolean `isRefreshing` flag, we use a promise reference:

```typescript
private refreshPromise: Promise<string> | null = null;
```

**Benefits:**
- Multiple concurrent calls automatically wait on the same promise
- No manual queue management needed
- Clean and simple implementation

### 2. Endpoint Exclusion

Auth endpoints never trigger refresh:

```typescript
private readonly excludedEndpoints = [
    "/auth/login",
    "/auth/register",
    "/auth/logout",
    "/auth/refresh_token",
];
```

**Why?**
- Login/Register shouldn't check for refresh token
- Logout should proceed even with expired token
- Refresh endpoint itself shouldn't trigger another refresh

### 3. Proactive Check

Token expiration is checked **before** the request, not after receiving 401:

```typescript
private shouldRefreshToken(): boolean {
    return this.isTokenExpired() || this.isTokenExpiringSoon();
}
```

**Benefits:**
- Prevents failed requests
- Better user experience (no 401 errors)
- More predictable behavior

### 4. Store Integration

The service reads from and updates the Zustand store:

```typescript
// Read token state
useUserSessionStore.getState().isTokenExpiringSoon()

// Update happens in refreshToken() function
await refreshToken(); // Updates store internally
```

## Comparison with Previous Approaches

### Before: Reactive 401 Handling

```typescript
afterResponse: async (request, options, response) => {
    if (response.status === 401) {
        await refreshToken();
        return ky(request); // Retry original request
    }
}
```

**Problems:**
- Multiple requests can trigger multiple refresh calls
- 401 errors must occur first (bad UX)
- Complex retry logic needed
- Login errors treated same as expired token

### After: Proactive Queue Service

```typescript
beforeRequest: async (request) => {
    await refreshQueueService.waitForRefreshIfNeeded(request);
    // Attach token and proceed
}
```

**Benefits:**
- Single refresh call regardless of concurrent requests
- No 401 errors for expired tokens
- Simpler logic
- Login errors don't trigger refresh

## Testing Strategy

### Test Scenarios

1. **Single Request with Expiring Token**
   - Token expires in 4 minutes
   - Make 1 API request
   - Verify: 1 refresh call, request succeeds

2. **Concurrent Requests with Expired Token**
   - Token expired
   - Fire 5 API requests simultaneously
   - Verify: Only 1 refresh call, all requests succeed

3. **Excluded Endpoints**
   - Token expired
   - Make request to `/auth/login`
   - Verify: No refresh attempted, request proceeds

4. **Refresh Failure**
   - Expired token
   - Mock refresh failure
   - Verify: Requests proceed but may get 401

5. **Token Still Valid**
   - Token expires in 10 minutes
   - Make request
   - Verify: No refresh, normal request flow

## Edge Cases Handled

### 1. Multiple Refresh Attempts

```typescript
if (this.refreshPromise) {
    return this.refreshPromise; // Return existing promise
}
```

All concurrent requests share the same promise.

### 2. Refresh Failure

```typescript
try {
    await refreshQueueService.waitForRefreshIfNeeded(request);
} catch (error) {
    console.error("Token refresh failed:", error);
    // Request proceeds anyway, may get 401
}
```

Failure doesn't block the request.

### 3. Store Not Hydrated

```typescript
if (!useUserSessionStore.persist.hasHydrated()) {
    return; // Skip token attachment
}
```

Handled in the main beforeRequest hook.

### 4. No Credentials

```typescript
if (!state.sessionCredentials) {
    return false; // Nothing to refresh
}
```

Gracefully skips refresh logic.

## Performance Considerations

### Memory

- Single promise reference: O(1)
- No request queue storage: O(1)
- Minimal memory footprint

### Network

- Duplicate refresh calls eliminated
- Only necessary API calls made

### CPU

- Simple boolean checks
- Promise-based async flow
- No polling or timers needed

## Migration Notes

### From Reactive to Proactive

1. **Remove** `afterResponse` 401 handler
2. **Add** refresh queue service
3. **Update** `beforeRequest` to call service
4. **Test** concurrent request scenarios

### Backward Compatibility

- Existing auth flows continue to work
- No changes needed to API endpoints
- UI error handling remains the same

## Future Enhancements

### Potential Improvements

1. **Request Prioritization**: Execute certain requests first after refresh
2. **Retry Logic**: Add exponential backoff for failed refreshes
3. **Metrics**: Track refresh frequency and success rate
4. **Background Refresh**: Refresh before expiration proactively
5. **WebSocket Support**: Handle token refresh for WebSocket connections

## Related Documentation

- [Rest API Client](./rest-api-client.md)
- [Rest API Integration](./rest-api-integration.md)
- [User Session Hydration Strategies](./user-session-hydration-strats.md)

## References

- [Original Plan](../refresh-queue-service.plan.md)
- [Service Implementation](../src/services/refresh-queue.ts)
- [REST API Integration](../src/utils/rest-api.ts)
