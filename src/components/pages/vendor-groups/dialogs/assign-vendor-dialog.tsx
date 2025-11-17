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
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from "@/components/ui/select";
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
	const [vendorId, setVendorId] = useState("");
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

		if (!vendorId) {
			newErrors.vendorId = "Please select a vendor";
		}

		if (Object.keys(newErrors).length > 0) {
			setErrors(newErrors);
			return;
		}

		try {
			await createAffiliate.mutateAsync({
				groupId,
				data: { vendor_id: Number(vendorId) },
			});
			toast.success("Vendor assigned successfully");
			onOpenChange(false);
			setVendorId("");
			setErrors({});
		} catch (error) {
			toast.error("Failed to assign vendor");
		}
	};

	const handleClose = () => {
		onOpenChange(false);
		setVendorId("");
		setErrors({});
	};

	// Get IDs of vendors already assigned to this group
	const assignedVendorIds = new Set(affiliates?.map((a) => a.vendor_id) || []);

	// Filter only active vendors that are not already assigned
	const activeVendors = vendors?.filter(
		(v) => v.status === "active" && !assignedVendorIds.has(Number(v.id))
	) || [];

	return (
		<Dialog open={open} onOpenChange={handleClose}>
			<DialogContent className="max-w-md">
				<DialogHeader>
					<DialogTitle>Assign Vendor</DialogTitle>
					<DialogDescription>
						Assign a vendor to this group.
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
									<FieldLabel htmlFor="vendorId">Vendor</FieldLabel>
									{errors.vendorId && (
										<FieldError>{errors.vendorId}</FieldError>
									)}
									<Select
										value={vendorId}
										onValueChange={(value) => {
											setVendorId(value);
											if (errors.vendorId) {
												setErrors((prev) => {
													const newErrors = { ...prev };
													delete newErrors.vendorId;
													return newErrors;
												});
											}
										}}
										disabled={createAffiliate.isPending}
									>
										<SelectTrigger id="vendorId" className="rounded-none">
											<SelectValue placeholder="Select a vendor" />
										</SelectTrigger>
										<SelectContent className="rounded-none">
											{activeVendors.map((vendor) => (
												<SelectItem
													key={vendor.id}
													value={vendor.id.toString()}
													className="rounded-none"
												>
													<div className="flex items-center justify-between gap-2">
														<span>{vendor.full_name}</span>
														<span className="text-muted-foreground text-xs">
															{vendor.email}
														</span>
													</div>
												</SelectItem>
											))}
										</SelectContent>
									</Select>
									<FieldDescription>
										Select a vendor to assign to this group.
									</FieldDescription>
								</Field>

								<FieldSeparator />

								{/* Buttons */}
								<div className="flex justify-end gap-2">
									<Button
										type="button"
										variant="outline"
										className = "rounded-none"
										onClick={handleClose}
										disabled={createAffiliate.isPending}
									>
										Cancel
									</Button>
									<Button
										type="submit"
										disabled={createAffiliate.isPending}
										className="rounded-none"
									>
										{createAffiliate.isPending
											? "Assigning..."
											: "Assign Vendor"}
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
