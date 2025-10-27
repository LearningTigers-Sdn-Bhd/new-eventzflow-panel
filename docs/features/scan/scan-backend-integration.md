# Scan Page Backend Integration

This document explains how the scan page is connected to the backend to validate and check in tickets in real-time.

## Overview

The scan page allows staff to scan QR codes on tickets to check attendees into events. The system validates tickets by their `public_id` and marks them as checked in at the backend.

## Architecture

### Frontend Flow

```
User Scans QR Code
    ↓
Extract public_id from QR Code
    ↓
Rapid Duplicate Check (2-second debounce)
    ↓
Session Duplicate Check (client-side Set)
    ↓
Check Online/Offline Status
    ↓
If Online: Call Backend REST API
If Offline: Validate from localStorage data
    ↓
Backend validates & checks in ticket
    ↓
Display result to user (Success/Error/Duplicate)
    ↓
Add to local scan state (immediate feedback)
    ↓
Backend sync (successful scans persisted to DB)
```

### Clean Architecture Pattern

The scan feature follows clean code principles with separation of concerns:

```
Components (UI Layer)
    ↓
Custom Hooks (Business Logic)
    ↓
REST API Client (API Layer)
    ↓
Backend API (Data Layer)
```

**Benefits:**
- **Single Responsibility:** Each hook handles one specific concern
- **Testability:** Hooks can be tested independently
- **Reusability:** Hooks can be reused across components
- **Maintainability:** Changes are isolated to specific modules
- **No Magic Numbers:** All constants centralized in one file

### Key Components

1. **Scanner Card** (`src/components/pages/scan/scanner-card.tsx`)
   - Orchestrates the scanning process
   - Uses custom hooks for separation of concerns
   - Manages UI state and transitions

2. **Custom Hooks** (Clean Architecture)
   - `useScanner` (`src/hooks/use-scanner.ts`) - QR scanner lifecycle management
   - `useDuplicateDetection` (`src/hooks/use-duplicate-detection.ts`) - Rapid scan debouncing
   - `useTicketValidation` (`src/hooks/use-ticket-validation.ts`) - Backend validation with offline support
   - `useOfflineTicketValidation` (`src/hooks/use-offline-ticket-validation.ts`) - Offline ticket validation
   - `useScanHistory` (`src/hooks/use-scan-history.ts`) - Backend + local scan history management

3. **Shared Utilities**
   - `constants.ts` - Centralized configuration and messages
   - `status-helpers.tsx` - Status badge and icon components
   - `utils.ts` - Filtering, sorting, and export utilities

4. **REST API Client** (`src/lib/api/ticket/`)
   - `checkInTicket()` - Checks in a ticket by public_id
   - `getMyScannedTickets()` - Fetches all tickets scanned by current user
   - `getAllForOffline()` - Fetches events and tickets for offline scanning
   - Direct REST API calls to Ruby on Rails backend

5. **Backend API** (Ruby on Rails)
   - Endpoint: `PATCH /v1/tickets/:public_id/check_in`
   - Validates ticket exists
   - Checks if already checked in
   - Marks ticket as checked in
   - Tracks `scanned_by_id` for audit trail

## Backend Integration

### API Endpoint

```ruby
PATCH /v1/tickets/:public_id/check_in
```

**Request Headers:**
```
Authorization: Bearer <access_token>
```

**Response (Success - 200 OK):**
```json
{
  "id": 123,
  "public_id": "4f79a1fb-16b0-4c61-814b-88248476a716",
  "attendee_name": "John Doe",
  "attendee_email": "john@example.com",
  "attendee_phone": "+1234567890",
  "ticket_type_id": 35,
  "event_id": 21,
  "status": "scanned",
  "checked_in": true,
  "check_in_at": "2025-10-21T11:54:05.000Z",
  "custom_fields_data": null,
  "created_at": "2025-10-20T10:00:00.000Z",
  "updated_at": "2025-10-21T11:54:05.000Z",
  "ticket_type": {
    "id": 35,
    "name": "VIP Pass",
    "price": 150.00
  }
}
```

**Response (Error - 422 Unprocessable Entity):**
```json
{
  "error": "Ticket already checked in"
}
```

**Response (Error - 404 Not Found):**
```json
{
  "error": "Ticket not found"
}
```

### Frontend Implementation

#### 1. REST API Client (`src/lib/api/ticket/endpoints.ts`)

