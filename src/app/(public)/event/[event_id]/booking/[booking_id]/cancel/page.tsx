"use client";

import { useMutation, useQuery } from "@tanstack/react-query";
import {
	AlertTriangle,
	Calendar as CalendarIcon,
	CheckCircle2,
	Loader2,
	XCircle,
} from "lucide-react";
import { useRouter } from "next/navigation";
import { use, useState } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import {
	Card,
	CardContent,
	CardDescription,
	CardHeader,
	CardTitle,
} from "@/components/ui/card";
import {
	cancelBooking,
	getPublicBookingInfo,
	type PublicBookingInfo,
} from "@/lib/api/business-matching";

interface CancelPageProps {
	params: Promise<{ event_id: string; booking_id: string }>;
}

export default function CancelPage({ params }: CancelPageProps) {
	const { event_id, booking_id } = use(params);
	const router = useRouter();
	const [done, setDone] = useState(false);

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

	// Cancel mutation
	const { mutate: doCancel, isPending: isCancelling } = useMutation({
		mutationFn: () => cancelBooking(booking_id),
		onSuccess: () => {
			setDone(true);
			toast.success("Booking cancelled successfully.");
		},
		onError: (error: Error) => {
			toast.error("Cancellation failed", {
				description: error.message || "Something went wrong. Please try again.",
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
	if (booking.status === "Cancelled" || done) {
		return (
			<div className="flex min-h-screen items-center justify-center p-4">
				<Card className="w-full max-w-md text-center shadow-lg">
					<CardHeader className="pb-4">
						<CheckCircle2 className="mx-auto mb-3 h-16 w-16 text-green-500" />
						<CardTitle className="font-bold text-2xl">
							Booking Cancelled
						</CardTitle>
						<CardDescription>
							Your meeting has been successfully cancelled.
						</CardDescription>
					</CardHeader>
					<CardContent className="space-y-4">
						<div className="space-y-2 rounded-xl border bg-muted/30 p-4 text-left text-sm">
							<div className="flex justify-between">
								<span className="text-muted-foreground">Session</span>
								<span className="font-medium">{booking.session_title}</span>
							</div>
							<div className="flex justify-between">
								<span className="text-muted-foreground">Status</span>
								<span className="font-medium text-destructive">Cancelled</span>
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

	return (
		<div className="flex min-h-screen flex-col items-center justify-start bg-gradient-to-b from-background to-muted/30 px-4 py-12">
			<Card className="w-full max-w-md border-destructive/20 shadow-lg">
				<CardHeader className="border-b pb-5">
					<div className="flex items-center gap-3">
						<div className="rounded-full bg-destructive/10 p-2.5">
							<XCircle className="h-5 w-5 text-destructive" />
						</div>
						<div>
							<CardTitle className="text-xl">Cancel Your Meeting</CardTitle>
							<CardDescription>
								Cancel your meeting for{" "}
								<span className="font-medium text-foreground">
									{booking.session_title}
								</span>
							</CardDescription>
						</div>
					</div>
				</CardHeader>

				<CardContent className="space-y-6 pt-6">
					{/* Current booking info */}
					<div className="space-y-2 rounded-lg border bg-muted/50 p-4 text-sm">
						<div className="flex justify-between">
							<span className="text-muted-foreground">Name:</span>
							<span className="font-medium">{booking.name}</span>
						</div>
						<div className="flex justify-between">
							<span className="text-muted-foreground">Date:</span>
							<span className="font-medium">{booking.booking_date}</span>
						</div>
						<div className="flex justify-between">
							<span className="text-muted-foreground">Time:</span>
							<span className="font-medium">{booking.booking_time}</span>
						</div>
					</div>

					<div className="flex gap-3 rounded-lg border border-amber-200 bg-amber-50 p-4 text-sm dark:border-amber-800 dark:bg-amber-950/20">
						<AlertTriangle className="h-5 w-5 shrink-0 text-amber-600 dark:text-amber-500" />
						<div>
							<p className="mb-1 font-medium text-amber-800 dark:text-amber-300">
								Are you sure?
							</p>
							<p className="text-amber-700 dark:text-amber-400">
								This will cancel your slot so others can book it. This action
								cannot be undone.
							</p>
						</div>
					</div>

					{/* Confirm cancel button */}
					<div className="flex gap-3 pt-2">
						<Button
							variant="outline"
							className="flex-1"
							onClick={() => router.back()}
							disabled={isCancelling}
						>
							Keep Booking
						</Button>
						<Button
							variant="destructive"
							className="flex-1 gap-2"
							onClick={() => doCancel()}
							disabled={isCancelling}
						>
							{isCancelling ? (
								<Loader2 className="h-4 w-4 animate-spin" />
							) : (
								<XCircle className="h-4 w-4" />
							)}
							Confirm Cancel
						</Button>
					</div>
				</CardContent>
			</Card>
		</div>
	);
}
