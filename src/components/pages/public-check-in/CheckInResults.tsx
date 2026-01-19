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
			className="space-y-8"
		>
			<div className="flex items-end justify-between border-black border-b-2 pb-4">
				<h2 className="font-bold text-3xl uppercase tracking-tighter">
					Results
				</h2>
				<span className="font-mono text-brand-green text-sm">
					{results.length} FOUND
				</span>
			</div>

			<div className="scrollbar-thin scrollbar-thumb-neutral-200 max-h-[60vh] space-y-0 overflow-y-auto pr-2">
				{results.map((attendee) => (
					<motion.button
						key={attendee.public_id}
						variants={itemVariants}
						onClick={() => onSelect(attendee)}
						className="group flex w-full items-center justify-between border-neutral-100 border-b py-6 text-left transition-all hover:bg-neutral-50 hover:pl-4"
					>
						<div>
							<div className="font-bold text-xl uppercase transition-colors group-hover:text-brand-green">
								{attendee.name}
							</div>
							<div className="mt-1 flex items-center gap-3 font-mono text-[10px] text-neutral-400 uppercase tracking-wide">
								<span className="bg-neutral-100 px-2 py-1 text-black">
									{attendee.type_name || "ADMISSION"}
								</span>
								{attendee.email && (
									<span className="opacity-50">{attendee.email}</span>
								)}
							</div>
						</div>
						<div className="pr-4">
							{attendee.checked_in ? (
								<span className="font-bold text-[10px] text-neutral-400 uppercase tracking-widest">
									Checked In
								</span>
							) : (
								<div className="flex h-8 w-8 items-center justify-center rounded-full bg-brand-green text-white opacity-0 transition-opacity group-hover:opacity-100">
									<ArrowRight className="h-4 w-4" />
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
