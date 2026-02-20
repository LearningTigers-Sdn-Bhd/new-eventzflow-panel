/** biome-ignore-all lint/a11y/noStaticElementInteractions: ignore */
/** biome-ignore-all lint/a11y/useKeyWithClickEvents: ignore */
"use client";

import { Settings, Trash2 } from "lucide-react";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
	Popover,
	PopoverAnchor,
	PopoverContent,
} from "@/components/ui/popover";
import type { EventSeatSection } from "@/lib/api/seat-ticketing/response";
import { cn } from "@/lib/utils";
import { getGroupColorHex } from "@/lib/utils/group-colors";
import { useSeatSessionStore } from "../../store/use-seat-session-store";

interface SectionBlockProps {
	section: EventSeatSection;
	cellSize: number;
	cellGap: number;
}

export function SectionBlock({
	section,
	cellSize,
	cellGap,
}: SectionBlockProps) {
	const selectedSectionId = useSeatSessionStore(
		(state) => state.selectedSectionId,
	);
	const selectSection = useSeatSessionStore((state) => state.selectSection);
	const setMode = useSeatSessionStore((state) => state.setMode);
	const removeSection = useSeatSessionStore((state) => state.removeSection);
	const interactionMode = useSeatSessionStore((state) => state.interactionMode);
	const updateSection = useSeatSessionStore((state) => state.updateSection);
	const isPanning = useSeatSessionStore((state) => state.isPanning);

	const isSelected = selectedSectionId === section.id;
	const [isResizing, setIsResizing] = useState(false);
	const [isDragging, setIsDragging] = useState(false);

	const colorHex = getGroupColorHex(section.color);

	const style: React.CSSProperties = {
		gridRowStart: section.start_row || 1,
		gridRowEnd: `span ${section.row_span || 1}`,
		gridColumnStart: section.start_column || 1,
		gridColumnEnd: `span ${section.col_span || 1}`,
		transform: `rotate(${section.rotation ?? 0}deg)`,
		transformOrigin: "center",
		zIndex: isSelected || isDragging ? 30 : 20,
		cursor: isPanning
			? "grab"
			: interactionMode === "select"
				? "move"
				: "default",
	};

	const handleManageSeats = (e: React.MouseEvent) => {
		e.stopPropagation();
		selectSection(section.id);
		setMode("seat_placement");
	};

	const handleDelete = (e: React.MouseEvent) => {
		e.stopPropagation();
		removeSection(section.id);
	};

	// Drag to Move Logic
	const handleMouseDown = (e: React.MouseEvent) => {
		if (isPanning || interactionMode !== "select" || e.button !== 0) return;

		e.preventDefault();
		e.stopPropagation();
		selectSection(section.id);
		setIsDragging(true);

		const startX = e.clientX;
		const startY = e.clientY;
		const startRow = section.start_row || 1;
		const startCol = section.start_column || 1;
		const cellStep = cellSize + cellGap;

		const handleMouseMove = (moveEvent: MouseEvent) => {
			const deltaX = moveEvent.clientX - startX;
			const deltaY = moveEvent.clientY - startY;

			const deltaCols = Math.round(deltaX / cellStep);
			const deltaRows = Math.round(deltaY / cellStep);

			const newRow = Math.max(1, startRow + deltaRows);
			const newCol = Math.max(1, startCol + deltaCols);

			if (newRow !== section.start_row || newCol !== section.start_column) {
				updateSection(section.id, {
					start_row: newRow,
					start_column: newCol,
				});
			}
		};

		const handleMouseUp = () => {
			setIsDragging(false);
			document.removeEventListener("mousemove", handleMouseMove);
			document.removeEventListener("mouseup", handleMouseUp);
		};

		document.addEventListener("mousemove", handleMouseMove);
		document.addEventListener("mouseup", handleMouseUp);
	};

	// Resize Logic
	const handleResizeStart = (e: React.MouseEvent) => {
		e.stopPropagation();
		e.preventDefault();
		if (isPanning) return;

		setIsResizing(true);

		const startX = e.clientX;
		const startY = e.clientY;
		const startRowSpan = section.row_span || 1;
		const startColSpan = section.col_span || 1;
		const cellStep = cellSize + cellGap;

		const handleMouseMove = (moveEvent: MouseEvent) => {
			const deltaX = moveEvent.clientX - startX;
			const deltaY = moveEvent.clientY - startY;

			const deltaCols = Math.round(deltaX / cellStep);
			const deltaRows = Math.round(deltaY / cellStep);

			const newRowSpan = Math.max(1, startRowSpan + deltaRows);
			const newColSpan = Math.max(1, startColSpan + deltaCols);

			if (newRowSpan !== section.row_span || newColSpan !== section.col_span) {
				updateSection(section.id, {
					row_span: newRowSpan,
					col_span: newColSpan,
				});
			}
		};

		const handleMouseUp = () => {
			setIsResizing(false);
			document.removeEventListener("mousemove", handleMouseMove);
			document.removeEventListener("mouseup", handleMouseUp);
		};

		document.addEventListener("mousemove", handleMouseMove);
		document.addEventListener("mouseup", handleMouseUp);
	};

	const showMenu = isSelected && !isResizing && !isDragging && !isPanning;

	return (
		<Popover open={showMenu}>
			<PopoverAnchor asChild>
				<div
					style={style}
					onMouseDown={handleMouseDown}
					onClick={(e) => {
						e.stopPropagation();
						selectSection(section.id);
					}}
					className={cn(
						"group relative flex select-none flex-col rounded-none border-2 bg-slate-50 transition-all",
						isSelected
							? "z-20 border-primary ring-2 ring-primary ring-offset-2"
							: "border-primary/20 hover:border-primary/50",
						(isResizing || isDragging) &&
							"pointer-events-none-children opacity-80",
						isDragging && "cursor-grabbing",
					)}
				>
					{/* Header */}
					<div
						className="flex shrink-0 items-center justify-between overflow-hidden rounded-none px-4 py-3 text-white"
						style={{ backgroundColor: colorHex }}
					>
						<div className="flex flex-col text-white">
							<span className="max-w-[120px] truncate font-bold text-lg">
								{section.name}
							</span>
							<span className="text-base opacity-90">${section.price}</span>
						</div>
						<span className="whitespace-nowrap font-mono text-sm">
							{section.seat_row}x{section.seat_column}
						</span>
					</div>

					{/* Content */}
					<div className="pointer-events-none flex flex-1 flex-col items-center justify-center overflow-hidden rounded-none bg-slate-50 p-4 text-center">
						<div
							className="flex flex-col items-center justify-center"
							style={{ transform: `rotate(${-(section.rotation ?? 0)}deg)` }}
						>
							<span
								className="font-black text-6xl tracking-tighter"
								style={{ color: colorHex }}
							>
								{section.seats_count ?? section.event_ticket_seats?.length ?? 0}
							</span>
							<span className="mt-1 font-bold text-muted-foreground text-sm uppercase tracking-widest">
								Seats
							</span>
						</div>
					</div>

					{/* Resize Handle */}
					{isSelected && !isPanning && (
						<div
							className="absolute -right-1.5 -bottom-1.5 z-30 h-4 w-4 cursor-nwse-resize rounded-none transition-transform hover:scale-125"
							style={{ backgroundColor: colorHex }}
							onMouseDown={(e) => handleResizeStart(e)}
						/>
					)}
				</div>
			</PopoverAnchor>
			<PopoverContent
				side="top"
				sideOffset={10}
				className="flex w-auto items-center gap-1 rounded-none bg-white p-1"
				onOpenAutoFocus={(e) => e.preventDefault()}
			>
				<Button
					variant="ghost"
					size="sm"
					onClick={handleManageSeats}
					className="h-8 gap-2 rounded-none"
				>
					<Settings className="h-3.5 w-3.5" />
					Manage Seats
				</Button>
				<div className="mx-1 h-4 w-px bg-border" />
				<Button
					variant="ghost"
					size="sm"
					onClick={handleDelete}
					className="h-8 gap-2 rounded-none text-destructive hover:bg-destructive/10 hover:text-destructive"
				>
					<Trash2 className="h-3.5 w-3.5" />
					Delete
				</Button>
			</PopoverContent>
		</Popover>
	);
}
