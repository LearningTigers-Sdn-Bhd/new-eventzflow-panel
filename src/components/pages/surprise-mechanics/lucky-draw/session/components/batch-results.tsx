"use client";

import confetti from "canvas-confetti";
import { motion } from "framer-motion";
import { useEffect, useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import type { Participant } from "@/stores/lucky-draw-store";
import { gridColumns } from "../../batch-draw";

// Normal reveal: names appear one by one, about REVEAL_TOTAL_MS in total
const REVEAL_TOTAL_MS = 3000;
const REVEAL_MIN_STEP_MS = 60;
const REVEAL_MAX_STEP_MS = 220;

// Skipped animation: every slot flickers, then locks one by one for suspense
const FLICKER_MS = 1500;
const FLICKER_TICK_MS = 70;
const LOCK_STAGGER_MS = 70;

interface BatchResultsProps {
	/** Winners of this draw, already saved, in the order they were drawn */
	winners: Participant[];
	/** Round or gift these winners were drawn for */
	title: string;
	/** Gift each winner got, in the same order as `winners` (round sweep only) */
	giftNames?: string[] | null;
	/** True when the draw animation was skipped: reveal with a flicker instead */
	suspense: boolean;
	/** Names to flicker through while a slot has not locked yet */
	pool: Participant[];
	onClose: () => void;
}

function textSize(count: number) {
	if (count <= 6) return "text-3xl";
	if (count <= 15) return "text-xl";
	if (count <= 30) return "text-base";
	if (count <= 60) return "text-sm";
	return "text-xs";
}

function prefersReducedMotion() {
	return window.matchMedia?.("(prefers-reduced-motion: reduce)").matches;
}

function fireConfetti() {
	const shot = (originX: number, angle: number) =>
		confetti({
			particleCount: 90,
			angle,
			spread: 70,
			startVelocity: 55,
			origin: { x: originX, y: 0.75 },
		});
	shot(0, 60);
	shot(1, 120);
}

/**
 * Shown over the draw area once every round of a multi-winner draw is done.
 * The rounds kept the names hidden, so this reveals them: one by one, or with
 * a flicker-then-lock when the animation was skipped.
 */
export function BatchResults({
	winners,
	title,
	giftNames,
	suspense,
	pool,
	onClose,
}: BatchResultsProps) {
	// How many cards are revealed (locked, in suspense mode)
	const [revealed, setRevealed] = useState(0);
	const [flicker, setFlicker] = useState<string[]>([]);
	const poolRef = useRef(pool);
	const celebrated = useRef(false);

	useEffect(() => {
		const names = poolRef.current;
		if (prefersReducedMotion()) {
			setRevealed(winners.length);
			return;
		}

		if (suspense && names.length > 0) {
			const start = performance.now();
			const id = setInterval(() => {
				const elapsed = performance.now() - start;
				const lockedNow = Math.min(
					winners.length,
					elapsed < FLICKER_MS
						? 0
						: Math.floor((elapsed - FLICKER_MS) / LOCK_STAGGER_MS) + 1,
				);
				setRevealed(lockedNow);
				setFlicker(
					winners.map(
						() => names[Math.floor(Math.random() * names.length)]?.name ?? "",
					),
				);
				if (lockedNow >= winners.length) clearInterval(id);
			}, FLICKER_TICK_MS);
			return () => clearInterval(id);
		}

		const step = Math.min(
			REVEAL_MAX_STEP_MS,
			Math.max(REVEAL_MIN_STEP_MS, REVEAL_TOTAL_MS / winners.length),
		);
		const id = setInterval(() => {
			setRevealed((n) => {
				if (n + 1 >= winners.length) clearInterval(id);
				return Math.min(n + 1, winners.length);
			});
		}, step);
		return () => clearInterval(id);
	}, [winners, suspense]);

	// Burst of confetti when the last name appears
	useEffect(() => {
		if (revealed >= winners.length && !celebrated.current) {
			celebrated.current = true;
			if (!prefersReducedMotion()) fireConfetti();
		}
	}, [revealed, winners.length]);

	useEffect(() => {
		const onKey = (e: KeyboardEvent) => e.key === "Escape" && onClose();
		window.addEventListener("keydown", onKey);
		return () => window.removeEventListener("keydown", onKey);
	}, [onClose]);

	const big = winners.length > 48;

	return (
		<motion.div
			className="absolute inset-0 z-40 flex flex-col items-center justify-center gap-4 bg-linear-to-b from-background/95 via-background/90 to-background/95 p-6 backdrop-blur-md"
			initial={{ opacity: 0 }}
			animate={{ opacity: 1 }}
			transition={{ duration: 0.4 }}
		>
			<motion.div
				className="shrink-0 text-center"
				initial={{ y: -16, opacity: 0 }}
				animate={{ y: 0, opacity: 1 }}
				transition={{ delay: 0.15, duration: 0.4 }}
			>
				<p className="font-medium text-primary text-sm uppercase tracking-[0.35em]">
					Congratulations
				</p>
				<h2 className="font-bold text-3xl">
					{title}
					<span className="font-normal text-muted-foreground">
						{" "}
						· {winners.length} winner{winners.length === 1 ? "" : "s"}
					</span>
				</h2>
			</motion.div>
			<div
				className={cn(
					"grid min-h-0 w-full gap-2 overflow-y-auto p-1",
					big ? "max-w-full" : "max-w-6xl",
				)}
				style={{
					gridTemplateColumns: `repeat(${gridColumns(winners.length)}, minmax(0, 1fr))`,
				}}
			>
				{winners.map((winner, i) => {
					const isShown = i < revealed;
					return (
						<motion.div
							key={winner.publicId}
							initial={false}
							animate={
								isShown
									? { opacity: 1, scale: 1 }
									: { opacity: 0.25, scale: 0.88 }
							}
							transition={{ type: "spring", stiffness: 420, damping: 14 }}
							className={cn(
								"relative flex items-center justify-center border px-2 py-2 text-center font-semibold leading-tight",
								big ? "min-h-[2.75em]" : "min-h-[3.75em]",
								giftNames && "pt-3 pb-4",
								textSize(winners.length),
								isShown
									? "border-primary bg-primary/15 text-foreground shadow-lg shadow-primary/25"
									: "bg-background/40",
							)}
						>
							<span className="absolute top-0.5 left-1 font-normal text-[9px] text-muted-foreground tabular-nums">
								{i + 1}
							</span>
							<span
								className={cn(
									"break-words",
									big ? "line-clamp-3" : "line-clamp-2",
								)}
							>
								{isShown ? winner.name : suspense ? (flicker[i] ?? "") : ""}
							</span>
							{giftNames?.[i] && (
								<span className="absolute right-1 bottom-0.5 left-1 truncate font-normal text-[10px] text-muted-foreground">
									{giftNames[i]}
								</span>
							)}
						</motion.div>
					);
				})}
			</div>
			<Button
				className="shrink-0 rounded-none"
				variant="outline"
				onClick={onClose}
			>
				Close
			</Button>
		</motion.div>
	);
}
