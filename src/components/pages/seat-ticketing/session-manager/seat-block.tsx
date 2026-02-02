"use client";

import { Armchair, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Popover, PopoverAnchor, PopoverContent } from "@/components/ui/popover";
import type { EventTicketSeat } from "@/lib/api/seat-ticketing/response";
import { cn } from "@/lib/utils";
import { useSeatSessionStore } from "./use-seat-session-store";

interface SeatBlockProps {
	seat?: EventTicketSeat;
	row: number;
	col: number;
	sectionId: number;
	sectionName: string;
}

export function SeatBlock({
	seat,
	row,
	col,
	sectionId,
	sectionName,
}: SeatBlockProps) {
	const {
		selectedSeatId,
		selectSeat,
		removeSeat,
		addSeat,
		interactionMode,
		isPanning,
	} = useSeatSessionStore();

	const isSelected = seat && selectedSeatId === seat.id;

	const handleGridClick = () => {
		if (isPanning) return;

		if (interactionMode === "create") {
			addSeat(sectionId, {
				name: `${sectionName}-${row}${String.fromCharCode(64 + col)}`,
				extra_price: 0,
				row_set: row,
				col_set: col,
				ticket_id: null,
			});
		} else {
			selectSeat(null);
		}
	};

	const showMenu = !!(seat && isSelected && !isPanning);

	return (
		<Popover open={showMenu}>
			<PopoverAnchor asChild>
				<button
					type="button"
					onClick={(e) => {
						e.stopPropagation();
						if (seat) {
							selectSeat(seat.id);
						} else {
							handleGridClick();
						}
					}}
					aria-label={`Seat row ${row} col ${col}`}
					className={cn(
						"w-[50px] h-[50px] rounded-none border flex flex-col items-center justify-center transition-all cursor-pointer relative outline-none focus:ring-2 focus:ring-primary focus:ring-offset-1 p-0",
						seat
							? isSelected
								? "bg-primary text-primary-foreground border-primary shadow-lg ring-2 ring-primary ring-offset-2 z-10"
								: "bg-white hover:bg-slate-50 border-slate-200"
							: "border-dashed border-slate-200 hover:border-primary/50 hover:bg-slate-50/50",
					)}
				>
					{seat ? (
						<>
							<Armchair
								className={cn(
									"h-5 w-5",
									isSelected ? "text-primary-foreground" : "text-slate-400",
								)}
							/>
							<span className="text-[8px] font-bold mt-1 truncate w-full text-center px-1">
								{seat.name}
							</span>
						</>
					) : (
						<span className="text-[10px] text-slate-300 font-mono">
							{row}:{col}
						</span>
					)}
				</button>
			</PopoverAnchor>
			<PopoverContent
				side="top"
				sideOffset={8}
				className="w-auto p-1 bg-transparent border-none shadow-none rounded-none"
				onOpenAutoFocus={(e) => e.preventDefault()}
			>
				{seat && (
					<div className="animate-in fade-in zoom-in-50 duration-200">
						<Button
							variant="destructive"
							size="icon"
							className="h-8 w-8 rounded-none shadow-md"
							onClick={(e) => {
								e.stopPropagation();
								removeSeat(seat.id);
							}}
						>
							<Trash2 className="h-4 w-4" />
						</Button>
					</div>
				)}
			</PopoverContent>
		</Popover>
	);
}