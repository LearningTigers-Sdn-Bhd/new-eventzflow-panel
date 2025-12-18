"use client";

import { motion } from "framer-motion";
import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

interface ColorfulSlotMachineProps {
	children: ReactNode;
	isDrawing: boolean;
	isCelebrating?: boolean;
	onSpin?: () => void;
}

type BulbMode = "idle" | "drawing" | "celebration";

const Bulb = ({
	order,
	mode,
	total,
}: {
	order: number;
	mode: BulbMode;
	total: number;
}) => {
	const isCelebrating = mode === "celebration";
	const isDrawing = mode === "drawing";

	const stepDuration = isDrawing ? 0.04 : 0.18;
	const cycleDuration = stepDuration * total;

	const offBg =
		"radial-gradient(circle, #7f1d1d 0%, #450a0a 55%, #1a0000 100%)";
	const onBg =
		"radial-gradient(circle, #ffffff 0%, #fef9c3 30%, #fde047 100%)";
	
	// Generate times array dynamically based on total bulbs
	const numSteps = 9; // 8 lights on + 1 off state
	const times = Array.from({ length: numSteps }, (_, i) => i / (numSteps - 1));

	return (
		<div className="flex items-center justify-center">
			<motion.div
				key={`${mode}-${order}`}
				className={cn(
					"h-3 w-3 rounded-full",
					"border-2 border-amber-900",
				)}
				animate={
					isCelebrating
						? {
							background: [onBg, onBg, onBg],
							boxShadow: [
								"0 0 14px 4px rgba(254, 240, 138, 0.7)",
								"0 0 20px 6px rgba(254, 240, 138, 0.9)",
								"0 0 14px 4px rgba(254, 240, 138, 0.7)",
							],
							opacity: 1,
							scale: [1, 1.12, 1],
						}
						: {
							background: [offBg, onBg, onBg, onBg, onBg, onBg, onBg, onBg, offBg],
							opacity: [0.18, 1, 0.85, 0.7, 0.55, 0.4, 0.3, 0.22, 0.18],
							boxShadow: [
								"0 0 0px 0px rgba(254, 240, 138, 0)",
								"0 0 14px 4px rgba(254, 240, 138, 0.8)",
								"0 0 13px 4px rgba(254, 240, 138, 0.75)",
								"0 0 11px 3px rgba(254, 240, 138, 0.65)",
								"0 0 9px 3px rgba(254, 240, 138, 0.55)",
								"0 0 7px 2px rgba(254, 240, 138, 0.45)",
								"0 0 5px 2px rgba(254, 240, 138, 0.35)",
								"0 0 3px 1px rgba(254, 240, 138, 0.25)",
								"0 0 0px 0px rgba(254, 240, 138, 0)",
							],
						}
				}
				transition={{
					duration: isCelebrating ? 0.7 : cycleDuration,
					times,
					delay: isCelebrating ? 0 : order * stepDuration,
					repeat: Number.POSITIVE_INFINITY,
					ease: "linear",
				}}
			/>
		</div>
	);
};

