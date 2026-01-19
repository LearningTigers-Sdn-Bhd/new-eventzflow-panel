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
			className="space-y-6"
		>
			<div className="flex items-end justify-between border-neutral-100 border-b-2 pb-4">
				<div>
					<span className="font-bold font-mono text-[10px] text-brand-green uppercase tracking-[0.2em]">Match Found</span>
					<h2 className="mt-1 font-black text-3xl text-black uppercase tracking-tight">
						Results
					</h2>
				</div>
				<div className="flex flex-col items-end">
					<span className="font-black text-2xl text-brand-green">
						{results.length}
					</span>
					<span className="font-bold font-mono text-[8px] text-neutral-400 uppercase tracking-widest">Profiles</span>
				</div>
			</div>

			<div className="scrollbar-thin scrollbar-thumb-neutral-100 max-h-[45vh] space-y-3 overflow-y-auto pr-2">
				{results.map((attendee) => (
					<motion.button
						key={attendee.public_id}
						variants={itemVariants}
						onClick={() => onSelect(attendee)}
						className="group flex w-full items-center justify-between rounded-none border border-neutral-300 bg-neutral-50/50 p-5 text-left transition-all hover:border-black hover:bg-white hover:shadow-[4px_4px_0px_0px_rgba(0,0,0,0.05)]"
					>
						<div className="flex items-center gap-4">
							<div className="flex h-12 w-12 items-center justify-center rounded-none bg-white font-black text-neutral-300 transition-colors group-hover:bg-black group-hover:text-white">
								{attendee.name.charAt(0).toUpperCase()}
							</div>
							<div>
								<div className="font-bold text-lg text-neutral-900 transition-colors group-hover:text-black">
									{attendee.name}
								</div>
								<div className="mt-1 flex items-center gap-3 font-mono text-[9px] text-neutral-400 uppercase tracking-wide">
									<span className="rounded-none border border-neutral-100 bg-white px-2 py-1 font-bold text-neutral-500 shadow-sm group-hover:text-black group-hover:border-black/10">
										{attendee.type_name || "ADMISSION"}
									</span>
									{attendee.email && (
										<span className="opacity-60">{attendee.email}</span>
									)}
								</div>
							</div>
						</div>
						<div className="flex items-center gap-3">
							{attendee.checked_in ? (
								<div className="flex items-center gap-1.5 rounded-none border border-green-200 bg-green-50 px-3 py-1 text-[9px] font-bold text-green-600 uppercase tracking-wider">
									<div className="h-1.5 w-1.5 rounded-full bg-green-500 animate-pulse" />
									Active
								</div>
							) : (
								<div className="flex h-10 w-10 items-center justify-center rounded-none border border-neutral-200 bg-neutral-100 text-neutral-400 opacity-0 transition-all duration-300 group-hover:translate-x-0 group-hover:bg-black group-hover:text-white group-hover:opacity-100 group-hover:border-black">
									<ArrowRight className="h-5 w-5" />
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
					className="group h-auto p-0 font-mono text-[10px] text-neutral-400 uppercase tracking-widest hover:bg-transparent hover:text-black"
				>
					← Back to Search
				</Button>
			</motion.div>
		</motion.div>
	);
}
