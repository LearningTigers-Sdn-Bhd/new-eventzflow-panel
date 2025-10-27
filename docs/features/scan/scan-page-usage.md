# Scan Page - Ticket Scanner

## Overview

The Scan page provides a camera-based QR code scanning functionality for validating event tickets in real-time. It uses the device's camera to detect and validate ticket QR codes.

## File Structure

```
src/components/pages/scan/
├── page.tsx                 # Main scan page component (orchestrates all components)
├── scanner-card.tsx         # QR scanner component with camera controls
├── stats-grid.tsx          # Statistics dashboard (Total, Valid, Invalid, Duplicate, Success Rate)
├── activity-feed.tsx       # Scan history table with search/filter/sort
├── recent-scan-card.tsx    # Recent scan display card
├── storage-status.tsx      # Offline data sync UI
├── empty-state.tsx         # Empty state when no scans exist
├── types.ts                # TypeScript type definitions
├── constants.ts            # Centralized configuration and messages
├── status-helpers.tsx      # Status badge and icon components
└── utils.ts                # Utility functions (filtering, sorting, export)

src/hooks/
├── use-scanner.ts              # QR scanner lifecycle management
├── use-duplicate-detection.ts  # Rapid scan debouncing
├── use-ticket-validation.ts    # Online/offline ticket validation
├── use-offline-ticket-validation.ts  # Offline validation logic
└── use-scan-history.ts         # Backend + local scan history

src/lib/api/ticket/
├── endpoints.ts          # REST API calls
├── request.ts            # Request schemas (Zod)
└── response.ts           # Response types
```

### Component Hierarchy

```
page.tsx (Main Container)
├── StorageStatus
│   ├── Events Count
│   ├── Tickets Count
│   ├── Last Sync Time
│   └── Sync/Clear Actions
├── ScannerCard
│   ├── Camera Scanner (html5-qrcode)
│   ├── Start/Stop Controls
│   └── Recent Scans Panel (desktop only)
├── StatsGrid (shown when scans exist)
│   ├── Total Scans Card
│   ├── Valid Scans Card
│   ├── Invalid Scans Card
│   ├── Duplicate Scans Card
│   └── Success Rate Card
└── ActivityFeed
    ├── Search Input
    ├── Filter Dropdown (All Events/By Event Name)
    ├── Sort Dropdown (Newest/Oldest/By Status)
    └── Scan History Table
        ├── Table Header
        └── Table Body (ScanResult rows)
```

## State Management

The main `page.tsx` component manages the following state:

```typescript
// Core scanning state
const [isScanning, setIsScanning] = useState(false);
const { scanResults, isLoading, addScanResult } = useScanHistory(); // Backend + local
const scannedTicketIdsRef = useRef<Set<string>>(new Set()); // For immediate duplicate detection

// UI state
const [recentScan, setRecentScan] = useState<ScanResult | null>(null);
const [searchQuery, setSearchQuery] = useState("");
const [filterType, setFilterType] = useState<FilterType>("all"); // Event ID or "all"
const [sortType, setSortType] = useState<SortType>("oldest");
```

The `useScanHistory` hook:
- Fetches all tickets scanned by current user from backend
- Merges with local scans for immediate feedback
- Automatically syncs successful scans with backend
- Removes error/duplicate scans after 5 seconds

### Data Flow

```
1. User scans QR code
   ↓
2. scanner-card.tsx: handleScanSuccess()
   - Rapid duplicate check (2s debounce)
   - Session duplicate check (Set)
   - Validate ticket via REST API or offline data
   - Plays audio feedback
   - Creates ScanResult object
   ↓
3. page.tsx: handleScanResult()
   - Adds to local scan state (immediate feedback)
   - Updates scannedTicketIdsRef
   - For success: Syncs with backend after 1s
   - For error: Auto-removes after 5s
   ↓
4. UI Updates:
   - StatsGrid recalculates statistics
   - ActivityFeed updates table
   - Scanner shows recent scan in side panel (desktop)
   - Toast notification appears
   ↓
5. Backend Sync (for successful scans):
   - Refetches scanned tickets from database
   - Removes local scan, replaces with backend data
   - Permanent persistence in database
```