```typescript
export async function checkInTicket(publicId: string): Promise<CheckInResponse> {
  checkInTicketSchema.parse({ publicId });

  const url = `v1/tickets/${publicId}/check_in`;

  const response = await restClient.patch<BackendCheckInResponse>(url, {});

  return {
    id: response.id.toString(),
    publicId: response.public_id,
    name: response.attendee_name,
    email: response.attendee_email,
    phone: response.attendee_phone,
    ticketTypeName: response.ticket_type_name,
    value: response.value,
    checkedIn: response.checked_in,
    checkInAt: response.check_in_at,
    eventName: response.event_name,
    eventId: response.event_id.toString(),
  };
}
```

#### 2. Scanner Implementation

**Scanner Card Component** (`scanner-card.tsx`):
```typescript
export function ScannerCard({ scannedTicketIds, onScanResult, ... }) {
  // Custom hooks for separation of concerns
  const { checkAndMark } = useDuplicateDetection();
  const { validateTicket } = useTicketValidation();
  const { startScanner, stopScanner } = useScanner({
    onScanSuccess: handleScanSuccess,
  });

  const handleScanSuccess = async (decodedText: string) => {
    // 1. Debounce rapid duplicate scans
    if (checkAndMark(decodedText)) {
      return;
    }

    // 2. Validate ticket (handles local duplicate + backend check-in)
    const result = await validateTicket(decodedText, scannedTicketIds);

    // 3. Notify parent component
    onScanResult(result);
  };
}
```

**Ticket Validation Hook** (`use-ticket-validation.ts`):
```typescript
export function useTicketValidation() {
  const [isProcessing, setIsProcessing] = useState(false);
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  const { validateTicketOffline, hasOfflineData } = useOfflineTicketValidation();

  const validateTicket = async (ticketId, scannedTicketIds) => {
    // 1. Check local duplicate (session-based)
    const duplicateResult = checkLocalDuplicate(ticketId, scannedTicketIds);
    if (duplicateResult) {
      return duplicateResult;
    }

    // 2. Check if offline mode should be used
    if (!Online) {
      if (!hasOfflineData()) {
        return { status: "error", message: "No internet and no offline data" };
      }
      return validateTicketOffline(ticketId, scannedTicketIds);
    }

    // 3. Call backend to check in (online)
    setIsProcessing(true);
    try {
      const ticket = await checkInTicket(ticketId);

      return {
        status: "success",
        attendeeName: ticket.name,
        ticketType: ticket.ticketTypeName,
        eventName: ticket.eventName,
        eventId: ticket.eventId,
        // ... other fields
      };

    } catch (error) {
      // Fallback to offline if network error
      if (hasOfflineData()) {
        return validateTicketOffline(ticketId, scannedTicketIds);
      }

      const isDuplicate = error.message?.includes('already');
      return {
        status: isDuplicate ? "duplicate" : "error",
        message: error.message,
      };
    } finally {
      setIsProcessing(false);
    }
  };

  return { validateTicket, isProcessing, isOnline };
}
```

## Data Flow

### QR Code Format

The QR code contains the ticket's `public_id`:
```
4f79a1fb-16b0-4c61-814b-88248476a716
```

### Scan Result Type

```typescript
interface ScanResult {
  ticketId: string;              // public_id from QR code
  timestamp: Date;               // When scanned
  status: "success" | "error" | "duplicate";
  message: string;               // User-friendly message
  attendeeName?: string;         // From backend
  attendeeEmail?: string;        // From backend
  attendeePhone?: string;        // From backend
  ticketType?: string;           // From backend
  ticketValue?: number;          // From backend
  seatNumber?: string;           // Seat assignment (if applicable)
  checkedIn?: boolean;           // From backend
  checkInAt?: string | null;     // From backend
}

export type ScanStatus = ScanResult["status"];
export type FilterType = "all" | ScanStatus;
export type SortType = "newest" | "oldest" | "status";
```

## Duplicate Detection

The system has **three levels** of duplicate detection:

### 1. Rapid Scan Debouncing (Immediate)
**Hook:** `useDuplicateDetection`
- Prevents scanning the same QR code within 2 seconds
- Uses refs to track last scanned code and timestamp
- No API call, no UI update - just ignores rapid duplicates
- Prevents accidental double-scans

### 2. Client-Side Session Tracking (Before API)
**Hook:** `useTicketValidation.checkLocalDuplicate()`
- Prevents scanning tickets already checked in during this session
- Uses a `Set<string>` to track successfully scanned ticket IDs
- Immediate feedback without API call
- Cleared when user clears scan history
- Shows "Duplicate Scan" error with yellow badge

