"use client";

import { format, parse } from "date-fns";
import { Clock, Loader2, Plus } from "lucide-react";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
	useBusinessMatchingAvailability,
	useSessionAvailabilities,
	useUpdateSessionAvailabilities,
} from "@/hooks/use-business-matching";

interface ManageAvailabilityHoursProps {
	sessionId: string;
	eventId: string;
}

export default function ManageAvailabilityHours({
	sessionId,
	eventId,
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
				})),
			);
		}
	}, [rawAvailabilities]);

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
					Add active shift hours. Gaps between ranges will act as lunch breaks /
					rest times.
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
												<button
													type="button"
													onClick={() => handleRemoveBlock(dateObj, idx)}
													className="ml-1 font-bold text-primary transition hover:scale-115 hover:text-red-500"
												>
													×
												</button>
											</div>
										))}
									</div>
								)}

								<div className="flex flex-wrap items-center gap-3 border-t border-dashed pt-2">
									<div className="flex items-center gap-1.5">
										<span className="text-muted-foreground text-xs">From</span>
										<Input
											type="time"
											value={newStart}
											onChange={(e) => setNewStart(e.target.value)}
											className="h-8 w-24 text-xs"
										/>
									</div>
									<div className="flex items-center gap-1.5">
										<span className="text-muted-foreground text-xs">To</span>
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
										className="h-8 gap-1 text-xs"
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
}
