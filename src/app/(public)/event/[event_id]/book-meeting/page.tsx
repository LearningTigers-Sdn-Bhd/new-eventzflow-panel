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
import { MultiSelectLegacy } from "@/components/ui/multi-select";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { useAuth } from "@/hooks/auth/use-auth"; // Keep useAuth for potential future use or if user logs in mid-flow
import {
	useBusinessHosts,
	useBusinessMatchingEvents,
	useCreatePublicBooking,
	useDetailedSlots,
	useEventAvailability,
	usePublicBookingStatus,
} from "@/hooks/use-business-matching-public";
import { useEventDetails } from "@/hooks/use-event-details"; // Import the new hook
import type { BusinessMatchingEvent } from "@/lib/api/business-matching";
import { PROFILE_TEXT_FIELD_MAX_LENGTH } from "@/lib/constants/business-matching-constants";

interface BookMeetingPageProps {
	params: Promise<{
		event_id: string;
	}>;
}

export default function BookMeetingPage({ params }: BookMeetingPageProps) {
	const { event_id } = use(params);
	const router = useRouter();
	const { user, isAuthenticated, isInitialized } = useAuth();

	// Wizard Step State: 1=User Details, 2=Select Session, 3=Date & Time, 4=Confirm
	const [step, setStep] = useState(1);

	// User Details Form State (Step 1)
	const [name, setName] = useState("");
	const [email, setEmail] = useState("");
	const [phone, setPhone] = useState("");
	const [visitorInterests, setVisitorInterests] = useState<string[]>([]);
	const [description, setDescription] = useState("");
	const [sourcingIntent, setSourcingIntent] = useState("");
	const [capabilities, setCapabilities] = useState("");
	const [expandedHostId, setExpandedHostId] = useState<string | null>(null);

	// Pre-fill user details
	useEffect(() => {
		if (isInitialized && isAuthenticated && user) {
			setName(user.full_name || "");
			setEmail(user.email);
			setPhone(user.phone || "");
		}
	}, [isInitialized, isAuthenticated, user]);

	// Selection State
	const [selectedBmEvent, setSelectedBmEvent] =
		useState<BusinessMatchingEvent | null>(null);
	const [selectedDate, setSelectedDate] = useState<Date | undefined>(undefined);
	const [selectedTime, setSelectedTime] = useState<string | null>(null);

	// Filtering states for hosts list
	const [searchQuery, setSearchQuery] = useState("");
	const [selectedTags, setSelectedTags] = useState<string[]>([]);
	const [sessionPage, setSessionPage] = useState(1);

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

	const { data: bookingStatus, isLoading: isLoadingBookingStatus } =
		usePublicBookingStatus(event_id);

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

		const hostUserId =
			selectedBmEvent.host?.id ||
			(hosts && hosts.length > 0 ? hosts[0].id : "");

		const combinedNote = [
			description ? `Description: ${description}` : "",
			sourcingIntent ? `Sourcing Intent: ${sourcingIntent}` : "",
			capabilities ? `Capabilities: ${capabilities}` : "",
		]
			.filter(Boolean)
			.join("\n\n");

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
					note: combinedNote,
				},
			},
			{
				onSuccess: (booking) => {
					// 'booking' is the data returned from createPublicBooking
					toast.success("Meeting booked successfully!");
					// Redirect to confirmation page with booking ID as query param
					router.push(
						`/event/${event_id}/booking-confirmation?bookingId=${booking.id}&bmEventId=${selectedBmEvent?.id}`,
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

	// Filter and sort sessions/hosts based on search query, selected tag, and similarity to visitorInterests
	const filteredBmEvents = (bmEvents || [])
		.filter((event) => {
			const matchesSearch =
				event.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
				(event.location &&
					event.location.toLowerCase().includes(searchQuery.toLowerCase()));

			const eventTags = (event as any).offering_tags || [];
			const matchesTag =
				selectedTags.length === 0 ||
				eventTags.some((t: string) => selectedTags.includes(t));

			return matchesSearch && matchesTag;
		})
		.map((event) => {
			const eventTags = (event as any).offering_tags || [];
			const matchCount = eventTags.filter((t: string) =>
				visitorInterests.includes(t),
			).length;
			return { event, matchCount };
		})
		.sort((a, b) => b.matchCount - a.matchCount)
		.map((item) => item.event);

	// Get all unique tags from all sessions/hosts
	const allUniqueTags: string[] = Array.from(
		new Set((bmEvents || []).flatMap((e: any) => e.offering_tags || [])),
	);

	// If the current selection is filtered out by search/category changes,
	// clear it — otherwise a stale, no-longer-visible session would still
	// let the user proceed past this step without an actual visible selection.
	useEffect(() => {
		if (
			selectedBmEvent &&
			!filteredBmEvents.some((e) => e.id === selectedBmEvent.id)
		) {
			setSelectedBmEvent(null);
		}
	}, [filteredBmEvents, selectedBmEvent]);

	// Paginate the session list instead of a long scroll when there are many.
	const sessionsPerPage = 8;
	const totalSessionPages = Math.max(
		1,
		Math.ceil(filteredBmEvents.length / sessionsPerPage),
	);
	const paginatedBmEvents = filteredBmEvents.slice(
		(sessionPage - 1) * sessionsPerPage,
		sessionPage * sessionsPerPage,
	);

	// Reset to page 1 whenever the search/category filters change the result set.
	useEffect(() => {
		setSessionPage(1);
	}, [searchQuery, selectedTags]);

	// Clamp if the current page no longer exists (e.g. bmEvents shrank).
	useEffect(() => {
		if (sessionPage > totalSessionPages) {
			setSessionPage(totalSessionPages);
		}
	}, [sessionPage, totalSessionPages]);

	// --- Render Helpers ---
	if (!isInitialized || isLoadingBookingStatus) {
		return (
			<div className="flex min-h-[50vh] items-center justify-center">
				<Loader2 className="h-8 w-8 animate-spin text-primary" />
			</div>
		);
	}

	if (bookingStatus && !bookingStatus.is_open) {
		return (
			<div className="container mx-auto max-w-md px-4 py-20">
				<Card>
					<CardHeader>
						<CardTitle>Booking Closed</CardTitle>
						<CardDescription>
							{eventTitle
								? `Business matching booking for ${eventTitle} is no longer open.`
								: "Business matching booking is no longer open for this event."}
						</CardDescription>
					</CardHeader>
					<CardContent>
						<p className="text-muted-foreground text-sm">
							Please contact the event organizer if you still need to arrange a
							meeting.
						</p>
					</CardContent>
				</Card>
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
							<div className="space-y-1">
								<Label htmlFor="description">
									Company Description / Bio (Optional)
								</Label>
								<textarea
									id="description"
									value={description}
									onChange={(e) => setDescription(e.target.value)}
									placeholder="Tell us about your business or yourself..."
									maxLength={PROFILE_TEXT_FIELD_MAX_LENGTH}
									className="flex min-h-[80px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
								/>
								<span className="block text-right text-muted-foreground text-xs">
									{description.length}/{PROFILE_TEXT_FIELD_MAX_LENGTH}
								</span>
							</div>
							<div className="space-y-1">
								<Label htmlFor="sourcingIntent">
									Sourcing Intent / Needs (Optional)
								</Label>
								<textarea
									id="sourcingIntent"
									value={sourcingIntent}
									onChange={(e) => setSourcingIntent(e.target.value)}
									placeholder="What products, solutions, or partnerships are you looking for?"
									maxLength={PROFILE_TEXT_FIELD_MAX_LENGTH}
									className="flex min-h-[80px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
								/>
								<span className="block text-right text-muted-foreground text-xs">
									{sourcingIntent.length}/{PROFILE_TEXT_FIELD_MAX_LENGTH}
								</span>
							</div>
							<div className="space-y-1">
								<Label htmlFor="capabilities">
									Capabilities / Offerings (Optional)
								</Label>
								<textarea
									id="capabilities"
									value={capabilities}
									onChange={(e) => setCapabilities(e.target.value)}
									placeholder="What products, solutions, or services do you provide?"
									maxLength={PROFILE_TEXT_FIELD_MAX_LENGTH}
									className="flex min-h-[80px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
								/>
								<span className="block text-right text-muted-foreground text-xs">
									{capabilities.length}/{PROFILE_TEXT_FIELD_MAX_LENGTH}
								</span>
							</div>

							<div className="space-y-2 pt-3">
								<Label className="block font-semibold text-foreground text-sm">
									What categories are you looking for? (Optional)
								</Label>
								<span className="-mt-1 block text-muted-foreground text-xs">
									Select matching tags to automatically rank relevant hosts to
									the top of your view!
								</span>
								<div className="flex flex-wrap gap-1.5 pt-1.5">
									{[
										"Fintech Core",
										"Cybersecurity SaaS",
										"Generative AI API",
										"AI Diagnostics",
										"IoT Fleet Tech",
										"No-Code Builder",
										"Pre-Seed Fund",
										"Seed Venture Capital",
										"Series A Equity",
									].map((tag) => {
										const selected = visitorInterests.includes(tag);
										return (
											<Button
												key={tag}
												type="button"
												variant={selected ? "default" : "outline"}
												size="sm"
												onClick={() => {
													setVisitorInterests((prev) =>
														prev.includes(tag)
															? prev.filter((t) => t !== tag)
															: [...prev, tag],
													);
												}}
												className="rounded-full text-xs"
											>
												{tag}
											</Button>
										);
									})}
								</div>
							</div>
						</div>
					</div>
				);

			case 2: // Select Session
				return (
					<div className="space-y-6">
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
							<div className="space-y-4">
								{/* Search & Tag Filters */}
								<div className="space-y-3">
									<Input
										placeholder="Search hosts or companies..."
										value={searchQuery}
										onChange={(e) => setSearchQuery(e.target.value)}
										className="w-full py-5 text-base"
									/>

									{allUniqueTags.length > 0 && (
										<div className="space-y-1">
											<span className="block font-semibold text-muted-foreground text-xs uppercase tracking-wider">
												Filter by Category
											</span>
											<MultiSelectLegacy
												options={allUniqueTags.map((tag) => ({
													label: tag,
													value: tag,
												}))}
												selected={selectedTags}
												onChange={setSelectedTags}
												placeholder="All Categories"
											/>
										</div>
									)}
								</div>

								{filteredBmEvents.length === 0 ? (
									<div className="rounded-lg border border-dashed py-12 text-center text-muted-foreground text-sm">
										No matching sessions found. Try clearing filters.
									</div>
								) : (
									<RadioGroup
										onValueChange={(val) => {
											const selected = bmEvents.find(
												(e) => String(e.id) === String(val),
											);
											setSelectedBmEvent(selected || null);
										}}
										value={
											selectedBmEvent?.id ? String(selectedBmEvent.id) : ""
										}
										className="grid grid-cols-1 gap-2 sm:grid-cols-2"
									>
										{paginatedBmEvents.map((event) => {
											const isSelected = selectedBmEvent?.id === event.id;
											const isExpanded = expandedHostId === event.id;
											const eventTags =
												(event as any).offering_tags ||
												event.host?.offering_tags ||
												[];
											const matchingTags = eventTags.filter((t: string) =>
												visitorInterests.includes(t),
											);

											return (
												<div
													key={event.id}
													onClick={() => {
														const selected = bmEvents.find(
															(e) => String(e.id) === String(event.id),
														);
														setSelectedBmEvent(selected || null);
														setExpandedHostId(isExpanded ? null : event.id);
													}}
													className={`relative flex cursor-pointer flex-col justify-between rounded-xl border p-2.5 transition-all duration-200 hover:shadow-md ${
														isSelected
															? "border-primary bg-primary/5 ring-1 ring-primary"
															: "border-muted bg-card hover:border-muted-foreground/30"
													}`}
												>
													<div className="space-y-1">
														<div className="flex items-start justify-between gap-2">
															<div>
																<div className="font-semibold text-base leading-snug tracking-tight">
																	{event.title}
																</div>
																<div className="font-medium text-primary text-sm">
																	Host:{" "}
																	{event.host?.full_name || "Assigned Host"}
																</div>
															</div>
															<RadioGroupItem
																value={String(event.id)}
																id={`event-${event.id}`}
																checked={isSelected}
																onClick={(e) => {
																	e.stopPropagation();
																	const selected = bmEvents.find(
																		(e) => String(e.id) === String(event.id),
																	);
																	setSelectedBmEvent(selected || null);
																	setExpandedHostId(event.id);
																}}
																className="mt-1 flex-shrink-0"
															/>
														</div>

														<div className="space-y-0.5 text-muted-foreground text-xs">
															<p>📍 {event.location || "Main Hall"}</p>
															<p>⏱️ {event.duration} min sessions</p>
														</div>
													</div>

													<div className="mt-2 space-y-1.5 border-muted/60 border-t pt-2">
														{matchingTags.length > 0 && (
															<span className="inline-flex items-center gap-1 rounded bg-green-500/10 px-2 py-0.5 font-semibold text-[10px] text-green-600">
																✨ {matchingTags.length} Matches Your Interest
															</span>
														)}

														{eventTags.length > 0 && (
															<div className="flex flex-wrap gap-1">
																{eventTags.map((t: string) => {
																	const isMatch = visitorInterests.includes(t);
																	return (
																		<span
																			key={t}
																			className={`rounded border px-1 py-px font-medium text-[9px] ${
																				isMatch
																					? "border-green-200 bg-green-100 text-green-800 dark:border-green-900 dark:bg-green-950 dark:text-green-200"
																					: "border-violet-100 bg-violet-50 text-violet-700 dark:border-violet-900 dark:bg-violet-950 dark:text-violet-200"
																			}`}
																		>
																			{t}
																		</span>
																	);
																})}
															</div>
														)}
													</div>

													{isExpanded && event.host && (
														<div
															onClick={(e) => e.stopPropagation()}
															className="fade-in slide-in-from-top-2 mt-2 animate-in space-y-1.5 border-muted/60 border-t pt-2 text-xs duration-200"
														>
															{event.host.description && (
																<div className="space-y-0.5">
																	<span className="block font-semibold text-[10px] text-muted-foreground uppercase tracking-wider">
																		Description
																	</span>
																	<p className="rounded-lg border border-muted/30 bg-muted/30 p-1.5 text-foreground leading-relaxed">
																		{event.host.description}
																	</p>
																</div>
															)}
															{event.host.sourcing_intent && (
																<div className="space-y-0.5">
																	<span className="block font-semibold text-[10px] text-muted-foreground uppercase tracking-wider">
																		Sourcing Intent
																	</span>
																	<p className="rounded-lg border border-muted/30 bg-muted/30 p-1.5 text-foreground leading-relaxed">
																		{event.host.sourcing_intent}
																	</p>
																</div>
															)}
															{event.host.capabilities && (
																<div className="space-y-0.5">
																	<span className="block font-semibold text-[10px] text-muted-foreground uppercase tracking-wider">
																		Capabilities / Offerings
																	</span>
																	<p className="rounded-lg border border-muted/30 bg-muted/30 p-1.5 text-foreground leading-relaxed">
																		{event.host.capabilities}
																	</p>
																</div>
															)}
															{event.host.interest_tags &&
																event.host.interest_tags.length > 0 && (
																	<div className="space-y-0.5">
																		<span className="block font-semibold text-[10px] text-muted-foreground uppercase tracking-wider">
																			Interests / Looking For
																		</span>
																		<div className="flex flex-wrap gap-1 pt-1">
																			{event.host.interest_tags.map(
																				(tag: string) => (
																					<span
																						key={tag}
																						className="rounded border border-blue-100 bg-blue-50 px-1.5 py-0.5 font-medium text-[9px] text-blue-700 dark:border-blue-900 dark:bg-blue-950 dark:text-blue-200"
																					>
																						{tag}
																					</span>
																				),
																			)}
																		</div>
																	</div>
																)}
														</div>
													)}
												</div>
											);
										})}
									</RadioGroup>
								)}

								{totalSessionPages > 1 && (
									<div className="flex items-center justify-between pt-2">
										<Button
											type="button"
											variant="outline"
											size="sm"
											onClick={() => setSessionPage((p) => Math.max(1, p - 1))}
											disabled={sessionPage === 1}
										>
											<ArrowLeft className="mr-1 h-3.5 w-3.5" /> Previous
										</Button>
										<span className="text-muted-foreground text-xs">
											Page {sessionPage} of {totalSessionPages}
										</span>
										<Button
											type="button"
											variant="outline"
											size="sm"
											onClick={() =>
												setSessionPage((p) =>
													Math.min(totalSessionPages, p + 1),
												)
											}
											disabled={sessionPage === totalSessionPages}
										>
											Next <ArrowRight className="ml-1 h-3.5 w-3.5" />
										</Button>
									</div>
								)}
							</div>
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
				<CardHeader className="gap-0.5">
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
