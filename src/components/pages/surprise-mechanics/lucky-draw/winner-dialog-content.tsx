import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import type { Gift, Participant } from "@/stores/lucky-draw-store";
import type { Options as ConfettiOptions } from "canvas-confetti";
import confetti from "canvas-confetti";
import { motion } from "framer-motion";
import { Medal, Trophy } from "lucide-react";
import { useEffect, useState } from "react";

type ConfettiEffectType = "side-cannons" | "fireworks";

interface WinnerDialogContentProps {
	winner: Participant;
	gift?: Gift | null;
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
	gift,
	onClose,
	effectType = "side-cannons",
}: WinnerDialogContentProps) {
	const [mounted, setMounted] = useState(false);

	useEffect(() => {
		setMounted(true);
		if (typeof window === "undefined") return;

		if (window.matchMedia?.("(prefers-reduced-motion: reduce)").matches) {
			return;
		}

		const timeout = setTimeout(() => {
			if (effectType === "fireworks") {
				triggerFireworks();
			} else {
				triggerSideCannons();
			}
		}, 300);

		return () => clearTimeout(timeout);
	}, [effectType]);

	const getInitials = (name: string) => {
		return name
			.split(" ")
			.map((n) => n[0])
			.join("")
			.toUpperCase()
			.slice(0, 2);
	};

	return (
		<div className="flex h-full w-full flex-col bg-background text-foreground">
			{/* Close button is handled by parent dialog, which is now sharp and borderless inside */}
			
			<div className="relative flex flex-1 flex-col items-center justify-center p-8 sm:p-12">
				<div className="relative z-10 flex w-full max-w-md flex-col items-center gap-8 text-center">
					{/* Trophy Section - Cleaner, no generic sparkles */}
						<div className="relative">
						<div className="flex h-24 w-24 items-center justify-center border-4 border-primary bg-background shadow-[8px_8px_0px_0px_var(--primary)]">
							<Trophy className="h-12 w-12 text-primary" />
						</div>
						</div>

					{/* Text Section */}
					<div className="space-y-4">
						<div className="space-y-1">
							<h2 className="font-bold text-muted-foreground text-sm uppercase tracking-widest">
								We have a
							</h2>
							<h1 className="font-black text-5xl text-foreground uppercase tracking-tighter sm:text-6xl">
								Winner!
							</h1>
							{gift && (
								<div className="mt-2 inline-block border-2 border-primary bg-primary px-6 py-2">
									<p className="font-bold text-primary-foreground text-xl uppercase tracking-tight">
										Prize: {gift.name}
									</p>
								</div>
							)}
						</div>

						{/* Participant Card */}
						<div className="group relative w-full overflow-hidden border-2 border-primary border-b-4 bg-card p-6 transition-colors">
							<div className="flex flex-col items-center gap-4">
								<div className="relative">
									<Avatar className="h-20 w-20 rounded-none border-2 border-primary ring-2 ring-background ring-offset-2 ring-offset-primary">
										<AvatarFallback className="rounded-none bg-primary font-bold text-primary-foreground text-xl">
											{getInitials(winner.name)}
										</AvatarFallback>
									</Avatar>
									{/* Replaced Crown with Medal */}
									<div className="-bottom-2 -right-2 absolute border-2 border-primary bg-background p-1 text-primary shadow-[2px_2px_0px_0px_var(--primary)]">
										<Medal className="size-4" />
									</div>
								</div>

								<div className="space-y-2">
									<motion.h3
										initial={{ scale: 0.5, opacity: 0, filter: "blur(10px)" }}
										animate={{ scale: 1, opacity: 1, filter: "blur(0px)" }}
										transition={{ delay: 0.2, type: "spring", stiffness: 200 }}
										className="line-clamp-1 font-bold text-2xl uppercase tracking-tight"
									>
										{winner.name}
									</motion.h3>
								</div>
							</div>
						</div>
					</div>

					{/* Action Button */}
					<div className="w-full pt-4">
						<Button
							size="lg"
							onClick={onClose}
							className="h-14 w-full rounded-none border-2 border-primary bg-primary font-bold text-lg text-primary-foreground uppercase tracking-widest hover:bg-primary/90"
						>
							Congratulations
						</Button>
					</div>
				</div>
			</div>
		</div>
	);
}
