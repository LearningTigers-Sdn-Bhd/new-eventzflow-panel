"use client";

import { format, parseISO } from "date-fns";
import {
	Briefcase,
	Calendar,
	Clock,
	HelpCircle,
	Loader2,
	Sparkles,
	Tags,
	User,
	XCircle,
} from "lucide-react";
import { useSearchParams } from "next/navigation";
import { use, useEffect, useState } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import {
	Card,
	CardContent,
	CardDescription,
	CardHeader,
	CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { MultiSelectLegacy } from "@/components/ui/multi-select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
	usePortalData,
	usePortalMatches,
	usePortalTags,
	useRequestPortalBooking,
	useRespondPortalBooking,
	useUpdatePortalProfile,
} from "@/hooks/use-business-matching";

interface AttendeePortalPageProps {
	params: Promise<{
		event_id: string;
	}>;
}

export default function AttendeePortalPage({
	params,
}: AttendeePortalPageProps) {
	const { event_id } = use(params);
	const searchParams = useSearchParams();
	const token = searchParams.get("token") || "";

	const { data: portalData, isLoading: isPortalLoading } = usePortalData(token);
	const { data: matches, isLoading: isMatchesLoading } =
		usePortalMatches(token);
	const { data: eventTags } = usePortalTags(token);

	const { mutate: updateProfile, isPending: isUpdatingProfile } =
		useUpdatePortalProfile(token);
	const { mutate: requestBooking, isPending: isBookingRequestPending } =
		useRequestPortalBooking(token);
	const { mutate: respondBooking } = useRespondPortalBooking(token);

	const availableOfferingTags = eventTags?.offering_tags || [];
	const availableInterestTags = eventTags?.interest_tags || [];
	const hasAnyTagsConfigured =
		availableOfferingTags.length > 0 || availableInterestTags.length > 0;

	// Onboarding wizard states
	const [showOnboarding, setShowOnboarding] = useState(false);
	const [onboardingStep, setOnboardingStep] = useState(1);
	const [onboardingOfferings, setOnboardingOfferings] = useState<string[]>([]);
	const [onboardingInterests, setOnboardingInterests] = useState<string[]>([]);

	// Trigger onboarding if user has no tags configured yet (and there's
	// actually something for them to pick from)
	useEffect(() => {
		if (
			portalData?.participant &&
			portalData.participant.offering_tags.length === 0 &&
			portalData.participant.interest_tags.length === 0 &&
			hasAnyTagsConfigured
		) {
			setShowOnboarding(true);
		}
	}, [portalData, hasAnyTagsConfigured]);

	// Tags selection state
	const [offeringTags, setOfferingTags] = useState<string[]>([]);
	const [interestTags, setInterestTags] = useState<string[]>([]);

	// Seed tag selections once the participant's saved profile loads
	useEffect(() => {
		if (portalData?.participant) {
			setOfferingTags(portalData.participant.offering_tags || []);
			setInterestTags(portalData.participant.interest_tags || []);
		}
	}, [portalData]);

	// Active tab
	const [activeTab, setActiveTab] = useState("schedule");

	// Booking requests state
	const [selectedMatchId, setSelectedMatchId] = useState<string | null>(null);
	const [bookingDate, setBookingDate] = useState("");
	const [bookingTime, setBookingTime] = useState("");

	if (!token) {
		return (
			<div className="container mx-auto max-w-xl py-20 text-center">
				<Card className="border border-destructive/20 bg-destructive/5">
					<CardHeader>
						<XCircle className="mx-auto mb-4 h-16 w-16 text-destructive" />
						<CardTitle className="font-bold text-2xl text-destructive">
							Invalid or Missing Link
						</CardTitle>
						<CardDescription>
							Please use the personalized magic link sent to your registered
							email or WhatsApp to access your matchmaking portal.
						</CardDescription>
					</CardHeader>
				</Card>
			</div>
		);
	}

	if (isPortalLoading) {
		return (
			<div className="flex min-h-[50vh] items-center justify-center">
				<Loader2 className="h-10 w-10 animate-spin text-primary" />
			</div>
		);
	}

	const participant = portalData?.participant;
	const bookings = portalData?.bookings || [];

	const handleUpdateTags = (e: React.FormEvent) => {
		e.preventDefault();

		updateProfile(
			{ offeringTags, interestTags },
			{
				onSuccess: () => {
					toast.success("Profile tags updated successfully!");
				},
				onError: (err) => {
					toast.error("Failed to update profile", {
						description: err.message,
					});
				},
			},
		);
	};

	const handleSendRequest = (e: React.FormEvent) => {
		e.preventDefault();
		if (!selectedMatchId || !bookingDate || !bookingTime) {
			toast.error("Please fill all booking request details.");
			return;
		}

		requestBooking(
			{
				receiverParticipantId: selectedMatchId,
				date: bookingDate,
				time: bookingTime,
			},
			{
				onSuccess: () => {
					toast.success("Meeting request sent successfully!");
					setSelectedMatchId(null);
					setBookingDate("");
					setBookingTime("");
				},
				onError: (err) => {
					toast.error("Failed to send request", {
						description: err.message,
					});
				},
			},
		);
	};

	const handleRespond = (bookingId: string, response: "accept" | "decline") => {
		respondBooking(
			{ bookingId, response },
			{
				onSuccess: () => {
					toast.success(
						response === "accept" ? "Meeting accepted!" : "Meeting declined.",
					);
				},
				onError: (err) => {
					toast.error("Failed to respond to meeting request", {
						description: err.message,
					});
				},
			},
		);
	};

	return (
		<div className="container mx-auto max-w-5xl px-4 py-8">
			{/* Portal Header */}
			<div className="mb-8 flex flex-col gap-4 rounded-xl border bg-card p-6 text-card-foreground shadow-sm md:flex-row md:items-center md:justify-between">
				<div className="flex items-center gap-4">
					<div className="flex h-12 w-12 items-center justify-center rounded-full bg-primary/10 text-primary">
						<User className="h-6 w-6" />
					</div>
					<div>
						<h1 className="font-bold text-2xl tracking-tight">
							{participant?.name || "Participant Profile"}
						</h1>
						<p className="flex items-center gap-2 text-muted-foreground text-sm">
							<Briefcase className="h-4 w-4" />
							{participant?.company || "Exhibitor"} ({participant?.role})
						</p>
					</div>
				</div>
				<div className="self-start rounded-full bg-green-500/10 px-3 py-1 font-medium text-green-500 text-xs md:self-auto">
					Active Matchmaking Participant
				</div>
			</div>

			<div className="grid grid-cols-1 gap-8 lg:grid-cols-3">
				{/* Sidebar Profile Settings */}
				<div className="lg:col-span-1">
					<Card>
						<CardHeader>
							<CardTitle className="flex items-center justify-between text-lg">
								<span className="flex items-center gap-2">
									<Tags className="h-5 w-5 text-primary" />
									Matching Tags
								</span>
								<Button
									type="button"
									variant="outline"
									size="sm"
									onClick={() => {
										setOnboardingOfferings(participant?.offering_tags || []);
										setOnboardingInterests(participant?.interest_tags || []);
										setOnboardingStep(1);
										setShowOnboarding(true);
									}}
									className="h-7 gap-1 px-2 text-xs"
								>
									<Sparkles className="h-3 w-3 animate-pulse text-primary" />
									Wizard
								</Button>
							</CardTitle>
							<CardDescription>
								Define what you offer and what you are seeking to generate smart
								recommendations.
							</CardDescription>
						</CardHeader>
						<CardContent>
							<form onSubmit={handleUpdateTags} className="space-y-4">
								<div className="space-y-2">
									<Label htmlFor="offering-tags">What I Have (Offering)</Label>
									<MultiSelectLegacy
										options={availableOfferingTags.map((t) => ({
											label: t,
											value: t,
										}))}
										selected={offeringTags}
										onChange={setOfferingTags}
										placeholder={
											availableOfferingTags.length === 0
												? "No tags configured yet by the event organizer"
												: "Select what you offer"
										}
									/>
								</div>

								<div className="space-y-2">
									<Label htmlFor="interest-tags">
										What I Seek (Looking For)
									</Label>
									<MultiSelectLegacy
										options={availableInterestTags.map((t) => ({
											label: t,
											value: t,
										}))}
										selected={interestTags}
										onChange={setInterestTags}
										placeholder={
											availableInterestTags.length === 0
												? "No tags configured yet by the event organizer"
												: "Select what you're seeking"
										}
									/>
								</div>

								<Button
									type="submit"
									className="w-full"
									disabled={isUpdatingProfile}
								>
									{isUpdatingProfile && (
										<Loader2 className="mr-2 h-4 w-4 animate-spin" />
									)}
									Save Preferences
								</Button>
							</form>
						</CardContent>
					</Card>
				</div>

				{/* Main Portal Navigation */}
				<div className="lg:col-span-2">
					<Tabs
						value={activeTab}
						onValueChange={setActiveTab}
						className="space-y-4"
					>
						<TabsList className="grid w-full grid-cols-2">
							<TabsTrigger value="schedule">
								My Schedule ({bookings.length})
							</TabsTrigger>
							<TabsTrigger value="matches">
								Find Matches ({matches?.length || 0})
							</TabsTrigger>
						</TabsList>

						{/* Schedule Tab */}
						<TabsContent value="schedule" className="space-y-4">
							{bookings.length === 0 ? (
								<Card className="py-12 text-center">
									<CardContent className="space-y-3">
										<Calendar className="mx-auto h-12 w-12 text-muted-foreground" />
										<p className="font-semibold text-lg">
											No meetings scheduled yet
										</p>
										<p className="mx-auto max-w-sm text-muted-foreground text-sm">
											Browse the &quot;Find Matches&quot; tab to send meeting
											requests to other exhibitors and visitors.
										</p>
									</CardContent>
								</Card>
							) : (
								bookings.map((booking) => {
									const isRequester = booking.requester.id === participant?.id;
									const partner = isRequester
										? booking.receiver
										: booking.requester;
									return (
										<Card key={booking.id} className="relative overflow-hidden">
											<div
												className={`absolute top-0 bottom-0 left-0 w-2 ${
													booking.status === "Approved"
														? "bg-green-500"
														: booking.status === "Pending"
															? "bg-amber-500"
															: "bg-red-500"
												}`}
											/>
											<CardContent className="ml-2 flex flex-col gap-4 p-6 sm:flex-row sm:items-center sm:justify-between">
												<div className="space-y-1">
													<p className="font-semibold text-lg">
														{partner.name}
													</p>
													<p className="text-muted-foreground text-sm">
														{partner.company} ({partner.role})
													</p>
													<div className="flex flex-wrap items-center gap-3 pt-2 text-xs">
														<span className="flex items-center gap-1 text-muted-foreground">
															<Calendar className="h-4.5 w-4.5" />
															{format(parseISO(booking.date), "PPP")}
														</span>
														<span className="flex items-center gap-1 text-muted-foreground">
															<Clock className="h-4.5 w-4.5" />
															{booking.time}
														</span>
													</div>
												</div>

												<div className="flex min-w-[120px] flex-col gap-2 self-start sm:self-auto">
													<span
														className={`inline-block self-start rounded-full px-2 py-0.5 text-center font-medium text-xs sm:self-auto ${
															booking.status === "Approved"
																? "bg-green-500/10 text-green-500"
																: booking.status === "Pending"
																	? "bg-amber-500/10 text-amber-500"
																	: "bg-red-500/10 text-red-500"
														}`}
													>
														{booking.status}
													</span>

													{!isRequester && booking.status === "Pending" && (
														<div className="mt-2 flex gap-2">
															<Button
																size="xs"
																onClick={() =>
																	handleRespond(booking.id, "accept")
																}
																className="h-8 bg-green-600 hover:bg-green-700"
															>
																Accept
															</Button>
															<Button
																size="xs"
																variant="outline"
																onClick={() =>
																	handleRespond(booking.id, "decline")
																}
																className="h-8 text-red-500 hover:text-red-600"
															>
																Decline
															</Button>
														</div>
													)}
												</div>
											</CardContent>
										</Card>
									);
								})
							)}
						</TabsContent>

						{/* Matches Recommendations Tab */}
						<TabsContent value="matches" className="space-y-4">
							{isMatchesLoading ? (
								<div className="flex justify-center py-10">
									<Loader2 className="h-8 w-8 animate-spin text-primary" />
								</div>
							) : !matches || matches.length === 0 ? (
								<Card className="py-12 text-center">
									<CardContent className="space-y-3">
										<HelpCircle className="mx-auto h-12 w-12 text-muted-foreground" />
										<p className="font-semibold text-lg">
											No matching partners found
										</p>
										<p className="mx-auto max-w-sm text-muted-foreground text-sm">
											Try adding more keywords or tags to your &quot;What I
											Have&quot; and &quot;What I Seek&quot; profiles to
											generate recommendations.
										</p>
									</CardContent>
								</Card>
							) : (
								matches.map((item) => (
									<Card key={item.participant.id} className="relative">
										<CardContent className="space-y-4 p-6">
											<div className="flex items-start justify-between">
												<div>
													<h3 className="font-bold text-lg">
														{item.participant.name}
													</h3>
													<p className="text-muted-foreground text-sm">
														{item.participant.company} ({item.participant.role})
													</p>
												</div>
												<div className="rounded-full bg-blue-500/10 px-3 py-1 font-semibold text-blue-500 text-xs">
													{item.match_score}% Match
												</div>
											</div>

											{/* Tags Grid */}
											<div className="grid grid-cols-1 gap-2 pt-2 text-xs sm:grid-cols-2">
												<div>
													<span className="mb-1 block font-medium text-muted-foreground">
														Offering:
													</span>
													<div className="flex flex-wrap gap-1">
														{item.participant.offering_tags.map((tag) => (
															<span
																key={tag}
																className="rounded bg-muted px-2 py-0.5 text-muted-foreground"
															>
																{tag}
															</span>
														))}
														{item.participant.offering_tags.length === 0 && (
															<span className="text-muted-foreground italic">
																None listed
															</span>
														)}
													</div>
												</div>
												<div>
													<span className="mb-1 block font-medium text-muted-foreground">
														Seeking:
													</span>
													<div className="flex flex-wrap gap-1">
														{item.participant.interest_tags.map((tag) => (
															<span
																key={tag}
																className="rounded bg-muted px-2 py-0.5 text-muted-foreground"
															>
																{tag}
															</span>
														))}
														{item.participant.interest_tags.length === 0 && (
															<span className="text-muted-foreground italic">
																None listed
															</span>
														)}
													</div>
												</div>
											</div>

											{selectedMatchId === item.participant.id ? (
												<form
													onSubmit={handleSendRequest}
													className="space-y-4 border-t pt-4"
												>
													<p className="font-semibold text-sm">
														Schedule Meeting Slot
													</p>
													<div className="grid grid-cols-2 gap-4">
														<div className="space-y-1">
															<Label htmlFor="date">Select Date</Label>
															<Input
																id="date"
																type="date"
																value={bookingDate}
																onChange={(e) => setBookingDate(e.target.value)}
																required
															/>
														</div>
														<div className="space-y-1">
															<Label htmlFor="time">Select Time</Label>
															<Input
																id="time"
																type="time"
																value={bookingTime}
																onChange={(e) => setBookingTime(e.target.value)}
																placeholder="e.g. 10:00 AM"
																required
															/>
														</div>
													</div>
													<div className="flex justify-end gap-2">
														<Button
															type="button"
															variant="outline"
															onClick={() => setSelectedMatchId(null)}
															disabled={isBookingRequestPending}
														>
															Cancel
														</Button>
														<Button
															type="submit"
															disabled={isBookingRequestPending}
														>
															{isBookingRequestPending && (
																<Loader2 className="mr-2 h-4 w-4 animate-spin" />
															)}
															Send Request
														</Button>
													</div>
												</form>
											) : (
												<div className="pt-2">
													<Button
														onClick={() =>
															setSelectedMatchId(item.participant.id)
														}
														className="w-full sm:w-auto"
													>
														Request 1-on-1 Meeting
													</Button>
												</div>
											)}
										</CardContent>
									</Card>
								))
							)}
						</TabsContent>
					</Tabs>
				</div>
			</div>

			{showOnboarding && (
				<div className="fade-in fixed inset-0 z-50 flex animate-in items-center justify-center bg-background/80 p-4 backdrop-blur-md duration-300">
					<Card className="relative w-full max-w-lg overflow-hidden border-2 bg-card shadow-2xl">
						<div className="absolute top-0 right-0 -mt-10 -mr-10 h-32 w-32 rounded-full bg-primary/10 blur-2xl" />

						<CardHeader className="pt-8 text-center">
							<div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-full bg-primary/10">
								<Sparkles className="h-6 w-6 animate-pulse text-primary" />
							</div>
							<CardTitle className="font-bold text-2xl">
								{onboardingStep === 1
									? "What do you offer?"
									: "What are you looking for?"}
							</CardTitle>
							<CardDescription className="text-sm">
								{onboardingStep === 1
									? "Select what tags describe your products, services, or expertise."
									: "Select what tags describe your interests, needs, or targets."}
							</CardDescription>
						</CardHeader>

						<CardContent className="py-4">
							{onboardingStep === 1 ? (
								<div className="space-y-4">
									<div className="flex flex-wrap justify-center gap-2 py-2">
										{availableOfferingTags.map((tag) => {
											const selected = onboardingOfferings.includes(tag);
											return (
												<Button
													key={tag}
													type="button"
													variant={selected ? "default" : "outline"}
													onClick={() => {
														setOnboardingOfferings((prev) =>
															prev.includes(tag)
																? prev.filter((t) => t !== tag)
																: [...prev, tag],
														);
													}}
													className="rounded-full font-medium text-sm transition hover:scale-105"
												>
													{tag}
												</Button>
											);
										})}
									</div>
								</div>
							) : (
								<div className="space-y-4">
									<div className="flex flex-wrap justify-center gap-2 py-2">
										{availableInterestTags.map((tag) => {
											const selected = onboardingInterests.includes(tag);
											return (
												<Button
													key={tag}
													type="button"
													variant={selected ? "default" : "outline"}
													onClick={() => {
														setOnboardingInterests((prev) =>
															prev.includes(tag)
																? prev.filter((t) => t !== tag)
																: [...prev, tag],
														);
													}}
													className="rounded-full font-medium text-sm transition hover:scale-105"
												>
													{tag}
												</Button>
											);
										})}
									</div>
								</div>
							)}
						</CardContent>

						<div className="flex justify-between border-t bg-muted/30 p-6">
							<Button
								variant="ghost"
								onClick={() => {
									if (onboardingStep > 1) {
										setOnboardingStep(1);
									} else {
										setShowOnboarding(false);
									}
								}}
							>
								{onboardingStep === 1 ? "Skip" : "Back"}
							</Button>

							{onboardingStep === 1 ? (
								<Button
									onClick={() => setOnboardingStep(2)}
									disabled={
										availableOfferingTags.length > 0 &&
										onboardingOfferings.length === 0
									}
									className="px-6"
								>
									Next Step
								</Button>
							) : (
								<Button
									onClick={() => {
										updateProfile(
											{
												offeringTags: onboardingOfferings,
												interestTags: onboardingInterests,
											},
											{
												onSuccess: () => {
													toast.success(
														"Profile saved! Finding your matches...",
													);
													setShowOnboarding(false);
												},
												onError: (err) => {
													toast.error(`Failed to save profile: ${err.message}`);
												},
											},
										);
									}}
									disabled={
										(availableInterestTags.length > 0 &&
											onboardingInterests.length === 0) ||
										isUpdatingProfile
									}
									className="px-6"
								>
									{isUpdatingProfile && (
										<Loader2 className="mr-2 h-4 w-4 animate-spin" />
									)}
									Find Matches
								</Button>
							)}
						</div>
					</Card>
				</div>
			)}
		</div>
	);
}
