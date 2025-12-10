# Lucky Draw Feature - Frontend Implementation Tasks

## Overview

This document outlines the frontend implementation tasks for the Lucky Draw feature API integration. All tasks should follow the existing Next.js/React patterns and conventions used in the EventzFlow panel application.

**Reference**: See `api-integration-plan.md` for complete API specification and data models.

**Key Principle**: **No localStorage persistence**. All data comes from the backend API via TanStack Query. Zustand store is used only for UI state management.

## API Module Tasks

### 1. Create API Module Structure

#### Task 1.1: Create API Module Directory
- [x] Create directory `src/lib/api/lucky-draw/`
- [x] Create `request.ts` file
- [x] Create `response.ts` file
- [x] Create `endpoints.ts` file
- [x] Create `index.ts` file

### 2. Define Type Definitions

#### Task 2.1: Create Response Types
- [x] Open `src/lib/api/lucky-draw/response.ts`
- [x] Define `LuckyDrawConfig` interface:
  - `id: number`
  - `event_id: number`
  - `draw_style: 'wheel' | 'slot' | 'box'`
  - `use_gifts: boolean`
  - `created_at: string`
  - `updated_at: string`
- [x] Define `Gift` interface:
  - `id: number`
  - `event_id: number`
  - `name: string`
  - `order: number`
  - `winner_counts: number`
  - `winners: GiftWinner[]`
  - `created_at: string`
  - `updated_at: string`
- [x] Define `GiftWinner` interface:
  - `id: number`
  - `gift_id: number`
  - `ticket_id: number | null`
  - `visitor_id: number | null`
  - `drawn_at: string`
  - `created_at: string`
  - `updated_at: string`
- [x] Define `Participant` interface:
  - `id: number` (ticket ID for ticket events, visitor ID for visitor events)
  - `name: string`
  - Note: `ticket_id` and `visitor_id` are not included - backend handles the logic internally
  - Note: The `id` field represents the participant ID based on event's `use_ticket` flag
- [x] Define `InvalidParticipant` interface:
  - `id: number`
  - `event_id: number`
  - `participant: { id: number; name: string }`
  - `created_at: string`
  - `updated_at: string`
- [x] Export all types

#### Task 2.2: Create Request Types
- [x] Open `src/lib/api/lucky-draw/request.ts`
- [x] Define `UpdateLuckyDrawConfigRequest` interface:
  - `draw_style?: 'wheel' | 'slot' | 'box'`
  - `use_gifts?: boolean`
- [x] Define `CreateGiftRequest` interface:
  - `name: string`
  - `order?: number`
- [x] Define `UpdateGiftRequest` interface:
  - `name?: string`
  - `order?: number`
- [x] Define `AssignWinnerRequest` interface:
  - `ticket_id?: number`
  - `visitor_id?: number`
- [x] Define `BulkAssignWinnersRequest` interface:
  - `winners: Array<{ ticket_id?: number; visitor_id?: number }>`
- [x] Define `AddInvalidParticipantRequest` interface:
  - `ticket_id?: number`
  - `visitor_id?: number`
- [x] Define `GetParticipantsQuery` interface:
  - `type?: 'ticket' | 'visitor'`
  - `exclude_winners?: boolean`
  - `exclude_invalid?: boolean`
- [x] Export all types

### 3. Implement API Endpoints

#### Task 3.1: Implement Configuration Endpoints
- [x] Open `src/lib/api/lucky-draw/endpoints.ts`
- [x] Import `restClient` from `@/utils/rest-api`
- [x] Import request/response types
- [x] Implement `getLuckyDrawConfig(eventId: string)`:
  - GET `/v1/events/:event_id/lucky_draw/config`
  - Return `LuckyDrawConfig`
  - Handle 404 (backend should create default, but handle gracefully)
- [x] Implement `updateLuckyDrawConfig(eventId: string, data: UpdateLuckyDrawConfigRequest)`:
  - PUT `/v1/events/:event_id/lucky_draw/config`
  - Return `LuckyDrawConfig`
  - Handle errors

#### Task 3.2: Implement Gift Endpoints
- [x] Implement `getGifts(eventId: string)`:
  - GET `/v1/events/:event_id/lucky_draw/gifts`
  - Return `Gift[]`
