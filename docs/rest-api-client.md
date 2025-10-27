# REST API Client Documentation

## Overview

The REST API client provides a convenient and type-safe way to make HTTP requests in the EventzFlow panel application. It includes automatic authentication, error handling, retry logic, and development debugging features.

## Architecture

The REST API client consists of two main components:

- **`kyClient`**: The underlying [ky](https://github.com/sindresorhus/ky) instance with configuration
- **`restClient`**: High-level convenience methods for making authenticated HTTP requests

## Exports

### `kyClient`

The underlying ky instance with pre-configured settings:

```typescript
export const kyClient = ky.create({
  prefixUrl: process.env.NEXT_PUBLIC_API_URL || "http://localhost:3000",
  timeout: 30000,
  headers: {
    "Content-Type": "application/json",
  },
  retry: {
    limit: 3,
    methods: ["get", "post", "put", "delete", "patch"],
    statusCodes: [408, 429, 500, 502, 503, 504],
  },
  // ... hooks for auth and error handling
});
```

### `restClient`

High-level HTTP client with convenience methods:

```typescript
export const restClient = {
  get: <T>(url: string, token?: string): Promise<T>
  post: <T>(url: string, data?: unknown, token?: string): Promise<T>
  put: <T>(url: string, data?: unknown, token?: string): Promise<T>
  patch: <T>(url: string, data?: unknown, token?: string): Promise<T>
  delete: <T>(url: string, token?: string): Promise<T>
}
```

## Features

### 🔐 Automatic Authentication

The client automatically includes authentication tokens from the user session store:

```typescript
// Automatically uses token from auth store
const users = await restClient.get<User[]>('/users');
```

### 🔄 Token Override

You can override the default authentication token for specific requests:

```typescript
// Uses custom token instead of auth store token
const users = await restClient.get<User[]>('/users', 'custom-token');
```

### 🐛 Development Debugging

In development mode, all requests are logged with detailed information:

```
🔍 HTTP Client Debug (GET):
  - URL: /users
  - Token: eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
  - Headers: { Authorization: "Bearer ..." }
```

### 🔁 Automatic Retry

Failed requests are automatically retried for:
- **Methods**: GET, POST, PUT, DELETE, PATCH
- **Status Codes**: 408, 429, 500, 502, 503, 504
- **Limit**: 3 retries

### 🚨 Error Handling

- **401 Unauthorized**: Automatically clears session and redirects to login
- **Other Errors**: Thrown naturally for handling in calling code
- **Query Errors**: Displayed via toast notifications with retry option

## Usage Examples

### Basic CRUD Operations

```typescript
import { restClient } from '@/utils/rest-api';

// GET - Fetch data
const users = await restClient.get<User[]>('/users');
const user = await restClient.get<User>(`/users/${id}`);

// POST - Create new resource
const newUser = await restClient.post<User>('/users', {
  name: 'John Doe',
  email: 'john@example.com'
});

// PUT - Update entire resource
const updatedUser = await restClient.put<User>(`/users/${id}`, {
  name: 'John Smith',
  email: 'johnsmith@example.com'
});

// PATCH - Partial update
const patchedUser = await restClient.patch<User>(`/users/${id}`, {
  name: 'John Smith'
});

// DELETE - Remove resource
await restClient.delete(`/users/${id}`);
```

### With Custom Authentication

```typescript
// Use different token for specific request
const adminUsers = await restClient.get<User[]>('/admin/users', adminToken);

// Create user with specific permissions
const user = await restClient.post<User>('/users', userData, specialToken);
```

### Error Handling

```typescript
try {
  const users = await restClient.get<User[]>('/users');
  // Handle success
} catch (error) {
  // Handle error
  console.error('Failed to fetch users:', error);
}
```

### With React Query Integration

```typescript
import { useQuery, useMutation } from '@tanstack/react-query';
import { restClient } from '@/utils/rest-api';

// Query
const { data: users, isLoading } = useQuery({
  queryKey: ['users'],
  queryFn: () => restClient.get<User[]>('/users')
});

// Mutation
const createUserMutation = useMutation({
  mutationFn: (userData: CreateUserData) =>
    restClient.post<User>('/users', userData)
});
```

## Configuration

### Environment Variables

Set the API base URL via environment variable:

```bash
# .env.local
NEXT_PUBLIC_API_URL=https://api.eventzflow.com
```

### Default Configuration

- **Base URL**: `process.env.NEXT_PUBLIC_API_URL` or `http://localhost:3000`
- **Timeout**: 30 seconds
- **Content-Type**: `application/json`
- **Retry Limit**: 3 attempts
- **Retry Methods**: GET, POST, PUT, DELETE, PATCH
- **Retry Status Codes**: 408, 429, 500, 502, 503, 504

## Type Safety

The client is fully typed with TypeScript generics:

```typescript
// Type-safe response
interface User {
  id: number;
  name: string;
  email: string;
}

const users = await restClient.get<User[]>('/users');
// users is typed as User[]

const user = await restClient.post<User>('/users', userData);
// user is typed as User
```

## Development vs Production

### Development Mode

- Debug logging enabled
- Detailed request/response information
- Console output for troubleshooting

### Production Mode

- Debug logging disabled
- Minimal console output
- Optimized performance

## Best Practices

### 1. Use TypeScript Interfaces

```typescript
interface User {
  id: number;
  name: string;
  email: string;
}

const users = await restClient.get<User[]>('/users');
```

### 2. Handle Errors Appropriately

```typescript
try {
  const data = await restClient.get<Data>('/endpoint');
  // Success handling
} catch (error) {
  // Error handling
  if (error.status === 404) {
    // Handle not found
  } else if (error.status === 500) {
    // Handle server error
  }
}
```

### 3. Use React Query for Caching

```typescript
// Good: Uses React Query for caching and state management
const { data, isLoading, error } = useQuery({
  queryKey: ['users'],
  queryFn: () => restClient.get<User[]>('/users')
});

// Avoid: Direct calls in components without caching
const [users, setUsers] = useState<User[]>([]);
useEffect(() => {
  restClient.get<User[]>('/users').then(setUsers);
}, []);
```

### 4. Consistent Error Handling

```typescript
// Centralized error handling
const handleApiError = (error: any) => {
  if (error.status === 401) {
    // Already handled by client
    return;
  }

  toast.error(`API Error: ${error.message}`);
};
```

## Troubleshooting

### Common Issues

1. **401 Unauthorized**: Check if user is logged in and token is valid
2. **Network Timeout**: Increase timeout or check network connectivity
3. **CORS Issues**: Ensure API server allows requests from your domain
4. **Type Errors**: Verify TypeScript interfaces match API response structure

### Debug Mode

Enable debug logging by setting `NODE_ENV=development`:

```bash
NODE_ENV=development npm run dev
```

### Testing

```typescript
// Mock the client for testing
jest.mock('@/utils/rest-api', () => ({
  restClient: {
    get: jest.fn(),
    post: jest.fn(),
    put: jest.fn(),
    patch: jest.fn(),
    delete: jest.fn(),
  }
}));
```

## Migration Guide

### From Previous Version

If migrating from a previous REST client:

1. **Update Imports**:
   ```typescript
   // Old
   import { protectedHttpClient } from '@/utils/rest-api';

   // New
   import { restClient } from '@/utils/rest-api';
   ```

2. **Update Method Calls**:
   ```typescript
   // Old
   const users = await protectedHttpClient.get<User[]>('/users');

   // New (same API)
   const users = await restClient.get<User[]>('/users');
   ```

3. **Remove Manual Token Handling**:
   ```typescript
   // Old - manual token management
   const token = getToken();
   const users = await fetch('/users', {
     headers: { Authorization: `Bearer ${token}` }
   });

   // New - automatic token management
   const users = await restClient.get<User[]>('/users');
   ```

## API Reference

### `restClient.get<T>(url, token?)`

Make a GET request.

**Parameters:**
- `url: string` - The endpoint URL
- `token?: string` - Optional token override

**Returns:** `Promise<T>` - Response data

### `restClient.post<T>(url, data?, token?)`

Make a POST request.

**Parameters:**
- `url: string` - The endpoint URL
- `data?: unknown` - Request body data
- `token?: string` - Optional token override

**Returns:** `Promise<T>` - Response data

### `restClient.put<T>(url, data?, token?)`

Make a PUT request.

**Parameters:**
- `url: string` - The endpoint URL
- `data?: unknown` - Request body data
- `token?: string` - Optional token override

**Returns:** `Promise<T>` - Response data

### `restClient.patch<T>(url, data?, token?)`

Make a PATCH request.

**Parameters:**
- `url: string` - The endpoint URL
- `data?: unknown` - Request body data
- `token?: string` - Optional token override

**Returns:** `Promise<T>` - Response data

### `restClient.delete<T>(url, token?)`

Make a DELETE request.

**Parameters:**
- `url: string` - The endpoint URL
- `token?: string` - Optional token override

**Returns:** `Promise<T>` - Response data
