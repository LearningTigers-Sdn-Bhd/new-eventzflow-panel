"use client";

import Konva from "konva";
import type { Stage as StageType } from "konva/lib/Stage";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { Group, Layer, Rect, Stage, Text } from "react-konva";
import type { EventSeatSection } from "@/lib/api/seat-ticketing/response";
import { getSectionShades } from "@/lib/utils/group-colors";
import { useVenueBoundsNavigation } from "../../hooks/use-canvas-navigation";
import { usePublicSeatSelectionMap } from "../../hooks/use-public-seat-reservation";
import { Legend } from "./legend";
import { ZoomControl } from "./zoom-control";

const CELL_SIZE = 50;
const FONT_FAMILY = "Geist, Inter, system-ui, sans-serif";

interface VenueCanvasProps {
	sections: Record<number, EventSeatSection>;
	activeSectionId: number | null;
	onSelectSection: (id: number) => void;
	dimensions: { width: number; height: number };
}

export function VenueCanvas({
	sections,
	activeSectionId,
	onSelectSection,
	dimensions,
}: VenueCanvasProps) {
	const { getVenueBounds } = useVenueBoundsNavigation();
	const selectedSeats = usePublicSeatSelectionMap();

	const stageRef = useRef<StageType>(null);
	const [scale, setScale] = useState(1);
	const [position, setPosition] = useState({ x: 0, y: 0 });
	const [hoveredId, setHoveredId] = useState<number | null>(null);
	const [isAnimating, setIsAnimating] = useState(false);

	const contentBounds = useMemo(() => getVenueBounds(), [getVenueBounds]);

	const myLocksBySection = useMemo(() => {
		const counts: Record<number, number> = {};
		for (const seat of Object.values(selectedSeats)) {
			counts[seat.event_seat_section_id] =
				(counts[seat.event_seat_section_id] || 0) + 1;
		}
		return counts;
	}, [selectedSeats]);

	useEffect(() => {
		if (dimensions.width > 0 && contentBounds && !isAnimating) {
			const s = Math.min(
				1,
				dimensions.width / contentBounds.width,
				dimensions.height / contentBounds.height,
			);
			if (Math.abs(scale - s) > 0.01) {
				setScale(s);
				setPosition({
					x:
						(dimensions.width - contentBounds.width * s) / 2 -
						contentBounds.x * s,
					y:
						(dimensions.height - contentBounds.height * s) / 2 -
						contentBounds.y * s,
				});
			}
		}
	}, [dimensions, contentBounds, isAnimating, scale]);

	const handleAnimateToSection = useCallback(
		(section: EventSeatSection) => {
			if (!stageRef.current || isAnimating) return;

			setIsAnimating(true);

			const sectionX = (section.start_column || 0) * CELL_SIZE;
			const sectionY = (section.start_row || 0) * CELL_SIZE;
			const sectionWidth = (section.col_span || 1) * CELL_SIZE;
			const sectionHeight = (section.row_span || 1) * CELL_SIZE;

			const targetScale = Math.min(
				1.5,
				(dimensions.width - 100) / sectionWidth,
				(dimensions.height - 100) / sectionHeight,
			);
			const targetX =
				dimensions.width / 2 - (sectionX + sectionWidth / 2) * targetScale;
			const targetY =
				dimensions.height / 2 - (sectionY + sectionHeight / 2) * targetScale;

			stageRef.current.to({
				x: targetX,
				y: targetY,
				scaleX: targetScale,
				scaleY: targetScale,
				duration: 0.4,
				easing: Konva.Easings.EaseInOut,
				onFinish: () => {
					onSelectSection(section.id);
				},
			});
		},
		[dimensions, onSelectSection, isAnimating],
	);

	useEffect(() => {
		if (activeSectionId && sections[activeSectionId] && !isAnimating) {
			handleAnimateToSection(sections[activeSectionId]);
		}
	}, [activeSectionId, sections, handleAnimateToSection, isAnimating]);

	const lastDistRef = useRef<number>(0);
	const lastCenterRef = useRef<{ x: number; y: number } | null>(null);

	const handleWheel = (e: Konva.KonvaEventObject<WheelEvent>) => {
		if (isAnimating) return;
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

			const zoomIn = e.evt.deltaY < 0;
			const newScale = zoomIn ? oldScale * 1.1 : oldScale * 0.9;
			const clampedScale = Math.max(0.1, Math.min(newScale, 5));

			if (Math.abs(clampedScale - oldScale) < 0.001) return;

			setScale(clampedScale);
			const newPos = {
				x: pointer.x - mousePointTo.x * clampedScale,
				y: pointer.y - mousePointTo.y * clampedScale,
			};

			setPosition(newPos);
			return;
		}

		// 2. Pan Logic
		const dx = e.evt.shiftKey ? e.evt.deltaY : e.evt.deltaX;
		const dy = e.evt.shiftKey ? 0 : e.evt.deltaY;

		setPosition({
			x: position.x - dx,
			y: position.y - dy,
		});
	};

	const handleTouch = (e: Konva.KonvaEventObject<TouchEvent>) => {
		if (isAnimating) return;
		const stage = stageRef.current;
		if (!stage) return;

		const touch1 = e.evt.touches[0];
		const touch2 = e.evt.touches[1];

		if (touch1 && touch2) {
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
				0.1,
				Math.min(oldScale * (dist / lastDistRef.current), 5),
			);
			setScale(newScale);

			const newPos = {
				x: pointer.x - mousePointTo.x * newScale,
				y: pointer.y - mousePointTo.y * newScale,
			};

			if (lastCenterRef.current) {
				newPos.x += center.x - lastCenterRef.current.x;
				newPos.y += center.y - lastCenterRef.current.y;
			}

			setPosition(newPos);
			lastDistRef.current = dist;
			lastCenterRef.current = center;
		}
	};

	const handleTouchEnd = () => {
		lastDistRef.current = 0;
		lastCenterRef.current = null;
	};

	const handleManualZoom = (delta: number) => {
		if (!stageRef.current) return;
		const newScale = Math.max(0.1, Math.min(scale * delta, 5));
		stageRef.current.scale({ x: newScale, y: newScale });
		setScale(newScale);
	};

	return (
		<div className="relative h-full w-full bg-white">
			<Legend isVenueView />

			{dimensions.width > 0 && (
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
					draggable={!isAnimating}
					ref={stageRef}
					onDragEnd={(e) => setPosition({ x: e.target.x(), y: e.target.y() })}
				>
					<Layer>
						{Object.values(sections).map((section) => {
							const sectionX = (section.start_column || 0) * CELL_SIZE;
							const sectionY = (section.start_row || 0) * CELL_SIZE;
							const sectionWidth = (section.col_span || 1) * CELL_SIZE;
							const sectionHeight = (section.row_span || 1) * CELL_SIZE;
							const isHovered = hoveredId === section.id;
							const isActive = activeSectionId === section.id;
							const myLocksCount = myLocksBySection[section.id] || 0;

							const shades = getSectionShades(section.color);

							return (
								<Group
									key={section.id}
									x={sectionX + sectionWidth / 2}
									y={sectionY + sectionHeight / 2}
									offsetX={sectionWidth / 2}
									offsetY={sectionHeight / 2}
									rotation={section.rotation || 0}
									onClick={() => handleAnimateToSection(section)}
									onTap={() => handleAnimateToSection(section)}
									onMouseEnter={(e) => {
										if (isAnimating) return;
										setHoveredId(section.id);
										const container = e.target.getStage()?.container();
										if (container) container.style.cursor = "pointer";
									}}
									onMouseLeave={() => {
										setHoveredId(null);
										const container = stageRef.current?.container();
										if (container) container.style.cursor = "default";
									}}
								>
									<Rect
										width={sectionWidth}
										height={sectionHeight}
										fill={shades[200]}
										stroke={shades[700]}
										strokeWidth={isActive || isHovered ? 6 : 2}
										cornerRadius={0}
										shadowBlur={isHovered ? 15 : 0}
										shadowColor={`${shades[700]}33`}
									/>

									<Group
										rotation={-(section.rotation || 0)}
										x={sectionWidth / 2}
										y={sectionHeight / 2}
									>
										<Text
											text={section.name.toUpperCase()}
											fontSize={60}
											fontStyle="900"
											fontFamily={FONT_FAMILY}
											letterSpacing={-2}
											fill={shades[700]}
											width={sectionWidth * 2}
											align="center"
											offsetX={sectionWidth}
											y={-80}
										/>
										<Text
											text={`RM${Number(section.price || 0).toFixed(2)}`}
											fontSize={32}
											fontStyle="900"
											fontFamily={FONT_FAMILY}
											letterSpacing={-1}
											fill={shades[700]}
											width={sectionWidth * 2}
											align="center"
											offsetX={sectionWidth}
											y={0}
										/>
										<Text
											text={`${section.ticket_seat_counts?.available || 0} SEATS AVAILABLE`}
											fontSize={24}
											fontStyle="bold"
											fontFamily={FONT_FAMILY}
											letterSpacing={-0.5}
											fill={shades[500]}
											width={sectionWidth * 2}
											align="center"
											offsetX={sectionWidth}
											y={45}
										/>

										{myLocksCount > 0 && (
											<Group y={80}>
												<Rect
													width={160}
													height={40}
													offsetX={80}
													fill="#10b981"
													cornerRadius={0}
												/>
												<Text
													text={`${myLocksCount} SELECTED`}
													fontSize={18}
													fontStyle="900"
													fontFamily={FONT_FAMILY}
													fill="white"
													width={160}
													offsetX={80}
													align="center"
													y={11}
													letterSpacing={-0.5}
												/>
											</Group>
										)}
									</Group>
								</Group>
							);
						})}
					</Layer>
				</Stage>
			)}

			<ZoomControl
				onZoomIn={() => handleManualZoom(1.2)}
				onZoomOut={() => handleManualZoom(0.8)}
			/>
		</div>
	);
}
