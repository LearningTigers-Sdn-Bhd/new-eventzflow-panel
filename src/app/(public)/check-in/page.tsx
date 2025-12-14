"use client";

import { Edit2 } from "lucide-react";
import Image from "next/image";
import { useRouter, useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import {
	CheckInForm,
	type CheckInMethod,
	CheckInMethodSelection,
	CheckInResult,
	type CheckInStep,
	MissingDataForm,
	RegistrationQR,
	type ResultData,
	ScanCheckIn,
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

export default function PublicCheckinPage() {
	const searchParams = useSearchParams();
	const router = useRouter();

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

	// Station management
	const [station, setStation] = useState<string | null>(null);
	const [showStationSelection, setShowStationSelection] = useState(false);

	// Initialize station from URL or localStorage
	useEffect(() => {
		const urlStation = searchParams.get("station");
		const savedStation = localStorage.getItem("checkin_station");

		if (urlStation) {
			// URL parameter takes priority
			setStation(urlStation);
			localStorage.setItem("checkin_station", urlStation);
		} else if (savedStation) {
			// Use saved station and update URL
			setStation(savedStation);
			router.replace(`/check-in?station=${savedStation}`);
		} else {
			// No station set, show selection
			setShowStationSelection(true);
		}
	}, [searchParams, router]);

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
				// Backend now handles phone normalization, just pass the phone as-is
				response = await findTicketByContact({
					attendee_phone: phone,
				});
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

	const handleMissingDataSubmit = async (e: React.FormEvent) => {
		e.preventDefault();

		if (!ticketData) return;

		// No validation - phone and email are optional
		// Move to confirmation step
		setCurrentStep("confirm");
	};

	const handleStationSelect = (stationNumber: string) => {
		setStation(stationNumber);
		localStorage.setItem("checkin_station", stationNumber);
		router.replace(`/check-in?station=${stationNumber}`);
		setShowStationSelection(false);
		toast.success(`Station ${stationNumber} Selected`, {
			description: "You can now start checking in attendees",
		});
	};

	const handleChangeStation = () => {
		setShowStationSelection(true);
		setCheckInMethod(null);
		setCurrentStep("input");
	};

	const handleConfirmCheckIn = async () => {
		if (!ticketData) return;

		setIsLoading(true);

		try {
			// Prepare contact info if we collected any
			const contactInfo: {
				attendee_phone?: string;
				attendee_email?: string;
				check_in_url?: string;
			} = {};
			if (missingPhone) {
				contactInfo.attendee_phone = missingPhone;
			}
			if (missingEmail) {
				contactInfo.attendee_email = missingEmail;
			}
			// Send the full check-in URL with station parameter
			if (station) {
				contactInfo.check_in_url = `${window.location.origin}/check-in?station=${station}`;
			}

			const response = await confirmSelfCheckIn(
				ticketData.publicId,
				Object.keys(contactInfo).length > 0 ? contactInfo : undefined,
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

			toast.success("Check-in Successful", {
				description: `Welcome, ${response.name}!`,
			});
			setCurrentStep("result");
			setEmail("");
			setPhone("");
			setName("");
			setMissingPhone("");
			setMissingEmail("");
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
			const needsEmail =
				ticketData && !ticketData.email && checkInMethod === "name";

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
		if (!checkInMethod && currentStep === "input")
			return "Choose your check-in method";
		if (checkInMethod === "scan" || currentStep === "scan")
			return "Scan your ticket QR code";
		if (checkInMethod && currentStep === "input")
			return "Enter your details to find your ticket";
		if (currentStep === "select") return "Select your ticket";
		if (currentStep === "missing_data") return "Complete your information";
		if (currentStep === "confirm") return "Confirm your ticket details";
		if (currentStep === "result") return "Check-in Result";
		if (currentStep === "registration")
			return "Scan the QR code to complete registration";
		return "";
	};

	// Show station selection if needed
	if (showStationSelection) {
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
							Select Your Station
						</CardTitle>
						<div className="mx-auto h-0.5 w-16 rounded-full bg-gradient-to-r from-emerald-500 via-teal-500 to-emerald-500 shadow-sm" />
					</div>

					<CardDescription className="px-4 pt-1 font-medium text-muted-foreground/80 text-sm">
						Choose which check-in station you are using
					</CardDescription>
				</CardHeader>

				<CardContent className="px-4 pb-6 sm:px-6">
					<div className="grid grid-cols-1 gap-3">
						{["1", "2", "3"].map((stationNum) => (
							<button
								key={stationNum}
								onClick={() => handleStationSelect(stationNum)}
								className="group relative overflow-hidden rounded-lg border-2 border-emerald-200 bg-gradient-to-br from-emerald-50 to-teal-50 p-6 text-center transition-all hover:scale-105 hover:border-emerald-400 hover:shadow-lg active:scale-95 dark:border-emerald-800 dark:from-emerald-950 dark:to-teal-950 dark:hover:border-emerald-600"
							>
								<div className="absolute inset-0 bg-gradient-to-br from-emerald-400/0 to-teal-400/0 transition-all group-hover:from-emerald-400/10 group-hover:to-teal-400/10" />
								<div className="relative flex items-center justify-center gap-3">
									<div className="flex h-12 w-12 items-center justify-center rounded-full bg-emerald-500 font-bold text-white text-xl shadow-lg">
										{stationNum}
									</div>
									<div className="text-left">
										<div className="font-bold text-gray-900 text-lg dark:text-white">
											Station {stationNum}
										</div>
										<div className="text-gray-600 text-sm dark:text-gray-400">
											Printer {stationNum}
										</div>
									</div>
								</div>
							</button>
						))}
					</div>
				</CardContent>
			</Card>
		);
	}

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

				{/* Station Badge */}
				{station && (
					<div className="flex items-center justify-center gap-2 pb-2">
						<div className="inline-flex items-center gap-2 rounded-md bg-emerald-100 px-4 py-1.5 font-semibold text-emerald-700 text-sm dark:bg-emerald-900 dark:text-emerald-300">
							<span className="flex h-2 w-2">
								<span className="absolute inline-flex h-2 w-2 animate-ping rounded-full bg-emerald-400 opacity-75" />
								<span className="relative inline-flex h-2 w-2 rounded-full bg-emerald-500" />
							</span>
							Station {station}
						</div>
						<button
							onClick={handleChangeStation}
							className="inline-flex items-center gap-2 rounded-md bg-primary px-4 py-1.5 font-semibold text-muted text-sm transition-all hover:bg-primary/50 hover:shadow-sm active:scale-95"
						>
							<Edit2 className="h-3.5 w-3.5" />
							Change
						</button>
					</div>
				)}

				<div className="space-y-2">
					<CardTitle className="bg-gradient-to-r from-gray-900 via-gray-800 to-gray-900 bg-clip-text font-bold text-transparent text-xl tracking-tight sm:text-2xl dark:from-white dark:via-gray-100 dark:to-white">
						{getStepTitle()}
					</CardTitle>
					<div className="mx-auto h-0.5 w-16 rounded-full bg-gradient-to-r from-emerald-500 via-teal-500 to-emerald-500 shadow-sm" />
				</div>

				<CardDescription className="px-4 pt-1 font-medium text-muted-foreground/80 text-sm">
					{getStepDescription()}
				</CardDescription>
			</CardHeader>

			<CardContent className="px-4 pb-3 sm:px-6">
				{currentStep === "registration" ? (
					<RegistrationQR onBack={handleBackFromRegistration} />
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
				) : checkInMethod === "scan" ? (
					<ScanCheckIn
						onBack={handleBack}
						onResult={(scanResult) => {
							setResult(scanResult);
							setCurrentStep("result");
						}}
						station={station}
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
