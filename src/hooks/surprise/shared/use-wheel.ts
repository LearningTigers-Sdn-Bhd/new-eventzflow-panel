"use client";

import * as d3 from "d3";
import type React from "react";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { IoTriangleSharp } from "react-icons/io5";
import { TbTriangleFilled } from "react-icons/tb";
import {
	type DrawProps,
	DrawState,
	type Prize,
} from "@/components/pages/surprise-mechanics/shared/draw-styles/type";
import type { Participant } from "@/stores/lucky-draw-store";

export interface UseWheelOptions {
	baseColors?: string[];
	pointerAngle?: number; // Pointer position in degrees (0 = 12 o'clock, 90 = 3 o'clock, etc.)
	pointerVariant?: "pointy" | "rounded"; // Pointer icon variant (default: "pointy")
	gapBetweenWheelAndOuter?: number; // Gap between wheel slices and outer border (default: 10)
	// Optional rendering features
	enableInnerShadow?: boolean; // Enable inner shadow on slices
	innerShadowDepth?: number; // Shadow depth (default: 10)
	innerShadowOffset?: number; // Shadow offset from edge (default: 2)
	enableBorderRing?: boolean; // Enable decorative border ring
	borderRingInnerRadius?: number; // Inner radius of border ring
	borderRingOuterRadius?: number; // Outer radius of border ring
	enableDecorativeDots?: boolean; // Enable decorative dots
	decorativeDotsCount?: number; // Number of decorative dots (default: 22)
	decorativeDotsRadius?: number; // Radius for decorative dots
	decorativeDotsStartAngle?: number; // Starting angle for dots (default: -90)
	// Virtual wheel options (for large participant counts)
	virtualThreshold?: number; // Participant count threshold to switch to virtual mode (default: 20)
	virtualSegmentCount?: number; // Number of segments in virtual mode (default: 10)
}

export interface UseWheelReturn {
	rotation: number;
	pointerRotation: number;
	pointerTransition: string;
	drawState: DrawState;
	internalParticipants: Participant[];
	arcs: d3.PieArcDatum<string>[];
	arcGenerator: d3.Arc<unknown, d3.PieArcDatum<string>>;
	getSliceColor: (index: number) => string;
	svgRef: React.RefObject<SVGSVGElement | null>;
	handleTransitionEnd: () => void;
	isEmpty: boolean;
	isDrawing: boolean;
	// Pointer positioning (always available)
	pointerPosition: {
		className: string;
		style: React.CSSProperties;
	};
	pointerIcon: React.ComponentType<{
		className?: string;
		style?: React.CSSProperties;
	}>;
	// Optional rendering features (only available if enabled in options)
	innerShadowArcGenerator?: d3.Arc<unknown, d3.PieArcDatum<string>>;
	borderRingGenerator?: d3.Arc<
		unknown,
		{ startAngle: number; endAngle: number }
	>;
	borderRingData?: { startAngle: number; endAngle: number };
	decorativeDots?: Array<{ x: number; y: number; angle: number }>;
	// Virtual wheel features (for large participant counts)
	isVirtualMode: boolean; // Whether the wheel is in virtual mode
	flashingName: string | null; // Currently flashing participant name during spin
	participantCount: number; // Total number of participants
}

