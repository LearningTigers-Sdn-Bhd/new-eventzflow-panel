"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { AnimatePresence, motion } from "framer-motion";
import Image from "next/image";
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
		<div className="relative flex min-h-screen flex-col items-center justify-center overflow-hidden bg-rsvp-canvas px-8 py-8 sm:px-4 sm:py-10 lg:py-12">
			{/* Subtle Decorative Background Elements */}
			<div className="pointer-events-none fixed inset-0 z-0">
				<div className="absolute top-[-10%] left-[-10%] h-[40%] w-[40%] rounded-full bg-rsvp-mist opacity-40 blur-[100px]" />
				<div className="absolute right-[-10%] bottom-[-10%] h-[40%] w-[40%] rounded-full bg-rsvp-mist opacity-40 blur-[100px]" />
			</div>

			{/* Corner Floral Decorations */}
			<div className="pointer-events-none fixed inset-0 z-0 overflow-hidden">
				{/* Top Left */}
				<div className="absolute top-0 left-0 h-56 w-56 sm:h-80 sm:w-80 lg:h-96 lg:w-96">
					<Image
						src="/images/assets/flowers/top-left-flower.webp"
						alt=""
						fill
						sizes="(max-width: 640px) 14rem, (max-width: 1024px) 20rem, 24rem"
						className="object-contain object-left-top"
					/>
				</div>
				{/* Top Right */}
				<div className="absolute top-0 right-0 h-56 w-56 sm:h-80 sm:w-80 lg:h-96 lg:w-96">
					<Image
						src="/images/assets/flowers/top-right-flower.webp"
						alt=""
						fill
						loading="eager"
						sizes="(max-width: 640px) 14rem, (max-width: 1024px) 20rem, 24rem"
						className="object-contain object-right-top"
					/>
				</div>
				{/* Bottom Left */}
				<div className="absolute bottom-0 left-0 h-56 w-56 sm:h-80 sm:w-80 lg:h-96 lg:w-96">
					<Image
						src="/images/assets/flowers/bottom-left-flower.webp"
						alt=""
						fill
						sizes="(max-width: 640px) 14rem, (max-width: 1024px) 20rem, 24rem"
						className="object-contain object-left-bottom"
					/>
				</div>
				{/* Bottom Right */}
				<div className="absolute right-0 bottom-0 h-56 w-56 sm:h-80 sm:w-80 lg:h-96 lg:w-96">
					<Image
						src="/images/assets/flowers/bottom-right-flower.webp"
						alt=""
						fill
						sizes="(max-width: 640px) 14rem, (max-width: 1024px) 20rem, 24rem"
						className="object-contain object-right-bottom"
					/>
				</div>
			</div>

			<div className="relative z-10 w-full max-w-3xl">
				{/* Main Content Area */}
				<motion.div
					layout
					className="overflow-hidden rounded-[2rem] border border-stone-100 bg-white/80 p-6 shadow-[0_32px_64px_-16px_rgba(0,0,0,0.03)] backdrop-blur-md sm:bg-white/90 sm:p-12 lg:p-16"
				>
					<AnimatePresence mode="wait">
						<motion.div
							key={step}
							variants={PAGE_TRANSITION}
							initial="initial"
							animate="animate"
							exit="exit"
							transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
						>
							{step === "welcome" && (
								<WelcomeStep
									visitorName={data.visitor.full_name}
									eventTitle={data.event.title}
									startDate={data.event.start_date}
									endDate={data.event.end_date}
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
						<div className="mt-8 rounded-lg bg-red-50 p-4 text-center font-medium text-red-600 text-sm">
							Something went wrong. Please try again.
						</div>
					)}
				</motion.div>
			</div>
		</div>
	);
}
