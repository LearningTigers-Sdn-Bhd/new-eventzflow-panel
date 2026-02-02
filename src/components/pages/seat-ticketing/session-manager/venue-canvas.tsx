/** biome-ignore-all lint/a11y/noStaticElementInteractions: Canvas panning requires mouse events on container */
/** biome-ignore-all lint/a11y/useKeyWithClickEvents: Canvas navigation is mouse-primary, keyboard nav is handled via grid cells */
"use client";

import { Image } from "@unpic/react";
import { Hand, Minus, Plus } from "lucide-react";
import { useEffect, useMemo, useRef, useState } from "react";
import type {
	EventSeatSection,
	EventSeatVenue,
} from "@/lib/api/seat-ticketing/response";
import { cn } from "@/lib/utils";
import { CanvasProvider, useCanvas } from "./canvas-provider";
import { SectionBlock } from "./section-block";
import { useSeatSessionStore } from "./use-seat-session-store";

const BASE_CELL_SIZE = 40;
const CELL_GAP = 1;
const MIN_CELL_SIZE = 12;

export function VenueCanvas() {
	const { session } = useSeatSessionStore();
	const venue = session?.event_seat_venues?.[0];
	const containerRef = useRef<HTMLDivElement>(null);
	const [containerSize, setContainerSize] = useState({ width: 0, height: 0 });

	useEffect(() => {
		const container = containerRef.current;
		if (!container) return;

		const updateSize = () => {
			setContainerSize({
				width: container.clientWidth,
				height: container.clientHeight,
			});
		};

		updateSize();
		const observer = new ResizeObserver(updateSize);
		observer.observe(container);

		return () => observer.disconnect();
	}, []);

	const columns = venue?.total_column || 1;
	const rows = venue?.total_row || 1;

	const cellSize = useMemo(() => {
		if (!containerSize.width || !containerSize.height) return BASE_CELL_SIZE;
		const availableWidth = Math.max(
			0,
			containerSize.width - (columns + 1) * CELL_GAP,
		);
		const availableHeight = Math.max(
			0,
			containerSize.height - (rows + 1) * CELL_GAP,
		);
		const maxCellSize = Math.min(
			BASE_CELL_SIZE,
			availableWidth / columns,
			availableHeight / rows,
		);
		return Math.max(MIN_CELL_SIZE, Math.floor(maxCellSize));
	}, [columns, rows, containerSize.height, containerSize.width]);

	const gridWidth = columns * cellSize + (columns + 1) * CELL_GAP;
	const gridHeight = rows * cellSize + (rows + 1) * CELL_GAP;

	if (!venue) {
		return (
			<div className="flex items-center justify-center h-full text-muted-foreground">
				No venue configured.
			</div>
		);
	}

	return (
		<div ref={containerRef} className="relative w-full h-full">
			<CanvasProvider
				contentWidth={gridWidth}
				contentHeight={gridHeight}
				enabled={!!venue}
			>
				<VenueCanvasContent
					venue={venue}
					cellSize={cellSize}
					cellGap={CELL_GAP}
				/>
			</CanvasProvider>
		</div>
	);
}

function VenueCanvasContent({
	venue,
	cellSize,
	cellGap,
}: {
	venue: EventSeatVenue;
	cellSize: number;
	cellGap: number;
}) {
	const {
		interactionMode,
		setInteractionMode,
		addSection,
		selectSection,
		zoom,
		setZoom,
		pan,
		isPanning,
		setIsPanning,
	} = useSeatSessionStore();

	const { isDragging } = useCanvas();

	const gridStyle = useMemo(() => {
		const aspectRatio =
			venue.aspect_ratio === "video"
				? "16/9"
				: venue.aspect_ratio === "square"
					? "1/1"
					: venue.aspect_ratio === "4:3"
						? "4/3"
						: undefined;

		return {
			display: "grid",
			gridTemplateColumns: `repeat(${venue.total_column || 1}, ${cellSize}px)`,
			gridTemplateRows: `repeat(${venue.total_row || 1}, ${cellSize}px)`,
			gap: `${cellGap}px`,
			backgroundColor: "#e5e7eb",
			width: "fit-content",
			padding: `${cellGap}px`,
			transform: `translate(${pan.x}px, ${pan.y}px) scale(${zoom})`,
			transformOrigin: "top left",
			cursor: isPanning ? (isDragging ? "grabbing" : "grab") : "default",
			aspectRatio,
		};
	}, [venue, zoom, pan, isPanning, isDragging, cellSize, cellGap]);

	const handleGridClick = (row: number, col: number) => {
		if (isPanning) return;

		if (interactionMode === "create") {
			addSection({
				name: `Section ${venue?.event_seat_sections?.length || 0 + 1}`,
				price: 0,
				start_row: row,
				start_column: col,
				row_span: 4,
				col_span: 5,
				seat_row: 5,
				seat_column: 5,
			});
			setInteractionMode("select");
		} else {
			selectSection(null);
		}
	};

	const cells = [];
	for (let r = 1; r <= (venue.total_row || 1); r++) {
		for (let c = 1; c <= (venue.total_column || 1); c++) {
			cells.push(
				<button
					key={`${r}-${c}`}
					type="button"
					className={cn(
						"bg-white transition-colors outline-none p-0 cursor-pointer block rounded-none w-full h-full relative z-0",
						!isPanning && "hover:bg-slate-50",
					)}
					onClick={(e) => {
						e.stopPropagation();
						handleGridClick(r, c);
					}}
					aria-label={`Grid cell row ${r} column ${c}`}
				/>,
			);
		}
	}

	return (
		<div className="relative flex items-center justify-center w-full h-full bg-muted">
			{/* Canvas Content */}
			<div className="absolute inset-0 flex items-center justify-center">
				<div className="absolute inset-0 bg-muted" aria-hidden="true" />
				<div
					style={gridStyle}
					className="relative transition-transform duration-75 ease-out border border-primary"
					onClick={() => selectSection(null)}
				>
					{cells}

					{venue.image_url && (
						<Image
							src={venue.image_url}
							alt="Venue overlay"
							className="absolute inset-0 w-full h-full object-cover opacity-40 pointer-events-none z-10"
							layout="fullWidth"
						/>
					)}

					{venue.event_seat_sections?.map((section: EventSeatSection) => (
						<SectionBlock
							key={section.id}
							section={section}
							cellSize={cellSize}
							cellGap={cellGap}
						/>
					))}
				</div>
			</div>

			{/* Sticky Controls */}
			<div className="absolute bottom-6 right-6 flex flex-col gap-2 z-50">
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
