"use client";

import { useQuery } from "@tanstack/react-query";
import { Building2 } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import { EmptyState, ErrorState, LoadingState } from "@/components/data-state";
import { Button } from "@/components/ui/button";
import {
	Dialog,
	DialogContent,
	DialogDescription,
	DialogHeader,
	DialogTitle,
} from "@/components/ui/dialog";
import {
	Field,
	FieldDescription,
	FieldError,
	FieldGroup,
	FieldLabel,
	FieldSeparator,
	FieldSet,
} from "@/components/ui/field";
import { Checkbox } from "@/components/ui/checkbox";
import { getVendors } from "@/lib/api/vendor";
import { useCreateGroupAffiliate, useGroupAffiliates } from "@/hooks/use-group-affiliates";

interface AssignVendorDialogProps {
	groupId: number;
	open: boolean;
	onOpenChange: (open: boolean) => void;
}

export function AssignVendorDialog({
	groupId,
	open,
	onOpenChange,
}: AssignVendorDialogProps) {
	const [selectedVendorIds, setSelectedVendorIds] = useState<Set<number>>(new Set());
	const [errors, setErrors] = useState<Record<string, string>>({});
	const createAffiliate = useCreateGroupAffiliate();

	// Fetch available vendors
	const {
		data: vendors,
		isLoading,
		error,
	} = useQuery({
		queryKey: ["vendors"],
		queryFn: getVendors,
		enabled: open,
	});

	// Fetch current group affiliates
	const { data: affiliates } = useGroupAffiliates(groupId);

	const handleSubmit = async (e: React.FormEvent) => {
		e.preventDefault();
		setErrors({});

		// Validation
		const newErrors: Record<string, string> = {};

		if (selectedVendorIds.size === 0) {
			newErrors.vendors = "Please select at least one vendor";
		}

		if (Object.keys(newErrors).length > 0) {
			setErrors(newErrors);
			return;
		}

		try {
			// Assign vendors sequentially
			const vendorIds = Array.from(selectedVendorIds);
			let successCount = 0;
			let failCount = 0;

			for (const vendorId of vendorIds) {
				try {
					await createAffiliate.mutateAsync({
						groupId,
						data: { vendor_id: vendorId },
					});
					successCount++;
				} catch (error) {
					failCount++;
				}
			}

			if (successCount > 0) {
				toast.success(
					`${successCount} vendor${successCount > 1 ? "s" : ""} assigned successfully${
						failCount > 0 ? `, ${failCount} failed` : ""
					}`
				);
			} else {
				toast.error("Failed to assign vendors");
			}

			onOpenChange(false);
			setSelectedVendorIds(new Set());
			setErrors({});
		} catch (error) {
			toast.error("Failed to assign vendors");
		}
	};

	const handleClose = () => {
		onOpenChange(false);
		setSelectedVendorIds(new Set());
		setErrors({});
	};

	const toggleVendor = (vendorId: number) => {
		setSelectedVendorIds((prev) => {
			const newSet = new Set(prev);
			if (newSet.has(vendorId)) {
				newSet.delete(vendorId);
			} else {
				newSet.add(vendorId);
			}
			return newSet;
		});
		// Clear error when user selects a vendor
		if (errors.vendors) {
			setErrors((prev) => {
				const newErrors = { ...prev };
				delete newErrors.vendors;
				return newErrors;
			});
		}
	};

	const selectAll = () => {
		setSelectedVendorIds(new Set(activeVendors.map((v) => Number(v.id))));
	};

	const deselectAll = () => {
		setSelectedVendorIds(new Set());
	};

	// Get IDs of vendors already assigned to this group
	const assignedVendorIds = new Set(affiliates?.map((a) => a.vendor_id) || []);

	// Filter only active vendors that are not already assigned
	const activeVendors = vendors?.filter(
		(v) => v.status === "active" && !assignedVendorIds.has(Number(v.id))
	) || [];

	return (
		<Dialog open={open} onOpenChange={handleClose}>
			<DialogContent className="max-h-[80vh] max-w-2xl">
				<DialogHeader>
					<DialogTitle>Assign Vendors</DialogTitle>
					<DialogDescription>
						Select one or more vendors to assign to this group.
					</DialogDescription>
				</DialogHeader>

				{isLoading ? (
					<LoadingState
						title="Loading vendors..."
						description="Please wait..."
						height="h-[200px]"
					/>
				) : error ? (
					<ErrorState
						title="Failed to load vendors"
						description="Please try again later"
						height="h-[200px]"
					/>
				) : !vendors || vendors.length === 0 ? (
					<EmptyState
						title="No vendors available"
						description="There are no vendors in the system. Please create a vendor first."
						icon={<Building2 className="size-8" />}
						height="h-[200px]"
						action={
							<Button onClick={handleClose} variant="outline">
								Close
							</Button>
						}
					/>
				) : activeVendors.length === 0 ? (
					<EmptyState
						title="No available vendors"
						description="All active vendors are already assigned to this group or there are no active vendors."
						icon={<Building2 className="size-8" />}
						height="h-[200px]"
						action={
							<Button onClick={handleClose} variant="outline">
								Close
							</Button>
						}
					/>
				) : (
					<form onSubmit={handleSubmit}>
						<FieldSet>
							<FieldSeparator />
							<FieldGroup>
								{/* Vendor Selection */}
								<Field orientation="vertical">
									<div className="flex items-center justify-between">
										<FieldLabel>Select Vendors</FieldLabel>
										<div className="flex gap-2">
											<Button
												type="button"
												variant="ghost"
												size="sm"
												onClick={selectAll}
												disabled={createAffiliate.isPending}
												className="h-7 rounded-none text-xs"
											>
												Select All
											</Button>
											<Button
												type="button"
												variant="ghost"
												size="sm"
												onClick={deselectAll}
												disabled={createAffiliate.isPending}
												className="h-7 rounded-none text-xs"
											>
												Deselect All
											</Button>
										</div>
									</div>
									{errors.vendors && (
										<FieldError>{errors.vendors}</FieldError>
									)}
									<div className="max-h-[400px] space-y-2 overflow-y-auto rounded-none border border-dashed p-4">
										{activeVendors.map((vendor) => (
											<div
												key={vendor.id}
												className="flex items-center gap-3 rounded-none border border-dashed bg-muted/20 p-3 transition-colors hover:bg-muted/30"
											>
												<Checkbox
													id={`vendor-${vendor.id}`}
													checked={selectedVendorIds.has(Number(vendor.id))}
													onCheckedChange={() => toggleVendor(Number(vendor.id))}
													disabled={createAffiliate.isPending}
													className="rounded-none"
												/>
												<label
													htmlFor={`vendor-${vendor.id}`}
													className="flex flex-1 cursor-pointer items-center gap-3"
												>
													<div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-none border border-dashed bg-background">
														<Building2 className="h-5 w-5 text-muted-foreground" />
													</div>
													<div className="min-w-0 flex-1">
														<p className="truncate font-medium">
															{vendor.full_name}
														</p>
														<p className="truncate text-muted-foreground text-xs">
															{vendor.email}
														</p>
													</div>
												</label>
											</div>
										))}
									</div>
									<FieldDescription>
										{selectedVendorIds.size > 0
											? `${selectedVendorIds.size} vendor${selectedVendorIds.size > 1 ? "s" : ""} selected`
											: "Select vendors to assign to this group"}
									</FieldDescription>
								</Field>

								<FieldSeparator />

								{/* Buttons */}
								<div className="flex justify-end gap-2">
									<Button
										type="button"
										variant="outline"
										className="rounded-none"
										onClick={handleClose}
										disabled={createAffiliate.isPending}
									>
										Cancel
									</Button>
									<Button
										type="submit"
										disabled={createAffiliate.isPending || selectedVendorIds.size === 0}
										className="rounded-none"
									>
										{createAffiliate.isPending
											? "Assigning..."
											: `Assign ${selectedVendorIds.size > 0 ? `(${selectedVendorIds.size})` : ""}`}
									</Button>
								</div>
							</FieldGroup>
						</FieldSet>
					</form>
				)}
			</DialogContent>
		</Dialog>
	);
}
