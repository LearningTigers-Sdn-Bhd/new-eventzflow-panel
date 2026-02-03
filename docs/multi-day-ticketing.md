# Multi-Day Event Ticketing - Frontend

This document describes the frontend implementation for multi-day ticketing support.

---

## Overview

Multi-day ticketing allows:
- Ticket types to have validity date ranges (valid only on specific days)
- Tickets to be checked in once per day (not once ever)
- Proper error handling for wrong day and duplicate same-day scans

---

## API Response Changes

### Ticket Type
```typescript
interface TicketType {
  // ... existing fields
  validFromDate: string | null;    // "2024-03-15" or null for all days
  validToDate: string | null;      // "2024-03-17" or null for all days
  validityDescription: string;     // "Valid on Day 1 only" or "Valid all days"
}
```

### Ticket
```typescript
interface Ticket {
  checkedIn: boolean;        // true if ever checked in (any day)
  checkedInToday: boolean;   // true if checked in today specifically
  // REMOVED: checkInAt - no longer on ticket directly
}
```

### Check-In Error Responses
```typescript
// Wrong day error
{ error: "Ticket not valid for today", reason: "wrong_day", validity_description: "..." }

// Duplicate same-day error
{ error: "Already checked in today", reason: "duplicate_today" }
```

---

## Files Modified

### Type Definitions

| File | Changes |
|------|---------|
| `src/lib/api/ticket-type/response.ts` | Added `validFromDate`, `validToDate`, `validityDescription` |
| `src/lib/api/ticket-type/request.ts` | Added `valid_from_date`, `valid_to_date` to create/update requests |
| `src/lib/api/ticket/response.ts` | Removed `checkInAt`, added `checkedInToday` |
| `src/lib/api/scan/response.ts` | Added `ScanCheckInError` class with `reason`, `validityDescription` |
| `src/lib/api/scan/endpoints.ts` | Parse error response to throw `ScanCheckInError` with details |
| `src/components/pages/scan/types.ts` | Added `wrong_day` status, validity fields to `ScanResult` |

### Ticket Type Forms

| File | Changes |
|------|---------|
| `create-ticket-type-form.tsx` | Day selection UI with buttons for each event day |
| `edit-ticket-type-form.tsx` | Same UX, initializes state from existing validity dates |
| `ticket-type-columns.tsx` | Added "Valid Days" column |

### Scan & Check-In

| File | Changes |
|------|---------|
| `use-ticket-validation.ts` | Handle `wrong_day` and `duplicate_today` errors |
| `use-offline-ticket-validation.ts` | Validate ticket dates in offline mode |
| `use-public-check-in.ts` | Toast for scan errors, scanner stays open |
| `constants.ts` | Added `WRONG_DAY`, `DUPLICATE_TODAY` messages |
| `status-helpers.tsx` | Added `wrong_day` status config (amber color) |
| `activity-feed.tsx` | Added wrong_day filter option |

### Public Check-In

| File | Changes |
|------|---------|
| `CheckInStatus.tsx` | Added `wrong-day` status support |
| `QRScanner.tsx` | Responsive qrbox sizing |
| `CheckInSelection.tsx` | Better mobile scanner layout |

### New Files

| File | Purpose |
|------|---------|
| `src/components/ui/date-picker.tsx` | Date picker component for custom date range |
| `src/components/pages/scan/wrong-day-alert.tsx` | Wrong day alert display component |

---

## UI/UX Behavior

### Ticket Type Form (Create/Edit)

**Single-day event:**
- Only shows "All Event Days" option (no day selection needed)

**Multi-day event:**
- "All Event Days" - ticket valid any day (default)
- "Specific Day" - shows day buttons (Day 1, Day 2, etc. with dates)
- "Need a custom date range?" - expands to date pickers

### QR Scanner Behavior

After any scan, the scanner stays open for continuous scanning:

| Scan Result | Action |
|-------------|--------|
| Success | Green overlay with attendee info |
| Already checked in (from search) | Red "Used" overlay |
| Already checked in today (QR) | Toast message, scanner stays open |
| Wrong day (QR) | Toast message, scanner stays open |
| Other error | Toast message, scanner stays open |

### Scan Activity Feed

New filter option "Wrong Day" to filter scans by status.

Wrong day entries show amber color with calendar icon.

---

## Offline Mode

The offline validation hook (`use-offline-ticket-validation.ts`) checks:
1. Ticket exists in cached data
2. Current date is within ticket's validity range
3. Not already scanned in current session

Returns `wrong_day` status if ticket is outside validity dates.

---

## Testing Checklist

- [x] Ticket type form shows day buttons for multi-day events
- [x] Day buttons display correct dates from event
- [x] Custom date range picker bounded by event dates
- [x] Ticket type table shows validity description column
- [x] Valid ticket on valid day → success
- [x] Valid ticket on wrong day → toast with validity info
- [x] Same ticket twice same day → duplicate toast
- [x] Scanner stays open after all scan results
- [x] Offline mode validates date range
- [x] QR scanner responsive on mobile
