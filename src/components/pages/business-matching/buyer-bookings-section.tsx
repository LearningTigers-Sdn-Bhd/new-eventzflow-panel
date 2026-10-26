"use client";

import { CalendarClock, MapPin, ShoppingBag } from "lucide-react";
import type { Route } from "next";
import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { useBuyerBookings } from "@/hooks/use-business-matching";
import { cn } from "@/lib/utils";

const BOOKING_STATUS_STYLE: Record<string, string> = {
	Approved: "bg-green-100 text-green-800",
	Confirmed: "bg-green-100 text-green-800",
	Pending: "bg-amber-100 text-amber-800",
	Cancelled: "bg-gray-100 text-gray-800",
};

interface BuyerBookingsSectionProps {
	eventId: string;
	// Business hosts always see the section (with a prompt to book) — a seller
	// can also be a buyer. Staff only see it once they have bookings.
	alwaysShow: boolean;
}

export default function BuyerBookingsSection({
	eventId,
	alwaysShow,
}: BuyerBookingsSectionProps) {
	const { data } = useBuyerBookings(eventId);

	if (!alwaysShow && (data?.bookings ?? []).length === 0) return null;

	const bookMeetingHref = `/event/${eventId}/book-meeting` as Route;

	return (
		<section className="space-y-3 border bg-card p-3 md:p-4">
			<div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
				<div>
					<h2 className="flex items-center gap-2 font-semibold text-base">
						<ShoppingBag className="h-4 w-4" />
						My Bookings as a Buyer
					</h2>
					<p className="text-muted-foreground text-sm">
						Meetings you booked with other sellers. They also appear on each
						seller's schedule.
					</p>
				</div>
				<Button
					asChild
					variant="outline"
					size="sm"
					className="h-8 shrink-0 self-start rounded-none sm:self-center"
				>
					<Link href={bookMeetingHref} target="_blank">
						Book a Meeting
					</Link>
				</Button>
			</div>

			<BuyerBookingsList
				eventId={eventId}
				emptyText="You haven't booked any meetings with other sellers yet."
			/>
		</section>
	);
}

interface BuyerBookingsListProps {
	eventId: string;
	// Staff viewing a seller pass the seller's user id; omitted = current user.
	hostUserId?: string;
	emptyText: string;
}

export function BuyerBookingsList({
	eventId,
	hostUserId,
	emptyText,
}: BuyerBookingsListProps) {
	const { data, isLoading, error } = useBuyerBookings(eventId, hostUserId);
	const bookings = data?.bookings ?? [];

	return isLoading ? (
		<p className="text-muted-foreground text-sm">Loading bookings…</p>
	) : error ? (
		<p className="text-destructive text-sm">
			Could not load bookings. Please try again later.
		</p>
	) : bookings.length === 0 ? (
		<p className="text-muted-foreground text-sm">{emptyText}</p>
	) : (
		<ul className="divide-y border">
			{bookings.map((booking) => {
				const isCancelled = booking.status === "Cancelled";
				return (
					<li
						key={booking.id}
						className={cn(
							"flex flex-col gap-2 p-3 sm:flex-row sm:items-center sm:justify-between",
							isCancelled && "opacity-60",
						)}
					>
						<div className="min-w-0 space-y-1">
							<div className="flex flex-wrap items-center gap-2">
								<span className="truncate font-medium text-sm">
									{booking.event_title}
								</span>
								<Badge
									variant="secondary"
									className={cn(
										"shrink-0 rounded-none",
										BOOKING_STATUS_STYLE[booking.status] ??
											"bg-gray-100 text-gray-800",
									)}
								>
									{booking.status}
								</Badge>
							</div>
							<div className="flex flex-wrap gap-x-4 gap-y-1 text-muted-foreground text-xs">
								<span className="flex items-center gap-1">
									<CalendarClock className="h-3.5 w-3.5" />
									{booking.booking_date}, {booking.booking_time}
								</span>
								{booking.location && (
									<span className="flex items-center gap-1">
										<MapPin className="h-3.5 w-3.5" />
										{booking.location}
									</span>
								)}
								{booking.host_name && <span>Host: {booking.host_name}</span>}
							</div>
						</div>
						{!isCancelled && (
							<div className="flex shrink-0 gap-2">
								<Button
									asChild
									variant="outline"
									size="sm"
									className="h-7 rounded-none"
								>
									<Link href={booking.reschedule_link as Route} target="_blank">
										Reschedule
									</Link>
								</Button>
								<Button
									asChild
									variant="ghost"
									size="sm"
									className="h-7 rounded-none text-destructive hover:text-destructive"
								>
									<Link href={booking.cancel_link as Route} target="_blank">
										Cancel
									</Link>
								</Button>
							</div>
						)}
					</li>
				);
			})}
		</ul>
	);
}
