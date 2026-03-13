"use client";

import { AnimatePresence, motion } from "framer-motion";
import {
	ArrowLeft,
	ArrowRight,
	Check,
	CreditCard,
	Mail,
	Ticket,
	UserCircle,
} from "lucide-react";
import { type FormEvent, useEffect, useMemo, useState } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { usePublicRegistrationForm } from "@/hooks/use-public-registration-form";
import type { ExistingRegistrationStatusData } from "@/lib/api/public-registration";
import {
	createPublicPaymentOrder,
	verifyPublicPayment,
} from "@/lib/api/public-registration";
import {
	normalizeAttendeesForMode,
	syncAttendeeCustomFieldKeys,
} from "@/lib/public-registration/attendee-state";
import { buildPublicRegistrationSteps } from "@/lib/public-registration/steps";
import { buildPublicRegistrationTypeTitle } from "@/lib/public-registration/title";

interface AttendeeFormRow {
	row_id: string;
	attendee_name: string;
	attendee_email: string;
	attendee_phone: string;
	custom_fields_data: Record<string, string>;
}

const emptyAttendee = (customLabelKeys: string[] = []): AttendeeFormRow => ({
	row_id: crypto.randomUUID(),
	attendee_name: "",
	attendee_email: "",
	attendee_phone: "",
	custom_fields_data: customLabelKeys.reduce<Record<string, string>>(
		(acc, key) => {
			acc[key] = "";
			return acc;
		},
		{},
	),
});

const SMOOTH_EASE = [0.16, 1, 0.3, 1] as const;

declare global {
	interface Window {
		Razorpay?: new (
			options: Record<string, unknown>,
		) => {
			open: () => void;
			on?: (event: string, callback: () => void) => void;
		};
	}
}

async function loadRazorpayCheckoutScript() {
	if (window.Razorpay) {
		return true;
	}

	return new Promise<boolean>((resolve) => {
		const script = document.createElement("script");
		script.src = "https://checkout.razorpay.com/v1/checkout.js";
		script.async = true;
		script.onload = () => resolve(true);
		script.onerror = () => resolve(false);
		document.body.appendChild(script);
	});
}

