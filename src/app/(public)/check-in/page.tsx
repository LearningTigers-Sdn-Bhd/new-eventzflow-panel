"use client";

import Image from "next/image";
import { useState } from "react";
import { toast } from "sonner";
import {
	CheckInForm,
	type CheckInMethod,
	CheckInMethodSelection,
	CheckInResult,
	type CheckInStep,
	type ResultData,
	TicketConfirmation,
	type TicketData,
	TicketSelection,
} from "@/components/pages/check-in";
import {
	Card,
	CardContent,
	CardDescription,
	CardHeader,
	CardTitle,
} from "@/components/ui/card";
import {
	confirmSelfCheckIn,
	findTicketByContact,
} from "@/lib/api/ticket/endpoints";
import { cleanPhoneNumber, formatWithCountryStyle } from "@/utils/phone";

export default function PublicCheckinPage() {
	const [checkInMethod, setCheckInMethod] = useState<CheckInMethod>(null);
	const [currentStep, setCurrentStep] = useState<CheckInStep>("input");
	const [email, setEmail] = useState("");
	const [phone, setPhone] = useState("");
	const [name, setName] = useState("");
	const [isLoading, setIsLoading] = useState(false);
	const [multipleTickets, setMultipleTickets] = useState<TicketData[]>([]);
	const [ticketData, setTicketData] = useState<TicketData | null>(null);
	const [result, setResult] = useState<ResultData | null>(null);

	const handleTicketSelect = (ticket: TicketData) => {
		setName(ticket.name);

		if (ticket.checkedIn) {
			setResult({
				success: false,
				message: "This ticket has already been checked in.",
				details: {
					name: ticket.name,
					ticketType: ticket.ticketType,
					eventName: ticket.eventName,
				},
			});
			setCurrentStep("result");
			toast.error("Already Checked In", {
				description: "This ticket was already used for check-in.",
			});
		} else {
			setTicketData(ticket);
			setCurrentStep("confirm");
		}
	};

	const handleSubmit = async (e: React.FormEvent) => {
		e.preventDefault();

		// Validation
		if (checkInMethod === "email") {
			if (!email) {
				toast.error("Required Field", {
					description: "Please enter your email address",
				});
				return;
			}
			if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
				toast.error("Invalid Email", {
					description: "Please enter a valid email address",
				});
				return;
			}
		} else if (checkInMethod === "phone") {
			if (!phone) {
				toast.error("Required Field", {
					description: "Please enter your phone number",
				});
				return;
			}
		} else if (checkInMethod === "name") {
			if (!name) {
				toast.error("Required Field", {
					description: "Please enter your name",
				});
				return;
			}
			if (name.trim().length < 2) {
				toast.error("Invalid Name", {
					description: "Please enter at least 2 characters",
				});
				return;
			}
			// If user already selected from dropdown
			if (ticketData && ticketData.name === name) {
				setCurrentStep("confirm");
				return;
			}
		}

		setIsLoading(true);

		try {
			let response;

			if (checkInMethod === "phone") {
				const cleanedPhone = cleanPhoneNumber(phone);
				const formattedPhone = formatWithCountryStyle(phone);

				try {
					response = await findTicketByContact({
						attendee_phone: cleanedPhone,
					});
				} catch (error: any) {
					if (
						error.message?.includes("No ticket found") ||
						error.message?.includes("not found")
					) {
						response = await findTicketByContact({
							attendee_phone: formattedPhone,
						});
					} else {
						throw error;
					}
				}
			} else if (checkInMethod === "email") {
				response = await findTicketByContact({ attendee_email: email });
			} else {
				response = await findTicketByContact({ attendee_name: name.trim() });
			}

			if (Array.isArray(response)) {
				const tickets = response.map((ticket) => ({
					publicId: ticket.publicId,
					name: ticket.name,
					email: ticket.email,
					phone: ticket.phone,
					ticketType: ticket.ticketTypeName,
					eventName: ticket.eventName,
					checkedIn: ticket.checkedIn,
				}));
				setMultipleTickets(tickets);
				setCurrentStep("select");
				toast.info("Multiple Tickets Found", {
					description: `Found ${tickets.length} tickets. Please select yours.`,
				});
			} else {
				if (response.checkedIn) {
					setResult({
						success: false,
						message: "This ticket has already been checked in.",
						details: {
							name: response.name,
							ticketType: response.ticketTypeName,
							eventName: response.eventName,
						},
					});
					setCurrentStep("result");
					toast.error("Already Checked In", {
						description: "This ticket was already used for check-in.",
					});
				} else {
					setTicketData({
						publicId: response.publicId,
						name: response.name,
						email: response.email,
						phone: response.phone,
						ticketType: response.ticketTypeName,
						eventName: response.eventName,
						checkedIn: response.checkedIn,
					});
					setCurrentStep("confirm");
				}
			}
		} catch (error: any) {
			let errorMessage =
				error.message || "Failed to find ticket. Please try again.";

			if (errorMessage.includes("No ticket found")) {
				if (checkInMethod === "email") {
					errorMessage =
						"No ticket found with this email. Try checking in with your phone number or name instead.";
				} else if (checkInMethod === "phone") {
					errorMessage =
						"No ticket found with this phone number. Try checking in with your email or name instead.";
				} else if (checkInMethod === "name") {
					errorMessage =
						"No ticket found with this name. Try checking in with your email or phone number instead.";
				}
			}

			toast.error("Ticket Not Found", { description: errorMessage });
			setResult({ success: false, message: errorMessage });
			setCurrentStep("result");
		} finally {
			setIsLoading(false);
		}
	};

	const handleConfirmCheckIn = async () => {
		if (!ticketData) return;

		setIsLoading(true);

		try {
			const response = await confirmSelfCheckIn(ticketData.publicId);

			setResult({
				success: true,
				message: "Check-in successful!",
				details: {
					name: response.name,
					ticketType: response.ticketTypeName,
					eventName: response.eventName,
				},
			});

			toast.success("Check-in Successful", {
				description: `Welcome, ${response.name}!`,
			});
			setCurrentStep("result");
			setEmail("");
			setPhone("");
			setName("");
		} catch (error: any) {
			const errorMessage =
				error.message || "Failed to check in. Please try again.";

			setResult({ success: false, message: errorMessage });
			toast.error("Check-in Failed", { description: errorMessage });
			setCurrentStep("result");
		} finally {
			setIsLoading(false);
		}
	};

	const handleReset = () => {
		setEmail("");
		setPhone("");
		setName("");
		setResult(null);
		setTicketData(null);
		setMultipleTickets([]);
		setCheckInMethod(null);
		setCurrentStep("input");
	};

	const handleBack = () => {
		if (currentStep === "confirm") {
			if (multipleTickets.length > 0) {
				setCurrentStep("select");
			} else {
				setCurrentStep("input");
			}
			setTicketData(null);
		} else if (currentStep === "select") {
			setCurrentStep("input");
			setMultipleTickets([]);
		} else {
			setCheckInMethod(null);
			setEmail("");
			setPhone("");
			setName("");
		}
	};

	const handleSelectTicket = (ticket: TicketData) => {
		if (ticket.checkedIn) {
			setResult({
				success: false,
				message: "This ticket has already been checked in.",
				details: {
					name: ticket.name,
					ticketType: ticket.ticketType,
					eventName: ticket.eventName,
				},
			});
			setCurrentStep("result");
			toast.error("Already Checked In", {
				description: "This ticket was already used for check-in.",
			});
		} else {
			setTicketData(ticket);
			setCurrentStep("confirm");
		}
	};

	const getStepDescription = () => {
		if (!checkInMethod && currentStep === "input")
			return "Choose your check-in method";
		if (checkInMethod && currentStep === "input")
			return "Enter your details to find your ticket";
		if (currentStep === "select") return "Select your ticket";
		if (currentStep === "confirm") return "Confirm your ticket details";
		if (currentStep === "result") return "Check-in Result";
		return "";
	};

	return (
		<Card className="w-full max-w-md shadow-xl">
			<CardHeader className="space-y-2 pb-4 text-center">
				<div className="-mt-2 flex justify-center">
					<Image
						src="/logo/EzFlow_Logo.png"
						alt="EzFlow Logo"
						width={400}
						height={80}
						className="rounded-lg object-contain"
						priority
					/>
				</div>

				<div className="space-y-2">
					<CardTitle className="bg-gradient-to-r from-gray-900 via-gray-800 to-gray-900 bg-clip-text font-bold text-transparent text-xl tracking-tight sm:text-2xl dark:from-white dark:via-gray-100 dark:to-white">
						Event Check-In
					</CardTitle>
					<div className="mx-auto h-0.5 w-16 rounded-full bg-gradient-to-r from-emerald-500 via-teal-500 to-emerald-500 shadow-sm" />
				</div>

				<CardDescription className="px-4 pt-1 font-medium text-muted-foreground/80 text-sm">
					{getStepDescription()}
				</CardDescription>
			</CardHeader>

			<CardContent className="px-4 pb-3 sm:px-6">
				{currentStep === "result" && result ? (
					<CheckInResult result={result} onReset={handleReset} />
				) : currentStep === "select" && multipleTickets.length > 0 ? (
					<TicketSelection
						tickets={multipleTickets}
						onSelectTicket={handleSelectTicket}
						onBack={handleBack}
					/>
				) : currentStep === "confirm" && ticketData ? (
					<TicketConfirmation
						ticketData={ticketData}
						isLoading={isLoading}
						onConfirm={handleConfirmCheckIn}
						onBack={handleBack}
					/>
				) : !checkInMethod ? (
					<CheckInMethodSelection onSelectMethod={setCheckInMethod} />
				) : (
					<CheckInForm
						checkInMethod={checkInMethod}
						email={email}
						phone={phone}
						name={name}
						isLoading={isLoading}
						onEmailChange={setEmail}
						onPhoneChange={setPhone}
						onNameChange={setName}
						onSubmit={handleSubmit}
						onBack={handleBack}
						onTicketSelect={handleTicketSelect}
					/>
				)}
			</CardContent>
		</Card>
	);
}