- [x] Implement `createGift(eventId: string, data: CreateGiftRequest)`:
  - POST `/v1/events/:event_id/lucky_draw/gifts`
  - Return `Gift`
- [x] Implement `updateGift(eventId: string, giftId: number, data: UpdateGiftRequest)`:
  - PUT `/v1/events/:event_id/lucky_draw/gifts/:gift_id`
  - Return `Gift`
- [x] Implement `deleteGift(eventId: string, giftId: number)`:
  - DELETE `/v1/events/:event_id/lucky_draw/gifts/:gift_id`
  - Return `void`

#### Task 3.3: Implement Gift Winner Endpoints
- [x] Implement `assignWinner(eventId: string, giftId: number, data: AssignWinnerRequest)`:
  - POST `/v1/events/:event_id/lucky_draw/gifts/:gift_id/winners`
  - Return `GiftWinner`
- [x] Implement `bulkAssignWinners(eventId: string, giftId: number, data: BulkAssignWinnersRequest)`:
  - POST `/v1/events/:event_id/lucky_draw/gifts/:gift_id/winners/bulk`
  - Return `GiftWinner[]`
- [x] Implement `clearWinner(eventId: string, giftId: number, winnerId: number)`:
  - DELETE `/v1/events/:event_id/lucky_draw/gifts/:gift_id/winners/:winner_id`
  - Return `void`

#### Task 3.4: Implement Participant Endpoints
- [x] Implement `getParticipants(eventId: string, query?: GetParticipantsQuery)`:
  - GET `/v1/events/:event_id/lucky_draw/participants`
  - Build query string from query params
  - Return `Participant[]`

#### Task 3.5: Implement Invalid Participant Endpoints
- [x] Implement `getInvalidParticipants(eventId: string)`:
  - GET `/v1/events/:event_id/lucky_draw/invalid_participants`
  - Return `InvalidParticipant[]`
- [x] Implement `addInvalidParticipant(eventId: string, data: AddInvalidParticipantRequest)`:
  - POST `/v1/events/:event_id/lucky_draw/invalid_participants`
  - Return `InvalidParticipant`
- [x] Implement `removeInvalidParticipant(eventId: string, id: number)`:
  - DELETE `/v1/events/:event_id/lucky_draw/invalid_participants/:id`
  - Return `void`
- [x] Implement `clearInvalidParticipants(eventId: string)`:
  - DELETE `/v1/events/:event_id/lucky_draw/invalid_participants`
  - Return `void`

#### Task 3.6: Export All Endpoints
- [x] Open `src/lib/api/lucky-draw/index.ts`
- [x] Re-export all types from `request.ts`
- [x] Re-export all types from `response.ts`
- [x] Re-export all functions from `endpoints.ts`
- [x] Verify all exports are accessible

## TanStack Query Hooks Tasks

### 4. Create Query Hooks

#### Task 4.1: Create Query Hooks File
- [x] Create `src/hooks/use-lucky-draw-queries.ts`
- [x] Import `useQuery`, `useMutation`, `useQueryClient` from `@tanstack/react-query`
- [x] Import all endpoint functions from `@/lib/api/lucky-draw`

#### Task 4.2: Implement Configuration Query Hook
- [x] Implement `useLuckyDrawConfig(eventId: string)`:
  - Use `useQuery` with queryKey `["lucky-draw", "config", eventId]`
  - Query function: `getLuckyDrawConfig(eventId)`
  - Set `enabled: !!eventId`
  - Return query result

#### Task 4.3: Implement Gifts Query Hook
- [x] Implement `useLuckyDrawGifts(eventId: string)`:
  - Use `useQuery` with queryKey `["lucky-draw", "gifts", eventId]`
  - Query function: `getGifts(eventId)`
  - Set `enabled: !!eventId`
  - Return query result

#### Task 4.4: Implement Participants Query Hook
- [x] Implement `useLuckyDrawParticipants(eventId: string, options?: GetParticipantsQuery)`:
  - Use `useQuery` with queryKey `["lucky-draw", "participants", eventId, options]`
  - Query function: `getParticipants(eventId, options)`
  - Set `enabled: !!eventId`
  - Return query result

