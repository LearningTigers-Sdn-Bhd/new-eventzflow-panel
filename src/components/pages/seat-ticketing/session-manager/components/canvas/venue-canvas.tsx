/** biome-ignore-all lint/a11y/noStaticElementInteractions: Canvas panning requires mouse events on container */
/** biome-ignore-all lint/a11y/useKeyWithClickEvents: Canvas navigation is mouse-primary, keyboard nav is handled via grid cells */
"use client";

import { Image } from "@unpic/react";
import { Hand, Minus, Plus } from "lucide-react";
import { useEffect, useMemo, useRef } from "react";
import type { EventSeatVenue } from "@/lib/api/seat-ticketing/response";
import { cn } from "@/lib/utils";
import { CanvasProvider, useCanvas } from "../../providers/canvas-provider";
import { useSeatSessionStore } from "../../store/use-seat-session-store";
import { SectionBlock } from "./section-block";

const BASE_CELL_SIZE = 40;
const CELL_GAP = 1;

export function VenueCanvas() {
	const venue = useSeatSessionStore((state) => state.venue);
	const containerRef = useRef<HTMLDivElement>(null);

	const columns = venue?.total_column || 1;
	const rows = venue?.total_row || 1;

	// Use a fixed base size for logic; CanvasProvider handles the "Fit to Screen" via zoom
	const cellSize = BASE_CELL_SIZE;

	const gridWidth = columns * cellSize + (columns + 1) * CELL_GAP;
	const gridHeight = rows * cellSize + (rows + 1) * CELL_GAP;

	if (!venue) {
		return (
			<div className="flex h-full items-center justify-center text-muted-foreground">
				No venue configured.
			</div>
		);
	}

	return (
		<div ref={containerRef} className="relative h-full w-full">
			<CanvasProvider
				contentWidth={gridWidth}
				contentHeight={gridHeight}
				enabled={!!venue}
				venueId={venue?.id}
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
	const interactionMode = useSeatSessionStore((state) => state.interactionMode);
	const setInteractionMode = useSeatSessionStore(
		(state) => state.setInteractionMode,
	);
	const addSection = useSeatSessionStore((state) => state.addSection);
	const selectSection = useSeatSessionStore((state) => state.selectSection);
	const zoom = useSeatSessionStore((state) => state.zoom);
	const setZoom = useSeatSessionStore((state) => state.setZoom);
	const pan = useSeatSessionStore((state) => state.pan);
	const isPanning = useSeatSessionStore((state) => state.isPanning);
	const setIsPanning = useSeatSessionStore((state) => state.setIsPanning);
	const sectionIds = useSeatSessionStore((state) => state.sectionIds);

	const { isDragging } = useCanvas();

	const canvasRef = useRef<HTMLCanvasElement>(null);

	// Draw Grid on Canvas
	useEffect(() => {
		const canvas = canvasRef.current;
		if (!canvas) return;
		const ctx = canvas.getContext("2d");
		if (!ctx) return;

		const cols = venue.total_column || 1;
		const rows = venue.total_row || 1;

		// Set canvas size
		canvas.width = cols * cellSize + (cols + 1) * cellGap;
		canvas.height = rows * cellSize + (rows + 1) * cellGap;

		// Draw background
		ctx.fillStyle = "#e5e7eb"; // Slate 200
		ctx.fillRect(0, 0, canvas.width, canvas.height);

		// Draw cells
		ctx.fillStyle = "white";
		for (let r = 1; r <= rows; r++) {
			for (let c = 1; c <= cols; c++) {
				const x = (c - 1) * cellSize + c * cellGap;
				const y = (r - 1) * cellSize + r * cellGap;
				ctx.fillRect(x, y, cellSize, cellSize);
			}
		}
	}, [venue.total_column, venue.total_row, cellSize, cellGap]);

	const gridStyle = useMemo(() => {
		const cols = venue.total_column || 1;
		const rows = venue.total_row || 1;

		return {
			display: "grid" as const,
			gridTemplateColumns: `repeat(${cols}, ${cellSize}px)`,
			gridTemplateRows: `repeat(${rows}, ${cellSize}px)`,
			gap: `${cellGap}px`,
			width: `${cols * cellSize + (cols + 1) * cellGap}px`,
			height: `${rows * cellSize + (rows + 1) * cellGap}px`,
			padding: `${cellGap}px`,
			transform: `translate(${pan.x}px, ${pan.y}px) scale(${zoom})`,
			transformOrigin: "top left",
			cursor: isPanning ? (isDragging ? "grabbing" : "grab") : "default",
			backgroundColor: "#e5e7eb",
		};
	}, [venue, zoom, pan, isPanning, isDragging, cellSize, cellGap]);

	const handleGridClick = (e: React.MouseEvent) => {
		if (isPanning) return;

		// Calculate row/col from click coordinates
		const rect = e.currentTarget.getBoundingClientRect();
		const x = (e.clientX - rect.left) / zoom;
		const y = (e.clientY - rect.top) / zoom;

		const col = Math.floor(x / (cellSize + cellGap)) + 1;
		const row = Math.floor(y / (cellSize + cellGap)) + 1;

		if (
			col > (venue.total_column || 0) ||
			row > (venue.total_row || 0) ||
			col < 1 ||
			row < 1
		) {
			selectSection(null);
			return;
		}

		if (interactionMode === "create") {
			addSection({
				name: `Section ${sectionIds.length + 1}`,
				price: 0,
				start_row: row,
				start_column: col,
				row_span: 4,
				col_span: 5,
				seat_row: 5,
				seat_column: 5,
				color: "blue",
			});
			setInteractionMode("select");
		} else {
			selectSection(null);
		}
	};

	return (
		<div
			className="relative h-full w-full overflow-hidden bg-muted"
			onClick={() => selectSection(null)}
		>
			{/* Canvas Content */}
			<div
				style={gridStyle}
				className="relative border border-primary bg-slate-200 transition-transform duration-75 ease-out"
				onClick={handleGridClick}
			>
				<canvas ref={canvasRef} className="absolute inset-0 h-full w-full" />

				{venue.image_url && (
					<Image
						src={venue.image_url}
						alt="Venue overlay"
						className="pointer-events-none absolute inset-0 z-10 h-full w-full object-cover opacity-40"
						layout="fullWidth"
					/>
				)}

				{sectionIds.map((sid) => (
					<SectionWrapper
						key={sid}
						id={sid}
						cellSize={cellSize}
						cellGap={cellGap}
					/>
				))}
			</div>

			{/* Sticky Controls */}
			<div
				className="absolute right-6 bottom-6 z-50 flex flex-col gap-2"
				onClick={(e) => e.stopPropagation()}
			>
				<button
					type="button"
					className={cn(
						"flex h-10 w-10 items-center justify-center rounded-none border shadow-md transition-colors",
						isPanning
							? "border-primary bg-primary text-primary-foreground"
							: "border-border bg-white text-foreground hover:bg-muted",
					)}
					onClick={() => setIsPanning(!isPanning)}
				>
					<Hand className="h-5 w-5" />
				</button>
				<div className="flex flex-col overflow-hidden rounded-none border bg-background shadow-md">
					<button
						type="button"
						className="flex h-10 w-10 items-center justify-center border-none transition-colors hover:bg-muted"
						onClick={() => setZoom(Math.min(3, zoom + 0.1))}
					>
						<Plus className="h-4 w-4" />
					</button>
					<div className="h-px w-full bg-border" />
					<button
						type="button"
						className="flex h-10 w-10 items-center justify-center border-none transition-colors hover:bg-muted"
						onClick={() => setZoom(Math.max(0.2, zoom - 0.1))}
					>
						<Minus className="h-4 w-4" />
					</button>
				</div>
			</div>
		</div>
	);
}

function SectionWrapper({
	id,
	cellSize,
	cellGap,
}: {
	id: number;
	cellSize: number;
	cellGap: number;
}) {
	const section = useSeatSessionStore((state) => state.sections[id]);
	if (!section) return null;
	return (
		<SectionBlock section={section} cellSize={cellSize} cellGap={cellGap} />
	);
}
