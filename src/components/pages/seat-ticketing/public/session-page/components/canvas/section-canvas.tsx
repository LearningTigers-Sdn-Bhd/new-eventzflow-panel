"use client";

import type Konva from "konva";
import type { KonvaEventObject } from "konva/lib/Node";
import type { Stage as StageType } from "konva/lib/Stage";
import React, { useEffect, useMemo, useRef, useState } from "react";
import { Group, Label, Layer, Line, Rect, Stage, Tag, Text } from "react-konva";
import type {
	EventSeatGroup,
	EventSeatSection,
	EventTicketSeat,
} from "@/lib/api/seat-ticketing/response";
import { getSectionShades } from "@/lib/utils/group-colors";
import { useSectionBoundsNavigation } from "../../hooks/use-canvas-navigation";
import { Legend } from "./legend";
import { ZoomControl } from "./zoom-control";

const SEAT_SIZE = 36;
const SEAT_SPACING = 45;
const SECTION_PADDING = 30;
const FONT_FAMILY = "Geist, Inter, system-ui, sans-serif";

interface SeatProps {
	seat: EventTicketSeat;
	isSelected: boolean;
	seatX: number;
	seatY: number;
	onClick: (seat: EventTicketSeat) => void;
	baseColor: string;
	groupColor?: string | null;
	onMouseEnter: (seat: EventTicketSeat, x: number, y: number) => void;
	onMouseLeave: () => void;
}

const Seat = React.memo(
	({
		seat,
		isSelected,
		seatX,
		seatY,
		onClick,
		baseColor,
		groupColor,
		onMouseEnter,
		onMouseLeave,
	}: SeatProps) => {
		const isInteractive = seat.status === "available" || isSelected;
		const isSold = seat.status === "sold";
		const isLocked = seat.status === "locked" && !isSelected;

		const finalColor = groupColor || baseColor;
		const shades = getSectionShades(finalColor);

		const getSeatFill = () => {
			if (isSelected) return "#10b981"; // emerald-500
			if (isLocked) return "#f59e0b"; // amber-500
			if (isSold) return "#94a3b8"; // slate-400
			return shades[500];
		};

		return (
			<Group
				x={seatX}
				y={seatY}
				onClick={() => {
					onMouseEnter(seat, seatX, seatY);
					onClick(seat);
				}}
				onTap={() => {
					onMouseEnter(seat, seatX, seatY);
					onClick(seat);
				}}
				onMouseEnter={(e) => {
					const container = e.target.getStage()?.container();
					if (container && isInteractive) container.style.cursor = "pointer";
					onMouseEnter(seat, seatX, seatY);
				}}
				onMouseLeave={(e) => {
					const container = e.target.getStage()?.container();
					if (container) container.style.cursor = "default";
					onMouseLeave();
				}}
			>
				<Rect
					width={SEAT_SIZE}
					height={SEAT_SIZE}
					fill={getSeatFill()}
					cornerRadius={4}
					opacity={isInteractive ? 1 : 0.8}
				/>

				{/* Selected Nested Box */}
				{isSelected && (
					<Rect
						x={6}
						y={6}
						width={SEAT_SIZE - 12}
						height={SEAT_SIZE - 12}
						fill="#a7f3d0" // emerald-200
						cornerRadius={2}
					/>
				)}

				{/* Locked Nested Box */}
				{isLocked && (
					<Rect
						x={6}
						y={6}
						width={SEAT_SIZE - 12}
						height={SEAT_SIZE - 12}
						fill="#fde68a" // amber-200
						cornerRadius={2}
					/>
				)}

				{/* Sold Sketch Lines */}
				{isSold && (
					<Group>
						<Line
							points={[8, 8, SEAT_SIZE - 8, SEAT_SIZE - 8]}
							stroke="white"
							strokeWidth={2}
							lineCap="round"
						/>
						<Line
							points={[SEAT_SIZE - 8, 8, 8, SEAT_SIZE - 8]}
							stroke="white"
							strokeWidth={2}
							lineCap="round"
						/>
					</Group>
				)}
			</Group>
		);
	},
);

Seat.displayName = "Seat";

interface SectionCanvasProps {
	section: EventSeatSection;
	seats: Record<number, EventTicketSeat>;
	selectedSeatIds: Set<number>;
	toggleSeat: (id: number) => void;
	onZoomOut: () => void;
	dimensions: { width: number; height: number };
}

