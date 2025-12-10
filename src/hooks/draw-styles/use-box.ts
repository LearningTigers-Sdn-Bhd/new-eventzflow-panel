"use client";

import gsap from "gsap";
import type React from "react";
import { useEffect, useRef } from "react";
import type { DrawProps } from "@/components/pages/lucky-draw/session/draw-styles/type";

export interface UseBoxReturn {
	boxRef: React.RefObject<HTMLDivElement | null>;
	containerRef: React.RefObject<HTMLDivElement | null>;
	isEmpty: boolean;
}

export function useBox({
	participants,
	onDrawComplete,
	isDrawing,
}: DrawProps): UseBoxReturn {
	const boxRef = useRef<HTMLDivElement>(null);
	const containerRef = useRef<HTMLDivElement>(null);
	const animationRef = useRef<gsap.core.Timeline | null>(null);

	useEffect(() => {
		if (!isDrawing || participants.length === 0) return;

		const box = boxRef.current;
		if (!box) return;

		// Reset positions
		gsap.set(box, { rotation: 0, scale: 1 });

		// Select random winner
		const randomIndex = Math.floor(Math.random() * participants.length);
		const selectedWinner = participants[randomIndex];

		// Create timeline animation
		const tl = gsap.timeline({
			onComplete: () => {
				// Wait a bit then call onDrawComplete
				setTimeout(() => {
					onDrawComplete(selectedWinner);
				}, 500);
			},
		});

		// Intensive Shake animation
		tl.to(box, {
			rotation: -5,
			duration: 0.1,
			ease: "power2.inOut",
		})
			.to(box, {
				rotation: 5,
				duration: 0.1,
				ease: "power2.inOut",
			})
			.to(box, {
				rotation: -5,
				duration: 0.1,
				ease: "power2.inOut",
			})
			.to(box, {
				rotation: 5,
				duration: 0.1,
				ease: "power2.inOut",
			})
			.to(box, {
				rotation: -5,
				duration: 0.1,
				ease: "power2.inOut",
			})
			.to(box, {
				rotation: 0,
				duration: 0.1,
				ease: "power2.inOut",
			})
			.to(box, {
				scale: 1.1,
				duration: 0.2,
				ease: "power2.out",
			})
			.to(box, {
				scale: 1,
				duration: 0.2,
				ease: "elastic.out(1, 0.3)",
			});

		animationRef.current = tl;

		return () => {
			if (animationRef.current) {
				animationRef.current.kill();
			}
		};
	}, [isDrawing, participants, onDrawComplete]);

	const isEmpty = participants.length === 0;

	return {
		boxRef,
		containerRef,
		isEmpty,
	};
}
