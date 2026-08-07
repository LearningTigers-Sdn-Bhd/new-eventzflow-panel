"use client";

import { format, parse } from "date-fns";
import { Check, Clock, Loader2, Plus, X } from "lucide-react";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from "@/components/ui/select";
import {
	useBusinessMatchingAvailability,
	useSessionAvailabilities,
	useUpdateSessionAvailabilities,
} from "@/hooks/use-business-matching";
import { validEndTimes, validStartTimes } from "@/lib/time-blocks";

interface ManageAvailabilityHoursProps {
	sessionId: string;
	eventId: string;
	// Whether the current viewer may add/remove blocks. Defaults to true
	// (staff can always edit); the create-session-dialog passes the
	// resolved value when a host is editing their own session.
	hoursEditable?: boolean;
}

export default function ManageAvailabilityHours({
	sessionId,
	eventId,
	hoursEditable = true,
}: ManageAvailabilityHoursProps) {
	const { data, isLoading: isLoadingDates } = useBusinessMatchingAvailability(
		sessionId,
		eventId,
	);
	const { data: rawAvailabilities, isLoading: isLoadingAvs } =
		useSessionAvailabilities(sessionId);
	const { mutate: updateAvailabilities, isPending: isSavingAvs } =
		useUpdateSessionAvailabilities(sessionId, eventId);

	const [localAvailabilities, setLocalAvailabilities] = useState<
		{ day: string; start_time: string; end_time: string }[]
	>([]);
	const [newStart, setNewStart] = useState("");
	const [newEnd, setNewEnd] = useState("");
	const [startSelectOpen, setStartSelectOpen] = useState(false);
	const [endSelectOpen, setEndSelectOpen] = useState(false);
	// Which day's "add block" form is currently open — only one at a time,
	// hidden by default so the day cards just show existing blocks.
	const [addingDay, setAddingDay] = useState<string | null>(null);

	// Initialize local copy when raw data is fetched
	useEffect(() => {
		if (rawAvailabilities) {
			setLocalAvailabilities(
				rawAvailabilities.map((av) => ({
					day: av.day,
					start_time: av.start_time,
					end_time: av.end_time,
				})),
			);
		}
	}, [rawAvailabilities]);

	const handleNewStartChange = (value: string) => {
		setNewStart(value);
		setNewEnd("");
		setStartSelectOpen(false);
		// Move straight to picking the end time next.
		setEndSelectOpen(true);
	};

	const handleAddBlock = (dateStr: string): boolean => {
		if (!newStart || !newEnd) return false;

		setLocalAvailabilities((prev) => [
			...prev,
			{ day: dateStr, start_time: newStart, end_time: newEnd },
		]);
		toast.success("Availability block added!");
		return true;
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
				},
				onError: (error) => {
					toast.error("Failed to save availabilities", {
						description: error.message || "An unexpected error occurred.",
					});
				},
			},
		);
	};

	const isLoading = isLoadingDates || isLoadingAvs;

	return (
		<div className="max-h-[500px] space-y-6 overflow-y-auto pr-2">
			<div>
				<h3 className="flex items-center gap-2 font-semibold text-lg">
					<Clock className="h-5 w-5 text-primary" />
					Manage Working Hours & Breaks
				</h3>
				<p className="text-muted-foreground text-xs">
					{hoursEditable
						? "Add active shift hours. Gaps between ranges will act as lunch breaks / rest times."
						: "Your event organizer manages your hours — contact them to make changes."}
				</p>
			</div>

			{isLoading ? (
				<div className="flex h-32 items-center justify-center">
					<Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
				</div>
			) : (
				<div className="space-y-4">
					{data?.dates.map((item) => {
						const parsedDate = parse(item.date, "dd MMMM yyyy", new Date());
						const dateObj = format(parsedDate, "yyyy-MM-dd");
						const dayBlocks = localAvailabilities.filter(
							(av) => av.day === dateObj,
						);

						return (
							<div
								key={item.date}
								className="space-y-3 rounded-lg border bg-muted/20 p-4"
							>
								<div className="flex items-center justify-between">
									<span className="font-semibold text-sm">
										{item.day}, {item.date}
									</span>
									{dayBlocks.length === 0 && (
										<span className="font-medium text-red-500 text-xs">
											Rest Day / Unavailable
										</span>
									)}
								</div>

								{dayBlocks.length > 0 && (
									<div className="flex flex-wrap gap-2">
										{dayBlocks.map((block, idx) => (
											<div
												key={`${dateObj}-${block.start_time}-${block.end_time}-${idx}`}
												className="inline-flex items-center gap-2 rounded-full border border-primary/20 bg-primary/10 px-3 py-1 font-medium text-primary text-xs"
											>
												<span>
													{block.start_time} - {block.end_time}
												</span>
												{hoursEditable && (
													<button
														type="button"
														onClick={() => handleRemoveBlock(dateObj, idx)}
														className="ml-1 font-bold text-primary transition hover:scale-115 hover:text-red-500"
													>
														×
													</button>
												)}
											</div>
										))}
									</div>
								)}

								{hoursEditable && (
									<div className="border-t border-dashed pt-2">
										{addingDay === dateObj ? (
											<div className="flex flex-wrap items-center gap-2">
												<Select
													open={startSelectOpen}
													onOpenChange={setStartSelectOpen}
													value={newStart}
													onValueChange={handleNewStartChange}
												>
													<SelectTrigger className="h-8 w-28 text-xs">
														<SelectValue placeholder="Start time" />
													</SelectTrigger>
													<SelectContent className="max-h-[240px]">
														{validStartTimes(dayBlocks).map((t) => (
															<SelectItem key={t} value={t}>
																{t}
															</SelectItem>
														))}
													</SelectContent>
												</Select>
												<span className="text-muted-foreground text-xs">
													to
												</span>
												<Select
													open={endSelectOpen}
													onOpenChange={setEndSelectOpen}
													value={newEnd}
													onValueChange={setNewEnd}
													disabled={!newStart}
												>
													<SelectTrigger className="h-8 w-28 text-xs">
														<SelectValue placeholder="End time" />
													</SelectTrigger>
													<SelectContent className="max-h-[240px]">
														{(newStart
															? validEndTimes(dayBlocks, newStart)
															: []
														).map((t) => (
															<SelectItem key={t} value={t}>
																{t}
															</SelectItem>
														))}
													</SelectContent>
												</Select>
												<Button
													type="button"
													size="icon"
													className="h-8 w-8"
													onClick={() => {
														if (handleAddBlock(dateObj)) {
															setAddingDay(null);
															setNewStart("");
															setNewEnd("");
														}
													}}
													disabled={!newStart || !newEnd}
												>
													<Check className="h-3.5 w-3.5" />
												</Button>
												<Button
													type="button"
													size="icon"
													variant="ghost"
													onClick={() => {
														setAddingDay(null);
														setNewStart("");
														setNewEnd("");
													}}
													className="h-8 w-8"
												>
													<X className="h-3.5 w-3.5" />
												</Button>
											</div>
										) : (
											<Button
												type="button"
												size="sm"
												variant="outline"
												onClick={() => {
													setNewStart("");
													setNewEnd("");
													setAddingDay(dateObj);
													setStartSelectOpen(true);
												}}
												disabled={validStartTimes(dayBlocks).length === 0}
												className="h-8 gap-1 text-xs"
											>
												<Plus className="h-3 w-3" /> Add Block
											</Button>
										)}
									</div>
								)}
							</div>
						);
					})}

					{hoursEditable && (
						<div className="flex justify-end gap-2 border-t pt-4">
							<Button
								type="button"
								onClick={handleSaveAvailabilities}
								disabled={isSavingAvs}
							>
								{isSavingAvs && (
									<Loader2 className="mr-2 h-4 w-4 animate-spin" />
								)}
								Save Availability
							</Button>
						</div>
					)}
				</div>
			)}
		</div>
	);
}
