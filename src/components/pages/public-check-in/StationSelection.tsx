"use client";

import { motion } from "framer-motion";

interface StationSelectionProps {
	onSelect: (station: string) => void;
	currentStation?: string | null;
}

const STATIONS = ["1", "2", "3"];

export function StationSelection({
	onSelect,
	currentStation,
}: StationSelectionProps) {
	return (
		<motion.div
			initial={{ opacity: 0 }}
			animate={{ opacity: 1 }}
			exit={{ opacity: 0 }}
			className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm"
		>
			<motion.div
				initial={{ opacity: 0, scale: 0.95, y: 20 }}
				animate={{ opacity: 1, scale: 1, y: 0 }}
				exit={{ opacity: 0, scale: 0.95, y: 20 }}
				transition={{ duration: 0.3, ease: [0.25, 0.1, 0.25, 1] }}
				className="w-full max-w-sm bg-white p-5 sm:max-w-md sm:p-8"
			>
				{/* Header */}
				<div className="mb-5 border-black border-l-4 pl-4 sm:mb-8 sm:pl-6">
					<h2 className="mb-1.5 font-black text-2xl text-neutral-900 uppercase tracking-tight sm:mb-2 sm:text-3xl md:text-4xl">
						Select Station
					</h2>
					<p className="max-w-sm font-medium text-neutral-500 text-xs leading-relaxed sm:text-sm">
						Choose which check-in station you are using.
					</p>
				</div>

				{/* Station Grid */}
				<div className="grid grid-cols-3 gap-2 sm:gap-3">
					{STATIONS.map((stationNum) => (
						<button
							key={stationNum}
							type="button"
							onClick={() => onSelect(stationNum)}
							className={`group flex flex-col items-center gap-2 border-2 p-4 text-center transition-all duration-200 hover:border-brand-green active:scale-95 sm:gap-3 sm:p-6 ${
								currentStation === stationNum
									? "border-brand-green bg-brand-green/5"
									: "border-neutral-200 bg-white hover:bg-brand-green/5"
							}`}
						>
							<span className="font-bold font-mono text-[9px] text-neutral-500 uppercase tracking-[0.2em] group-hover:text-brand-green sm:text-[11px]">
								Station
							</span>
							<div
								className={`flex h-10 w-10 items-center justify-center rounded-full font-bold text-xl transition-colors sm:h-14 sm:w-14 sm:text-2xl ${
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
				<p className="mt-4 text-center font-mono text-[9px] text-neutral-400 uppercase tracking-widest sm:mt-6 sm:text-[10px]">
					You can change this later by tapping the station info
				</p>
			</motion.div>
		</motion.div>
	);
}
