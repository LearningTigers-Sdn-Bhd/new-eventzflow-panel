"use client";

import { motion } from "framer-motion";
import { Check, ShieldCheck, X } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import type { RsvpCompanionRequest } from "@/lib/api/rsvp";

interface ConfirmationStepProps {
	rsvpStatus: "attending" | "declined";
	companions: RsvpCompanionRequest[];
	eventTitle: string;
	eventSlug: string;
	visitorPublicId: string;
	onChangeResponse: () => void;
}

export function ConfirmationStep({
	rsvpStatus,
	companions,
	eventTitle,
	eventSlug,
	visitorPublicId,
	onChangeResponse,
}: ConfirmationStepProps) {
	const isAttending = rsvpStatus === "attending";

	return (
		<div className="flex flex-col items-center text-center">
			<motion.div
				initial={{ scale: 0.5, opacity: 0 }}
				animate={{ scale: 1, opacity: 1 }}
				transition={{ type: "spring", bounce: 0.6 }}
				className="mb-6 flex h-16 w-16 items-center justify-center rounded-full border border-stone-100 bg-white shadow-stone-200/50 shadow-xl sm:mb-8 sm:h-20 sm:w-20"
			>
				{isAttending ? (
					<Check className="h-6 w-6 text-stone-600 sm:h-8 sm:w-8" />
				) : (
					<X className="h-6 w-6 text-stone-400 sm:h-8 sm:w-8" />
				)}
			</motion.div>

			<div className="mb-6 sm:mb-10">
				<h2 className="font-serif text-3xl text-stone-900 leading-tight sm:text-5xl">
					{isAttending ? "We look forward to " : "Thank you for "} <br />
					<span className="mt-1 block text-stone-700 italic">
						{isAttending ? "celebrating with you!" : "letting us know."}
					</span>
				</h2>
				<p className="mx-auto mt-4 max-w-lg font-serif text-base text-stone-600 italic sm:mt-6 sm:text-lg">
					{isAttending
						? `Your response for ${eventTitle} has been received. We've saved your spot!`
						: `We're sorry you can't make it to ${eventTitle}, but we appreciate you keeping us informed.`}
				</p>
			</div>

			{isAttending && companions.length > 0 && (
				<div className="mb-8 w-full max-w-md rounded-xl border border-stone-100 bg-rsvp-canvas p-6 text-left shadow-sm sm:mb-10 sm:p-8">
					<p className="mb-4 border-stone-200 border-b pb-2 font-semibold text-[10px] text-stone-500 uppercase tracking-[0.2em] sm:text-xs">
						Guests joining you
					</p>
					<ul className="space-y-2 sm:space-y-3">
						{companions.map((c) => (
							<li
								key={`confirmed-${c.full_name}-${c.email ?? c.phone ?? "guest"}`}
								className="flex items-center gap-3 sm:gap-4"
							>
								<div className="h-1.5 w-1.5 rotate-45 border border-stone-400" />
								<span className="font-serif text-lg text-stone-800 leading-none sm:text-2xl">
									{c.full_name}
								</span>
							</li>
						))}
					</ul>

					<div className="mt-6 flex items-center gap-3 border-stone-200 border-t pt-4 text-stone-500 sm:pt-6">
						<ShieldCheck className="h-4 w-4 w-5 sm:h-5" />
						<span className="font-semibold text-[10px] uppercase tracking-[0.2em] sm:text-xs">
							RSVP Confirmed
						</span>
					</div>
				</div>
			)}

			{isAttending && (
				<div
					className="relative mb-8 w-full max-w-md overflow-hidden rounded-2xl bg-[#FFFCF8] p-8 text-center shadow-[0_12px_40px_-12px_rgba(0,0,0,0.1)] ring-1 ring-stone-900/5 transition-transform duration-300 hover:-translate-y-1 hover:shadow-[0_20px_50px_-12px_rgba(0,0,0,0.15)] sm:mb-10 sm:p-10"
					style={{
						// Creates a subtle paper texture effect to match the wishes wall
						backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.65' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)' opacity='0.04'/%3E%3C/svg%3E")`,
					}}
				>
					<div className="relative z-10">
						<p className="mb-4 font-semibold text-[10px] text-stone-400 uppercase tracking-[0.3em]">
							Digital Guestbook
						</p>

						<div className="relative mx-auto w-full max-w-[8rem] py-2">
							<div
								className="absolute inset-0 flex items-center"
								aria-hidden="true"
							>
								<div className="w-full border-stone-200 border-t" />
							</div>
							<div className="relative flex justify-center">
								<span className="bg-transparent px-3 text-stone-300">
									<div className="h-1 w-1 rotate-45 border border-stone-300 bg-[#FFFCF8]" />
								</span>
							</div>
						</div>

						<p className="mt-4 font-serif text-2xl text-stone-800 italic leading-tight sm:text-3xl">
							Leave a blessing for the couple
						</p>
						<p className="mt-4 font-serif text-sm text-stone-500 italic leading-relaxed">
							"Share a warm note that can appear on the wedding wishes wall
							after review."
						</p>
						<Button
							asChild
							className="mt-8 h-12 w-full rounded-full bg-rsvp-ink px-8 font-bold text-[10px] text-white uppercase tracking-widest shadow-stone-200 shadow-xl transition-all hover:bg-black active:scale-[0.98] sm:h-14 sm:w-auto sm:text-[11px]"
						>
							<Link
								href={`/events/${eventSlug}/guestbook?visitor=${visitorPublicId}`}
							>
								Write a Blessing
							</Link>
						</Button>
					</div>
				</div>
			)}

			<div className="w-full max-w-xs space-y-3 sm:space-y-4">
				<p className="font-serif text-[10px] text-stone-500 italic sm:text-xs">
					Need to make a change?
				</p>
				<Button
					onClick={onChangeResponse}
					variant="ghost"
					className="h-12 w-full rounded-full border border-stone-200 bg-white font-semibold text-[10px] text-stone-500 uppercase tracking-[0.3em] transition-all hover:bg-stone-50 hover:text-stone-700 sm:h-14"
				>
					Update Response
				</Button>
			</div>
		</div>
	);
}
