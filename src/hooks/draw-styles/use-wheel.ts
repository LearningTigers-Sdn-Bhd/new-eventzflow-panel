"use client";

import * as d3 from "d3";
import type React from "react";
import { useEffect, useMemo, useRef, useState } from "react";
import { IoTriangleSharp } from "react-icons/io5";
import { TbTriangleFilled } from "react-icons/tb";
import {
	type DrawProps,
	DrawState,
} from "@/components/pages/lucky-draw/session/draw-styles/type";
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
}

export function useWheel(
	{ participants, onDrawComplete, isDrawing }: DrawProps,
	options?: UseWheelOptions,
): UseWheelReturn {
	const [rotation, setRotation] = useState(0);
	const [colorOffset, setColorOffset] = useState(0);
	const [pointerRotation, setPointerRotation] = useState(0);
	const [pointerTransition, setPointerTransition] = useState(
		"transform 0.25s ease-out",
	);

	// Internal state to handle the draw flow and persistence
	const [drawState, setDrawState] = useState<DrawState>(DrawState.IDLE);
	const [internalParticipants, setInternalParticipants] =
		useState<Participant[]>(participants);

	const pointerTimeoutRef = useRef<number | null>(null);
	const svgRef = useRef<SVGSVGElement>(null);
	const prevIsDrawingRef = useRef(false);

	// Use a ref to keep track of the current rotation to add cumulative rotation
	const rotationRef = useRef(0);

	const radius = 250; // SVG coordinate system radius

	// Sync participants when IDLE to handle manual updates (e.g. adding names)
	// But do NOT sync when WON (to preserve winner on screen)
	useEffect(() => {
		if (drawState === DrawState.IDLE) {
			setInternalParticipants(participants);
		}
	}, [participants, drawState]);

	// Color palette switches based on participant count parity
	// Use provided baseColors or default to wireframe colors
	const baseColors = useMemo(() => {
		if (options?.baseColors) {
			return options.baseColors;
		}
		// Default wireframe colors
		if (internalParticipants.length === 0) return ["#FFB6C1", "#E6E6FA"];
		return internalParticipants.length % 2 === 0
			? ["#FFB6C1", "#E6E6FA"] // even: two colors
			: ["#FFB6C1", "#E6E6FA", "#FFF4B1"]; // odd: three colors
	}, [internalParticipants.length, options?.baseColors]);

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

	// Extract participant names for display
	const participantNames = useMemo(() => {
		return internalParticipants.map((p) => p.name);
	}, [internalParticipants]);

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

	// Trigger spin animation when isDrawing becomes true
	useEffect(() => {
		if (isDrawing && !prevIsDrawingRef.current) {
			if (drawState === DrawState.SPINNING || participants.length === 0) return;

			// Update internal participants to the latest list before spinning
			setInternalParticipants(participants);
			setDrawState(DrawState.SPINNING);

			// Clear any pending pointer timers
			if (pointerTimeoutRef.current) {
				clearTimeout(pointerTimeoutRef.current);
				pointerTimeoutRef.current = null;
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
		}

		prevIsDrawingRef.current = isDrawing;

		return () => {
			// Cleanup only on unmount, not on every effect run
		};
	}, [isDrawing, participants, drawState]);

	const handleTransitionEnd = () => {
		if (drawState !== DrawState.SPINNING) return;

		// Calculate winner
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
		const winningArc = arcs.length === 1 
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
			// Find the participant that matches the winning name
			const winningParticipant = internalParticipants.find(
				(p) => p.name === winningArc.data,
			);
			if (winningParticipant) {
				setDrawState(DrawState.WON);
				// Delay callback slightly to allow animation to complete
				setTimeout(() => {
					onDrawComplete(winningParticipant);
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
			setPointerTransition("none");
			setPointerRotation(0);
		}
	}, [isDrawing]);

	// Color function - uses the rotated color palette
	const getSliceColor = (index: number) => {
		return colors[index % colors.length] || "#ffffff";
	};

	const isEmpty = internalParticipants.length === 0;

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
		internalParticipants,
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
	};
}
