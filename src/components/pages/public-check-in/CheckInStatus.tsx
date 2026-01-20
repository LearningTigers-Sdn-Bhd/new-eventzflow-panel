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
				"fixed inset-0 z-50 flex flex-col justify-center p-4 text-white sm:p-8 lg:p-24",
				status === "success" ? "bg-brand-green" : "bg-destructive",
			)}
		>
			<div className="mx-auto w-full max-w-4xl">
				<div className="mb-6 flex items-start justify-between sm:mb-12">
					<div className="bg-black/20 px-2.5 py-1.5 font-bold font-mono text-[10px] uppercase tracking-widest backdrop-blur-lg sm:px-4 sm:py-2 sm:text-xs">
						{status === "success" ? "Entry Authorized" : "Entry Denied"}
					</div>
					<button
						onClick={onClose}
						className="flex h-10 w-10 items-center justify-center rounded-none bg-white text-black transition-transform hover:scale-110 sm:h-12 sm:w-12"
					>
						<X className="h-5 w-5 sm:h-6 sm:w-6" />
					</button>
				</div>

				<motion.h1
					initial={{ opacity: 0, y: 20 }}
					animate={{ opacity: 1, y: 0 }}
					transition={{ delay: 0.1 }}
					className="mb-6 font-bold text-[15vw] uppercase leading-none tracking-tighter sm:mb-8 sm:text-[12vw] lg:text-[10rem]"
				>
					{status === "success" ? "Valid" : "Used"}
				</motion.h1>

				<div className="flex flex-col gap-6 border-white/20 border-t pt-6 sm:gap-12 sm:pt-12 md:flex-row">
					<div className="flex-1">
						<div className="mb-2 inline-block bg-white/20 px-2.5 py-1 font-bold font-mono text-[10px] uppercase tracking-widest sm:mb-3 sm:px-3 sm:py-1.5 sm:text-xs">
							Attendee
						</div>
						<div className="font-bold text-2xl uppercase sm:text-3xl md:text-5xl">
							{attendee.name}
						</div>
					</div>
					<div className="flex-1">
						<div className="mb-2 inline-block bg-white/20 px-2.5 py-1 font-bold font-mono text-[10px] uppercase tracking-widest sm:mb-3 sm:px-3 sm:py-1.5 sm:text-xs">
							Details
						</div>
						<div className="space-y-0.5 text-base sm:space-y-1 sm:text-xl md:text-2xl">
							{attendee.type_name && (
								<div>{attendee.type_name}</div>
							)}
							{attendee.email && (
								<div className="break-all opacity-90 text-sm sm:text-xl md:text-2xl">{attendee.email}</div>
							)}
							{attendee.phone && (
								<div className="opacity-90">{attendee.phone}</div>
							)}
						</div>
					</div>
				</div>

				<div className="mt-8 sm:mt-16">
					<button
						onClick={onClose}
						className="w-full bg-white px-8 py-4 font-bold text-black text-xs uppercase tracking-widest shadow-2xl transition-transform hover:translate-y-[-4px] sm:w-auto sm:px-12 sm:py-6 sm:text-sm"
					>
						Next Attendee
					</button>
				</div>
			</div>
		</motion.div>
	);
}