## Features

- **Real-time Camera Scanning**: Uses device camera (preferably rear camera on mobile devices)
- **Automatic QR Detection**: Automatically detects and scans QR codes without manual trigger
- **Visual Feedback**: Immediate visual feedback with success/error indicators
- **Audio Feedback**: Beep sounds for successful and failed scans (different tones)
- **Backend Integration**: All successful scans persisted to database permanently
- **Offline Support**: Download data for offline scanning, auto-fallback when network fails
- **Statistics Dashboard**: Shows total scans, valid tickets, invalid tickets, duplicates, and success rate
- **Duplicate Prevention**: Three-layer duplicate detection (rapid, session, backend)
- **Search & Filter**: Search by ticket ID, name, email, phone, event; filter by event; sort by time or status
- **Export**: Export scan history to CSV file
- **Mobile Optimized**: Fully responsive with progressive column hiding on smaller screens
- **Storage Management**: Sync events and tickets for offline use, clear offline data

## Technology Stack

- **html5-qrcode**: QR code scanning library
- **Web Audio API**: For audio feedback
- **Lucide React**: Icons
- **Shadcn/ui**: UI components
- **Sonner**: Toast notifications

## How It Works

1. **Start Camera**: Click the "Start Camera" button to activate the device camera
2. **Position QR Code**: Point the camera at a ticket QR code
3. **Automatic Detection**: The scanner automatically detects and processes the QR code
4. **Validation**: The ticket is validated (currently simulated, needs backend integration)
5. **Feedback**: Visual and audio feedback indicates success or failure
6. **History**: Scan result is added to the history list

## Camera Permissions

The browser will request camera permissions when you first start scanning. Make sure to:
- Allow camera access when prompted
- Use HTTPS in production (camera access requires secure context)
- On mobile devices, the app will try to use the rear camera by default

## Current Implementation

### ✅ Production-Ready Implementation

The implementation is fully integrated with the backend REST API:

1. **REST API Integration** (`src/lib/api/ticket/endpoints.ts`):
   ```typescript
   export async function checkInTicket(publicId: string): Promise<CheckInResponse> {
     const url = `v1/tickets/${publicId}/check_in`;
     const response = await restClient.patch<BackendCheckInResponse>(url, {});
     return transformResponse(response);
   }
   ```

2. **Ticket Validation** (`src/hooks/use-ticket-validation.ts`):
   - Online mode: Calls REST API to check in ticket
   - Offline mode: Validates from localStorage data
   - Auto-fallback: Switches to offline when network fails

3. **Scan History** (`src/hooks/use-scan-history.ts`):
   - Fetches all tickets scanned by current user from backend
   - Merges with local scans for immediate feedback
   - Auto-syncs successful scans with database
   - Shows error/duplicate scans temporarily (5s)

### What's Implemented

✅ Backend REST API integration
✅ Offline ticket validation
✅ Automatic online/offline detection and fallback
✅ Persistent scan history from database
✅ Three-layer duplicate detection
✅ Real-time statistics and analytics
✅ Event-based filtering
✅ CSV export functionality
✅ Mobile-responsive design
✅ Storage sync for offline data

## Key Components

### 1. `page.tsx` - Main Container
**Responsibilities:**
- State management for all scan data
- Orchestrates child components
- Handles scan results and duplicate detection
- Manages export and clear functions

**Key Features:**
- Uses `useRef` for instant duplicate detection (no React re-render delay)
- Maintains both state and ref for `scannedTicketIds`
- Debounces recent scan highlights (3 seconds)

### 2. `scanner-card.tsx` - QR Scanner
**Responsibilities:**
- Camera initialization and control
- QR code detection using html5-qrcode
- Duplicate prevention with 2-second debounce
- Audio feedback (beep sounds)
- Recent scans panel (desktop only)

