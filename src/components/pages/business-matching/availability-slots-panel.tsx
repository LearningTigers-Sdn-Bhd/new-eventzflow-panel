"use client";

import { useEffect, useState } from "react";
import { Calendar } from "@/components/ui/calendar"; // Use project's Calendar component
import "react-day-picker/dist/style.css"; // Assuming basic styling is needed

import {
	ArrowLeft,
	Box,
	Calendar as CalendarIcon,
	Loader2,
} from "lucide-react"; // Aliased Calendar icon
import { ErrorState } from "@/components/data-state";
import { Button } from "@/components/ui/button";
import {
	Empty,
	EmptyDescription,
	EmptyHeader,
	EmptyMedia,
	EmptyTitle,
} from "@/components/ui/empty";
import { ScrollArea } from "@/components/ui/scroll-area";
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
	const {
		data: detailedSlotsData,
		isLoading: isLoadingDetailedSlots,
		isFetching: isFetchingDetailedSlots,
	} = useBusinessMatchingDetailedSlots(
		bmEventId,
		selectedFormattedDate ?? null,
		eventId,
	);

	const isRefreshing =
		isLoading ||
		isFetching ||
		isLoadingDetailedSlots ||
		isFetchingDetailedSlots;

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
		const calendarStyle = isMobile
			? ({ "--cell-size": "clamp(26px, 11vw, 32px)" } as React.CSSProperties)
			: undefined;
		const calendarClassNames = isMobile
			? {
					root: "rdp w-full mx-auto flex justify-center",
					months: "rdp-months flex flex-col items-center",
					month: "rdp-month w-full flex flex-col items-center",
					nav: "rdp-nav absolute inset-x-0 top-0 flex w-full max-w-[360px] items-center justify-between gap-1 px-1",
					month_caption:
						"rdp-caption flex h-(--cell-size) w-full max-w-[360px] items-center justify-center px-4 text-sm",
					weekdays: "flex w-full max-w-[360px] mx-auto justify-between",
					week: "mt-2 flex w-full max-w-[360px] mx-auto justify-between",
					table: "w-full max-w-[360px] mx-auto border-collapse",
				}
			: undefined;

		return (
			<div className="flex w-full flex-col items-center overflow-hidden">
				<h3 className="mb-4 flex items-center gap-2 self-start font-semibold text-lg md:self-center">
					<CalendarIcon className="h-5 w-5" /> Available Dates
				</h3>
				<div className="flex w-full justify-center overflow-x-auto pb-2">
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
							today: "bg-green-100 text-emerald-800 rounded-full",
							available: "bg-green-100 text-emerald-800 rounded-full",
							selected: "!bg-emerald-600 !text-white rounded-full",
						}}
						className={
							isMobile
								? "w-full rounded-md border p-1 text-sm"
								: "w-fit rounded-md border p-2"
						}
						style={calendarStyle}
						classNames={calendarClassNames}
					/>
				</div>
			</div>
		);
	};

	const renderSlots = () => {
		return (
			<div className="w-full">
				<h3 className="mb-4 text-center font-semibold text-lg md:text-xl">
					{selectedDate
						? `Select a slot for ${selectedFormattedDate}:`
						: "Select a date to view slots"}
				</h3>

				{isLoadingDetailedSlots && (
					<div className="flex h-32 items-center justify-center p-4">
						<Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
						<span className="ml-2 text-base text-muted-foreground">
							Loading slots...
						</span>
					</div>
				)}

				{!isLoadingDetailedSlots &&
					detailedSlotsData &&
					detailedSlotsData.slots &&
					detailedSlotsData.slots.length > 0 && (
						<ScrollArea className="h-[300px] overflow-y-auto">
							<div className="grid grid-cols-2 gap-4 p-1 pr-3">
								{detailedSlotsData.slots.map((item, index) => (
									<button
										key={`${item.slot}-${index}`}
										type="button"
										className="flex cursor-pointer items-center justify-center rounded-lg border p-2 text-center transition-colors hover:bg-primary hover:text-primary-foreground"
										onClick={() => {
											if (selectedFormattedDate) {
												setSelectedSlot({
													date: selectedFormattedDate,
													time: item.slot,
												});
											}
										}}
									>
										<p className="font-medium text-md">{item.slot}</p>
									</button>
								))}
							</div>
						</ScrollArea>
					)}

				{!isLoadingDetailedSlots &&
					selectedDate &&
					(!detailedSlotsData || detailedSlotsData.slots.length === 0) && (
						<div className="mx-auto mt-2 flex w-full items-center justify-center py-2">
							<Empty className="border-0 p-0">
								<EmptyHeader>
									<EmptyMedia variant="icon">
										<Box />
									</EmptyMedia>
									<EmptyTitle>No slots yet</EmptyTitle>
									<EmptyDescription>
										We are fetching the latest data for this date. Please wait a
										moment...
									</EmptyDescription>
								</EmptyHeader>
							</Empty>
						</div>
					)}
			</div>
		);
	};

	if (isMobile) {
		return (
			<div className="space-y-4">
				<Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
					<TabsList className="mb-4 grid w-full grid-cols-2">
						<TabsTrigger value="date">Date</TabsTrigger>
						<TabsTrigger value="slots" disabled={!selectedDate}>
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
		<div className="flex flex-col justify-center gap-4 md:flex-row">
			<div className="flex-1">{renderCalendar()}</div>

			<div className="flex-1 border-gray-300 border-t-2 pt-4 md:border-t-0 md:border-l-2 md:pt-0 md:pl-4 dark:border-gray-700">
				{renderSlots()}
			</div>
		</div>
	);
}
