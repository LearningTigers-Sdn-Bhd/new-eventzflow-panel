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
import { TicketDownloadButton } from "./TicketDownloadButton";
import { TicketVisual } from "./TicketVisual";

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

function formatTicketPrice(price: number | null | undefined) {
	const normalizedPrice = Number(price ?? 0);
	if (normalizedPrice <= 0) return "Free";
	return `RM ${normalizedPrice.toLocaleString()}`;
}

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
	const [finalPaymentStatuses, setFinalPaymentStatuses] = useState<string[]>([]);
	const [finalPublicIds, setFinalPublicIds] = useState<string[]>([]);
	const [hydratedFromCallback, setHydratedFromCallback] = useState(false);

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
	const requiresPayment = (selectedTicketType?.price ?? 0) > 0;
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

	useEffect(() => {
		if (hydratedFromCallback || typeof window === "undefined") return;

		const search = new URLSearchParams(window.location.search);
		const step = search.get("step");
		const callbackEmail = search.get("email");
		const callbackTicket = search.get("ticket");
		const callbackError = search.get("error");

		if (callbackEmail) {
			setEmail(decodeURIComponent(callbackEmail));
		}

		if (callbackTicket) {
			setFinalPublicIds([callbackTicket]);
		}

		if (step === "success") {
			setPaymentSuccess(true);
			setFinalPaymentStatuses(["paid"]);
			setCurrentStep(6);
		} else if (step === "payment") {
			setPaymentSuccess(false);
			if (callbackTicket) {
				setFinalPaymentStatuses(["pending"]);
			}
			setCurrentStep(5);
			if (callbackError) {
				setPaymentError(decodeURIComponent(callbackError));
			}
		}

		setHydratedFromCallback(true);
	}, [hydratedFromCallback]);

	const loading =
		eventQuery.isLoading ||
		ticketTypesQuery.isLoading ||
		registrationFormsQuery.isLoading;

	// Step validation
	const canProceedStep1 = selectedTicketTypeId !== null;
	const canProceedStep1WithAvailability = Boolean(
		selectedTicketTypeId !== null && selectedTicketType?.available,
	);
	const canProceedStep2 = email.trim().length > 0 && email.includes("@");
	const duplicateAttendeeEmailIndexes = useMemo(() => {
		if (registrationMode !== "group" || attendees.length <= 1) {
			return new Set<number>();
		}

		const seen = new Map<string, number[]>();
		const duplicates = new Set<number>();
		attendees.forEach((attendee, index) => {
			const attendeeEmail = attendee.attendee_email.trim().toLowerCase();
			if (!attendeeEmail) return;
			const indexes = seen.get(attendeeEmail) ?? [];
			indexes.push(index);
			seen.set(attendeeEmail, indexes);
		});

		seen.forEach((indexes) => {
			if (indexes.length > 1) {
				indexes.forEach((index) => {
					duplicates.add(index);
				});
			}
		});

		return duplicates;
	}, [attendees, registrationMode]);
	const hasDuplicateAttendeeEmail = duplicateAttendeeEmailIndexes.size > 0;
	const hasPendingRegistration = Boolean(
		singleResult ||
			groupResult ||
			existingRegistrationStatus?.has_pending_payment,
	);
	const hasCompletedFreeSingleRegistration =
		!requiresPayment && finalPaymentStatuses[0] === "paid";
	const hasCompletedFreeGroupRegistration =
		!requiresPayment &&
		Boolean(finalPaymentStatuses.length) &&
		finalPaymentStatuses.every((status) => status === "paid");
	const hasPendingApprovalRegistration =
		!requiresPayment &&
		Boolean(finalPaymentStatuses.length) &&
		finalPaymentStatuses.some((status) => status === "pending");
	const hasCompletedRegistration =
		paymentSuccess ||
		hasCompletedFreeSingleRegistration ||
		hasCompletedFreeGroupRegistration;
	const isExistingPaidRegistration = Boolean(
		existingRegistrationStatus?.has_paid_ticket,
	);

	const paymentTicketPublicId = useMemo(() => {
		if (finalPublicIds.length > 0) return finalPublicIds[0];

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
			// When going to step 3, lock only the first attendee email to step 2 email.
			if (currentStep === 2) {
				setAttendees((current) =>
					current.map((attendee, index) => ({
						...attendee,
						attendee_email: index === 0 ? email : attendee.attendee_email,
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

	function registerWithAnotherEmail() {
		setExistingRegistrationStatus(null);
		setFinalPaymentStatuses([]);
		setFinalPublicIds([]);
		setPaymentSuccess(false);
		setPaymentError(null);
		setCurrentStep(2);
	}

	async function handleEmailStepContinue() {
		const normalizedEmail = email.trim().toLowerCase();
		if (!normalizedEmail || !normalizedEmail.includes("@")) return;

		setIsCheckingEmail(true);
		try {
			const status = await checkExistingRegistration(normalizedEmail);
			setExistingRegistrationStatus(status);

			if (status.blocked_exhibitor_upgrade) {
				return;
			}

			if (status.has_paid_ticket) {
				setFinalPaymentStatuses(
					status.paid_tickets.map((ticket) => ticket.payment_status),
				);
				setFinalPublicIds(
					status.paid_tickets
						.map((ticket) => ticket.public_id)
						.filter((id): id is string => Boolean(id)),
				);
				setCurrentStep(6);
				return;
			}

			if (status.has_rejected_application) {
				return;
			}

			if (status.has_pending_payment) {
				if (requiresPayment) {
					setCurrentStep(5);
				} else {
					setFinalPaymentStatuses(
						status.pending_tickets.map((ticket) => ticket.payment_status),
					);
					setFinalPublicIds(
						status.pending_tickets
							.map((ticket) => ticket.public_id)
							.filter((id): id is string => Boolean(id)),
					);
					setCurrentStep(6);
				}
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
		if (hasDuplicateAttendeeEmail) {
			toast.error("Each attendee must use a unique email address.");
			return;
		}
		setCurrentStep(4);
	}

	async function confirmInformation() {
		const payload = {
			attendees: attendees.map(({ row_id, ...attendee }) => attendee),
			selectedTicketTypeId: selectedTicketType?.id,
			leaderEmail: registrationMode === "group" ? email : undefined,
		};

		const result = await submit(payload);
		if (result.success) {
			setExistingRegistrationStatus(null);
			setPaymentError(null);
			setPaymentSuccess(false);
			setFinalPaymentStatuses(result.paymentStatuses);
			setFinalPublicIds(result.publicIds);
			const allPaid = result.paymentStatuses.length > 0 &&
				result.paymentStatuses.every((status) => status === "paid");
			setCurrentStep(requiresPayment && !allPaid ? 5 : 6);
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
				callback_url: order.callback_url,
				redirect: true,
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
		requiresPayment,
		showCompleteStep:
			currentStep === 6 ||
			hasCompletedRegistration ||
			hasPendingApprovalRegistration,
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
		<div className="mx-auto w-full max-w-2xl">
			{/* Stepper */}
			<div className="mb-8 sm:mb-12">
				<div className="relative mx-auto w-full max-w-[500px]">
					<div className="absolute top-4 right-4 left-4 h-[2px] bg-slate-100 sm:top-5" />
					<motion.div
						className="absolute top-4 left-4 h-[2px] bg-brand-green shadow-[0_0_8px_rgba(34,197,94,0.3)] sm:top-5"
						initial={{ width: 0 }}
						animate={{
							width: `calc((100% - 2rem) * ${connectorProgress / 100})`,
						}}
						transition={{ duration: 0.5, ease: SMOOTH_EASE }}
					/>

					<div className="relative z-10 flex items-start justify-between">
						{steps.map((step, idx) => {
							const Icon = stepIcons[step.id];
							const isActive = step.id === currentStep;
							const isCompleted = currentStepIndex > idx;
							const isUpcoming = !isActive && !isCompleted;

							return (
								<div key={step.id} className="flex flex-col items-center">
									<div className="relative flex flex-col items-center">
										<motion.div
											initial={false}
											animate={{
												backgroundColor: isCompleted
													? "rgb(34, 197, 94)" // brand-green
													: isActive
														? "rgb(0, 0, 0)"
														: "rgb(255, 255, 255)",
												borderColor: isCompleted
													? "rgb(34, 197, 94)"
													: isActive
														? "rgb(0, 0, 0)"
														: "rgb(241, 245, 249)", // slate-100
												color: isCompleted || isActive ? "rgb(255, 255, 255)" : "rgb(148, 163, 184)",
											}}
											className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-full border-2 text-xs transition-shadow duration-200 sm:h-10 sm:w-10 ${
												isActive ? "shadow-lg shadow-black/10 ring-4 ring-white" : ""
											}`}
										>
											{isCompleted ? (
												<Check className="h-4 w-4 sm:h-5 sm:w-5" strokeWidth={3} />
											) : (
												<Icon className="h-4 w-4 sm:h-5 sm:w-5" strokeWidth={isActive ? 2.5 : 2} />
											)}
										</motion.div>

										<motion.p
											animate={{
												color: isActive || isCompleted ? "rgb(0, 0, 0)" : "rgb(148, 163, 184)",
												fontWeight: isActive || isCompleted ? 600 : 400,
											}}
											className="absolute top-10 whitespace-nowrap text-[10px] uppercase tracking-wider sm:top-12 sm:text-[11px]"
										>
											{step.label}
										</motion.p>
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
						initial={{ opacity: 0, y: 10 }}
						animate={{ opacity: 1, y: 0 }}
						exit={{ opacity: 0, y: -10 }}
						transition={{ duration: 0.4, ease: SMOOTH_EASE }}
						className="mt-6 sm:mt-8"
					>
						<div className="text-center">
							<h2 className="font-bold text-xl text-slate-900 tracking-tight sm:text-2xl md:text-3xl">
								Select your ticket
							</h2>
							<p className="mt-2 text-slate-500">
								Choose the best option for your attendance.
							</p>
						</div>

						<div className="mt-6 space-y-3 sm:mt-10 sm:space-y-4">
							{ticketTypes.map((tt) => {
								const isSelected = selectedTicketTypeId === tt.id;
								const isUnavailable = !tt.available;
								return (
									<button
										key={tt.id}
										type="button"
										onClick={() => {
											if (isUnavailable) return;
											setSelectedTicketTypeId(tt.id);
										}}
										disabled={isUnavailable}
										className={`group relative w-full rounded-2xl border-2 p-4 text-left transition-all duration-300 sm:p-6 ${
											isSelected
												? "border-black bg-black text-white shadow-xl shadow-black/10"
												: isUnavailable
													? "cursor-not-allowed border-slate-100 bg-slate-50/50 text-slate-400"
													: "border-slate-100 bg-white hover:border-slate-200 hover:shadow-md"
										}`}
									>
										<div className="flex items-start justify-between">
											<div className="flex-1">
												<div className="flex items-center gap-2">
													<h3 className="font-bold text-base leading-tight sm:text-lg">
														{tt.name}
													</h3>
													{isUnavailable && (
														<span className="rounded-full bg-slate-100 px-2.5 py-0.5 font-medium text-slate-500 text-xs">
															Sold Out
														</span>
													)}
												</div>
												<p className={`mt-1.5 text-sm ${isSelected ? "text-slate-300" : "text-slate-500"}`}>
													{tt.registration_mode === "group"
														? "Ideal for teams and groups"
														: "Single attendee registration"}
												</p>
												
												{(tt.remaining_slots !== null && tt.remaining_slots !== undefined) && (
													<div className="mt-3 flex items-center gap-1.5">
														<div className={`h-1.5 w-1.5 rounded-full ${tt.remaining_slots > 0 ? "bg-brand-green" : "bg-red-400"}`} />
														<p className={`text-xs ${isSelected ? "text-slate-400" : "text-slate-500"}`}>
															{tt.remaining_slots > 0
																? `${tt.remaining_slots} slots remaining`
																: "No slots left"}
														</p>
													</div>
												)}
											</div>
											<div className="ml-4 text-right">
												<p className="font-bold text-xl tracking-tight sm:text-2xl">
													{formatTicketPrice(tt.price)}
												</p>
												{tt.current_tier && (
													<p className={`mt-1 text-[10px] font-bold uppercase tracking-widest ${isSelected ? "text-slate-400" : "text-slate-500"}`}>
														{tt.current_tier}
													</p>
												)}
											</div>
										</div>
										
										{isSelected && (
											<motion.div 
												layoutId="ticket-check"
												className="absolute -top-2 -right-2 flex h-6 w-6 items-center justify-center rounded-full bg-brand-green shadow-sm"
											>
												<Check className="h-4 w-4 text-white" strokeWidth={3} />
											</motion.div>
										)}
									</button>
								);
							})}
						</div>

						<div className="mt-6 sm:mt-10">
							<Button
								onClick={goToNextStep}
								disabled={!canProceedStep1 || !canProceedStep1WithAvailability}
								className="h-12 w-full rounded-xl bg-black px-6 font-bold text-white transition-all hover:bg-slate-800 hover:shadow-lg sm:h-14 sm:px-8 disabled:opacity-30"
							>
								Continue to details
								<ArrowRight className="ml-2 h-5 w-5" />
							</Button>
						</div>
					</motion.div>
				)}

				{currentStep === 2 && (
					<motion.div
						key="step2"
						initial={{ opacity: 0, y: 10 }}
						animate={{ opacity: 1, y: 0 }}
						exit={{ opacity: 0, y: -10 }}
						transition={{ duration: 0.4, ease: SMOOTH_EASE }}
						className="mt-6 sm:mt-8"
					>
						<div className="text-center">
							<h2 className="font-bold text-xl text-slate-900 tracking-tight sm:text-2xl md:text-3xl">
								Enter your email
							</h2>
							<p className="mt-2 text-slate-500">
								We&apos;ll use this to manage your registration.
							</p>
						</div>

						<div className="mt-6 space-y-4 sm:mt-10 sm:space-y-6">
							<div className="space-y-2">
								<label htmlFor="registration-email" className="block font-semibold text-slate-700 text-sm">
									Email Address
								</label>
								<div className="relative">
									<Mail className="absolute top-1/2 left-4 h-5 w-5 -translate-y-1/2 text-slate-400" />
									<Input
										id="registration-email"
										type="email"
										placeholder="name@company.com"
										value={email}
										onChange={(e) => {
											setEmail(e.target.value);
											setExistingRegistrationStatus(null);
										}}
										className="h-12 rounded-xl border-slate-200 bg-slate-50/50 pl-12 text-base transition-all focus:border-brand-green focus:bg-white focus:ring-4 focus:ring-brand-green/10 sm:h-14 sm:text-lg"
										autoFocus
									/>
								</div>
							</div>

							{/* Selected ticket summary */}
							{selectedTicketType && (
								<div className="group flex items-center justify-between rounded-2xl border border-slate-100 bg-slate-50/50 p-4 transition-all hover:bg-slate-50">
									<div className="flex items-center gap-3">
										<div className="flex h-10 w-10 items-center justify-center rounded-xl bg-white shadow-sm">
											<Ticket className="h-5 w-5 text-slate-900" />
										</div>
										<div>
											<p className="text-[10px] font-bold uppercase tracking-widest text-slate-400">
												Selected Ticket
											</p>
											<p className="font-bold text-slate-900">
												{selectedTicketType.name}
											</p>
										</div>
									</div>
									<div className="text-right">
										<p className="font-bold text-slate-900">
											{formatTicketPrice(selectedTicketType.price)}
										</p>
									</div>
								</div>
							)}

							{existingRegistrationStatus?.has_pending_payment ? (
								<motion.div 
									initial={{ opacity: 0, scale: 0.95 }}
									animate={{ opacity: 1, scale: 1 }}
									className="rounded-xl border border-blue-100 bg-blue-50/50 p-4 text-blue-900"
								>
									<p className="flex items-center gap-2 font-semibold text-sm">
										<span className="h-1.5 w-1.5 rounded-full bg-blue-500" />
										Pending registration found
									</p>
									<p className="mt-1 text-blue-800/80 text-sm">
										Taking you directly to payment step.
									</p>
								</motion.div>
							) : null}

							{existingRegistrationStatus?.blocked_exhibitor_upgrade ? (
								<motion.div 
									initial={{ opacity: 0, scale: 0.95 }}
									animate={{ opacity: 1, scale: 1 }}
									className="rounded-xl border border-red-100 bg-red-50/50 p-4 text-red-900"
								>
									<p className="flex items-center gap-2 font-semibold text-sm">
										<span className="h-1.5 w-1.5 rounded-full bg-red-500" />
										Registration blocked
									</p>
									<p className="mt-1 text-red-800/80 text-sm">
										{existingRegistrationStatus.blocked_message ?? "Please complete previous payment first."}
									</p>
								</motion.div>
							) : null}

							{existingRegistrationStatus?.has_rejected_application ? (
								<motion.div 
									initial={{ opacity: 0, scale: 0.95 }}
									animate={{ opacity: 1, scale: 1 }}
									className="rounded-xl border border-red-100 bg-red-50/50 p-4 text-red-900"
								>
									<p className="flex items-center gap-2 font-semibold text-sm">
										<span className="h-1.5 w-1.5 rounded-full bg-red-500" />
										Application not approved
									</p>
									<p className="mt-1 text-red-800/80 text-sm">
										{existingRegistrationStatus.rejected_message ?? "Thank you for your interest."}
									</p>
								</motion.div>
							) : null}
						</div>

						<div className="mt-6 flex flex-col gap-3 sm:mt-10 sm:flex-row">
							{hasMultipleTicketTypes && (
								<Button
									onClick={goToPreviousStep}
									variant="outline"
									className="h-12 w-full rounded-xl border-slate-200 bg-white px-6 font-bold text-slate-700 hover:bg-slate-50 sm:h-14 sm:w-auto sm:px-8"
								>
									<ArrowLeft className="mr-2 h-5 w-5" />
									Back
								</Button>
							)}
							<Button
								onClick={handleEmailStepContinue}
								disabled={
									!canProceedStep2 ||
									isCheckingEmail ||
									Boolean(existingRegistrationStatus?.blocked_exhibitor_upgrade) ||
									Boolean(existingRegistrationStatus?.has_rejected_application)
								}
								className="h-12 flex-1 rounded-xl bg-black px-6 font-bold text-white transition-all hover:bg-slate-800 hover:shadow-lg sm:h-14 sm:px-8 disabled:opacity-30"
							>
								{isCheckingEmail ? "Verifying..." : "Continue"}
								<ArrowRight className="ml-2 h-5 w-5" />
							</Button>
						</div>
					</motion.div>
				)}

				{currentStep === 3 && (
					<motion.div
						key="step3"
						initial={{ opacity: 0, y: 10 }}
						animate={{ opacity: 1, y: 0 }}
						exit={{ opacity: 0, y: -10 }}
						transition={{ duration: 0.4, ease: SMOOTH_EASE }}
						className="mt-6 sm:mt-8"
					>
						<form onSubmit={goToConfirmationStep}>
							<div className="text-center">
								<h2 className="font-bold text-xl text-slate-900 tracking-tight sm:text-2xl md:text-3xl">
									Attendee details
								</h2>
								<p className="mt-2 text-slate-500">
									Please provide information for all attendees.
								</p>
							</div>

							<div className="mt-6 space-y-6 sm:mt-10 sm:space-y-8">
								{registrationMode === "group" && (
									<div className="flex items-center gap-3 rounded-2xl bg-blue-50/50 p-4 text-blue-900 border border-blue-100">
										<div className="flex h-8 w-8 items-center justify-center rounded-lg bg-white shadow-sm">
											<UserCircle className="h-5 w-5 text-blue-600" />
										</div>
										<p className="font-medium text-sm">
											Group registration: {minAttendees} min
											{maxAttendees ? ` / ${maxAttendees} max` : ""} attendees.
										</p>
									</div>
								)}

								<div className="space-y-8 sm:space-y-12">
									{attendees.map((attendee, index) => (
										<div key={attendee.row_id} className="relative">
											<div className="mb-6 flex items-center justify-between">
												<h3 className="flex items-center gap-2 font-bold text-slate-900 uppercase tracking-widest text-xs">
													{registrationMode === "group" && (
														<span className="flex h-5 w-5 items-center justify-center rounded bg-slate-100 text-[10px]">
															{index + 1}
														</span>
													)}
													Attendee Information
												</h3>
												{registrationMode === "group" && attendees.length > minAttendees && (
													<Button
														type="button"
														variant="ghost"
														size="sm"
														onClick={() => removeAttendee(index)}
														className="h-8 rounded-lg text-red-500 hover:bg-red-50 hover:text-red-600"
													>
														Remove
													</Button>
												)}
											</div>

											<div className="grid gap-4 sm:grid-cols-2 sm:gap-6">
												<div className="space-y-2 sm:col-span-2">
													<label
														htmlFor={`attendee-name-${attendee.row_id}`}
														className="block font-semibold text-slate-700 text-sm"
													>
														Full Name <span className="text-red-500">*</span>
													</label>
													<Input
														id={`attendee-name-${attendee.row_id}`}
														placeholder="Enter full name"
														value={attendee.attendee_name}
														onChange={(e) =>
															updateAttendee(
																index,
																"attendee_name",
																e.target.value,
															)
														}
														className="h-12 rounded-xl border-slate-200 bg-slate-50/50 transition-all focus:border-brand-green focus:bg-white focus:ring-4 focus:ring-brand-green/10"
														required
													/>
												</div>

												<div className="space-y-2">
													<label
														htmlFor={`attendee-email-${attendee.row_id}`}
														className="block font-semibold text-slate-700 text-sm"
													>
														Email Address <span className="text-red-500">*</span>
													</label>
													<Input
														id={`attendee-email-${attendee.row_id}`}
														type="email"
														placeholder="email@example.com"
														value={attendee.attendee_email}
														disabled={index === 0}
														readOnly={index === 0}
														onChange={(e) =>
															updateAttendee(
																index,
																"attendee_email",
																e.target.value,
															)
														}
														className="h-12 rounded-xl border-slate-200 bg-slate-50/50 transition-all focus:border-brand-green focus:bg-white focus:ring-4 focus:ring-brand-green/10"
														required
													/>
														{duplicateAttendeeEmailIndexes.has(index) && (
															<p className="text-red-500 text-xs">
																This email is already used by another attendee.
															</p>
														)}
												</div>

												<div className="space-y-2">
													<label
														htmlFor={`attendee-phone-${attendee.row_id}`}
														className="block font-semibold text-slate-700 text-sm"
													>
														Phone Number
													</label>
													<Input
														id={`attendee-phone-${attendee.row_id}`}
														placeholder="+60 12 345 6789"
														value={attendee.attendee_phone}
														onChange={(e) =>
															updateAttendee(
																index,
																"attendee_phone",
																e.target.value,
															)
														}
														className="h-12 rounded-xl border-slate-200 bg-slate-50/50 transition-all focus:border-brand-green focus:bg-white focus:ring-4 focus:ring-brand-green/10"
													/>
												</div>

												{customLabelEntries.map(([labelKey, labelName]) => (
													<div key={`${attendee.row_id}-${labelKey}`} className="space-y-2">
														<label
															htmlFor={`attendee-${attendee.row_id}-${labelKey}`}
															className="block font-semibold text-slate-700 text-sm"
														>
															{labelName}
														</label>
														<Input
															id={`attendee-${attendee.row_id}-${labelKey}`}
															placeholder={`Enter ${labelName.toLowerCase()}`}
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
															className="h-12 rounded-xl border-slate-200 bg-slate-50/50 transition-all focus:border-brand-green focus:bg-white focus:ring-4 focus:ring-brand-green/10"
														/>
													</div>
												))}
											</div>

											{index < attendees.length - 1 && (
												<div className="mt-12 border-t border-slate-100" />
											)}
										</div>
									))}
								</div>

								{registrationMode === "group" && canAddAttendee && (
									<Button
										type="button"
										variant="outline"
										onClick={addAttendee}
										className="w-full h-12 rounded-xl border-dashed border-slate-200 bg-slate-50/50 font-semibold text-slate-600 hover:bg-slate-50 hover:border-slate-300"
									>
										+ Add Another Attendee
									</Button>
								)}
							</div>

							<div className="mt-6 flex flex-col gap-3 sm:mt-10 sm:flex-row">
								<Button
									type="button"
									onClick={goToPreviousStep}
									variant="outline"
									className="h-12 w-full rounded-xl border-slate-200 bg-white px-6 font-bold text-slate-700 hover:bg-slate-50 sm:h-14 sm:w-auto sm:px-8"
								>
									<ArrowLeft className="mr-2 h-5 w-5" />
									Back
								</Button>
								<Button
									type="submit"
									disabled={!selectedTicketType || hasDuplicateAttendeeEmail}
									className="h-12 w-full rounded-xl border border-black bg-black px-6 text-base font-bold leading-none text-white transition-all hover:bg-slate-800 hover:shadow-lg sm:h-14 sm:flex-1 sm:px-8 disabled:opacity-30"
								>
									Confirm Registration
									<ArrowRight className="ml-2 h-5 w-5" />
								</Button>
							</div>
						</form>
					</motion.div>
				)}

				{currentStep === 4 && (
					<motion.div
						key="step4"
						initial={{ opacity: 0, y: 10 }}
						animate={{ opacity: 1, y: 0 }}
						exit={{ opacity: 0, y: -10 }}
						transition={{ duration: 0.4, ease: SMOOTH_EASE }}
						className="mt-6 sm:mt-8"
					>
						<div className="text-center">
							<h2 className="font-bold text-xl text-slate-900 tracking-tight sm:text-2xl md:text-3xl">
								Review information
							</h2>
							<p className="mt-2 text-slate-500">
								Please double-check your details before submitting.
							</p>
						</div>

						<div className="mt-6 space-y-4 sm:mt-10 sm:space-y-6">
							<div className="overflow-hidden rounded-2xl border border-slate-100 bg-white shadow-sm">
								<div className="border-b border-slate-50 bg-slate-50/50 px-4 py-3 sm:px-6 sm:py-4">
									<h3 className="font-bold text-slate-900 text-sm uppercase tracking-wider">
										Registration Summary
									</h3>
								</div>
								
								<div className="divide-y divide-slate-50">
									<div className="p-4 sm:p-6">
										<p className="text-[10px] font-bold uppercase tracking-widest text-slate-500">
											Selected Ticket
										</p>
										<div className="mt-2 flex items-center justify-between">
											<p className="font-bold text-slate-900">
												{selectedTicketType?.name ?? "-"}
											</p>
											<p className="font-bold text-slate-900">
												{formatTicketPrice(selectedTicketType?.price)}
											</p>
										</div>
									</div>

									<div className="p-4 sm:p-6">
										<p className="text-[10px] font-bold uppercase tracking-widest text-slate-500">
											Contact Email
										</p>
										<p className="mt-2 font-medium text-slate-900">{email}</p>
									</div>

									<div className="p-4 sm:p-6">
										<p className="mb-4 text-[10px] font-bold uppercase tracking-widest text-slate-500">
											{registrationMode === "group"
												? `Attendees (${attendees.length})`
												: "Attendee"}
										</p>
										<div className="space-y-4">
											{attendees.map((attendee, index) => (
												<div
													key={attendee.row_id}
													className="rounded-xl border border-slate-100 bg-slate-50/30 p-4"
												>
													<div className="flex items-center gap-3">
														{registrationMode === "group" && (
															<div className="flex h-8 w-8 items-center justify-center rounded-lg bg-white shadow-sm font-bold text-slate-500 text-xs">
																{index + 1}
															</div>
														)}
														<div>
															<p className="font-bold text-slate-900 text-sm">
																{attendee.attendee_name || "-"}
															</p>
															<p className="text-slate-500 text-xs">
																{attendee.attendee_email || "-"}
															</p>
														</div>
													</div>
													
													{(attendee.attendee_phone || Object.entries(attendee.custom_fields_data).length > 0) && (
														<div className="mt-4 grid grid-cols-2 gap-4 border-t border-slate-100 pt-4">
															{attendee.attendee_phone && (
																<div>
																	<p className="text-[10px] font-bold uppercase tracking-widest text-slate-500">Phone</p>
																	<p className="mt-1 text-slate-900 text-xs">{attendee.attendee_phone}</p>
																</div>
															)}
															{Object.entries(attendee.custom_fields_data).map(([key, value]) => (
																<div key={`${attendee.row_id}-${key}`}>
																	<p className="text-[10px] font-bold uppercase tracking-widest text-slate-500">
																		{(customLabelsLookup[key] ?? key).toString().replaceAll("_", " ")}
																	</p>
																	<p className="mt-1 text-slate-900 text-xs">{value || "-"}</p>
																</div>
															))}
														</div>
													)}
												</div>
											))}
										</div>
									</div>
								</div>
							</div>
						</div>

							<div className="mt-6 flex flex-col gap-3 sm:mt-10 sm:flex-row">
							<Button
								type="button"
								onClick={goToPreviousStep}
								variant="outline"
								disabled={isSubmitting}
								className="h-12 w-full rounded-xl border-slate-200 bg-white px-6 font-bold text-slate-700 hover:bg-slate-50 sm:h-14 sm:w-auto sm:px-8"
							>
								<ArrowLeft className="mr-2 h-5 w-5" />
								Back
							</Button>
							<Button
								type="button"
								onClick={confirmInformation}
								disabled={isSubmitting || !selectedTicketType}
								className="h-12 w-full rounded-xl border border-brand-green bg-brand-green px-6 text-base font-bold leading-none text-white shadow-lg shadow-brand-green/20 transition-all hover:bg-brand-green/90 hover:shadow-xl sm:h-14 sm:flex-1 sm:px-8 disabled:opacity-30"
							>
								{isSubmitting
									? "Processing..."
									: "Submit Registration"}
								<ArrowRight className="ml-2 h-5 w-5" strokeWidth={3} />
							</Button>
						</div>
					</motion.div>
				)}

				{currentStep === 5 && requiresPayment && (
					<motion.div
						key="step5"
						initial={{ opacity: 0, y: 10 }}
						animate={{ opacity: 1, y: 0 }}
						exit={{ opacity: 0, y: -10 }}
						transition={{ duration: 0.4, ease: SMOOTH_EASE }}
						className="mt-6 sm:mt-8"
					>
						<div className="text-center">
							<h2 className="font-bold text-xl text-slate-900 tracking-tight sm:text-2xl md:text-3xl">
								Secure payment
							</h2>
							<p className="mt-2 text-slate-500">
								Complete your registration by making a payment.
							</p>
						</div>

						<div className="mt-6 space-y-4 sm:mt-10 sm:space-y-6">
							<div className="rounded-2xl border border-slate-100 bg-white p-4 shadow-sm sm:p-6">
								<div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
									<div className="flex items-center gap-4">
										<div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-brand-green/10">
											<CreditCard className="h-6 w-6 text-brand-green" />
										</div>
										<div>
											<p className="text-[10px] font-bold uppercase tracking-widest text-slate-500">
												Status
											</p>
											<p className="font-bold text-slate-900">
												{existingRegistrationStatus?.has_pending_payment
													? "Complete payment to confirm your ticket"
													: (statusMessage ?? "Please complete payment to secure your ticket.")}
											</p>
										</div>
									</div>
									<div className="text-right">
										<p className="text-[10px] font-bold uppercase tracking-widest text-slate-500">
											Amount
										</p>
										<p className="font-bold text-slate-900 text-xl tracking-tight">
											{formatTicketPrice(selectedTicketType?.price)}
										</p>
									</div>
								</div>

								<div className="mt-6 space-y-3 rounded-xl bg-slate-50 p-4">
									{(singleResult?.public_id || groupResult?.publicIds?.length || existingRegistrationStatus?.pending_tickets?.length) && (
										<div className="flex items-center justify-between text-xs">
											<span className="text-slate-600 font-medium">Reference ID:</span>
											<span className="font-mono font-bold text-slate-900">
												{singleResult?.public_id ?? 
												 (groupResult?.publicIds?.[0]) ?? 
												 (existingRegistrationStatus?.pending_tickets?.[0]?.public_id)}
											</span>
										</div>
									)}
								</div>

								{paymentError && (
									<motion.div 
										initial={{ opacity: 0, height: 0 }}
										animate={{ opacity: 1, height: "auto" }}
										className="mt-4 rounded-xl border border-red-100 bg-red-50 p-3 text-red-600 text-sm"
									>
										{paymentError}
									</motion.div>
								)}
							</div>

							<div className="rounded-2xl border-2 border-dashed border-slate-100 p-6 text-center">
								<p className="text-slate-600 text-sm font-medium">
									Payments are processed securely via Razorpay.
								</p>
							</div>
						</div>

						<div className="mt-10">
							<Button
								type="button"
								onClick={handleProceedPayment}
								disabled={
									!hasPendingRegistration ||
									!paymentTicketPublicId ||
									isPaymentProcessing ||
									paymentSuccess
								}
								className="h-12 w-full rounded-2xl bg-black px-6 font-bold text-white shadow-xl shadow-black/10 transition-all hover:bg-slate-800 hover:shadow-2xl sm:h-16 sm:px-8 disabled:opacity-30"
							>
								{isPaymentProcessing
									? "Initializing..."
									: paymentSuccess
										? "Payment Verified"
										: `Pay ${formatTicketPrice(selectedTicketType?.price)}`}
								<ArrowRight className="ml-2 h-5 w-5" />
							</Button>
						</div>
					</motion.div>
				)}

				{currentStep === 6 && (
					<motion.div
						key="step6"
						initial={{ opacity: 0, scale: 0.95 }}
						animate={{ opacity: 1, scale: 1 }}
						exit={{ opacity: 0, scale: 0.95 }}
						transition={{ duration: 0.5, ease: SMOOTH_EASE }}
						className="mt-6 sm:mt-8"
					>
						<div className="text-center">
							<div className="mx-auto mb-5 flex h-16 w-16 items-center justify-center rounded-full bg-brand-green/10 sm:mb-6 sm:h-20 sm:w-20">
								<motion.div
									initial={{ scale: 0 }}
									animate={{ scale: 1 }}
									transition={{ delay: 0.2, type: "spring", stiffness: 200 }}
								>
									<Check className="h-8 w-8 text-brand-green sm:h-10 sm:w-10" strokeWidth={3} />
								</motion.div>
							</div>
							<h2 className="font-bold text-2xl text-slate-900 tracking-tight sm:text-3xl">
								{isExistingPaidRegistration
									? "You are already registered"
									: requiresPayment
									? "Payment Successful!"
									: hasPendingApprovalRegistration
										? "Registration Received"
										: "Registration Complete!"}
							</h2>
							<p className="mt-3 text-slate-500">
								{isExistingPaidRegistration
									? "We found an existing confirmed ticket for this email."
									: requiresPayment
									? "Your ticket has been purchased and is ready for use."
									: hasPendingApprovalRegistration
										? "We&apos;ve received your application and it&apos;s now pending review."
										: "You are all set! Your registration has been confirmed."}
							</p>
						</div>

						<div className="mt-8">
							<div className="space-y-4 sm:space-y-6">
								<div className="rounded-2xl border border-brand-green/20 bg-brand-green/[0.02] p-4 text-center sm:p-6">
									<p className="text-[10px] font-bold uppercase tracking-widest text-slate-400">
										Registration Reference
									</p>
									<p className="mt-2 font-mono text-lg font-bold text-slate-900">
										{paymentTicketPublicId ?? finalPublicIds[0]}
									</p>
									<p className="mt-6 text-slate-500 text-sm">
										A confirmation email has been sent to <br />
										<span className="font-semibold text-slate-900">{email}</span>
									</p>

									{!hasPendingApprovalRegistration && (
										<div className="mt-8 pt-6 border-t border-slate-100">
											<TicketDownloadButton 
												eventSlug={eventSlug} 
												publicIds={finalPublicIds.length > 0 ? finalPublicIds : (paymentTicketPublicId ? [paymentTicketPublicId] : [])} 
											/>
										</div>
									)}
								</div>

								<div className="flex flex-col gap-3">
									{isExistingPaidRegistration && (
										<Button
											type="button"
											onClick={registerWithAnotherEmail}
											variant="outline"
											className="h-11 rounded-xl border-slate-200 px-4 font-semibold text-slate-700 hover:bg-slate-50"
										>
											Register with another email
										</Button>
									)}
									<p className="text-center text-slate-400 text-xs">
										Need help? Contact the event organizer.
									</p>
								</div>
							</div>
						</div>
					</motion.div>
				)}
			</AnimatePresence>
		</div>
	);
}
