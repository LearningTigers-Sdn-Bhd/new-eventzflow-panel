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
import { getLocations, updateLocationMembers } from "@/lib/api/event/location";
import { getEventVendors } from "@/lib/api/event-vendor/endpoints";
import type { BaseLocation } from "../event-location-table-columns";

interface AssignVendorDialogProps {
	location: BaseLocation;
	onClose?: () => void;
}

export default function AssignVendorDialog({
	location,
	onClose,
}: AssignVendorDialogProps) {
	const params = useParams();
	const eventId = params.event_id as string;
	const { closeDialog } = useDialog();
	const queryClient = useQueryClient();

	const [searchTerm, setSearchTerm] = useState("");
	const [selectedVendorIds, setSelectedVendorIds] = useState<string[]>([]);

	// Fetch event vendors
	const { data: eventVendors, isLoading: isLoadingVendors } = useQuery({
		queryKey: ["event-vendors", eventId],
		queryFn: () => getEventVendors(Number.parseInt(eventId, 10)),
	});

	// Fetch all locations to check which vendors are already assigned
	const { data: allLocations, isLoading: isLoadingLocations } = useQuery({
		queryKey: ["event", eventId, "locations"],
		queryFn: () => getLocations({ eventId }),
	});

	const isLoading = isLoadingVendors || isLoadingLocations;

	// Update selected vendors when location data is loaded
	useEffect(() => {
		if (allLocations) {
			const currentLocation = allLocations.find(
				(loc) => loc.id === location.id,
			);
			if (currentLocation) {
				// Get IDs of vendors already assigned to this location
				const assignedVendorIds =
					currentLocation.vendors?.map((v) => v.id) || [];
				setSelectedVendorIds(assignedVendorIds);
			}
		}
	}, [allLocations, location.id]);

	// Update location mutation
	const updateLocationMutation = useMutation({
		mutationFn: async (vendorIds: string[]) => {
			// Get existing staff member IDs (not vendors)
			const currentLocation = allLocations?.find(
				(loc) => loc.id === location.id,
			);
			const staffIds = currentLocation?.staffMembers?.map((m) => m.id) || [];

			// Combine staff and vendor IDs
			const allMemberIds = [...staffIds, ...vendorIds];

			return await updateLocationMembers({
				eventId,
				locationId: location.id,
				name: location.name,
				floor: location.floor,
				isUnlimited: location.isUnlimited ?? false,
				scanLimit: location.scanLimit,
				memberIds: allMemberIds,
				locationDetails: location.locationDetails,
			});
		},
		onSuccess: () => {
			toast.success("Vendors assigned successfully");
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
			toast.error(`Failed to assign vendors: ${error.message}`);
		},
	});

	const handleToggleVendor = (vendorId: string) => {
		setSelectedVendorIds((prev) =>
			prev.includes(vendorId)
				? prev.filter((id) => id !== vendorId)
				: [...prev, vendorId],
		);
	};

	const handleSave = async () => {
		// Ensure all IDs are strings
		const vendorIdsAsStrings = selectedVendorIds.map((id) => String(id));
		await updateLocationMutation.mutateAsync(vendorIdsAsStrings);
	};

	if (isLoading) {
		return (
			<LoadingState
				title="Loading vendors..."
				description="Please wait while we fetch the event vendors."
				height="h-64"
			/>
		);
	}

	if (!eventVendors || !allLocations) {
		return (
			<ErrorState
				title="Failed to load vendors"
				description="Unable to fetch event vendors. Please try again."
				height="h-64"
			/>
		);
	}

	// Get all vendor IDs that are already assigned to OTHER locations
	const assignedVendorIds = new Set<string>();
	allLocations.forEach((loc) => {
		// Skip the current location we're editing
		if (loc.id !== location.id) {
			loc.vendors?.forEach((vendor) => {
				assignedVendorIds.add(vendor.id);
			});
		}
	});

	// Filter out vendors already assigned to other locations
	const availableVendors = eventVendors.filter(
		(eventVendor) => !assignedVendorIds.has(eventVendor.vendor.id.toString()),
	);

	// Filter vendors by search term
	const filteredVendors = availableVendors.filter(
		(eventVendor) =>
			eventVendor.vendor.full_name
				.toLowerCase()
				.includes(searchTerm.toLowerCase()) ||
			eventVendor.vendor.email
				.toLowerCase()
				.includes(searchTerm.toLowerCase()) ||
			eventVendor.type.toLowerCase().includes(searchTerm.toLowerCase()),
	);

	// Sort: checked vendors first, then alphabetically by name
	const sortedVendors = filteredVendors.sort((a, b) => {
		const aSelected = selectedVendorIds.includes(a.vendor.id.toString());
		const bSelected = selectedVendorIds.includes(b.vendor.id.toString());

		// If selection status is different, selected comes first
		if (aSelected !== bSelected) {
			return aSelected ? -1 : 1;
		}

		// If both have same selection status, sort alphabetically by name
		return a.vendor.full_name.localeCompare(b.vendor.full_name);
	});

	return (
		<div className="flex h-full flex-col justify-between gap-4 px-4 md:pb-8">
			<div className="flex flex-col gap-4">
				{/* Current location info */}
				<div className="rounded-none border bg-muted/50 p-3">
					<h3 className="font-semibold text-sm">
						{location.locationDisplayName || location.name}
					</h3>
					<p className="text-muted-foreground text-xs">
						{selectedVendorIds.length === 0 ? (
							<span className="text-amber-600">
								No vendors selected (location will have no assigned vendors)
							</span>
						) : (
							<>
								{selectedVendorIds.length} vendor
								{selectedVendorIds.length !== 1 ? "s" : ""} selected
							</>
						)}
					</p>
				</div>

				{/* Search input */}
				<div className="relative">
					<Search className="absolute top-2.5 left-2.5 size-4 text-muted-foreground" />
					<Input
						placeholder="Search vendors by name, email, or type..."
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

				{/* Vendors list */}
				<ScrollArea className="h-[400px] rounded-none border">
					<div className="space-y-1 p-2">
						{sortedVendors.length === 0 ? (
							<div className="flex flex-col items-center justify-center py-12 text-center">
								<p className="text-muted-foreground text-sm">
									{searchTerm
										? "No vendors found matching your search"
										: "No available event vendors"}
								</p>
								{!searchTerm && (
									<p className="mt-2 max-w-xs text-muted-foreground text-xs">
										{assignedVendorIds.size > 0
											? "All vendors are already assigned to other locations. Each vendor can only be assigned to one location."
											: "Assign vendors to this event first from the Vendors page"}
									</p>
								)}
							</div>
						) : (
							sortedVendors.map((eventVendor) => {
								const vendorId = eventVendor.vendor.id.toString();
								const isSelected = selectedVendorIds.includes(vendorId);
								return (
									<button
										key={eventVendor.id}
										type="button"
										onClick={() => handleToggleVendor(vendorId)}
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
													{eventVendor.vendor.full_name}
												</p>
												<Badge
													variant="outline"
													className="border-green-500 bg-green-50 text-green-700 text-xs"
												>
													{eventVendor.type}
												</Badge>
											</div>
											<p className="truncate text-muted-foreground text-xs">
												{eventVendor.vendor.email}
											</p>
											{eventVendor.vendor.phone && (
												<p className="truncate text-muted-foreground text-xs">
													{eventVendor.vendor.phone}
												</p>
											)}
										</div>
									</button>
								);
							})
						)}
					</div>
				</ScrollArea>
			</div>

			{/* Action buttons */}
			<div className="flex flex-col gap-2 md:flex-row md:justify-end">
				<Button
					variant="outline"
					onClick={() => {
						closeDialog();
						if (onClose) onClose();
					}}
					disabled={updateLocationMutation.isPending}
					className="rounded-none py-6 md:py-2"
				>
					Cancel
				</Button>
				<Button
					onClick={handleSave}
					disabled={updateLocationMutation.isPending}
					className="rounded-none py-6 md:py-2"
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
