"use client";

import { Calendar } from "lucide-react";
import { Button } from "@/components/ui/button";

interface WelcomeStepProps {
	visitorName: string;
	eventTitle: string;
	eventDate: string;
	onAccept: () => void;
	onDecline: () => void;
	isSubmitting: boolean;
}

export function WelcomeStep({
	visitorName,
	eventTitle,
	eventDate,
	onAccept,
	onDecline,
	isSubmitting,
}: WelcomeStepProps) {
	const formattedDate = new Date(eventDate).toLocaleDateString("en-US", {
		weekday: "long",
		month: "long",
		day: "numeric",
		year: "numeric",
	});

	return (
		<div className="flex flex-col">
			<div className="mb-8 sm:mb-12">
				<p className="mb-4 font-black uppercase tracking-[0.2em] text-black text-xs sm:text-sm">
					Exclusive Invitation
				</p>
				<h1 className="font-serif text-4xl leading-tight text-black sm:text-6xl lg:text-7xl">
					Welcome, <br />
					<span className="font-sans font-black uppercase tracking-tighter text-black">{visitorName}</span>
				</h1>
			</div>

			<div className="mb-8 space-y-8 border-t-4 border-black pt-8 sm:mb-12 sm:space-y-10 sm:pt-10">
				<div className="space-y-4">
					<p className="text-lg font-bold leading-tight text-gray-900 sm:text-xl">
						We would be honored to have you join us for:
					</p>
					<h2 className="font-serif text-2xl italic text-black sm:text-4xl">{eventTitle}</h2>
				</div>

				<div className="flex items-center gap-4 rounded-none bg-gray-50 p-4 ring-2 ring-black sm:p-6">
					<div className="flex h-10 w-10 shrink-0 items-center justify-center bg-black sm:h-12 sm:w-12">
						<Calendar className="h-5 w-5 text-white sm:h-6 sm:w-6" />
					</div>
					<div className="space-y-0.5 sm:space-y-1">
						<p className="text-[9px] font-black uppercase tracking-widest text-gray-500 sm:text-[10px]">Event Date</p>
						<p className="text-base font-black text-black sm:text-lg">{formattedDate}</p>
					</div>
				</div>
				
				<p className="text-sm font-medium leading-relaxed text-gray-700 sm:text-base">
					Your presence would make this celebration truly special. Please let us know if you can attend.
				</p>
			</div>

			<div className="flex flex-col gap-4 sm:flex-row">
				<Button
					onClick={onAccept}
					disabled={isSubmitting}
					className="h-14 flex-1 rounded-none border-[3px] border-black bg-black text-base font-black uppercase tracking-widest text-white transition-all hover:bg-white hover:text-black active:scale-[0.98] sm:h-16 sm:border-4 sm:text-lg"
				>
					Yes, I'll be there
				</Button>
				
				<Button
					onClick={onDecline}
					disabled={isSubmitting}
					variant="ghost"
					className="h-14 flex-1 rounded-none border-[3px] border-black bg-white text-base font-black uppercase tracking-widest text-black transition-all hover:bg-black hover:text-white sm:h-16 sm:border-4 sm:text-lg"
				>
					I'm unable to attend
				</Button>
			</div>
		</div>
	);
}
