import { useState } from "react";
import { format } from "date-fns";
import { Calendar } from "@/components/ui/calendar"; // Use project's Calendar component
import "react-day-picker/dist/style.css"; // Assuming basic styling is needed

import { Loader2, Calendar as CalendarIcon, Box, ArrowLeft } from "lucide-react"; // Aliased Calendar icon
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
import CreateBookingForm from "./create-booking-form";
import { useIsMobile } from "@/hooks/use-mobile";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

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
    const isMobile = useIsMobile();
    const [activeTab, setActiveTab] = useState("date");
	const [selectedDate, setSelectedDate] = useState<Date | undefined>(undefined);
	const [selectedFormattedDate, setSelectedFormattedDate] = useState<string | undefined>(undefined);
    const [selectedSlot, setSelectedSlot] = useState<{ date: string; time: string } | null>(null);

	const { data, isLoading, error, isFetching } = useBusinessMatchingAvailability(bmEventId, eventId);
	const { data: detailedSlotsData, isLoading: isLoadingDetailedSlots, isFetching: isFetchingDetailedSlots } = useBusinessMatchingDetailedSlots(
		bmEventId,
		selectedFormattedDate,
		eventId
	);

    const isRefreshing = isLoading || isFetching || isLoadingDetailedSlots || isFetchingDetailedSlots;

    if (selectedSlot) {
        return (
            <div className="p-4">
                <div className="flex items-center gap-2 mb-4">
                    <Button variant="ghost" size="icon" onClick={() => setSelectedSlot(null)} className="h-8 w-8">
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

	const hasAvailableDates = data && data.dates && data.dates.length > 0; // Ensure data.dates exists

	if (!hasAvailableDates) {
		return (
			<div className="flex w-full items-center justify-center py-2 mt-2 mx-auto">
				<Empty className="p-0 border-0">
					<EmptyHeader>
						<EmptyTitle>No slots available yet</EmptyTitle>
						<EmptyDescription>We are fetching the latest data. Please wait a moment...</EmptyDescription>
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
                month_caption: "rdp-caption flex h-(--cell-size) w-full max-w-[360px] items-center justify-center px-4 text-sm",
                weekdays: "flex w-full max-w-[360px] mx-auto justify-between",
                week: "mt-2 flex w-full max-w-[360px] mx-auto justify-between",
                table: "w-full max-w-[360px] mx-auto border-collapse",
            }
            : undefined;

        return (
        <div className="flex flex-col items-center w-full overflow-hidden">
            <h3 className="mb-4 font-semibold text-lg flex items-center gap-2 self-start md:self-center">
                <CalendarIcon className="h-5 w-5" /> Available Dates
            </h3>
            <div className="w-full flex justify-center overflow-x-auto pb-2">
                <Calendar
                    mode="single"
                    selected={selectedDate}
                    onSelect={(date) => {
                        setSelectedDate(date);
                        if (date) {
                            setSelectedFormattedDate(format(date, "dd MMMM yyyy"));
                            if (isMobile) setActiveTab("slots");
                        } else {
                            setSelectedFormattedDate(undefined);
                        }
                    }}
                    disabled={(day) => {
                        const formattedDay = format(day, "dd MMMM yyyy");
                        return !data?.dates.some((item) => item.date === formattedDay);
                    }}
                    modifiers={{
                        available: (day) => {
                            const formattedDay = format(day, "dd MMMM yyyy");
                            return data?.dates.some((item) => item.date === formattedDay) ?? false;
                        },
                    }}
                    modifiersClassNames={{
                        today: "bg-green-100 text-emerald-800 rounded-full",
                        available: "bg-green-100 text-emerald-800 rounded-full",
                        selected: "!bg-emerald-600 !text-white rounded-full",
                    }}
                    className={isMobile ? "w-full border rounded-md p-1 text-sm" : "w-fit border rounded-md p-2"}
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
                                    if (selectedFormattedDate) {
                                        setSelectedSlot({ date: selectedFormattedDate, time: item.slot });
                                    }
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
                            <EmptyTitle>No slots yet</EmptyTitle>
                            <EmptyDescription>We are fetching the latest data for this date. Please wait a moment...</EmptyDescription>
                        </EmptyHeader>
                    </Empty>
                </div>
            )}
        </div>
        );
    };

    if (isMobile) {
        return (
            <div className="p-4">
                <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
                    <TabsList className="grid w-full grid-cols-2 mb-4">
                        <TabsTrigger value="date">Date</TabsTrigger>
                        <TabsTrigger value="slots" disabled={!selectedDate}>Slots</TabsTrigger>
                    </TabsList>
                    
                    <TabsContent value="date">
                        {renderCalendar()}
                    </TabsContent>
                    
                    <TabsContent value="slots">
                        {renderSlots()}
                    </TabsContent>
                </Tabs>
            </div>
        );
    }

	return (
		<div className="p-4">
			<div className="flex flex-col md:flex-row gap-4 justify-center">
				<div className="flex-1">
                    {renderCalendar()}
				</div>
				
				<div className="flex-1 border-t-2 md:border-l-2 md:border-t-0 pt-4 md:pt-0 md:pl-4 border-gray-300 dark:border-gray-700">
                    {renderSlots()}
				</div>
			</div>
		</div>
	);
}