"use client";

import { format, parseISO } from "date-fns";
import { CheckCircle, Loader2 } from "lucide-react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { use } from "react";
import { Button } from "@/components/ui/button";
import {
	Card,
	CardContent,
	CardDescription,
	CardHeader,
	CardTitle,
} from "@/components/ui/card";
import { usePublicBookingDetails } from "@/hooks/use-business-matching-public";

interface BookingConfirmationPageProps {
	params: Promise<{
		event_id: string;
	}>;
}

export default function BookingConfirmationPage({
	params,
}: BookingConfirmationPageProps) {
	const { event_id } = use(params);
	const searchParams = useSearchParams();

	const bookingId = searchParams.get("bookingId") || "";
	const bmEventId = searchParams.get("bmEventId") || "";

	const {
		data: bookingDetails,
		isLoading,
		error,
	} = usePublicBookingDetails(bookingId, bmEventId, event_id, {
		enabled: !!bookingId && !!bmEventId && !!event_id,
	});

	if (isLoading) {
		return (
			<div className="flex min-h-[50vh] items-center justify-center">
				<Loader2 className="h-8 w-8 animate-spin text-primary" />
			</div>
		);
	}

	if (error || !bookingDetails) {
		return (
			<div className="container mx-auto max-w-3xl p-4 py-10 text-center">
				<Card>
					<CardHeader>
						<CardTitle className="font-bold text-3xl text-destructive">
							Error!
						</CardTitle>
						<CardDescription>
							{error
								? error.message
								: "Booking details not found. Please try booking again."}
						</CardDescription>
					</CardHeader>
					<CardContent className="flex justify-center">
						<Link href={`/event/${event_id}/book-meeting`}>
							<Button>Go to Booking Page</Button>
						</Link>
					</CardContent>
				</Card>
			</div>
		);
	}

	const formattedBookingDate = bookingDetails.booking_date
		? format(parseISO(bookingDetails.booking_date), "PPP")
		: "N/A";
	const _formattedCreatedAt = bookingDetails.created_at
		? format(parseISO(bookingDetails.created_at), "PPPp")
		: "N/A";

	return (
		<div className="container mx-auto max-w-3xl p-4 py-10">
			<Card className="text-center">
				<CardHeader>
					<CheckCircle className="mx-auto mb-4 h-16 w-16 text-green-500" />
					<CardTitle className="font-bold text-3xl">
						Booking Confirmed!
					</CardTitle>
					<CardDescription>
						Your meeting has been successfully booked.
					</CardDescription>
				</CardHeader>
				<CardContent className="space-y-4 text-left">
					<p className="text-lg">Hi {bookingDetails.name},</p>
					<p>Thank you for booking a meeting. Here are your booking details:</p>

					<div className="space-y-2 rounded-lg border bg-muted/30 p-4 text-sm">
						<div className="flex justify-between">
							<span className="text-muted-foreground">Host:</span>{" "}
							<span className="font-medium">
								{bookingDetails.event_title || "N/A"}
							</span>
						</div>
						<div className="flex justify-between">
							<span className="text-muted-foreground">Date:</span>{" "}
							<span className="font-medium">{formattedBookingDate}</span>
						</div>
						<div className="flex justify-between">
							<span className="text-muted-foreground">Time:</span>{" "}
							<span className="font-medium">{bookingDetails.booking_time}</span>
						</div>
						<div className="flex justify-between">
							<span className="text-muted-foreground">Location:</span>{" "}
							<span className="font-medium">
								{bookingDetails.location || "To be confirmed"}
							</span>
						</div>
					</div>

					<p className="text-muted-foreground text-sm">
						A confirmation email with these details has been sent to{" "}
						{bookingDetails.email}. Please check your inbox (or your spam
						folder).
					</p>
				</CardContent>
				<CardContent className="mt-6 flex flex-col gap-4 md:flex-row md:justify-between">
					<Link href="/" className="w-full md:w-auto">
						<Button variant="outline" className="w-full md:w-auto">
							Return to Home
						</Button>
					</Link>
					<Link
						href={`/event/${event_id}/book-meeting`}
						className="w-full md:w-auto"
					>
						<Button className="w-full md:w-auto">Book Another Meeting</Button>
					</Link>
				</CardContent>
			</Card>
		</div>
	);
}
