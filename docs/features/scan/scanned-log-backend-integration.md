# Scanned Log Backend Integration

This document describes how the scanned log feature connects to the Rails backend API.

## Overview

The scanned log displays all tickets that have been scanned/checked-in for a specific event. The data is fetched from the Rails backend API and displayed in a responsive table format.

## ✅ No Backend Changes Required!

This implementation uses **frontend-only logic** to display location data by fetching and combining data from two existing endpoints:
1. `GET /v1/events/:event_id/tickets` - Gets scanned tickets
2. `GET /v1/events/:event_id/event_locations` - Gets locations with assigned members

## API Endpoints Used

### 1. Get Tickets
**Endpoint:** `GET /v1/events/:event_id/tickets`
**Authentication:** Required (Bearer token)

**Response:**
```json
[
  {
    "id": 1,
    "public_id": "uuid-here",
    "attendee_name": "John Doe",
    "attendee_email": "john@example.com",
    "attendee_phone": "+1234567890",
    "checked_in": true,
    "check_in_at": "2025-10-21T10:30:00Z",
    "scanned_by_id": 10,
    "scanned_by": {
      "id": 10,
      "full_name": "Jane Smith"
    },
    "status": "scanned",
    "ticket_type": {
      "id": 1,
      "name": "VIP Ticket",
      "price": "99.99"
    }
  }
]
```

### 2. Get Event Locations
**Endpoint:** `GET /v1/events/:event_id/event_locations`
**Authentication:** Required (Bearer token)

**Response:**
```json
[
  {
    "id": 1,
    "name": "Main Entrance",
    "scan_limit": 100,
    "members": [
      {
        "id": 10,
        "full_name": "Jane Smith",
        "email": "jane@example.com"
      }
    ]
  }
]
```

## Frontend Implementation

### File: `references/routers/event/scan-log.ts`

This tRPC router handles:

1. **Parallel API Calls** - Fetches tickets and locations simultaneously
2. **Location Mapping** - Creates a user_id → location_name lookup map
3. **Filtering** - Shows only scanned tickets (`status === "scanned"` and `checked_in === true`)
4. **Data Transformation** - Maps backend data to frontend `ScannedLog` type
5. **Error Handling** - Graceful fallbacks

### Key Features

#### 1. Parallel Data Fetching

```typescript
const [tickets, locations] = await Promise.all([
  protectedHttpClient.get(`v1/events/${eventId}/tickets`, token),
  protectedHttpClient.get(`v1/events/${eventId}/event_locations`, token),
]);
```

#### 2. Location Lookup Map

Creates a map of user_id → location_name:
```typescript
const userLocationMap = new Map<number, string>();
for (const location of locations) {
  for (const member of location.members) {
    userLocationMap.set(member.id, location.name);
  }
}
```

#### 3. Scanned By Display Logic

The `scannedBy` field shows:
- **User's full name** if `scanned_by` data is available (e.g., "Jane Smith")
- **"Auto Check-in"** if `scanned_by_id` is `null` (automatic/system check-in)
- **"Staff ID: X"** as fallback if ID exists but no user data (shouldn't happen)

#### 4. Location Display Logic

The `locationName` field shows:
- **Location name** from the map if user is assigned (e.g., "Main Entrance")
- **"General Access"** if staff member is not assigned to any specific location
- **"N/A"** if ticket was auto-checked-in (no scanned_by_id)

```typescript
const locationName = ticket.scanned_by_id
  ? (userLocationMap.get(ticket.scanned_by_id) || "General Access")
  : "N/A";
```

#### 5. Data Mapping

Backend fields are mapped to frontend format:
- `public_id` → `id` (display ID)
- `attendee_name` → `name`
- `attendee_email` → `email`
- `attendee_phone` → `phone` (or "N/A" if null)
- `scanned_by.full_name` → `scannedBy`
- Lookup from map → `locationName`
- `check_in_at` → `checkedInAt` (fallback to `created_at`)
- `status` → `status` ("scanned" or "not_scanned")

### File: `src/components/pages/scanned-log/content.tsx` (if exists)

The frontend component:

```typescript
const {
  data: scannedLogs,
  isLoading,
  error,
} = useQuery(trpc.event.scanLog.getScanLogs.queryOptions({ eventId }));
```

Features:
- **Loading state** while fetching data
- **Error state** with retry button
- **Data table** for displaying scan logs
- **Responsive design** (desktop table, tablet grid, mobile cards)

## Data Flow

```
Frontend Component
    ↓
tRPC Client (getScanLogs)
    ↓
tRPC Router (references/routers/event/scan-log.ts)
    ↓
Parallel REST API Calls:
    ├─ GET /v1/events/:id/tickets (scanned tickets)
    └─ GET /v1/events/:id/event_locations (locations + members)
    ↓
Create user_id → location_name map
    ↓
Filter scanned tickets
    ↓
Map to ScannedLog type (with location lookup)
    ↓
Return to Frontend
    ↓
Display in DataTable
```

## Error Handling

The implementation includes robust error handling:

1. **No token available:** Returns empty array with console error
2. **API request fails:** Catches error, logs it, returns empty array
3. **Graceful degradation:** UI won't break even if API fails

## Testing

To test the integration:

1. **Create event locations** and assign staff members to them
2. **Create test tickets** and scan them with different staff members
3. **View scanned log** page for the event
4. **Verify** the following displays correctly:
   - **Scanned By**: Shows staff member's full name (e.g., "Jane Smith")
   - **Location**: Shows assigned location (e.g., "Main Entrance")
   - **Unassigned staff**: Shows "General Access"
   - **Auto check-in**: Shows "Auto Check-in" for scanned by, "N/A" for location

## Performance Considerations

**Why this approach is efficient:**

1. ✅ **Parallel fetching** - Tickets and locations are fetched simultaneously (not sequential)
2. ✅ **Single map creation** - O(n*m) where n=locations, m=members per location (usually small)
3. ✅ **O(1) location lookup** - Using Map for constant-time lookups per ticket
4. ✅ **No N+1 queries** - All data fetched in 2 API calls regardless of ticket count
5. ✅ **Client-side caching** - TanStack Query caches the result

**Example performance:**
- 100 tickets, 5 locations, 20 total staff members
- 2 API calls (parallel)
- Map creation: 20 iterations
- Ticket mapping: 100 lookups (O(1) each)
- Total: Very fast! ⚡

## Future Enhancements

Potential improvements:

1. **Real-time updates:** WebSocket for live scan log updates
2. **Export functionality:** Download scan logs as CSV/Excel
3. **Advanced filtering:** Filter by location, staff member, date range
4. **Scan analytics:** Charts showing scan patterns over time
5. **Cache optimization:** Shared cache between scan log and location pages
