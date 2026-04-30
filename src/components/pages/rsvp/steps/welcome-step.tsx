"use client";

import { Calendar } from "lucide-react";
import { Button } from "@/components/ui/button";
import { formatDateRange } from "@/lib/date-utils";

interface WelcomeStepProps {
	visitorName: string;
	eventTitle: string;
	startDate: string;
	endDate: string;
	onAccept: () => void;
	onDecline: () => void;
	isSubmitting: boolean;
}

export function WelcomeStep({
	visitorName,
	eventTitle,
	startDate,
	endDate,
	onAccept,
	onDecline,
	isSubmitting,
}: WelcomeStepProps) {
	const formattedDate = formatDateRange(startDate, endDate);

	return (
		<div className="flex flex-col items-center text-center">
			<div className="mb-4 sm:mb-8">
				<p className="mb-2 font-medium text-[10px] text-stone-500 uppercase tracking-[0.4em] sm:mb-4 sm:text-[11px]">
					— Exclusive Invitation —
				</p>
				<div className="space-y-0.5 sm:space-y-1">
					<h1
						className="text-5xl text-stone-800 leading-none sm:text-6xl lg:text-7xl"
						style={{
							fontFamily: '"Brush Script MT", "Lucida Handwriting", cursive',
						}}
					>
						Celebrate with us,
					</h1>
					<p className="break-words pt-1 font-serif text-3xl text-stone-900 sm:pt-2 sm:text-5xl lg:text-6xl">
						{visitorName}
					</p>
				</div>
			</div>

			<div className="mx-auto w-full max-w-xl space-y-6 sm:space-y-10 lg:space-y-12">
				<div className="relative py-1">
					<div
						className="absolute inset-0 flex items-center"
						aria-hidden="true"
					>
						<div className="w-full border-stone-200 border-t" />
					</div>
					<div className="relative flex justify-center">
						<span className="bg-transparent px-3 text-stone-400">
							<div className="h-1.5 w-1.5 rotate-45 border border-stone-400 bg-rsvp-canvas" />
						</span>
					</div>
				</div>

				<div className="space-y-3 sm:space-y-4">
					<p className="font-semibold text-[10px] text-stone-500 uppercase tracking-[0.3em] sm:text-[11px]">
						We would be honored to have you join us for
					</p>
					<h2
						className="break-words text-4xl text-stone-900 sm:text-6xl lg:text-7xl"
						style={{
							fontFamily: '"Brush Script MT", "Lucida Handwriting", cursive',
						}}
					>
						{eventTitle}
					</h2>
				</div>

				<div className="flex flex-col items-center justify-center gap-1">
					<Calendar className="mb-0.5 h-4 w-4 text-stone-400" />
					<p className="font-semibold text-[10px] text-stone-400 uppercase tracking-[0.2em] sm:text-[11px]">
						Event Dates
					</p>
					<p className="font-medium text-lg text-stone-900 sm:text-xl lg:text-2xl">
						{formattedDate}
					</p>
				</div>

				<p className="mx-auto max-w-md font-normal font-serif text-sm text-stone-600 italic leading-relaxed sm:text-base sm:text-lg">
					"Your presence would make this celebration truly special. Please let
					us know if you can attend."
				</p>
			</div>

			<div className="mx-auto mt-6 flex w-full flex-col gap-3 sm:mt-10 sm:max-w-md sm:flex-row sm:justify-center sm:gap-4">
				<Button
					onClick={onAccept}
					disabled={isSubmitting}
					className="h-12 rounded-full bg-rsvp-ink px-10 font-bold text-[10px] text-white uppercase tracking-widest shadow-stone-200 shadow-xl transition-all hover:bg-black active:scale-[0.98] sm:h-14 sm:text-[11px]"
				>
					Yes, I'll be there
				</Button>

				<Button
					onClick={onDecline}
					disabled={isSubmitting}
					variant="outline"
					className="h-12 rounded-full border border-stone-200 bg-white px-10 font-bold text-[10px] text-stone-600 uppercase tracking-widest transition-all hover:bg-stone-50 sm:h-14 sm:text-[11px]"
				>
					I'm unable to attend
				</Button>
			</div>
		</div>
	);
}
