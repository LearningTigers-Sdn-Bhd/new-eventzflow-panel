/** biome-ignore-all lint/a11y/noStaticElementInteractions: Canvas panning requires mouse events on container */
/** biome-ignore-all lint/a11y/useKeyWithClickEvents: Canvas navigation is mouse-primary, keyboard nav is handled via grid cells */
"use client";

import { Hand, Minus, Plus } from "lucide-react";
import { useMemo } from "react";
import type {
	EventSeatSection,
	EventTicketSeat,
} from "@/lib/api/seat-ticketing/response";
import { cn } from "@/lib/utils";
import { CanvasProvider, useCanvas } from "./canvas-provider";
import { SeatBlock } from "./seat-block";
import { useSeatSessionStore } from "./use-seat-session-store";

export function SeatCanvas() {
	const { session, selectedSectionId } = useSeatSessionStore();

	const section = session?.event_seat_venues?.[0]?.event_seat_sections?.find(
		(s) => s.id === selectedSectionId,
	);

	if (!section) return null;

	const gridWidth = (section.seat_column || 10) * 50 + 40;
	const gridHeight = (section.seat_row || 10) * 50 + 40;

	return (
		<CanvasProvider
			contentWidth={gridWidth}
			contentHeight={gridHeight}
			enabled={!!section}
		>
			<SeatCanvasContent section={section} />
		</CanvasProvider>
	);
}

function SeatCanvasContent({ section }: { section: EventSeatSection }) {
	const {
		selectSeat,
		selectSeatPosition,
		zoom,
		setZoom,
		pan,
		isPanning,
		setIsPanning,
	} = useSeatSessionStore();

	const { isDragging } = useCanvas();

	const gridStyle = useMemo(() => {
		return {
			display: "grid",
			gridTemplateColumns: `repeat(${section.seat_column || 1}, 50px)`,
			gridTemplateRows: `repeat(${section.seat_row || 1}, 50px)`,
			gap: "8px",
			padding: "20px",
			backgroundColor: "white",
			width: "fit-content",
			boxShadow:
				"0 10px 25px -5px rgba(0, 0, 0, 0.1), 0 8px 10px -6px rgba(0, 0, 0, 0.1)",
			borderRadius: "0px",
			transform: `translate(${pan.x}px, ${pan.y}px) scale(${zoom})`,
			transformOrigin: "top left",
			cursor: isPanning ? (isDragging ? "grabbing" : "grab") : "default",
		};
	}, [section, zoom, pan, isPanning, isDragging]);

	const cells = [];
	for (let r = 1; r <= (section.seat_row || 1); r++) {
		for (let c = 1; c <= (section.seat_column || 1); c++) {
			const seat = section.event_ticket_seats?.find(
				(s: EventTicketSeat) => s.row_set === r && s.col_set === c,
			);

			cells.push(
				<SeatBlock
					key={`${r}-${c}`}
					seat={seat}
					row={r}
					col={c}
					sectionId={section.id}
					sectionName={section.name}
				/>,
			);
		}
	}

	return (
		<div
			className="relative w-full h-full"
			onClick={() => {
				selectSeat(null);
				selectSeatPosition(null);
			}}
		>
			<div
				style={gridStyle}
				className="relative transition-transform duration-75 ease-out"
				onClick={(e) => e.stopPropagation()}
			>
				{cells}
			</div>

			{/* Sticky Controls */}
			<div
				className="absolute bottom-6 right-6 flex flex-col gap-2 z-50"
				onClick={(e) => e.stopPropagation()}
			>
				<button
					type="button"
					className={cn(
						"h-10 w-10 shadow-md rounded-none flex items-center justify-center border transition-colors",
						isPanning
							? "bg-primary text-primary-foreground border-primary"
							: "bg-white text-foreground border-border hover:bg-muted",
					)}
					onClick={() => setIsPanning(!isPanning)}
				>
					<Hand className="h-5 w-5" />
				</button>
				<div className="flex flex-col bg-background rounded-none shadow-md border overflow-hidden">
					<button
						type="button"
						className="h-10 w-10 flex items-center justify-center hover:bg-muted transition-colors border-none"
						onClick={() => setZoom(Math.min(3, zoom + 0.1))}
					>
						<Plus className="h-4 w-4" />
					</button>
					<div className="h-px w-full bg-border" />
					<button
						type="button"
						className="h-10 w-10 flex items-center justify-center hover:bg-muted transition-colors border-none"
						onClick={() => setZoom(Math.max(0.2, zoom - 0.1))}
					>
						<Minus className="h-4 w-4" />
					</button>
				</div>
			</div>
		</div>
	);
}
