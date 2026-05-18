"use client";

import { motion } from "framer-motion";
import type { ReactNode } from "react";

interface WireframeSlotMachineProps {
	children: ReactNode;
	isDrawing: boolean;
	onSpin?: () => void;
}

export const WireframeSlotMachine = ({
	children,
	isDrawing,
	onSpin,
}: WireframeSlotMachineProps) => {
	return (
		<div className="relative flex flex-col items-center justify-center p-8">
			{/* Main Machine Container */}
			<div className="relative flex items-end">
				{/* The Machine Body (CSS + SVG Decoration) */}
				<div className="relative z-10 box-border flex w-[360px] flex-col rounded-3xl border-4 border-slate-900 bg-white shadow-[12px_12px_0px_0px_rgba(15,23,42,1)]">
					{/* Decorative Screws */}
					<div className="absolute top-4 left-4 flex h-3 w-3 items-center justify-center rounded-full border-2 border-slate-900 bg-slate-200">
						<div className="h-px w-full rotate-45 bg-slate-900" />{" "}
						<div className="absolute h-px w-full -rotate-45 bg-slate-900" />
					</div>
					<div className="absolute top-4 right-4 flex h-3 w-3 items-center justify-center rounded-full border-2 border-slate-900 bg-slate-200">
						<div className="h-px w-full rotate-45 bg-slate-900" />{" "}
						<div className="absolute h-px w-full -rotate-45 bg-slate-900" />
					</div>

					{/* Top Header Panel */}
					<div className="mx-8 mt-8 mb-4 flex flex-col items-center justify-center rounded-xl border-2 border-slate-300 border-dashed bg-slate-50 p-4">
						<div className="mb-2 flex gap-3">
							{[1, 2, 3].map((i) => (
								<motion.div
									key={i}
									animate={{
										backgroundColor: isDrawing
											? ["#94a3b8", "#fcd34d", "#94a3b8"]
											: "#cbd5e1",
									}}
									transition={{
										duration: 0.5,
										repeat: isDrawing ? Number.POSITIVE_INFINITY : 0,
										delay: i * 0.1,
									}}
									className="h-3 w-3 rounded-full border-2 border-slate-400 bg-slate-300"
								/>
							))}
						</div>
						<h2 className="font-black font-mono text-slate-800 text-xl uppercase tracking-[0.2em]">
							LUCKY DRAW
						</h2>
					</div>

					{/* The Screen / Windows */}
					<div className="relative mx-6 mb-6 overflow-hidden rounded-lg border-4 border-slate-900 bg-slate-100 p-2 shadow-inner">
						{/* Inner Bezel */}
						<div className="relative overflow-hidden rounded border border-slate-300 bg-white">
							{children}

							{/* Screen Glare Overlay */}
							<div className="pointer-events-none absolute inset-0 bg-gradient-to-tr from-transparent via-white/40 to-transparent opacity-50" />
						</div>
					</div>

					{/* Bottom Control Panel */}
					<div className="relative mt-auto rounded-b-2xl border-slate-900 border-t-4 bg-slate-100 p-6">
						<div className="flex items-center justify-center">
							{/* Spin Button - Centered */}
							<div
								className="group relative h-14 w-32 cursor-pointer"
								onClick={onSpin}
							>
								<div className="absolute inset-0 translate-y-1.5 rounded-xl border-2 border-slate-900 bg-slate-900" />
								<div className="absolute inset-0 flex items-center justify-center rounded-xl border-2 border-slate-900 bg-red-500 transition-transform hover:bg-red-400 group-active:translate-y-1.5">
									<span className="font-black font-mono text-lg text-white tracking-widest">
										SPIN
									</span>
								</div>
							</div>
						</div>
					</div>
				</div>

				{/* The Lever Arm (Animated) - Vertical Pull */}
				<div className="relative z-0 mb-[160px] -ml-4 h-[240px] w-[80px]">
					{/* Connection Joint */}
					<div className="absolute bottom-[60px] left-0 h-24 w-24 rounded-r-2xl border-4 border-slate-900 border-l-0 bg-slate-100 shadow-sm" />

					{/* The Arm Mechanism */}
					<div className="absolute bottom-[100px] left-[52px] h-40 w-5">
						{/* Shaft */}
						<motion.div
							className="absolute bottom-0 w-full rounded-full border-4 border-slate-900 bg-slate-300"
							style={{ height: "100%" }}
							animate={
								isDrawing
									? { height: ["100%", "30%", "100%"] }
									: { height: "100%" }
							}
							transition={{ duration: 0.5, ease: "backInOut" }}
						/>

						{/* Knob */}
						<motion.div
							className="absolute -top-6 -left-[18px] h-16 w-16 rounded-full border-4 border-slate-900 bg-red-500 shadow-[inset_-6px_-6px_10px_rgba(0,0,0,0.2)]"
							animate={isDrawing ? { y: [0, 110, 0] } : { y: 0 }}
							transition={{ duration: 0.5, ease: "backInOut" }}
						>
							<div className="absolute top-3 left-3 h-5 w-5 rounded-full bg-white/30" />
						</motion.div>
					</div>
				</div>
			</div>

			{/* Bottom Shadow / Floor */}
			<div className="mt-8 h-4 w-64 rounded-[50%] bg-black/10 blur-xl" />
		</div>
	);
};
