# Ticket and Revenue Status Analytics

## Status

Approved direction: six explicit metrics on Event Details and Ticket Analytics.

## Context

The event analytics revenue query currently scopes tickets by ticket `status`
(`purchased`/`scanned`) but does not scope by `payment_status`. A ticket can
therefore look active while its payment is still pending. The reported example
has 23 tickets at RM530 each (RM12,190) but only 6 paid tickets (RM3,180).

Both Event Details and Ticket Analytics call the same event analytics API, so
the correction belongs in the backend metric definitions and is then exposed
through both frontend views.

## Goals

- Make ticket and payment status visible without requiring users to infer it.
- Count only paid tickets in Collected Revenue and the revenue trend.
- Show the value tied to pending payments as Pending Revenue.
- Keep the same metric definitions on Event Details, Ticket Analytics, and PDF
  export.
- Preserve existing API fields where possible so other consumers keep working.

## Non-goals

- No payment workflow, ticket status transition, or database migration.
- No new payment status for failed, refunded, or canceled records.
- No redesign of the charts beyond feeding the corrected paid-only revenue
  series.

## Metric definitions

For ticket-event analytics, an eligible ticket has `status` other than
`refunded`/`canceled` and a payment status of `paid` or `pending`. Failed,
refunded, and canceled records are excluded from the ticket status breakdown.

| Metric | Definition |
| --- | --- |
| Total Tickets | Eligible paid + pending tickets. |
| Paid Tickets | Eligible tickets with `payment_status: paid`. |
| Pending Tickets | Eligible tickets with `payment_status: pending`. |
| Scanned Tickets | Checked-in tickets with `payment_status: paid`. |
| Collected Revenue | Paid ticket price totals plus existing paid exhibitor registration payments. |
| Pending Revenue | Pending ticket price totals plus pending/submitted exhibitor registration payments. |

Ticket prices continue to use the existing ticket-type price calculation and
remain represented in cents by the backend. Pending revenue is an expectation,
not cash collected; the UI label must make that distinction explicit.

## Backend design

1. Centralize the ticket payment scopes in `EventAnalyticsController` so all
   totals and time-series queries use the same definitions.
2. Update `total_tickets` to count eligible paid and pending tickets and add
   `paidTickets` and `pendingTickets` fields to its response.
3. Extend `total_amount_price` without removing `totalAmountPrice`:

   ```json
   {
     "totalAmountPrice": 318000,
     "pendingAmountPrice": 901000
   }
   ```

   `totalAmountPrice` remains the collected amount in cents. The added pending
   amount is also in cents.
4. Make the `revenue` time-series branch use the paid-ticket scope. Pending
   revenue does not appear in the collected revenue chart.
5. Make scanned/unscanned ticket counts paid-only so pending registrations do
   not look attendance-ready.
6. Keep paid exhibitor revenue in Collected Revenue and add pending/submitted
   exhibitor amounts to Pending Revenue, matching the existing event-level
   revenue composition.

If an existing endpoint is used by more than these pages, added JSON fields are
backward-compatible; existing field names retain their current meaning.

## Frontend design

Expose the new backend fields through the dashboard/event analytics response
types and map cents to display currency in the existing API layer.

Both views show the same six cards:

1. Total Tickets
2. Paid Tickets
3. Pending Tickets
4. Scanned Tickets
5. Collected Revenue
6. Pending Revenue

The current Unscanned Tickets card is removed from the primary six-card layout.
The paid unscanned value remains available to the report/data layer, but the
primary summary prioritizes the paid/pending split and cash clarity.

The existing Revenue label becomes Collected Revenue. The existing revenue
trend remains a collected-revenue trend and must not include pending amounts.
PDF export receives the same paid/pending counts and revenue values as the
screen cards.

## Data flow

```text
Ticket.payment_status + ticket status
              |
              v
EventAnalyticsController scopes
       |                         |
       v                         v
paid totals / revenue       pending totals / revenue
       |                         |
       +------------+------------+
                    v
     API response (cents + counts)
                    |
                    v
       dashboard API transformation
                    |
                    v
 Event Details + Ticket Analytics + PDF
```

## Verification

Backend request coverage must include a paid and pending ticket at the same
price and assert:

- Total Tickets equals paid plus pending.
- Paid Tickets and Pending Tickets are separated correctly.
- Collected Revenue includes only the paid ticket amount.
- Pending Revenue includes only the pending ticket amount.
- Revenue time-series data excludes pending tickets.
- Failed/refunded/canceled records do not enter either money metric.
- Existing paid exhibitor revenue remains in Collected Revenue.

Run the affected backend request specs and the frontend lint/typecheck/build
checks. Manually verify the approved example renders 6 paid, 17 pending,
RM3,180 collected, and RM9,010 pending when all 23 tickets cost RM530.

## Open implementation note

The exact placement of the six cards may use the existing responsive grid. No
new card component or dependency is required.
