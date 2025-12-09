"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Building2, CheckCircle2 } from "lucide-react";
import Link from "next/link";
import { useId, useMemo, useState } from "react";
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

export default function ManualAddForm({ eventId, onClose }: ManualAddFormProps) {
	const vendorIdField = useId();
	const redirectUrlField = useId();
	const posterUrlField = useId();
	const qrUrlField = useId();

	const [vendorId, setVendorId] = useState<string>("");
	const [redirectUrl, setRedirectUrl] = useState("");
	const [posterUrl, setPosterUrl] = useState("");
	const [qrUrl, setQrUrl] = useState("");

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
	const { data: eventVendors, isLoading: isLoadingEventVendors } = useQuery({
		queryKey: ["event", eventId.toString(), "vendors"],
		queryFn: () => getEventVendors(eventId),
	});

	// Create a set of already added vendor IDs for quick lookup
	const addedVendorIds = useMemo(() => {
		if (!eventVendors) return new Set<number>();
		return new Set(eventVendors.map((ev) => ev.vendor_id));
	}, [eventVendors]);

	const queryClient = useQueryClient();
	const createVendorMutation = useMutation({
		mutationFn: (data: Parameters<typeof createEventVendor>[1]) =>
			createEventVendor(eventId, data),
		onSuccess: () => {
			toast.success("Vendor added to event successfully!");
			queryClient.invalidateQueries({
				queryKey: ["event", eventId.toString(), "vendors"],
			});
			onClose?.();
		},
		onError: (error: Error) => {
			toast.error(error.message || "Failed to assign vendor");
		},
	});

	const handleSubmit = async (e: React.FormEvent) => {
		e.preventDefault();
		setErrors({});

		const newErrors: Record<string, string> = {};

		if (!vendorId) {
			newErrors.vendorId = "Please select a vendor";
		}

		if (Object.keys(newErrors).length > 0) {
			setErrors(newErrors);
			return;
		}

		try {
			const data: Parameters<typeof createEventVendor>[1] = {
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

			const trimmedQrUrl = qrUrl.trim();
			if (trimmedQrUrl) {
				data.qr_url = trimmedQrUrl;
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
				description="There are no vendors in the system. Create vendors first from the Vendors page."
				icon={<Building2 className="size-8" />}
				height="h-[300px]"
				action={
					<div className="flex gap-2">
						<Button onClick={onClose} variant="outline">
							Close
						</Button>
						<Button asChild>
							<Link href="/vendor">Go to Vendors</Link>
						</Button>
					</div>
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
				description="All vendors are currently inactive. Activate vendors from the Vendors page."
				icon={<Building2 className="size-8" />}
				height="h-[300px]"
				action={
					<div className="flex gap-2">
						<Button onClick={onClose} variant="outline">
							Close
						</Button>
						<Button asChild>
							<Link href="/vendor">Go to Vendors</Link>
						</Button>
					</div>
				}
			/>
		);
	}

	return (
		<section className="w-full">
			<form onSubmit={handleSubmit}>
				<FieldSet>
					<FieldLegend className="font-bold text-xl">
						Assign Individual Vendor
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
												<div className="flex w-full items-center gap-2">
													<Building2 className="h-4 w-4 flex-shrink-0 text-muted-foreground" />
													<div className="flex min-w-0 flex-1 items-center gap-2">
														<span className="truncate font-medium">
															{vendor.full_name}
														</span>
														<span className="text-muted-foreground">•</span>
														<span className="truncate text-muted-foreground text-sm">
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
								Select a vendor to assign to this event.
							</FieldDescription>
						</Field>

						<FieldSeparator />

						{/* URL Fields */}
						<div className="grid grid-cols-1 gap-4 md:grid-cols-3">
							<Field orientation="vertical">
								<FieldLabel htmlFor={redirectUrlField}>
									Redirect URL (Optional)
								</FieldLabel>
								<Input
									id={redirectUrlField}
									type="url"
									value={redirectUrl}
									onChange={(e) => setRedirectUrl(e.target.value)}
									placeholder="https://example.com"
									disabled={createVendorMutation.isPending}
									className="rounded-none"
								/>
							</Field>

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
							</Field>

							<Field orientation="vertical">
								<FieldLabel htmlFor={qrUrlField}>
									QR Code URL (Optional)
								</FieldLabel>
								<Input
									id={qrUrlField}
									type="url"
									value={qrUrl}
									onChange={(e) => setQrUrl(e.target.value)}
									placeholder="https://example.com"
									disabled={createVendorMutation.isPending}
									className="rounded-none"
								/>
							</Field>
						</div>

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
								{createVendorMutation.isPending ? "Assigning..." : "Assign Vendor"}
							</Button>
						</div>
					</FieldGroup>
				</FieldSet>
			</form>
		</section>
	);
}
