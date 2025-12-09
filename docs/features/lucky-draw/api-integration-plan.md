# Lucky Draw Feature - API Integration Plan

## Overview

This document outlines the planned backend API integration for the Lucky Draw feature. The integration will follow the existing REST API patterns used in the EventzFlow panel application, replacing the current frontend-only localStorage implementation with a full backend integration.

**Integration Strategy**: REST API endpoints following existing patterns in `src/lib/api/`

**API Module Location**: `src/lib/api/lucky-draw/`

**Data Flow**: TanStack Query → API calls → Backend → Database

**Key Principle**: **No client-side persistence (no localStorage)**. All data comes from the backend API. TanStack Query handles caching and state management. Zustand store is used only for UI state (e.g., `isDrawing` animation state).

## DB Tables Plan

### lucky_draw_configs (1:1 with event)

One-to-one relationship with the events table. Each event can have one lucky draw configuration.

**Table Structure**:
- `id`: Primary key (integer, auto-increment)
- `event_id`: Foreign key (integer, unique, references `events.id`)
- `draw_style`: Enum ('wheel', 'slot', 'box')
- `use_gifts`: Boolean (default: false)
- `created_at`: Timestamp
- `updated_at`: Timestamp

**Constraints**:
- Unique constraint on `event_id` (one config per event)
- Foreign key constraint on `event_id` referencing `events.id`

**Default Values**:
- `draw_style`: 'wheel'
- `use_gifts`: false

### gifts (1:M with event)

One-to-many relationship with events. Each event can have multiple gifts.

**Table Structure**:
- `id`: Primary key (integer, auto-increment)
- `event_id`: Foreign key (integer, references `events.id`)
- `name`: String (gift/prize name)
- `order`: Integer (for drag-and-drop ordering, default: 0)
- `winner_counts`: Integer (count of winners for this gift, default: 0)
- `created_at`: Timestamp
- `updated_at`: Timestamp

**Constraints**:
- Foreign key constraint on `event_id` referencing `events.id`
- Index on `event_id` for efficient queries
- Index on `order` for sorting

**Note**: `winner_counts` is managed client-side. The frontend will provide an input field for this value.

### gift_winners (1:M with gift, references ticket/visitor)

One-to-many relationship with gifts. Each gift can have multiple winners. Each winner references either a ticket or a visitor.

**Table Structure**:
- `id`: Primary key (integer, auto-increment)
- `gift_id`: Foreign key (integer, references `gifts.id`)
- `ticket_id`: Foreign key (integer, nullable, references `tickets.id`)
- `visitor_id`: Foreign key (integer, nullable, references `visitors.id`)
- `drawn_at`: Timestamp (when the draw occurred)
- `created_at`: Timestamp
- `updated_at`: Timestamp

**Constraints**:
- Foreign key constraint on `gift_id` referencing `gifts.id`
- Foreign key constraint on `ticket_id` referencing `tickets.id` (nullable)
- Foreign key constraint on `visitor_id` referencing `visitors.id` (nullable)
- Check constraint: Exactly one of `ticket_id` or `visitor_id` must be non-null
- Index on `gift_id` for efficient queries
- Index on `ticket_id` for efficient queries
- Index on `visitor_id` for efficient queries

**Constraints**:
- Foreign key constraint on `gift_id` referencing `gifts.id`
- Foreign key constraint on `ticket_id` referencing `tickets.id` (nullable, with cascade delete)
- Foreign key constraint on `visitor_id` referencing `visitors.id` (nullable, with cascade delete)
- Check constraint: Exactly one of `ticket_id` or `visitor_id` must be non-null
- Index on `gift_id` for efficient queries
- Index on `ticket_id` for efficient queries
- Index on `visitor_id` for efficient queries

**Note**:
- One gift can have multiple winners (1:M relationship). The constraint ensures each winner entry references either a ticket or a visitor, but not both.
- When a ticket or visitor is deleted, all associated winner records are cascade deleted.
- When a gift is deleted, all associated winners are cascade deleted.

### invalid_participants (event-scoped, references ticket/visitor)

