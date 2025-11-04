"use client";

import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { toast } from "sonner";
import { findTicketByContact, confirmSelfCheckIn } from "@/lib/api/ticket/endpoints";
import { cleanPhoneNumber, formatWithCountryStyle } from "@/utils/phone";
import Image from "next/image";
import {
	CheckInMethodSelection,
	CheckInForm,
	TicketConfirmation,
	TicketSelection,
	CheckInResult,
	MissingDataForm,
	RegistrationQR,
	type CheckInMethod,
	type CheckInStep,
	type TicketData,
	type ResultData,
} from "@/components/pages/check-in";

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
	
	// State for collecting missing contact info
	const [missingPhone, setMissingPhone] = useState("");
	const [missingEmail, setMissingEmail] = useState("");

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
			
			// Check if we need to collect missing contact info
			const needsPhone = !ticket.phone;
			const needsEmail = !ticket.email && checkInMethod === "name";

			if (needsPhone || needsEmail) {
				// Redirect to missing data collection step
				setCurrentStep("missing_data");
				toast.info("Additional Information Required", {
					description: needsPhone
						? "We need your phone number to complete check-in"
						: "Please provide your contact information",
				});
			} else {
				setCurrentStep("confirm");
			}
		}
	};

	const handleSubmit = async (e: React.FormEvent) => {
		e.preventDefault();

		// Validation
		if (checkInMethod === "email") {
			if (!email) {
				toast.error("Required Field", { description: "Please enter your email address" });
				return;
			}
			if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
				toast.error("Invalid Email", { description: "Please enter a valid email address" });
				return;
			}
		} else if (checkInMethod === "phone") {
			if (!phone) {
				toast.error("Required Field", { description: "Please enter your phone number" });
				return;
			}
		} else if (checkInMethod === "name") {
			if (!name) {
				toast.error("Required Field", { description: "Please enter your name" });
				return;
			}
			if (name.trim().length < 2) {
				toast.error("Invalid Name", { description: "Please enter at least 2 characters" });
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
					response = await findTicketByContact({ attendee_phone: cleanedPhone });
				} catch (error: any) {
					if (error.message?.includes("No ticket found") || error.message?.includes("not found")) {
						response = await findTicketByContact({ attendee_phone: formattedPhone });
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
					const ticket = {
						publicId: response.publicId,
						name: response.name,
						email: response.email,
						phone: response.phone,
						ticketType: response.ticketTypeName,
						eventName: response.eventName,
						checkedIn: response.checkedIn,
					};
					setTicketData(ticket);

					// Check if we need to collect missing contact info
					const needsPhone = !ticket.phone;
					const needsEmail = !ticket.email && checkInMethod === "name";

					if (needsPhone || needsEmail) {
						// Redirect to missing data collection step
						setCurrentStep("missing_data");
						toast.info("Additional Information Required", {
							description: needsPhone
								? "We need your phone number to complete check-in"
								: "Please provide your contact information",
						});
					} else {
						setCurrentStep("confirm");
					}
				}
			}
		} catch (error: any) {
			let errorMessage = error.message || "Failed to find ticket. Please try again.";

			if (errorMessage.includes("No ticket found")) {
				if (checkInMethod === "email") {
					errorMessage = "No ticket found with this email. Try checking in with your phone number or name instead.";
				} else if (checkInMethod === "phone") {
					errorMessage = "No ticket found with this phone number. Try checking in with your email or name instead.";
				} else if (checkInMethod === "name") {
					errorMessage = "No ticket found with this name. Try checking in with your email or phone number instead.";
				}
			}

			toast.error("Ticket Not Found", { description: errorMessage });
			setResult({ success: false, message: errorMessage });
			setCurrentStep("result");
		} finally {
			setIsLoading(false);
		}
	};

	const handleMissingDataSubmit = async (e: React.FormEvent) => {
		e.preventDefault();

		if (!ticketData) return;

		// Validate phone number if required
		const needsPhone = !ticketData.phone;
		if (needsPhone && !missingPhone) {
			toast.error("Required Field", { description: "Please enter your phone number" });
			return;
		}

		// Move to confirmation step
		setCurrentStep("confirm");
	};

	const handleConfirmCheckIn = async () => {
		if (!ticketData) return;

		setIsLoading(true);

		try {
			// Prepare contact info if we collected any
			const contactInfo: { attendee_phone?: string; attendee_email?: string } = {};
			if (missingPhone) {
				contactInfo.attendee_phone = missingPhone;
			}
			if (missingEmail) {
				contactInfo.attendee_email = missingEmail;
			}

			const response = await confirmSelfCheckIn(
				ticketData.publicId,
				Object.keys(contactInfo).length > 0 ? contactInfo : undefined
			);

			// Use the updated data from response (which includes newly collected contact info)
			setResult({
				success: true,
				message: "Check-in successful!",
				details: {
					name: response.name,
					email: response.email,
					phone: response.phone,
					ticketType: response.ticketTypeName,
					eventName: response.eventName,
				},
			});

			toast.success("Check-in Successful", { description: `Welcome, ${response.name}!` });
			setCurrentStep("result");
			setEmail("");
			setPhone("");
			setName("");
			setMissingPhone("");
			setMissingEmail("");
		} catch (error: any) {
			const errorMessage = error.message || "Failed to check in. Please try again.";

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
		setMissingPhone("");
		setMissingEmail("");
	};

	const handleRegisterClick = () => {
		setCurrentStep("registration");
	};

	const handleBackFromRegistration = () => {
		setCurrentStep("input");
		setCheckInMethod(null);
	};

	const handleBack = () => {
		if (currentStep === "confirm") {
			// Check if we came from missing_data step
			const needsPhone = ticketData && !ticketData.phone;
			const needsEmail = ticketData && !ticketData.email && checkInMethod === "name";
			
			if (needsPhone || needsEmail) {
				setCurrentStep("missing_data");
			} else if (multipleTickets.length > 0) {
				setCurrentStep("select");
			} else {
				setCurrentStep("input");
			}
		} else if (currentStep === "missing_data") {
			// Go back from missing data to previous step
			if (multipleTickets.length > 0) {
				setCurrentStep("select");
			} else {
				setCurrentStep("input");
			}
			setTicketData(null);
			setMissingPhone("");
			setMissingEmail("");
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
			
			// Check if we need to collect missing contact info
			const needsPhone = !ticket.phone;
			const needsEmail = !ticket.email && checkInMethod === "name";

			if (needsPhone || needsEmail) {
				// Redirect to missing data collection step
				setCurrentStep("missing_data");
				toast.info("Additional Information Required", {
					description: needsPhone
						? "We need your phone number to complete check-in"
						: "Please provide your contact information",
				});
			} else {
				setCurrentStep("confirm");
			}
		}
	};

	const getStepTitle = () => {
		if (currentStep === "registration") return "Register for Event";
		return "Event Check-In";
	};

	const getStepDescription = () => {
		if (!checkInMethod && currentStep === "input") return "Choose your check-in method";
		if (checkInMethod && currentStep === "input") return "Enter your details to find your ticket";
		if (currentStep === "select") return "Select your ticket";
		if (currentStep === "missing_data") return "Complete your information";
		if (currentStep === "confirm") return "Confirm your ticket details";
		if (currentStep === "result") return "Check-in Result";
		if (currentStep === "registration") return "Scan the QR code to complete registration";
		return "";
	};

	return (
		<Card className="w-full max-w-md shadow-xl">
			<CardHeader className="text-center space-y-2 pb-4">
				<div className="flex justify-center -mt-2">
					<Image
						src="/logo/EzFlow_Logo.png"
						alt="EzFlow Logo"
						width={400}
						height={80}
						className="object-contain rounded-lg"
						priority
					/>
				</div>

				<div className="space-y-2">
					<CardTitle className="text-xl sm:text-2xl font-bold tracking-tight bg-gradient-to-r from-gray-900 via-gray-800 to-gray-900 dark:from-white dark:via-gray-100 dark:to-white bg-clip-text text-transparent">
						{getStepTitle()}
					</CardTitle>
					<div className="h-0.5 w-16 bg-gradient-to-r from-emerald-500 via-teal-500 to-emerald-500 mx-auto rounded-full shadow-sm" />
				</div>

				<CardDescription className="text-sm text-muted-foreground/80 font-medium px-4 pt-1">
					{getStepDescription()}
				</CardDescription>
			</CardHeader>

			<CardContent className="px-4 sm:px-6 pb-3">
				{currentStep === "registration" ? (
					<RegistrationQR 
						onBack={handleBackFromRegistration}
					/>
				) : currentStep === "result" && result ? (
					<CheckInResult 
						result={result} 
						onReset={handleReset}
						onRegisterClick={handleRegisterClick}
					/>
				) : currentStep === "select" && multipleTickets.length > 0 ? (
					<TicketSelection
						tickets={multipleTickets}
						onSelectTicket={handleSelectTicket}
						onBack={handleBack}
					/>
				) : currentStep === "missing_data" && ticketData ? (
					<MissingDataForm
						ticketData={ticketData}
						phoneValue={missingPhone}
						emailValue={missingEmail}
						onPhoneChange={setMissingPhone}
						onEmailChange={setMissingEmail}
						onSubmit={handleMissingDataSubmit}
						onBack={handleBack}
						isLoading={isLoading}
						requirePhone={!ticketData.phone}
						requireEmail={false}
					/>
				) : currentStep === "confirm" && ticketData ? (
					<TicketConfirmation
						ticketData={ticketData}
						isLoading={isLoading}
						onConfirm={handleConfirmCheckIn}
						onBack={handleBack}
						newPhone={missingPhone}
						newEmail={missingEmail}
					/>
				) : !checkInMethod ? (
					<CheckInMethodSelection 
						onSelectMethod={setCheckInMethod}
						onRegisterClick={handleRegisterClick}
					/>
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
						onRegisterClick={handleRegisterClick}
					/>
				)}
			</CardContent>
		</Card>
	);
}
