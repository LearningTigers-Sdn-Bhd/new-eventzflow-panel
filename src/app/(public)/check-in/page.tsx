"use client";

import { useState } from "react";
import { Mail, Phone, CheckCircle2, XCircle, Loader2, ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { findTicketByContact, confirmSelfCheckIn } from "@/lib/api/ticket/endpoints";
import { cleanPhoneNumber, formatWithCountryStyle } from "@/utils/phone";
import Image from "next/image";

type CheckInMethod = "email" | "phone" | null;
type CheckInStep = "input" | "confirm" | "result";

export default function PublicCheckinPage() {
	const [checkInMethod, setCheckInMethod] = useState<CheckInMethod>(null);
	const [currentStep, setCurrentStep] = useState<CheckInStep>("input");
	const [email, setEmail] = useState("");
	const [phone, setPhone] = useState("");
	const [isLoading, setIsLoading] = useState(false);
	const [ticketData, setTicketData] = useState<{
		publicId: string;
		name: string;
		email: string;
		phone?: string;
		ticketType: string;
		eventName: string;
		checkedIn: boolean;
	} | null>(null);
	const [result, setResult] = useState<{
		success: boolean;
		message: string;
		details?: {
			name?: string;
			ticketType?: string;
			eventName?: string;
		};
	} | null>(null);

	// Step 1: Find ticket by contact
	const handleSubmit = async (e: React.FormEvent) => {
		e.preventDefault();
		
		// Validation based on selected method
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
		}

		setIsLoading(true);

		try {
			let response;
			
			// For phone, try multiple formats to match database
			if (checkInMethod === "phone") {
				const cleanedPhone = cleanPhoneNumber(phone);
				const formattedPhone = formatWithCountryStyle(phone);
				
				// Try cleaned version first
				try {
					response = await findTicketByContact({
						attendee_phone: cleanedPhone,
					});
				} catch (error: any) {
					// If not found with cleaned format, try formatted version
					if (error.message?.includes("No ticket found") || error.message?.includes("not found")) {
						response = await findTicketByContact({
							attendee_phone: formattedPhone,
						});
					} else {
						throw error;
					}
				}
			} else {
				// Email method
				response = await findTicketByContact({
					attendee_email: email,
				});
			}

			// Check if already checked in
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
				// Store ticket data and move to confirmation step
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
		} catch (error: any) {
			let errorMessage = error.message || "Failed to find ticket. Please try again.";
			
			// If ticket not found, suggest trying the alternative method
			if (errorMessage.includes("No ticket found")) {
				if (checkInMethod === "email") {
					errorMessage = "No ticket found with this email. Try checking in with your phone number instead.";
				} else if (checkInMethod === "phone") {
					errorMessage = "No ticket found with this phone number. Try checking in with your email instead.";
				}
			}

			toast.error("Ticket Not Found", {
				description: errorMessage,
			});
			
			setResult({
				success: false,
				message: errorMessage,
			});
			setCurrentStep("result");
		} finally {
			setIsLoading(false);
		}
	};

	// Step 2: Confirm check-in
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
			// Clear form after successful check-in
			setEmail("");
			setPhone("");
		} catch (error: any) {
			const errorMessage = error.message || "Failed to check in. Please try again.";
			
			setResult({
				success: false,
				message: errorMessage,
			});

			toast.error("Check-in Failed", {
				description: errorMessage,
			});
			
			setCurrentStep("result");
		} finally {
			setIsLoading(false);
		}
	};

	const handleReset = () => {
		setEmail("");
		setPhone("");
		setResult(null);
		setTicketData(null);
		setCheckInMethod(null);
		setCurrentStep("input");
	};

	const handleBack = () => {
		if (currentStep === "confirm") {
			setCurrentStep("input");
			setTicketData(null);
		} else {
			setCheckInMethod(null);
			setEmail("");
			setPhone("");
		}
	};

	return (
		<Card className="w-full max-w-md shadow-xl">
			<CardHeader className="space-y-2 text-center">
				{/* Logo */}
				<div className="flex justify-center">
					<Image 
						src="/logo/EzFlow_Logo.png" 
						alt="EzFlow Logo" 
						width={400} 
						height={100} 
						className="rounded-lg object-contain"
						priority
					/>
				</div>
				
				{/* Title Section */}
				<div className="space-y-3">
					<CardTitle className="bg-gradient-to-r from-gray-900 via-gray-800 to-gray-900 bg-clip-text font-bold text-2xl text-transparent tracking-tight sm:text-3xl dark:from-white dark:via-gray-100 dark:to-white">
						Event Check-In
					</CardTitle>
					<div className="mx-auto h-1 w-20 rounded-full bg-gradient-to-r from-emerald-500 via-teal-500 to-emerald-500 shadow-sm" />
				</div>
				
				{/* Description */}
				<CardDescription className="px-4 font-medium text-base text-muted-foreground/80">
					{!checkInMethod && currentStep === "input" && "Choose your check-in method"}
					{checkInMethod && currentStep === "input" && "Enter your details to find your ticket"}
					{currentStep === "confirm" && "Confirm your ticket details"}
					{currentStep === "result" && "Check-in Result"}
				</CardDescription>
			</CardHeader>
			<CardContent className="px-4 pb-2 sm:px-6">
				{currentStep === "result" && result ? (
					<div className="space-y-5">
						{/* Result Display */}
						<div
							className={`flex items-start gap-3 rounded-lg border p-5 ${
								result.success
									? "border-emerald-200 bg-emerald-50 dark:border-emerald-800 dark:bg-emerald-950"
									: "border-red-200 bg-red-50 dark:border-red-800 dark:bg-red-950"
							}`}
						>
							{result.success ? (
								<CheckCircle2 className="mt-0.5 h-5 w-5 flex-shrink-0 text-emerald-600 dark:text-emerald-400" />
							) : (
								<XCircle className="mt-0.5 h-5 w-5 flex-shrink-0 text-red-600 dark:text-red-400" />
							)}
							<div className="space-y-1">
								<p
									className={`font-semibold ${
										result.success
											? "text-emerald-900 dark:text-emerald-100"
											: "text-red-900 dark:text-red-100"
									}`}
								>
									{result.message}
								</p>
								{result.success && result.details && (
									<div className="space-y-0.5 text-emerald-700 text-sm dark:text-emerald-300">
										{result.details.name && (
											<p>
												<span className="font-medium">Name:</span>{" "}
												{result.details.name}
											</p>
										)}
										{result.details.ticketType && (
											<p>
												<span className="font-medium">Ticket:</span>{" "}
												{result.details.ticketType}
											</p>
										)}
										{result.details.eventName && (
											<p>
												<span className="font-medium">Event:</span>{" "}
												{result.details.eventName}
											</p>
										)}
									</div>
								)}
							</div>
						</div>

						{/* Check in another attendee */}
						<Button
							onClick={handleReset}
							variant="outline"
							className="mt-1 h-11 w-full"
						>
						Check In Another Attendee
					</Button>
				</div>
			) : currentStep === "confirm" && ticketData ? (
				/* Confirmation Step - Show ticket details and confirm button */
				<div className="space-y-6">
					{/* Ticket Details */}
					<div className="space-y-3 rounded-lg border border-primary/20 bg-primary/5 p-4 sm:p-5">
						<h3 className="font-semibold text-lg">Ticket Found!</h3>
						<div className="space-y-2 text-sm">
							<div className="flex flex-col gap-1 sm:flex-row sm:justify-between">
								<span className="text-muted-foreground">Name:</span>
								<span className="break-words font-medium">{ticketData.name}</span>
							</div>
							<div className="flex flex-col gap-1 sm:flex-row sm:justify-between">
								<span className="text-muted-foreground">Email:</span>
								<span className="break-all text-left font-medium">{ticketData.email}</span>
							</div>
							{ticketData.phone && (
								<div className="flex flex-col gap-1 sm:flex-row sm:justify-between">
									<span className="text-muted-foreground">Phone:</span>
									<span className="break-words font-medium">{ticketData.phone}</span>
								</div>
							)}
							<div className="flex flex-col gap-1 sm:flex-row sm:justify-between">
								<span className="text-muted-foreground">Ticket Type:</span>
								<span className="break-words font-medium">{ticketData.ticketType}</span>
							</div>
							<div className="flex flex-col gap-1 sm:flex-row sm:justify-between">
								<span className="text-muted-foreground">Event:</span>
								<span className="break-words font-medium">{ticketData.eventName}</span>
							</div>
						</div>
					</div>

					<p className="text-center text-muted-foreground text-sm">
						Please confirm this is your ticket to proceed with check-in
					</p>

					{/* Action Buttons */}
					<div className="flex gap-3">
						<Button
							type="button"
							variant="outline"
							onClick={handleBack}
							className="h-11 gap-2 px-6"
							disabled={isLoading}
						>
							<ArrowLeft className="h-4 w-4" />
							Back
						</Button>
						<Button
							onClick={handleConfirmCheckIn}
							className="h-11 flex-1"
							disabled={isLoading}
						>
							{isLoading ? (
								<>
									<Loader2 className="mr-2 h-4 w-4 animate-spin" />
									Checking In...
								</>
							) : (
								"Confirm Check-In"
							)}
						</Button>
					</div>
				</div>
			) : !checkInMethod ? (
					/* Method Selection */
					<div className="space-y-4">
						<Button
							onClick={() => setCheckInMethod("email")}
							variant="outline"
							className="flex h-auto w-full flex-col items-center gap-3 py-8 transition-all hover:border-primary hover:bg-primary/5"
						>
							<Mail className="h-10 w-10 text-primary" />
							<div className="space-y-1.5">
								<p className="font-semibold text-base">Check in with Email</p>
								<p className="text-muted-foreground text-xs">
									Use the email address from your ticket
								</p>
							</div>
						</Button>

						<Button
							onClick={() => setCheckInMethod("phone")}
							variant="outline"
							className="flex h-auto w-full flex-col items-center gap-3 py-8 transition-all hover:border-primary hover:bg-primary/5"
						>
							<Phone className="h-10 w-10 text-primary" />
							<div className="space-y-1.5">
								<p className="font-semibold text-base">Check in with Phone Number</p>
								<p className="text-muted-foreground text-xs">
									Use the phone number from your ticket
								</p>
							</div>
						</Button>

					<div className="border-border/50 border-t pt-4 text-center">
						<p className="text-muted-foreground/70 text-sm tracking-wide">
							<span className="bg-gradient-to-r from-primary to-primary/80 bg-clip-text font-bold text-primary text-transparent">EventzFlow</span>
							{" "}
							<span className="text-muted-foreground/60">by</span>
							{" "}
							<span className="font-semibold text-foreground/80">Sales Chatalyst</span>
						</p>
					</div>
					</div>
				) : (
					/* Input Form */
					<form onSubmit={handleSubmit} className="space-y-6">
						{/* Email Input */}
						{checkInMethod === "email" && (
							<div className="space-y-3">
								<Label htmlFor="email" className="flex items-center gap-2 font-medium text-sm">
									<Mail className="h-4 w-4" />
									Email Address
								</Label>
								<Input
									id="email"
									type="email"
									placeholder="attendee@example.com"
									value={email}
									onChange={(e) => setEmail(e.target.value)}
									disabled={isLoading}
									autoComplete="email"
									autoFocus
									className="h-11"
								/>
								<p className="text-muted-foreground text-xs leading-relaxed">
									Enter the email used during ticket registration
								</p>
							</div>
						)}

						{/* Phone Input */}
						{checkInMethod === "phone" && (
							<div className="space-y-3">
								<Label htmlFor="phone" className="flex items-center gap-2 font-medium text-sm">
									<Phone className="h-4 w-4" />
									Phone Number
								</Label>
								<Input
									id="phone"
									type="tel"
									placeholder="0123456789"
									value={phone}
									onChange={(e) => setPhone(e.target.value)}
									disabled={isLoading}
									autoComplete="tel"
									autoFocus
									className="h-11"
								/>
								<p className="text-muted-foreground text-xs leading-relaxed">
									Enter your phone number in any format - we'll match it automatically
								</p>
							</div>
						)}

						{/* Action Buttons Row */}
						<div className="flex gap-3">
							<Button
								type="button"
								variant="outline"
								onClick={handleBack}
								className="h-11 gap-2 px-6"
								disabled={isLoading}
							>
								<ArrowLeft className="h-4 w-4" />
								Back
							</Button>
						<Button
							type="submit"
							className="h-11 flex-1"
							disabled={isLoading || (checkInMethod === "email" && !email) || (checkInMethod === "phone" && !phone)}
						>
							{isLoading ? (
								<>
									<Loader2 className="mr-2 h-4 w-4 animate-spin" />
									Finding Ticket...
								</>
							) : (
								"Find Ticket"
							)}
						</Button>
						</div>
					</form>
				)}
			</CardContent>
		</Card>
	);
}
