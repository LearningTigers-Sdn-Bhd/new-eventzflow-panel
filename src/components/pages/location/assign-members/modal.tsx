"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Check, Loader2, Search, X } from "lucide-react";
import { useParams } from "next/navigation";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { ErrorState, LoadingState } from "@/components/data-state";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useDialog } from "@/hooks/use-dialog";
import { getEventStaff } from "@/lib/api/event/event-staff";
import { getLocations, updateLocation } from "@/lib/api/event/location";
import type { BaseLocation } from "../columns";

interface AssignMembersDialogProps {
	location: BaseLocation;
	onClose?: () => void;
}

export default function AssignMembersDialog({
	location,
	onClose,
}: AssignMembersDialogProps) {
	const params = useParams();
	const eventId = params.event_id as string;
	const { closeDialog } = useDialog();
	const queryClient = useQueryClient();

	const [searchTerm, setSearchTerm] = useState("");
	const [selectedMemberIds, setSelectedMemberIds] = useState<string[]>([]);

	// Fetch event staff (users assigned to this event via event_assignments)
	const { data: eventStaff, isLoading: isLoadingStaff } = useQuery({
		queryKey: ["event", eventId, "staff"],
		queryFn: () => getEventStaff({ eventId }),
	});

	// Fetch all locations to check which staff are already assigned
	const { data: allLocations, isLoading: isLoadingLocations } = useQuery({
		queryKey: ["event", eventId, "locations"],
		queryFn: () => getLocations({ eventId }),
	});

	const isLoading = isLoadingStaff || isLoadingLocations;

	// Update selected members when location data is loaded
	useEffect(() => {
		if (allLocations) {
			const currentLocation = allLocations.find(
				(loc) => loc.id === location.id,
			);
			if (currentLocation) {
				setSelectedMemberIds(currentLocation.assignedMembers.map((m) => m.id));
			}
		}
	}, [allLocations, location.id]);

	// Update location mutation
	const updateLocationMutation = useMutation({
		mutationFn: async (memberIds: string[]) => {
			return await updateLocation({
				eventId,
				locationId: location.id,
				name: location.name,
				scanLimit: location.scanLimit,
				memberIds,
			});
		},
		onSuccess: () => {
			toast.success("Members assigned successfully");
			// Invalidate and refetch locations
			queryClient.invalidateQueries({
				queryKey: ["event", eventId, "locations"],
			});
			queryClient.invalidateQueries({
				queryKey: ["event", eventId, "location", location.id],
			});
			// Close dialog
			closeDialog();
			if (onClose) onClose();
		},
		onError: (error: Error) => {
			toast.error(`Failed to assign members: ${error.message}`);
		},
	});

	const handleToggleMember = (memberId: string) => {
		setSelectedMemberIds((prev) =>
			prev.includes(memberId)
				? prev.filter((id) => id !== memberId)
				: [...prev, memberId],
		);
	};

	const handleSave = async () => {
		// Ensure all IDs are strings
		const memberIdsAsStrings = selectedMemberIds.map((id) => String(id));
		await updateLocationMutation.mutateAsync(memberIdsAsStrings);
	};

	if (isLoading) {
		return (
			<LoadingState
				title="Loading event staff..."
				description="Please wait while we fetch the event staff members."
				height="h-64"
			/>
		);
	}

	if (!eventStaff || !allLocations) {
		return (
			<ErrorState
				title="Failed to load event staff"
				description="Unable to fetch event staff. Please try again."
				height="h-64"
			/>
		);
	}

	// Get all member IDs that are already assigned to OTHER locations
	const assignedMemberIds = new Set<string>();
	allLocations.forEach((loc) => {
		// Skip the current location we're editing
		if (loc.id !== location.id) {
			loc.assignedMembers.forEach((member) => {
				assignedMemberIds.add(member.id);
			});
		}
	});

	// Filter out staff already assigned to other locations
	const availableStaff = eventStaff.filter(
		(member) => !assignedMemberIds.has(member.id),
	);

	// Filter members by search term
	const filteredMembers = availableStaff.filter(
		(member) =>
			member.full_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
			member.email.toLowerCase().includes(searchTerm.toLowerCase()),
	);

	// Only show active members
	const activeFilteredMembers = filteredMembers.filter(
		(m) => m.status === "active",
	);

	// Sort: checked members first, then alphabetically by name
	const activeMembers = activeFilteredMembers.sort((a, b) => {
		const aSelected = selectedMemberIds.includes(a.id);
		const bSelected = selectedMemberIds.includes(b.id);

		// If selection status is different, selected comes first
		if (aSelected !== bSelected) {
			return aSelected ? -1 : 1;
		}

		// If both have same selection status, sort alphabetically by name
		return a.full_name.localeCompare(b.full_name);
	});

	return (
		<div className="flex flex-col gap-4">
			{/* Current location info */}
			<div className="rounded-md border bg-muted/50 p-3">
				<h3 className="font-semibold text-sm">{location.name}</h3>
				<p className="text-muted-foreground text-xs">
					{selectedMemberIds.length} member
					{selectedMemberIds.length !== 1 ? "s" : ""} selected
				</p>
			</div>

			{/* Search input */}
			<div className="relative">
				<Search className="absolute top-2.5 left-2.5 size-4 text-muted-foreground" />
				<Input
					placeholder="Search members by name or email..."
					value={searchTerm}
					onChange={(e) => setSearchTerm(e.target.value)}
					className="pl-9"
				/>
				{searchTerm && (
					<Button
						variant="ghost"
						size="icon"
						className="absolute top-0.5 right-0.5 size-8"
						onClick={() => setSearchTerm("")}
					>
						<X className="size-4" />
					</Button>
				)}
			</div>

			{/* Members list */}
			<ScrollArea className="h-[400px] rounded-md border">
				<div className="space-y-1 p-2">
					{activeMembers.length === 0 ? (
						<div className="flex flex-col items-center justify-center py-12 text-center">
							<p className="text-muted-foreground text-sm">
								{searchTerm
									? "No staff members found matching your search"
									: "No available event staff"}
							</p>
							{!searchTerm && (
								<p className="mt-2 max-w-xs text-muted-foreground text-xs">
									{assignedMemberIds.size > 0
										? "All staff are already assigned to other locations. Each staff member can only be assigned to one location."
										: "Assign staff to this event first from the Team page"}
								</p>
							)}
						</div>
					) : (
						activeMembers.map((member) => {
							const isSelected = selectedMemberIds.includes(member.id);
							return (
								<button
									key={member.id}
									type="button"
									onClick={() => handleToggleMember(member.id)}
									className="flex w-full items-center gap-3 rounded-md p-3 text-left transition-colors hover:bg-muted"
								>
									<div
										className={`flex size-5 shrink-0 items-center justify-center rounded border-2 transition-colors ${
											isSelected
												? "border-primary bg-primary text-primary-foreground"
												: "border-muted-foreground"
										}`}
									>
										{isSelected && <Check className="size-3" />}
									</div>
									<div className="min-w-0 flex-1">
										<div className="flex items-center gap-2">
											<p className="truncate font-medium text-sm">
												{member.full_name}
											</p>
											<Badge
												variant="outline"
												className={`text-xs ${
													member.eventRole === "event_admin"
														? "border-blue-500 bg-blue-50 text-blue-700"
														: "border-gray-500 bg-gray-50 text-gray-700"
												}`}
											>
												{member.eventRole === "event_admin"
													? "Admin"
													: "Team Member"}
											</Badge>
										</div>
										<p className="truncate text-muted-foreground text-xs">
											{member.email}
										</p>
										{member.phone && (
											<p className="truncate text-muted-foreground text-xs">
												{member.phone}
											</p>
										)}
									</div>
								</button>
							);
						})
					)}
				</div>
			</ScrollArea>

			{/* Action buttons */}
			<div className="flex justify-end gap-2">
				<Button
					variant="outline"
					onClick={() => {
						closeDialog();
						if (onClose) onClose();
					}}
					disabled={updateLocationMutation.isPending}
				>
					Cancel
				</Button>
				<Button
					onClick={handleSave}
					disabled={updateLocationMutation.isPending}
				>
					{updateLocationMutation.isPending && (
						<Loader2 className="mr-2 size-4 animate-spin" />
					)}
					{updateLocationMutation.isPending ? "Saving..." : "Save Changes"}
				</Button>
			</div>
		</div>
	);
}