Event-scoped table that tracks participants who should be excluded from draws. Each entry references either a ticket or a visitor, and is scoped to a specific event.

**Table Structure**:
- `id`: Primary key (integer, auto-increment)
- `event_id`: Foreign key (integer, references `events.id`)
- `ticket_id`: Foreign key (integer, nullable, references `tickets.id`)
- `visitor_id`: Foreign key (integer, nullable, references `visitors.id`)
- `created_at`: Timestamp
- `updated_at`: Timestamp

**Constraints**:
- Foreign key constraint on `event_id` referencing `events.id`
- Foreign key constraint on `ticket_id` referencing `tickets.id` (nullable, with cascade delete)
- Foreign key constraint on `visitor_id` referencing `visitors.id` (nullable, with cascade delete)
- Check constraint: Exactly one of `ticket_id` or `visitor_id` must be non-null
- Unique constraint using partial indexes to handle nulls properly:
  - Unique on `(event_id, ticket_id)` where `ticket_id IS NOT NULL`
  - Unique on `(event_id, visitor_id)` where `visitor_id IS NOT NULL`
- Index on `event_id` for efficient queries
- Index on `ticket_id` for efficient queries
- Index on `visitor_id` for efficient queries

**Note**:
- This table is event-scoped, meaning each event maintains its own list of invalid participants. A participant invalid in one event is not automatically invalid in another event.
- The unique constraint handles nulls properly - when using ticket system, `visitor_id` is null, and vice versa.
- When a ticket or visitor is deleted, all associated invalid participant records are cascade deleted.

## REST API Routes and Output

All endpoints follow the pattern: `/v1/events/:event_id/lucky_draw/...`

**Response Format**: All endpoints follow the standard API response format:
```typescript
{
  success: boolean;
  message: string;
  data?: T;  // Response data (if applicable)
  meta?: object;  // Optional metadata
}
```

**Authorization**:
- **Config Management** (GET/PUT config): Event admins and org admins
- **Winner Assignment** (POST/DELETE winners): Event admins, team members, and org admins
- **Participant Viewing** (GET participants): Same as viewing tickets/visitors (event admins, team members, org admins)

### Configuration Endpoints

#### GET /v1/events/:event_id/lucky_draw/config

Retrieves the lucky draw configuration for an event.

**Response**:
```typescript
{
  success: true;
  message: "Success";
  data: {
    id: number;
    event_id: number;
    draw_style: 'wheel' | 'slot' | 'box';
    use_gifts: boolean;
    created_at: string;
    updated_at: string;
  }
}
```

**Used by**: Store initialization, configuration display in UI

**Error Handling**: Returns 404 if config doesn't exist. Backend should create default config (draw_style: 'wheel', use_gifts: false) on first access.

#### PUT /v1/events/:event_id/lucky_draw/config

Updates the lucky draw configuration for an event.

**Request Body**:
```typescript
{
  draw_style?: 'wheel' | 'slot' | 'box';
  use_gifts?: boolean;
}
```

**Response**:
```typescript
{
  success: true;
  message: "Success";
  data: {
    id: number;
    event_id: number;
    draw_style: 'wheel' | 'slot' | 'box';
    use_gifts: boolean;
    created_at: string;
    updated_at: string;
  }
}
```

**Used by**: Configuration sheet updates when user changes draw style or toggles Use Gifts

### Gift Endpoints

#### GET /v1/events/:event_id/lucky_draw/gifts

Retrieves all gifts for an event, including their winners.

**Response**:
```typescript
{
  success: true;
  message: "Success";
  data: [
    {
      id: number;
      event_id: number;
      name: string;
      order: number;
      winner_counts: number;
      winners: GiftWinner[];
      created_at: string;
      updated_at: string;
    }
  ]
}
```

**Used by**: Gift list display, winner assignment display

#### POST /v1/events/:event_id/lucky_draw/gifts

Creates a new gift for an event.

**Request Body**:
```typescript
{
  name: string;
  order?: number; // Optional, defaults to last position (MAX(order) + 1, or 1 if no gifts exist)
}
```

