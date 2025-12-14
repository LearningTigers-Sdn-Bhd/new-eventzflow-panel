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
import { Textarea } from "@/components/ui/textarea";
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
	const qrUrlField = useId();
	const picFullNameField = useId();
	const picContactNumberField = useId();
	const picEmailField = useId();
	const specialRequirementsField = useId();

	const [vendorId, setVendorId] = useState<string>("");
	const [redirectUrl, setRedirectUrl] = useState("");
	const [posterUrl, setPosterUrl] = useState("");
	const [qrUrl, setQrUrl] = useState("");

	// PIC fields for exhibitor kit
	const [picFullName, setPicFullName] = useState("");
	const [picContactNumber, setPicContactNumber] = useState("");
	const [picEmail, setPicEmail] = useState("");
	const [specialRequirements, setSpecialRequirements] = useState("");

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
	const createExhibitorMutation = useMutation({
		mutationFn: (data: Parameters<typeof createEventVendor>[1]) =>
			createEventVendor(eventId, data),
		onSuccess: () => {
			toast.success("Exhibitor added to event successfully!");
			queryClient.invalidateQueries({
				queryKey: ["event", eventId.toString(), "vendors"],
			});
			onClose?.();
		},
		onError: (error: Error) => {
			toast.error(error.message || "Failed to assign exhibitor");
		},
	});

	const handleSubmit = async (e: React.FormEvent) => {
		e.preventDefault();
		setErrors({});

		const newErrors: Record<string, string> = {};

		if (!vendorId) {
			newErrors.vendorId = "Please select a vendor";
		}

		// Validate PIC fields (required for exhibitors)
		if (!picFullName.trim()) {
			newErrors.picFullName = "PIC full name is required";
		}
		if (!picContactNumber.trim()) {
			newErrors.picContactNumber = "PIC contact number is required";
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

			// Add exhibitor kit attributes
			data.exhibitor_kit_attributes = {
				pic_full_name: picFullName.trim(),
				pic_contact_number: picContactNumber.trim(),
				pic_email_address: picEmail.trim() || undefined,
				special_requirements: specialRequirements.trim() || undefined,
			};

			await createExhibitorMutation.mutateAsync(data);
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
						Assign Individual Exhibitor
					</FieldLegend>
					<FieldDescription>
						Select a vendor and configure their exhibitor details for this
						event.
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
								disabled={createExhibitorMutation.isPending}
							>
								<SelectTrigger id={vendorIdField}>
									<SelectValue placeholder="Select a vendor" />
								</SelectTrigger>
								<SelectContent>
									{activeVendors.map((vendor) => {
										const isAlreadyAdded = addedVendorIds.has(
											Number(vendor.id),
										);
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
								Select a vendor to assign as exhibitor to this event.
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
									disabled={createExhibitorMutation.isPending}
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
									disabled={createExhibitorMutation.isPending}
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
									disabled={createExhibitorMutation.isPending}
									className="rounded-none"
								/>
							</Field>
						</div>

						<FieldSeparator />

						{/* PIC Information */}
						<div className="rounded-none border border-dashed bg-muted/30 p-4">
							<p className="mb-4 font-medium text-sm">
								Person In Charge (PIC) Information
							</p>

							<div className="mb-4 grid grid-cols-1 gap-4 md:grid-cols-3">
								<Field orientation="vertical">
									<FieldLabel htmlFor={picFullNameField}>
										Full Name *
									</FieldLabel>
									{errors.picFullName && (
										<FieldError>{errors.picFullName}</FieldError>
									)}
									<Input
										id={picFullNameField}
										type="text"
										value={picFullName}
										onChange={(e) => {
											setPicFullName(e.target.value);
											if (errors.picFullName) {
												setErrors((prev) => {
													const newErrors = { ...prev };
													delete newErrors.picFullName;
													return newErrors;
												});
											}
										}}
										placeholder="Enter full name"
										disabled={createExhibitorMutation.isPending}
										className="rounded-none"
									/>
								</Field>

								<Field orientation="vertical">
									<FieldLabel htmlFor={picContactNumberField}>
										Contact Number *
									</FieldLabel>
									{errors.picContactNumber && (
										<FieldError>{errors.picContactNumber}</FieldError>
									)}
									<Input
										id={picContactNumberField}
										type="tel"
										value={picContactNumber}
										onChange={(e) => {
											setPicContactNumber(e.target.value);
											if (errors.picContactNumber) {
												setErrors((prev) => {
													const newErrors = { ...prev };
													delete newErrors.picContactNumber;
													return newErrors;
												});
											}
										}}
										placeholder="Enter contact number"
										disabled={createExhibitorMutation.isPending}
										className="rounded-none"
									/>
								</Field>

								<Field orientation="vertical">
									<FieldLabel htmlFor={picEmailField}>
										Email Address (Optional)
									</FieldLabel>
									<Input
										id={picEmailField}
										type="email"
										value={picEmail}
										onChange={(e) => setPicEmail(e.target.value)}
										placeholder="Enter email address"
										disabled={createExhibitorMutation.isPending}
										className="rounded-none"
									/>
								</Field>
							</div>

							<Field orientation="vertical">
								<FieldLabel htmlFor={specialRequirementsField}>
									Special Requirements (Optional)
								</FieldLabel>
								<Textarea
									id={specialRequirementsField}
									value={specialRequirements}
									onChange={(e) => setSpecialRequirements(e.target.value)}
									placeholder="Enter any special requirements..."
									disabled={createExhibitorMutation.isPending}
									className="min-h-[80px] rounded-none"
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
								disabled={createExhibitorMutation.isPending}
							>
								Cancel
							</Button>
							<Button
								type="submit"
								disabled={createExhibitorMutation.isPending}
							>
								{createExhibitorMutation.isPending
									? "Assigning..."
									: "Assign Exhibitor"}
							</Button>
						</div>
					</FieldGroup>
				</FieldSet>
			</form>
		</section>
	);
}
