"use client";

import { format } from "date-fns";
import {
	ArrowLeft,
	Box,
	Calendar as CalendarIcon,
	Clock,
	Loader2,
} from "lucide-react"; // Aliased Calendar icon
import { useEffect, useState } from "react";
import { ErrorState } from "@/components/data-state";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar"; // Use project's Calendar component
import {
	Empty,
	EmptyDescription,
	EmptyHeader,
	EmptyTitle,
} from "@/components/ui/empty";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
	useBusinessMatchingAvailability,
	useBusinessMatchingDetailedSlots,
} from "@/hooks/use-business-matching";
import { useIsMobile } from "@/hooks/use-mobile";
import {
	formatAvailabilityDate,
	isAvailableDate,
} from "@/lib/business-matching-dates";
import { useBusinessMatchingStore } from "@/stores/use-business-matching-store";
import CreateBookingForm from "./create-booking-form";

interface AvailabilitySlotsPanelProps {
	bmEventId: string;
	eventId: string;
}

export default function AvailabilitySlotsPanel({
	bmEventId,
	eventId,
}: AvailabilitySlotsPanelProps) {
	const { setSelectedBusinessMatchingDate } = useBusinessMatchingStore();
	const isMobile = useIsMobile();
	const [activeTab, setActiveTab] = useState("date");
	const [selectedDate, setSelectedDate] = useState<Date | undefined>(undefined);
	const [selectedFormattedDate, setSelectedFormattedDate] = useState<
		string | undefined
	>(undefined);
	const [selectedSlot, setSelectedSlot] = useState<{
		date: string;
		time: string;
	} | null>(null);

	const { data, isLoading, error, isFetching } =
		useBusinessMatchingAvailability(bmEventId, eventId);
	const { data: detailedSlotsData, isLoading: isLoadingDetailedSlots } =
		useBusinessMatchingDetailedSlots(
			bmEventId,
			selectedFormattedDate ?? null,
			eventId,
		);

	const isRefreshing = isLoading || isFetching;

	useEffect(() => {
		return () => {
			setSelectedBusinessMatchingDate(undefined);
		};
	}, [setSelectedBusinessMatchingDate]);

	if (selectedSlot) {
		return (
			<div className="p-1">
				<div className="mb-4 flex items-center gap-2">
					<Button
						variant="ghost"
						size="icon"
						onClick={() => setSelectedSlot(null)}
						className="h-8 w-8"
					>
						<ArrowLeft className="h-4 w-4" />
					</Button>
					<h3 className="font-semibold text-lg">Create Booking</h3>
				</div>
				<CreateBookingForm
					bmEventId={bmEventId}
					eventId={eventId}
					initialDate={selectedSlot.date}
					initialTime={selectedSlot.time}
					onClose={() => setSelectedSlot(null)}
				/>
			</div>
		);
	}

	if (isRefreshing) {
		return (
			<div className="flex h-64 items-center justify-center">
				<Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
				<span className="ml-2 text-muted-foreground">
					Checking availability...
				</span>
			</div>
		);
	}

	if (error) {
		return (
			<ErrorState
				title="Failed to load availability"
				description="Could not fetch availability slots. Please try again."
				height="h-64"
			/>
		);
	}

	const hasAvailableDates = data?.dates && data.dates.length > 0; // Ensure data.dates exists

	if (!hasAvailableDates) {
		return (
			<div className="mx-auto mt-2 flex w-full items-center justify-center py-2">
				<Empty className="border-0 p-0">
					<EmptyHeader>
						<EmptyTitle>No slots available yet</EmptyTitle>
						<EmptyDescription>
							We are fetching the latest data. Please wait a moment...
						</EmptyDescription>
					</EmptyHeader>
				</Empty>
			</div>
		);
	}

	const renderCalendar = () => {
		const calendarStyle = {
			"--cell-size": isMobile
				? "clamp(32px, 11vw, 44px)"
				: "clamp(44px, 3.4vw, 60px)",
		} as React.CSSProperties;

		return (
			<div className="flex w-full flex-col gap-4">
				<div>
					<h3 className="flex items-center gap-2 font-semibold text-base">
						<CalendarIcon className="h-4 w-4" /> Pick a date
					</h3>
					<p className="text-muted-foreground text-sm">
						Dates with open slots are highlighted.
					</p>
				</div>
				<div className="flex w-full justify-center border p-2">
					<Calendar
						mode="single"
						selected={selectedDate}
						onSelect={(date) => {
							setSelectedDate(date);
							if (date) {
								const formatted = formatAvailabilityDate(date);
								setSelectedFormattedDate(formatted);
								setSelectedBusinessMatchingDate(formatted); // Update Zustand store
								if (isMobile) setActiveTab("slots");
							} else {
								setSelectedFormattedDate(undefined);
								setSelectedBusinessMatchingDate(undefined); // Clear Zustand store
							}
						}}
						disabled={(day) => !isAvailableDate(day, data?.dates)}
						modifiers={{
							available: (day) => isAvailableDate(day, data?.dates),
						}}
						modifiersClassNames={{
							today: "[&>button]:ring-1 [&>button]:ring-muted-foreground/40",
							available:
								"[&>button]:rounded-full [&>button]:bg-green-100 [&>button]:font-semibold [&>button]:text-green-800 [&>button]:hover:bg-green-200",
							selected:
								"[&>button]:rounded-full [&>button]:bg-green-600! [&>button]:text-white! [&>button]:hover:bg-green-700!",
						}}
						className="w-fit p-1"
						// Drop the shared range-edge corner rules so a selected Sat/Sun stays round.
						classNames={{
							day: "group/day relative aspect-square h-full w-full select-none p-0 text-center min-w-(--cell-size) [&>button]:mx-auto [&>button]:size-12 [&>button]:min-w-0",
						}}
						style={calendarStyle}
					/>
				</div>
				<div className="flex flex-wrap items-center gap-4 px-3 text-muted-foreground text-xs">
					<span className="flex items-center gap-1.5">
						<span className="h-3 w-3 rounded-full bg-green-100 ring-1 ring-green-300" />
						Available
					</span>
					<span className="flex items-center gap-1.5">
						<span className="h-3 w-3 rounded-full bg-green-600" />
						Selected
					</span>
					<span className="flex items-center gap-1.5">
						<span className="h-3 w-3 rounded-full ring-1 ring-muted-foreground/40" />
						Today
					</span>
				</div>
			</div>
		);
	};

	const renderSlots = () => {
		const slots = detailedSlotsData?.slots ?? [];

		return (
			<div className="flex w-full flex-col gap-4">
				<div className="flex items-start justify-between gap-2">
					<div>
						<h3 className="flex items-center gap-2 font-semibold text-base">
							<Clock className="h-4 w-4" />
							{selectedDate
								? format(selectedDate, "EEEE, d MMMM yyyy")
								: "Time slots"}
						</h3>
						<p className="text-muted-foreground text-sm">
							{selectedDate
								? "Choose a slot to create a booking."
								: "Select a date to see its open slots."}
						</p>
					</div>
					{selectedDate && !isLoadingDetailedSlots && (
						<Badge
							variant="secondary"
							className="shrink-0 rounded-none bg-green-100 text-green-800"
						>
							{slots.length} open
						</Badge>
					)}
				</div>

				{!selectedDate && (
					<div className="flex h-56 flex-col items-center justify-center gap-2 border border-dashed text-muted-foreground">
						<CalendarIcon className="h-8 w-8 opacity-30" />
						<p className="text-sm">No date selected</p>
					</div>
				)}

				{selectedDate && isLoadingDetailedSlots && (
					<div className="flex h-56 items-center justify-center gap-2 border border-dashed text-muted-foreground">
						<Loader2 className="h-5 w-5 animate-spin" />
						<span className="text-sm">Loading slots...</span>
					</div>
				)}

				{selectedDate && !isLoadingDetailedSlots && slots.length > 0 && (
					<div className="grid grid-cols-2 gap-2 sm:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-6">
						{slots.map((item) => (
							<button
								key={item.slot}
								type="button"
								className="flex cursor-pointer items-center justify-center gap-1.5 rounded-none border bg-background px-3 py-3 font-medium text-sm tabular-nums transition-colors hover:border-green-600 hover:bg-green-600 hover:text-white"
								onClick={() => {
									if (selectedFormattedDate) {
										setSelectedSlot({
											date: selectedFormattedDate,
											time: item.slot,
										});
									}
								}}
							>
								{item.slot}
							</button>
						))}
					</div>
				)}

				{selectedDate && !isLoadingDetailedSlots && slots.length === 0 && (
					<div className="flex h-56 flex-col items-center justify-center gap-2 border border-dashed text-muted-foreground">
						<Box className="h-8 w-8 opacity-30" />
						<p className="text-sm">No open slots on this date</p>
					</div>
				)}
			</div>
		);
	};

	if (isMobile) {
		return (
			<div className="space-y-4">
				<Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
					<TabsList className="mb-4 grid w-full grid-cols-2 rounded-none">
						<TabsTrigger value="date" className="rounded-none">
							Date
						</TabsTrigger>
						<TabsTrigger
							value="slots"
							disabled={!selectedDate}
							className="rounded-none"
						>
							Slots
						</TabsTrigger>
					</TabsList>

					<TabsContent value="date">{renderCalendar()}</TabsContent>

					<TabsContent value="slots">{renderSlots()}</TabsContent>
				</Tabs>
			</div>
		);
	}

	return (
		<div className="grid gap-6 lg:grid-cols-[minmax(0,5fr)_minmax(0,7fr)]">
			<div>{renderCalendar()}</div>
			<div className="border-t pt-6 lg:border-t-0 lg:border-l lg:pt-0 lg:pl-6">
				{renderSlots()}
			</div>
		</div>
	);
}
