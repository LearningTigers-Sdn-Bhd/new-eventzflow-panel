import { XIcon } from "lucide-react";

interface SeatReservationSeatCardProps {
	sectionName?: string;
	seatName: string;
	price: string;
	onRemove: () => void;
}

export default function SeatReservationSeatCard({
	sectionName,
	seatName,
	price,
	onRemove,
}: SeatReservationSeatCardProps) {
	return (
		<div className="flex items-start gap-3">
			<button
				type="button"
				onClick={onRemove}
				className="mt-1 flex h-8 w-8 items-center justify-center border bg-white text-slate-500 hover:bg-slate-50"
				aria-label={`Remove ${seatName}`}
			>
				<XIcon className="h-4 w-4" />
			</button>
			<div className="flex-1 border bg-slate-50 p-3">
				<p className="text-[9px] font-bold uppercase tracking-wider text-brand-green md:text-[10px]">
					{sectionName}
				</p>
				<p className="text-sm font-bold text-slate-900 md:text-base">
					{seatName}
				</p>
				<div className="flex justify-end">
					<p className="font-mono text-xs font-bold md:text-sm">{price}</p>
				</div>
			</div>
		</div>
	);
}
