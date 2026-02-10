# Seat Ticketing Session Page Implementation Plan

Yes, the requested features are entirely possible to implement using modern web technologies. Below is the proposed technical architecture and implementation strategy for the Seat Ticketing Session page.

## 1. Technical Feasibility & Architecture

### Canvas Visualization (`seat-reservation-seats-canvas.tsx`)
- **Technology**: **Konva.js** with **react-konva**.
- **Reasoning**: Konva provides a high-level API for canvas manipulation, supporting zoom/pan (via stage scaling), event handling (mouse/touch/keyboard), and efficient rendering of thousands of shapes (seats).
- **Structure**:
  - **Single Stage**: All elements reside in one `<Stage>`.
  - **Venue Layer**: A main `<Layer>` that handles zooming and panning for the entire venue.
  - **Section Groups**: Each `EventSeatSection` is rendered as a Konva `<Group>`. 
    - **Position**: `x: section.start_column * cell_size`, `y: section.start_row * cell_size`.
    - **Size**: Calculated using `section.col_span` and `section.row_span`.
    - **No Venue Outline**: The venue boundary is defined only by the outermost sections/seats.
  - **Seat Nodes**: Individual `<Rect>` or `<Circle>` components inside Section Groups.
    - **Position**: `x: seat.col_set * seat_spacing`, `y: seat.row_set * seat_spacing` (relative to the Section Group).
  - **Zoom & Pan**: Stage-level scaling allows users to "fly" over the entire venue or zoom into a specific seat.

### State Management (`seat-reservation-session-provider.tsx`)
- **Technology**: React Context API.
- **Responsibilities**:
  - Store the `EventSeatSession` data.
  - Manage `selectedSeats` (a Map or Set of seat IDs for O(1) lookup).
  - Provide helper functions: `toggleSeatSelection(seatId)`, `calculateTotalPrice()`, `clearSelection()`.
  - Handle derived state: Section names and total prices (base price + extra price).

### Real-time Updates
- **Technology**: WebSockets (ActionCable integration).
- **Workflow**:
  - Subscribe to a channel (e.g., `SeatSessionChannel`) using the session ID.
  - Listen for `seat_updated` or `seat_locked` events.
  - Update the local `EventSeatSession` state, triggering a re-render of affected seat nodes on the canvas.

## 2. Implementation Roadmap

### Phase 1: Context & Data Setup
1. Define `SeatReservationContext` with types based on `EventSeatSession`.
2. Implement the provider to wrap the session page components.
3. Fetch session data and initialize state.

### Phase 2: Canvas Engine (Core)
1. Initialize `react-konva` Stage and Layers.
2. Implement coordinate transformation logic (converting grid coordinates to canvas pixels).
3. Render Sections as boundary boxes and Seats as interactive nodes.
4. Implement selection logic with multi-select support (Shift/Ctrl key support).

### Phase 3: Zoom, Pan & UX
1. Add mouse-wheel zoom and click-drag panning.
2. Add keyboard shortcuts (Arrow keys for panning, +/- for zooming).
3. Implement Tooltips/Hover states to show seat names and prices.

### Phase 4: Integration & Real-time
1. Connect `seat-reservation-session-checkout.tsx` to the context to display selected seats and total price.
2. Implement WebSocket connection in the provider to handle external seat status changes.
3. Add "Locking" mechanism (optimistic UI) when a user selects a seat.

## 3. Keyboard & Mouse Support Details
- **Mouse**: Click to select, Drag to pan, Scroll to zoom.
- **Keyboard**: 
  - `Space + Drag`: Pan (standard design tool behavior).
  - `Shift + Click`: Range selection or multiple toggle.
  - `Escape`: Clear selection.
  - `Ctrl/Cmd + +/-`: Zooming.

## 4. Selection Logic Details
When a seat is selected:
1. Lookup `EventTicketSeat` by ID.
2. Resolve its parent `EventSeatSection` to get the `price`.
3. Add `section.price` + `seat.extra_price` to the total.
4. Update `selectedSeats` list in the Context Provider.
