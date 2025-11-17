# Event Archive, Delete, and Restore

This document describes the event archive, delete, and restore functionality, including how it integrates with event filtering and TanStack Query.

## Overview

The application supports three event lifecycle operations:

1. **Archive** - Soft-deletes an event (sets `deleted_at` timestamp)
2. **Delete** - Permanently removes an event and all associated data
3. **Restore** - Unarchives a soft-deleted event (clears `deleted_at`)

## API Endpoints

All endpoints are located in `src/lib/api/event/endpoints.ts`:

### Archive Event

```typescript
archiveEvent(eventId: string): Promise<void>
```

- **Endpoint**: `DELETE /v1/events/{eventId}`
- **Description**: Soft-deletes an event by setting the `deleted_at` timestamp
- **Returns**: `void`
- **Error Handling**: Throws error with message on failure

### Force Delete Event

```typescript
forceDeleteEvent(eventId: string): Promise<void>
```

- **Endpoint**: `DELETE /v1/events/{eventId}/force_delete`
- **Description**: Permanently deletes an event and all associated data
- **Returns**: `void`
- **Error Handling**: Throws error with message on failure
- **Warning**: This action cannot be undone

### Restore Event

```typescript
restoreEvent(eventId: string): Promise<Event>
```

- **Endpoint**: `PATCH /v1/events/{eventId}/restore`
- **Description**: Restores an archived event by clearing the `deleted_at` timestamp
- **Returns**: Restored `Event` object
- **Error Handling**: Throws error with message on failure

## Event Filtering Integration

The archive/restore functionality integrates with the event filtering system:

### API Filtering

The `getEvents()` function supports filtering by archive status:

```typescript
getEvents(options?: {
  archived?: boolean;
  full?: boolean;
}): Promise<Event[]>
```

**Query Parameters:**
- `GET /v1/events` - Returns only active events (default)
- `GET /v1/events?archived=true` - Returns only archived events
- `GET /v1/events?full=true` - Returns all events (active + archived)

### Frontend Filtering

The events page (`src/app/(auth)/event/page.tsx`) provides a filter dropdown with three options:

- **Active** - Shows only non-archived events (default)
- **Archived** - Shows only archived events
- **All** - Shows both active and archived events

Each filter state has its own TanStack Query cache entry using the query key: `["events", eventFilter]`

## Frontend Implementation

### Component Structure

The archive/delete/restore actions are implemented in:

- **`src/components/pages/event/action-menu.tsx`** - Main actions menu component
- **`src/components/pages/event/settings/confirm-dialog.tsx`** - Confirmation dialog component

### Event Actions Menu

The `EventActionsMenu` component (`src/components/pages/event/action-menu.tsx`) provides:

1. **Conditional Action Display**:
   - Archive: Only shown for active events (`!isArchived`)
   - Delete: Always shown (for org_owner role)
   - Restore: Only shown for archived events (`isArchived`)

2. **Role-Based Permissions**:
   - **Archive**: `org_owner`, `organizer`
   - **Delete**: `org_owner` only
   - **Restore**: `org_owner`, `organizer`

3. **Archive Status Detection**:
   ```typescript
   const isArchived = !!deletedAt;
   ```
   The component receives `deletedAt` prop from the event data to determine if an event is archived.

### Mutation Implementation

All three operations use TanStack Query mutations:

```typescript
const archiveEventMutation = useMutation({
  mutationFn: archiveEvent,
  onSuccess: () => {
    toast.success("Event archived successfully!");
    queryClient.invalidateQueries({ queryKey: ["events"] });
    closeDialog();
  },
  onError: (error: Error) => {
    toast.error(error.message || "Failed to archive event");
  },
});
```

**Key Features:**
- Success toast notifications
- Automatic query invalidation for all event queries
- Error handling with user-friendly messages
- Dialog closure on success

### Confirmation Dialogs

All destructive actions require user confirmation via `ConfirmDialog`:

