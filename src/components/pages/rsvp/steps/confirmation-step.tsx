"use client";

import { Check, X, ShieldCheck } from "lucide-react";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import type { RsvpCompanionRequest } from "@/lib/api/rsvp";

interface ConfirmationStepProps {
	rsvpStatus: "attending" | "declined";
	companions: RsvpCompanionRequest[];
	eventTitle: string;
	onChangeResponse: () => void;
}

export function ConfirmationStep({
	rsvpStatus,
	companions,
	eventTitle,
	onChangeResponse,
}: ConfirmationStepProps) {
	const isAttending = rsvpStatus === "attending";

	return (
		<div className="flex flex-col items-center text-center">
			<motion.div
				initial={{ scale: 0.5, opacity: 0 }}
				animate={{ scale: 1, opacity: 1 }}
				transition={{ type: "spring", bounce: 0.6 }}
				className="mb-8 flex h-20 w-20 items-center justify-center border-4 border-black bg-white shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] sm:mb-10 sm:h-24 sm:w-24 sm:shadow-[8px_8px_0px_0px_rgba(0,0,0,1)]"
			>
				{isAttending ? (
					<Check className="h-10 w-10 text-black sm:h-12 sm:w-12" />
				) : (
					<X className="h-10 w-10 text-black sm:h-12 sm:w-12" />
				)}
			</motion.div>

			<div className="mb-10 sm:mb-12">
				<h2 className="font-serif text-4xl leading-none text-black sm:text-6xl">
					{isAttending ? "We look forward to " : "Thank you for "} <br />
					<span className="italic">{isAttending ? "celebrating with you!" : "letting us know."}</span>
				</h2>
				<p className="mt-6 text-base font-bold leading-relaxed text-black sm:mt-8 sm:text-xl">
					{isAttending
						? `Your response for ${eventTitle} has been received. We've saved your spot!`
						: `We're sorry you can't make it to ${eventTitle}, but we appreciate you keeping us informed.`}
				</p>
			</div>

			{isAttending && companions.length > 0 && (
				<div className="mb-10 w-full border-[3px] border-black bg-white p-6 text-left shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] sm:mb-12 sm:border-4 sm:p-8 sm:shadow-[12px_12px_0px_0px_rgba(0,0,0,1)]">
					<p className="mb-4 border-b-2 border-black pb-2 text-xs font-black uppercase tracking-widest text-black sm:mb-6 sm:text-sm">Guests joining you</p>
					<ul className="space-y-3 sm:space-y-4">
						{companions.map((c, i) => (
							<li key={`confirmed-${i}`} className="flex items-center gap-3 sm:gap-4">
								<div className="h-2 w-2 bg-black sm:h-3 sm:w-3" />
								<span className="font-serif text-xl text-black leading-none sm:text-2xl">{c.full_name}</span>
							</li>
						))}
					</ul>
					
					<div className="mt-6 flex items-center gap-2 border-t-2 border-black pt-4 text-black sm:mt-8 sm:gap-3 sm:pt-6">
						<ShieldCheck className="h-4 w-4 sm:h-5 w-5" />
						<span className="text-[10px] font-black uppercase tracking-widest sm:text-xs">RSVP Confirmed</span>
					</div>
				</div>
			)}

			<div className="w-full space-y-4">
				<p className="text-sm font-medium text-gray-500">
					Need to make a change? You can update your response at any time.
				</p>
				<Button
					onClick={onChangeResponse}
					variant="ghost"
					className="h-14 w-full rounded-none border-[3px] border-black bg-white text-xs font-black uppercase tracking-[0.3em] text-black transition-all hover:bg-black hover:text-white sm:h-16 sm:border-4"
				>
					Update My Response
				</Button>
			</div>
		</div>
	);
}