**Response**:
```typescript
{
  success: true;
  message: "Success";
  data: {
    id: number;
    event_id: number;
    name: string;
    order: number;
    winner_counts: number;
    winners: [];
    created_at: string;
    updated_at: string;
  }
}
```

**Used by**: Add gift action in configuration sheet

**Note**: If `order` is not provided, backend calculates it as `MAX(order) + 1` from existing gifts, or `1` if no gifts exist.

#### PUT /v1/events/:event_id/lucky_draw/gifts/:gift_id

Updates a gift (name or order).

**Request Body**:
```typescript
{
  name?: string;
  order?: number;
}
```

**Response**:
```typescript
{
  success: true;
  message: "Success";
  data: {
    id: number;
    event_id: number;
    name: string;
    order: number;
    winner_counts: number;
    winners: GiftWinner[];
    created_at: string;
    updated_at: string;
  }
}
```

**Used by**: Gift reordering (drag-and-drop), gift name updates

#### DELETE /v1/events/:event_id/lucky_draw/gifts/:gift_id

Deletes a gift and all associated winners (hard delete, cascade).

**Response**: `void` (204 No Content)

**Used by**: Remove gift action in configuration sheet

**Note**: All associated winners are cascade deleted when a gift is deleted.

### Gift Winner Endpoints

#### POST /v1/events/:event_id/lucky_draw/gifts/:gift_id/winners

Assigns a winner to a gift.

**Request Body**:
```typescript
{
  ticket_id?: number;  // Exactly one of ticket_id or visitor_id required
  visitor_id?: number;
}
```

**Response**:
```typescript
{
  success: true;
  message: "Success";
  data: {
    id: number;
    gift_id: number;
    ticket_id: number | null;
    visitor_id: number | null;
    drawn_at: string;
    created_at: string;
    updated_at: string;
  }
}
```

**Used by**: Winner assignment after draw completes

**Validation**:
- Exactly one of `ticket_id` or `visitor_id` must be provided
- The ticket/visitor must belong to the event
- Standard error response format on validation failures

**Note**:
- The same participant can win multiple different gifts (no duplicate prevention across gifts)
- When a ticket or visitor is deleted, all associated winner records are cascade deleted

#### DELETE /v1/events/:event_id/lucky_draw/gifts/:gift_id/winners/:winner_id

Removes a winner from a gift (hard delete).

**Response**: `void` (204 No Content)

**Used by**: Clear winner action in configuration sheet

#### POST /v1/events/:event_id/lucky_draw/gifts/:gift_id/winners/bulk

Assigns multiple winners to a gift in one request.

**Request Body**:
```typescript
{
  winners: [
    {
      ticket_id?: number;
      visitor_id?: number;
    }
  ]
}
```

**Response**:
```typescript
{
  success: true;
  message: "Success";
  data: [
    {
      id: number;
      gift_id: number;
      ticket_id: number | null;
      visitor_id: number | null;
      drawn_at: string;
      created_at: string;
      updated_at: string;
    }
  ]
}
```

**Used by**: Bulk winner assignment (optional use case)

**Validation**:
- Same validation rules as single winner assignment, applied to each winner in the array
- Standard error response format on validation failures
- Transactional operation: If any winner in the array fails validation, the entire request fails (all-or-nothing)

### Participant Endpoints

#### GET /v1/events/:event_id/lucky_draw/participants

Retrieves available participants for the lucky draw.

**Query Parameters**:
- `type?`: Filter by type ('ticket' | 'visitor')
- `exclude_winners?`: Boolean (default: true) - Exclude participants who won ANY gift
- `exclude_invalid?`: Boolean (default: true) - Exclude participants in invalid list

**Filtering Logic**:
- Respects event's ticket/visitor system (e.g., if `use_ticket=false`, only show visitors)
- If `exclude_winners=true`, excludes participants who have won ANY gift (not just specific gifts)
- If `exclude_invalid=true`, excludes participants in the invalid list for this event

**Response**:
```typescript
{
  success: true;
  message: "Success";
  data: [
    {
      id: number;
      name: string;
    }
  ]
}
```

**Used by**: Participant list display, available participants for draw

