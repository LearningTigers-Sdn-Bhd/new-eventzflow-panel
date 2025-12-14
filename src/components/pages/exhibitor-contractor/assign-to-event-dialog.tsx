"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Calendar, CalendarX2, Check, Loader2, X } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useDialog } from "@/hooks/use-dialog";
import { useFormatDate } from "@/hooks/use-format-date";
import type {
	ContractorAssignedEvent,
	ExhibitionContractor,
} from "@/lib/api/contractor";
import { getContractorAssignedEvents } from "@/lib/api/contractor";
import { getEvents } from "@/lib/api/event";
import {
	assignEventExhibitionContractor,
	removeEventExhibitionContractor,
} from "@/lib/api/event-exhibition-contractor";
import { cn } from "@/lib/utils";

interface AssignToEventDialogProps {
	contractor: ExhibitionContractor;
}

export function AssignToEventDialog({ contractor }: AssignToEventDialogProps) {
	const queryClient = useQueryClient();
	const { formatDate } = useFormatDate();
	const { closeDialog } = useDialog();
	const [selectedEventIds, setSelectedEventIds] = useState<Set<number>>(
		new Set(),
	);
	const [removingEventId, setRemovingEventId] = useState<number | null>(null);

	const profileId = contractor.exhibition_contractor_profile?.id;

	// Fetch all events
	const { data: allEvents, isLoading: isLoadingEvents } = useQuery({
		queryKey: ["events"],
		queryFn: () => getEvents(),
	});

	// Fetch assigned events for this contractor
	const { data: assignedEvents, isLoading: isLoadingAssigned } = useQuery({
		queryKey: ["contractor", contractor.id, "assigned-events"],
		queryFn: () => getContractorAssignedEvents(contractor.id),
		enabled: !!profileId,
	});

	// Filter available events (not already assigned to this contractor)
	const assignedEventIds = new Set(
		assignedEvents?.map((e: { id: number }) => e.id) || [],
	);
	const availableEvents =
		allEvents?.filter(
			(event) =>
				!assignedEventIds.has(event.id) && event.status === "published",
		) || [];

	// Toggle event selection
	const toggleEventSelection = (eventId: number) => {
		setSelectedEventIds((prev) => {
			const newSet = new Set(prev);
			if (newSet.has(eventId)) {
				newSet.delete(eventId);
			} else {
				newSet.add(eventId);
			}
			return newSet;
		});
	};

	// Select all events
	const handleSelectAll = () => {
		setSelectedEventIds(new Set(availableEvents.map((e) => e.id)));
	};

	// Deselect all events
	const handleDeselectAll = () => {
		setSelectedEventIds(new Set());
	};

	// Assign contractor mutation
	const assignMutation = useMutation({
		mutationFn: async (eventIds: number[]) => {
			const results = await Promise.allSettled(
				eventIds.map((eventId) =>
					assignEventExhibitionContractor(eventId, {
						exhibition_contractor_profile_id: profileId!,
					}),
				),
			);
			const failures = results.filter((r) => r.status === "rejected");
			if (failures.length > 0) {
				throw new Error(`Failed to assign ${failures.length} event(s)`);
			}
			return results;
		},
		onSuccess: () => {
			const count = selectedEventIds.size;
			toast.success(
				`Contractor assigned to ${count} event${count > 1 ? "s" : ""} successfully!`,
			);
			queryClient.invalidateQueries({
				queryKey: ["contractor", contractor.id, "assigned-events"],
			});
			queryClient.invalidateQueries({ queryKey: ["events"] });
			setSelectedEventIds(new Set());
		},
		onError: (error: Error) => {
			toast.error(error.message || "Failed to assign contractor to events");
		},
	});

	// Remove contractor from event mutation
	const removeMutation = useMutation({
		mutationFn: (eventId: number) => removeEventExhibitionContractor(eventId),
		onMutate: (eventId) => {
			setRemovingEventId(eventId);
		},
		onSuccess: () => {
			toast.success("Contractor removed from event successfully!");
			queryClient.invalidateQueries({
				queryKey: ["contractor", contractor.id, "assigned-events"],
			});
			queryClient.invalidateQueries({ queryKey: ["events"] });
		},
		onError: (error: Error) => {
			toast.error(error.message || "Failed to remove contractor from event");
		},
		onSettled: () => {
			setRemovingEventId(null);
		},
	});

	const handleAssign = () => {
		if (selectedEventIds.size === 0) {
			toast.error("Please select at least one event");
			return;
		}
		if (!profileId) {
			toast.error("Contractor profile not found");
			return;
		}
		assignMutation.mutate(Array.from(selectedEventIds));
	};

	const handleRemove = (eventId: number) => {
		removeMutation.mutate(eventId);
	};

	const isLoading = isLoadingEvents || isLoadingAssigned;
	const allSelected =
		availableEvents.length > 0 &&
		selectedEventIds.size === availableEvents.length;
	const someSelected = selectedEventIds.size > 0;

	if (isLoading) {
		return (
			<div className="flex h-48 items-center justify-center">
				<Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
			</div>
		);
	}

	return (
		<Tabs defaultValue="available" className="w-full">
			<TabsList className="grid w-full grid-cols-2 rounded-none">
				<TabsTrigger
					value="available"
					className="rounded-none text-xs sm:text-sm"
				>
					Available ({availableEvents.length})
				</TabsTrigger>
				<TabsTrigger
					value="assigned"
					className="rounded-none text-xs sm:text-sm"
				>
					Assigned ({assignedEvents?.length || 0})
				</TabsTrigger>
			</TabsList>

			<TabsContent value="available" className="space-y-3 sm:space-y-4">
				{availableEvents.length === 0 ? (
					<div className="flex flex-col items-center justify-center gap-3 py-6 text-center sm:gap-4 sm:py-8">
						<CalendarX2 className="h-10 w-10 text-muted-foreground sm:h-12 sm:w-12" />
						<div>
							<p className="font-medium text-sm sm:text-base">
								No Available Events
							</p>
							<p className="text-muted-foreground text-xs sm:text-sm">
								All published events are already assigned.
							</p>
						</div>
					</div>
				) : (
					<>
						<div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
							<p className="text-muted-foreground text-xs sm:text-sm">
								{selectedEventIds.size} of {availableEvents.length} selected
							</p>
							<div className="flex shrink-0 gap-2">
								<Button
									variant="outline"
									size="sm"
									onClick={handleSelectAll}
									disabled={allSelected}
									className="rounded-none text-xs sm:text-sm"
								>
									Select All
								</Button>
								<Button
									variant="outline"
									size="sm"
									onClick={handleDeselectAll}
									disabled={!someSelected}
									className="rounded-none text-xs sm:text-sm"
								>
									Deselect All
								</Button>
							</div>
						</div>

						<ScrollArea className="h-[240px] pr-2 sm:h-[280px] sm:pr-4">
							<div className="space-y-2">
								{availableEvents.map((event) => {
									const isSelected = selectedEventIds.has(event.id);
									return (
										<button
											key={event.id}
											type="button"
											onClick={() => toggleEventSelection(event.id)}
											className={cn(
												"w-full rounded-none border border-dashed p-3 text-left transition-colors sm:p-4",
												isSelected
													? "border-primary bg-primary/5"
													: "hover:border-muted-foreground/50 hover:bg-muted/30",
											)}
										>
											<div className="flex items-start gap-2 sm:gap-3">
												<div
													className={cn(
														"flex h-8 w-8 shrink-0 items-center justify-center rounded-none sm:h-10 sm:w-10",
														isSelected ? "bg-primary/10" : "bg-muted",
													)}
												>
													<Calendar
														className={cn(
															"h-4 w-4 sm:h-5 sm:w-5",
															isSelected
																? "text-primary"
																: "text-muted-foreground",
														)}
													/>
												</div>
												<div className="min-w-0 flex-1 space-y-0.5 sm:space-y-1">
													<div className="flex items-start gap-2">
														<p className="line-clamp-2 font-medium text-sm leading-tight sm:text-base">
															{event.title}
														</p>
														{isSelected && (
															<div className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-primary sm:h-6 sm:w-6">
																<Check className="h-3 w-3 text-primary-foreground sm:h-4 sm:w-4" />
															</div>
														)}
													</div>
													<p className="text-[10px] text-muted-foreground sm:text-xs">
														{formatDate(event.start_date)} -{" "}
														{formatDate(event.end_date)}
													</p>
												</div>
											</div>
										</button>
									);
								})}
							</div>
						</ScrollArea>

						<div className="flex flex-col gap-2 border-t pt-3 sm:flex-row sm:justify-end sm:pt-4">
							<Button
								variant="outline"
								onClick={closeDialog}
								className="order-2 w-full rounded-none sm:order-1 sm:w-auto"
							>
								Cancel
							</Button>
							<Button
								onClick={handleAssign}
								disabled={
									selectedEventIds.size === 0 || assignMutation.isPending
								}
								className="order-1 w-full rounded-none sm:order-2 sm:w-auto"
							>
								{assignMutation.isPending && (
									<Loader2 className="mr-2 h-4 w-4 animate-spin" />
								)}
								<span className="truncate">
									Assign
									{selectedEventIds.size > 0
										? ` (${selectedEventIds.size})`
										: ""}
								</span>
							</Button>
						</div>
					</>
				)}
			</TabsContent>

			<TabsContent value="assigned" className="space-y-3 sm:space-y-4">
				{!assignedEvents || assignedEvents.length === 0 ? (
					<div className="flex flex-col items-center justify-center gap-3 py-6 text-center sm:gap-4 sm:py-8">
						<CalendarX2 className="h-10 w-10 text-muted-foreground sm:h-12 sm:w-12" />
						<div>
							<p className="font-medium text-sm sm:text-base">
								No Assigned Events
							</p>
							<p className="text-muted-foreground text-xs sm:text-sm">
								This contractor is not assigned to any events yet.
							</p>
						</div>
					</div>
				) : (
					<ScrollArea className="h-[280px] pr-2 sm:h-[300px] sm:pr-4">
						<div className="space-y-2">
							{assignedEvents.map((event: ContractorAssignedEvent) => {
								const isRemoving = removingEventId === event.id;
								return (
									<div
										key={event.id}
										className={cn(
											"w-full rounded-none border p-3 text-left sm:p-4",
											isRemoving && "opacity-50",
										)}
									>
										<div className="flex items-start gap-2 sm:gap-3">
											<div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-none bg-muted sm:h-10 sm:w-10">
												<Calendar className="h-4 w-4 text-muted-foreground sm:h-5 sm:w-5" />
											</div>
											<div className="min-w-0 flex-1 space-y-0.5 sm:space-y-1">
												<div className="flex items-start gap-2">
													<p className="line-clamp-2 flex-1 font-medium text-sm leading-tight sm:text-base">
														{event.title}
													</p>
													<Button
														variant="ghost"
														size="icon"
														onClick={() => handleRemove(event.id)}
														disabled={isRemoving || removeMutation.isPending}
														className="h-6 w-6 shrink-0 rounded-none text-muted-foreground hover:bg-destructive/10 hover:text-destructive sm:h-7 sm:w-7"
													>
														{isRemoving ? (
															<Loader2 className="h-3 w-3 animate-spin sm:h-4 sm:w-4" />
														) : (
															<X className="h-3 w-3 sm:h-4 sm:w-4" />
														)}
													</Button>
												</div>
												<div className="flex items-center gap-2">
													<p className="text-[10px] text-muted-foreground sm:text-xs">
														{formatDate(event.start_date)} -{" "}
														{formatDate(event.end_date)}
													</p>
													<Badge
														variant="outline"
														className="shrink-0 rounded-none text-[10px] capitalize sm:text-xs"
													>
														{event.status}
													</Badge>
												</div>
											</div>
										</div>
									</div>
								);
							})}
						</div>
					</ScrollArea>
				)}

				<div className="border-t pt-3 sm:pt-4">
					<Button
						variant="outline"
						onClick={closeDialog}
						className="w-full rounded-none sm:ml-auto sm:block sm:w-auto"
					>
						Close
					</Button>
				</div>
			</TabsContent>
		</Tabs>
	);
}
