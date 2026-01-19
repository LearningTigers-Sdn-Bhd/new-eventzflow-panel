"use client";

import { motion } from "framer-motion";
import { Check, Loader2 } from "lucide-react";
import type { AttendeePreview } from "@/lib/api/event-check-in";

interface CheckInConfirmationProps {
	attendee: AttendeePreview;
	isConfirming: boolean;
	onConfirm: () => void;
	onCancel: () => void;
}

export function CheckInConfirmation({
	attendee,
	isConfirming,
	onConfirm,
	onCancel,
}: CheckInConfirmationProps) {
	return (
		<motion.div
			key="confirm-mode"
			initial={{ opacity: 0, x: 20 }}
			animate={{ opacity: 1, x: 0 }}
			exit={{ opacity: 0, x: -20 }}
			className="flex h-full flex-col justify-center"
		>
			<div className="mb-12 border-brand-green border-l-4 pl-8">
				<span className="mb-4 block font-mono text-[10px] text-brand-green uppercase tracking-[0.2em]">
					Confirm Entry
				</span>
				<h1 className="font-bold text-5xl uppercase leading-[0.9] tracking-tight lg:text-7xl">
					{attendee.name}
				</h1>
			</div>

			<div className="mb-8 grid grid-cols-2 gap-8 border-neutral-100 border-t pt-8">
				<div>
					<span className="mb-2 block font-mono text-[9px] text-neutral-400 uppercase tracking-[0.2em]">
						Type
					</span>
					<div className="font-bold text-xl">
						{attendee.type_name || "Standard"}
					</div>
				</div>
				{attendee.email && (
					<div>
						<span className="mb-2 block font-mono text-[9px] text-neutral-400 uppercase tracking-[0.2em]">
							Identifier
						</span>
						<div className="break-all font-medium text-neutral-600 text-sm">
							{attendee.email}
						</div>
					</div>
				)}
			</div>

			{/* REMINDER */}
			<div className="mb-8 rounded-lg border border-neutral-100 bg-neutral-50 p-4 text-center">
				<p className="font-medium text-neutral-500 text-xs">
					Please ensure all details above are correct before proceeding.
				</p>
			</div>

			<div className="grid grid-cols-2 gap-4">
				<button
					onClick={onCancel}
					className="flex h-16 items-center justify-center border border-neutral-200 font-bold text-[10px] uppercase tracking-widest transition-colors hover:border-black hover:bg-white"
				>
					Cancel
				</button>
				<button
					onClick={onConfirm}
					disabled={isConfirming}
					className="flex h-16 items-center justify-center gap-3 bg-brand-green font-bold text-[10px] text-white uppercase tracking-widest transition-transform hover:scale-[1.02] hover:bg-brand-green-dark"
				>
					{isConfirming ? (
						<Loader2 className="h-4 w-4 animate-spin" />
					) : (
						<>
							<span>Check In</span>
							<Check className="h-4 w-4" />
						</>
					)}
				</button>
			</div>
		</motion.div>
	);
}