**Note**:
- The `id` field is the ticket ID (for ticket events) or visitor ID (for visitor events)
- The `name` field is fetched from `attendee_name` (tickets) or `full_name` (visitors) by the backend
- Backend handles determining the source (ticket vs visitor) based on event's `use_ticket` flag
- Participants with both `attendee_name` and `full_name` as null are excluded from results
- The `type` field is not included in the response - backend handles the logic internally
- `ticket_id` and `visitor_id` are not included in the response - only `id` and `name` are returned
- Respects event's ticket/visitor system (e.g., if `use_ticket=false`, only show visitors)
- If `exclude_winners=true`, excludes participants who have won ANY gift across all gifts

### Invalid Participant Endpoints

#### GET /v1/events/:event_id/lucky_draw/invalid_participants

Retrieves all invalid participants for an event.

**Response**:
```typescript
{
  success: true;
  message: "Success";
  data: [
    {
      id: number;
      event_id: number;
      participant: {
        id: number;  // ticket_id or visitor_id
        name: string;
      };
      created_at: string;
      updated_at: string;
    }
  ]
}
```

**Used by**: Invalid participants list display in configuration sheet

**Note**:
- The `participant.id` is the ticket_id or visitor_id (whichever is non-null)
- The `participant.name` is fetched from `attendee_name` (tickets) or `full_name` (visitors)
- `ticket_id` and `visitor_id` are not included in the response - only the participant object

#### POST /v1/events/:event_id/lucky_draw/invalid_participants

Adds a participant to the invalid list.

**Request Body**:
```typescript
{
  ticket_id?: number;  // Exactly one of ticket_id or visitor_id required
  visitor_id?: number;
}
```

**Response**:
```typescript
{
  success: true;
  message: "Success";
  data: {
    id: number;
    event_id: number;
    participant: {
      id: number;  // ticket_id or visitor_id
      name: string;
    };
    created_at: string;
    updated_at: string;
  }
}
```

**Used by**: Add invalid participant (when use_gifts is false and a draw completes)

**Validation**:
- Exactly one of `ticket_id` or `visitor_id` must be provided
- The ticket/visitor must belong to the event
- Standard error response format on validation failures

#### DELETE /v1/events/:event_id/lucky_draw/invalid_participants/:id

Removes a participant from the invalid list (hard delete).

**Response**: `void` (204 No Content)

**Used by**: Remove invalid participant action in configuration sheet

#### DELETE /v1/events/:event_id/lucky_draw/invalid_participants

Clears all invalid participants for an event (hard delete).

**Response**: `void` (204 No Content)

**Used by**: Clear all invalid participants action in configuration sheet

## Data Store and Hook Requirements

### Store Updates Needed

The Zustand store (`src/stores/lucky-draw-store.ts`) will be simplified to handle **UI state only**:

#### Remove localStorage Persistence

- **Remove** Zustand `persist` middleware completely
- **No client-side persistence** - all data comes from the backend API
- Store becomes a **UI state manager** rather than a data store

#### Store Responsibilities (UI State Only)

The store will manage:
- `isDrawing`: Boolean (drawing animation state)
- `eventId`: string | null (current event context)
- `eventName`: string | null (current event name)

**Note**: All data (config, gifts, participants, invalid participants) will come from TanStack Query, not the store.

#### Optional: Optimistic Updates

For better UX, the store can temporarily hold optimistic updates during mutations:
- Store optimistic state during API calls
- Revert on error
- TanStack Query will refetch and update automatically on success

### TanStack Query as Primary Data Source

All data fetching and caching will be handled by TanStack Query:
- **No loading states in store** - use `isLoading` from TanStack Query hooks
- **No error states in store** - use `error` from TanStack Query hooks
- **Automatic caching** - TanStack Query handles caching, refetching, and invalidation
- **Server as source of truth** - All data comes from API, no localStorage sync needed

### Hook Updates Needed

The `useLuckyDraw` hook (`src/hooks/use-lucky-draw.ts`) needs TanStack Query integration:

#### Add TanStack Query Integration

**Queries**:
- `useLuckyDrawConfig(eventId)`: Fetch configuration
- `useLuckyDrawGifts(eventId)`: Fetch gifts with winners
- `useLuckyDrawParticipants(eventId, options)`: Fetch participants
- `useLuckyDrawInvalidParticipants(eventId)`: Fetch invalid participants