#### Archive Confirmation
- **Variant**: `warning`
- **Icon**: `alert`
- **Message**: "Are you sure you want to archive this event? The event will be archived and hidden from the main list."

#### Delete Confirmation
- **Variant**: `destructive`
- **Icon**: `delete`
- **Message**: "Are you sure you want to permanently delete this event? This action cannot be undone and all associated data will be permanently removed."

#### Restore Confirmation
- **Variant**: `success`
- **Icon**: `check`
- **Message**: "Are you sure you want to restore this event? The event will be unarchived and visible in the main list again."

## Query Invalidation Strategy

### Current Implementation

After any mutation (archive/delete/restore), the query cache is invalidated:

```typescript
queryClient.invalidateQueries({ queryKey: ["events"] });
```

This invalidates **all** event queries, including:
- `["events", "active"]`
- `["events", "archived"]`
- `["events", "all"]`

### Benefits

1. **Data Consistency**: Ensures all views reflect the latest state
2. **Automatic Refetch**: TanStack Query automatically refetches active queries
3. **Cache Updates**: All filter views update when events change status

### Considerations

The current implementation invalidates all event queries, which means:
- If viewing "Active" events and archiving one, it disappears immediately
- If viewing "Archived" events and restoring one, it disappears immediately
- If viewing "All" events, the list updates to reflect the new status

This behavior is intentional and provides a smooth user experience.

## Event Type Definition

The `Event` type includes the `deleted_at` field:

```typescript
export type Event = {
  id: number;
  title: string;
  // ... other fields
  deleted_at: string | null;
};
```

- `deleted_at: null` - Event is active
- `deleted_at: string` - Event is archived (ISO timestamp)

## User Flow Examples

### Archiving an Event

1. User clicks "More" menu (⋯) on an active event
2. Selects "Archive Event"
3. Confirmation dialog appears with warning variant
4. User confirms
5. API call to `DELETE /v1/events/{eventId}`
6. Success toast appears
7. Event queries are invalidated
8. Event disappears from "Active" view
9. Event appears in "Archived" view (if user switches filter)

### Restoring an Event

1. User switches filter to "Archived"
2. User clicks "More" menu (⋯) on an archived event
3. Selects "Restore Event"
4. Confirmation dialog appears with success variant
5. User confirms
6. API call to `PATCH /v1/events/{eventId}/restore`
7. Success toast appears
8. Event queries are invalidated
9. Event disappears from "Archived" view
10. Event appears in "Active" view (if user switches filter)

### Deleting an Event

1. User clicks "More" menu (⋯) on any event
2. Selects "Delete Event" (only visible to org_owner)
3. Confirmation dialog appears with destructive variant
4. User confirms
5. API call to `DELETE /v1/events/{eventId}/force_delete`
6. Success toast appears
7. Event queries are invalidated
8. Event is permanently removed from all views

## Integration Points

### Event Item Component

The `EventItem` component (`src/components/pages/event/event-item.tsx`) passes `deleted_at` to the actions menu:

```typescript
<EventActionsMenu eventId={event.id} deletedAt={event.deleted_at} />
```

### Event Columns

The table columns (`src/components/pages/event/columns.tsx`) also pass `deleted_at`:

```typescript
<EventActionsMenu eventId={_event.id} deletedAt={_event.deleted_at} />
```

## Best Practices

1. **Always use confirmation dialogs** for destructive actions
2. **Provide clear feedback** via toast notifications
3. **Invalidate queries** after mutations to keep UI in sync
4. **Check user roles** before showing actions
5. **Use `deleted_at` field** to determine archive status, not separate status field
6. **Handle errors gracefully** with user-friendly messages

## Future Enhancements

Potential improvements:

1. **Optimistic Updates**: Update UI immediately before API confirmation
2. **Selective Invalidation**: Only invalidate relevant query keys
3. **Bulk Operations**: Archive/restore multiple events at once
4. **Archive History**: Track when events were archived/restored
5. **Auto-archive**: Automatically archive events after a certain date
