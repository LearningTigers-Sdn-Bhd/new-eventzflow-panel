"use client";

import { format, isSameDay, parse, parseISO } from "date-fns";
import { ArrowLeft, ArrowRight, CheckCircle2, Loader2 } from "lucide-react";
import { useRouter } from "next/navigation";
import { use, useEffect, useState } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import {
	Card,
	CardContent,
	CardDescription,
	CardFooter,
	CardHeader,
	CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { useAuth } from "@/hooks/use-auth"; // Keep useAuth for potential future use or if user logs in mid-flow
import {
	useBusinessHosts,
	useBusinessMatchingEvents,
	useCreatePublicBooking,
	useDetailedSlots,
	useEventAvailability,
} from "@/hooks/use-business-matching-public";
import { useEventDetails } from "@/hooks/use-event-details"; // Import the new hook
import type { BusinessMatchingEvent } from "@/lib/api/business-matching";

interface BookMeetingPageProps {
	params: Promise<{
		event_id: string;
	}>;
}

export default function BookMeetingPage({ params }: BookMeetingPageProps) {
	const { event_id } = use(params);
	const router = useRouter();
	const { user, isAuthenticated, isHydrated } = useAuth();

	// Wizard Step State: 1=User Details, 2=Select Session, 3=Date & Time, 4=Confirm
	const [step, setStep] = useState(1);

	// User Details Form State (Step 1)
	const [name, setName] = useState("");
	const [email, setEmail] = useState("");
	const [phone, setPhone] = useState("");

	// Pre-fill user details
	useEffect(() => {
		if (isHydrated && isAuthenticated && user) {
			setName(user.full_name || "");
			setEmail(user.email);
			setPhone(user.phone || "");
		}
	}, [isHydrated, isAuthenticated, user]);

	// Selection State
	const [selectedBmEvent, setSelectedBmEvent] =
		useState<BusinessMatchingEvent | null>(null);
	const [selectedDate, setSelectedDate] = useState<Date | undefined>(undefined);
	const [selectedTime, setSelectedTime] = useState<string | null>(null);

	// Queries - enabled based on steps
	const {
		data: bmEvents,
		isLoading: isLoadingBmEvents,
		error: bmEventsError,
	} = useBusinessMatchingEvents(event_id, {
		enabled: step >= 1, // Enable from step 1 to fetch event title early
	});

	// Reset selectedBmEvent if bmEvents changes or there's an error
	useEffect(() => {
		if (bmEventsError || !bmEvents || bmEvents.length === 0) {
			setSelectedBmEvent(null);
		}
	}, [bmEvents, bmEventsError]);

	// Fetch main event details for title
	const { data: mainEventDetails } = useEventDetails(event_id, {
		enabled: true, // Always fetch main event details
	});

	// Access event title from mainEventDetails
	const eventTitle = mainEventDetails?.title || ""; // Changed from bmEvents[0].event_title to bmEvents[0].title

	// Fetch hosts in background
	const { data: hosts } = useBusinessHosts(event_id, {
		enabled: step >= 2 && !!selectedBmEvent,
	});

	const {
		data: eventAvailability,
		isLoading: isLoadingAvailability,
		error: availabilityError,
	} = useEventAvailability(selectedBmEvent?.id || "", event_id, {
		enabled: step >= 3 && !!selectedBmEvent,
	});

	const selectedDateStr = selectedDate
		? format(selectedDate, "d MMMM yyyy")
		: "";
	const {
		data: detailedSlotsData,
		isLoading: isLoadingSlots,
		error: slotsError,
	} = useDetailedSlots(selectedBmEvent?.id || "", selectedDateStr, event_id, {
		enabled: step >= 3 && !!selectedBmEvent && !!selectedDate,
	});

	const { mutate: createBooking, isPending: isCreatingBooking } =
		useCreatePublicBooking();

	// Navigation Handlers
	const nextStep = () => setStep((prev) => prev + 1);
	const prevStep = () => {
		setStep((prev) => {
			if (prev === 3) {
				// Going back from "Pick Date & Time"
				setSelectedDate(undefined);
				setSelectedTime(null);
			} else if (prev === 2) {
				// Going back from "Select Session"
				setSelectedBmEvent(null);
			}
			return prev - 1;
		});
	};

	const handleBookMeeting = () => {
		if (
			!name ||
			!email ||
			!phone ||
			!selectedBmEvent ||
			!selectedDate ||
			!selectedTime
		) {
			toast.error("Please fill all required details and make selections.");
			return;
		}

		const hostUserId = hosts && hosts.length > 0 ? hosts[0].id : "";

		createBooking(
			{
				bmEventId: selectedBmEvent.id,
				eventId: event_id,
				hostUserId: hostUserId,
				data: {
					name,
					email,
					phone,
					date: format(selectedDate, "yyyy-MM-dd"),
					time: selectedTime,
				},
			},
			{
				onSuccess: (booking) => {
					// 'booking' is the data returned from createPublicBooking
					toast.success("Meeting booked successfully!");
					// Redirect to confirmation page with booking ID as query param
					router.push(
						`/events/${event_id}/booking-confirmation?bookingId=${booking.id}&bmEventId=${selectedBmEvent?.id}`,
					);
				},
				onError: (error) => {
					toast.error("Failed to book meeting", {
						description: error.message || "An unexpected error occurred.",
					});
				},
			},
		);
	};

	// --- Render Helpers ---
	if (!isHydrated) {
		return (
			<div className="flex min-h-[50vh] items-center justify-center">
				<Loader2 className="h-8 w-8 animate-spin text-primary" />
			</div>
		);
	}

	const renderStepContent = () => {
		switch (step) {
			case 1: // User Details
				return (
					<div className="space-y-4">
						<h2 className="mb-4 font-semibold text-xl">Your Contact Details</h2>
						<div className="space-y-3">
							<div className="space-y-1">
								<Label htmlFor="name">Full Name</Label>
								<Input
									id="name"
									value={name}
									onChange={(e) => setName(e.target.value)}
									required
								/>
							</div>
							<div className="space-y-1">
								<Label htmlFor="email">Email Address</Label>
								<Input
									id="email"
									type="email"
									value={email}
									onChange={(e) => setEmail(e.target.value)}
									required
								/>
							</div>
							<div className="space-y-1">
								<Label htmlFor="phone">Phone Number</Label>
								<Input
									id="phone"
									type="tel"
									value={phone}
									onChange={(e) => setPhone(e.target.value)}
									required
									placeholder="+1234567890"
								/>
							</div>
						</div>
					</div>
				);

			case 2: // Select Session
				return (
					<div className="space-y-6">
						<h2 className="mb-4 font-semibold text-xl">Choose Event Session</h2>
						{isLoadingBmEvents ? (
							<div className="py-10 text-center">
								<div className="flex flex-col items-center gap-2">
									<Loader2 className="h-8 w-8 animate-spin text-primary" />
									<p className="animate-pulse text-muted-foreground">
										Please wait, loading...
									</p>
								</div>
							</div>
						) : bmEventsError ? (
							<div className="text-center text-destructive">
								Error: {bmEventsError.message}
							</div>
						) : !bmEvents || bmEvents.length === 0 ? (
							<div className="py-10 text-center">
								<div className="flex flex-col items-center gap-2">
									<Loader2 className="h-8 w-8 animate-spin text-primary" />
									<p className="animate-pulse text-muted-foreground">
										Please wait, loading events...
									</p>
								</div>
							</div>
						) : (
							<RadioGroup
								onValueChange={(val) => {
									const selected = bmEvents.find(
										(e) => String(e.id) === String(val),
									);
									setSelectedBmEvent(selected || null);
								}}
								value={selectedBmEvent?.id ? String(selectedBmEvent.id) : ""}
								className="grid gap-4"
							>
								{bmEvents.map((event) => (
									<Label
										key={event.id}
										htmlFor={`event-${event.id}`}
										className="flex cursor-pointer items-start space-x-3 rounded-lg border p-4 font-normal hover:bg-muted/50"
									>
										<RadioGroupItem
											value={String(event.id)}
											id={`event-${event.id}`}
											className="mt-1"
										/>
										<div className="flex-1">
											<div className="mb-1 block font-semibold text-lg">
												{event.title}
											</div>
											<p className="text-muted-foreground text-sm">
												Duration: {event.duration} mins • Location:{" "}
												{event.location}
											</p>
										</div>
									</Label>
								))}
							</RadioGroup>
						)}
					</div>
				);

			case 3: // Pick Date & Time
				return (
					<div className="space-y-6">
						<h2 className="mb-4 font-semibold text-xl">Pick Date & Time</h2>
						{isLoadingAvailability ? (
							<div className="py-10 text-center">
								<Loader2 className="mx-auto h-8 w-8 animate-spin" />
							</div>
						) : availabilityError ? (
							<div className="text-center text-destructive">
								Error: {availabilityError.message}
							</div>
						) : (
							<div className="flex flex-col justify-center gap-8 md:flex-row">
								<div className="mx-auto md:mx-0">
									{eventAvailability?.dates?.length === 0 ? (
										<div className="py-10 text-center">
											<div className="flex flex-col items-center gap-2">
												<Loader2 className="h-8 w-8 animate-spin text-primary" />
												<p className="animate-pulse text-muted-foreground">
													Please wait, loading dates...
												</p>
											</div>
										</div>
									) : (
										<Calendar
											mode="single"
											selected={selectedDate}
											onSelect={(date) => {
												setSelectedDate(date);
												setSelectedTime(null);
											}}
											disabled={(day) =>
												!eventAvailability?.dates
													?.map((d) => {
														const parsed = parse(
															d.date,
															"d MMMM yyyy",
															new Date(),
														);
														return Number.isNaN(parsed.getTime())
															? parseISO(d.date)
															: parsed;
													})
													.filter((d) => !Number.isNaN(d.getTime()))
													.some((d) => isSameDay(day, d))
											}
											className="rounded-md border shadow"
										/>
									)}
								</div>
								<div className="flex max-w-sm flex-1 flex-col items-center">
									<h3 className="mb-3 font-semibold">
										{selectedDate
											? `Available Times for ${format(selectedDate, "MMM d, yyyy")}`
											: "Select a date to see times"}
									</h3>
									{selectedDate ? (
										isLoadingSlots ? (
											<div className="flex justify-center py-8">
												<Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
											</div>
										) : slotsError ? (
											<p className="text-destructive text-sm">
												Error loading slots.
											</p>
										) : detailedSlotsData?.slots &&
											detailedSlotsData.slots.length > 0 ? (
											<div className="grid max-h-[300px] grid-cols-2 gap-2 overflow-y-auto pr-2">
												{detailedSlotsData.slots.map((slotItem) => (
													<Button
														key={slotItem.slot}
														variant={
															selectedTime === slotItem.slot
																? "default"
																: "outline"
														}
														onClick={() => setSelectedTime(slotItem.slot)}
														size="sm"
														className="w-full"
													>
														{slotItem.slot}
													</Button>
												))}
											</div>
										) : (
											<div className="flex flex-col items-center gap-2 py-8 text-center">
												<Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
												<p className="animate-pulse text-muted-foreground text-xs">
													Please wait, checking slots...
												</p>
											</div>
										)
									) : (
										<div className="flex h-40 items-center justify-center rounded-md border border-dashed text-muted-foreground text-sm">
											No date selected
										</div>
									)}
								</div>
							</div>
						)}
					</div>
				);
			case 4: // Confirm
				return (
					<div className="space-y-6">
						<div className="space-y-4">
							<p className="text-muted-foreground">
								You are about to book a meeting with{" "}
								<span className="font-semibold text-base text-foreground">
									{selectedBmEvent?.title}
								</span>{" "}
								for the business matching session.
							</p>
						</div>
						<div className="grid grid-cols-1 gap-4 md:grid-cols-3">
							<div className="rounded-lg border p-4">
								<Label className="text-muted-foreground text-sm">Date</Label>
								<p className="font-semibold text-base">
									{selectedDate
										? format(selectedDate, "MMM d, yyyy '('EEEE')'")
										: "N/A"}
								</p>
							</div>
							<div className="rounded-lg border p-4">
								<Label className="text-muted-foreground text-sm">Time</Label>
								<p className="font-semibold text-base">{selectedTime}</p>
							</div>
							<div className="rounded-lg border p-4">
								<Label className="text-muted-foreground text-sm">
									Location
								</Label>
								<p className="font-semibold text-base">
									{selectedBmEvent?.location || "N/A"}
								</p>
							</div>
						</div>
					</div>
				);
			default:
				return null;
		}
	};

	const getStepTitle = () => {
		switch (step) {
			case 1:
				return "Your Details";
			case 2:
				return "Select Session";
			case 3:
				return "Date & Time";
			case 4:
				return "Confirm Your Booking";
			default:
				return "";
		}
	};

	const getStepDescription = () => {
		switch (step) {
			case 1:
				return "Please fill the required details below.";
			case 2:
				return "Choose the business matching session.";
			case 3:
				return "Find a convenient slot.";
			case 4:
				return "Review and finalize.";
			default:
				return "";
		}
	};

	const canProceed = () => {
		if (step === 1) return !!name && !!email && !!phone;
		if (step === 2) return !!selectedBmEvent;
		if (step === 3) return !!selectedDate && !!selectedTime;
		if (step === 4)
			return (
				!!name &&
				!!email &&
				!!phone &&
				!!selectedBmEvent &&
				!!selectedDate &&
				!!selectedTime
			);
		return false;
	};

	const totalSteps = 4;

	return (
		<div className="container mx-auto max-w-3xl p-4 py-10">
			<h1 className="mb-8 text-center font-bold text-3xl">
				Business Matching for {eventTitle}
			</h1>
			<div className="mb-8">
				<div className="mb-2 flex justify-between">
					{[1, 2, 3, 4].map((s) => (
						<div
							key={s}
							className={`flex flex-col items-center ${s <= step ? "text-primary" : "text-muted-foreground"}`}
						>
							<div
								className={`mb-1 flex h-8 w-8 items-center justify-center rounded-full border-2 font-medium text-sm ${
									s < step
										? "border-primary bg-primary text-primary-foreground"
										: s === step
											? "border-primary text-primary"
											: "border-muted"
								}`}
							>
								{s < step ? <CheckCircle2 className="h-5 w-5" /> : s}
							</div>
							<span className="hidden text-xs md:block">
								{s === 1
									? "Details"
									: s === 2
										? "Session"
										: s === 3
											? "Time"
											: "Confirm"}
							</span>
						</div>
					))}
				</div>
				<div className="h-2 overflow-hidden rounded-full bg-muted">
					<div
						className="h-full bg-primary transition-all duration-300 ease-in-out"
						style={{ width: `${((step - 1) / (totalSteps - 1)) * 100}%` }}
					/>
				</div>
			</div>

			<Card className="flex min-h-[400px] flex-col">
				<CardHeader>
					<CardTitle className="text-2xl">{getStepTitle()}</CardTitle>
					<CardDescription>{getStepDescription()}</CardDescription>
				</CardHeader>
				<CardContent className="flex-1">{renderStepContent()}</CardContent>
				<CardFooter className="flex justify-between border-t pt-6">
					<Button
						variant="outline"
						onClick={prevStep}
						disabled={step === 1 || isCreatingBooking}
					>
						<ArrowLeft className="mr-2 h-4 w-4" /> Back
					</Button>

					{step < totalSteps ? (
						<Button onClick={nextStep} disabled={!canProceed()}>
							Next <ArrowRight className="ml-2 h-4 w-4" />
						</Button>
					) : (
						<Button
							onClick={handleBookMeeting}
							disabled={!canProceed() || isCreatingBooking}
						>
							{isCreatingBooking ? (
								<Loader2 className="mr-2 h-4 w-4 animate-spin" />
							) : null}
							Confirm Booking
						</Button>
					)}
				</CardFooter>
			</Card>
		</div>
	);
}