### 3. Server-Side Validation (Database)
**Backend:** Rails API check
- Backend checks if ticket is already checked in (in database)
- Returns 422 error if already checked in
- Persists across all devices and sessions
- Source of truth for ticket status
- Shows "Already Checked In" error with yellow badge

## Error Handling

### Network Errors
```typescript
catch (error) {
  toast.error("Network Error", {
    description: "Please check your internet connection",
  });
}
```

### Ticket Not Found (404)
```typescript
toast.error("Invalid Ticket", {
  description: "Ticket not found in system",
});
```

### Already Checked In (422)
```typescript
toast.error("Already Checked In", {
  description: "This ticket has already been checked in",
});
```

### Unauthorized (401)
- Automatically handled by REST client
- Refreshes access token
- Retries request
- If refresh fails, redirects to login

### Offline Mode
```typescript
// If network error and offline data available, fallback to offline
if (isNetworkError && hasOfflineData()) {
  toast.warning("Network Error", {
    description: "Switching to offline mode",
  });
  return validateTicketOffline(ticketId, scannedTicketIds);
}
```

## Features

### Offline Capability
**Managed by:** `useOfflineTicketValidation` hook and `StorageStatus` component
- **Data Sync** - Download events and tickets to localStorage for offline use
- **Offline Validation** - Validate and check-in tickets without internet connection
- **Auto-Fallback** - Automatically switches to offline mode when network fails
- **Local Storage** - Stores up to 1000 tickets with full metadata
- **Sync Status** - Shows last sync time and count of downloaded data
- **Clear Data** - Option to clear offline data to free up space

## Features

### Real-Time Scanning
**Managed by:** `useScanner` hook
- Camera activates when user clicks "Activate Scanner"
- Continuously scans for QR codes at 10 FPS
- 2-second debounce prevents rapid duplicate scans
- Audio feedback (800Hz beep = success, 400Hz beep = error)
- Automatic cleanup on component unmount
- State management prevents multiple rapid clicks

### Persistent Scan History
**Managed by:** `useScanHistory` hook
- **Backend Integration** - Fetches all tickets scanned by current user from database
- **Local Merging** - Combines backend data with local scans for immediate feedback
- **Automatic Loading** - Loads on page mount from backend
- **Real-time Updates** - Shows recent scans immediately, then syncs with backend
- **Success Persistence** - Successful scans are persisted to database permanently
- **Temporary Errors** - Error/duplicate scans shown for 5 seconds then auto-removed
- **Event Filtering** - Filter by event ID (not by status)
- **Searchable** - Search by ticket ID, name, email, phone, seat number, event name
- **Sortable** - Sort by time (newest, oldest) or status
- **Exportable** - Export to CSV with all fields
- **Statistics** - Real-time stats (total, successful, errors, duplicates)

### Visual Feedback
**Managed by:** `status-helpers.tsx`
```
✅ Green - Valid ticket checked in successfully
❌ Red - Invalid ticket or error
⚠️ Yellow - Duplicate scan (already checked in)
```

All status indicators are defined in `constants.ts` with consistent:
- Background colors (light/dark mode support)
- Border colors
- Icon backgrounds
- Text colors
- Labels

Components use shared `StatusBadge` and `getStatusIcon` utilities for consistency.

## Testing

### Manual Testing

1. **Valid Ticket Scan:**
   - Generate a ticket in the system
   - Display the QR code (public_id)
   - Scan with the scanner
   - Should show success with attendee details

2. **Duplicate Scan:**
   - Scan the same ticket twice
   - First scan: Success
   - Second scan: Duplicate error

3. **Invalid Ticket:**
   - Scan a random QR code or invalid public_id
   - Should show "Ticket not found" error

4. **Network Error:**
   - Disconnect internet
   - Try to scan a ticket
   - Should show network error

### Backend Verification

Check backend logs to verify the API calls:
```ruby
Started PATCH "/v1/tickets/4f79a1fb-16b0-4c61-814b-88248476a716/check_in"
Processing by V1::TicketsController#global_check_in
Completed 200 OK
```

### Scanned By Tracking

The backend automatically tracks which user scanned each ticket:

**Backend Update Required:**
```ruby
# In app/controllers/v1/tickets_controller.rb
# Update global_check_in method:

if @ticket.update(
  checked_in: true,
  check_in_at: Time.current,
  status: :scanned,
  scanned_by_id: current_user.id  # <-- Add this line
)
```

