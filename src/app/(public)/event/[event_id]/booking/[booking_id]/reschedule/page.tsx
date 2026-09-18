"use client";

import { useMutation, useQuery } from "@tanstack/react-query";
import { format } from "date-fns";
import {
	ArrowLeft,
	ArrowRight,
	Calendar as CalendarIcon,
	Check,
	CheckCircle2,
	ChevronDown,
	ChevronUp,
	Clock,
	Loader2,
	MapPin,
	RefreshCcw,
	Search,
	ShieldCheck,
	User,
} from "lucide-react";
import { useRouter } from "next/navigation";
import { use, useEffect, useMemo, useState } from "react";
import { toast } from "sonner";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import {
	Card,
	CardContent,
	CardDescription,
	CardHeader,
	CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import {
	useBusinessMatchingEvents,
	useDetailedSlots,
	useEventAvailability,
} from "@/hooks/use-business-matching-public";
import {
	getPublicBookingInfo,
	type PublicBookingInfo,
	rescheduleBooking,
} from "@/lib/api/business-matching";
import {
	formatAvailabilityDate,
	isAvailableDate,
} from "@/lib/business-matching-dates";

interface ReschedulePageProps {
	params: Promise<{ event_id: string; booking_id: string }>;
}

export default function ReschedulePage({ params }: ReschedulePageProps) {
	const { event_id, booking_id } = use(params);
	const router = useRouter();

	const [step, setStep] = useState<1 | 2 | 3>(1);
	const [isChangingHost, setIsChangingHost] = useState(false);
	const [showCurrentHostBio, setShowCurrentHostBio] = useState(false);
	const [pageSize, setPageSize] = useState<number>(5);
	const [selectedBmEventId, setSelectedBmEventId] = useState<string | null>(
		null,
	);
	const [selectedDate, setSelectedDate] = useState<Date | undefined>(undefined);
	const [selectedFormattedDate, setSelectedFormattedDate] = useState<
		string | undefined
	>(undefined);
	const [selectedTime, setSelectedTime] = useState<string | null>(null);
	const [done, setDone] = useState(false);
	const [newDate, setNewDate] = useState("");
	const [newTime, setNewTime] = useState("");
	const [newHostName, setNewHostName] = useState("");
	const [newSessionTitle, setNewSessionTitle] = useState("");

	const [searchQuery, setSearchQuery] = useState("");
	const [sessionPage, setSessionPage] = useState(1);
	const [expandedHostId, setExpandedHostId] = useState<string | null>(null);

	// Fetch the booking info first
	const {
		data: booking,
		isLoading: isLoadingBooking,
		error: bookingError,
	} = useQuery<PublicBookingInfo>({
		queryKey: ["public-booking-info", booking_id],
		queryFn: () => getPublicBookingInfo(booking_id),
		enabled: !!booking_id,
		retry: false,
	});

	// Fetch all business matching sessions for this event
	const { data: bmEvents, isLoading: isLoadingBmEvents } =
		useBusinessMatchingEvents(event_id);

	// Only include sessions that have a business host attached
	const hostSessions = useMemo(() => {
		return (bmEvents || []).filter((event) => event.host?.id);
	}, [bmEvents]);

	// Filter host sessions based on attached host and search query
	const filteredHostSessions = useMemo(() => {
		return hostSessions.filter((session) => {
			const query = searchQuery.toLowerCase().trim();
			if (!query) return true;

			const hostName = (session.host?.full_name || "").toLowerCase();
			const title = (session.title || "").toLowerCase();
			const desc = (session.host?.description || "").toLowerCase();
			const location = (session.location || "").toLowerCase();

			return (
				hostName.includes(query) ||
				title.includes(query) ||
				desc.includes(query) ||
				location.includes(query)
			);
		});
	}, [hostSessions, searchQuery]);

	const totalSessionPages = Math.max(
		1,
		Math.ceil(filteredHostSessions.length / pageSize),
	);
	const paginatedHostSessions = filteredHostSessions.slice(
		(sessionPage - 1) * pageSize,
		sessionPage * pageSize,
	);

	// Effective session ID: user-selected session, defaulting to the booking's session
	const effectiveBmEventId = selectedBmEventId ?? booking?.bm_event_id ?? "";

	const currentSession =
		hostSessions.find((s) => String(s.id) === String(effectiveBmEventId)) ||
		null;

	// Set initial page containing the booking's original host if available
	useEffect(() => {
		if (booking?.bm_event_id && filteredHostSessions.length > 0) {
			const idx = filteredHostSessions.findIndex(
				(s) => String(s.id) === String(booking.bm_event_id),
			);
			if (idx >= 0) {
				setSessionPage(Math.floor(idx / pageSize) + 1);
			}
		}
	}, [booking?.bm_event_id, filteredHostSessions, pageSize]);

	const handleHostChange = (newBmEventId: string) => {
		if (newBmEventId === effectiveBmEventId) return;
		setSelectedBmEventId(newBmEventId);
		setSelectedDate(undefined);
		setSelectedFormattedDate(undefined);
		setSelectedTime(null);
	};

	// Fetch available dates for the selected session
	const { data: availabilityData, isLoading: isLoadingAvailability } =
		useEventAvailability(effectiveBmEventId, event_id, {
			enabled: !!effectiveBmEventId,
		});

	// Fetch time slots for the selected date
	const { data: slotsData, isLoading: isLoadingSlots } = useDetailedSlots(
		effectiveBmEventId,
		selectedFormattedDate ?? "",
		event_id,
		{ enabled: !!effectiveBmEventId && !!selectedFormattedDate },
	);

	// Reschedule mutation
	const { mutate: doReschedule, isPending: isRescheduling } = useMutation({
		mutationFn: ({
			date,
			time,
			bmEventId,
			hostUserId,
		}: {
			date: string;
			time: string;
			bmEventId?: string;
			hostUserId?: string;
		}) =>
			rescheduleBooking(booking_id, date, time, {
				bm_event_id: bmEventId,
				host_user_id: hostUserId,
			}),
		onSuccess: (data) => {
			setNewDate(data.booking_date);
			setNewTime(data.booking_time);
			setNewHostName(
				currentSession?.host?.full_name || booking?.host_name || "",
			);
			setNewSessionTitle(
				data.session_title ||
					currentSession?.title ||
					booking?.session_title ||
					"",
			);
			setDone(true);
			toast.success("Booking rescheduled successfully!");
		},
		onError: (error: Error) => {
			toast.error("Reschedule failed", {
				description:
					error.message ||
					"That slot may already be taken. Please choose another.",
			});
		},
	});

	// Loading state
	if (isLoadingBooking) {
		return (
			<div className="flex min-h-screen items-center justify-center">
				<div className="space-y-3 text-center">
					<Loader2 className="mx-auto h-10 w-10 animate-spin text-primary" />
					<p className="text-muted-foreground text-sm">
						Loading your booking...
					</p>
				</div>
			</div>
		);
	}

	// Error / not found
	if (bookingError || !booking) {
		return (
			<div className="flex min-h-screen items-center justify-center p-4">
				<Card className="w-full max-w-md text-center">
					<CardHeader>
						<CardTitle className="text-2xl text-destructive">
							Booking Not Found
						</CardTitle>
						<CardDescription>
							This booking does not exist or the link is invalid. Please contact
							the event organiser.
						</CardDescription>
					</CardHeader>
					<CardContent>
						<Button variant="outline" onClick={() => router.push("/")}>
							Go Home
						</Button>
					</CardContent>
				</Card>
			</div>
		);
	}

	// Already cancelled
	if (booking.status === "Cancelled") {
		return (
			<div className="flex min-h-screen items-center justify-center p-4">
				<Card className="w-full max-w-md text-center">
					<CardHeader>
						<CardTitle className="text-2xl text-destructive">
							Booking Cancelled
						</CardTitle>
						<CardDescription>
							This booking has been cancelled and cannot be rescheduled.
						</CardDescription>
					</CardHeader>
				</Card>
			</div>
		);
	}

	// Success
	if (done) {
		return (
			<div className="flex min-h-screen items-center justify-center p-4">
				<Card className="w-full max-w-md text-center shadow-lg">
					<CardHeader className="pb-4">
						<CheckCircle2 className="mx-auto mb-3 h-16 w-16 text-green-500" />
						<CardTitle className="font-bold text-2xl">Rescheduled!</CardTitle>
						<CardDescription>
							Your meeting has been moved to a new time.
						</CardDescription>
					</CardHeader>
					<CardContent className="space-y-4">
						<div className="space-y-2 rounded-xl border bg-muted/30 p-4 text-left text-sm">
							<div className="flex justify-between">
								<span className="text-muted-foreground">Host</span>
								<span className="font-medium">
									{newHostName ||
										currentSession?.host?.full_name ||
										booking.host_name ||
										"Assigned Host"}
								</span>
							</div>
							<div className="flex justify-between">
								<span className="text-muted-foreground">Session</span>
								<span className="font-medium">
									{newSessionTitle ||
										currentSession?.title ||
										booking.session_title}
								</span>
							</div>
							<div className="flex justify-between">
								<span className="text-muted-foreground">New Date</span>
								<span className="font-medium">{newDate}</span>
							</div>
							<div className="flex justify-between">
								<span className="text-muted-foreground">New Time</span>
								<span className="font-medium">{newTime}</span>
							</div>
						</div>
						<p className="text-muted-foreground text-sm">
							You may close this tab now.
						</p>
					</CardContent>
				</Card>
			</div>
		);
	}

	const availableDates = availabilityData?.dates ?? [];
	const isHostChanged =
		selectedBmEventId &&
		String(selectedBmEventId) !== String(booking.bm_event_id);

	return (
		<div className="flex min-h-screen flex-col items-center justify-start bg-gradient-to-b from-background to-muted/30 px-3 py-4 sm:px-4 sm:py-6">
			<Card className="w-full max-w-4xl gap-0 py-0 shadow-lg">
				{/* Top Header */}
				<CardHeader className="border-b px-4 pt-4 pb-3 sm:px-6 sm:pt-5 sm:pb-3.5 [.border-b]:pb-3 sm:[.border-b]:pb-3.5">
					<div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
						<div className="flex items-center gap-2.5">
							<div className="rounded-full bg-primary/10 p-2">
								<RefreshCcw className="h-4 w-4 text-primary" />
							</div>
							<div>
								<CardTitle className="text-lg sm:text-xl">
									Reschedule Meeting
								</CardTitle>
								<CardDescription className="text-xs sm:text-sm">
									{step === 1 && "Step 1: Choose or review your business host"}
									{step === 2 &&
										`Step 2: Pick a date and time with ${currentSession?.host?.full_name || currentSession?.title || booking.session_title}`}
									{step === 3 &&
										"Step 3: Review and confirm your new appointment"}
								</CardDescription>
							</div>
						</div>

						{/* 3-Step Wizard Indicator */}
						<div className="flex items-center gap-1.5 text-xs">
							{/* Step 1 button */}
							<button
								type="button"
								onClick={() => setStep(1)}
								className={`flex items-center gap-1 rounded-full px-2.5 py-1 font-medium transition-colors ${
									step === 1
										? "bg-primary text-primary-foreground"
										: "bg-muted text-muted-foreground hover:text-foreground"
								}`}
							>
								{step > 1 ? (
									<Check className="h-3 w-3" />
								) : (
									<span className="font-semibold">1</span>
								)}
								<span>Host</span>
							</button>

							<div className="h-0.5 w-3 bg-muted" />

							{/* Step 2 button */}
							<button
								type="button"
								onClick={() => {
									if (effectiveBmEventId) setStep(2);
								}}
								className={`flex items-center gap-1 rounded-full px-2.5 py-1 font-medium transition-colors ${
									step === 2
										? "bg-primary text-primary-foreground"
										: "bg-muted text-muted-foreground hover:text-foreground"
								}`}
							>
								{step > 2 ? (
									<Check className="h-3 w-3" />
								) : (
									<span className="font-semibold">2</span>
								)}
								<span>Date & Time</span>
							</button>

							<div className="h-0.5 w-3 bg-muted" />

							{/* Step 3 button */}
							<button
								type="button"
								onClick={() => {
									if (selectedDate && selectedTime) setStep(3);
								}}
								disabled={!selectedDate || !selectedTime}
								className={`flex items-center gap-1 rounded-full px-2.5 py-1 font-medium transition-colors disabled:opacity-40 ${
									step === 3
										? "bg-primary text-primary-foreground"
										: "bg-muted text-muted-foreground hover:text-foreground"
								}`}
							>
								<span className="font-semibold">3</span>
								<span>Confirm</span>
							</button>
						</div>
					</div>
				</CardHeader>

				<CardContent className="space-y-4 px-4 pt-3 pb-5 sm:px-6 sm:pt-3.5 sm:pb-6">
					{/* Compact Current booking info banner */}
					<div className="flex flex-col gap-1 rounded-md border border-amber-200 bg-amber-50/90 px-3 py-2 text-amber-900 text-xs sm:flex-row sm:items-center sm:justify-between dark:border-amber-800/80 dark:bg-amber-950/30 dark:text-amber-200">
						<div className="flex flex-wrap items-center gap-1.5">
							<span className="font-semibold text-[10px] text-amber-800 uppercase tracking-wider dark:text-amber-300">
								Current Booking:
							</span>
							<span className="font-medium">
								{booking.booking_date} at {booking.booking_time}
							</span>
						</div>
						<div className="text-amber-800/90 text-xs dark:text-amber-300/90">
							<span>{booking.session_title}</span>
							{booking.host_name && (
								<span>
									{" "}
									• Host:{" "}
									<strong className="font-medium">{booking.host_name}</strong>
								</span>
							)}
						</div>
					</div>

					{/* ========================================================================= */}
					{/* STEP 1: HOST REVIEW & SELECTION */}
					{/* ========================================================================= */}
					{step === 1 && (
						<div className="space-y-4">
							{/* Current / Selected Host Display Card */}
							<div className="space-y-2">
								<div className="flex items-center justify-between">
									<Label className="flex items-center gap-1.5 font-semibold text-sm">
										<User className="h-4 w-4 text-primary" />
										Selected Business Host
									</Label>
									<div className="flex items-center gap-2">
										{isHostChanged && (
											<Button
												type="button"
												variant="ghost"
												size="sm"
												className="h-7 px-2 text-muted-foreground text-xs hover:text-foreground"
												onClick={() => handleHostChange(booking.bm_event_id)}
											>
												Reset to original
											</Button>
										)}
										<Button
											type="button"
											variant={isChangingHost ? "secondary" : "outline"}
											size="sm"
											onClick={() => setIsChangingHost(!isChangingHost)}
											className="h-7 text-xs"
										>
											<RefreshCcw className="mr-1.5 h-3 w-3" />
											{isChangingHost ? "Done Selecting" : "Change Host"}
										</Button>
									</div>
								</div>

								{/* Loading host state */}
								{isLoadingBmEvents ? (
									<div className="flex h-24 items-center justify-center rounded-lg border">
										<Loader2 className="h-5 w-5 animate-spin text-primary" />
										<span className="ml-2 text-muted-foreground text-xs">
											Loading host details...
										</span>
									</div>
								) : currentSession ? (
									/* When selecting a different host (isChangingHost is open), collapse and make smaller */
									isChangingHost ? (
										<div className="flex flex-col gap-2 rounded-lg border-2 border-primary/40 bg-card px-3.5 py-2.5 shadow-xs sm:flex-row sm:items-center sm:justify-between">
											<div className="flex min-w-0 items-center gap-2.5">
												<div className="shrink-0 rounded-full bg-primary/10 p-1.5">
													<User className="h-3.5 w-3.5 text-primary" />
												</div>
												<div className="min-w-0">
													<div className="flex flex-wrap items-center gap-1.5">
														<span className="truncate font-semibold text-foreground text-sm">
															{currentSession.host?.full_name ||
																currentSession.title}
														</span>
														{isHostChanged ? (
															<Badge className="h-4 bg-primary px-1.5 py-0 text-[10px]">
																New Host Selected
															</Badge>
														) : (
															<Badge
																variant="secondary"
																className="h-4 px-1.5 py-0 text-[10px]"
															>
																Current Host
															</Badge>
														)}
													</div>
													<p className="truncate text-muted-foreground text-xs">
														{currentSession.title} • 📍{" "}
														{currentSession.location || "Main Hall"} • ⏱️{" "}
														{currentSession.duration}m
													</p>
												</div>
											</div>
										</div>
									) : (
										/* Standard view when not currently browsing other hosts */
										<div className="rounded-lg border-2 border-primary/40 bg-card p-3.5 shadow-xs">
											<div className="flex flex-col gap-1.5 sm:flex-row sm:items-start sm:justify-between">
												<div className="space-y-0.5">
													<div className="flex flex-wrap items-center gap-2">
														<h3 className="font-bold text-base text-foreground">
															{currentSession.host?.full_name ||
																currentSession.title}
														</h3>
														{isHostChanged ? (
															<Badge className="bg-primary text-[10px]">
																New Host Selected
															</Badge>
														) : (
															<Badge
																variant="secondary"
																className="text-[10px]"
															>
																Current Host
															</Badge>
														)}
													</div>
													<p className="font-medium text-primary text-xs">
														{currentSession.title}
													</p>
													<div className="flex items-center gap-3 text-muted-foreground text-xs">
														<span>
															📍 {currentSession.location || "Main Hall"}
														</span>
														<span>⏱️ {currentSession.duration} mins</span>
													</div>
												</div>

												{currentSession.host && (
													<button
														type="button"
														onClick={() =>
															setShowCurrentHostBio(!showCurrentHostBio)
														}
														className="inline-flex items-center gap-1 self-start font-medium text-primary text-xs hover:underline sm:self-auto"
													>
														{showCurrentHostBio ? (
															<>
																Hide Profile <ChevronUp className="h-3 w-3" />
															</>
														) : (
															<>
																View Profile <ChevronDown className="h-3 w-3" />
															</>
														)}
													</button>
												)}
											</div>

											{/* Expandable bio / profile details */}
											{showCurrentHostBio && currentSession.host && (
												<div className="mt-2.5 space-y-2 border-t pt-2.5 text-xs">
													{currentSession.host.description && (
														<div>
															<span className="font-semibold text-[10px] text-muted-foreground uppercase tracking-wider">
																About / Bio
															</span>
															<p className="mt-0.5 rounded-md bg-muted/40 p-2 text-foreground leading-relaxed">
																{currentSession.host.description}
															</p>
														</div>
													)}
													{currentSession.host.sourcing_intent && (
														<div>
															<span className="font-semibold text-[10px] text-muted-foreground uppercase tracking-wider">
																Sourcing Intent
															</span>
															<p className="mt-0.5 rounded-md bg-muted/40 p-2 text-foreground leading-relaxed">
																{currentSession.host.sourcing_intent}
															</p>
														</div>
													)}
													{currentSession.host.capabilities && (
														<div>
															<span className="font-semibold text-[10px] text-muted-foreground uppercase tracking-wider">
																Capabilities
															</span>
															<p className="mt-0.5 rounded-md bg-muted/40 p-2 text-foreground leading-relaxed">
																{currentSession.host.capabilities}
															</p>
														</div>
													)}
													{currentSession.host.interest_tags &&
														currentSession.host.interest_tags.length > 0 && (
															<div>
																<span className="font-semibold text-[10px] text-muted-foreground uppercase tracking-wider">
																	Interests
																</span>
																<div className="mt-1 flex flex-wrap gap-1">
																	{currentSession.host.interest_tags.map(
																		(tag: string) => (
																			<span
																				key={tag}
																				className="rounded border border-blue-100 bg-blue-50 px-2 py-0.5 font-medium text-[10px] text-blue-700 dark:border-blue-900 dark:bg-blue-950 dark:text-blue-200"
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
									)
								) : (
									<div className="rounded-lg border border-dashed p-4 text-center text-muted-foreground text-xs">
										No host attached.
									</div>
								)}
							</div>

							{/* Directory list when Change Host is toggled */}
							{isChangingHost && (
								<div className="fade-in slide-in-from-top-2 animate-in space-y-3 rounded-lg border bg-muted/20 p-3 duration-200">
									<div className="flex flex-col gap-0.5 sm:flex-row sm:items-center sm:justify-between">
										<h4 className="font-semibold text-foreground text-xs sm:text-sm">
											Available Business Hosts
										</h4>
										<span className="text-muted-foreground text-xs">
											Click a card to select host
										</span>
									</div>

									{/* Search input */}
									<div className="relative">
										<Search className="absolute top-1/2 left-3 h-3.5 w-3.5 -translate-y-1/2 text-muted-foreground" />
										<Input
											placeholder="Search hosts, companies, or topics..."
											value={searchQuery}
											onChange={(e) => {
												setSearchQuery(e.target.value);
												setSessionPage(1);
											}}
											className="h-9 bg-background pl-8 text-xs sm:text-sm"
										/>
									</div>

									{/* Host cards */}
									{filteredHostSessions.length === 0 ? (
										<div className="rounded-lg border border-dashed py-6 text-center text-muted-foreground text-xs">
											No matching hosts found.
										</div>
									) : (
										<RadioGroup
											value={String(effectiveBmEventId)}
											onValueChange={handleHostChange}
											className="grid grid-cols-1 gap-2.5 sm:grid-cols-2"
										>
											{paginatedHostSessions.map((session) => {
												const isSelected =
													String(session.id) === String(effectiveBmEventId);
												const isExpanded = expandedHostId === session.id;
												const isOriginalHost =
													String(session.id) === String(booking.bm_event_id);
												const sessionTags =
													session.offering_tags ||
													session.host?.offering_tags ||
													[];

												return (
													/* biome-ignore lint/a11y/useKeyWithClickEvents: Card click selects session */
													/* biome-ignore lint/a11y/noStaticElementInteractions: Card click selects session */
													<div
														key={session.id}
														onClick={() => {
															handleHostChange(String(session.id));
															setExpandedHostId(isExpanded ? null : session.id);
														}}
														className={`relative flex cursor-pointer flex-col justify-between rounded-lg border p-3 transition-all duration-200 hover:shadow-xs ${
															isSelected
																? "border-primary bg-primary/5 ring-1 ring-primary"
																: "border-muted bg-card hover:border-muted-foreground/30"
														}`}
													>
														<div className="space-y-1">
															<div className="flex items-start justify-between gap-2">
																<div className="space-y-0.5">
																	<div className="flex items-center gap-1.5">
																		<span className="font-semibold text-sm leading-snug tracking-tight">
																			{session.host?.full_name || session.title}
																		</span>
																		{isOriginalHost && (
																			<Badge
																				variant="secondary"
																				className="h-4 px-1.5 font-normal text-[9px]"
																			>
																				Original Host
																			</Badge>
																		)}
																	</div>
																	<div className="font-medium text-primary text-xs">
																		{session.title}
																	</div>
																</div>
																<RadioGroupItem
																	value={String(session.id)}
																	id={`session-${session.id}`}
																	checked={isSelected}
																	onClick={(e) => {
																		e.stopPropagation();
																		handleHostChange(String(session.id));
																		setExpandedHostId(session.id);
																	}}
																	className="mt-0.5 shrink-0"
																/>
															</div>

															<div className="space-y-0.5 text-muted-foreground text-xs">
																<p>📍 {session.location || "Main Hall"}</p>
																<p>⏱️ {session.duration} min sessions</p>
															</div>

															{sessionTags.length > 0 && (
																<div className="flex flex-wrap gap-1 pt-0.5">
																	{sessionTags.map((tag: string) => (
																		<span
																			key={tag}
																			className="rounded border border-violet-100 bg-violet-50 px-1.5 py-0.5 font-medium text-[9px] text-violet-700 dark:border-violet-900 dark:bg-violet-950 dark:text-violet-200"
																		>
																			{tag}
																		</span>
																	))}
																</div>
															)}
														</div>

														{/* Profile accordion */}
														{session.host && (
															<div className="mt-2 border-t pt-1.5">
																<button
																	type="button"
																	onClick={(e) => {
																		e.stopPropagation();
																		setExpandedHostId(
																			isExpanded ? null : session.id,
																		);
																	}}
																	className="inline-flex items-center gap-1 font-medium text-[11px] text-primary hover:underline"
																>
																	{isExpanded ? (
																		<>
																			Hide Profile{" "}
																			<ChevronUp className="h-3 w-3" />
																		</>
																	) : (
																		<>
																			View Profile{" "}
																			<ChevronDown className="h-3 w-3" />
																		</>
																	)}
																</button>

																{isExpanded && (
																	/* biome-ignore lint/a11y/useKeyWithClickEvents: Stop propagation */
																	/* biome-ignore lint/a11y/noStaticElementInteractions: Stop propagation */
																	<div
																		onClick={(e) => e.stopPropagation()}
																		className="fade-in slide-in-from-top-1 mt-1.5 animate-in space-y-1.5 border-muted/60 border-t pt-1.5 text-xs duration-150"
																	>
																		{session.host.description && (
																			<div>
																				<span className="font-semibold text-[9px] text-muted-foreground uppercase tracking-wider">
																					Description
																				</span>
																				<p className="mt-0.5 rounded-md border border-muted/30 bg-muted/30 p-1.5 text-foreground leading-relaxed">
																					{session.host.description}
																				</p>
																			</div>
																		)}
																		{session.host.sourcing_intent && (
																			<div>
																				<span className="font-semibold text-[9px] text-muted-foreground uppercase tracking-wider">
																					Sourcing Intent
																				</span>
																				<p className="mt-0.5 rounded-md border border-muted/30 bg-muted/30 p-1.5 text-foreground leading-relaxed">
																					{session.host.sourcing_intent}
																				</p>
																			</div>
																		)}
																		{session.host.capabilities && (
																			<div>
																				<span className="font-semibold text-[9px] text-muted-foreground uppercase tracking-wider">
																					Capabilities
																				</span>
																				<p className="mt-0.5 rounded-md border border-muted/30 bg-muted/30 p-1.5 text-foreground leading-relaxed">
																					{session.host.capabilities}
																				</p>
																			</div>
																		)}
																		{session.host.interest_tags &&
																			session.host.interest_tags.length > 0 && (
																				<div>
																					<span className="font-semibold text-[9px] text-muted-foreground uppercase tracking-wider">
																						Interests
																					</span>
																					<div className="mt-0.5 flex flex-wrap gap-1">
																						{session.host.interest_tags.map(
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
														)}
													</div>
												);
											})}
										</RadioGroup>
									)}

									{/* Pagination and page size selector: 5, 10, 20 */}
									<div className="flex flex-col gap-2 border-t pt-2 text-muted-foreground text-xs sm:flex-row sm:items-center sm:justify-between">
										<div className="flex items-center gap-1.5">
											<span>Show per page:</span>
											{[5, 10, 20].map((size) => (
												<Button
													key={size}
													type="button"
													variant={pageSize === size ? "default" : "outline"}
													size="sm"
													className="h-6 w-7 p-0 font-medium text-xs"
													onClick={() => {
														setPageSize(size);
														setSessionPage(1);
													}}
												>
													{size}
												</Button>
											))}
										</div>

										{totalSessionPages > 1 && (
											<div className="flex items-center gap-1.5 self-end sm:self-auto">
												<Button
													type="button"
													variant="outline"
													size="sm"
													className="h-6 px-2 text-xs"
													onClick={() =>
														setSessionPage((p) => Math.max(1, p - 1))
													}
													disabled={sessionPage === 1}
												>
													<ArrowLeft className="mr-1 h-3 w-3" /> Prev
												</Button>
												<span>
													Page {sessionPage} of {totalSessionPages}
												</span>
												<Button
													type="button"
													variant="outline"
													size="sm"
													className="h-6 px-2 text-xs"
													onClick={() =>
														setSessionPage((p) =>
															Math.min(totalSessionPages, p + 1),
														)
													}
													disabled={sessionPage === totalSessionPages}
												>
													Next <ArrowRight className="ml-1 h-3 w-3" />
												</Button>
											</div>
										)}
									</div>
								</div>
							)}

							{/* Step 1 Next Button */}
							<div className="flex justify-end border-t pt-3">
								<Button
									size="default"
									onClick={() => setStep(2)}
									disabled={!effectiveBmEventId}
									className="gap-2 px-5"
								>
									Next: Select Date & Time
									<ArrowRight className="h-4 w-4" />
								</Button>
							</div>
						</div>
					)}

					{/* ========================================================================= */}
					{/* STEP 2: DATE & TIME SELECTION */}
					{/* ========================================================================= */}
					{step === 2 && (
						<div className="space-y-4">
							{/* Selected host header banner with Change Host action */}
							<div className="flex flex-col gap-2 rounded-lg border bg-muted/30 px-3 py-2 sm:flex-row sm:items-center sm:justify-between">
								<div className="flex items-center gap-2">
									<User className="h-4 w-4 text-primary" />
									<span className="text-xs sm:text-sm">
										Meeting with{" "}
										<strong className="text-foreground">
											{currentSession?.host?.full_name ||
												currentSession?.title ||
												booking.session_title}
										</strong>{" "}
										({currentSession?.title})
									</span>
								</div>
								<Button
									type="button"
									variant="ghost"
									size="sm"
									onClick={() => {
										setIsChangingHost(true);
										setStep(1);
									}}
									className="h-6 self-start px-2 text-primary text-xs hover:underline sm:self-center"
								>
									Change Host
								</Button>
							</div>

							{/* Availability loading */}
							{isLoadingAvailability ? (
								<div className="flex h-44 items-center justify-center">
									<Loader2 className="h-7 w-7 animate-spin text-muted-foreground" />
								</div>
							) : availableDates.length === 0 ? (
								<div className="py-8 text-center text-muted-foreground">
									<CalendarIcon className="mx-auto mb-2.5 h-9 w-9 opacity-40" />
									<p className="font-medium text-sm">No available dates</p>
									<p className="text-xs">
										This host has no open slots at this time.
									</p>
									<Button
										variant="outline"
										size="sm"
										onClick={() => {
											setIsChangingHost(true);
											setStep(1);
										}}
										className="mt-3 text-xs"
									>
										Pick a Different Host
									</Button>
								</div>
							) : (
								<div className="flex flex-col gap-6 md:flex-row">
									{/* Calendar */}
									<div className="flex-1">
										<h3 className="mb-2.5 flex items-center gap-1.5 font-semibold text-muted-foreground text-xs uppercase tracking-wider">
											<CalendarIcon className="h-3.5 w-3.5" />
											Select a New Date
										</h3>
										<Calendar
											mode="single"
											selected={selectedDate}
											onSelect={(date) => {
												setSelectedDate(date);
												setSelectedTime(null);
												if (date) {
													setSelectedFormattedDate(
														formatAvailabilityDate(date),
													);
												} else {
													setSelectedFormattedDate(undefined);
												}
											}}
											disabled={(day) => !isAvailableDate(day, availableDates)}
											modifiers={{
												available: (day) =>
													isAvailableDate(day, availableDates),
											}}
											modifiersClassNames={{
												today: "bg-green-100 text-emerald-800 rounded-full",
												available: "bg-green-100 text-emerald-800 rounded-full",
												selected:
													"!bg-primary !text-primary-foreground rounded-full",
											}}
											className="mx-auto w-fit rounded-lg border"
										/>
									</div>

									{/* Time slots */}
									<div className="flex-1 border-t pt-4 md:border-t-0 md:border-l md:pt-0 md:pl-6">
										<h3 className="mb-2.5 flex items-center gap-1.5 font-semibold text-muted-foreground text-xs uppercase tracking-wider">
											<Clock className="h-3.5 w-3.5" />
											{selectedDate
												? `Slots for ${selectedFormattedDate}`
												: "Pick a date first"}
										</h3>

										{!selectedDate && (
											<p className="text-muted-foreground text-xs">
												Select a date from the calendar to see available slots.
											</p>
										)}

										{selectedDate && isLoadingSlots && (
											<div className="flex h-24 items-center justify-center">
												<Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
											</div>
										)}

										{selectedDate &&
											!isLoadingSlots &&
											(!slotsData || slotsData.slots.length === 0 ? (
												<p className="text-muted-foreground text-xs">
													No slots available on this date.
												</p>
											) : (
												<div className="grid max-h-60 grid-cols-2 gap-2 overflow-y-auto pr-1">
													{slotsData.slots.map((slot, i) => (
														<button
															key={`${slot.slot}-${i}`}
															type="button"
															onClick={() => setSelectedTime(slot.slot)}
															className={`rounded-lg border px-3 py-2 font-medium text-xs transition-all ${
																selectedTime === slot.slot
																	? "border-primary bg-primary text-primary-foreground shadow-xs"
																	: "hover:border-primary/40 hover:bg-primary/10"
															}`}
														>
															{slot.slot}
														</button>
													))}
												</div>
											))}
									</div>
								</div>
							)}

							{/* Step 2 Bottom Actions */}
							<div className="flex flex-col items-center justify-between gap-3 border-t pt-4 sm:flex-row">
								<Button
									type="button"
									variant="outline"
									size="sm"
									onClick={() => setStep(1)}
									className="gap-1.5 self-start sm:self-auto"
								>
									<ArrowLeft className="h-3.5 w-3.5" /> Back to Host
								</Button>

								<div className="text-right text-xs">
									{selectedDate && selectedTime ? (
										<span className="font-medium text-foreground">
											Selected: {selectedFormattedDate} at {selectedTime}
										</span>
									) : (
										<span className="text-muted-foreground">
											Pick a date and time slot to proceed
										</span>
									)}
								</div>

								<Button
									disabled={!selectedDate || !selectedTime}
									onClick={() => setStep(3)}
									size="default"
									className="gap-2 self-stretch sm:self-auto"
								>
									Next: Review & Confirm
									<ArrowRight className="h-4 w-4" />
								</Button>
							</div>
						</div>
					)}

					{/* ========================================================================= */}
					{/* STEP 3: REVIEW & CONFIRM */}
					{/* ========================================================================= */}
					{step === 3 && (
						<div className="space-y-4">
							<div className="rounded-xl border bg-card p-4 shadow-xs">
								<h3 className="flex items-center gap-2 font-bold text-base text-foreground">
									<ShieldCheck className="h-5 w-5 text-primary" />
									Review Reschedule Details
								</h3>
								<p className="mt-0.5 text-muted-foreground text-xs">
									Please double check your updated appointment details below
									before confirming.
								</p>

								<div className="mt-4 grid grid-cols-1 gap-4 rounded-lg border bg-muted/20 p-3.5 text-xs sm:grid-cols-2">
									{/* Host Comparison */}
									<div className="space-y-1.5 border-b pb-3 sm:border-r sm:border-b-0 sm:pr-4 sm:pb-0">
										<span className="block font-semibold text-[10px] text-muted-foreground uppercase tracking-wider">
											Business Host
										</span>
										<div className="space-y-1">
											<div>
												<span className="text-muted-foreground">
													{isHostChanged ? "New Host:" : "Host:"}
												</span>{" "}
												<strong className="font-semibold text-foreground">
													{currentSession?.host?.full_name ||
														currentSession?.title}
												</strong>
												{isHostChanged && (
													<Badge className="ml-1.5 bg-primary px-1.5 py-0 text-[9px]">
														Changed
													</Badge>
												)}
											</div>
											<div className="text-muted-foreground">
												Session: {currentSession?.title}
											</div>
											{isHostChanged && booking.host_name && (
												<div className="text-[11px] text-muted-foreground">
													(Originally with: {booking.host_name})
												</div>
											)}
										</div>
									</div>

									{/* Date & Time Comparison */}
									<div className="space-y-1.5">
										<span className="block font-semibold text-[10px] text-muted-foreground uppercase tracking-wider">
											Date & Time
										</span>
										<div className="space-y-1">
											<div>
												<span className="text-muted-foreground">New Time:</span>{" "}
												<strong className="font-semibold text-primary">
													{selectedFormattedDate} at {selectedTime}
												</strong>
											</div>
											<div className="text-[11px] text-muted-foreground">
												(Original: {booking.booking_date} at{" "}
												{booking.booking_time})
											</div>
											<div className="flex items-center gap-3 pt-1 text-[11px] text-muted-foreground">
												<span className="flex items-center gap-1">
													<MapPin className="h-3 w-3" />
													{currentSession?.location || "Main Hall"}
												</span>
												<span className="flex items-center gap-1">
													<Clock className="h-3 w-3" />
													{currentSession?.duration || 30} mins
												</span>
											</div>
										</div>
									</div>
								</div>

								{/* Brief profile note */}
								{currentSession?.host?.description && (
									<div className="mt-3 rounded-md bg-muted/40 p-2.5 text-xs">
										<span className="font-semibold text-[10px] text-muted-foreground uppercase tracking-wider">
											About {currentSession.host.full_name}
										</span>
										<p className="mt-0.5 line-clamp-3 text-foreground leading-relaxed">
											{currentSession.host.description}
										</p>
									</div>
								)}

								<p className="mt-3 text-muted-foreground text-xs">
									✉️ An updated email confirmation will be sent to both you and
									the host.
								</p>
							</div>

							{/* Step 3 Bottom Actions */}
							<div className="flex flex-col items-center justify-between gap-3 border-t pt-4 sm:flex-row">
								<Button
									type="button"
									variant="outline"
									size="sm"
									onClick={() => setStep(2)}
									className="gap-1.5 self-start sm:self-auto"
								>
									<ArrowLeft className="h-3.5 w-3.5" /> Back to Date & Time
								</Button>

								<Button
									disabled={!selectedDate || !selectedTime || isRescheduling}
									onClick={() => {
										if (!selectedDate || !selectedTime) return;
										doReschedule({
											date: format(selectedDate, "yyyy-MM-dd"),
											time: selectedTime,
											bmEventId: effectiveBmEventId,
											hostUserId: currentSession?.host?.id,
										});
									}}
									size="default"
									className="gap-2 self-stretch sm:self-auto"
								>
									{isRescheduling ? (
										<Loader2 className="h-4 w-4 animate-spin" />
									) : (
										<RefreshCcw className="h-4 w-4" />
									)}
									Confirm Reschedule
								</Button>
							</div>
						</div>
					)}
				</CardContent>
			</Card>
		</div>
	);
}
