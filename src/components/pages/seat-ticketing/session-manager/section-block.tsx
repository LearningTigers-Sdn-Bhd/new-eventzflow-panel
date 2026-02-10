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
import { getGroupColor } from "@/lib/utils/group-colors";
import { useSeatSessionStore } from "./use-seat-session-store";

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
	const {
		selectedSectionId,
		selectSection,
		setMode,
		removeSection,
		interactionMode,
		updateSection,
		isPanning,
	} = useSeatSessionStore();

	const isSelected = selectedSectionId === section.id;
	const [isResizing, setIsResizing] = useState(false);
	const [isDragging, setIsDragging] = useState(false);

	const sectionColorClass = getGroupColor(section.color || "blue");

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
					onClick={(e) => e.stopPropagation()}
					className={cn(
						"relative flex flex-col border-2 transition-all group select-none rounded-none bg-slate-50",
						isSelected
							? "border-primary ring-2 ring-primary ring-offset-2 z-20"
							: "border-primary/20 hover:border-primary/50",
						(isResizing || isDragging) &&
							"opacity-80 pointer-events-none-children",
						isDragging && "cursor-grabbing",
					)}
				>
					{/* Header */}
					<div
						className={cn(
							"flex items-center justify-between py-2 px-3 shrink-0 rounded-none text-white",
							sectionColorClass,
						)}
					>
						<div className="flex flex-col text-white">
							<span className="text-xs font-bold truncate max-w-[80px]">
								{section.name}
							</span>
							<span className="text-[10px] opacity-90">${section.price}</span>
						</div>
						<span className="text-[10px] font-mono whitespace-nowrap">
							{section.seat_row}x{section.seat_column}
						</span>
					</div>

					{/* Content */}
					<div className="flex-1 flex flex-col items-center justify-center p-2 text-center pointer-events-none rounded-none bg-slate-50">
						<span
							className={cn(
								"text-xl font-bold",
								sectionColorClass.replace("bg-", "text-"),
							)}
						>
							{section.event_ticket_seats?.length || 0}
						</span>
						<span className="text-[10px] text-muted-foreground uppercase tracking-tight">
							Seats
						</span>
					</div>

					{/* Resize Handle */}
					{isSelected && !isPanning && (
						<div
							className={cn(
								"absolute -bottom-1.5 -right-1.5 w-4 h-4 cursor-nwse-resize rounded-none z-30 hover:scale-125 transition-transform",
								sectionColorClass,
							)}
							onMouseDown={(e) => handleResizeStart(e)}
						/>
					)}
				</div>
			</PopoverAnchor>
			<PopoverContent
				side="top"
				sideOffset={10}
				className="w-auto p-1 flex items-center gap-1 bg-white rounded-none"
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
				<div className="w-px h-4 bg-border mx-1" />
				<Button
					variant="ghost"
					size="sm"
					onClick={handleDelete}
					className="h-8 gap-2 text-destructive hover:text-destructive hover:bg-destructive/10 rounded-none"
				>
					<Trash2 className="h-3.5 w-3.5" />
					Delete
				</Button>
			</PopoverContent>
		</Popover>
	);
}
