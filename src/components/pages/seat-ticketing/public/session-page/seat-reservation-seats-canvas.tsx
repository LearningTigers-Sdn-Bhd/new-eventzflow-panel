"use client";

import type { KonvaEventObject } from "konva/lib/Node";
import type { Stage as StageType } from "konva/lib/Stage";
import { useEffect, useMemo, useRef, useState } from "react";
import { Group, Layer, Rect, Stage, Text } from "react-konva";
import type { EventTicketSeat } from "@/lib/api/seat-ticketing/response";
import { useSeatReservation } from "./seat-reservation-session-provider";

const CELL_SIZE = 50;
const SEAT_SIZE = 36;
const SEAT_SPACING = 45;

export default function SeatReservationSeatsCanvas() {
	const { session, selectedSeats, processingSeats, toggleSeat } =
		useSeatReservation();
	const stageRef = useRef<StageType>(null);
	const containerRef = useRef<HTMLDivElement>(null);
	const [scale, setScale] = useState(1);
	const [position, setPosition] = useState({ x: 50, y: 80 });
	const [dimensions, setDimensions] = useState({ width: 0, height: 0 });
	const [hasMounted, setHasMounted] = useState(false);
	const isInitializedRef = useRef(false);

	useEffect(() => {
		setHasMounted(true);
	}, []);

	// Calculate total content bounds
	const contentBounds = useMemo(() => {
		let minX = Number.POSITIVE_INFINITY;
		let minY = Number.POSITIVE_INFINITY;
		let maxX = Number.NEGATIVE_INFINITY;
		let maxY = Number.NEGATIVE_INFINITY;

		let hasItems = false;
		for (const venue of session?.event_seat_venues ?? []) {
			for (const section of venue.event_seat_sections ?? []) {
				const x = (section.start_column || 0) * CELL_SIZE;
				const y = (section.start_row || 0) * CELL_SIZE;
				const w = (section.col_span || 1) * CELL_SIZE;
				const h = (section.row_span || 1) * CELL_SIZE;
				const rotation = section.rotation || 0;

				if (rotation === 0) {
					minX = Math.min(minX, x);
					minY = Math.min(minY, y);
					maxX = Math.max(maxX, x + w);
					maxY = Math.max(maxY, y + h);
				} else {
					// Account for rotated corners
					const rad = (rotation * Math.PI) / 180;
					const cx = x + w / 2;
					const cy = y + h / 2;
					const corners = [
						{ x, y },
						{ x: x + w, y },
						{ x, y: y + h },
						{ x: x + w, y: y + h },
					];

					for (const p of corners) {
						const dx = p.x - cx;
						const dy = p.y - cy;
						const rx = dx * Math.cos(rad) - dy * Math.sin(rad) + cx;
						const ry = dx * Math.sin(rad) + dy * Math.cos(rad) + cy;
						minX = Math.min(minX, rx);
						minY = Math.min(minY, ry);
						maxX = Math.max(maxX, rx);
						maxY = Math.max(maxY, ry);
					}
				}
				hasItems = true;
			}
		}

		if (!hasItems) return null;

		// Add padding
		const PADDING = 100;
		return {
			x: minX - PADDING,
			y: minY - PADDING,
			width: maxX - minX + PADDING * 2,
			height: maxY - minY + PADDING * 2,
		};
	}, [session]);

	// Zoom to fit logic
	useEffect(() => {
		if (
			!isInitializedRef.current &&
			dimensions.width > 0 &&
			dimensions.height > 0 &&
			contentBounds
		) {
			const scaleX = dimensions.width / contentBounds.width;
			const scaleY = dimensions.height / contentBounds.height;
			const newScale = Math.min(1, scaleX, scaleY);

			const centeredX =
				(dimensions.width - contentBounds.width * newScale) / 2 -
				contentBounds.x * newScale;
			const centeredY =
				(dimensions.height - contentBounds.height * newScale) / 2 -
				contentBounds.y * newScale;

			setScale(newScale);
			setPosition({ x: centeredX, y: centeredY });
			isInitializedRef.current = true;
		}
	}, [dimensions, contentBounds]);

	useEffect(() => {
		const container = containerRef.current;
		if (!container) return;

		const observer = new ResizeObserver((entries) => {
			const { width, height } = entries[0].contentRect;
			setDimensions({ width, height });
		});

		observer.observe(container);
		return () => observer.disconnect();
	}, []);

	const handleWheel = (e: KonvaEventObject<WheelEvent>) => {
		e.evt.preventDefault();
		const stage = stageRef.current;
		if (!stage) return;

		const oldScale = stage.scaleX();
		const pointer = stage.getPointerPosition();
		if (!pointer) return;

		const mousePointTo = {
			x: (pointer.x - stage.x()) / oldScale,
			y: (pointer.y - stage.y()) / oldScale,
		};

		const newScale = e.evt.deltaY > 0 ? oldScale * 0.9 : oldScale * 1.1;
		const clampedScale = Math.max(0.1, Math.min(newScale, 5));

		setScale(clampedScale);
		const newPos = {
			x: pointer.x - mousePointTo.x * clampedScale,
			y: pointer.y - mousePointTo.y * clampedScale,
		};
		setPosition(newPos);
	};

	const getSeatColor = (seat: EventTicketSeat) => {
		if (processingSeats.has(seat.id)) return "#e2e8f0"; // Slate 200 (Processing)
		if (selectedSeats.has(seat.id)) return "#10b981"; // Brand Green (Selected)
		if (seat.ticket_id || seat.status === "sold") return "#94a3b8"; // Gray (Sold)
		if (seat.locked_at || seat.status === "locked") return "#f59e0b"; // Amber (Locked)
		return "#ffffff"; // White (Available)
	};

	const getSeatIndicator = (seat: EventTicketSeat) => {
		if (processingSeats.has(seat.id)) return "...";
		if (selectedSeats.has(seat.id)) return "S";
		if (seat.ticket_id || seat.status === "sold") return "X";
		if (seat.locked_at || seat.status === "locked") return "L";
		return "";
	};

	const allSeats = useMemo(() => {
		const seats: {
			venueId: number;
			sectionId: number;
			sectionName: string;
			seat: EventTicketSeat;
		}[] = [];
		for (const venue of session?.event_seat_venues ?? []) {
			for (const section of venue.event_seat_sections ?? []) {
				for (const seat of section.event_ticket_seats ?? []) {
					seats.push({
						venueId: venue.id,
						sectionId: section.id,
						sectionName: section.name,
						seat,
					});
				}
			}
		}
		return seats;
	}, [session]);

	const hasSeats = allSeats.length > 0;

	if (!hasSeats && session) {
		return (
			<div className="flex h-full w-full items-center justify-center bg-slate-50 p-8 text-center">
				<div className="max-w-md">
					<div className="mb-4 text-4xl">🪑</div>
					<h3 className="mb-2 text-lg font-bold text-slate-900">
						No Seats Available
					</h3>
					<p className="text-slate-600">
						This session does not have any seats configured for reservation at
						this time.
					</p>
				</div>
			</div>
		);
	}

	return (
		<div
			ref={containerRef}
			className="relative h-full w-full overflow-hidden bg-slate-100 shadow-inner"
		>
			{/* Hidden list for Screen Readers and Keyboard Navigation */}
			{hasMounted && (
				<div className="sr-only">
					<h2>Seat List</h2>
					<ul>
						{allSeats.map(
							({
								venueId,
								sectionId,
								sectionName,
								seat,
							}: {
								venueId: number;
								sectionId: number;
								sectionName: string;
								seat: EventTicketSeat;
							}) => (
								<li key={seat.id}>
									<button
										type="button"
										onClick={() => toggleSeat(venueId, sectionId, seat)}
										disabled={
											processingSeats.has(seat.id) ||
											(!selectedSeats.has(seat.id) &&
												seat.status !== "available")
										}
									>
										{sectionName} - {seat.name} (
										{selectedSeats.has(seat.id) ? "Selected" : seat.status})
									</button>
								</li>
							),
						)}
					</ul>
				</div>
			)}

			{/* Visible Keyboard Navigation Hint */}
			<div className="absolute left-4 top-4 z-10 hidden sm:block">
				<p className="text-[10px] text-slate-500 bg-white/50 px-2 py-1 rounded backdrop-blur-sm">
					Use mouse to drag & zoom.
				</p>
			</div>

			{dimensions.width > 0 && dimensions.height > 0 && (
				<Stage
					width={dimensions.width}
					height={dimensions.height}
					scaleX={scale}
					scaleY={scale}
					x={position.x}
					y={position.y}
					onWheel={handleWheel}
					draggable
					ref={stageRef}
					onDragEnd={(e) => {
						const newPos = { x: e.target.x(), y: e.target.y() };
						setPosition(newPos);
					}}
				>
					<Layer>
						{session?.event_seat_venues?.map((venue) => (
							<Group key={venue.id}>
								{venue.event_seat_sections?.map((section) => {
									const sectionX = (section.start_column || 0) * CELL_SIZE;
									const sectionY = (section.start_row || 0) * CELL_SIZE;
									const sectionWidth = (section.col_span || 1) * CELL_SIZE;
									const sectionHeight = (section.row_span || 1) * CELL_SIZE;

									const rotation = section.rotation || 0;

									return (
										<Group
											key={section.id}
											x={sectionX + sectionWidth / 2}
											y={sectionY + sectionHeight / 2}
											offsetX={sectionWidth / 2}
											offsetY={sectionHeight / 2}
											rotation={rotation}
										>
											{/* Section Boundary (Implicit) */}
											<Rect
												width={sectionWidth}
												height={sectionHeight}
												stroke="#cbd5e1"
												strokeWidth={1}
												dash={[5, 5]}
												cornerRadius={0}
											/>

											{/* Section Label */}
											<Text
												text={section.name}
												fontSize={12}
												fontStyle="bold"
												fill="#475569"
												y={-25}
												width={sectionWidth}
												align="center"
											/>

											{section.event_ticket_seats?.map((seat) => {
												const seatX = (seat.col_set || 0) * SEAT_SPACING + 5;
												const seatY = (seat.row_set || 0) * SEAT_SPACING + 5;

												return (
													<Group
														key={seat.id}
														x={seatX}
														y={seatY}
														onClick={() =>
															toggleSeat(venue.id, section.id, seat)
														}
														onTap={() => toggleSeat(venue.id, section.id, seat)}
														onMouseEnter={(e) => {
															const isInteractive =
																seat.status === "available" ||
																selectedSeats.has(seat.id);
															if (isInteractive) {
																const container = e.target
																	.getStage()
																	?.container();
																if (container)
																	container.style.cursor = "pointer";
															}
														}}
														onMouseLeave={(e) => {
															const container = e.target
																.getStage()
																?.container();
															if (container) container.style.cursor = "default";
														}}
													>
														<Rect
															width={SEAT_SIZE}
															height={SEAT_SIZE}
															fill={getSeatColor(seat)}
															cornerRadius={0}
															stroke={
																selectedSeats.has(seat.id)
																	? "#064e3b"
																	: "#cbd5e1"
															}
															strokeWidth={selectedSeats.has(seat.id) ? 2 : 1}
															shadowBlur={selectedSeats.has(seat.id) ? 5 : 0}
															shadowColor="#10b981"
															opacity={processingSeats.has(seat.id) ? 0.6 : 1}
														/>
														<Text
															text={getSeatIndicator(seat)}
															width={SEAT_SIZE}
															height={SEAT_SIZE}
															fontSize={processingSeats.has(seat.id) ? 10 : 14}
															fontStyle="bold"
															fill={
																selectedSeats.has(seat.id) ? "white" : "#475569"
															}
															align="center"
															verticalAlign="middle"
															listening={false}
														/>
													</Group>
												);
											})}
										</Group>
									);
								})}
							</Group>
						))}
					</Layer>
				</Stage>
			)}

			{/* Legend */}
			<div className="absolute right-4 top-4 flex flex-wrap gap-3 border bg-white/90 p-3 text-[9px] font-bold uppercase tracking-wider shadow-xl backdrop-blur-md md:right-6 md:top-12 md:gap-4 md:p-4 md:text-[10px] lg:gap-6 lg:text-xs rounded-none">
				<div className="flex items-center gap-2">
					<div className="flex h-4 w-4 items-center justify-center border bg-white shadow-sm rounded-none text-[8px]" />{" "}
					Available
				</div>
				<div className="flex items-center gap-2">
					<div className="flex h-4 w-4 items-center justify-center border border-brand-green bg-brand-green text-white shadow-sm rounded-none text-[8px]">
						S
					</div>{" "}
					Selected
				</div>
				<div className="flex items-center gap-2">
					<div className="flex h-4 w-4 items-center justify-center border bg-[#f59e0b] text-white shadow-sm rounded-none text-[8px]">
						L
					</div>{" "}
					Locked
				</div>
				<div className="flex items-center gap-2">
					<div className="flex h-4 w-4 items-center justify-center border bg-[#94a3b8] text-white shadow-sm rounded-none text-[8px]">
						X
					</div>{" "}
					Sold
				</div>
			</div>

			{/* Zoom Controls */}
			<div className="absolute bottom-4 right-4 flex flex-col gap-2 md:bottom-6 md:right-6">
				<button
					type="button"
					onClick={() => setScale((s) => Math.min(s * 1.2, 5))}
					className="flex h-8 w-8 items-center justify-center border bg-white text-lg font-bold shadow-lg hover:bg-slate-50 rounded-none md:h-10 md:w-10 md:text-xl"
				>
					+
				</button>
				<button
					type="button"
					onClick={() => setScale((s) => Math.max(s / 1.2, 0.1))}
					className="flex h-8 w-8 items-center justify-center border bg-white text-lg font-bold shadow-lg hover:bg-slate-50 rounded-none md:h-10 md:w-10 md:text-xl"
				>
					-
				</button>
			</div>
		</div>
	);
}