#### Task 4.5: Implement Invalid Participants Query Hook
- [x] Implement `useLuckyDrawInvalidParticipants(eventId: string)`:
  - Use `useQuery` with queryKey `["lucky-draw", "invalid-participants", eventId]`
  - Query function: `getInvalidParticipants(eventId)`
  - Set `enabled: !!eventId`
  - Return query result

### 5. Create Mutation Hooks

#### Task 5.1: Implement Configuration Mutation Hook
- [x] Implement `useUpdateLuckyDrawConfig(eventId: string)`:
  - Use `useMutation` with mutation function: `updateLuckyDrawConfig`
  - On success: Invalidate `["lucky-draw", "config", eventId]` query
  - Return mutation result

#### Task 5.2: Implement Gift Mutation Hooks
- [x] Implement `useCreateGift(eventId: string)`:
  - Use `useMutation` with mutation function: `createGift`
  - On success: Invalidate `["lucky-draw", "gifts", eventId]` query
  - Return mutation result
- [x] Implement `useUpdateGift(eventId: string, giftId: number)`:
  - Use `useMutation` with mutation function: `updateGift`
  - On success: Invalidate `["lucky-draw", "gifts", eventId]` query
  - Return mutation result
- [x] Implement `useDeleteGift(eventId: string, giftId: number)`:
  - Use `useMutation` with mutation function: `deleteGift`
  - On success: Invalidate `["lucky-draw", "gifts", eventId]` query
  - Return mutation result

#### Task 5.3: Implement Gift Winner Mutation Hooks
- [x] Implement `useAssignWinner(eventId: string, giftId: number)`:
  - Use `useMutation` with mutation function: `assignWinner`
  - On success: Invalidate both `["lucky-draw", "gifts", eventId]` and `["lucky-draw", "participants", eventId]` queries
  - Return mutation result
- [x] Implement `useBulkAssignWinners(eventId: string, giftId: number)`:
  - Use `useMutation` with mutation function: `bulkAssignWinners`
  - On success: Invalidate gifts and participants queries
  - Return mutation result
- [x] Implement `useClearWinner(eventId: string, giftId: number, winnerId: number)`:
  - Use `useMutation` with mutation function: `clearWinner`
  - On success: Invalidate `["lucky-draw", "gifts", eventId]` query
  - Return mutation result

#### Task 5.4: Implement Invalid Participant Mutation Hooks
- [x] Implement `useAddInvalidParticipant(eventId: string)`:
  - Use `useMutation` with mutation function: `addInvalidParticipant`
  - On success: Invalidate both `["lucky-draw", "invalid-participants", eventId]` and `["lucky-draw", "participants", eventId]` queries
  - Return mutation result
- [x] Implement `useRemoveInvalidParticipant(eventId: string, id: number)`:
  - Use `useMutation` with mutation function: `removeInvalidParticipant`
  - On success: Invalidate invalid participants and participants queries
  - Return mutation result
- [x] Implement `useClearInvalidParticipants(eventId: string)`:
  - Use `useMutation` with mutation function: `clearInvalidParticipants`
  - On success: Invalidate invalid participants and participants queries
  - Return mutation result

## Store Updates Tasks

### 6. Simplify Zustand Store

#### Task 6.1: Remove localStorage Persistence
- [x] Open `src/stores/lucky-draw-store.ts`
- [x] Remove `persist` middleware import
- [x] Remove `persist` wrapper from store creation
- [x] Remove localStorage-related code

#### Task 6.2: Remove Data Fields from Store
- [x] Remove `participants: Participant[]` from state
- [x] Remove `gifts: Gift[]` from state
- [x] Remove `drawStyle: DrawStyle` from state (will come from API)
- [x] Remove `useGifts: boolean` from state (will come from API)
- [x] Remove `invalidParticipants: Participant[]` from state
- [x] Keep only UI state fields:
  - `isDrawing: boolean`
  - `eventId: string | null`
  - `eventName: string | null`

