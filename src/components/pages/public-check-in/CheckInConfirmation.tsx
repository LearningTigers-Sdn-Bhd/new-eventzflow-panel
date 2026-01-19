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
			<div className="mb-6">
				<div className="mb-2 font-mono text-xs text-neutral-500 uppercase tracking-widest">
					Confirm Check-In
				</div>
				<h2 className="font-bold text-2xl text-black uppercase lg:text-3xl">
					{attendee.name}
				</h2>
			</div>

			<div className="mb-6 space-y-2 border-neutral-200 border-t pt-4">
				{attendee.type_name && (
					<div className="flex items-center justify-between text-sm">
						<span className="text-neutral-500">Type</span>
						<span className="font-medium text-black">{attendee.type_name}</span>
					</div>
				)}
				{attendee.email && (
					<div className="flex items-center justify-between text-sm">
						<span className="text-neutral-500">Email</span>
						<span className="break-all text-right font-medium text-black">
							{attendee.email}
						</span>
					</div>
				)}
				{attendee.phone && (
					<div className="flex items-center justify-between text-sm">
						<span className="text-neutral-500">Phone</span>
						<span className="font-medium text-black">{attendee.phone}</span>
					</div>
				)}
			</div>

			<div className="mb-6 bg-amber-50 p-3 text-amber-800 text-xs leading-relaxed">
				Please verify your details are correct before checking in.
			</div>

			<div className="flex gap-3">
				<button
					onClick={onCancel}
					className="flex h-12 flex-1 items-center justify-center border border-neutral-300 bg-white font-medium text-neutral-700 text-sm transition-colors hover:bg-neutral-100"
				>
					Cancel
				</button>
				<button
					onClick={onConfirm}
					disabled={isConfirming}
					className="flex h-12 flex-1 items-center justify-center gap-2 bg-brand-green font-medium text-sm text-white transition-colors hover:bg-brand-green/90 disabled:opacity-50"
				>
					{isConfirming ? (
						<Loader2 className="h-4 w-4 animate-spin" />
					) : (
						<>
							<Check className="h-4 w-4" />
							<span>Check In</span>
						</>
					)}
				</button>
			</div>
		</motion.div>
	);
}
