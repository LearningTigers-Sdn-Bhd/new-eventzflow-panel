"use client";

import type { Context } from "konva/lib/Context";
import type { KonvaEventObject } from "konva/lib/Node";
import type { Shape as ShapeType } from "konva/lib/Shape";
import type { Stage as StageType } from "konva/lib/Stage";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useDialog } from "@/hooks/use-dialog";
import type {
	EventSeatSection,
	EventTicketSeat,
} from "@/lib/api/seat-ticketing/response";
import { GroupAssignmentModal } from "./group-assignment-modal";
import { useSeatSessionStore } from "./use-seat-session-store";

const SEAT_SIZE = 40;
const SEAT_GAP = 8;
const PADDING = 40;

const COLOR_MAP: Record<string, string> = {
	red: "#dc2626",
	orange: "#ea580c",
	amber: "#d97706",
	yellow: "#ca8a04",
	lime: "#65a30d",
	green: "#16a34a",
	emerald: "#059669",
	teal: "#0d9488",
	cyan: "#0891b2",
	sky: "#0284c7",
	blue: "#2563eb",
	indigo: "#4f46e5",
	violet: "#7c3aed",
	purple: "#9333ea",
	fuchsia: "#c026d3",
	pink: "#db2777",
	rose: "#e11d48",
	slate: "#475569",
};

