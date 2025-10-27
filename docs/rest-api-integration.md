# REST API Integration Documentation

## Overview

This document describes the new API module structure implemented in the EventzFlow panel application. The API modules have been refactored to follow a consistent pattern that separates concerns and improves maintainability.

## New Structure

All API modules are now located under `src/lib/api/` and follow a consistent file organization pattern:

```
src/lib/api/
├── auth/
│   ├── request.ts      # Request schemas and validation
│   ├── response.ts     # Response types and schemas
│   ├── endpoints.ts    # API endpoint functions
│   └── index.ts        # Re-exports all public APIs
├── dashboard/
│   ├── request.ts      # Request schemas and validation
│   ├── response.ts     # Response types and schemas
│   ├── endpoints.ts    # API endpoint functions
│   └── index.ts        # Re-exports all public APIs
├── event/
│   ├── request.ts      # Request schemas and validation
│   ├── response.ts     # Response types and schemas
│   ├── endpoints.ts    # API endpoint functions
│   └── index.ts        # Re-exports all public APIs
├── health/
│   ├── request.ts      # Request schemas and validation
│   ├── response.ts     # Response types and schemas
│   ├── endpoints.ts    # API endpoint functions
│   └── index.ts        # Re-exports all public APIs
└── ticket/
    ├── request.ts      # Request schemas and validation
    ├── response.ts     # Response types and schemas
    ├── endpoints.ts    # API endpoint functions
    └── index.ts        # Re-exports all public APIs
```

## File Organization Pattern

### `request.ts`
Contains Zod schemas for request validation and TypeScript types for request data:
- Form validation schemas
- Request type definitions
- Input validation rules

### `response.ts`
Contains TypeScript types for API responses:
- Frontend types (transformed from backend)
- Backend response types (raw API responses)
- Response schemas for validation

### `endpoints.ts`
Contains the actual API endpoint functions:
- HTTP client calls
- Data transformation logic
- Error handling
- Business logic

### `index.ts`
Re-exports all public APIs from the module:
- Makes all exports available from the module root
- Provides a clean public interface
- Enables tree-shaking

## Module Details

### Auth Module (`src/lib/api/auth/`)

**Purpose**: Authentication and user management

**Request Types**:
- `LoginRequest` - Login credentials
- `RegisterRequest` - User registration data
- `RefreshTokenRequest` - Token refresh data

**Response Types**:
- `User` - User profile information
- `AuthResponse` - Authentication response
- `RefreshTokenResponse` - Token refresh response

**Endpoints**:
- `login()` - User login
- `register()` - User registration
- `logout()` - User logout
- `refreshToken()` - Token refresh
- `getAccessToken()` - Get current access token
- `isTokenExpired()` - Check token expiration

### Dashboard Module (`src/lib/api/dashboard/`)

**Purpose**: Dashboard analytics and statistics

**Request Types**:
- Currently no request schemas (read-only operations)

**Response Types**:
- `AllEventsStats` - Summary statistics
- `EventOverview` - Event overview data
- `EventAnalytics` - Detailed event analytics
- `RecentScan` - Recent scan information
- `ChartDataPoint` - Chart data points

**Endpoints**:
- `getAllEventsStats()` - Get summary statistics
- `getEventsOverview()` - Get events overview
- `getEventAnalytics()` - Get detailed event analytics

### Event Module (`src/lib/api/event/`)

**Purpose**: Event management operations

**Request Types**:
- `CreateEventRequest` - Event creation data
- `UpdateEventRequest` - Event update data

**Response Types**:
- `Event` - Event information
- `EventDetails` - Detailed event information
- `BackendEvent` - Raw backend event data

**Endpoints**:
- `getEvents()` - Get all events
- `createEvent()` - Create new event
- `updateEvent()` - Update existing event
- `getEventById()` - Get event by ID

### Health Module (`src/lib/api/health/`)

**Purpose**: System health monitoring

**Request Types**:
- No request schemas (read-only operations)

**Response Types**:
- Returns boolean for health status

**Endpoints**:
- `healthCheckQuery()` - Health check query options

### Ticket Module (`src/lib/api/ticket/`)