#### Task 6.3: Remove Data Actions from Store
- [x] Remove `addParticipant` action
- [x] Remove `removeParticipant` action
- [x] Remove `setParticipants` action
- [x] Remove `addGift` action
- [x] Remove `removeGift` action
- [x] Remove `assignWinner` action
- [x] Remove `clearWinner` action
- [x] Remove `setDrawStyle` action
- [x] Remove `setUseGifts` action
- [x] Remove `addInvalidParticipant` action
- [x] Remove `removeInvalidParticipant` action
- [x] Remove `clearInvalidParticipants` action
- [x] Remove `reorderGifts` action (will be handled via API)
- [x] Keep only UI state actions:
  - `setEventId`
  - `setEventName`
  - `setDrawingState` (or `setIsDrawing`)

#### Task 6.4: Update Store Type Definitions
- [x] Update `LuckyDrawState` interface to reflect simplified state
- [x] Remove unused type exports if any
- [x] Verify store compiles without errors

## Hook Updates Tasks

### 7. Update useLuckyDraw Hook

#### Task 7.1: Integrate TanStack Query
- [x] Open `src/hooks/use-lucky-draw.ts`
- [x] Import all query hooks from `use-lucky-draw-queries.ts`
- [x] Import all mutation hooks from `use-lucky-draw-queries.ts`
- [x] Replace store data access with TanStack Query hooks:
  - Use `useLuckyDrawConfig` for config data
  - Use `useLuckyDrawGifts` for gifts data
  - Use `useLuckyDrawParticipants` for participants data
  - Use `useLuckyDrawInvalidParticipants` for invalid participants data

#### Task 7.2: Transform Backend Data to Frontend Format
- [x] Create helper function to transform `Gift` (backend) to frontend format:
  - Convert `winners: GiftWinner[]` to `winner: Participant | null` (first winner or null)
  - Convert `id: number` to string format if needed
  - Transform winner's `ticket_id` or `visitor_id` to frontend Participant format
- [x] Create helper function to transform `Participant` (backend) to frontend format:
  - Map backend `Participant` to frontend `Participant` type
  - Determine `type: 'ticket' | 'visitor'` based on event's `use_ticket` flag (from config)
  - Generate `publicId` from `id` (or use ID as string)
  - Note: Backend only returns `{id, name}`, so type must be inferred from event config
- [x] Create helper function to transform `InvalidParticipant` (backend) to frontend format:
  - Extract participant info from `participant` object
  - Map to frontend `Participant` type
  - Determine `type: 'ticket' | 'visitor'` based on event's `use_ticket` flag

#### Task 7.3: Update Hook Return Values
- [x] Update `participants` to use transformed data from `useLuckyDrawParticipants`
- [x] Update `gifts` to use transformed data from `useLuckyDrawGifts`
- [x] Update `drawStyle` to use `config?.draw_style` from `useLuckyDrawConfig`
- [x] Update `useGifts` to use `config?.use_gifts` from `useLuckyDrawConfig`
- [x] Update `invalidParticipants` to use transformed data from `useLuckyDrawInvalidParticipants`
- [x] Add loading states from query hooks:
  - `isLoadingConfig` from `useLuckyDrawConfig`
  - `isLoadingGifts` from `useLuckyDrawGifts`
  - `isLoadingParticipants` from `useLuckyDrawParticipants`
  - `isLoadingInvalidParticipants` from `useLuckyDrawInvalidParticipants`
- [x] Add error states from query hooks (optional, for error handling)

#### Task 7.4: Update Action Handlers
- [x] Update `addGift` to use `useCreateGift` mutation:
  - Call mutation with gift name
  - Handle loading/error states
  - Show toast on success/error
- [x] Update `removeGift` to use `useDeleteGift` mutation:
  - Call mutation with gift ID
  - Handle loading/error states
- [x] Update `assignWinner` to use `useAssignWinner` mutation:
  - Transform participant to API format using event's `use_ticket` flag
  - Set `ticket_id` or `visitor_id` based on participant type and event config
  - Call mutation
  - Handle loading/error states
- [x] Update `clearWinner` to use `useClearWinner` mutation:
  - Get winner ID from gift
  - Call mutation
  - Handle loading/error states
- [x] Update `reorderGifts` to use `useUpdateGift` mutation:
  - Update each gift's order via API
  - Handle loading/error states
- [x] Update `setDrawStyle` to use `useUpdateLuckyDrawConfig` mutation:
  - Call mutation with new draw style
  - Handle loading/error states
