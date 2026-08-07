import { Calendar, Clock, ExternalLink, MapPin, User } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import type { Booking } from "@/lib/api/business-matching";
import { cn } from "@/lib/utils";

interface CompactBookingRowProps {
	booking: Booking;
}

export function CompactBookingRow({ booking }: CompactBookingRowProps) {
	return (
		<div className="flex flex-wrap items-center gap-x-4 gap-y-1 rounded-md border bg-card px-3 py-2 text-sm">
			<div className="flex min-w-0 flex-1 basis-40 items-center gap-1.5">
				<User className="h-3.5 w-3.5 shrink-0 text-muted-foreground" />
				<span className="truncate font-medium" title={booking.name}>
					{booking.name}
				</span>
			</div>
			<div className="flex shrink-0 items-center gap-1.5 text-muted-foreground">
				<Calendar className="h-3.5 w-3.5 shrink-0" />
				<span>{booking.booking_date}</span>
			</div>
			<div className="flex shrink-0 items-center gap-1.5 text-muted-foreground">
				<Clock className="h-3.5 w-3.5 shrink-0" />
				<span>{booking.booking_time}</span>
			</div>
			{booking.location && (
				<div className="flex min-w-0 flex-1 basis-32 items-center gap-1.5 text-muted-foreground">
					<MapPin className="h-3.5 w-3.5 shrink-0" />
					{booking.location.startsWith("http") ? (
						<a
							href={booking.location}
							target="_blank"
							rel="noreferrer"
							className="flex items-center gap-1 truncate text-primary hover:underline"
						>
							Online <ExternalLink className="h-3 w-3 shrink-0" />
						</a>
					) : (
						<span className="truncate" title={booking.location}>
							{booking.location}
						</span>
					)}
				</div>
			)}
			<Badge
				variant={
					booking.status === "Approved"
						? "default"
						: booking.status === "Pending"
							? "secondary"
							: "outline"
				}
				className={cn(
					"ml-auto h-5 shrink-0 px-1.5 text-[10px]",
					booking.status === "Approved"
						? "bg-green-600 hover:bg-green-700"
						: booking.status === "Pending"
							? "bg-yellow-500 text-white hover:bg-yellow-600"
							: "",
				)}
			>
				{booking.status}
			</Badge>
		</div>
	);
}
