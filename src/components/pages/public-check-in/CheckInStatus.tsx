"use client";

import { motion } from "framer-motion";
import { X } from "lucide-react";
import type { AttendeePreview } from "@/lib/api/event-check-in";
import { cn } from "@/lib/utils";

interface CheckInStatusProps {
	status: "success" | "already-checked-in";
	attendee: AttendeePreview | null;
	onClose: () => void;
}

export function CheckInStatus({
	status,
	attendee,
	onClose,
}: CheckInStatusProps) {
	if (!attendee) return null;

	return (
		<motion.div
			initial={{ y: "100%" }}
			animate={{ y: 0 }}
			exit={{ y: "100%" }}
			transition={{ type: "spring", damping: 25, stiffness: 200 }}
			className={cn(
				"fixed inset-0 z-50 flex flex-col justify-center p-8 text-white lg:p-24",
				status === "success" ? "bg-brand-green" : "bg-destructive",
			)}
		>
			<div className="mx-auto w-full max-w-4xl">
				<div className="mb-12 flex items-start justify-between">
					<div className="bg-black/20 px-4 py-2 font-bold font-mono text-xs uppercase tracking-widest backdrop-blur-lg">
						{status === "success" ? "Entry Authorized" : "Entry Denied"}
					</div>
					<button
						onClick={onClose}
						className="flex h-12 w-12 items-center justify-center rounded-none bg-white text-black transition-transform hover:scale-110"
					>
						<X className="h-6 w-6" />
					</button>
				</div>

				<motion.h1
					initial={{ opacity: 0, y: 20 }}
					animate={{ opacity: 1, y: 0 }}
					transition={{ delay: 0.1 }}
					className="mb-8 font-bold text-[12vw] uppercase leading-none tracking-tighter lg:text-[10rem]"
				>
					{status === "success" ? "Valid" : "Used"}
				</motion.h1>

				<div className="flex flex-col gap-12 border-white/20 border-t pt-12 md:flex-row">
					<div className="flex-1">
						<div className="mb-3 bg-white/20 px-3 py-1.5 font-bold font-mono text-xs uppercase tracking-widest inline-block">
							Attendee
						</div>
						<div className="font-bold text-3xl uppercase md:text-5xl">
							{attendee.name}
						</div>
					</div>
					<div className="flex-1">
						<div className="mb-3 bg-white/20 px-3 py-1.5 font-bold font-mono text-xs uppercase tracking-widest inline-block">
							Details
						</div>
						<div className="space-y-1 text-xl md:text-2xl">
							{attendee.type_name && (
								<div>{attendee.type_name}</div>
							)}
							{attendee.email && (
								<div className="break-all opacity-90">{attendee.email}</div>
							)}
							{attendee.phone && (
								<div className="opacity-90">{attendee.phone}</div>
							)}
						</div>
					</div>
				</div>

				<div className="mt-16">
					<button
						onClick={onClose}
						className="bg-white px-12 py-6 font-bold text-black text-sm uppercase tracking-widest shadow-2xl transition-transform hover:translate-y-[-4px]"
					>
						Next Attendee
					</button>
				</div>
			</div>
		</motion.div>
	);
}