export function SectionCanvas({
	section,
	seats,
	selectedSeatIds,
	toggleSeat,
	onZoomOut: _onZoomOut,
	dimensions,
}: SectionCanvasProps) {
	const { getSectionBounds } = useSectionBoundsNavigation();
	const stageRef = useRef<StageType>(null);
	const groupRef = useRef<Konva.Group>(null);
	const [hoveredSeat, setHoveredSeat] = useState<{
		seat: EventTicketSeat;
		x: number;
		y: number;
	} | null>(null);

	const groupsMap = useMemo(() => {
		const map: Record<number, EventSeatGroup> = {};
		section.event_seat_groups?.forEach((g) => {
			map[g.id] = g;
		});
		return map;
	}, [section.event_seat_groups]);

	const sectionSeats = useMemo(
		() =>
			Object.values(seats).filter(
				(s) => s.event_seat_section_id === section.id,
			),
		[seats, section.id],
	);

	const bounds = useMemo(
		() =>
			getSectionBounds(section.id) || {
				width: 200,
				height: 200,
				minCol: 0,
				minRow: 0,
			},
		[getSectionBounds, section.id],
	);

	const { initialState, minScale } = useMemo(() => {
		const rotation = section.rotation || 0;
		const rad = (rotation * Math.PI) / 180;

		const boundingW =
			Math.abs(bounds.width * Math.cos(rad)) +
			Math.abs(bounds.height * Math.sin(rad));
		const boundingH =
			Math.abs(bounds.width * Math.sin(rad)) +
			Math.abs(bounds.height * Math.cos(rad));

		// Calculate scale to fit width exactly (Immersive style)
		const sFitWidth = (dimensions.width - 20) / boundingW;

		const startScale = Math.min(1.5, sFitWidth);

		return {
			initialState: {
				scale: startScale,
				position: {
					x: dimensions.width / 2,
					y: (boundingH / 2) * startScale + 15, // Top aligned with exactly 15px padding
				},
			},
			minScale: sFitWidth, // Strict minScale based on width only
		};
	}, [dimensions, bounds, section.rotation]);

	const [scale, setScale] = useState(initialState.scale);
	const [position, setPosition] = useState(initialState.position);

	// Instant state reset when section changes to prevent "teleporting" from previous section state
	// biome-ignore lint/correctness/useExhaustiveDependencies: intentional reset on section change or resize only
	useEffect(() => {
		if (dimensions.width > 0) {
			setScale(initialState.scale);
			setPosition(initialState.position);
		}
	}, [section.id, dimensions.width]);

	// Caching logic for performance
	useEffect(() => {
		const group = groupRef.current;
		if (!group) return;

		// We cache the group when it's zoomed out or static to save GPU draw calls
		if (scale < 0.8) {
			group.cache();
		} else {
			group.clearCache();
		}
	}, [scale]);

	const lastDistRef = useRef<number>(0);
	const lastCenterRef = useRef<{ x: number; y: number } | null>(null);

	const handleWheel = (e: KonvaEventObject<WheelEvent>) => {
		e.evt.preventDefault();
		const stage = stageRef.current;
		if (!stage) return;

		// 1. Zoom Logic (Ctrl + Scroll)
		if (e.evt.ctrlKey) {
			const oldScale = scale;
			const pointer = stage.getPointerPosition();
			if (!pointer) return;

			const mousePointTo = {
				x: (pointer.x - stage.x()) / oldScale,
				y: (pointer.y - stage.y()) / oldScale,
			};

			// Standard zoom speed factor
			const zoomIn = e.evt.deltaY < 0;
			const newScale = zoomIn ? oldScale * 1.1 : oldScale * 0.9;
			const clampedScale = Math.max(minScale, Math.min(newScale, 4));

			if (Math.abs(clampedScale - oldScale) < 0.001) return;

			setScale(clampedScale);
			const newPos = {
				x: pointer.x - mousePointTo.x * clampedScale,
				y: pointer.y - mousePointTo.y * clampedScale,
			};

			// Apply bounds immediately to the new position
			setPosition(dragBoundFunc(newPos));
			return;
		}

		// 2. Pan Logic
		// Shift + Scroll = Horizontal
		// Normal Scroll = Vertical (or both if trackpad)
		const dx = e.evt.shiftKey ? e.evt.deltaY : e.evt.deltaX;
		const dy = e.evt.shiftKey ? 0 : e.evt.deltaY;

		const newPos = {
			x: position.x - dx,
			y: position.y - dy,
		};

		setPosition(dragBoundFunc(newPos));
	};

	const handleTouch = (e: KonvaEventObject<TouchEvent>) => {
		const stage = stageRef.current;
		if (!stage) return;

		const touch1 = e.evt.touches[0];
		const touch2 = e.evt.touches[1];

		if (touch1 && touch2) {
			// Stop dragging if we're pinching
			if (stage.isDragging()) {
				stage.stopDrag();
			}

			const p1 = { x: touch1.clientX, y: touch1.clientY };
			const p2 = { x: touch2.clientX, y: touch2.clientY };

			const dist = Math.sqrt((p1.x - p2.x) ** 2 + (p1.y - p2.y) ** 2);
			const center = {
				x: (p1.x + p2.x) / 2,
				y: (p1.y + p2.y) / 2,
			};

			if (!lastDistRef.current) {
				lastDistRef.current = dist;
				lastCenterRef.current = center;
				return;
			}

			const oldScale = scale;
			const stageBox = stage.container().getBoundingClientRect();
			const pointer = {
				x: center.x - stageBox.left,
				y: center.y - stageBox.top,
			};

			const mousePointTo = {
				x: (pointer.x - stage.x()) / oldScale,
				y: (pointer.y - stage.y()) / oldScale,
			};

			const newScale = Math.max(
				minScale,
				Math.min(oldScale * (dist / lastDistRef.current), 4),
			);
			setScale(newScale);

			const newPos = {
				x: pointer.x - mousePointTo.x * newScale,
				y: pointer.y - mousePointTo.y * newScale,
			};

			// Add panning while pinching
			if (lastCenterRef.current) {
				newPos.x += center.x - lastCenterRef.current.x;
				newPos.y += center.y - lastCenterRef.current.y;
			}

			setPosition(dragBoundFunc(newPos));
			lastDistRef.current = dist;
			lastCenterRef.current = center;
		}
	};

	const handleTouchEnd = () => {
		lastDistRef.current = 0;
		lastCenterRef.current = null;
	};

	const handleSeatClick = (seat: EventTicketSeat) => {
		const isSelected = selectedSeatIds.has(seat.id);
		const isInteractive = seat.status === "available" || isSelected;
		if (isInteractive) {
			// Clear cache immediately on interaction to show update
			groupRef.current?.clearCache();
			toggleSeat(seat.id);
		}
	};

	const handleManualZoom = (delta: number) => {
		const newScale = Math.max(minScale, Math.min(scale * delta, 5));
		setScale(newScale);
	};

	const dragBoundFunc = (pos: { x: number; y: number }) => {
		const rotation = section.rotation || 0;
		const rad = (rotation * Math.PI) / 180;
		const boundingW =
			(Math.abs(bounds.width * Math.cos(rad)) +
				Math.abs(bounds.height * Math.sin(rad))) *
			scale;
		const boundingH =
			(Math.abs(bounds.width * Math.sin(rad)) +
				Math.abs(bounds.height * Math.cos(rad))) *
			scale;

		const PADDING = 15;

		let newX = pos.x;
		let newY = pos.y;

		const minX = dimensions.width - boundingW / 2 - PADDING;
		const maxX = boundingW / 2 + PADDING;

		if (boundingW <= dimensions.width - PADDING * 2) {
			newX = dimensions.width / 2;
		} else {
			newX = Math.max(minX, Math.min(newX, maxX));
		}

		const minY = dimensions.height - boundingH / 2 - PADDING;
		const maxY = boundingH / 2 + PADDING;

		if (boundingH <= dimensions.height - PADDING * 2) {
			newY = dimensions.height / 2;
		} else {
			newY = Math.max(minY, Math.min(newY, maxY));
		}

		return { x: newX, y: newY };
	};

	// Don't render the stage until we have valid dimensions to prevent flickering/teleporting
	if (dimensions.width === 0) return null;

	return (
		<div className="relative h-full w-full bg-slate-50">
			<Legend
				isVenueView={false}
				sectionColor={section.color}
				sectionPrice={section.price}
				groups={section.event_seat_groups}
			/>

			<Stage
				width={dimensions.width}
				height={dimensions.height}
				scaleX={scale}
				scaleY={scale}
				x={position.x}
				y={position.y}
				onWheel={handleWheel}
				onTouchMove={handleTouch}
				onTouchEnd={handleTouchEnd}
				onClick={() => setHoveredSeat(null)}
				onTap={() => setHoveredSeat(null)}
				draggable={true}
				dragBoundFunc={dragBoundFunc}
				ref={stageRef}
				onDragEnd={(e) => setPosition({ x: e.target.x(), y: e.target.y() })}
			>
				<Layer>
					<Group
						rotation={section.rotation || 0}
						offsetX={bounds.width / 2}
						offsetY={bounds.height / 2}
						ref={groupRef}
					>
						<Rect
							width={bounds.width}
							height={bounds.height}
							fill="white"
							stroke="#cbd5e1"
							strokeWidth={1}
							shadowBlur={25}
							shadowColor="rgba(0,0,0,0.06)"
							cornerRadius={8}
						/>

						{sectionSeats.map((seat) => {
							const isSelected = selectedSeatIds.has(seat.id);
							const assignment = seat.event_seat_group_assignment;
							const group = assignment
								? groupsMap[assignment.event_seat_group_id]
								: null;

							// -- OPTIMIZATION: Viewport Culling --
							const seatX =
								((seat.col_set || 0) - bounds.minCol) * SEAT_SPACING +
								SECTION_PADDING;
							const seatY =
								((seat.row_set || 0) - bounds.minRow) * SEAT_SPACING +
								SECTION_PADDING;

							// Account for rotation in visibility check
							const rad = ((section.rotation || 0) * Math.PI) / 180;
							const cos = Math.cos(rad);
							const sin = Math.sin(rad);
							const dx = seatX - bounds.width / 2;
							const dy = seatY - bounds.height / 2;
							const rotatedX = dx * cos - dy * sin;
							const rotatedY = dx * sin + dy * cos;

							const absX = rotatedX * scale + position.x;
							const absY = rotatedY * scale + position.y;

							const isMobileViewport = dimensions.width < 1024;
							const BUFFER = isMobileViewport ? 900 : 250 * scale;
							const isVisible =
								absX > -BUFFER &&
								absX < dimensions.width + BUFFER &&
								absY > -BUFFER &&
								absY < dimensions.height + BUFFER;

							if (!isVisible) return null;

							return (
								<Seat
									key={seat.id}
									seat={seat}
									isSelected={isSelected}
									seatX={seatX}
									seatY={seatY}
									onClick={handleSeatClick}
									baseColor={section.color || "blue"}
									groupColor={group?.color}
									onMouseEnter={(s, x, y) => setHoveredSeat({ seat: s, x, y })}
									onMouseLeave={() => setHoveredSeat(null)}
								/>
							);
						})}
					</Group>
				</Layer>

				{/* Tooltip Layer */}
				{hoveredSeat && (
					<Layer>
						<Group
							x={hoveredSeat.x}
							y={hoveredSeat.y}
							rotation={section.rotation || 0}
							offsetX={bounds.width / 2}
							offsetY={bounds.height / 2}
						>
							<Label
								y={-10}
								offsetX={0}
								rotation={-(section.rotation || 0)}
								opacity={0.95}
							>
								<Tag
									fill="black"
									pointerDirection="down"
									pointerWidth={10}
									pointerHeight={10}
									lineJoin="round"
									shadowColor="black"
									shadowBlur={10}
									shadowOpacity={0.2}
									cornerRadius={4}
								/>
								<Text
									text={`${hoveredSeat.seat.name}\nRM ${(
										Number(section.price || 0) +
											Number(
												groupsMap[
													hoveredSeat.seat.event_seat_group_assignment
														?.event_seat_group_id || -1
												]?.extra_price || 0,
											) +
											Number(hoveredSeat.seat.extra_price || 0)
									).toFixed(2)}\n${hoveredSeat.seat.status?.toUpperCase()}`}
									fontFamily={FONT_FAMILY}
									fontSize={11}
									fontStyle="bold"
									padding={10}
									fill="white"
									align="center"
									lineHeight={1.4}
								/>
							</Label>
						</Group>
					</Layer>
				)}
			</Stage>

			<ZoomControl
				onZoomIn={() => handleManualZoom(1.2)}
				onZoomOut={() => handleManualZoom(0.8)}
			/>
		</div>
	);
}
