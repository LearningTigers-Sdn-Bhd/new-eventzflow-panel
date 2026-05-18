"use client";

import { motion } from "framer-motion";
import { ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import type { AttendeePreview } from "@/lib/api/event-check-in";
import { containerVariants, itemVariants } from "./animations";

interface CheckInResultsProps {
	results: AttendeePreview[];
	onSelect: (attendee: AttendeePreview) => void;
	onReset: () => void;
}

export function CheckInResults({
	results,
	onSelect,
	onReset,
}: CheckInResultsProps) {
	return (
		<motion.div
			key="results-mode"
			variants={containerVariants}
			initial="hidden"
			animate="visible"
			exit="exit"
			className="space-y-4 sm:space-y-6"
		>
			<div className="flex items-end justify-between border-neutral-100 border-b-2 pb-3 sm:pb-4">
				<div>
					<span className="font-bold font-mono text-[9px] text-brand-green uppercase tracking-[0.2em] sm:text-[10px]">
						Match Found
					</span>
					<h2 className="mt-0.5 font-black text-2xl text-black uppercase tracking-tight sm:mt-1 sm:text-3xl">
						Results
					</h2>
				</div>
				<div className="flex flex-col items-end">
					<span className="font-black text-brand-green text-xl sm:text-2xl">
						{results.length}
					</span>
					<span className="font-bold font-mono text-[7px] text-neutral-400 uppercase tracking-widest sm:text-[8px]">
						Profiles
					</span>
				</div>
			</div>

			<div className="scrollbar-thin scrollbar-thumb-neutral-100 max-h-[50vh] space-y-2 overflow-y-auto pr-1 sm:max-h-[45vh] sm:space-y-3 sm:pr-2">
				{results.map((attendee) => (
					<motion.button
						key={attendee.public_id}
						variants={itemVariants}
						onClick={() => onSelect(attendee)}
						className="group flex w-full items-center justify-between rounded-none border border-neutral-300 bg-neutral-50/50 p-3 text-left transition-all hover:border-black hover:bg-white hover:shadow-[4px_4px_0px_0px_rgba(0,0,0,0.05)] sm:p-5"
					>
						<div className="flex items-center gap-2 sm:gap-4">
							<div className="flex h-10 w-10 items-center justify-center rounded-none bg-white font-black text-neutral-300 transition-colors group-hover:bg-black group-hover:text-white sm:h-12 sm:w-12">
								{attendee.name.charAt(0).toUpperCase()}
							</div>
							<div>
								<div className="font-bold text-base text-neutral-900 transition-colors group-hover:text-black sm:text-lg">
									{attendee.name}
								</div>
								<div className="mt-0.5 flex items-center gap-2 font-mono text-[8px] text-neutral-400 uppercase tracking-wide sm:mt-1 sm:gap-3 sm:text-[9px]">
									<span className="rounded-none border border-neutral-100 bg-white px-1.5 py-0.5 font-bold text-neutral-500 shadow-sm group-hover:border-black/10 group-hover:text-black sm:px-2 sm:py-1">
										{attendee.type_name || "ADMISSION"}
									</span>
									{attendee.email && (
										<span className="hidden opacity-60 sm:inline">
											{attendee.email}
										</span>
									)}
								</div>
							</div>
						</div>
						<div className="flex items-center gap-2 sm:gap-3">
							{attendee.checked_in ? (
								<div className="flex items-center gap-1 rounded-none border border-green-200 bg-green-50 px-2 py-0.5 font-bold text-[8px] text-green-600 uppercase tracking-wider sm:gap-1.5 sm:px-3 sm:py-1 sm:text-[9px]">
									<div className="h-1 w-1 animate-pulse rounded-full bg-green-500 sm:h-1.5 sm:w-1.5" />
									Active
								</div>
							) : (
								<div className="flex h-8 w-8 items-center justify-center rounded-none border border-neutral-200 bg-neutral-100 text-neutral-400 opacity-0 transition-all duration-300 group-hover:translate-x-0 group-hover:border-black group-hover:bg-black group-hover:text-white group-hover:opacity-100 sm:h-10 sm:w-10">
									<ArrowRight className="h-4 w-4 sm:h-5 sm:w-5" />
								</div>
							)}
						</div>
					</motion.button>
				))}
			</div>

			<motion.div variants={itemVariants}>
				<Button
					variant="ghost"
					onClick={onReset}
					className="group h-auto p-0 font-mono text-[9px] text-neutral-400 uppercase tracking-widest hover:bg-transparent hover:text-black sm:text-[10px]"
				>
					← Back to Search
				</Button>
			</motion.div>
		</motion.div>
	);
}
