import { format, parse } from "date-fns";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { Calendar } from "@/components/ui/calendar"; // Use project's Calendar component
import "react-day-picker/dist/style.css"; // Assuming basic styling is needed

import {
	ArrowLeft,
	Box,
	Calendar as CalendarIcon,
	Loader2,
	Plus,
	Clock,
} from "lucide-react"; // Aliased Calendar icon
import { ErrorState } from "@/components/data-state";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
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
	useSessionAvailabilities,
	useUpdateSessionAvailabilities,
} from "@/hooks/use-business-matching";
import { useEventPermissions } from "@/hooks/use-event-permissions";
import { useIsMobile } from "@/hooks/use-mobile";
import { useBusinessMatchingStore } from "@/stores/use-business-matching-store";
import CreateBookingForm from "./create-booking-form";

interface AvailabilityDialogProps {
	bmEventId: string;
	eventId: string; // Changed from internalEventId
	eventTitle: string;
	onClose?: () => void; // Optional if handled by dialog store
}

export default function AvailabilityDialog({
	bmEventId,
	eventId, // Changed from internalEventId
	eventTitle: _eventTitle,
}: AvailabilityDialogProps) {
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

	// Permissions check
	const { canManageEvent, isBusinessHost } = useEventPermissions(eventId);
	const canEditAvailability = canManageEvent || isBusinessHost;

	// Availability Management state
	const [mode, setMode] = useState<"book" | "manage">("book");
	const { data: rawAvailabilities, isLoading: isLoadingAvs } = useSessionAvailabilities(bmEventId);
	const { mutate: updateAvailabilities, isPending: isSavingAvs } = useUpdateSessionAvailabilities(bmEventId, eventId);

	const [localAvailabilities, setLocalAvailabilities] = useState<{ day: string; start_time: string; end_time: string }[]>([]);
	const [newStart, setNewStart] = useState("09:00");
	const [newEnd, setNewEnd] = useState("17:00");

	// Initialize local copy when raw data is fetched
	useEffect(() => {
		if (rawAvailabilities) {
			setLocalAvailabilities(
				rawAvailabilities.map((av) => ({
					day: av.day,
					start_time: av.start_time,
					end_time: av.end_time,
				}))
			);
		}
	}, [rawAvailabilities]);

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
			<div className="p-4">
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
								const formatted = format(date, "dd MMMM yyyy");
								setSelectedFormattedDate(formatted);
								setSelectedBusinessMatchingDate(formatted); // Update Zustand store
								if (isMobile) setActiveTab("slots");
							} else {
								setSelectedFormattedDate(undefined);
								setSelectedBusinessMatchingDate(undefined); // Clear Zustand store
							}
						}}
						disabled={(day) => {
							const formattedDay = format(day, "dd MMMM yyyy");
							return !data?.dates.some((item) => item.date === formattedDay);
						}}
						modifiers={{
							available: (day) => {
								const formattedDay = format(day, "dd MMMM yyyy");
								return (
									data?.dates.some((item) => item.date === formattedDay) ??
									false
								);
							},
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

	const handleAddBlock = (dateStr: string) => {
		if (newStart >= newEnd) {
			toast.error("Start time must be before end time");
			return;
		}

		const overlaps = localAvailabilities
			.filter((av) => av.day === dateStr)
			.some((av) => {
				return (
					(newStart >= av.start_time && newStart < av.end_time) ||
					(newEnd > av.start_time && newEnd <= av.end_time) ||
					(newStart <= av.start_time && newEnd >= av.end_time)
				);
			});

		if (overlaps) {
			toast.error("This block overlaps with an existing availability range");
			return;
		}

		setLocalAvailabilities((prev) => [
			...prev,
			{ day: dateStr, start_time: newStart, end_time: newEnd },
		]);
		toast.success("Availability block added!");
	};

	const handleRemoveBlock = (dateStr: string, indexToRemove: number) => {
		setLocalAvailabilities((prev) => {
			const dayBlocks = prev.filter((av) => av.day === dateStr);
			const otherBlocks = prev.filter((av) => av.day !== dateStr);
			const updatedDayBlocks = dayBlocks.filter((_, i) => i !== indexToRemove);
			return [...otherBlocks, ...updatedDayBlocks];
		});
		toast.success("Availability block removed!");
	};

	const handleSaveAvailabilities = () => {
		updateAvailabilities(
			{ availabilities: localAvailabilities },
			{
				onSuccess: () => {
					toast.success("Availability saved successfully!");
					setMode("book");
				},
				onError: (error) => {
					toast.error("Failed to save availabilities", {
						description: error.message || "An unexpected error occurred.",
					});
				},
			}
		);
	};

	const renderManageAvailability = () => {
		return (
			<div className="space-y-6 max-h-[500px] overflow-y-auto pr-2">
				<div className="flex justify-between items-center pb-2 border-b">
					<div>
						<h3 className="font-semibold text-lg flex items-center gap-2">
							<Clock className="h-5 w-5 text-primary" />
							Manage Working Hours & Breaks
						</h3>
						<p className="text-muted-foreground text-xs">
							Add active shift hours. Gaps between ranges will act as lunch breaks / rest times.
						</p>
					</div>
				</div>

				{isLoadingAvs ? (
					<div className="flex h-32 items-center justify-center">
						<Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
					</div>
				) : (
					<div className="space-y-4">
						{data?.dates.map((item) => {
							const parsedDate = parse(item.date, "dd MMMM yyyy", new Date());
							const dateObj = format(parsedDate, "yyyy-MM-dd");
							const dayBlocks = localAvailabilities.filter((av) => av.day === dateObj);

							return (
								<div key={item.date} className="border rounded-lg p-4 bg-muted/20 space-y-3">
									<div className="flex justify-between items-center">
										<span className="font-semibold text-sm">
											{item.day}, {item.date}
										</span>
										{dayBlocks.length === 0 && (
											<span className="text-red-500 text-xs font-medium">
												Rest Day / Unavailable
											</span>
										)}
									</div>

									{dayBlocks.length > 0 && (
										<div className="flex flex-wrap gap-2">
											{dayBlocks.map((block, idx) => (
												<div
													key={`${block.start_time}-${block.end_time}`}
													className="inline-flex items-center gap-2 bg-primary/10 border border-primary/20 text-primary rounded-full px-3 py-1 text-xs font-medium"
												>
													<span>{block.start_time} - {block.end_time}</span>
													<button
														type="button"
														onClick={() => handleRemoveBlock(dateObj, idx)}
														className="text-primary hover:text-red-500 font-bold hover:scale-115 transition ml-1"
													>
														×
													</button>
												</div>
											))}
										</div>
									)}

									<div className="flex flex-wrap gap-3 items-center pt-2 border-t border-dashed">
										<div className="flex items-center gap-1.5">
											<span className="text-xs text-muted-foreground">From</span>
											<Input
												type="time"
												value={newStart}
												onChange={(e) => setNewStart(e.target.value)}
												className="h-8 w-24 text-xs"
											/>
										</div>
										<div className="flex items-center gap-1.5">
											<span className="text-xs text-muted-foreground">To</span>
											<Input
												type="time"
												value={newEnd}
												onChange={(e) => setNewEnd(e.target.value)}
												className="h-8 w-24 text-xs"
											/>
										</div>
										<Button
											type="button"
											size="sm"
											variant="outline"
											onClick={() => handleAddBlock(dateObj)}
											className="h-8 text-xs gap-1"
										>
											<Plus className="h-3 w-3" /> Add Block
										</Button>
									</div>
								</div>
							);
						})}

						<div className="flex justify-end gap-2 border-t pt-4">
							<Button
								type="button"
								variant="outline"
								onClick={() => setMode("book")}
								disabled={isSavingAvs}
							>
								Cancel
							</Button>
							<Button
								type="button"
								onClick={handleSaveAvailabilities}
								disabled={isSavingAvs}
							>
								{isSavingAvs && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
								Save Availability
							</Button>
						</div>
					</div>
				)}
			</div>
		);
	};

	if (mode === "manage") {
		return (
			<div className="p-4">
				{canEditAvailability && (
					<div className="mb-4 flex justify-between items-center border-b pb-3">
						<span className="text-xs text-muted-foreground">
							Setup custom shift ranges
						</span>
						<Button
							variant="outline"
							size="sm"
							onClick={() => setMode("book")}
							className="gap-1.5 text-xs h-8"
						>
							<Clock className="h-3.5 w-3.5" />
							View Booking Calendar
						</Button>
					</div>
				)}
				{renderManageAvailability()}
			</div>
		);
	}

	if (isMobile) {
		return (
			<div className="p-4 space-y-4">
				{canEditAvailability && (
					<div className="flex justify-between items-center border-b pb-3">
						<span className="text-xs text-muted-foreground">
							View matching slots calendar
						</span>
						<Button
							variant="outline"
							size="sm"
							onClick={() => setMode("manage")}
							className="gap-1.5 text-xs h-8"
						>
							<Clock className="h-3.5 w-3.5" />
							Manage Hours / Rest Breaks
						</Button>
					</div>
				)}
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
		<div className="p-4 space-y-4">
			{canEditAvailability && (
				<div className="flex justify-between items-center border-b pb-3">
					<span className="text-xs text-muted-foreground">
						View matching slots calendar
					</span>
					<Button
						variant="outline"
						size="sm"
						onClick={() => setMode("manage")}
						className="gap-1.5 text-xs h-8"
					>
						<Clock className="h-3.5 w-3.5" />
						Manage Hours / Rest Breaks
					</Button>
				</div>
			)}
			<div className="flex flex-col justify-center gap-4 md:flex-row">
				<div className="flex-1">{renderCalendar()}</div>

				<div className="flex-1 border-gray-300 border-t-2 pt-4 md:border-t-0 md:border-l-2 md:pt-0 md:pl-4 dark:border-gray-700">
					{renderSlots()}
				</div>
			</div>
		</div>
	);
}
