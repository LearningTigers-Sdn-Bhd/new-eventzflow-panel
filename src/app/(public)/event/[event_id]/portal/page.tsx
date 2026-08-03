"use client";

import { useState, use, useEffect } from "react";
import { useSearchParams } from "next/navigation";
import { toast } from "sonner";
import { format, parseISO } from "date-fns";
import {
	Loader2,
	User,
	Tags,
	Calendar,
	CheckCircle,
	XCircle,
	ArrowRightLeft,
	HelpCircle,
	Clock,
	Briefcase,
	MessageSquare,
	Sparkles,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
	Card,
	CardContent,
	CardDescription,
	CardHeader,
	CardTitle,
} from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
	usePortalData,
	usePortalMatches,
	useUpdatePortalProfile,
	useRequestPortalBooking,
	useRespondPortalBooking,
} from "@/hooks/use-business-matching";

interface AttendeePortalPageProps {
	params: Promise<{
		event_id: string;
	}>;
}

export default function AttendeePortalPage({ params }: AttendeePortalPageProps) {
	const { event_id } = use(params);
	const searchParams = useSearchParams();
	const token = searchParams.get("token") || "";

	const { data: portalData, isLoading: isPortalLoading } = usePortalData(token);
	const { data: matches, isLoading: isMatchesLoading } = usePortalMatches(token);

	const { mutate: updateProfile, isPending: isUpdatingProfile } =
		useUpdatePortalProfile(token);
	const { mutate: requestBooking, isPending: isBookingRequestPending } =
		useRequestPortalBooking(token);
	const { mutate: respondBooking } = useRespondPortalBooking(token);

	// Onboarding wizard states
	const [showOnboarding, setShowOnboarding] = useState(false);
	const [onboardingStep, setOnboardingStep] = useState(1);
	const [onboardingOfferings, setOnboardingOfferings] = useState<string[]>([]);
	const [onboardingInterests, setOnboardingInterests] = useState<string[]>([]);

	// Trigger onboarding if user has no tags configured yet
	useEffect(() => {
		if (
			portalData?.participant &&
			portalData.participant.offering_tags.length === 0 &&
			portalData.participant.interest_tags.length === 0
		) {
			setShowOnboarding(true);
		}
	}, [portalData]);

	// Tags inputs state
	const [offeringInput, setOfferingInput] = useState("");
	const [interestInput, setInterestInput] = useState("");

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
							Please use the personalized magic link sent to your registered email
							or WhatsApp to access your matchmaking portal.
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
		const offeringTags = offeringInput
			.split(",")
			.map((t) => t.trim())
			.filter(Boolean);
		const interestTags = interestInput
			.split(",")
			.map((t) => t.trim())
			.filter(Boolean);

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

	// Initialize inputs when data loads
	if (participant && offeringInput === "" && interestInput === "") {
		setOfferingInput(participant.offering_tags.join(", "));
		setInterestInput(participant.interest_tags.join(", "));
	}

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
				<div className="rounded-full bg-green-500/10 px-3 py-1 font-medium text-green-500 text-xs self-start md:self-auto">
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
									className="gap-1 text-xs px-2 h-7"
								>
									<Sparkles className="h-3 w-3 text-primary animate-pulse" />
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
									<Input
										id="offering-tags"
										value={offeringInput}
										onChange={(e) => setOfferingInput(e.target.value)}
										placeholder="e.g. SaaS, Consulting, Seed Fund (comma separated)"
										disabled={isUpdatingProfile}
									/>
									<span className="text-muted-foreground text-xs block">
										Separate tags with commas.
									</span>
								</div>

								<div className="space-y-2">
									<Label htmlFor="interest-tags">What I Seek (Looking For)</Label>
									<Input
										id="interest-tags"
										value={interestInput}
										onChange={(e) => setInterestInput(e.target.value)}
										placeholder="e.g. Clients, Developers, Investors (comma separated)"
										disabled={isUpdatingProfile}
									/>
									<span className="text-muted-foreground text-xs block">
										Separate tags with commas.
									</span>
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
							<TabsTrigger value="schedule">My Schedule ({bookings.length})</TabsTrigger>
							<TabsTrigger value="matches">Find Matches ({matches?.length || 0})</TabsTrigger>
						</TabsList>

						{/* Schedule Tab */}
						<TabsContent value="schedule" className="space-y-4">
							{bookings.length === 0 ? (
								<Card className="py-12 text-center">
									<CardContent className="space-y-3">
										<Calendar className="mx-auto h-12 w-12 text-muted-foreground" />
										<p className="font-semibold text-lg">No meetings scheduled yet</p>
										<p className="text-muted-foreground text-sm max-w-sm mx-auto">
											Browse the &quot;Find Matches&quot; tab to send meeting requests to other
											exhibitors and visitors.
										</p>
									</CardContent>
								</Card>
							) : (
								bookings.map((booking) => {
									const isRequester = booking.requester.id === participant?.id;
									const partner = isRequester ? booking.receiver : booking.requester;
									return (
										<Card key={booking.id} className="relative overflow-hidden">
											<div
												className={`absolute top-0 left-0 bottom-0 w-2 ${
													booking.status === "Approved"
														? "bg-green-500"
														: booking.status === "Pending"
															? "bg-amber-500"
															: "bg-red-500"
												}`}
											/>
											<CardContent className="flex flex-col gap-4 p-6 sm:flex-row sm:items-center sm:justify-between ml-2">
												<div className="space-y-1">
													<p className="font-semibold text-lg">{partner.name}</p>
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

												<div className="flex flex-col gap-2 self-start sm:self-auto min-w-[120px]">
													<span
														className={`inline-block rounded-full px-2 py-0.5 text-center font-medium text-xs self-start sm:self-auto ${
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
														<div className="flex gap-2 mt-2">
															<Button
																size="xs"
																onClick={() => handleRespond(booking.id, "accept")}
																className="bg-green-600 hover:bg-green-700 h-8"
															>
																Accept
															</Button>
															<Button
																size="xs"
																variant="outline"
																onClick={() => handleRespond(booking.id, "decline")}
																className="text-red-500 hover:text-red-600 h-8"
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
								<div className="flex py-10 justify-center">
									<Loader2 className="h-8 w-8 animate-spin text-primary" />
								</div>
							) : !matches || matches.length === 0 ? (
								<Card className="py-12 text-center">
									<CardContent className="space-y-3">
										<HelpCircle className="mx-auto h-12 w-12 text-muted-foreground" />
										<p className="font-semibold text-lg">No matching partners found</p>
										<p className="text-muted-foreground text-sm max-w-sm mx-auto">
											Try adding more keywords or tags to your &quot;What I Have&quot; and &quot;What I Seek&quot; profiles to generate recommendations.
										</p>
									</CardContent>
								</Card>
							) : (
								matches.map((item) => (
									<Card key={item.participant.id} className="relative">
										<CardContent className="p-6 space-y-4">
											<div className="flex items-start justify-between">
												<div>
													<h3 className="font-bold text-lg">{item.participant.name}</h3>
													<p className="text-muted-foreground text-sm">
														{item.participant.company} ({item.participant.role})
													</p>
												</div>
												<div className="rounded-full bg-blue-500/10 px-3 py-1 font-semibold text-blue-500 text-xs">
													{item.match_score}% Match
												</div>
											</div>

											{/* Tags Grid */}
											<div className="grid grid-cols-1 gap-2 pt-2 sm:grid-cols-2 text-xs">
												<div>
													<span className="font-medium text-muted-foreground block mb-1">
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
															<span className="text-muted-foreground italic">None listed</span>
														)}
													</div>
												</div>
												<div>
													<span className="font-medium text-muted-foreground block mb-1">
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
															<span className="text-muted-foreground italic">None listed</span>
														)}
													</div>
												</div>
											</div>

											{selectedMatchId === item.participant.id ? (
												<form
													onSubmit={handleSendRequest}
													className="border-t pt-4 space-y-4"
												>
													<p className="font-semibold text-sm">Schedule Meeting Slot</p>
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
													<div className="flex gap-2 justify-end">
														<Button
															type="button"
															variant="outline"
															onClick={() => setSelectedMatchId(null)}
															disabled={isBookingRequestPending}
														>
															Cancel
														</Button>
														<Button type="submit" disabled={isBookingRequestPending}>
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
														onClick={() => setSelectedMatchId(item.participant.id)}
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
				<div className="fixed inset-0 z-50 flex items-center justify-center bg-background/80 backdrop-blur-md p-4 animate-in fade-in duration-300">
					<Card className="w-full max-w-lg border-2 shadow-2xl relative overflow-hidden bg-card">
						<div className="absolute top-0 right-0 w-32 h-32 bg-primary/10 rounded-full blur-2xl -mr-10 -mt-10" />
						
						<CardHeader className="text-center pt-8">
							<div className="mx-auto bg-primary/10 w-12 h-12 rounded-full flex items-center justify-center mb-3">
								<Sparkles className="h-6 w-6 text-primary animate-pulse" />
							</div>
							<CardTitle className="text-2xl font-bold">
								{onboardingStep === 1 ? "What do you offer?" : "What are you looking for?"}
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
									<div className="flex flex-wrap gap-2 justify-center py-2">
										{["Fintech Core", "Cybersecurity SaaS", "Generative AI API", "AI Diagnostics", "IoT Fleet Tech", "No-Code Builder", "Pre-Seed Fund", "Seed Venture Capital", "Series A Equity", "Senior Ruby Developer", "React Frontend Engineer", "AI Researcher", "Product Manager"].map((tag) => {
											const selected = onboardingOfferings.includes(tag);
											return (
												<Button
													key={tag}
													type="button"
													variant={selected ? "default" : "outline"}
													onClick={() => {
														setOnboardingOfferings(prev => 
															prev.includes(tag) ? prev.filter(t => t !== tag) : [...prev, tag]
														);
													}}
													className="rounded-full text-sm font-medium transition hover:scale-105"
												>
													{tag}
												</Button>
											);
										})}
									</div>
								</div>
							) : (
								<div className="space-y-4">
									<div className="flex flex-wrap gap-2 justify-center py-2">
										{["Enterprise Partners", "B2B Sales Leads", "API Integrators", "AI Startups", "Fintech Disruptors", "Seed Teams", "Full-time Position", "Remote Contracts", "Co-Founder Match", "VC Investment", "Series A Fund"].map((tag) => {
											const selected = onboardingInterests.includes(tag);
											return (
												<Button
													key={tag}
													type="button"
													variant={selected ? "default" : "outline"}
													onClick={() => {
														setOnboardingInterests(prev => 
															prev.includes(tag) ? prev.filter(t => t !== tag) : [...prev, tag]
														);
													}}
													className="rounded-full text-sm font-medium transition hover:scale-105"
												>
													{tag}
												</Button>
											);
										})}
									</div>
								</div>
							)}
						</CardContent>
						
						<div className="flex justify-between border-t p-6 bg-muted/30">
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
									disabled={onboardingOfferings.length === 0}
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
													toast.success("Profile saved! Finding your matches...");
													setShowOnboarding(false);
												},
												onError: (err) => {
													toast.error("Failed to save profile: " + err.message);
												}
											}
										);
									}}
									disabled={onboardingInterests.length === 0 || isUpdatingProfile}
									className="px-6"
								>
									{isUpdatingProfile && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
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
