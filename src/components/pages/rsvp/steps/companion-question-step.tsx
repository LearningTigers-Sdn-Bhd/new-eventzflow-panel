"use client";

import { ArrowLeft, User, Users } from "lucide-react";
import {
	ATTENDING_ALONE_LABEL,
	BRINGING_FAMILY_MEMBER_LABEL,
} from "./companion-question-copy";

interface CompanionQuestionStepProps {
	extraGuestLimit: number | null;
	onAnswer: (bringing: boolean) => void;
	onBack: () => void;
	isSubmitting: boolean;
}

export function CompanionQuestionStep({
	extraGuestLimit,
	onAnswer,
	onBack,
	isSubmitting,
}: CompanionQuestionStepProps) {
	const guestLimitCopy =
		extraGuestLimit == null
			? "You're welcome to bring as many guests as you'd like."
			: `You're welcome to bring up to ${extraGuestLimit} guest${
					extraGuestLimit === 1 ? "" : "s"
				} with you.`;

	return (
		<div className="flex flex-col">
			<div className="mb-8 flex items-center justify-between sm:mb-12">
				<div className="max-w-lg">
					<h2 className="font-serif text-3xl text-stone-900 sm:text-5xl">
						Will you be{" "}
						<span className="mt-1 block text-stone-700 italic">
							joining us with others?
						</span>
					</h2>
				</div>
				<button
					type="button"
					onClick={onBack}
					className="flex h-10 w-10 items-center justify-center rounded-full border border-stone-200 bg-white text-stone-500 transition-all hover:border-stone-400 hover:text-stone-700 sm:h-12 sm:w-12"
				>
					<ArrowLeft className="h-5 w-5 sm:h-6 sm:w-6" />
				</button>
			</div>

			<div className="mb-8 text-left sm:mb-12">
				<p className="font-semibold text-[10px] text-stone-500 text-xs uppercase tracking-[0.2em] sm:text-sm">
					Guest Invitation:{" "}
					<span className="ml-2 font-serif text-sm text-stone-700 normal-case italic tracking-normal sm:text-base">
						{guestLimitCopy}
					</span>
				</p>
			</div>

			<div className="grid gap-4 sm:grid-cols-2 sm:gap-6">
				<button
					type="button"
					onClick={() => onAnswer(true)}
					disabled={isSubmitting}
					className="group relative flex flex-col items-center gap-4 rounded-xl border border-stone-100 bg-rsvp-canvas p-6 transition-all hover:border-stone-200 hover:bg-white hover:shadow-stone-200/50 hover:shadow-xl disabled:opacity-50 sm:gap-6 sm:p-10"
				>
					<div className="flex h-12 w-12 items-center justify-center rounded-full border border-stone-100/50 bg-rsvp-canvas text-stone-500 shadow-sm transition-all group-hover:scale-105 group-hover:text-stone-900 sm:h-16 sm:w-16">
						<Users className="h-6 w-6 sm:h-8 sm:w-8" />
					</div>
					<div className="text-center">
						<span className="block font-serif text-stone-900 text-xl sm:text-2xl">
							{BRINGING_FAMILY_MEMBER_LABEL}
						</span>
						<span className="mt-1 block font-semibold text-[10px] text-stone-500 uppercase tracking-[0.2em] sm:mt-2">
							Family & friends welcome
						</span>
					</div>
				</button>

				<button
					type="button"
					onClick={() => onAnswer(false)}
					disabled={isSubmitting}
					className="group relative flex flex-col items-center gap-4 rounded-xl border border-stone-100 bg-rsvp-canvas p-6 transition-all hover:border-stone-200 hover:bg-white hover:shadow-stone-200/50 hover:shadow-xl disabled:opacity-50 sm:gap-6 sm:p-10"
				>
					<div className="flex h-12 w-12 items-center justify-center rounded-full border border-stone-100/50 bg-rsvp-canvas text-stone-500 shadow-sm transition-all group-hover:scale-105 group-hover:text-stone-900 sm:h-16 sm:w-16">
						<User className="h-6 w-6 sm:h-8 sm:w-8" />
					</div>
					<div className="text-center">
						<span className="block font-serif text-stone-900 text-xl sm:text-2xl">
							{ATTENDING_ALONE_LABEL}
						</span>
						<span className="mt-1 block font-semibold text-[10px] text-stone-500 uppercase tracking-[0.2em] sm:mt-2">
							Solo celebration
						</span>
					</div>
				</button>
			</div>
		</div>
	);
}
