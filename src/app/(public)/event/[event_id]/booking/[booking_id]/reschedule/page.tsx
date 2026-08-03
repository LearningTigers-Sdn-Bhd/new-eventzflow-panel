"use client";

import { format, parse } from "date-fns";
import {
	ArrowLeft,
	Calendar as CalendarIcon,
	CheckCircle2,
	Clock,
	Loader2,
	RefreshCcw,
} from "lucide-react";
import { useRouter } from "next/navigation";
import { use, useState } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import {
	Card,
	CardContent,
	CardDescription,
	CardHeader,
	CardTitle,
} from "@/components/ui/card";
import { useEventAvailability, useDetailedSlots } from "@/hooks/use-business-matching-public";
import { useQuery, useMutation } from "@tanstack/react-query";
import {
	getPublicBookingInfo,
	rescheduleBooking,
	type PublicBookingInfo,
} from "@/lib/api/business-matching";
import { publicRestClient } from "@/utils/rest-api";

interface ReschedulePageProps {
	params: Promise<{ event_id: string; booking_id: string }>;
}

export default function ReschedulePage({ params }: ReschedulePageProps) {
	const { event_id, booking_id } = use(params);
	const router = useRouter();

	const [selectedDate, setSelectedDate] = useState<Date | undefined>(undefined);
	const [selectedFormattedDate, setSelectedFormattedDate] = useState<string | undefined>(undefined);
	const [selectedTime, setSelectedTime] = useState<string | null>(null);
	const [done, setDone] = useState(false);
	const [newDate, setNewDate] = useState("");
	const [newTime, setNewTime] = useState("");

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

	// Fetch available dates for the session
	const {
		data: availabilityData,
		isLoading: isLoadingAvailability,
	} = useEventAvailability(booking?.bm_event_id ?? "", event_id, {
		enabled: !!booking?.bm_event_id,
	});

	// Fetch time slots for the selected date
	const {
		data: slotsData,
		isLoading: isLoadingSlots,
	} = useDetailedSlots(
		booking?.bm_event_id ?? "",
		selectedFormattedDate ?? "",
		event_id,
		{ enabled: !!booking?.bm_event_id && !!selectedFormattedDate },
	);

	// Reschedule mutation
	const { mutate: doReschedule, isPending: isRescheduling } = useMutation({
		mutationFn: ({ date, time }: { date: string; time: string }) =>
			rescheduleBooking(booking_id, date, time),
		onSuccess: (data) => {
			setNewDate(data.booking_date);
			setNewTime(data.booking_time);
			setDone(true);
			toast.success("Booking rescheduled successfully!");
		},
		onError: (error: Error) => {
			toast.error("Reschedule failed", {
				description: error.message || "That slot may already be taken. Please choose another.",
			});
		},
	});

	// Loading state
	if (isLoadingBooking) {
		return (
			<div className="flex min-h-screen items-center justify-center">
				<div className="text-center space-y-3">
					<Loader2 className="h-10 w-10 animate-spin text-primary mx-auto" />
					<p className="text-muted-foreground text-sm">Loading your booking...</p>
				</div>
			</div>
		);
	}

	// Error / not found
	if (bookingError || !booking) {
		return (
			<div className="flex min-h-screen items-center justify-center p-4">
				<Card className="max-w-md w-full text-center">
					<CardHeader>
						<CardTitle className="text-destructive text-2xl">Booking Not Found</CardTitle>
						<CardDescription>
							This booking does not exist or the link is invalid. Please contact the event organiser.
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
				<Card className="max-w-md w-full text-center">
					<CardHeader>
						<CardTitle className="text-destructive text-2xl">Booking Cancelled</CardTitle>
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
				<Card className="max-w-md w-full text-center shadow-lg">
					<CardHeader className="pb-4">
						<CheckCircle2 className="h-16 w-16 text-green-500 mx-auto mb-3" />
						<CardTitle className="text-2xl font-bold">Rescheduled!</CardTitle>
						<CardDescription>
							Your meeting has been moved to a new time.
						</CardDescription>
					</CardHeader>
					<CardContent className="space-y-4">
						<div className="rounded-xl border bg-muted/30 p-4 text-sm space-y-2 text-left">
							<div className="flex justify-between">
								<span className="text-muted-foreground">Session</span>
								<span className="font-medium">{booking.session_title}</span>
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
						<Button
							variant="outline"
							className="w-full"
							onClick={() => router.push(`/event/${event_id}/book-meeting`)}
						>
							Done
						</Button>
					</CardContent>
				</Card>
			</div>
		);
	}

	const availableDateStrings = availabilityData?.dates.map((d) => d.date) ?? [];

	return (
		<div className="min-h-screen bg-gradient-to-b from-background to-muted/30 flex flex-col items-center justify-start px-4 py-12">
			{/* Header */}
			<div className="w-full max-w-2xl mb-6">
				<Button
					variant="ghost"
					size="sm"
					onClick={() => router.back()}
					className="gap-1.5 text-muted-foreground"
				>
					<ArrowLeft className="h-4 w-4" />
					Back
				</Button>
			</div>

			<Card className="w-full max-w-2xl shadow-lg">
				<CardHeader className="border-b pb-5">
					<div className="flex items-center gap-3">
						<div className="rounded-full bg-primary/10 p-2.5">
							<RefreshCcw className="h-5 w-5 text-primary" />
						</div>
						<div>
							<CardTitle className="text-xl">Reschedule Your Meeting</CardTitle>
							<CardDescription>
								Pick a new date and time for your meeting with{" "}
								<span className="font-medium text-foreground">{booking.session_title}</span>
							</CardDescription>
						</div>
					</div>
				</CardHeader>

				<CardContent className="pt-6 space-y-6">
					{/* Current booking info */}
					<div className="rounded-lg border bg-amber-50 dark:bg-amber-950/20 border-amber-200 dark:border-amber-800 p-4 text-sm">
						<p className="text-amber-800 dark:text-amber-300 font-medium mb-1">Current Booking</p>
						<p className="text-amber-700 dark:text-amber-400">
							{booking.booking_date} at {booking.booking_time}
						</p>
					</div>

					{/* Availability loading */}
					{isLoadingAvailability ? (
						<div className="flex h-48 items-center justify-center">
							<Loader2 className="h-7 w-7 animate-spin text-muted-foreground" />
						</div>
					) : availableDateStrings.length === 0 ? (
						<div className="text-center text-muted-foreground py-8">
							<CalendarIcon className="h-10 w-10 mx-auto mb-3 opacity-40" />
							<p className="font-medium">No available dates</p>
							<p className="text-sm">This session has no open slots at this time.</p>
						</div>
					) : (
						<div className="flex flex-col md:flex-row gap-6">
							{/* Calendar */}
							<div className="flex-1">
								<h3 className="font-semibold text-sm text-muted-foreground uppercase tracking-wide mb-3 flex items-center gap-2">
									<CalendarIcon className="h-4 w-4" />
									Select a New Date
								</h3>
								<Calendar
									mode="single"
									selected={selectedDate}
									onSelect={(date) => {
										setSelectedDate(date);
										setSelectedTime(null);
										if (date) {
											setSelectedFormattedDate(format(date, "dd MMMM yyyy"));
										} else {
											setSelectedFormattedDate(undefined);
										}
									}}
									disabled={(day) => {
										const formatted = format(day, "dd MMMM yyyy");
										return !availableDateStrings.includes(formatted);
									}}
									modifiers={{
										available: (day) => {
											const formatted = format(day, "dd MMMM yyyy");
											return availableDateStrings.includes(formatted);
										},
									}}
									modifiersClassNames={{
										today: "bg-green-100 text-emerald-800 rounded-full",
										available: "bg-green-100 text-emerald-800 rounded-full",
										selected: "!bg-primary !text-primary-foreground rounded-full",
									}}
									className="rounded-lg border w-fit mx-auto"
								/>
							</div>

							{/* Time slots */}
							<div className="flex-1 border-t md:border-t-0 md:border-l pt-4 md:pt-0 md:pl-6">
								<h3 className="font-semibold text-sm text-muted-foreground uppercase tracking-wide mb-3 flex items-center gap-2">
									<Clock className="h-4 w-4" />
									{selectedDate ? `Slots for ${selectedFormattedDate}` : "Pick a date first"}
								</h3>

								{!selectedDate && (
									<p className="text-muted-foreground text-sm">
										Select a date from the calendar to see available slots.
									</p>
								)}

								{selectedDate && isLoadingSlots && (
									<div className="flex h-24 items-center justify-center">
										<Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
									</div>
								)}

								{selectedDate && !isLoadingSlots && (
									<>
										{!slotsData || slotsData.slots.length === 0 ? (
											<p className="text-muted-foreground text-sm">
												No slots available on this date.
											</p>
										) : (
											<div className="grid grid-cols-2 gap-2 max-h-64 overflow-y-auto pr-1">
												{slotsData.slots.map((slot, i) => (
													<button
														key={`${slot.slot}-${i}`}
														type="button"
														onClick={() => setSelectedTime(slot.slot)}
														className={`rounded-lg border px-3 py-2.5 text-sm font-medium transition-all ${
															selectedTime === slot.slot
																? "bg-primary text-primary-foreground border-primary shadow"
																: "hover:bg-primary/10 hover:border-primary/40"
														}`}
													>
														{slot.slot}
													</button>
												))}
											</div>
										)}
									</>
								)}
							</div>
						</div>
					)}

					{/* Confirm button */}
					{selectedDate && selectedTime && (
						<div className="border-t pt-5 flex flex-col sm:flex-row gap-3 items-center justify-between">
							<div className="text-sm text-muted-foreground">
								New time:{" "}
								<span className="font-semibold text-foreground">
									{selectedFormattedDate} at {selectedTime}
								</span>
							</div>
							<Button
								disabled={isRescheduling}
								onClick={() => {
									if (!selectedFormattedDate || !selectedTime) return;
									// Convert "dd MMMM yyyy" back to "yyyy-MM-dd" for the API
									const parsedDate = parse(selectedFormattedDate, "dd MMMM yyyy", new Date());
									doReschedule({
										date: format(parsedDate, "yyyy-MM-dd"),
										time: selectedTime,
									});
								}}
								className="gap-2"
							>
								{isRescheduling ? (
									<Loader2 className="h-4 w-4 animate-spin" />
								) : (
									<RefreshCcw className="h-4 w-4" />
								)}
								Confirm Reschedule
							</Button>
						</div>
					)}
				</CardContent>
			</Card>
		</div>
	);
}
