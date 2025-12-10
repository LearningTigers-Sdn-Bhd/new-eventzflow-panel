"use client";

import { useCallback, useEffect, useRef } from "react";
import type { DrawProps } from "@/components/pages/lucky-draw/session/draw-styles/type";
import type { CSSBoxRef } from "@/components/ui/css-box";
import { LidState, useBoxDrawStore } from "@/stores/box-draw-store";

const ROTATION_DURATION_MS = 800; // Duration of X-axis rotation during draw
const ROTATION_CYCLES = 2; // Number of full 360° rotations during draw
const LID_OPEN_DELAY_MS = 200; // Delay before lid opens after rotation stops

const IDLE_ROTATION = { x: 0, y: 45 }; // Front-right view
const LID_OPEN_ROTATION_X = -120; // Lid opens backward

export interface Use3DBoxReturn {
	isEmpty: boolean;
	lidRef: React.RefObject<CSSBoxRef | null>;
	mainBoxRef: React.RefObject<CSSBoxRef | null>;
	containerRef: React.RefObject<HTMLDivElement | null>;
}

export function use3DBox({
	participants,
	onDrawComplete,
	isDrawing,
	isCelebrating,
}: DrawProps): Use3DBoxReturn {
	const lidRef = useRef<CSSBoxRef>(null);
	const mainBoxRef = useRef<CSSBoxRef>(null);
	const containerRef = useRef<HTMLDivElement>(null);

	const prevIsDrawingRef = useRef(false);
	const prevIsCelebratingRef = useRef(false);
	const animationFrameRef = useRef<number | null>(null);
	const rotationTimeoutRef = useRef<NodeJS.Timeout | null>(null);
	const lidOpenTimeoutRef = useRef<NodeJS.Timeout | null>(null);

	const { lidState, setLidState, reset } = useBoxDrawStore();

	// Animate continuous Y-axis rotation during drawing (HORIZONTAL SPIN)
	const animateDrawing = useCallback(() => {
		const startTime = Date.now();
		const totalRotation = 360 * ROTATION_CYCLES;

		const animate = () => {
			const elapsed = Date.now() - startTime;
			const progress = Math.min(elapsed / ROTATION_DURATION_MS, 1);

			// Ease out cubic for smooth deceleration
			const easeOutCubic = 1 - (1 - progress) ** 3;

			// Calculate current Y rotation angle (HORIZONTAL SPIN)
			const currentRotationY = IDLE_ROTATION.y + totalRotation * easeOutCubic;

			// Update both boxes - rotate on Y-axis (horizontal spin)
			if (lidRef.current && mainBoxRef.current) {
				lidRef.current.rotateTo(IDLE_ROTATION.x, currentRotationY);
				mainBoxRef.current.rotateTo(IDLE_ROTATION.x, currentRotationY);
			}

			if (progress < 1) {
				animationFrameRef.current = requestAnimationFrame(animate);
			} else {
				// Animation complete - return to idle and prepare for lid opening
				if (lidRef.current && mainBoxRef.current) {
					lidRef.current.rotateTo(IDLE_ROTATION.x, IDLE_ROTATION.y);
					mainBoxRef.current.rotateTo(IDLE_ROTATION.x, IDLE_ROTATION.y);
				}

				// Select random winner and trigger celebration after rotation
				rotationTimeoutRef.current = setTimeout(() => {
					const randomIndex = Math.floor(Math.random() * participants.length);
					const selectedWinner = participants[randomIndex];

					// Open lid after a short delay
					lidOpenTimeoutRef.current = setTimeout(() => {
						setLidState(LidState.OPEN);
						onDrawComplete(selectedWinner);
					}, LID_OPEN_DELAY_MS);
				}, 100);
			}
		};

		animate();
	}, [participants, onDrawComplete, setLidState]);

	// Handle drawing state changes
	useEffect(() => {
		if (isDrawing && !prevIsDrawingRef.current && participants.length > 0) {
			// Drawing started
			setLidState(LidState.CLOSED);
			animateDrawing();
		}
		prevIsDrawingRef.current = isDrawing;
	}, [isDrawing, participants.length, animateDrawing, setLidState]);

	// Handle celebration state (lid opening)
	useEffect(() => {
		const celebrating = isCelebrating ?? false;

		if (
			celebrating &&
			!prevIsCelebratingRef.current &&
			lidState === LidState.OPEN
		) {
			// Celebration started - open the lid
			if (lidRef.current) {
				// Lid rotates backward on X-axis
				lidRef.current.rotateTo(LID_OPEN_ROTATION_X, IDLE_ROTATION.y);
			}
			// Main box stays at idle position
		} else if (
			!celebrating &&
			prevIsCelebratingRef.current &&
			lidState === LidState.OPEN
		) {
			// Celebration ended - close the lid and reset
			if (lidRef.current) {
				lidRef.current.rotateTo(IDLE_ROTATION.x, IDLE_ROTATION.y);
			}
			setLidState(LidState.CLOSED);
			reset();
		}
		prevIsCelebratingRef.current = celebrating;
	}, [isCelebrating, lidState, setLidState, reset]);

	// Cleanup on unmount
	useEffect(() => {
		return () => {
			if (animationFrameRef.current) {
				cancelAnimationFrame(animationFrameRef.current);
			}
			if (rotationTimeoutRef.current) {
				clearTimeout(rotationTimeoutRef.current);
			}
			if (lidOpenTimeoutRef.current) {
				clearTimeout(lidOpenTimeoutRef.current);
			}
		};
	}, []);

	const isEmpty = participants.length === 0;

	return {
		isEmpty,
		lidRef,
		mainBoxRef,
		containerRef,
	};
}