- [x] Update `setUseGifts` to use `useUpdateLuckyDrawConfig` mutation:
  - Call mutation with new use_gifts value
  - Handle loading/error states
- [x] Update `addInvalidParticipant` to use `useAddInvalidParticipant` mutation:
  - Transform participant to API format using event's `use_ticket` flag
  - Set `ticket_id` or `visitor_id` based on participant type and event config
  - Call mutation
  - Handle loading/error states
- [x] Update `removeInvalidParticipant` to use `useRemoveInvalidParticipant` mutation:
  - Get invalid participant ID
  - Call mutation
  - Handle loading/error states
- [x] Update `clearInvalidParticipants` to use `useClearInvalidParticipants` mutation:
  - Call mutation
  - Handle loading/error states

#### Task 7.5: Update Computed Values
- [x] Update `nextAvailableGift` to work with transformed gifts:
  - Find first gift without a winner
  - Use transformed gift format
- [x] Update `availableParticipants` to work with API data:
  - When `useGifts` is true: Filter participants not in any gift's winners
  - When `useGifts` is false: Filter participants not in invalid list
  - Use transformed participant format
- [x] Update `canDraw` to work with new data structure:
  - Check `availableParticipants.length > 0`
  - Check `!isDrawing`
  - Consider loading states

#### Task 7.6: Maintain Backward Compatibility
- [x] Verify hook return interface matches existing component expectations
- [x] Ensure all existing hook consumers continue to work
- [x] Test hook with existing components

## Type Transformation Tasks

### 8. Create Type Transformation Utilities

#### Task 8.1: Create Transformation Utilities File
- [x] Create `src/lib/api/lucky-draw/transform.ts`
- [x] Import backend types from `response.ts`
- [x] Import frontend types from store (or create shared types)

#### Task 8.2: Implement Gift Transformation
- [x] Create `transformGift(backendGift: Gift, useTicket: boolean): FrontendGift`:
  - Convert `winners: GiftWinner[]` to `winner: Participant | null`
  - Take first winner if exists, otherwise null
  - Transform winner to frontend Participant format:
    - Use `ticket_id` or `visitor_id` from `GiftWinner` to determine participant `id`
    - Determine `type: 'ticket' | 'visitor'` based on which field is non-null
    - Note: `GiftWinner` doesn't include participant name - may need to fetch separately or backend should include it
  - Handle ID conversion if needed

#### Task 8.3: Implement Participant Transformation
- [x] Create `transformParticipant(backendParticipant: Participant, useTicket: boolean): FrontendParticipant`:
  - Determine `type: 'ticket' | 'visitor'` based on `useTicket` flag (from event config)
  - Generate `publicId` from `id` (or use ID as string)
  - Map `name` field
  - Note: Backend only returns `{id, name}`, so type must be inferred from event's `use_ticket` flag

#### Task 8.4: Implement Invalid Participant Transformation
- [x] Create `transformInvalidParticipant(backendInvalid: InvalidParticipant): FrontendParticipant`:
  - Extract participant from `participant` object
  - Transform to frontend Participant format
  - Generate `publicId` from participant ID

#### Task 8.5: Implement Reverse Transformations (for API calls)
- [x] Create `transformParticipantToAPI(participant: FrontendParticipant, useTicket: boolean): AssignWinnerRequest`:
  - Based on `useTicket` flag and participant `type`, set either `ticket_id` or `visitor_id`
  - Use participant's `id` (or `publicId` converted to number) as the value
  - Return API request format with exactly one of `ticket_id` or `visitor_id`
- [x] Create `transformGiftOrderToAPI(gifts: FrontendGift[]): UpdateGiftRequest[]`:
  - Map gifts to update requests with new order values
  - Return array of update requests

## Component Updates Tasks

### 9. Update Components for Loading/Error States

#### Task 9.1: Update LuckyDrawWrapper Component
- [x] Open `src/components/pages/lucky-draw/lucky-draw-wrapper.tsx`
- [x] Add loading states from hook:
  - Show loading skeleton while `isLoadingConfig` or `isLoadingGifts`
  - Show loading indicator for participants
- [x] Add error handling:
  - Display error message if queries fail
  - Add retry button for failed queries
