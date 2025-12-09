/* eslint-disable @typescript-eslint/ban-types */
"use client";

import type { Options as ConfettiOptions } from "canvas-confetti";
import confetti from "canvas-confetti";
import { Trophy, Users } from "lucide-react";
import { useEffect } from "react";
import { Button } from "@/components/ui/button";
import type { Participant } from "@/stores/lucky-draw-store";

type ConfettiEffectType = "side-cannons" | "fireworks";

interface WinnerDialogContentProps {
	winner: Participant;
	onClose: () => void;
	effectType?: ConfettiEffectType;
}

const CONFETTI_DURATION_MS = 3_000;
const CONFETTI_COLORS = ["#a786ff", "#fd8bbc", "#eca184", "#f8deb1"];

function triggerSideCannons(options?: ConfettiOptions) {
	const end = Date.now() + CONFETTI_DURATION_MS;

	const frame = () => {
		if (Date.now() > end) return;

		const common: ConfettiOptions = {
			particleCount: 2,
			spread: 55,
			startVelocity: 60,
			colors: CONFETTI_COLORS,
			...options,
		};

		void confetti({
			...common,
			angle: 60,
			origin: { x: 0, y: 0.5 },
		});

		void confetti({
			...common,
			angle: 120,
			origin: { x: 1, y: 0.5 },
		});

		requestAnimationFrame(frame);
	};

	frame();
}

function triggerFireworks(options?: ConfettiOptions) {
	const end = Date.now() + CONFETTI_DURATION_MS;

	const frame = () => {
		if (Date.now() > end) return;

		const common: ConfettiOptions = {
			particleCount: 50,
			startVelocity: 60,
			spread: 360,
			ticks: 200,
			gravity: 1,
			colors: CONFETTI_COLORS,
			...options,
		};

		void confetti({
			...common,
			origin: {
				x: Math.random(),
				y: Math.random() * 0.5,
			},
		});

		requestAnimationFrame(frame);
	};

	frame();
}

export function WinnerDialogContent({
	winner,
	onClose,
	effectType = "side-cannons",
}: WinnerDialogContentProps) {
	useEffect(() => {
		if (typeof window === "undefined") return;

		if (window.matchMedia?.("(prefers-reduced-motion: reduce)").matches) {
			return;
		}

		if (effectType === "fireworks") {
			triggerFireworks();
		} else {
			triggerSideCannons();
		}
	}, [effectType]);

	return (
		<div className="flex flex-col items-center justify-center gap-4 py-6 text-center">
			<div className="flex items-center justify-center gap-2 text-2xl">
				<Trophy className="size-8 text-yellow-500" />
				<h2 className="font-bold">Winner!</h2>
			</div>
			<p className="text-muted-foreground text-sm">We have a winner!</p>

			<div className="flex flex-col items-center justify-center gap-4 py-4">
				<div className="flex h-24 w-24 items-center justify-center rounded-full bg-primary/20">
					<Users className="size-12 text-primary" />
				</div>
				<h3 className="font-bold text-3xl text-foreground">{winner.name}</h3>
			</div>

			<Button size="lg" onClick={onClose} className="mt-2">
				Congratulations!
			</Button>
		</div>
	);
}