**Mutations**:
- `useUpdateLuckyDrawConfig(eventId)`: Update configuration
- `useCreateGift(eventId)`: Create gift
- `useUpdateGift(eventId, giftId)`: Update gift
- `useDeleteGift(eventId, giftId)`: Delete gift
- `useAssignWinner(eventId, giftId)`: Assign winner
- `useClearWinner(eventId, giftId, winnerId)`: Clear winner
- `useAddInvalidParticipant(eventId)`: Add invalid participant
- `useRemoveInvalidParticipant(eventId, id)`: Remove invalid participant
- `useClearInvalidParticipants(eventId)`: Clear all invalid participants

#### Data Flow with TanStack Query

**Queries (Read Operations)**:
- All data comes from TanStack Query hooks
- TanStack Query handles caching, refetching, and background updates
- Loading states: Use `isLoading` from query hooks
- Error states: Use `error` from query hooks

**Mutations (Write Operations)**:
- Use TanStack Query mutations for all updates
- Optional optimistic updates: Update TanStack Query cache immediately, revert on error
- Automatic refetch: TanStack Query invalidates and refetches related queries on success
- Error handling: TanStack Query provides error states and retry logic

**Store Usage**:
- Store only manages UI state (`isDrawing`, `eventId`, `eventName`)
- No data persistence in store
- Store can optionally hold optimistic updates during mutations (revert on error)

#### Maintain Backward Compatibility

- Keep existing hook API surface
- Internal implementation changes only:
  - Data comes from TanStack Query instead of store
  - Store only manages UI state
- Components using the hook should not need changes

### Response Type Definitions

All response types should be defined in `src/lib/api/lucky-draw/response.ts`:

```typescript
// Configuration
export interface LuckyDrawConfig {
  id: number;
  event_id: number;
  draw_style: 'wheel' | 'slot' | 'box';
  use_gifts: boolean;
  created_at: string;
  updated_at: string;
}

// Gift
export interface Gift {
  id: number;
  event_id: number;
  name: string;
  order: number;
  winner_counts: number;
  winners: GiftWinner[];
  created_at: string;
  updated_at: string;
}

// Gift Winner
export interface GiftWinner {
  id: number;
  gift_id: number;
  ticket_id: number | null;
  visitor_id: number | null;
  drawn_at: string;
  created_at: string;
  updated_at: string;
}

// Participant
export interface Participant {
  id: number;  // ticket ID (for ticket events) or visitor ID (for visitor events)
  name: string;  // attendee_name (tickets) or full_name (visitors)
  // Note: ticket_id and visitor_id are not included - backend handles the logic internally
  // The id field represents the participant ID based on event's use_ticket flag
}

// Invalid Participant
export interface InvalidParticipant {
  id: number;
  event_id: number;
  participant: {
    id: number;  // ticket_id or visitor_id (whichever is non-null)
    name: string;
  };
  created_at: string;
  updated_at: string;
}
```

### Request Type Definitions

All request types should be defined in `src/lib/api/lucky-draw/request.ts`:

```typescript
// Update Config Request
export interface UpdateLuckyDrawConfigRequest {
  draw_style?: 'wheel' | 'slot' | 'box';
  use_gifts?: boolean;
}

// Create Gift Request
export interface CreateGiftRequest {
  name: string;
  order?: number;
}

// Update Gift Request
export interface UpdateGiftRequest {
  name?: string;
  order?: number;
}

// Assign Winner Request
export interface AssignWinnerRequest {
  ticket_id?: number;
  visitor_id?: number;
}

// Bulk Assign Winners Request
export interface BulkAssignWinnersRequest {
  winners: Array<{
    ticket_id?: number;
    visitor_id?: number;
  }>;
}

// Add Invalid Participant Request
export interface AddInvalidParticipantRequest {
  ticket_id?: number;
  visitor_id?: number;
}

// Get Participants Query
export interface GetParticipantsQuery {
  type?: 'ticket' | 'visitor';
  exclude_winners?: boolean;
  exclude_invalid?: boolean;
}
```

