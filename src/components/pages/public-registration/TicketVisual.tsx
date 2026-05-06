"use client";

import { Check, QrCode, Ticket } from "lucide-react";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";

interface TicketVisualProps {
	attendeeName: string;
	eventTitle: string;
	ticketType: string;
	publicId: string;
	date?: string;
	venue?: string;
}

export function TicketVisual({
	attendeeName,
	eventTitle,
	ticketType,
	publicId,
	date,
	venue,
}: TicketVisualProps) {
	return (
		<motion.div
			initial={{ opacity: 0, y: 20 }}
			animate={{ opacity: 1, y: 0 }}
			className="relative mx-auto w-full max-w-md overflow-hidden"
		>
			{/* The Ticket Body */}
			<div className="flex h-48 w-full rounded-2xl border border-slate-200 bg-white shadow-xl shadow-slate-200/50">
				{/* Left Section (Main) */}
				<div className="relative flex flex-1 flex-col p-5 text-left">
					<div className="flex items-center gap-2">
						<div className="flex h-6 w-6 items-center justify-center rounded-full bg-brand-green/10">
							<Ticket className="h-3 w-3 text-brand-green" />
						</div>
						<span className="text-[10px] font-bold uppercase tracking-widest text-brand-green">
							Official Ticket
						</span>
					</div>

					<div className="mt-3">
						<h3 className="line-clamp-1 font-bold text-lg text-slate-900 leading-tight">
							{eventTitle}
						</h3>
						<p className="text-[10px] font-bold uppercase tracking-wider text-brand-green">
							{ticketType}
						</p>
					</div>

					<div className="mt-auto flex flex-col gap-1">
						<div className="flex items-center gap-4">
							<div>
								<p className="text-[8px] font-medium uppercase tracking-wider text-slate-400">
									Attendee
								</p>
								<p className="font-bold text-slate-900 text-sm">{attendeeName}</p>
							</div>
							{date && (
								<div>
									<p className="text-[8px] font-medium uppercase tracking-wider text-slate-400">
										Date
									</p>
									<p className="font-bold text-slate-900 text-sm">
										{new Date(date).toLocaleDateString("en-US", {
											month: "short",
											day: "numeric",
											year: "numeric",
										})}
									</p>
								</div>
							)}
						</div>
						{venue && (
							<div>
								<p className="text-[8px] font-medium uppercase tracking-wider text-slate-400">
									Venue
								</p>
								<p className="font-bold text-slate-900 text-[10px] truncate max-w-[180px]">
									{venue}
								</p>
							</div>
						)}
					</div>

					{/* Brand Watermark */}
					<div className="absolute right-4 bottom-4 opacity-[0.03]">
						<Ticket className="h-20 w-20 rotate-12 text-slate-900" />
					</div>
				</div>

				{/* Perforation Line */}
				<div className="relative flex h-full w-px items-center justify-center">
					<div className="absolute -top-2 h-4 w-4 -translate-x-1/2 rounded-full border border-slate-200 bg-slate-50" />
					<div className="h-[80%] border-l border-dashed border-slate-200" />
					<div className="absolute -bottom-2 h-4 w-4 -translate-x-1/2 rounded-full border border-slate-200 bg-slate-50" />
				</div>

				{/* Right Section (Stub) */}
				<div className="flex w-32 flex-col items-center justify-center bg-slate-50/50 p-4">
					<div className="flex h-20 w-20 items-center justify-center rounded-lg bg-white p-2 shadow-sm">
						<QrCode className="h-full w-full text-slate-900" />
					</div>
					<p className="mt-2 font-mono text-[8px] font-bold text-slate-400">
						{publicId.split("-")[0]}
					</p>
				</div>
			</div>
			
			{/* Decorative Dots on sides */}
			<div className="absolute top-1/2 -left-2 h-4 w-4 -translate-y-1/2 rounded-full border border-slate-200 bg-white" />
			<div className="absolute top-1/2 -right-2 h-4 w-4 -translate-y-1/2 rounded-full border border-slate-200 bg-white" />
		</motion.div>
	);
}