This saves:
- `scanned_by_id` - ID of the user who scanned the ticket
- `check_in_at` - Timestamp when ticket was scanned
- `checked_in` - Boolean flag set to true
- `status` - Changed to "scanned"

## Configuration

### Centralized Constants

All configuration is centralized in `src/components/pages/scan/constants.ts`:

```typescript
// Scanner settings
SCANNER_CONFIG = {
  FPS: 10,
  QRBOX_SIZE: 256,
  DEBOUNCE_TIME_MS: 2000,
  // ...
}

// Storage settings
STORAGE_CONFIG = {
  MAX_HISTORY_ITEMS: 1000,
  SCAN_HISTORY_KEY: "scan_history",
  // ...
}

// UI timing
UI_TIMING = {
  RECENT_SCAN_DISPLAY_MS: 3000,
  MAX_RECENT_SCANS: 10,
}

// All error/success messages
ERROR_MESSAGES = { ... }
SUCCESS_MESSAGES = { ... }

// Audio configuration
AUDIO_CONFIG = {
  SUCCESS_FREQUENCY: 800,
  ERROR_FREQUENCY: 400,
  // ...
}
```

### Backend URL

Set in `src/utils/rest-api.ts`:
```typescript
const BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001";
```

### Authentication

Uses Bearer token from Better Auth session:
```typescript
Authorization: Bearer <access_token_from_auth_store>
```

The REST client automatically includes the Bearer token in all requests.

## Troubleshooting

### Issue: "No route matches [GET] /v1/tickets/:public_id"
**Cause:** Frontend trying to use GET endpoint that doesn't exist
**Solution:** Use only the check_in endpoint (PATCH)

### Issue: Scanner not activating
**Cause:** Camera permissions denied or not available
**Solution:** Ensure HTTPS or localhost, grant camera permissions

### Issue: Always getting "Network Error"
**Cause:** Backend URL misconfigured or CORS issue
**Solution:** Check `NEXT_PUBLIC_API_URL` environment variable

### Issue: "Unauthorized" errors
**Cause:** Access token expired or invalid
**Solution:** tRPC client should auto-refresh; check auth flow

## Future Enhancements

1. **Offline Support**
   - Queue scans when offline
   - Sync when connection restored

2. **Batch Check-In**
   - Check in multiple tickets at once
   - Useful for group entries

3. **Location-Based Check-In**
   - Restrict check-in to specific locations
   - GPS verification

4. **Analytics**
   - Real-time check-in statistics
   - Peak time analysis

5. **Staff Assignment**
   - Track which staff member checked in each ticket
   - Audit trail

## Code Structure

### File Organization

```
src/
├── components/pages/scan/
│   ├── constants.ts           # All configuration & messages
│   ├── types.ts              # TypeScript interfaces
│   ├── utils.ts              # Filter, sort, export utilities
│   ├── status-helpers.tsx    # Status badge components
│   ├── page.tsx              # Main scan page
│   ├── scanner-card.tsx      # QR scanner component
│   ├── recent-scan-card.tsx  # Recent scan display
│   ├── activity-feed.tsx     # Scan history table
│   ├── stats-grid.tsx        # Statistics cards
│   ├── storage-status.tsx    # Offline storage sync UI
│   └── empty-state.tsx       # Empty state UI
│
├── hooks/
│   ├── use-scanner.ts              # Scanner lifecycle
│   ├── use-duplicate-detection.ts  # Debounce logic
│   ├── use-ticket-validation.ts    # Online/offline validation
│   ├── use-offline-ticket-validation.ts  # Offline validation logic
│   └── use-scan-history.ts         # Backend + local history
│
└── lib/api/ticket/
    ├── endpoints.ts          # REST API calls (checkInTicket, getMyScannedTickets, etc.)
    ├── request.ts            # Request schemas (Zod)
    └── response.ts           # Response types
```

### Key Files Explained

**constants.ts** - Single source of truth for all configuration:
- Scanner settings (FPS, QR box size, debounce time)
- Storage keys and limits
- UI timing values
- Error and success messages
- Audio frequencies
- Status color variants

**Custom Hooks:**
- Each hook has a single, well-defined responsibility
- Easy to test in isolation
- Reusable across components
- Follow React hooks best practices

**Components:**
- UI-focused, minimal business logic
- Use shared constants and helpers
- Consistent styling via status-helpers

## Related Documentation

- [Frontend Structure](./frontend-structure.md)
- [REST API Implementation Guide](./rest-api-approach-1-server-side-trpc.md)
- [Backend Auth Integration](./backend-auth-integration.md)