## Implementation Steps

1. **Create API Module Structure**:
   - Create `src/lib/api/lucky-draw/` directory
   - Create `request.ts`, `response.ts`, `endpoints.ts`, `index.ts`

2. **Define Types**:
   - Add all request and response types
   - Follow existing patterns from other API modules

3. **Implement Endpoints**:
   - Implement all GET, POST, PUT, DELETE endpoints
   - Use `restClient` from `@/utils/rest-api`
   - Add proper error handling

4. **Update Store**:
   - Add loading and error states
   - Replace localStorage with API sync
   - Add optimistic update logic

5. **Update Hook**:
   - Add TanStack Query integration
   - Add mutations with optimistic updates
   - Maintain backward compatibility

6. **Update Components**:
   - Add loading states to UI
   - Add error handling and display
   - Test all functionality

7. **Testing**:
   - Test all API endpoints
   - Test optimistic updates
   - Test error scenarios
   - Test offline behavior

## Data Consistency and Business Rules

### Gift and Winner Management

- **Gift Deletion**: When a gift is deleted, all associated winners are cascade deleted (hard delete)
- **Ticket/Visitor Deletion**: When a ticket or visitor is deleted, all associated winner records and invalid participant records are cascade deleted
- **Winner Deletion**: When a winner record is deleted, the ticket/visitor is NOT deleted (only the winner record is removed)
- **Invalid Participant Deletion**: When an invalid participant record is deleted, the ticket/visitor is NOT deleted (only the invalid record is removed)
- **Multiple Wins**: The same participant can win multiple different gifts (no duplicate prevention across gifts)
- **Winner Counts**: The `winner_counts` field on gifts is managed client-side (frontend provides input field)

### Configuration Changes

- **use_gifts Toggle**: When `use_gifts` is changed from `true` to `false` (or vice versa), existing gifts and winners are kept in the database. The frontend handles showing/hiding them based on the config value.
- **Config Deletion**: Client-side will provide warnings before turning off the lucky draw feature. Backend should handle config deletion gracefully.

### Participant Filtering

- **Event System Respect**: Participant endpoint respects the event's ticket/visitor system (e.g., if `use_ticket=false`, only show visitors)
- **Winner Exclusion**: When `exclude_winners=true`, excludes participants who have won ANY gift across all gifts for the event
- **Invalid Exclusion**: When `exclude_invalid=true`, excludes participants in the invalid list for this event

### Error Handling

- All endpoints follow standard API response format with `success`, `message`, and `data` fields
- Validation errors return standard error response format
- Bulk operations are atomic - if any item fails validation, the entire request fails

## Migration Strategy

To migrate from the current frontend-only implementation:

1. **Phase 1**: Create API module structure (`src/lib/api/lucky-draw/`)
2. **Phase 2**: Implement all API endpoints (request/response types, endpoint functions)
3. **Phase 3**: Create TanStack Query hooks for all queries and mutations
4. **Phase 4**: Update `useLuckyDraw` hook to use TanStack Query instead of localStorage
5. **Phase 5**: Remove localStorage persistence from store (remove `persist` middleware)
6. **Phase 6**: Simplify store to UI state only (remove data fields, keep only `isDrawing`, `eventId`, `eventName`)

**Key Principle**: No localStorage persistence. All data comes from the backend API via TanStack Query. The store is only for UI state management.

## Implementation Notes

### Backend Implementation Changes

The following changes were made during backend implementation:

1. **Participant Response Format**: The participant response was simplified to only return `{id, name}` instead of `{id, name, ticket_id, visitor_id}`. The `id` field represents the ticket ID (for ticket events) or visitor ID (for visitor events), and the backend handles determining the source based on the event's `use_ticket` flag.

2. **Controller Namespace**: All controllers are located in `app/controllers/v1/lucky_draw/` namespace to match the route structure.

3. **Request Parameters**: Request parameters are accepted at the root level (not nested under resource names) to match the API specification exactly.

4. **Policy Method**: Added `destroy_all?` method to `InvalidParticipantPolicy` to authorize the `destroy_all` action.