**Key Features:**
- Responsive scanner size (smaller on mobile)
- Full-width controls on mobile
- Recent scans side panel on desktop (lg+ screens)
- Automatic camera preference (rear camera on mobile)

### 3. `stats-grid.tsx` - Statistics Dashboard
**Responsibilities:**
- Calculate and display scan statistics
- Show Total, Valid, Invalid, Duplicate, Success Rate

**Key Features:**
- Responsive grid (2 cols on mobile, 3 on tablet, 5 on desktop)
- Color-coded cards (green=valid, red=invalid, yellow=duplicate, blue=rate)
- Compact sizing on mobile devices

### 4. `activity-feed.tsx` - Scan History Table
**Responsibilities:**
- Display all scanned tickets in a table
- Search functionality (ticket ID, name, seat)
- Filter by status (All/Valid/Invalid/Duplicate)
- Sort by time or status
- Empty state when no scans

**Key Features:**
- Progressive column hiding on mobile:
  - Mobile: No, Attendee, Time, Status
  - Tablet (sm): + Ticket Type
  - Desktop (md): + Seat
  - Large (lg): + Ticket ID
- Compact status badges on mobile
- Sticky table header
- Responsive height limits

### 5. `utils.ts` - Utility Functions
**Functions:**
- `validateTicket()`: Mock validation (TODO: replace with API call)
- `playBeep()`: Audio feedback using Web Audio API
- `filterAndSortResults()`: Filter and sort scan results
- `exportToCSV()`: Export scan history to CSV file

### 6. `types.ts` - Type Definitions
```typescript
export interface ScanResult {
  ticketId: string;
  timestamp: Date;
  status: "success" | "error" | "duplicate";
  message: string;
  attendeeName?: string;
  ticketType?: string;
  seatNumber?: string;
}

export type FilterType = "all" | "success" | "error" | "duplicate";
export type SortType = "newest" | "oldest" | "status";
```

## Responsive Design

- Works on desktop and mobile devices
- Optimized for mobile scanning (uses rear camera on mobile)
- Responsive layout adapts to different screen sizes

## Audio Feedback

- **Success Sound**: Higher pitch (800 Hz) for valid tickets
- **Error Sound**: Lower pitch (400 Hz) for invalid tickets
- Audio duration: 200ms
- Uses Web Audio API for cross-browser compatibility

## Best Practices

1. **Test camera permissions** before deploying
2. **Use HTTPS** in production (required for camera access)
3. **Provide clear instructions** to users about camera positioning
4. **Handle errors gracefully** (camera not available, permissions denied)
5. **Implement proper validation** on the backend
6. **Add rate limiting** to prevent abuse
7. **Log scan attempts** for audit purposes

## Future Enhancements

Potential improvements to consider:

- [ ] Add flashlight toggle for low-light scanning
- [ ] Support for multiple QR code formats
- [ ] Offline scanning with sync capability
- [ ] Export scan history to CSV/Excel
- [ ] Camera selection (front/rear camera toggle)
- [ ] Zoom controls for distant QR codes
- [ ] Batch scanning mode
- [ ] Integration with event selection (scan for specific events)
- [ ] Real-time sync with team members
- [ ] Advanced statistics and reports

## Troubleshooting

### Camera Not Working
- Check browser permissions
- Ensure HTTPS connection
- Try a different browser
- Check if camera is available (not used by another app)

### QR Codes Not Detected
- Ensure good lighting
- Hold camera steady
- Position QR code within the scanning box
- Check if QR code is clear and not damaged

### Duplicate Scans
- The system prevents scanning the same code multiple times quickly
- If you need to rescan, stop and restart the camera

## Security Considerations

- Always validate tickets on the backend
- Don't trust client-side validation
- Log all scan attempts
- Implement rate limiting
- Use secure ticket ID format (UUID recommended)
- Encrypt sensitive ticket data
