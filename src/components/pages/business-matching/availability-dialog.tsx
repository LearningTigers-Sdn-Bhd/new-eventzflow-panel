import { useState } from "react";
import { format } from "date-fns";
import { Calendar } from "@/components/ui/calendar"; // Use project's Calendar component
import "react-day-picker/dist/style.css"; // Assuming basic styling is needed

import { Loader2, Calendar as CalendarIcon, Box } from "lucide-react"; // Aliased Calendar icon
import { ErrorState, EmptyState } from "@/components/data-state";
import {
	Empty,
	EmptyDescription,
	EmptyHeader,
	EmptyMedia,
	EmptyTitle,
} from "@/components/ui/empty";
import { useBusinessMatchingAvailability, useBusinessMatchingDetailedSlots } from "@/hooks/use-business-matching";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Button } from "@/components/ui/button";

interface AvailabilityDialogProps {
	bmEventId: string;
	eventId: string; // Changed from internalEventId
	eventTitle: string;
	onClose?: () => void; // Optional if handled by dialog store
}

export default function AvailabilityDialog({
	bmEventId,
	eventId, // Changed from internalEventId
	eventTitle,
}: AvailabilityDialogProps) {
	const [selectedDate, setSelectedDate] = useState<Date | undefined>(undefined);
	const [selectedFormattedDate, setSelectedFormattedDate] = useState<string | undefined>(undefined);

	const { data, isLoading, error } = useBusinessMatchingAvailability(bmEventId, eventId);

	const { data: detailedSlotsData, isLoading: isLoadingDetailedSlots } = useBusinessMatchingDetailedSlots(
		bmEventId,
		selectedFormattedDate,
		eventId
	);

	if (isLoading) {
		return (
			<div className="flex h-64 items-center justify-center">
				<Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
				<span className="ml-2 text-muted-foreground">Checking availability...</span>
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

	if (!data || data.dates.length === 0) {
		return (
			<div className="flex w-full items-center justify-center py-2 mt-2 mx-auto">
				<Empty className="p-0 border-0">
					<EmptyHeader>
						<EmptyTitle>No slots available</EmptyTitle>
						<EmptyDescription>There are no available dates for this event.</EmptyDescription>
					</EmptyHeader>
				</Empty>
			</div>
		);
	}

	return (
		<div className="p-4">
			<div className="flex flex-col md:flex-row gap-4 justify-center">
				<div className="flex-1">
					<h3 className="mb-4 font-semibold text-lg flex items-center gap-2">
						<CalendarIcon className="h-5 w-5" /> Available Dates
					</h3>
	                <Calendar
						mode="single"
						selected={selectedDate}
						onSelect={(date) => {
							setSelectedDate(date);
							if (date) {
								// Format date to "DD Month YYYY" e.g., "12 December 2025"
								setSelectedFormattedDate(format(date, "dd MMMM yyyy"));
							} else {
								setSelectedFormattedDate(undefined);
							}
						}}
						disabled={(day) => {
							// Disable dates that are not in the available dates list
							const formattedDay = format(day, "dd MMMM yyyy");
							return !data?.dates.some(
								(item) => item.date === formattedDay,
							);
						}}
						// Optionally, add modifiers to style available dates
						modifiers={{
							available: (day) => {
								const formattedDay = format(day, "dd MMMM yyyy");
								return (
									data?.dates.some(
										(item) => item.date === formattedDay,
									)
										?? false
								);
							},
						}}
						modifiersClassNames={{
							today: "bg-green-100 text-emerald-800 rounded-full",
							available: "bg-green-100 text-emerald-800 rounded-full",
							selected: "!bg-emerald-600 !text-white rounded-full",
						}}
						className="w-full"
					/>
				</div>
				
				<div className="flex-1 border-t-2 md:border-l-2 md:border-t-0 pt-4 md:pt-0 md:pl-4 border-gray-300 dark:border-gray-700">
					<h3 className="mb-4 font-semibold text-lg md:text-xl text-center">
						{selectedDate ? `Select a slot:` : "Select a date to view slots"}
					</h3>
	
					{isLoadingDetailedSlots && (
						<div className="flex h-32 items-center justify-center p-4"> 
							<Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
							<span className="ml-2 text-muted-foreground text-base">Loading slots...</span> 
						</div>
					)}
	
					{!isLoadingDetailedSlots && detailedSlotsData?.slots.length > 0 && (
						<ScrollArea className="h-[300px] overflow-y-auto"> 
							<div className="grid grid-cols-2 gap-4 p-1 pr-3"> 
								{detailedSlotsData.slots.map((item, index) => (
									<div
										key={`${item.slot}-${index}`}
										className="flex items-center justify-center rounded-lg border p-2 cursor-pointer hover:bg-primary hover:text-primary-foreground transition-colors text-center"
										onClick={() => {
											console.log("Book slot clicked:", item.slot, "for date:", selectedFormattedDate);
										}}
									>
										<p className="font-medium text-md">{item.slot}</p>
									</div>
								))}
							</div>
						</ScrollArea>
					)}
	
					{!isLoadingDetailedSlots && selectedDate && (!detailedSlotsData || detailedSlotsData.slots.length === 0) && (
						<div className="flex w-full items-center justify-center py-2 mt-2 mx-auto">
							<Empty className="p-0 border-0">
								<EmptyHeader>
									<EmptyMedia variant="icon"><Box /></EmptyMedia>
									<EmptyTitle>No slots</EmptyTitle>
									<EmptyDescription>No detailed slots available for the selected date.</EmptyDescription>
								</EmptyHeader>
							</Empty>
						</div>
					)}
				</div>
			</div>
		</div>
	);
}