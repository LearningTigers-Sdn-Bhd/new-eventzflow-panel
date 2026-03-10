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
			<div className="mb-8 flex items-center justify-between border-black border-b-4 pb-6 sm:mb-12 sm:pb-8">
				<div>
					<h2 className="font-serif text-3xl text-black sm:text-5xl">
						Will you be <span className="italic">joining us with others?</span>
					</h2>
				</div>
				<button
					type="button"
					onClick={onBack}
					className="flex h-10 w-10 items-center justify-center border-2 border-black bg-white transition-colors hover:bg-black hover:text-white sm:h-12 sm:w-12"
				>
					<ArrowLeft className="h-5 w-5 sm:h-6 sm:w-6" />
				</button>
			</div>

			<div className="mb-8 text-left sm:mb-10">
				<p className="font-black text-black text-xs uppercase tracking-[0.2em] sm:text-sm">
					Guest Invitation:{" "}
					<span className="text-gray-500">{guestLimitCopy}</span>
				</p>
			</div>

			<div className="grid gap-4 sm:grid-cols-2 sm:gap-6">
				<button
					type="button"
					onClick={() => onAnswer(true)}
					disabled={isSubmitting}
					className="group relative flex flex-col items-start gap-6 border-[3px] border-black bg-white p-6 transition-all hover:bg-black hover:text-white disabled:opacity-50 sm:gap-8 sm:border-4 sm:p-8"
				>
					<div className="flex h-12 w-12 items-center justify-center bg-black text-white transition-colors group-hover:bg-white group-hover:text-black sm:h-14 sm:w-14">
						<Users className="h-6 w-6 sm:h-7 sm:w-7" />
					</div>
					<div className="text-left">
						<span className="block font-black text-xl uppercase tracking-tighter sm:text-2xl">
							{BRINGING_FAMILY_MEMBER_LABEL}
						</span>
						<span className="mt-1 block font-bold text-[10px] uppercase tracking-widest opacity-60 sm:mt-2 sm:text-xs">
							Family & friends welcome
						</span>
					</div>
				</button>

				<button
					type="button"
					onClick={() => onAnswer(false)}
					disabled={isSubmitting}
					className="group relative flex flex-col items-start gap-6 border-[3px] border-black bg-white p-6 transition-all hover:bg-black hover:text-white disabled:opacity-50 sm:gap-8 sm:border-4 sm:p-8"
				>
					<div className="flex h-12 w-12 items-center justify-center bg-black text-white transition-colors group-hover:bg-white group-hover:text-black sm:h-14 sm:w-14">
						<User className="h-6 w-6 sm:h-7 sm:w-7" />
					</div>
					<div className="text-left">
						<span className="block font-black text-xl uppercase tracking-tighter sm:text-2xl">
							{ATTENDING_ALONE_LABEL}
						</span>
						<span className="mt-1 block font-bold text-[10px] uppercase tracking-widest opacity-60 sm:mt-2 sm:text-xs">
							Solo celebration
						</span>
					</div>
				</button>
			</div>
		</div>
	);
}
