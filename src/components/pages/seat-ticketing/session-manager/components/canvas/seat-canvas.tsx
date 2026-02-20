"use client";

import {
	Armchair as ArmchairIcon,
	Hand,
	Layers,
	Loader2,
	Minus,
	Plus,
	Trash2,
} from "lucide-react";
import { Group, Layer, Rect, Shape, Stage } from "react-konva";
import { Button } from "@/components/ui/button";
import {
	Popover,
	PopoverAnchor,
	PopoverContent,
} from "@/components/ui/popover";
import type { EventSeatSection } from "@/lib/api/seat-ticketing/response";
import { cn } from "@/lib/utils";
import { useSeatCanvas } from "../../hooks/use-seat-canvas";
import { CanvasProvider } from "../../providers/canvas-provider";
import { useSeatSessionStore } from "../../store/use-seat-session-store";

const SEAT_SIZE = 40;
const SEAT_GAP = 8;
const PADDING = 40;

export function SeatCanvas() {
	const selectedSectionId = useSeatSessionStore(
		(state) => state.selectedSectionId,
	);
	const section = useSeatSessionStore((state) =>
		selectedSectionId ? state.sections[selectedSectionId] : null,
	);

	if (!section) return null;

	const gridWidth =
		(section.seat_column || 10) * (SEAT_SIZE + SEAT_GAP) + PADDING * 2;
	const gridHeight =
		(section.seat_row || 10) * (SEAT_SIZE + SEAT_GAP) + PADDING * 2;

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
		stageRef,
		containerRef,
		dimensions,
		isHydrating,
		visibleSeats,
		ghostSeats,
		zoom,
		pan,
		isPanning,
		setIsPanning,
		setZoom,
		selectionBox,
		handleWheel,
		handleMouseDown,
		handleMouseMove,
		handleMouseUp,
		handleSeatClick,
		drawGrid,
		popoverPos,
		emptySelectionPos,
		handleAssignGroup,
		handleRemoveSeats,
		addSeat,
		selectSeatPosition,
		selectedSeatPosition,
		selectedSeatIds,
		COLOR_MAP,
	} = useSeatCanvas(section);

	return (
		<div ref={containerRef} className="relative h-full w-full">
			{isHydrating && (
				<div className="fade-in absolute inset-0 z-50 flex animate-in flex-col items-center justify-center bg-white/60 backdrop-blur-[2px] duration-300">
					<Loader2 className="h-8 w-8 animate-spin text-primary" />
					<p className="mt-2 font-semibold text-primary text-sm uppercase tracking-widest">
						Loading Seats...
					</p>
				</div>
			)}
			{dimensions.width > 0 && (
				<Stage
					ref={stageRef}
					width={dimensions.width}
					height={dimensions.height}
					onWheel={handleWheel}
					onMouseDown={handleMouseDown}
					onMouseMove={handleMouseMove}
					onMouseUp={handleMouseUp}
					draggable={isPanning}
					style={{ cursor: isPanning ? "grab" : "default" }}
				>
					<Layer x={pan.x} y={pan.y} scaleX={zoom} scaleY={zoom}>
						<Rect
							name="grid-bg"
							x={PADDING - 10}
							y={PADDING - 10}
							width={(section.seat_column || 1) * (SEAT_SIZE + SEAT_GAP) + 20}
							height={(section.seat_row || 1) * (SEAT_SIZE + SEAT_GAP) + 20}
							fill="white"
							shadowBlur={10}
							shadowOpacity={0.1}
						/>
						<Shape
							sceneFunc={drawGrid}
							fill="#f8fafc"
							stroke="#e2e8f0"
							strokeWidth={1}
							listening={false}
						/>

						{/* Ghost Previews (Blueprint Preview) */}
						{ghostSeats.map((ghost) => {
							const x = PADDING + (ghost.c - 1) * (SEAT_SIZE + SEAT_GAP);
							const y = PADDING + (ghost.r - 1) * (SEAT_SIZE + SEAT_GAP);
							return (
								<Group
									key={`ghost-${ghost.r}-${ghost.c}`}
									x={x}
									y={y}
									opacity={0.4}
									listening={false}
								>
									<Rect
										width={SEAT_SIZE}
										height={SEAT_SIZE}
										fill="#e2e8f0"
										cornerRadius={4}
									/>
									<Rect
										x={4}
										y={4}
										width={SEAT_SIZE - 8}
										height={SEAT_SIZE - 8}
										fill="#94a3b8"
										cornerRadius={2}
									/>
								</Group>
							);
						})}

						{selectedSeatPosition && (
							<Rect
								x={
									PADDING +
									(selectedSeatPosition.col - 1) * (SEAT_SIZE + SEAT_GAP)
								}
								y={
									PADDING +
									(selectedSeatPosition.row - 1) * (SEAT_SIZE + SEAT_GAP)
								}
								width={SEAT_SIZE}
								height={SEAT_SIZE}
								stroke="#3b82f6"
								strokeWidth={2}
								cornerRadius={4}
								listening={false}
							/>
						)}
						{visibleSeats.map((seat) => {
							const isSelected = selectedSeatIds.includes(seat.id);
							const [col, row] = [seat.col_set, seat.row_set];
							if (col == null || row == null) return null;
							const x = PADDING + (col - 1) * (SEAT_SIZE + SEAT_GAP);
							const y = PADDING + (row - 1) * (SEAT_SIZE + SEAT_GAP);
							let groupColor = "#94a3b8";
							if (seat.event_seat_group_assignment) {
								const group = section.event_seat_groups?.find(
									(g) =>
										g.id ===
										seat.event_seat_group_assignment?.event_seat_group_id,
								);
								if (group?.color)
									groupColor = COLOR_MAP[group.color] || groupColor;
							}
							return (
								<Group
									key={seat.id}
									x={x}
									y={y}
									onClick={(e) => handleSeatClick(seat, e)}
									onMouseEnter={(e) => {
										const s = e.target.getStage();
										if (s) s.container().style.cursor = "pointer";
									}}
									onMouseLeave={(e) => {
										const s = e.target.getStage();
										if (s)
											s.container().style.cursor = isPanning
												? "grab"
												: "default";
									}}
								>
									<Rect
										width={SEAT_SIZE}
										height={SEAT_SIZE}
										fill={isSelected ? "#2563eb" : "white"}
										stroke={isSelected ? "#1e40af" : groupColor}
										strokeWidth={isSelected ? 2 : 1.5}
										cornerRadius={4}
										shadowBlur={isSelected ? 10 : 0}
										shadowColor="#2563eb"
									/>
									<Rect
										x={4}
										y={4}
										width={SEAT_SIZE - 8}
										height={SEAT_SIZE - 8}
										fill={isSelected ? "white" : groupColor}
										cornerRadius={2}
										listening={false}
									/>
								</Group>
							);
						})}
					</Layer>
					{selectionBox && (
						<Layer>
							<Rect
								x={Math.min(selectionBox.x1, selectionBox.x2)}
								y={Math.min(selectionBox.y1, selectionBox.y2)}
								width={Math.abs(selectionBox.x2 - selectionBox.x1)}
								height={Math.abs(selectionBox.y2 - selectionBox.y1)}
								fill="rgba(59, 130, 246, 0.1)"
								stroke="#3b82f6"
								strokeWidth={1}
								dash={[4, 4]}
							/>
						</Layer>
					)}
				</Stage>
			)}
			{popoverPos && (
				<div
					className="pointer-events-none absolute"
					style={{ left: popoverPos.x, top: popoverPos.y }}
				>
					<Popover open={true}>
						<PopoverAnchor>
							<div className="h-1 w-1" />
						</PopoverAnchor>
						<PopoverContent
							side="top"
							sideOffset={10}
							className="pointer-events-auto flex w-auto items-center gap-1 rounded-none border bg-white p-1 shadow-md"
						>
							<Button
								variant="ghost"
								size="icon"
								className="h-8 w-8 rounded-none"
								onClick={handleAssignGroup}
								title="Assign Group"
							>
								<Layers className="h-4 w-4" />
							</Button>
							<div className="mx-0.5 h-4 w-px bg-border" />
							<Button
								variant="destructive"
								size="icon"
								className="h-8 w-8 rounded-none shadow-md"
								onClick={handleRemoveSeats}
								title="Delete"
							>
								<Trash2 className="h-4 w-4" />
							</Button>
						</PopoverContent>
					</Popover>
				</div>
			)}
			{emptySelectionPos && (
				<div
					className="pointer-events-none absolute"
					style={{ left: emptySelectionPos.x, top: emptySelectionPos.y }}
				>
					<Popover open={true}>
						<PopoverAnchor>
							<div className="h-1 w-1" />
						</PopoverAnchor>
						<PopoverContent
							side="top"
							sideOffset={10}
							className="pointer-events-auto w-auto rounded-none border bg-white p-1 shadow-md"
						>
							<Button
								size="sm"
								className="h-8 rounded-none shadow-md"
								onClick={(e) => {
									e.stopPropagation();
									if (selectedSeatPosition) {
										addSeat(section.id, {
											name: `${section.name}-${selectedSeatPosition.row}${String.fromCharCode(64 + selectedSeatPosition.col)}`,
											extra_price: 0,
											row_set: selectedSeatPosition.row,
											col_set: selectedSeatPosition.col,
											ticket_id: null,
										});
										selectSeatPosition(null);
									}
								}}
							>
								<ArmchairIcon className="mr-2 h-3.5 w-3.5" />
								Add Seat
							</Button>
						</PopoverContent>
					</Popover>
				</div>
			)}
			<div className="absolute right-6 bottom-6 z-50 flex flex-col gap-2">
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