**Purpose**: Ticket operations and management

**Request Types**:
- `CheckInRequest` - Ticket check-in data

**Response Types**:
- `Ticket` - Ticket information
- `ScannedTicket` - Scanned ticket data
- `CheckInResponse` - Check-in response
- `BackendTicket` - Raw backend ticket data
- `BackendCheckInResponse` - Raw backend check-in response

**Endpoints**:
- `checkInTicket()` - Check in a ticket
- `getMyScannedTickets()` - Get tickets scanned by current user
- `getEventTickets()` - Get tickets for specific event

## Migration Guide

### Import Changes

All imports have been updated from the old structure to the new structure:

```typescript
// Old imports
import { login } from "@/lib/auth";
import { getEvents } from "@/lib/event";
import { getAllEventsStats } from "@/lib/dashboard";
import { checkInTicket } from "@/lib/ticket";
import { healthCheckQuery } from "@/lib/health";

// New imports
import { login } from "@/lib/api/auth";
import { getEvents } from "@/lib/api/event";
import { getAllEventsStats } from "@/lib/api/dashboard";
import { checkInTicket } from "@/lib/api/ticket";
import { healthCheckQuery } from "@/lib/api/health";
```

### Usage Examples

The API usage remains the same, only the import paths have changed:

```typescript
// Authentication
import { login, register, logout } from "@/lib/api/auth";

// Event management
import { getEvents, createEvent, updateEvent } from "@/lib/api/event";

// Dashboard analytics
import { getAllEventsStats, getEventAnalytics } from "@/lib/api/dashboard";

// Ticket operations
import { checkInTicket, getMyScannedTickets } from "@/lib/api/ticket";

// Health monitoring
import { healthCheckQuery } from "@/lib/api/health";
```

## Benefits of New Structure

### 1. **Separation of Concerns**
- Request validation is separated from business logic
- Response types are clearly defined
- API endpoints focus on HTTP communication

### 2. **Improved Maintainability**
- Consistent file organization across all modules
- Easy to locate specific functionality
- Clear boundaries between different aspects

### 3. **Better Type Safety**
- Request and response types are explicitly defined
- Zod schemas provide runtime validation
- TypeScript provides compile-time type checking

### 4. **Enhanced Developer Experience**
- IntelliSense works better with organized imports
- Easier to understand module structure
- Clear public API through index.ts files

### 5. **Scalability**
- Easy to add new modules following the same pattern
- Simple to extend existing modules
- Consistent patterns reduce cognitive load

## Best Practices

### 1. **Import Organization**
Always import from the module root, not individual files:

```typescript
// Good
import { login, register } from "@/lib/api/auth";

// Avoid
import { login } from "@/lib/api/auth/endpoints";
import { register } from "@/lib/api/auth/endpoints";
```

### 2. **Type Usage**
Use the exported types for better type safety:

```typescript
import { type LoginRequest, login } from "@/lib/api/auth";

const loginData: LoginRequest = {
  user: { email: "user@example.com", password: "password" }
};
```

### 3. **Error Handling**
The API endpoints handle errors consistently, but you should still handle them in your components:

```typescript
try {
  const events = await getEvents();
  // Handle success
} catch (error) {
  // Handle error
  console.error("Failed to fetch events:", error);
}
```

### 4. **React Query Integration**
Use the API functions with React Query for caching and state management:

```typescript
import { useQuery } from "@tanstack/react-query";
import { getEvents } from "@/lib/api/event";

const { data: events, isLoading, error } = useQuery({
  queryKey: ["events"],
  queryFn: getEvents,
});
```

## Future Enhancements

### 1. **Request Validation**
Add more comprehensive request validation schemas as needed.

### 2. **Response Caching**
Implement response caching strategies for better performance.

### 3. **Error Types**
Define specific error types for better error handling.

### 4. **API Versioning**
Add support for API versioning when needed.

### 5. **Testing Utilities**
Add testing utilities for mocking API responses.

## Conclusion

The new API module structure provides a solid foundation for the EventzFlow panel application. It improves code organization, type safety, and maintainability while following consistent patterns across all modules. This structure will make it easier to add new features and maintain existing functionality as the application grows.
