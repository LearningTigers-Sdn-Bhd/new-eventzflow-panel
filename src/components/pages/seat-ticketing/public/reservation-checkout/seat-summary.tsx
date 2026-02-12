import type {
	EventSeatSection,
	EventTicketSeat,
} from "@/lib/api/seat-ticketing/response";

interface SeatSummaryProps {
	seats: EventTicketSeat[];
	sections: Record<number, EventSeatSection>;
	totalPrice: number;
}

import { ScrollArea } from "@/components/ui/scroll-area";
import type {
	EventSeatSection,
	EventTicketSeat,
} from "@/lib/api/seat-ticketing/response";

interface SeatSummaryProps {
	seats: EventTicketSeat[];
	sections: Record<number, EventSeatSection>;
	totalPrice: number;
}

export default function SeatSummary({
	seats,
	sections,
	totalPrice,
}: SeatSummaryProps) {
	return (
		<div className="flex h-full flex-col">
			<div className="border-b border-slate-200 pb-6 px-6 md:px-12">
				<h2 className="font-black text-2xl text-slate-900 uppercase tracking-tight">
					Review Selection
				</h2>
				<p className="font-semibold text-slate-500 text-sm">
					{seats.length} {seats.length === 1 ? "seat" : "seats"} reserved for you
				</p>
			</div>

			<ScrollArea className="flex-1">
				<div className="divide-y divide-slate-100">
					{seats.map((seat) => {
						const section = sections[seat.event_seat_section_id];
						const groupId = seat.event_seat_group_assignment?.event_seat_group_id;
						const group = section?.event_seat_groups?.find((item) => item.id === groupId);
						const sectionLabel = group
							? `${section?.name ?? "Section"} - ${group.name}`
							: section?.name ?? "Unknown Section";

						return (
							<div
								key={seat.id}
								className="group flex items-center justify-between py-8 px-6 transition-all md:px-12"
							>
								<div className="flex flex-col gap-1">
									<p className="text-xl font-black text-slate-900 leading-tight md:text-2xl">
										{seat.name}
									</p>
									<span className="font-bold text-[11px] text-slate-500 uppercase tracking-widest">
										{sectionLabel}
									</span>
								</div>
								<div className="text-right">
									<p className="font-mono text-lg font-bold text-slate-900 md:text-xl">
										RM
										{(
											Number(section?.price || 0) + Number(seat.extra_price || 0)
										).toFixed(2)}
									</p>
								</div>
							</div>
						);
					})}
				</div>
			</ScrollArea>

			<div className="mt-auto flex items-center justify-between border-t-2 border-slate-900 pt-8 px-6 pb-4 md:px-12">
				<span className="font-black text-slate-500 text-sm uppercase tracking-[0.3em]">
					Subtotal
				</span>
				<span className="text-4xl font-black text-slate-900">
					RM{totalPrice.toFixed(2)}
				</span>
			</div>
		</div>
	);
}
