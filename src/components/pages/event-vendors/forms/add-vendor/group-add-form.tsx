"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Building2, CheckCircle2, Users } from "lucide-react";
import React, { useId, useMemo, useState } from "react";
import { toast } from "sonner";
import { EmptyState, ErrorState, LoadingState } from "@/components/data-state";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import {
	Field,
	FieldDescription,
	FieldError,
	FieldGroup,
	FieldLabel,
	FieldLegend,
	FieldSeparator,
	FieldSet,
} from "@/components/ui/field";
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from "@/components/ui/select";
import { createEventVendor, getEventVendors } from "@/lib/api/event-vendor";
import { getGroups } from "@/lib/api/group";
import { getGroupAffiliates } from "@/lib/api/group-affiliate";

interface GroupAddFormProps {
	eventId: number;
	onClose?: () => void;
}

export default function GroupAddForm({ eventId, onClose }: GroupAddFormProps) {
	const groupIdField = useId();

	const [groupId, setGroupId] = useState<string>("");
	const [selectedVendorIds, setSelectedVendorIds] = useState<Set<number>>(
		new Set(),
	);
	const [errors, setErrors] = useState<Record<string, string>>({});

	// Fetch available groups
	const {
		data: groups,
		isLoading: isLoadingGroups,
		error: groupsError,
	} = useQuery({
		queryKey: ["groups"],
		queryFn: getGroups,
	});

	// Fetch group affiliates when a group is selected
	const { data: groupAffiliates, isLoading: isLoadingAffiliates } = useQuery({
		queryKey: ["groups", groupId, "affiliates"],
		queryFn: () => getGroupAffiliates(Number(groupId)),
		enabled: !!groupId,
	});

	// Fetch existing event vendors to check which are already added
	const { data: eventVendors, isLoading: isLoadingEventVendors } = useQuery({
		queryKey: ["event", eventId.toString(), "vendors"],
		queryFn: () => getEventVendors(eventId),
	});

	// Create a set of already added vendor IDs for quick lookup
	const addedVendorIds = useMemo(() => {
		if (!eventVendors) return new Set<number>();
		return new Set(eventVendors.map((ev) => ev.vendor_id));
	}, [eventVendors]);

	// Auto-select all vendors when group affiliates are loaded (excluding already added ones)
	React.useEffect(() => {
		if (groupAffiliates && groupAffiliates.length > 0) {
			const availableVendorIds = groupAffiliates
				.filter((affiliate) => !addedVendorIds.has(affiliate.vendor_id))
				.map((affiliate) => affiliate.vendor_id);
			setSelectedVendorIds(new Set(availableVendorIds));
		}
	}, [groupAffiliates, addedVendorIds]);

	const queryClient = useQueryClient();
	const createVendorMutation = useMutation({
		mutationFn: async (vendorIds: number[]) => {
			// Assign vendors sequentially to avoid race conditions
			const results = [];
			for (const vendorId of vendorIds) {
				const result = await createEventVendor(eventId, {
					vendor_id: vendorId,
					redirect_url: undefined,
					poster_url: undefined,
				});
				results.push(result);
			}
			return results;
		},
		onSuccess: (_, vendorIds) => {
			const count = vendorIds.length;
			toast.success(
				`${count} vendor${count > 1 ? "s" : ""} added to event successfully!`,
			);
			// Invalidate and refetch event vendors query
			queryClient.invalidateQueries({
				queryKey: ["event", eventId.toString(), "vendors"],
			});
			onClose?.();
		},
		onError: (error: Error) => {
			toast.error(error.message || "Failed to assign vendors");
		},
	});

	const handleToggleVendor = (vendorId: number) => {
		// Prevent toggling already-added vendors
		if (addedVendorIds.has(vendorId)) return;

		setSelectedVendorIds((prev) => {
			const newSet = new Set(prev);
			if (newSet.has(vendorId)) {
				newSet.delete(vendorId);
			} else {
				newSet.add(vendorId);
			}
			return newSet;
		});
	};

	const handleSelectAll = () => {
		if (!groupAffiliates) return;
		// Only select vendors that are not already added
		const availableVendorIds = groupAffiliates
			.filter((affiliate) => !addedVendorIds.has(affiliate.vendor_id))
			.map((affiliate) => affiliate.vendor_id);
		setSelectedVendorIds(new Set(availableVendorIds));
	};

	const handleDeselectAll = () => {
		setSelectedVendorIds(new Set());
	};

	const handleSubmit = async (e: React.FormEvent) => {
		e.preventDefault();
		setErrors({});

		// Validation
		const newErrors: Record<string, string> = {};

		if (!groupId) {
			newErrors.groupId = "Please select a group";
		}

		if (selectedVendorIds.size === 0) {
			newErrors.selectedVendors = "Please select at least one vendor";
		}

		if (Object.keys(newErrors).length > 0) {
			setErrors(newErrors);
			return;
		}

		try {
			await createVendorMutation.mutateAsync(Array.from(selectedVendorIds));
		} catch {
			// Error is handled by onError callback
		}
	};

	if (isLoadingGroups || isLoadingEventVendors) {
		return (
			<LoadingState
				title="Loading groups..."
				description="Please wait..."
				height="h-[300px]"
			/>
		);
	}

	if (groupsError) {
		return (
			<ErrorState
				title="Failed to load groups"
				description="Please try again later"
				height="h-[300px]"
			/>
		);
	}

	if (!groups || groups.length === 0) {
		return (
			<EmptyState
				title="No groups available"
				description="There are no groups in the system. Please create a group first."
				icon={<Users className="size-8" />}
				height="h-[300px]"
				action={
					<Button onClick={onClose} variant="outline">
						Close
					</Button>
				}
			/>
		);
	}

	return (
		<section className="w-full">
			<form onSubmit={handleSubmit}>
				<FieldSet>
					<FieldLegend className="font-bold text-xl!">
						Assign Vendors from Group
					</FieldLegend>
					<FieldDescription>
						Select a group and choose which vendors to assign to this event in
						bulk.
					</FieldDescription>
					<FieldSeparator />
					<FieldGroup>
						{/* Group Selection */}
						<Field orientation="vertical">
							<FieldLabel htmlFor={groupIdField}>Group *</FieldLabel>
							{errors.groupId && <FieldError>{errors.groupId}</FieldError>}
							<Select
								value={groupId}
								onValueChange={(value) => {
									setGroupId(value);
									// Clear vendor selection when group changes
									setSelectedVendorIds(new Set());
									if (errors.groupId) {
										setErrors((prev) => {
											const newErrors = { ...prev };
											delete newErrors.groupId;
											return newErrors;
										});
									}
								}}
								disabled={createVendorMutation.isPending}
							>
								<SelectTrigger id={groupIdField}>
									<SelectValue placeholder="Select a group" />
								</SelectTrigger>
								<SelectContent>
									{groups.map((group) => (
										<SelectItem key={group.id} value={group.id.toString()}>
											{group.name}
										</SelectItem>
									))}
								</SelectContent>
							</Select>
							<FieldDescription>
								Select a group to view and assign its vendors.
							</FieldDescription>
						</Field>

						{/* Show vendor list when group is selected */}
						{groupId && (
							<>
								<FieldSeparator />
								<div className="space-y-3">
									<div className="flex items-center justify-between">
										<div className="flex items-center gap-2">
											<Users className="h-4 w-4 text-muted-foreground" />
											<p className="font-medium text-sm">
												Vendors in this group
											</p>
											{isLoadingAffiliates && (
												<Badge variant="secondary" className="text-xs">
													Loading...
												</Badge>
											)}
										</div>
										{groupAffiliates && groupAffiliates.length > 0 && (
											<div className="flex gap-2">
												<Button
													type="button"
													variant="outline"
													size="sm"
													onClick={handleSelectAll}
													disabled={createVendorMutation.isPending}
												>
													Select All
												</Button>
												<Button
													type="button"
													variant="outline"
													size="sm"
													onClick={handleDeselectAll}
													disabled={createVendorMutation.isPending}
												>
													Deselect All
												</Button>
											</div>
										)}
									</div>

									{errors.selectedVendors && (
										<FieldError>{errors.selectedVendors}</FieldError>
									)}

									<div className="rounded-none border border-dashed bg-muted/20 p-4">
										{isLoadingAffiliates ? (
											<div className="flex items-center justify-center py-4">
												<LoadingState
													title="Loading vendors..."
													height="h-20"
												/>
											</div>
										) : !groupAffiliates || groupAffiliates.length === 0 ? (
											<p className="text-muted-foreground text-sm">
												No vendors in this group yet.
											</p>
										) : (
											<div className="grid grid-cols-1 gap-2 md:grid-cols-2">
												{groupAffiliates.map((affiliate) => {
													const isSelected = selectedVendorIds.has(
														affiliate.vendor_id,
													);
													const isAlreadyAdded = addedVendorIds.has(
														affiliate.vendor_id,
													);
													return (
														<div
															key={affiliate.id}
															className={`flex items-center gap-2 rounded-none border border-dashed p-2 transition-colors ${
																isAlreadyAdded
																	? "border-muted bg-muted/30 opacity-60"
																	: "bg-background hover:bg-muted/50"
															}`}
														>
															<Checkbox
																id={`vendor-${affiliate.vendor_id}`}
																checked={isSelected}
																onCheckedChange={() =>
																	handleToggleVendor(affiliate.vendor_id)
																}
																disabled={
																	createVendorMutation.isPending ||
																	isAlreadyAdded
																}
															/>
															<label
																htmlFor={`vendor-${affiliate.vendor_id}`}
																className={`flex flex-1 items-center gap-2 ${
																	isAlreadyAdded
																		? "cursor-not-allowed"
																		: "cursor-pointer"
																}`}
															>
																<Building2 className="h-3.5 w-3.5 shrink-0 text-muted-foreground" />
																<div className="min-w-0 flex-1">
																	<p className="truncate font-medium text-sm">
																		{affiliate.vendor.full_name}
																	</p>
																	<p className="truncate text-muted-foreground text-xs">
																		{affiliate.vendor.email}
																	</p>
																</div>
																{isAlreadyAdded ? (
																	<div className="flex shrink-0 items-center gap-1 text-muted-foreground">
																		<CheckCircle2 className="h-3.5 w-3.5" />
																		<span className="whitespace-nowrap font-medium text-xs">
																			Already Added
																		</span>
																	</div>
																) : isSelected ? (
																	<CheckCircle2 className="h-3.5 w-3.5 shrink-0 text-primary" />
																) : null}
															</label>
														</div>
													);
												})}
											</div>
										)}
									</div>

									{selectedVendorIds.size > 0 && (
										<div className="flex items-center gap-2 rounded-none border border-dashed bg-primary/10 p-3">
											<Badge variant="default">
												{selectedVendorIds.size} vendor
												{selectedVendorIds.size > 1 ? "s" : ""} selected
											</Badge>
										</div>
									)}
								</div>
							</>
						)}

						<FieldSeparator />

						{/* Buttons */}
						<div className="flex justify-end gap-2">
							<Button
								type="button"
								variant="outline"
								onClick={onClose}
								disabled={createVendorMutation.isPending}
							>
								Cancel
							</Button>
							<Button
								type="submit"
								disabled={
									createVendorMutation.isPending || selectedVendorIds.size === 0
								}
							>
								{createVendorMutation.isPending
									? `Assigning ${selectedVendorIds.size} vendor${selectedVendorIds.size > 1 ? "s" : ""}...`
									: `Assign ${selectedVendorIds.size} vendor${selectedVendorIds.size > 1 ? "s" : ""}`}
							</Button>
						</div>
					</FieldGroup>
				</FieldSet>
			</form>
		</section>
	);
}
