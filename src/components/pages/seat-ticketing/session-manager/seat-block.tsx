"use client";

import { Armchair, Layers, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
	Popover,
	PopoverAnchor,
	PopoverContent,
} from "@/components/ui/popover";
import { useDialog } from "@/hooks/use-dialog";
import type { EventTicketSeat } from "@/lib/api/seat-ticketing/response";
import { cn } from "@/lib/utils";
import { getGroupColor } from "@/lib/utils/group-colors";
import { GroupAssignmentModal } from "./group-assignment-modal";
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
	const selectedSeatId = useSeatSessionStore(state => state.selectedSeatId);
	const selectedSeatIds = useSeatSessionStore(state => state.selectedSeatIds);
	const selectedSeatPosition = useSeatSessionStore(state => state.selectedSeatPosition);
	const selectSeat = useSeatSessionStore(state => state.selectSeat);
	const toggleSeatSelection = useSeatSessionStore(state => state.toggleSeatSelection);
	const selectSeatPosition = useSeatSessionStore(state => state.selectSeatPosition);
	const removeSeat = useSeatSessionStore(state => state.removeSeat);
	const addSeat = useSeatSessionStore(state => state.addSeat);
	const interactionMode = useSeatSessionStore(state => state.interactionMode);
	const isPanning = useSeatSessionStore(state => state.isPanning);
	const activeGroupId = useSeatSessionStore(state => state.activeGroupId);
	const assignSeatsToGroup = useSeatSessionStore(state => state.assignSeatsToGroup);
	const section = useSeatSessionStore(state => state.sections[sectionId]);

	const { openDialog } = useDialog();

	const isSelected = seat && selectedSeatIds.includes(seat.id);
	const isEmptySelected =
		!seat &&
		selectedSeatPosition?.row === row &&
		selectedSeatPosition?.col === col &&
		selectedSeatPosition?.sectionId === sectionId;

	// Determine group color
	let groupColorClass = "";
	if (seat?.event_seat_group_assignment && section) {
		const group = section.event_seat_groups?.find(
			(g) => g.id === seat.event_seat_group_assignment?.event_seat_group_id,
		);
		if (group) {
			groupColorClass = getGroupColor(group.color);
		}
	}

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
			return;
		}

		selectSeatPosition({ row, col, sectionId });
	};

	const handleSeatClick = (e: React.MouseEvent) => {
		e.stopPropagation();
		if (!seat) {
			handleGridClick();
			return;
		}

		if (activeGroupId !== null) {
			assignSeatsToGroup([seat.id], activeGroupId);
			return;
		}

		if (e.shiftKey) {
			toggleSeatSelection(seat.id);
		} else {
			selectSeat(seat.id);
		}
	};

	const handleAssignGroup = (e: React.MouseEvent) => {
		e.stopPropagation();
		const ids =
			selectedSeatIds.length > 0 ? selectedSeatIds : seat ? [seat.id] : [];
		if (ids.length === 0) return;

		openDialog({
			component: GroupAssignmentModal,
			props: {
				seatIds: ids,
				sectionId,
			},
			config: {
				title:
					ids.length > 1
						? `Assign ${ids.length} Seats to Group`
						: "Assign Seat to Group",
				size: "sm",
			},
		});
	};

	const handleRemoveClick = (e: React.MouseEvent) => {
		e.stopPropagation();
		if (!seat) return;

		if (selectedSeatIds.length > 1) {
			// Bulk remove
			for (const id of selectedSeatIds) {
				removeSeat(id);
			}
		} else {
			removeSeat(seat.id);
		}
	};

	const showMenu =
		!isPanning &&
		activeGroupId === null &&
		((seat && isSelected && selectedSeatId === seat.id) ||
			(!seat && isEmptySelected && interactionMode === "select"));

	const SEAT_SIZE = 50;
	const SEAT_GAP = 8;
	const PADDING = 20;

	const style: React.CSSProperties = {
		position: "absolute",
		left: `${PADDING + (col - 1) * (SEAT_SIZE + SEAT_GAP)}px`,
		top: `${PADDING + (row - 1) * (SEAT_SIZE + SEAT_GAP)}px`,
		width: `${SEAT_SIZE}px`,
		height: `${SEAT_SIZE}px`,
		zIndex: isSelected ? 30 : 20,
	};

	return (
		<Popover open={showMenu}>
			<PopoverAnchor asChild>
				<button
					type="button"
					style={style}
					onClick={handleSeatClick}
					onContextMenu={(e) => {
						if (seat) {
							e.preventDefault();
							selectSeat(seat.id);
						}
					}}
					aria-label={`Seat row ${row} col ${col}`}
					className={cn(
						"rounded-none border flex flex-col items-center justify-center transition-all cursor-pointer outline-none focus:ring-2 focus:ring-primary focus:ring-offset-1 p-0",
						seat
							? isSelected
								? "bg-primary text-primary-foreground border-primary shadow-lg ring-2 ring-primary ring-offset-2"
								: "bg-white hover:bg-slate-50 border-slate-200"
							: "border-dashed border-slate-200 hover:border-primary/50 hover:bg-slate-50/50",
					)}
				>
					{seat ? (
						<>
							{seat.event_seat_group_assignment && (
								<div
									className={cn(
										"absolute top-1 right-1 w-2 h-2 rounded-full",
										groupColorClass || "bg-blue-500",
									)}
								/>
							)}
							<Armchair
								className={cn(
									"h-5 w-5",
									isSelected ? "text-primary-foreground" : "text-slate-400",
									!isSelected && groupColorClass
										? groupColorClass.replace("bg-", "text-")
										: "",
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
				className="w-auto p-1 flex items-center gap-1 bg-white border shadow-md rounded-none"
				onOpenAutoFocus={(e) => e.preventDefault()}
			>
				{seat && (
					<div className="flex items-center gap-1 animate-in fade-in zoom-in-50 duration-200">
						<Button
							variant="ghost"
							size="icon"
							className="h-8 w-8 rounded-none"
							onClick={handleAssignGroup}
							title="Assign Group"
						>
							<Layers className="h-4 w-4" />
						</Button>
						<div className="w-px h-4 bg-border mx-0.5" />
						<Button
							variant="destructive"
							size="icon"
							className="h-8 w-8 rounded-none shadow-md"
							onClick={handleRemoveClick}
							title={
								selectedSeatIds.length > 1
									? `Delete ${selectedSeatIds.length} seats`
									: "Delete seat"
							}
						>
							<Trash2 className="h-4 w-4" />
						</Button>
					</div>
				)}
				{!seat && isEmptySelected && interactionMode === "select" && (
					<div className="animate-in fade-in zoom-in-50 duration-200">
						<Button
							size="sm"
							className="h-8 rounded-none shadow-md"
							onClick={(e) => {
								e.stopPropagation();
								addSeat(sectionId, {
									name: `${sectionName}-${row}${String.fromCharCode(64 + col)}`,
									extra_price: 0,
									row_set: row,
									col_set: col,
									ticket_id: null,
								});
								selectSeatPosition(null);
							}}
						>
							<Armchair className="h-3.5 w-3.5 mr-2" />
							Add Seat
						</Button>
					</div>
				)}
			</PopoverContent>
		</Popover>
	);
}