export function PublicRegistrationForm({
	eventSlug,
	formSlug,
}: {
	eventSlug: string;
	formSlug: string;
}) {
	// Steps: 1 = ticket type, 2 = email, 3 = attendee details
	const [currentStep, setCurrentStep] = useState(1);
	const [email, setEmail] = useState("");
	const [selectedTicketTypeId, setSelectedTicketTypeId] = useState<
		number | null
	>(null);
	const [attendees, setAttendees] = useState<AttendeeFormRow[]>([
		emptyAttendee(),
	]);
	const [isCheckingEmail, setIsCheckingEmail] = useState(false);
	const [existingRegistrationStatus, setExistingRegistrationStatus] =
		useState<ExistingRegistrationStatusData | null>(null);
	const [isPaymentProcessing, setIsPaymentProcessing] = useState(false);
	const [paymentError, setPaymentError] = useState<string | null>(null);
	const [paymentSuccess, setPaymentSuccess] = useState(false);

	const {
		eventQuery,
		ticketTypesQuery,
		registrationFormsQuery,
		selectedRegistrationFormName,
		customLabelsData,
		isSubmitting,
		singleResult,
		groupResult,
		statusMessage,
		checkExistingRegistration,
		submit,
	} = usePublicRegistrationForm({ eventSlug, formSlug });

	const ticketTypes = ticketTypesQuery.data ?? [];
	const hasMultipleTicketTypes = ticketTypes.length > 1;

	const selectedTicketType = useMemo(() => {
		return ticketTypes.find((t) => t.id === selectedTicketTypeId) ?? null;
	}, [selectedTicketTypeId, ticketTypes]);

	const mergedCustomLabelsData = useMemo(
		() => [
			...customLabelsData,
			...(selectedTicketType?.custom_labels_data ?? []),
		],
		[customLabelsData, selectedTicketType?.custom_labels_data],
	);

	const customLabelEntries = useMemo(
		() => mergedCustomLabelsData.map((entry) => [entry.key, entry.label] as const),
		[mergedCustomLabelsData],
	);
	const customLabelKeys = useMemo(
		() => customLabelEntries.map(([key]) => key),
		[customLabelEntries],
	);
	const customLabelsLookup = useMemo(
		() => Object.fromEntries(customLabelEntries),
		[customLabelEntries],
	);

	const registrationMode = selectedTicketType?.registration_mode ?? "single";
	const minAttendees = selectedTicketType?.min_attendees ?? 1;
	const maxAttendees = selectedTicketType?.max_attendees ?? null;
	const canAddAttendee =
		registrationMode === "group" &&
		(!maxAttendees || attendees.length < maxAttendees);

	// Initialize step based on ticket type count
	useEffect(() => {
		if (ticketTypes.length > 0 && currentStep === 1) {
			if (!hasMultipleTicketTypes) {
				// Skip ticket selection if only one option
				setSelectedTicketTypeId(ticketTypes[0].id);
				setCurrentStep(2);
			}
		}
	}, [ticketTypes, hasMultipleTicketTypes, currentStep]);

	// Handle group registration attendee count
	useEffect(() => {
		setAttendees((current) =>
			normalizeAttendeesForMode(current, {
				registrationMode,
				minAttendees,
				createAttendee: () => emptyAttendee(customLabelKeys),
			}),
		);
	}, [registrationMode, minAttendees, customLabelKeys]);

	useEffect(() => {
		setAttendees((current) =>
			syncAttendeeCustomFieldKeys(current, customLabelKeys),
		);
	}, [customLabelKeys]);

	useEffect(() => {
		document.title = buildPublicRegistrationTypeTitle(
			eventQuery.data?.title,
			selectedRegistrationFormName ?? formSlug,
		);
	}, [eventQuery.data?.title, selectedRegistrationFormName, formSlug]);

	const loading =
		eventQuery.isLoading ||
		ticketTypesQuery.isLoading ||
		registrationFormsQuery.isLoading;

	// Step validation
	const canProceedStep1 = selectedTicketTypeId !== null;
	const canProceedStep2 = email.trim().length > 0 && email.includes("@");
	const hasPendingRegistration = Boolean(
		singleResult ||
			groupResult ||
			existingRegistrationStatus?.has_pending_payment,
	);

	const paymentTicketPublicId = useMemo(() => {
		if (singleResult?.public_id) {
			return singleResult.public_id;
		}

		if (groupResult?.publicIds?.length) {
			return groupResult.publicIds[0];
		}

		if (existingRegistrationStatus?.pending_tickets?.length) {
			return existingRegistrationStatus.pending_tickets[0].public_id;
		}

		return null;
	}, [
		singleResult?.public_id,
		groupResult?.publicIds,
		existingRegistrationStatus,
	]);

	function goToNextStep() {
		if (currentStep < 5) {
			// When going to step 3, pre-fill attendee emails with the email from step 2
			if (currentStep === 2) {
				setAttendees((current) =>
					current.map((attendee) => ({
						...attendee,
						attendee_email: attendee.attendee_email || email,
					})),
				);
			}
			setCurrentStep((s) => s + 1);
		}
	}

	function goToPreviousStep() {
		if (currentStep > 1) {
			setCurrentStep((s) => s - 1);
		}
	}

	async function handleEmailStepContinue() {
		const normalizedEmail = email.trim().toLowerCase();
		if (!normalizedEmail || !normalizedEmail.includes("@")) return;

		setIsCheckingEmail(true);
		try {
			const status = await checkExistingRegistration(normalizedEmail);
			setExistingRegistrationStatus(status);

			if (status.has_paid_ticket) {
				return;
			}

			if (status.has_pending_payment) {
				setCurrentStep(5);
				return;
			}

			goToNextStep();
		} catch (error) {
			const message =
				error instanceof Error
					? error.message
					: "Unable to check existing registration";
			toast.error(message);
		} finally {
			setIsCheckingEmail(false);
		}
	}

	function updateAttendee(
		index: number,
		key: keyof AttendeeFormRow,
		value: string,
	) {
		setAttendees((current) => {
			const next = [...current];
			next[index] = { ...next[index], [key]: value };
			return next;
		});
	}

	function removeAttendee(index: number) {
		if (registrationMode === "group" && attendees.length <= minAttendees) {
			return;
		}
		setAttendees((current) => current.filter((_, i) => i !== index));
	}

	function addAttendee() {
		if (!canAddAttendee) return;
		setAttendees((current) => [...current, emptyAttendee(customLabelKeys)]);
	}

	function updateCustomField(index: number, key: string, value: string) {
		setAttendees((current) => {
			const next = [...current];
			next[index] = {
				...next[index],
				custom_fields_data: {
					...next[index].custom_fields_data,
					[key]: value,
				},
			};
			return next;
		});
	}

	function goToConfirmationStep(event: FormEvent) {
		event.preventDefault();
		setCurrentStep(4);
	}

	async function confirmInformation() {
		const payload = {
			attendees: attendees.map(({ row_id, ...attendee }) => attendee),
			selectedTicketTypeId: selectedTicketType?.id,
			leaderEmail: registrationMode === "group" ? email : undefined,
		};

		const success = await submit(payload);
		if (success) {
			setExistingRegistrationStatus(null);
			setPaymentError(null);
			setPaymentSuccess(false);
			setCurrentStep(5);
		}
	}

	async function handleProceedPayment() {
		if (!paymentTicketPublicId) {
			setPaymentError("No pending ticket reference found for payment.");
			return;
		}

		setIsPaymentProcessing(true);
		setPaymentError(null);

		try {
			const order = await createPublicPaymentOrder(eventSlug, {
				ticket_public_id: paymentTicketPublicId,
			});

			if (order.already_paid) {
				setPaymentSuccess(true);
				setCurrentStep(6);
				toast.success("Ticket already paid.");
				setIsPaymentProcessing(false);
				return;
			}

			if (!order.key_id || !order.order_id || !order.amount) {
				throw new Error("Payment order response is incomplete.");
			}

			const isScriptLoaded = await loadRazorpayCheckoutScript();
			if (!isScriptLoaded || !window.Razorpay) {
				throw new Error("Unable to load Razorpay checkout script.");
			}

			const razorpay = new window.Razorpay({
				key: order.key_id,
				amount: order.amount,
				currency: order.currency || "MYR",
				name: eventQuery.data?.title || "Event Registration",
				description: "Ticket payment",
				order_id: order.order_id,
				prefill: {
					email,
					name: attendees[0]?.attendee_name,
					contact: attendees[0]?.attendee_phone,
				},
				handler: async (response: {
					razorpay_order_id: string;
					razorpay_payment_id: string;
					razorpay_signature: string;
				}) => {
					try {
						await verifyPublicPayment(eventSlug, {
							ticket_public_id: paymentTicketPublicId,
							razorpay_order_id: response.razorpay_order_id,
							razorpay_payment_id: response.razorpay_payment_id,
							razorpay_signature: response.razorpay_signature,
						});

						setPaymentSuccess(true);
						setPaymentError(null);
						setCurrentStep(6);
						toast.success("Payment verified successfully.");
					} catch (error) {
						const message =
							error instanceof Error
								? error.message
								: "Payment verification failed.";
						setPaymentError(message);
						toast.error(message);
					} finally {
						setIsPaymentProcessing(false);
					}
				},
				modal: {
					ondismiss: () => {
						setIsPaymentProcessing(false);
					},
				},
			});

			razorpay.open();
		} catch (error) {
			const message =
				error instanceof Error ? error.message : "Unable to start payment.";
			setPaymentError(message);
			toast.error(message);
			setIsPaymentProcessing(false);
		}
	}

	if (loading) {
		return (
			<div className="flex items-center justify-center py-20">
				<div className="h-6 w-6 animate-spin rounded-full border-2 border-black/20 border-t-brand-green" />
			</div>
		);
	}

	if (
		eventQuery.isError ||
		ticketTypesQuery.isError ||
		registrationFormsQuery.isError
	) {
		return (
			<div className="border border-black/20 bg-red-50 p-6 text-red-800 text-sm">
				Unable to load registration settings for this event.
			</div>
		);
	}

	// No ticket types available for this form
	if (ticketTypes.length === 0) {
		return (
			<div className="border-2 border-black bg-white p-8 text-center md:p-10">
				<div className="mx-auto mb-6 flex h-16 w-16 items-center justify-center bg-black/5">
					<Ticket className="h-8 w-8 text-black/40" />
				</div>
				<h2 className="mb-3 font-black text-2xl text-black tracking-tighter">
					FORM NOT AVAILABLE
				</h2>
				<p className="mx-auto mb-6 max-w-md text-black/60">
					This registration form is currently not available.
				</p>
				<p className="text-black/40 text-sm">
					Please contact the event organizer for assistance.
				</p>
			</div>
		);
	}

	const steps = buildPublicRegistrationSteps({
		hasMultipleTicketTypes,
		paymentSuccess,
	});

	const stepIcons = {
		1: Ticket,
		2: Mail,
		3: UserCircle,
		4: Check,
		5: CreditCard,
		6: Check,
	} as const;

	const currentStepIndex = steps.findIndex((s) => s.id === currentStep);
	const connectorProgress =
		steps.length > 1 ? (currentStepIndex / (steps.length - 1)) * 100 : 100;

	return (
		<div className="mx-auto max-w-2xl">
			{/* Stepper */}
			<div className="mb-10 border border-black/10 bg-white/70 px-4 py-4 backdrop-blur-sm sm:px-6">
				<div className="relative mx-auto w-full max-w-[720px]">
					<div className="absolute inset-x-6 top-4 h-[2px] bg-black/15" />
					<motion.div
						className="absolute top-4 left-6 h-[2px] bg-brand-green"
						initial={{ width: 0 }}
						animate={{
							width: `calc((100% - 3rem) * ${connectorProgress / 100})`,
						}}
						transition={{ duration: 0.35, ease: SMOOTH_EASE }}
					/>

					<div className="relative z-10 flex items-start justify-between">
						{steps.map((step, idx) => {
							const Icon = stepIcons[step.id];
							const isActive = step.id === currentStep;
							const isCompleted = currentStepIndex > idx;
							const isUpcoming = !isActive && !isCompleted;

							return (
								<div key={step.id} className="flex flex-col items-center">
									<div className="w-14 text-center sm:w-16 md:w-20">
										<div className="flex justify-center">
											<div
												className={`flex h-9 w-9 shrink-0 items-center justify-center border-2 text-xs transition-all duration-200 ${
													isCompleted
														? "border-brand-green bg-brand-green text-black"
														: isActive
															? "border-black bg-black text-white"
															: "border-black/25 bg-white text-black/50"
												}`}
											>
												{isCompleted ? (
													<Check className="h-4 w-4" />
												) : isUpcoming ? (
													<span className="font-bold">{idx + 1}</span>
												) : (
													<Icon className="h-4 w-4" />
												)}
											</div>
										</div>

										<p
											className={`mt-2 font-semibold text-[11px] uppercase tracking-[0.12em] sm:text-xs ${
												isCompleted || isActive ? "text-black" : "text-black/45"
											}`}
										>
											{step.label}
										</p>
									</div>
								</div>
							);
						})}
					</div>
				</div>
			</div>

			{/* Step content */}
			<AnimatePresence mode="wait">
				{currentStep === 1 && hasMultipleTicketTypes && (
					<motion.div
						key="step1"
						initial={{ opacity: 0, x: 20 }}
						animate={{ opacity: 1, x: 0 }}
						exit={{ opacity: 0, x: -20 }}
						transition={{ duration: 0.3, ease: SMOOTH_EASE }}
						className="border-2 border-black bg-white p-8 md:p-10"
					>
						<h2 className="mb-2 font-black text-2xl text-black tracking-tighter md:text-3xl">
							SELECT TICKET
						</h2>
						<p className="mb-8 text-black/60">
							Choose the ticket type that best suits your needs for this event.
						</p>

						<div className="space-y-3">
							{ticketTypes.map((tt) => {
								const isSelected = selectedTicketTypeId === tt.id;
								return (
									<button
										key={tt.id}
										type="button"
										onClick={() => setSelectedTicketTypeId(tt.id)}
										className={`w-full border-2 p-5 text-left transition-all duration-200 ${
											isSelected
												? "border-black bg-black text-white"
												: "border-black/20 hover:border-black hover:shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]"
										}`}
									>
										<div className="flex items-center justify-between">
											<div>
												<h3 className="font-bold text-lg">{tt.name}</h3>
												<p className="mt-1 text-sm opacity-70">
													{tt.registration_mode === "group"
														? "Group registration"
														: "Individual registration"}
												</p>
											</div>
											<div className="text-right">
												<p className="font-black text-2xl">
													RM {tt.price.toLocaleString()}
												</p>
												{tt.current_tier && (
													<p className="text-xs uppercase tracking-wider opacity-70">
														{tt.current_tier}
													</p>
												)}
											</div>
										</div>
									</button>
								);
							})}
						</div>

						<Button
							onClick={goToNextStep}
							disabled={!canProceedStep1}
							className="mt-8 w-full rounded-none bg-black py-6 font-bold text-white uppercase tracking-[0.15em] hover:bg-black/80 disabled:opacity-50"
						>
							Continue
							<ArrowRight className="ml-2 h-4 w-4" />
						</Button>
					</motion.div>
				)}

				{currentStep === 2 && (
					<motion.div
						key="step2"
						initial={{ opacity: 0, x: 20 }}
						animate={{ opacity: 1, x: 0 }}
						exit={{ opacity: 0, x: -20 }}
						transition={{ duration: 0.3, ease: SMOOTH_EASE }}
						className="border-2 border-black bg-white p-8 md:p-10"
					>
						<h2 className="mb-2 font-black text-2xl text-black tracking-tighter md:text-3xl">
							ENTER EMAIL
						</h2>
						<p className="mb-8 text-black/60">
							We&apos;ll use this to check for any existing registrations and
							send you confirmation details.
						</p>

						<div className="space-y-4">
							<label htmlFor="registration-email" className="block">
								<span className="mb-2 block font-bold text-black/60 text-xs uppercase tracking-wider">
									Email Address
								</span>
								<Input
									id="registration-email"
									type="email"
									placeholder="your@email.com"
									value={email}
									onChange={(e) => setEmail(e.target.value)}
									className="rounded-none border-2 border-black py-6 text-lg focus:border-black focus:ring-2 focus:ring-brand-green"
									autoFocus
								/>
							</label>

							{/* Selected ticket summary */}
							{selectedTicketType && (
								<div className="mt-6 border border-black/10 bg-black/5 p-4">
									<p className="mb-1 font-bold text-black/60 text-xs uppercase tracking-wider">
										Selected Ticket
									</p>
									<p className="font-bold text-black">
										{selectedTicketType.name}
									</p>
									<p className="text-black/70 text-sm">
										RM {selectedTicketType.price.toLocaleString()}
									</p>
								</div>
							)}

							{existingRegistrationStatus?.has_paid_ticket ? (
								<div className="border border-yellow-700/30 bg-yellow-50 p-4 text-yellow-900">
									<p className="font-semibold text-sm">
										We found an existing paid ticket for this email.
									</p>
									<p className="mt-1 text-sm text-yellow-900/80">
										Please check your inbox or contact support if you need help.
									</p>
								</div>
							) : null}

							{existingRegistrationStatus?.has_pending_payment ? (
								<div className="border border-blue-700/30 bg-blue-50 p-4 text-blue-900">
									<p className="font-semibold text-sm">
										Pending registration found for this email.
									</p>
									<p className="mt-1 text-blue-900/80 text-sm">
										We&apos;ll take you directly to payment.
									</p>
								</div>
							) : null}
						</div>

						<div className="mt-8 flex gap-3">
							{hasMultipleTicketTypes && (
								<Button
									onClick={goToPreviousStep}
									variant="outline"
									className="rounded-none border-2 border-black px-6 py-6 hover:bg-black hover:text-white"
								>
									<ArrowLeft className="mr-2 h-4 w-4" />
									Back
								</Button>
							)}
							<Button
								onClick={handleEmailStepContinue}
								disabled={!canProceedStep2 || isCheckingEmail}
								className="flex-1 rounded-none bg-black py-6 font-bold text-white uppercase tracking-[0.15em] hover:bg-black/80 disabled:opacity-50"
							>
								{isCheckingEmail ? "Checking..." : "Continue"}
								<ArrowRight className="ml-2 h-4 w-4" />
							</Button>
						</div>
					</motion.div>
				)}

				{currentStep === 3 && (
					<motion.div
						key="step3"
						initial={{ opacity: 0, x: 20 }}
						animate={{ opacity: 1, x: 0 }}
						exit={{ opacity: 0, x: -20 }}
						transition={{ duration: 0.3, ease: SMOOTH_EASE }}
					>
						<form onSubmit={goToConfirmationStep} className="space-y-6">
							<div className="border-2 border-black bg-white p-8 md:p-10">
								<h2 className="mb-2 font-black text-2xl text-black tracking-tighter md:text-3xl">
									ATTENDEE DETAILS
								</h2>
								<p className="mb-8 text-black/60">
									Please complete all required fields below.
								</p>

								{registrationMode === "group" && (
									<div className="mb-8 border-black border-l-4 bg-brand-blue p-4">
										<p className="font-medium text-black text-sm">
											Group registration: Minimum {minAttendees} attendees
											required
											{maxAttendees ? ` (maximum ${maxAttendees})` : ""}
										</p>
									</div>
								)}

								<div className="space-y-8">
									{attendees.map((attendee, index) => (
										<div key={attendee.row_id}>
											{registrationMode === "group" && (
												<div className="mb-4 flex items-center justify-between border-black/10 border-b pb-2">
													<h3 className="font-bold text-black text-sm uppercase tracking-wider">
														Attendee {index + 1}
													</h3>
													{attendees.length > minAttendees && (
														<Button
															type="button"
															variant="ghost"
															size="sm"
															onClick={() => removeAttendee(index)}
															className="text-red-600 text-xs uppercase tracking-wider hover:text-red-800"
														>
															Remove
														</Button>
													)}
												</div>
											)}

											<div className="space-y-6">
												<div>
													<label
														htmlFor={`attendee-name-${attendee.row_id}`}
														className="mb-2 block font-bold text-black/60 text-xs uppercase tracking-wider"
													>
														Full Name <span className="text-red-600">*</span>
													</label>
													<Input
														id={`attendee-name-${attendee.row_id}`}
														placeholder="e.g. John Doe"
														value={attendee.attendee_name}
														onChange={(e) =>
															updateAttendee(
																index,
																"attendee_name",
																e.target.value,
															)
														}
														className="h-12 rounded-none border-2 border-black text-base placeholder:text-black/30 focus:border-black focus:ring-2 focus:ring-brand-green"
														required
													/>
												</div>

												<div>
													<label
														htmlFor={`attendee-email-${attendee.row_id}`}
														className="mb-2 block font-bold text-black/60 text-xs uppercase tracking-wider"
													>
														Email Address{" "}
														<span className="text-red-600">*</span>
													</label>
													<Input
														id={`attendee-email-${attendee.row_id}`}
														type="email"
														placeholder="e.g. john@company.com"
														value={attendee.attendee_email}
														onChange={(e) =>
															updateAttendee(
																index,
																"attendee_email",
																e.target.value,
															)
														}
														className="h-12 rounded-none border-2 border-black text-base placeholder:text-black/30 focus:border-black focus:ring-2 focus:ring-brand-green"
														required
													/>
												</div>

												<div>
													<label
														htmlFor={`attendee-phone-${attendee.row_id}`}
														className="mb-2 block font-bold text-black/60 text-xs uppercase tracking-wider"
													>
														Phone Number
													</label>
													<Input
														id={`attendee-phone-${attendee.row_id}`}
														placeholder="e.g. +60 12 345 6789"
														value={attendee.attendee_phone}
														onChange={(e) =>
															updateAttendee(
																index,
																"attendee_phone",
																e.target.value,
															)
														}
														className="h-12 rounded-none border-2 border-black text-base placeholder:text-black/30 focus:border-black focus:ring-2 focus:ring-brand-green"
													/>
												</div>

												{customLabelEntries.map(([labelKey, labelName]) => (
													<div key={`${attendee.row_id}-${labelKey}`}>
														<label
															htmlFor={`attendee-${attendee.row_id}-${labelKey}`}
															className="mb-2 block font-bold text-black/60 text-xs uppercase tracking-wider"
														>
															{labelName}
														</label>
														<Input
															id={`attendee-${attendee.row_id}-${labelKey}`}
															placeholder={`e.g. ${labelName}`}
															value={
																attendee.custom_fields_data[labelKey] ?? ""
															}
															onChange={(e) =>
																updateCustomField(
																	index,
																	labelKey,
																	e.target.value,
																)
															}
															className="h-12 rounded-none border-2 border-black text-base placeholder:text-black/30 focus:border-black focus:ring-2 focus:ring-brand-green"
														/>
													</div>
												))}
											</div>

											{registrationMode === "group" &&
												index < attendees.length - 1 && (
													<div className="mt-8 border-black/10 border-b" />
												)}
										</div>
									))}
								</div>

								{registrationMode === "group" && canAddAttendee && (
									<Button
										type="button"
										variant="outline"
										onClick={addAttendee}
										className="mt-8 w-full rounded-none rounded-none border-2 border-black py-5 font-bold uppercase tracking-wider hover:bg-black hover:text-white"
									>
										+ Add Another Attendee
									</Button>
								)}
							</div>

							<div className="flex gap-3">
								<Button
									type="button"
									onClick={goToPreviousStep}
									variant="outline"
									className="rounded-none border-2 border-black px-8 py-6 hover:bg-black hover:text-white"
								>
									<ArrowLeft className="mr-2 h-4 w-4" />
									Back
								</Button>
								<Button
									type="submit"
									disabled={!selectedTicketType}
									className="flex-1 rounded-none border-2 border-black bg-brand-green py-6 font-bold text-black uppercase tracking-[0.15em] hover:bg-brand-green-dark disabled:opacity-50"
								>
									Confirm Registration
									<ArrowRight className="ml-2 h-4 w-4" />
								</Button>
							</div>
						</form>
					</motion.div>
				)}

				{currentStep === 4 && (
					<motion.div
						key="step4"
						initial={{ opacity: 0, x: 20 }}
						animate={{ opacity: 1, x: 0 }}
						exit={{ opacity: 0, x: -20 }}
						transition={{ duration: 0.3, ease: SMOOTH_EASE }}
						className="space-y-6"
					>
						<div className="border-2 border-black bg-white p-8 md:p-10">
							<h2 className="mb-2 font-black text-2xl text-black tracking-tighter md:text-3xl">
								CONFIRM INFORMATION
							</h2>
							<p className="mb-8 text-black/60">
								Please review your registration details before we create your
								pending ticket.
							</p>

							<div className="space-y-5">
								<div className="border border-black/15 bg-black/[0.03] p-4">
									<p className="font-bold text-[11px] text-black/60 uppercase tracking-wider">
										Selected Ticket
									</p>
									<p className="mt-1 font-semibold text-black">
										{selectedTicketType?.name ?? "-"}
									</p>
									<p className="text-black/70 text-sm">
										RM {selectedTicketType?.price?.toLocaleString() ?? "0"}
									</p>
								</div>

								<div className="border border-black/15 p-4">
									<p className="font-bold text-[11px] text-black/60 uppercase tracking-wider">
										Contact Email
									</p>
									<p className="mt-1 text-black">{email}</p>
								</div>

								<div className="border border-black/15 p-4">
									<p className="mb-4 font-bold text-[11px] text-black/60 uppercase tracking-wider">
										Attendee Details
									</p>
									<div className="space-y-4">
										{attendees.map((attendee, index) => (
											<div
												key={attendee.row_id}
												className="border border-black/10 p-3"
											>
												<p className="font-semibold text-black text-sm">
													Attendee {index + 1}: {attendee.attendee_name || "-"}
												</p>
												<p className="text-black/70 text-sm">
													{attendee.attendee_email || "-"}
												</p>
												{attendee.attendee_phone ? (
													<p className="text-black/70 text-sm">
														{attendee.attendee_phone}
													</p>
												) : null}
												{Object.entries(attendee.custom_fields_data).length >
												0 ? (
													<div className="mt-2 space-y-1 text-sm">
														{Object.entries(attendee.custom_fields_data).map(
															([key, value]) => (
																<p key={`${attendee.row_id}-${key}`}>
																	<span className="font-medium text-black/70">
																		{(customLabelsLookup[key] ?? key)
																			.toString()
																			.replaceAll("_", " ")}
																	</span>
																	: {value}
																</p>
															),
														)}
													</div>
												) : null}
											</div>
										))}
									</div>
								</div>
							</div>
						</div>

						<div className="flex gap-3">
							<Button
								type="button"
								onClick={goToPreviousStep}
								variant="outline"
								disabled={isSubmitting}
								className="rounded-none border-2 border-black px-8 py-6 hover:bg-black hover:text-white"
							>
								<ArrowLeft className="mr-2 h-4 w-4" />
								Back
							</Button>
							<Button
								type="button"
								onClick={confirmInformation}
								disabled={isSubmitting || !selectedTicketType}
								className="flex-1 rounded-none border-2 border-black bg-brand-green py-6 font-bold text-black uppercase tracking-[0.15em] hover:bg-brand-green-dark disabled:opacity-50"
							>
								{isSubmitting
									? "Creating Pending Ticket..."
									: "Confirm Information"}
								<ArrowRight className="ml-2 h-4 w-4" />
							</Button>
						</div>
					</motion.div>
				)}

				{currentStep === 5 && (
					<motion.div
						key="step5"
						initial={{ opacity: 0, x: 20 }}
						animate={{ opacity: 1, x: 0 }}
						exit={{ opacity: 0, x: -20 }}
						transition={{ duration: 0.3, ease: SMOOTH_EASE }}
						className="space-y-6"
					>
						<div className="border-2 border-black bg-white p-8 md:p-10">
							<h2 className="mb-2 font-black text-2xl text-black tracking-tighter md:text-3xl">
								PAYMENT
							</h2>
							<p className="mb-6 text-black/60">
								Your ticket has been created with pending status. Next, proceed
								to payment gateway integration.
							</p>

							<div className="space-y-4 border border-black/15 bg-black/[0.03] p-4">
								<p className="font-bold text-[11px] text-black/60 uppercase tracking-wider">
									Registration Status
								</p>
								<p className="font-semibold text-black">
									{existingRegistrationStatus?.has_pending_payment
										? "Pending payment found for this email."
										: (statusMessage ?? "Pending payment")}
								</p>
								{singleResult?.public_id ? (
									<p className="text-black/70 text-sm">
										Ticket Reference: {singleResult.public_id}
									</p>
								) : null}
								{groupResult?.publicIds?.length ? (
									<p className="text-black/70 text-sm">
										Created {groupResult.successCount} pending tickets.
									</p>
								) : null}
								{existingRegistrationStatus?.pending_tickets?.length ? (
									<div className="space-y-1 text-black/70 text-sm">
										<p>Pending references:</p>
										{existingRegistrationStatus.pending_tickets.map(
											(ticket) => (
												<p key={`pending-${ticket.id}`}>{ticket.public_id}</p>
											),
										)}
									</div>
								) : null}
								{paymentError ? (
									<p className="rounded border border-red-300 bg-red-50 px-3 py-2 text-red-700 text-sm">
										{paymentError}
									</p>
								) : null}
								{paymentSuccess ? (
									<p className="rounded border border-green-300 bg-green-50 px-3 py-2 text-green-700 text-sm">
										Payment verified. Your ticket is now purchased.
									</p>
								) : null}
							</div>

							<div className="mt-6 border border-black/30 border-dashed bg-white p-5">
								<p className="font-semibold text-black">
									Razorpay Sandbox (Next)
								</p>
								<p className="mt-1 text-black/60 text-sm">
									Foundation ready. Payment intent and Razorpay checkout wiring
									will be integrated in the next phase.
								</p>
							</div>
						</div>

						<div>
							<Button
								type="button"
								onClick={handleProceedPayment}
								disabled={
									!hasPendingRegistration ||
									!paymentTicketPublicId ||
									isPaymentProcessing ||
									paymentSuccess
								}
								className="w-full rounded-none border-2 border-black bg-black py-6 font-bold text-white uppercase tracking-[0.15em] hover:bg-black/80 disabled:opacity-50"
							>
								{isPaymentProcessing
									? "Opening Razorpay..."
									: paymentSuccess
										? "Payment Completed"
										: "Proceed to Razorpay Sandbox"}
								<CreditCard className="ml-2 h-4 w-4" />
							</Button>
						</div>
					</motion.div>
				)}

				{currentStep === 6 && (
					<motion.div
						key="step6"
						initial={{ opacity: 0, x: 20 }}
						animate={{ opacity: 1, x: 0 }}
						exit={{ opacity: 0, x: -20 }}
						transition={{ duration: 0.3, ease: SMOOTH_EASE }}
						className="space-y-6"
					>
						<div className="border-2 border-black bg-white p-8 md:p-10">
							<h2 className="mb-2 font-black text-2xl text-black tracking-tighter md:text-3xl">
								PAYMENT COMPLETE
							</h2>
							<p className="mb-6 text-black/60">
								Your payment has been verified and your ticket is now marked as
								purchased.
							</p>

							<div className="space-y-4 border border-green-300 bg-green-50 p-4">
								<p className="font-semibold text-green-800">
									Payment successful.
								</p>
								{paymentTicketPublicId ? (
									<p className="text-green-900/80 text-sm">
										Reference: {paymentTicketPublicId}
									</p>
								) : null}
								<p className="text-green-900/80 text-sm">
									A confirmation email will be sent to {email}.
								</p>
							</div>
						</div>
					</motion.div>
				)}
			</AnimatePresence>
		</div>
	);
}
