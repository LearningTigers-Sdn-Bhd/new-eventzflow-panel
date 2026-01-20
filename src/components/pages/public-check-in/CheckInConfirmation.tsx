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
			initial={{ opacity: 0, y: 20 }}
			animate={{ opacity: 1, y: 0 }}
			exit={{ opacity: 0, y: -20 }}
			className="flex flex-col"
		>
			<div className="mb-4 sm:mb-6">
				<div className="mb-1.5 font-mono text-[10px] text-neutral-500 uppercase tracking-widest sm:mb-2 sm:text-xs">
					Confirm Check-In
				</div>
				<h2 className="font-bold text-xl text-black uppercase sm:text-2xl lg:text-3xl">
					{attendee.name}
				</h2>
			</div>

			<div className="mb-4 space-y-1.5 border-neutral-200 border-t pt-3 sm:mb-6 sm:space-y-2 sm:pt-4">
				{attendee.type_name && (
					<div className="flex items-center justify-between text-xs sm:text-sm">
						<span className="text-neutral-500">Type</span>
						<span className="font-medium text-black">{attendee.type_name}</span>
					</div>
				)}
				{attendee.email && (
					<div className="flex items-center justify-between text-xs sm:text-sm">
						<span className="text-neutral-500">Email</span>
						<span className="max-w-[60%] break-all text-right font-medium text-black">
							{attendee.email}
						</span>
					</div>
				)}
				{attendee.phone && (
					<div className="flex items-center justify-between text-xs sm:text-sm">
						<span className="text-neutral-500">Phone</span>
						<span className="font-medium text-black">{attendee.phone}</span>
					</div>
				)}
			</div>

			<div className="mb-4 bg-amber-50 p-2.5 text-amber-800 text-[11px] leading-relaxed sm:mb-6 sm:p-3 sm:text-xs">
				Please verify your details are correct before checking in.
			</div>

			<div className="flex gap-2 sm:gap-3">
				<button
					onClick={onCancel}
					className="flex h-10 flex-1 items-center justify-center border border-neutral-300 bg-white font-medium text-neutral-700 text-xs transition-colors hover:bg-neutral-100 sm:h-12 sm:text-sm"
				>
					Cancel
				</button>
				<button
					onClick={onConfirm}
					disabled={isConfirming}
					className="flex h-10 flex-1 items-center justify-center gap-1.5 bg-brand-green font-medium text-xs text-white transition-colors hover:bg-brand-green/90 disabled:opacity-50 sm:h-12 sm:gap-2 sm:text-sm"
				>
					{isConfirming ? (
						<Loader2 className="h-3.5 w-3.5 animate-spin sm:h-4 sm:w-4" />
					) : (
						<>
							<Check className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
							<span>Check In</span>
						</>
					)}
				</button>
			</div>
		</motion.div>
	);
}