export function useWheel(
	{
		participants,
		prizes,
		mode = "participants",
		onDrawComplete,
		isDrawing,
	}: DrawProps,
	options?: UseWheelOptions,
): UseWheelReturn {
	const [rotation, setRotation] = useState(0);
	const [colorOffset, setColorOffset] = useState(0);
	const [pointerRotation, setPointerRotation] = useState(0);
	const [pointerTransition, setPointerTransition] = useState(
		"transform 0.25s ease-out",
	);

	// Determine which data source to use
	const isPrizesMode = mode === "prizes";
	const items = useMemo(
		() =>
			isPrizesMode
				? (prizes || []).map((p) => ({
						name: p.name,
						id: p.id,
						type: "prize" as const,
						prize: p,
					}))
				: (participants || []).map((p) => ({
						name: p.name,
						id: p.publicId,
						type: "participant" as const,
						participant: p,
					})),
		[isPrizesMode, prizes, participants],
	);

	// Internal state to handle the draw flow and persistence
	const [drawState, setDrawState] = useState<DrawState>(DrawState.IDLE);
	const [internalItems, setInternalItems] = useState(items);

	// Keep participants for backward compatibility in return value
	const [internalParticipants, setInternalParticipants] = useState<
		Participant[]
	>(isPrizesMode ? [] : participants || []);

	// Virtual mode state for flashing names
	const [flashingName, setFlashingName] = useState<string | null>(null);
	const flashingIntervalRef = useRef<number | null>(null);
	const preSelectedWinnerRef = useRef<Participant | Prize | null>(null);

	const pointerTimeoutRef = useRef<number | null>(null);
	const svgRef = useRef<SVGSVGElement>(null);
	const prevIsDrawingRef = useRef(false);

	// Use a ref to keep track of the current rotation to add cumulative rotation
	const rotationRef = useRef(0);

	const radius = 250; // SVG coordinate system radius

	// Virtual mode configuration
	const virtualThreshold = options?.virtualThreshold ?? 20;
	const virtualSegmentCount = options?.virtualSegmentCount ?? 10;

	// Determine if we should use virtual mode (for large item counts)
	const isVirtualMode = items.length > virtualThreshold;
	const participantCount = items.length;

	// Sync items when IDLE to handle manual updates (e.g. adding names)
	// But do NOT sync when WON (to preserve winner on screen)
	useEffect(() => {
		if (drawState === DrawState.IDLE) {
			setInternalItems(items);
			if (!isPrizesMode) {
				setInternalParticipants(participants || []);
			}
		}
	}, [items, drawState, isPrizesMode, participants]);

	// Color palette switches based on participant count parity
	// Use provided baseColors or default to wireframe colors
	const baseColors = useMemo(() => {
		if (options?.baseColors) {
			return options.baseColors;
		}
		// Default wireframe colors
		if (internalItems.length === 0) return ["#FFB6C1", "#E6E6FA"];
		return internalItems.length % 2 === 0
			? ["#FFB6C1", "#E6E6FA"] // even: two colors
			: ["#FFB6C1", "#E6E6FA", "#FFF4B1"]; // odd: three colors
	}, [internalItems.length, options?.baseColors]);

	// Rotate the palette after each draw completes to refresh the pattern
	const colors = useMemo(() => {
		if (baseColors.length === 0) return [];
		const offset = colorOffset % baseColors.length;
		return baseColors.slice(offset).concat(baseColors.slice(0, offset));
	}, [baseColors, colorOffset]);

	// Reset offset when participant list changes (only if idle)
	useEffect(() => {
		if (drawState === DrawState.IDLE) {
			setColorOffset(0);
		}
	}, [drawState]);

	// Generate virtual segment names (just numbered segments for display)
	const virtualSegmentNames = useMemo(() => {
		return Array.from(
			{ length: virtualSegmentCount },
			(_, i) => `Segment ${i + 1}`,
		);
	}, [virtualSegmentCount]);

	// Extract item names for display - use virtual segments in virtual mode
	const participantNames = useMemo(() => {
		if (isVirtualMode) {
			return virtualSegmentNames;
		}
		return internalItems.map((item) => item.name);
	}, [internalItems, isVirtualMode, virtualSegmentNames]);

	// Generate pie slices
	const arcs = useMemo(() => {
		if (participantNames.length === 0) return [];
		const pie = d3
			.pie<string>()
			.value(1) // Equal size slices
			.sort(null); // Keep original order
		return pie(participantNames);
	}, [participantNames]);

	// Arc generator
	const gapBetweenWheelAndOuter = options?.gapBetweenWheelAndOuter ?? 10;
	const arcGenerator = d3
		.arc<d3.PieArcDatum<string>>()
		.innerRadius(20) // Small hole in center
		.outerRadius(radius - gapBetweenWheelAndOuter); // Leave room for border

	// Helper function to get random item name for flashing
	const getRandomParticipantName = useCallback(() => {
		if (items.length === 0) return null;
		const randomIndex = Math.floor(Math.random() * items.length);
		return items[randomIndex].name;
	}, [items]);

	// Trigger spin animation when isDrawing becomes true
	useEffect(() => {
		if (isDrawing && !prevIsDrawingRef.current) {
			if (drawState === DrawState.SPINNING || items.length === 0) return;

			// Update internal items to the latest list before spinning
			setInternalItems(items);
			if (!isPrizesMode) {
				setInternalParticipants(participants || []);
			}
			setDrawState(DrawState.SPINNING);

			// Clear any pending pointer timers
			if (pointerTimeoutRef.current) {
				clearTimeout(pointerTimeoutRef.current);
				pointerTimeoutRef.current = null;
			}

			// In virtual mode, pre-select the winner now
			if (isVirtualMode) {
				const randomIndex = Math.floor(Math.random() * items.length);
				const selectedItem = items[randomIndex];
				preSelectedWinnerRef.current =
					selectedItem.type === "prize"
						? selectedItem.prize
						: selectedItem.participant;

				// Start flashing random names during spin
				setFlashingName(getRandomParticipantName());
				flashingIntervalRef.current = window.setInterval(() => {
					setFlashingName(getRandomParticipantName());
				}, 80); // Flash every 80ms for slot-machine effect
			}

			// Nudge pointer counter-clockwise (left) while spinning
			setPointerTransition("transform 0.2s ease-out");
			setPointerRotation(-18);

			// Calculate a new random rotation
			// Minimum 5 full spins (1800 deg) + random segment
			const minSpins = 5;
			const randomDegrees = Math.floor(Math.random() * 360);
			const newRotation = rotationRef.current + minSpins * 360 + randomDegrees;

			rotationRef.current = newRotation;
			setRotation(newRotation);

			// Schedule pointer to ease back ~0.3s before the spin animation ends
			const spinDurationMs = 4000; // matches wheel transition duration
			const returnDelay = Math.max(0, spinDurationMs - 300);
			pointerTimeoutRef.current = window.setTimeout(() => {
				setPointerTransition("transform 0.3s ease-out");
				setPointerRotation(0);
			}, returnDelay);

			// In virtual mode, slow down the name flashing near the end
			if (isVirtualMode) {
				// At 3 seconds, slow down to 150ms
				window.setTimeout(() => {
					if (flashingIntervalRef.current) {
						clearInterval(flashingIntervalRef.current);
						flashingIntervalRef.current = window.setInterval(() => {
							setFlashingName(getRandomParticipantName());
						}, 150);
					}
				}, 3000);

				// At 3.5 seconds, slow down more to 300ms
				window.setTimeout(() => {
					if (flashingIntervalRef.current) {
						clearInterval(flashingIntervalRef.current);
						flashingIntervalRef.current = window.setInterval(() => {
							setFlashingName(getRandomParticipantName());
						}, 300);
					}
				}, 3500);
			}
		}

		prevIsDrawingRef.current = isDrawing;

		return () => {
			// Cleanup only on unmount, not on every effect run
		};
	}, [
		isDrawing,
		items,
		drawState,
		isVirtualMode,
		getRandomParticipantName,
		isPrizesMode,
		participants,
	]);

	const handleTransitionEnd = () => {
		if (drawState !== DrawState.SPINNING) return;

		// Stop the flashing name animation
		if (flashingIntervalRef.current) {
			clearInterval(flashingIntervalRef.current);
			flashingIntervalRef.current = null;
		}

		// In virtual mode, use the pre-selected winner
		if (isVirtualMode && preSelectedWinnerRef.current) {
			const winner = preSelectedWinnerRef.current;
			const winnerName = isPrizesMode
				? (winner as Prize).name
				: (winner as Participant).name;
			setFlashingName(winnerName); // Show winner's name
			setDrawState(DrawState.WON);
			// Delay callback longer to allow winner name to be visible (2 seconds)
			setTimeout(() => {
				onDrawComplete(winner);
				setFlashingName(null);
			}, 2000);
			return;
		}

		// Calculate winner (original logic for non-virtual mode)
		// CSS transform: rotate() rotates counter-clockwise for positive values.
		// The pointer position is configurable (default 0 = 12 o'clock, 90 = 3 o'clock).
		// SVG/d3 coordinates: 0 = 12 o'clock, 90 = 3 o'clock, 180 = 6 o'clock, 270 = 9 o'clock
		// D3 pie arcs start at 0 (12 o'clock) and go counter-clockwise.

		// Get pointer angle (default to 0 for 12 o'clock, 90 for 3 o'clock)
		const pointerAngleDeg = options?.pointerAngle ?? 0;

		// Total rotation % 360 gives us the offset from start.
		const normalizedRotation = rotationRef.current % 360;

		// CSS rotate() rotates counter-clockwise, so after rotating by normalizedRotation:
		// A segment at angle theta in the wheel's coordinate system
		// will be at (theta + normalizedRotation) in viewport coordinates.
		// To find which segment is at the pointer:
		// pointerAngle = (segmentAngle + normalizedRotation) % 360
		// Therefore: segmentAngle = (pointerAngle - normalizedRotation + 360) % 360
		const effectiveAngleDeg =
			(pointerAngleDeg - normalizedRotation + 360) % 360;
		const effectiveRad = (effectiveAngleDeg * Math.PI) / 180;

		// Special case: if only one participant, they always win
		const winningArc =
			arcs.length === 1
				? arcs[0]
				: arcs.find((d: d3.PieArcDatum<string>) => {
						// Normalize start/end angles to 0-2PI
						let startAngle = d.startAngle;
						let endAngle = d.endAngle;

						// Normalize to 0-2PI range
						while (startAngle < 0) startAngle += 2 * Math.PI;
						while (endAngle < 0) endAngle += 2 * Math.PI;
						while (startAngle >= 2 * Math.PI) startAngle -= 2 * Math.PI;
						while (endAngle >= 2 * Math.PI) endAngle -= 2 * Math.PI;

						// Handle wrap-around case where endAngle < startAngle (shouldn't happen with d3.pie, but just in case)
						if (endAngle < startAngle) {
							return effectiveRad >= startAngle || effectiveRad < endAngle;
						}

						return effectiveRad >= startAngle && effectiveRad < endAngle;
					});

		if (winningArc) {
			// Find the item that matches the winning name
			const winningItem = internalItems.find(
				(item) => item.name === winningArc.data,
			);
			if (winningItem) {
				setDrawState(DrawState.WON);
				// Delay callback slightly to allow animation to complete
				const winner =
					winningItem.type === "prize"
						? winningItem.prize
						: winningItem.participant;
				setTimeout(() => {
					onDrawComplete(winner);
				}, 500);
			}
		}
	};

	// Ensure pointer resets instantly when draw ends (or if cancelled externally)
	useEffect(() => {
		if (!isDrawing) {
			if (pointerTimeoutRef.current) {
				clearTimeout(pointerTimeoutRef.current);
				pointerTimeoutRef.current = null;
			}
			if (flashingIntervalRef.current) {
				clearInterval(flashingIntervalRef.current);
				flashingIntervalRef.current = null;
			}
			setPointerTransition("none");
			setPointerRotation(0);
			// Don't clear flashingName here to allow winner name to show briefly
		}
	}, [isDrawing]);

	// Color function - uses the rotated color palette
	const getSliceColor = (index: number) => {
		return colors[index % colors.length] || "#ffffff";
	};

	const isEmpty = internalItems.length === 0;

	// Optional: Inner shadow arc generator
	const innerShadowArcGenerator = useMemo(() => {
		if (!options?.enableInnerShadow) return undefined;
		const sliceOuterRadius = radius - gapBetweenWheelAndOuter;
		const shadowDepth = options.innerShadowDepth ?? 10;
		const shadowOffset = options.innerShadowOffset ?? 2;
		const shadowInnerRadius = sliceOuterRadius - shadowDepth;
		const shadowOuterRadius = sliceOuterRadius - shadowOffset;
		return d3
			.arc<d3.PieArcDatum<string>>()
			.innerRadius(shadowInnerRadius)
			.outerRadius(shadowOuterRadius);
	}, [
		options?.enableInnerShadow,
		options?.innerShadowDepth,
		options?.innerShadowOffset,
		gapBetweenWheelAndOuter,
	]);

	// Optional: Border ring generator
	const borderRingGenerator = useMemo(() => {
		if (!options?.enableBorderRing) return undefined;
		const innerRadius = options.borderRingInnerRadius ?? radius - 1;
		const outerRadius = options.borderRingOuterRadius ?? radius - 1 + 25;
		return d3
			.arc<{ startAngle: number; endAngle: number }>()
			.innerRadius(innerRadius)
			.outerRadius(outerRadius);
	}, [
		options?.enableBorderRing,
		options?.borderRingInnerRadius,
		options?.borderRingOuterRadius,
	]);

	// Optional: Border ring data (full circle)
	const borderRingData = useMemo(() => {
		if (!options?.enableBorderRing) return undefined;
		return {
			startAngle: 0,
			endAngle: 2 * Math.PI,
		};
	}, [options?.enableBorderRing]);

	// Optional: Decorative dots
	const decorativeDots = useMemo(() => {
		if (!options?.enableDecorativeDots) return undefined;
		const count = options.decorativeDotsCount ?? 22;
		const dotRadius = options.decorativeDotsRadius ?? radius;
		const startAngle = options.decorativeDotsStartAngle ?? -90;
		return Array.from({ length: count }, (_, i) => {
			const angle = (i * 360) / count + startAngle;
			const x = Math.cos((angle * Math.PI) / 180) * dotRadius;
			const y = Math.sin((angle * Math.PI) / 180) * dotRadius;
			return { x, y, angle };
		});
	}, [
		options?.enableDecorativeDots,
		options?.decorativeDotsCount,
		options?.decorativeDotsRadius,
		options?.decorativeDotsStartAngle,
	]);

	// Pointer positioning and path
	const pointerAngleDeg = options?.pointerAngle ?? 0;
	const pointerPosition = useMemo(() => {
		// Normalize angle to 0-360 range
		const normalizedAngle = ((pointerAngleDeg % 360) + 360) % 360;

		// Determine position based on angle quadrant
		let className: string;
		let translate: string;

		if (normalizedAngle >= 45 && normalizedAngle < 135) {
			// Right side (3 o'clock) - 45° to 135°
			className = "pointer-events-none absolute top-1/2 right-0 z-20";
			translate = "translate(50%, -50%)";
		} else if (normalizedAngle >= 135 && normalizedAngle < 225) {
			// Bottom (6 o'clock) - 135° to 225°
			className = "pointer-events-none absolute bottom-0 left-1/2 z-20";
			translate = "translate(-50%, 50%)";
		} else if (normalizedAngle >= 225 && normalizedAngle < 315) {
			// Left side (9 o'clock) - 225° to 315°
			className = "pointer-events-none absolute top-1/2 left-0 z-20";
			translate = "translate(-50%, -50%)";
		} else {
			// Top (12 o'clock) - 315° to 45° (default)
			className = "pointer-events-none absolute top-0 left-1/2 z-20";
			translate = "translate(-50%, -0.5rem)";
		}

		return {
			className,
			style: {
				transform: `${translate} rotate(${pointerAngleDeg + 180 + pointerRotation}deg)`,
				transition: pointerTransition,
			} as React.CSSProperties,
		};
	}, [pointerAngleDeg, pointerRotation, pointerTransition]);

	const pointerIcon = useMemo(() => {
		const variant = options?.pointerVariant ?? "pointy";
		return variant === "rounded" ? TbTriangleFilled : IoTriangleSharp;
	}, [options?.pointerVariant]);

	return {
		rotation,
		pointerRotation,
		pointerTransition,
		drawState,
		internalParticipants: isPrizesMode ? [] : internalParticipants, // Backward compatibility
		arcs,
		arcGenerator,
		getSliceColor,
		svgRef,
		handleTransitionEnd,
		isEmpty,
		isDrawing,
		// Optional features
		innerShadowArcGenerator,
		borderRingGenerator,
		borderRingData,
		decorativeDots,
		pointerPosition,
		pointerIcon,
		// Virtual wheel features
		isVirtualMode,
		flashingName,
		participantCount,
	};
}
