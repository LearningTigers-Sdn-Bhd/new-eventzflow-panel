"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { AnimatePresence, motion } from "framer-motion";
import { useState } from "react";
import {
	type RsvpCompanionRequest,
	type RsvpPageData,
	submitRsvpResponse,
} from "@/lib/api/rsvp";
import { CompanionDetailsStep } from "./steps/companion-details-step";
import { CompanionQuestionStep } from "./steps/companion-question-step";
import { ConfirmationStep } from "./steps/confirmation-step";
import { WelcomeStep } from "./steps/welcome-step";

type WizardStep =
	| "welcome"
	| "companion-question"
	| "companion-details"
	| "confirmation";

interface RsvpWizardProps {
	data: RsvpPageData;
	slug: string;
	publicId: string;
}

const PAGE_TRANSITION = {
	initial: { opacity: 0, y: 10 },
	animate: { opacity: 1, y: 0 },
	exit: { opacity: 0, y: -10 },
};

export function RsvpWizard({ data, slug, publicId }: RsvpWizardProps) {
	const queryClient = useQueryClient();
	
	const [step, setStep] = useState<WizardStep>(
		data.visitor.rsvp_status && data.visitor.rsvp_status !== "pending"
			? "confirmation"
			: "welcome",
	);
	const [rsvpStatus, setRsvpStatus] = useState<"attending" | "declined">(
		data.visitor.rsvp_status === "declined" ? "declined" : "attending",
	);
	const [companions, setCompanions] = useState<RsvpCompanionRequest[]>(
		data.visitor.companions.map((c) => ({
			full_name: c.full_name,
			phone: c.phone || "",
			email: c.email || "",
		})),
	);

	const mutation = useMutation({
		mutationFn: (params: {
			status: "attending" | "declined";
			companions?: RsvpCompanionRequest[];
		}) =>
			submitRsvpResponse(slug, publicId, {
				rsvp_status: params.status,
				companions: params.companions,
			}),
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: ["rsvp", slug, publicId] });
			setStep("confirmation");
		},
	});

	const handleAccept = () => {
		setRsvpStatus("attending");
		if (data.event.extra_guest_limit === 0) {
			mutation.mutate({ status: "attending", companions: [] });
			return;
		}
		setStep("companion-question");
	};

	const handleDecline = () => {
		setRsvpStatus("declined");
		setCompanions([]); // Clear guest data on decline for a fresh start
		mutation.mutate({ status: "declined", companions: [] });
	};

	const handleBringingGuests = (bringing: boolean) => {
		if (bringing) {
			setStep("companion-details");
		} else {
			setCompanions([]); // Clear if they decide to come solo
			mutation.mutate({ status: "attending", companions: [] });
		}
	};

	const handleSubmitCompanions = (companionList: RsvpCompanionRequest[]) => {
		setCompanions(companionList);
		mutation.mutate({ status: "attending", companions: companionList });
	};

	const handleChangeResponse = () => {
		// When updating, we allow them to start fresh to ensure accuracy
		setStep("welcome");
	};

	return (
		<div className="relative flex min-h-screen flex-col items-center justify-center bg-[#FDFDFD] px-4 py-8 sm:py-12">
			{/* Grid Background */}
			<div className="fixed inset-0 z-0 bg-[#FDFDFD]">
				<div className="absolute inset-0 opacity-[0.03] [background-image:linear-gradient(#000_1px,transparent_1px),linear-gradient(90deg,#000_1px,transparent_1px)] [background-size:40px_40px]" />
			</div>

			<div className="relative z-10 w-full max-w-4xl">
				{/* Main Content Area */}
				<motion.div
					layout
					className="overflow-hidden rounded-none border-[3px] border-black bg-white p-6 shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] sm:p-14 sm:shadow-[16px_16px_0px_0px_rgba(0,0,0,1)]"
				>
					<AnimatePresence mode="wait">
						<motion.div
							key={step}
							variants={PAGE_TRANSITION}
							initial="initial"
							animate="animate"
							exit="exit"
							transition={{ duration: 0.3, ease: "easeInOut" }}
						>
							{step === "welcome" && (
								<WelcomeStep
									visitorName={data.visitor.full_name}
									eventTitle={data.event.title}
									eventDate={data.event.start_date}
									onAccept={handleAccept}
									onDecline={handleDecline}
									isSubmitting={mutation.isPending}
								/>
							)}
							{step === "companion-question" && (
								<CompanionQuestionStep
									extraGuestLimit={data.event.extra_guest_limit}
									onAnswer={handleBringingGuests}
									onBack={() => setStep("welcome")}
									isSubmitting={mutation.isPending}
								/>
							)}
							{step === "companion-details" && (
								<CompanionDetailsStep
									extraGuestLimit={data.event.extra_guest_limit}
									initialCompanions={companions}
									onSubmit={handleSubmitCompanions}
									onBack={() => setStep("companion-question")}
									isSubmitting={mutation.isPending}
								/>
							)}
							{step === "confirmation" && (
								<ConfirmationStep
									rsvpStatus={rsvpStatus}
									companions={companions}
									eventTitle={data.event.title}
									onChangeResponse={handleChangeResponse}
								/>
							)}
						</motion.div>
					</AnimatePresence>

					{mutation.isError && (
						<div className="mt-8 rounded-none border-2 border-red-600 bg-red-50 p-4 text-center text-sm font-bold text-red-600 uppercase">
							Something went wrong. Please try again.
						</div>
					)}
				</motion.div>
				
				<div className="mt-12 text-center">
					<p className="text-[11px] font-black uppercase tracking-[0.4em] text-black">
						EVENTZFLOW • PUBLIC RSVP 2026
					</p>
				</div>
			</div>
		</div>
	);
}
