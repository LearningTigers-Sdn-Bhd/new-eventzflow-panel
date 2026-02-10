import type {
	EventSeatSession,
	EventTicketSeat,
} from "@/lib/api/seat-ticketing/response";

interface SeatSummaryProps {
	selectedSeats: Map<number, EventTicketSeat>;
	session: EventSeatSession | null;
}

export default function SeatSummary({
	selectedSeats,
	session,
}: SeatSummaryProps) {
	return (
		<div className="space-y-3">
			{Array.from(selectedSeats.values()).map((seat) => {
				const section = session?.event_seat_venues
					?.flatMap((venue) => venue.event_seat_sections ?? [])
					.find((item) => item.id === seat.event_seat_section_id);

				return (
					<div
						key={seat.id}
						className="flex items-center justify-between border bg-slate-50 p-3"
					>
						<div>
							<p className="text-[10px] font-bold uppercase tracking-wider text-brand-green">
								{section?.name}
							</p>
							<p className="font-bold text-slate-900">{seat.name}</p>
						</div>
						<div className="text-right">
							<p className="font-mono text-sm font-bold">
								RM
								{(
									Number(section?.price || 0) +
									Number(seat.extra_price || 0)
								).toFixed(2)}
							</p>
						</div>
					</div>
				);
			})}
		</div>
	);
}