- [x] Update to use new hook API (should be backward compatible)

#### Task 9.2: Update Configuration Sheet Component
- [x] Open configuration sheet component
- [x] Add loading states for mutations:
  - Disable form while `isSaving` (from mutations)
  - Show loading spinner on action buttons
- [x] Add error handling:
  - Display error toast on mutation failure
  - Allow retry on failed mutations
- [x] Update gift management to use new API:
  - Add/remove gifts via mutations
  - Reorder gifts via API calls
  - Clear winners via API calls

#### Task 9.3: Update Draw Components
- [x] Verify draw components work with new data structure
- [x] Ensure participants list updates correctly after draws
- [x] Test winner assignment flow

## Testing Tasks

### 10. Write Tests

#### Task 10.1: API Module Tests
- [ ] Test all endpoint functions with mock responses
- [ ] Test error handling in endpoints
- [ ] Test query parameter building
- [ ] Test request/response type validation

#### Task 10.2: TanStack Query Hooks Tests
- [ ] Test query hooks with mock data
- [ ] Test mutation hooks with mock responses
- [ ] Test query invalidation on mutations
- [ ] Test loading and error states

#### Task 10.3: Hook Integration Tests
- [ ] Test `useLuckyDraw` hook with mocked queries
- [ ] Test data transformations
- [ ] Test action handlers
- [ ] Test computed values

#### Task 10.4: Component Tests
- [ ] Test components with loading states
- [ ] Test components with error states
- [ ] Test user interactions (add gift, assign winner, etc.)
- [ ] Test optimistic updates (if implemented)

## Migration Tasks

### 11. Migration from localStorage

#### Task 11.1: Remove localStorage Dependencies
- [ ] Search codebase for any remaining localStorage references
- [ ] Remove any localStorage fallback code
- [ ] Remove any migration code from localStorage to API

#### Task 11.2: Update Documentation
- [ ] Update component documentation to reflect API integration
- [ ] Update hook documentation
- [ ] Remove references to localStorage persistence

#### Task 11.3: Clean Up
- [ ] Remove unused type definitions
- [ ] Remove unused utility functions
- [ ] Clean up any dead code

## Implementation Notes

### Key Implementation Details

1. **No localStorage**: All data comes from API via TanStack Query. Store is only for UI state.

2. **Type Transformations**: Backend returns different formats than frontend expects:
   - Backend `Gift.winners[]` → Frontend `Gift.winner` (single)
   - Backend `Participant` (only `{id, name}`) → Frontend `Participant` (with `type` field)
   - Participant `type` must be inferred from event's `use_ticket` flag (from config)
   - Backend `GiftWinner` has `ticket_id` or `visitor_id` → Frontend `Participant` with `type`
   - **Note**: `GiftWinner` response doesn't include participant name - may need to:
     - Fetch participant details separately using the `ticket_id` or `visitor_id`
     - Or request backend to include participant name in `GiftWinner` response
   - Handle transformations in hook or utility functions

3. **TanStack Query Caching**:
   - Queries are automatically cached
   - Mutations invalidate related queries
   - Background refetching handles data freshness

4. **Optimistic Updates** (Optional):
   - Can update TanStack Query cache immediately on mutations
   - Revert on error
   - Refetch on success for consistency

5. **Error Handling**:
   - Use TanStack Query's built-in error states
   - Display user-friendly error messages
   - Provide retry functionality

6. **Loading States**:
   - Use `isLoading` from query hooks
   - Use `isPending` from mutation hooks
   - Show appropriate loading indicators in UI

7. **Backward Compatibility**:
   - Keep `useLuckyDraw` hook API surface unchanged
   - Components should not need updates
   - Internal implementation changes only

## Testing Checklist

Before marking tasks as complete, verify:

- [ ] All API endpoints are implemented and tested
- [ ] All TanStack Query hooks work correctly
- [ ] Data transformations work correctly
- [ ] Store is simplified to UI state only
- [ ] `useLuckyDraw` hook maintains backward compatibility
- [ ] Components display loading states correctly
- [ ] Components handle errors gracefully
- [ ] All mutations invalidate related queries
- [ ] No localStorage dependencies remain
- [ ] All tests pass
- [ ] Components work with new API integration
