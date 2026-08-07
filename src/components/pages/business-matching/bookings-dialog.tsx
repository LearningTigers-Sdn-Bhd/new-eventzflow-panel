import { useQueryClient } from "@tanstack/react-query";
import { format } from "date-fns";
import { Calendar, LayoutGrid, List, Loader2 } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import { ErrorState } from "@/components/data-state";
import { Button } from "@/components/ui/button";
import {
	Empty,
	EmptyDescription,
	EmptyHeader,
	EmptyTitle,
} from "@/components/ui/empty";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
	useBusinessMatchingBookings,
	useForceRefreshBookings,
} from "@/hooks/use-business-matching";
import { BookingCardItem } from "./booking-card-item";
import { CompactBookingRow } from "./compact-booking-row";

interface BookingsDialogProps {
	bmEventId: string;
	eventId: string;
}

export default function BookingsDialog({
	bmEventId,
	eventId,
}: BookingsDialogProps) {
	const {
		data,
		isLoading,
		error,
		isFetching: _isFetchingBookings,
		refetch: _refetch,
	} = useBusinessMatchingBookings(bmEventId, eventId);
	const [searchQuery, setSearchQuery] = useState("");
	const [viewMode, setViewMode] = useState<"detailed" | "compact">("detailed");
	const _queryClient = useQueryClient();
	const { mutate: forceRefreshBookings, isPending: isRefreshingBookings } =
		useForceRefreshBookings(bmEventId, eventId);

	// Format today's date to match the "dd MMMM" format (e.g., "03 November")
	const todayString = format(new Date(), "dd MMMM");

	const _handleRefreshBookings = () => {
		forceRefreshBookings();
		toast.info("Refreshing bookings...");
	};

	const isRefreshing = isRefreshingBookings || isLoading;

	if (isRefreshing) {
		// Use isRefreshing
		return (
			<div className="flex h-64 items-center justify-center">
				<Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
				<span className="ml-2 text-muted-foreground">Loading bookings...</span>
			</div>
		);
	}

	if (error) {
		return (
			<ErrorState
				title="Failed to load bookings"
				description="Could not fetch bookings. Please try again."
				height="h-64"
			/>
		);
	}

	if (!data || data.bookings.length === 0) {
		return (
			<div className="flex w-full items-center justify-center py-8">
				<Empty className="border-0 p-0">
					<EmptyHeader>
						<EmptyTitle>No bookings found yet</EmptyTitle>
						<EmptyDescription>
							No new bookings at the moment. Please wait a moment...
						</EmptyDescription>
					</EmptyHeader>
				</Empty>
			</div>
		);
	}

	const bookings = data.bookings;

	// Helper function to create a sortable Date object from booking details
	const getSortableDate = (booking: (typeof bookings)[0]) => {
		// e.g., "03 November" and "10:00 AM" -> "03 November 2024 10:00"
		const year = new Date().getFullYear();
		const dateTimeString = `${booking.booking_date} ${year} ${booking.booking_time}`;
		// Adjust for AM/PM if present, otherwise assume 24h
		const parsableString = dateTimeString.replace(/ (AM|PM)$/, "M");
		return new Date(parsableString);
	};

	const filteredBookings = bookings
		.filter((booking) => {
			const query = searchQuery.toLowerCase();
			return (
				booking.name.toLowerCase().includes(query) ||
				booking.email?.toLowerCase().includes(query) ||
				booking.phone?.toLowerCase().includes(query) ||
				booking.location?.toLowerCase().includes(query) ||
				booking.host_comment?.toLowerCase().includes(query) ||
				booking.potential_deal_value
					?.toString()
					.toLowerCase()
					.includes(query) ||
				booking.booking_date.toLowerCase().includes(query) ||
				booking.booking_time.toLowerCase().includes(query)
			);
		})
		.sort(
			(a, b) => getSortableDate(a).getTime() - getSortableDate(b).getTime(),
		);

	const todayBookings = filteredBookings
		.filter((b) => b.booking_date?.includes(todayString))
		.sort((a, b) => {
			const now = new Date();
			const dateA = getSortableDate(a);
			const dateB = getSortableDate(b);

			// If a booking is in the past, push it to the bottom
			if (dateA < now && dateB >= now) return 1;
			if (dateB < now && dateA >= now) return -1;

			// Otherwise, sort by time
			return dateA.getTime() - dateB.getTime();
		});

	const renderBookings = (bookings: typeof filteredBookings) =>
		viewMode === "compact" ? (
			<div className="flex flex-col gap-1.5 p-1 pb-4">
				{bookings.map((booking) => (
					<CompactBookingRow key={booking.id} booking={booking} />
				))}
			</div>
		) : (
			<div className="grid grid-cols-1 gap-4 p-1 pb-4 md:grid-cols-2 lg:grid-cols-3">
				{bookings.map((booking) => (
					<BookingCardItem
						key={booking.id}
						booking={booking}
						bmEventId={bmEventId}
						eventId={eventId}
					/>
				))}
			</div>
		);

	return (
		<div className="flex h-full min-h-0 w-full flex-col overflow-hidden p-1">
			<div className="mb-1.5 flex items-center gap-2 px-1">
				<Input
					placeholder="Search bookings..."
					value={searchQuery}
					onChange={(e) => setSearchQuery(e.target.value)}
					className="h-8 flex-1 text-sm"
				/>
				<div className="flex shrink-0 items-center gap-0.5 rounded-md border p-0.5">
					<Button
						type="button"
						variant={viewMode === "detailed" ? "secondary" : "ghost"}
						size="icon"
						className="h-7 w-7"
						onClick={() => setViewMode("detailed")}
						title="Detailed view"
					>
						<LayoutGrid className="h-3.5 w-3.5" />
					</Button>
					<Button
						type="button"
						variant={viewMode === "compact" ? "secondary" : "ghost"}
						size="icon"
						className="h-7 w-7"
						onClick={() => setViewMode("compact")}
						title="Compact view"
					>
						<List className="h-3.5 w-3.5" />
					</Button>
				</div>
			</div>
			<Tabs
				defaultValue={todayBookings.length > 0 ? "today" : "all"}
				className="flex min-h-0 w-full flex-1 flex-col gap-1.5 overflow-hidden"
			>
				<div className="shrink-0 px-1">
					<TabsList className="grid w-full grid-cols-2">
						<TabsTrigger value="today">
							Today ({todayBookings.length})
						</TabsTrigger>
						<TabsTrigger value="all">
							All ({filteredBookings.length})
						</TabsTrigger>
					</TabsList>
				</div>

				<TabsContent
					value="today"
					className="mt-0 min-h-0 flex-1 overflow-hidden"
				>
					<ScrollArea className="h-full">
						{todayBookings.length > 0 ? (
							renderBookings(todayBookings)
						) : (
							<div className="flex h-40 flex-col items-center justify-center text-muted-foreground">
								<Calendar className="mb-2 h-10 w-10 opacity-20" />
								<p>No bookings found for today.</p>
							</div>
						)}
					</ScrollArea>
				</TabsContent>

				<TabsContent
					value="all"
					className="mt-0 min-h-0 flex-1 overflow-hidden"
				>
					<ScrollArea className="h-full">
						{filteredBookings.length > 0 ? (
							renderBookings(filteredBookings)
						) : (
							<div className="flex h-40 flex-col items-center justify-center text-muted-foreground">
								<Calendar className="mb-2 h-10 w-10 opacity-20" />
								<p>No bookings found.</p>
							</div>
						)}
					</ScrollArea>
				</TabsContent>
			</Tabs>
		</div>
	);
}
