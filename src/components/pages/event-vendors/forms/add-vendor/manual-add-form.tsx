"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Building2, CheckCircle2 } from "lucide-react";
import { useId, useState, useMemo } from "react";
import { toast } from "sonner";
import { EmptyState, ErrorState, LoadingState } from "@/components/data-state";
import { Button } from "@/components/ui/button";
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
import { Input } from "@/components/ui/input";
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from "@/components/ui/select";
import { createEventVendor, getEventVendors } from "@/lib/api/event-vendor";
import { getVendors } from "@/lib/api/vendor";

interface ManualAddFormProps {
	eventId: number;
	onClose?: () => void;
}

export default function ManualAddForm({
	eventId,
	onClose,
}: ManualAddFormProps) {
	const vendorIdField = useId();
	const redirectUrlField = useId();
	const posterUrlField = useId();

	const [vendorId, setVendorId] = useState<string>("");
	const [redirectUrl, setRedirectUrl] = useState("");
	const [posterUrl, setPosterUrl] = useState("");
	const [errors, setErrors] = useState<Record<string, string>>({});

	// Fetch available vendors
	const {
		data: vendors,
		isLoading: isLoadingVendors,
		error: vendorsError,
	} = useQuery({
		queryKey: ["vendors"],
		queryFn: getVendors,
	});

	// Fetch existing event vendors to check which are already added
	const {
		data: eventVendors,
		isLoading: isLoadingEventVendors,
	} = useQuery({
		queryKey: ["event", eventId.toString(), "vendors"],
		queryFn: () => getEventVendors(eventId),
	});

	// Create a set of already added vendor IDs for quick lookup
	const addedVendorIds = useMemo(() => {
		if (!eventVendors) return new Set<number>();
		return new Set(eventVendors.map(ev => ev.vendor_id));
	}, [eventVendors]);

	const queryClient = useQueryClient();
	const createVendorMutation = useMutation({
		mutationFn: (data: {
			vendor_id: number;
			redirect_url?: string;
			poster_url?: string;
		}) => createEventVendor(eventId, data),
		onSuccess: () => {
			toast.success("Vendor added to event successfully!");
			// Invalidate and refetch event vendors query
			queryClient.invalidateQueries({
				queryKey: ["event", eventId.toString(), "vendors"],
			});
			onClose?.();
		},
		onError: (error: Error) => {
			toast.error(error.message || "Failed to add vendor");
		},
	});

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
			const data: {
				vendor_id: number;
				redirect_url?: string;
				poster_url?: string;
			} = {
				vendor_id: Number(vendorId),
			};

			const trimmedRedirectUrl = redirectUrl.trim();
			if (trimmedRedirectUrl) {
				data.redirect_url = trimmedRedirectUrl;
			}

			const trimmedPosterUrl = posterUrl.trim();
			if (trimmedPosterUrl) {
				data.poster_url = trimmedPosterUrl;
			}

			await createVendorMutation.mutateAsync(data);
		} catch {
			// Error is handled by onError callback
		}
	};

	if (isLoadingVendors || isLoadingEventVendors) {
		return (
			<LoadingState
				title="Loading vendors..."
				description="Please wait..."
				height="h-[300px]"
			/>
		);
	}

	if (vendorsError) {
		return (
			<ErrorState
				title="Failed to load vendors"
				description="Please try again later"
				height="h-[300px]"
			/>
		);
	}

	if (!vendors || vendors.length === 0) {
		return (
			<EmptyState
				title="No vendors available"
				description="There are no vendors in the system. Please create a vendor first."
				icon={<Building2 className="size-8" />}
				height="h-[300px]"
				action={
					<Button onClick={onClose} variant="outline">
						Close
					</Button>
				}
			/>
		);
	}

	// Filter only active vendors
	const activeVendors = vendors.filter((v) => v.status === "active");

	if (activeVendors.length === 0) {
		return (
			<EmptyState
				title="No active vendors available"
				description="All vendors are currently inactive. Please activate a vendor first."
				icon={<Building2 className="size-8" />}
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
					<FieldLegend className="font-bold text-xl">
						Add Individual Vendor
					</FieldLegend>
					<FieldDescription>
						Select a vendor and configure their settings for this event.
					</FieldDescription>
					<FieldSeparator />
					<FieldGroup>
						{/* Vendor Selection */}
						<Field orientation="vertical">
							<FieldLabel htmlFor={vendorIdField}>Vendor *</FieldLabel>
							{errors.vendorId && <FieldError>{errors.vendorId}</FieldError>}
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
								disabled={createVendorMutation.isPending}
							>
								<SelectTrigger id={vendorIdField}>
									<SelectValue placeholder="Select a vendor" />
								</SelectTrigger>
								<SelectContent>
									{activeVendors.map((vendor) => {
										const isAlreadyAdded = addedVendorIds.has(Number(vendor.id));
										return (
											<SelectItem
												key={vendor.id}
												value={vendor.id.toString()}
												disabled={isAlreadyAdded}
											>
												<div className="flex items-center gap-2 w-full">
													<Building2 className="h-4 w-4 text-muted-foreground flex-shrink-0" />
													<div className="flex items-center gap-2 flex-1 min-w-0">
														<span className="font-medium truncate">
															{vendor.full_name}
														</span>
														<span className="text-muted-foreground">•</span>
														<span className="text-muted-foreground text-sm truncate">
															{vendor.email}
														</span>
													</div>
													{isAlreadyAdded && (
														<CheckCircle2 className="h-4 w-4 flex-shrink-0 text-green-600" />
													)}
												</div>
											</SelectItem>
										);
									})}
								</SelectContent>
							</Select>
							<FieldDescription>
								Select a vendor to add to this event.
							</FieldDescription>
						</Field>

						<FieldSeparator />

						{/* Redirect URL */}
						<Field orientation="vertical">
							<FieldLabel htmlFor={redirectUrlField}>Redirect URL (Optional)</FieldLabel>
							<Input
								id={redirectUrlField}
								type="url"
								value={redirectUrl}
								onChange={(e) => setRedirectUrl(e.target.value)}
								placeholder="https://example.com"
								disabled={createVendorMutation.isPending}
								className="rounded-none"
							/>
							<FieldDescription>
								The URL where visitors will be redirected when they interact
								with this vendor.
							</FieldDescription>
						</Field>

						<FieldSeparator />

						{/* Poster URL (Optional) */}
						<Field orientation="vertical">
							<FieldLabel htmlFor={posterUrlField}>
								Poster URL (Optional)
							</FieldLabel>
							<Input
								id={posterUrlField}
								type="url"
								value={posterUrl}
								onChange={(e) => setPosterUrl(e.target.value)}
								placeholder="https://example.com/poster.jpg"
								disabled={createVendorMutation.isPending}
								className="rounded-none"
							/>
							<FieldDescription>
								Optional poster image URL for the vendor's display.
							</FieldDescription>
						</Field>

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
							<Button type="submit" disabled={createVendorMutation.isPending}>
								{createVendorMutation.isPending ? "Adding..." : "Add Vendor"}
							</Button>
						</div>
					</FieldGroup>
				</FieldSet>
			</form>
		</section>
	);
}
