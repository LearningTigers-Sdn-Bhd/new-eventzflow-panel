"use client";

import { useMutation, useQuery } from "@tanstack/react-query";
import { format } from "date-fns";
import {
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
import {
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
import { publicRestClient } from "@/utils/rest-api";

interface ReschedulePageProps {
	params: Promise<{ event_id: string; booking_id: string }>;
}

export default function ReschedulePage({ params }: ReschedulePageProps) {
	const { event_id, booking_id } = use(params);
	const router = useRouter();

	const [selectedDate, setSelectedDate] = useState<Date | undefined>(undefined);
	const [selectedFormattedDate, setSelectedFormattedDate] = useState<
		string | undefined
	>(undefined);
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
	const { data: availabilityData, isLoading: isLoadingAvailability } =
		useEventAvailability(booking?.bm_event_id ?? "", event_id, {
			enabled: !!booking?.bm_event_id,
		});

	// Fetch time slots for the selected date
	const { data: slotsData, isLoading: isLoadingSlots } = useDetailedSlots(
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
						<p className="text-muted-foreground text-sm">
							You may close this tab now.
						</p>
					</CardContent>
				</Card>
			</div>
		);
	}

	const availableDates = availabilityData?.dates ?? [];

	return (
		<div className="flex min-h-screen flex-col items-center justify-start bg-gradient-to-b from-background to-muted/30 px-4 py-12">
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
								<span className="font-medium text-foreground">
									{booking.session_title}
								</span>
							</CardDescription>
						</div>
					</div>
				</CardHeader>

				<CardContent className="space-y-6 pt-6">
					{/* Current booking info */}
					<div className="rounded-lg border border-amber-200 bg-amber-50 p-4 text-sm dark:border-amber-800 dark:bg-amber-950/20">
						<p className="mb-1 font-medium text-amber-800 dark:text-amber-300">
							Current Booking
						</p>
						<p className="text-amber-700 dark:text-amber-400">
							{booking.booking_date} at {booking.booking_time}
						</p>
					</div>

					{/* Availability loading */}
					{isLoadingAvailability ? (
						<div className="flex h-48 items-center justify-center">
							<Loader2 className="h-7 w-7 animate-spin text-muted-foreground" />
						</div>
					) : availableDates.length === 0 ? (
						<div className="py-8 text-center text-muted-foreground">
							<CalendarIcon className="mx-auto mb-3 h-10 w-10 opacity-40" />
							<p className="font-medium">No available dates</p>
							<p className="text-sm">
								This session has no open slots at this time.
							</p>
						</div>
					) : (
						<div className="flex flex-col gap-6 md:flex-row">
							{/* Calendar */}
							<div className="flex-1">
								<h3 className="mb-3 flex items-center gap-2 font-semibold text-muted-foreground text-sm uppercase tracking-wide">
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
											setSelectedFormattedDate(formatAvailabilityDate(date));
										} else {
											setSelectedFormattedDate(undefined);
										}
									}}
									disabled={(day) => !isAvailableDate(day, availableDates)}
									modifiers={{
										available: (day) => isAvailableDate(day, availableDates),
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
								<h3 className="mb-3 flex items-center gap-2 font-semibold text-muted-foreground text-sm uppercase tracking-wide">
									<Clock className="h-4 w-4" />
									{selectedDate
										? `Slots for ${selectedFormattedDate}`
										: "Pick a date first"}
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
											<div className="grid max-h-64 grid-cols-2 gap-2 overflow-y-auto pr-1">
												{slotsData.slots.map((slot, i) => (
													<button
														key={`${slot.slot}-${i}`}
														type="button"
														onClick={() => setSelectedTime(slot.slot)}
														className={`rounded-lg border px-3 py-2.5 font-medium text-sm transition-all ${
															selectedTime === slot.slot
																? "border-primary bg-primary text-primary-foreground shadow"
																: "hover:border-primary/40 hover:bg-primary/10"
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
						<div className="flex flex-col items-center justify-between gap-3 border-t pt-5 sm:flex-row">
							<div className="text-muted-foreground text-sm">
								New time:{" "}
								<span className="font-semibold text-foreground">
									{selectedFormattedDate} at {selectedTime}
								</span>
							</div>
							<Button
								disabled={isRescheduling}
								onClick={() => {
									if (!selectedDate || !selectedTime) return;
									doReschedule({
										date: format(selectedDate, "yyyy-MM-dd"),
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
