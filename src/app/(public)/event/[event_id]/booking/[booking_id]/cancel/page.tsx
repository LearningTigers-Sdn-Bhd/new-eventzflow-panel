"use client";

import { AlertTriangle, ArrowLeft, Calendar as CalendarIcon, CheckCircle2, Loader2, XCircle } from "lucide-react";
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
import { useQuery, useMutation } from "@tanstack/react-query";
import {
	getPublicBookingInfo,
	cancelBooking,
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
	if (booking.status === "Cancelled" || done) {
		return (
			<div className="flex min-h-screen items-center justify-center p-4">
				<Card className="max-w-md w-full text-center shadow-lg">
					<CardHeader className="pb-4">
						<CheckCircle2 className="h-16 w-16 text-green-500 mx-auto mb-3" />
						<CardTitle className="text-2xl font-bold">Booking Cancelled</CardTitle>
						<CardDescription>
							Your meeting has been successfully cancelled.
						</CardDescription>
					</CardHeader>
					<CardContent className="space-y-4">
						<div className="rounded-xl border bg-muted/30 p-4 text-sm space-y-2 text-left">
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
		<div className="min-h-screen bg-gradient-to-b from-background to-muted/30 flex flex-col items-center justify-start px-4 py-12">
			{/* Header */}
			<div className="w-full max-w-md mb-6">
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

			<Card className="w-full max-w-md shadow-lg border-destructive/20">
				<CardHeader className="border-b pb-5">
					<div className="flex items-center gap-3">
						<div className="rounded-full bg-destructive/10 p-2.5">
							<XCircle className="h-5 w-5 text-destructive" />
						</div>
						<div>
							<CardTitle className="text-xl">Cancel Your Meeting</CardTitle>
							<CardDescription>
								Cancel your meeting for <span className="font-medium text-foreground">{booking.session_title}</span>
							</CardDescription>
						</div>
					</div>
				</CardHeader>

				<CardContent className="pt-6 space-y-6">
					{/* Current booking info */}
					<div className="rounded-lg border bg-muted/50 p-4 text-sm space-y-2">
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

					<div className="rounded-lg border bg-amber-50 dark:bg-amber-950/20 border-amber-200 dark:border-amber-800 p-4 text-sm flex gap-3">
						<AlertTriangle className="h-5 w-5 text-amber-600 dark:text-amber-500 shrink-0" />
						<div>
							<p className="text-amber-800 dark:text-amber-300 font-medium mb-1">Are you sure?</p>
							<p className="text-amber-700 dark:text-amber-400">
								This will cancel your slot so others can book it. This action cannot be undone.
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
