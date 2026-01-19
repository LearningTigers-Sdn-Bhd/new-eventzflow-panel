"use client";

import { motion } from "framer-motion";

interface StationSelectionProps {
	onSelect: (station: string) => void;
	currentStation?: string | null;
}

const STATIONS = ["1", "2", "3"];

export function StationSelection({ onSelect, currentStation }: StationSelectionProps) {
	return (
		<motion.div
			initial={{ opacity: 0 }}
			animate={{ opacity: 1 }}
			exit={{ opacity: 0 }}
			className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm"
		>
			<motion.div
				initial={{ opacity: 0, scale: 0.95, y: 20 }}
				animate={{ opacity: 1, scale: 1, y: 0 }}
				exit={{ opacity: 0, scale: 0.95, y: 20 }}
				transition={{ duration: 0.3, ease: [0.25, 0.1, 0.25, 1] }}
				className="mx-4 w-full max-w-md bg-white p-8"
			>
				{/* Header */}
				<div className="mb-8 border-black border-l-4 pl-6">
					<h2 className="mb-2 font-black text-3xl text-neutral-900 uppercase tracking-tight sm:text-4xl">
						Select Station
					</h2>
					<p className="max-w-sm font-medium text-sm text-neutral-500 leading-relaxed">
						Choose which check-in station you are using.
					</p>
				</div>

				{/* Station Grid */}
				<div className="grid grid-cols-3 gap-3">
					{STATIONS.map((stationNum) => (
						<button
							key={stationNum}
							type="button"
							onClick={() => onSelect(stationNum)}
							className={`group flex flex-col items-center gap-3 border-2 p-6 text-center transition-all duration-200 hover:border-brand-green active:scale-95 ${
								currentStation === stationNum
									? "border-brand-green bg-brand-green/5"
									: "border-neutral-200 bg-white hover:bg-brand-green/5"
							}`}
						>
							<span className="font-bold font-mono text-[11px] text-neutral-500 uppercase tracking-[0.2em] group-hover:text-brand-green">
								Station
							</span>
							<div
								className={`flex h-14 w-14 items-center justify-center rounded-full font-bold text-2xl transition-colors ${
									currentStation === stationNum
										? "bg-brand-green text-white"
										: "bg-neutral-100 text-neutral-600 group-hover:bg-brand-green group-hover:text-white"
								}`}
							>
								{stationNum}
							</div>
						</button>
					))}
				</div>

				{/* Helper Text */}
				<p className="mt-6 text-center font-mono text-[10px] text-neutral-400 uppercase tracking-widest">
					You can change this later by tapping the station info
				</p>
			</motion.div>
		</motion.div>
	);
}