export const ColorfulSlotMachine = ({
	children,
	isDrawing,
	isCelebrating,
	onSpin,
}: ColorfulSlotMachineProps) => {
	const canSpin = Boolean(onSpin) && !isDrawing;
	const bulbMode: BulbMode = isCelebrating
		? "celebration"
		: isDrawing
			? "drawing"
			: "idle";
	const totalBulbs = 28; // 10 top + 4 right + 10 bottom + 4 left

	const topBulbs = Array.from({ length: 10 }, (_, i) => i);
	const rightBulbs = Array.from({ length: 4 }, (_, i) => 10 + i);
	const bottomBulbs = Array.from({ length: 10 }, (_, i) => 14 + i);
	const leftBulbs = Array.from({ length: 4 }, (_, i) => 24 + i);

	return (
		<div className="relative flex w-full flex-col items-center justify-center p-4 sm:p-8">
			{/* Slot Machine Container */}
			<div className="relative w-full max-w-[520px]">
				{/* Machine Frame - Metallic Look */}
				<div className="relative rounded-3xl border-4 border-yellow-700 bg-gradient-to-b from-yellow-800 via-yellow-900 to-yellow-950 p-1 shadow-2xl">
					{/* Inner Chrome Bezel */}
					<div className="rounded-[20px] border-2 border-yellow-600 bg-gradient-to-b from-yellow-700 to-yellow-800 p-1.5">
						
						{/* Top Display Panel */}
						<div className="mb-2 flex items-center justify-center rounded-xl border-2 border-yellow-600 bg-gradient-to-b from-red-800 to-red-950 px-5 py-3 shadow-inner">
							<h2 className="font-bold text-lg text-yellow-400 tracking-wide drop-shadow-[0_2px_4px_rgba(0,0,0,0.8)]">
								LUCKY DRAW
							</h2>
						</div>

						{/* Main Reel Display Window with Light Bulbs - Grid Layout */}
						<div className="flex flex-col">
							{/* Top Bulb Row */}
							<div
								className="grid h-6 grid-cols-10 items-center rounded-t-xl bg-red-900"
							>
								{topBulbs.map((i) => (
									<Bulb
										key={`top-${i}`}
										order={i}
										mode={bulbMode}
										total={totalBulbs}
									/>
								))}
							</div>

							{/* Middle Section with Left/Right Bulbs and Content */}
							<div className="flex">
								{/* Left Bulb Column */}
								<div
									className="grid w-6 grid-rows-4 bg-red-900"
								>
									{leftBulbs
										.slice()
										.reverse()
										.map((order, idx) => (
											<Bulb
												key={`left-${idx}`}
												order={order}
												mode={bulbMode}
												total={totalBulbs}
											/>
										))}
								</div>

								{/* Center Content Area */}
								<div className="min-w-0 flex-1 overflow-hidden bg-red-950 p-1">
									<div className="relative overflow-hidden rounded-lg border-2 border-yellow-900 bg-gradient-to-b from-slate-100 via-white to-slate-50">
										{/* Screen Reflection Overlay */}
										<div className="pointer-events-none absolute inset-0 z-10 bg-gradient-to-br from-white/20 via-transparent to-transparent" />
										
										{/* Top Shadow for depth */}
										<div className="pointer-events-none absolute inset-x-0 top-0 z-20 h-8 bg-gradient-to-b from-black/15 to-transparent" />
										
										{/* Bottom Shadow for depth */}
										<div className="pointer-events-none absolute inset-x-0 bottom-0 z-20 h-8 bg-gradient-to-t from-black/15 to-transparent" />

										{/* Suspense Glow Effect - appears during drawing */}
										{isDrawing && !isCelebrating && (
											<motion.div
												className="pointer-events-none absolute inset-0 z-25"
												animate={{
													background: [
														"radial-gradient(circle at center, rgba(239, 68, 68, 0) 0%, rgba(239, 68, 68, 0) 100%)",
														"radial-gradient(circle at center, rgba(239, 68, 68, 0.15) 30%, rgba(239, 68, 68, 0) 70%)",
														"radial-gradient(circle at center, rgba(239, 68, 68, 0) 0%, rgba(239, 68, 68, 0) 100%)",
													],
												}}
												transition={{
													duration: 1.5,
													repeat: Number.POSITIVE_INFINITY,
													ease: "easeInOut",
												}}
											/>
										)}

										{/* Winner Selection Line - Center Highlight */}
										<motion.div
											className={cn(
												"-translate-y-1/2 pointer-events-none absolute inset-x-0 top-1/2 z-30 h-[34%] border-y-2",
												isCelebrating
													? "border-emerald-500 bg-emerald-500/15"
													: "border-red-500/60 bg-red-500/5"
											)}
											animate={
												isCelebrating
													? { 
														backgroundColor: ["rgba(16,185,129,0.15)", "rgba(16,185,129,0.3)", "rgba(16,185,129,0.15)"],
														scale: [1, 1.02, 1],
													}
													: isDrawing
														? { 
															opacity: [0.5, 1, 0.5],
															scale: [1, 1.01, 1],
														}
														: { opacity: 1, scale: 1 }
											}
											transition={{
												duration: isCelebrating ? 0.8 : 0.5,
												repeat: isCelebrating || isDrawing ? Number.POSITIVE_INFINITY : 0,
												ease: "easeInOut",
											}}
										>
											{/* Left Arrow Indicator */}
											<motion.div 
												className="-left-1 -translate-y-1/2 absolute top-1/2"
												animate={
													isDrawing && !isCelebrating
														? { x: [-2, 0, -2] }
														: { x: 0 }
												}
												transition={{
													duration: 0.6,
													repeat: isDrawing && !isCelebrating ? Number.POSITIVE_INFINITY : 0,
													ease: "easeInOut",
												}}
											>
												<div className={cn(
													"h-0 w-0 border-y-[8px] border-y-transparent border-l-[10px]",
													isCelebrating ? "border-l-emerald-500" : "border-l-red-500"
												)} />
											</motion.div>
											{/* Right Arrow Indicator */}
											<motion.div 
												className="-right-1 -translate-y-1/2 absolute top-1/2"
												animate={
													isDrawing && !isCelebrating
														? { x: [2, 0, 2] }
														: { x: 0 }
												}
												transition={{
													duration: 0.6,
													repeat: isDrawing && !isCelebrating ? Number.POSITIVE_INFINITY : 0,
													ease: "easeInOut",
												}}
											>
												<div className={cn(
													"h-0 w-0 border-y-[8px] border-y-transparent border-r-[10px]",
													isCelebrating ? "border-r-emerald-500" : "border-r-red-500"
												)} />
											</motion.div>
										</motion.div>

										{/* Reel Content */}
										{children}
									</div>
								</div>

								{/* Right Bulb Column */}
								<div
									className="grid w-6 grid-rows-4 bg-red-900"
								>
									{rightBulbs.map((order, idx) => (
										<Bulb
											key={`right-${idx}`}
											order={order}
											mode={bulbMode}
											total={totalBulbs}
										/>
									))}
								</div>
							</div>

							{/* Bottom Bulb Row */}
							<div
								className="grid h-6 grid-cols-10 items-center rounded-b-xl bg-red-900"
							>
								{bottomBulbs
									.slice()
									.reverse()
									.map((order, idx) => (
										<Bulb
											key={`bottom-${idx}`}
											order={order}
											mode={bulbMode}
											total={totalBulbs}
										/>
									))}
							</div>
						</div>

						{/* Bottom Control Panel */}
						<div className="mt-4 flex items-center justify-between gap-4 rounded-xl border-2 border-yellow-600 bg-gradient-to-b from-red-800 to-red-950 px-5 py-4 shadow-inner">
							{/* Info Text */}
							<p className="text-sm text-yellow-200">
								{isCelebrating
									? "🎉 Winner selected!"
									: isDrawing
										? "Spinning the reels..."
										: "Press SPIN to draw"}
							</p>

							{/* Spin Button - Classic Slot Style */}
							<motion.button
								type="button"
								onClick={canSpin ? onSpin : undefined}
								disabled={!canSpin}
								whileHover={canSpin ? { scale: 1.05 } : undefined}
								whileTap={canSpin ? { scale: 0.95 } : undefined}
								className={cn(
									"relative overflow-hidden rounded-xl border-2 px-8 py-3 font-bold text-sm uppercase tracking-wider transition-all",
									canSpin
										? "border-red-400 bg-gradient-to-b from-red-500 to-red-600 text-white shadow-[0_4px_0_0_#991b1b,0_6px_20px_rgba(239,68,68,0.4)] hover:from-red-400 hover:to-red-500 active:translate-y-[2px] active:shadow-[0_2px_0_0_#991b1b]"
										: "cursor-not-allowed border-slate-600 bg-slate-700 text-slate-500"
								)}
								aria-disabled={!canSpin}
								aria-busy={isDrawing}
							>
								{/* Button Shine Effect */}
								{canSpin && (
									<div className="pointer-events-none absolute inset-0 bg-gradient-to-b from-white/25 to-transparent" />
								)}
								<span className="relative">
									{isDrawing ? "Spinning..." : "Spin"}
								</span>
							</motion.button>
						</div>
					</div>

					{/* Decorative Corner Bolts */}
					<div className="absolute top-3 left-3 h-3 w-3 rounded-full border border-yellow-600 bg-gradient-to-br from-yellow-400 to-yellow-700 shadow-md" />
					<div className="absolute top-3 right-3 h-3 w-3 rounded-full border border-yellow-600 bg-gradient-to-br from-yellow-400 to-yellow-700 shadow-md" />
					<div className="absolute bottom-3 left-3 h-3 w-3 rounded-full border border-yellow-600 bg-gradient-to-br from-yellow-400 to-yellow-700 shadow-md" />
					<div className="absolute right-3 bottom-3 h-3 w-3 rounded-full border border-yellow-600 bg-gradient-to-br from-yellow-400 to-yellow-700 shadow-md" />
				</div>
			</div>
		</div>
	);
};