export function useSeatCanvas(section: EventSeatSection) {
	const hydrateSectionSeats = useSeatSessionStore(
		(state) => state.hydrateSectionSeats,
	);
	const selectSeat = useSeatSessionStore((state) => state.selectSeat);
	const selectSeats = useSeatSessionStore((state) => state.selectSeats);
	const toggleSeatSelection = useSeatSessionStore(
		(state) => state.toggleSeatSelection,
	);
	const selectSeatPosition = useSeatSessionStore(
		(state) => state.selectSeatPosition,
	);
	const zoom = useSeatSessionStore((state) => state.zoom);
	const setZoom = useSeatSessionStore((state) => state.setZoom);
	const pan = useSeatSessionStore((state) => state.pan);
	const setPan = useSeatSessionStore((state) => state.setPan);
	const isPanning = useSeatSessionStore((state) => state.isPanning);
	const setIsPanning = useSeatSessionStore((state) => state.setIsPanning);
	const interactionMode = useSeatSessionStore((state) => state.interactionMode);
	const addSeat = useSeatSessionStore((state) => state.addSeat);
	const addSeats = useSeatSessionStore((state) => state.addSeats);
	const removeSeat = useSeatSessionStore((state) => state.removeSeat);
	const activeGroupId = useSeatSessionStore((state) => state.activeGroupId);
	const assignSeatsToGroup = useSeatSessionStore(
		(state) => state.assignSeatsToGroup,
	);
	const selectedSeatId = useSeatSessionStore((state) => state.selectedSeatId);
	const selectedSeatIds = useSeatSessionStore((state) => state.selectedSeatIds);
	const selectedSeatPosition = useSeatSessionStore(
		(state) => state.selectedSeatPosition,
	);
	const hydratingSectionIds = useSeatSessionStore(
		(state) => state.hydratingSectionIds,
	);

	const isHydrating = hydratingSectionIds.includes(section.id);

	const allSeats = useSeatSessionStore(state => state.seats);
	const sectionSeats = useMemo(
		() =>
			Object.values(allSeats).filter(
				(s) => s.event_seat_section_id === section.id,
			),
		[allSeats, section.id],
	);

	// Ghost Previews (Virtual seats calculated from Blueprint config)
	const ghostSeats = useMemo(() => {
		const config = section.blueprint_config;
		if (!config) return [];

		// Only show ghost seats if actual seats are empty (new section)
		// OR if the user is explicitly configuring the blueprint
		const rowBlocks = config.row_blocks && config.row_blocks.length > 0 ? config.row_blocks : [section.seat_row || 0];
		const colBlocks = config.col_blocks && config.col_blocks.length > 0 ? config.col_blocks : [section.seat_column || 0];
		const rowGap = config.row_gap || 0;
		const colGap = config.col_gap || 0;

		const ghosts: { r: number; c: number }[] = [];
		let actualRow = 1;

		for (let rIdx = 0; rIdx < rowBlocks.length; rIdx++) {
			const rCount = rowBlocks[rIdx];
			for (let rInBlock = 0; rInBlock < rCount; rInBlock++) {
				let actualCol = 1;
				for (let cIdx = 0; cIdx < colBlocks.length; cIdx++) {
					const cCount = colBlocks[cIdx];
					for (let cInBlock = 0; cInBlock < cCount; cInBlock++) {
						ghosts.push({ r: actualRow, c: actualCol });
						actualCol++;
					}
					if (cIdx < colBlocks.length - 1) actualCol += colGap;
				}
				actualRow++;
			}
			if (rIdx < rowBlocks.length - 1) actualRow += rowGap;
		}

		return ghosts;
	}, [section.blueprint_config, section.seat_row, section.seat_column]);

	const stageRef = useRef<StageType>(null);
	const containerRef = useRef<HTMLDivElement>(null);
	const [dimensions, setDimensions] = useState({ width: 0, height: 0 });
	const { openDialog } = useDialog();

	// Viewport Culling Logic
	const visibleSeats = useMemo(() => {
		if (dimensions.width === 0 || dimensions.height === 0) return sectionSeats;

		return sectionSeats.filter((seat) => {
			const col = seat.col_set;
			const row = seat.row_set;
			if (col === null || row === null) return false;

			// Seat coordinates in local space
			const lx = PADDING + (col - 1) * (SEAT_SIZE + SEAT_GAP);
			const ly = PADDING + (row - 1) * (SEAT_SIZE + SEAT_GAP);

			// Seat coordinates in screen space
			const sx = lx * zoom + pan.x;
			const sy = ly * zoom + pan.y;
			const size = SEAT_SIZE * zoom;

			// Buffer of 1 seat to prevent popping at edges
			const BUFFER = size;

			return (
				sx + size + BUFFER > 0 &&
				sx - BUFFER < dimensions.width &&
				sy + size + BUFFER > 0 &&
				sy - BUFFER < dimensions.height
			);
		});
	}, [sectionSeats, dimensions, pan, zoom]);

	const [selectionBox, setSelectionBox] = useState<{
		x1: number;
		y1: number;
		x2: number;
		y2: number;
	} | null>(null);

	useEffect(() => {
		if (section.id > 0) {
			hydrateSectionSeats(section.id);
		}
	}, [section.id, hydrateSectionSeats]);

	useEffect(() => {
		const container = containerRef.current;
		if (!container) return;
		const updateSize = () => {
			setDimensions({
				width: container.clientWidth,
				height: container.clientHeight,
			});
		};
		updateSize();
		const observer = new ResizeObserver(updateSize);
		observer.observe(container);
		return () => observer.disconnect();
	}, []);

	const handleWheel = (e: KonvaEventObject<WheelEvent>) => {
		e.evt.preventDefault();
		if (e.evt.ctrlKey || e.evt.metaKey) {
			const delta = e.evt.deltaY > 0 ? -0.1 : 0.1;
			setZoom(Math.min(3, Math.max(0.2, zoom + delta)));
		} else {
			const deltaX =
				e.evt.shiftKey && e.evt.deltaY !== 0 ? e.evt.deltaY : e.evt.deltaX;
			const deltaY = e.evt.shiftKey ? 0 : e.evt.deltaY;
			setPan({
				x: pan.x - deltaX,
				y: pan.y - deltaY,
			});
		}
	};

	const handleMouseDown = (e: KonvaEventObject<MouseEvent>) => {
		if (isPanning) return;
		const stage = e.target.getStage();
		if (!stage) return;
		const pointer = stage.getPointerPosition();
		if (!pointer) return;

		const isBackground =
			e.target === stage ||
			e.target.name() === "grid-bg" ||
			e.target.className === "Shape";
		if (isBackground) {
			setSelectionBox({
				x1: pointer.x,
				y1: pointer.y,
				x2: pointer.x,
				y2: pointer.y,
			});
		}
	};

	const handleMouseMove = (e: KonvaEventObject<MouseEvent>) => {
		if (isPanning) return;
		const stage = e.target.getStage();
		if (!stage) return;
		const pointer = stage.getPointerPosition();
		if (!pointer) return;

		if (selectionBox) {
			setSelectionBox({ ...selectionBox, x2: pointer.x, y2: pointer.y });
		}

		const localX = (pointer.x - pan.x) / zoom;
		const localY = (pointer.y - pan.y) / zoom;
		const col = Math.floor((localX - PADDING) / (SEAT_SIZE + SEAT_GAP)) + 1;
		const row = Math.floor((localY - PADDING) / (SEAT_SIZE + SEAT_GAP)) + 1;

		if (
			col >= 1 &&
			col <= (section.seat_column || 0) &&
			row >= 1 &&
			row <= (section.seat_row || 0)
		) {
			stage.container().style.cursor = "pointer";
		} else {
			stage.container().style.cursor = "default";
		}
	};

	const handleMouseUp = () => {
		if (!selectionBox) return;
		const { x1, y1, x2, y2 } = selectionBox;
		setSelectionBox(null);

		const isTinyMove = Math.abs(x1 - x2) < 5 && Math.abs(y1 - y2) < 5;
		const stage = stageRef.current;
		if (!stage) return;
		const pointer = stage.getPointerPosition();
		if (!pointer) return;

		const localX = (pointer.x - pan.x) / zoom;
		const localY = (pointer.y - pan.y) / zoom;
		const col = Math.floor((localX - PADDING) / (SEAT_SIZE + SEAT_GAP)) + 1;
		const row = Math.floor((localY - PADDING) / (SEAT_SIZE + SEAT_GAP)) + 1;

		const minX = (Math.min(x1, x2) - pan.x) / zoom;
		const maxX = (Math.max(x1, x2) - pan.x) / zoom;
		const minY = (Math.min(y1, y2) - pan.y) / zoom;
		const maxY = (Math.max(y1, y2) - pan.y) / zoom;

		if (isTinyMove) {
			if (
				col >= 1 &&
				col <= (section.seat_column || 0) &&
				row >= 1 &&
				row <= (section.seat_row || 0)
			) {
				const seatAtPos = sectionSeats.find(
					(s) => s.row_set === row && s.col_set === col,
				);
				if (!seatAtPos) {
					if (interactionMode === "create") {
						addSeat(section.id, {
							name: `${section.name}-${row}${String.fromCharCode(64 + col)}`,
							extra_price: 0,
							row_set: row,
							col_set: col,
							ticket_id: null,
						});
					} else {
						selectSeatPosition({ row, col, sectionId: section.id });
					}
				}
			} else {
				selectSeat(null);
				selectSeatPosition(null);
			}
			return;
		}

		if (interactionMode === "create") {
			const colStart =
				Math.floor((minX - PADDING) / (SEAT_SIZE + SEAT_GAP)) + 1;
			const colEnd = Math.floor((maxX - PADDING) / (SEAT_SIZE + SEAT_GAP)) + 1;
			const rowStart =
				Math.floor((minY - PADDING) / (SEAT_SIZE + SEAT_GAP)) + 1;
			const rowEnd = Math.floor((maxY - PADDING) / (SEAT_SIZE + SEAT_GAP)) + 1;

			const newSeatsData: Omit<
				EventTicketSeat,
				| "id"
				| "event_seat_section_id"
				| "created_at"
				| "updated_at"
				| "visitor_id"
				| "locked_at"
				| "locked_by_session_id"
				| "status"
			>[] = [];
			for (
				let r = Math.max(1, rowStart);
				r <= Math.min(rowEnd, section.seat_row || 0);
				r++
			) {
				for (
					let c = Math.max(1, colStart);
					c <= Math.min(colEnd, section.seat_column || 0);
					c++
				) {
					const exists = sectionSeats.some(
						(s) => s.row_set === r && s.col_set === c,
					);
					if (!exists) {
						newSeatsData.push({
							name: `${section.name}-${r}${String.fromCharCode(64 + c)}`,
							extra_price: 0,
							row_set: r,
							col_set: c,
							ticket_id: null,
						});
					}
				}
			}
			if (newSeatsData.length > 0) addSeats(section.id, newSeatsData);
		} else {
			const selectedIds = sectionSeats
				.filter((seat) => {
					const c = seat.col_set;
					const r = seat.row_set;
					if (c === null || r === null) return false;
					const sx = PADDING + (c - 1) * (SEAT_SIZE + SEAT_GAP) + SEAT_SIZE / 2;
					const sy = PADDING + (r - 1) * (SEAT_SIZE + SEAT_GAP) + SEAT_SIZE / 2;
					return sx >= minX && sx <= maxX && sy >= minY && sy <= maxY;
				})
				.map((seat) => seat.id);
			if (selectedIds.length > 0) selectSeats(selectedIds);
		}
	};

	const handleSeatClick = (
		seat: EventTicketSeat,
		e: KonvaEventObject<MouseEvent>,
	) => {
		e.cancelBubble = true;
		if (isPanning) return;
		if (activeGroupId !== null) {
			assignSeatsToGroup([seat.id], activeGroupId);
			return;
		}
		if (e.evt.shiftKey) toggleSeatSelection(seat.id);
		else selectSeat(seat.id);
	};

	const handleAssignGroup = () => {
		const ids =
			selectedSeatIds.length > 0
				? selectedSeatIds
				: selectedSeatId
					? [selectedSeatId]
					: [];
		if (ids.length === 0) return;
		openDialog({
			component: GroupAssignmentModal,
			props: { seatIds: ids, sectionId: section.id },
			config: {
				title:
					ids.length > 1
						? `Assign ${ids.length} Seats to Group`
						: "Assign Seat to Group",
				size: "sm",
			},
		});
	};

	const handleRemoveSeats = () => {
		const ids =
			selectedSeatIds.length > 0
				? selectedSeatIds
				: selectedSeatId
					? [selectedSeatId]
					: [];
		for (const id of ids) removeSeat(id);
		selectSeat(null);
	};

	const drawGrid = useCallback(
		(ctx: Context, shape: ShapeType) => {
			const cols = section.seat_column || 1;
			const rows = section.seat_row || 1;
			ctx.beginPath();
			for (let r = 1; r <= rows; r++) {
				for (let c = 1; c <= cols; c++) {
					const x = PADDING + (c - 1) * (SEAT_SIZE + SEAT_GAP);
					const y = PADDING + (r - 1) * (SEAT_SIZE + SEAT_GAP);
					const radius = 4;
					ctx.moveTo(x + radius, y);
					ctx.lineTo(x + SEAT_SIZE - radius, y);
					ctx.quadraticCurveTo(x + SEAT_SIZE, y, x + SEAT_SIZE, y + radius);
					ctx.lineTo(x + SEAT_SIZE, y + SEAT_SIZE - radius);
					ctx.quadraticCurveTo(
						x + SEAT_SIZE,
						y + SEAT_SIZE,
						x + SEAT_SIZE - radius,
						y + SEAT_SIZE,
					);
					ctx.lineTo(x + radius, y + SEAT_SIZE);
					ctx.quadraticCurveTo(x, y + SEAT_SIZE, x, y + SEAT_SIZE - radius);
					ctx.lineTo(x, y + radius);
					ctx.quadraticCurveTo(x, y, x + radius, y);
				}
			}
			ctx.fillStrokeShape(shape);
		},
		[section.seat_column, section.seat_row],
	);

	const popoverPos = useMemo(() => {
		if (selectedSeatIds.length === 0 || !stageRef.current) return null;
		let [minR, maxR, minC, maxC] = [Infinity, -Infinity, Infinity, -Infinity];
		let hasValid = false;
		for (const id of selectedSeatIds) {
			const seat = allSeats[id];
			if (seat?.row_set != null && seat?.col_set != null) {
				minR = Math.min(minR, seat.row_set);
				maxR = Math.max(maxR, seat.row_set);
				minC = Math.min(minC, seat.col_set);
				maxC = Math.max(maxC, seat.col_set);
				hasValid = true;
			}
		}
		if (!hasValid) return null;
		const boxWidth = (maxC - minC + 1) * (SEAT_SIZE + SEAT_GAP) - SEAT_GAP;
		const centerX =
			PADDING + (minC - 1) * (SEAT_SIZE + SEAT_GAP) + boxWidth / 2;
		const topY = PADDING + (minR - 1) * (SEAT_SIZE + SEAT_GAP);
		return { x: centerX * zoom + pan.x, y: topY * zoom + pan.y - 10 };
	}, [selectedSeatIds, allSeats, zoom, pan]);

	const emptySelectionPos = useMemo(() => {
		if (
			!selectedSeatPosition ||
			!stageRef.current ||
			interactionMode !== "select"
		)
			return null;
		const x =
			PADDING +
			(selectedSeatPosition.col - 1) * (SEAT_SIZE + SEAT_GAP) +
			SEAT_SIZE / 2;
		const y = PADDING + (selectedSeatPosition.row - 1) * (SEAT_SIZE + SEAT_GAP);
		return { x: x * zoom + pan.x, y: y * zoom + pan.y - 10 };
	}, [selectedSeatPosition, zoom, pan, interactionMode]);

	return {
		stageRef,
		containerRef,
		dimensions,
		isHydrating,
		sectionSeats,
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
	};
}
