"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useParams } from "next/navigation";
import { useId, useState } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import {
	Field,
	FieldDescription,
	FieldError,
	FieldGroup,
	FieldLabel,
	FieldSeparator,
	FieldSet,
} from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { useDialog } from "@/hooks/use-dialog";
import type {
	EventVendor,
	UpdateEventVendorRequest,
} from "@/lib/api/event-vendor";
import { updateEventVendor } from "@/lib/api/event-vendor";

interface EditEventVendorFormProps {
	vendor: EventVendor;
}

export default function EditEventVendorForm({
	vendor,
}: EditEventVendorFormProps) {
	const { closeDialog } = useDialog();
	const params = useParams();
	const eventId = Number(params.event_id);
	const queryClient = useQueryClient();

	// Generate unique IDs for form fields
	const vendorNameId = useId();
	const redirectUrlId = useId();
	const posterUrlId = useId();
	const qrUrlId = useId();

	// Form state - Initialize with vendor data
	const [redirectUrl, setRedirectUrl] = useState(vendor.redirect_url || "");
	const [posterUrl, setPosterUrl] = useState(vendor.poster_url || "");
	const [qrUrl, setQrUrl] = useState(vendor.qr_url || "");

	// Validation errors
	const [errors, setErrors] = useState<Record<string, string>>({});

	// Update vendor mutation
	const updateVendorMutation = useMutation({
		mutationFn: (data: UpdateEventVendorRequest) =>
			updateEventVendor(eventId, vendor.id, data),
		onSuccess: () => {
			toast.success("Vendor updated successfully!");
			// Invalidate the vendors query to refetch the list
			queryClient.invalidateQueries({
				queryKey: ["event", eventId.toString(), "vendors"],
			});
			closeDialog();
		},
		onError: (error: Error) => {
			toast.error(error.message || "Failed to update vendor");
		},
	});

	// Handle form submission
	const handleSubmit = async (e: React.FormEvent) => {
		e.preventDefault();
		setErrors({});

		// Validation
		const newErrors: Record<string, string> = {};

		// Validate redirect URL if provided
		if (redirectUrl.trim() && !/^https?:\/\/.+/.test(redirectUrl.trim())) {
			newErrors.redirectUrl =
				"Please enter a valid URL (must start with http:// or https://)";
		}

		// Validate poster URL if provided
		if (posterUrl.trim() && !/^https?:\/\/.+/.test(posterUrl.trim())) {
			newErrors.posterUrl =
				"Please enter a valid URL (must start with http:// or https://)";
		}

		// Validate QR URL if provided
		if (qrUrl.trim() && !/^https?:\/\/.+/.test(qrUrl.trim())) {
			newErrors.qrUrl =
				"Please enter a valid URL (must start with http:// or https://)";
		}

		if (Object.keys(newErrors).length > 0) {
			setErrors(newErrors);
			return;
		}

		try {
			const vendorData: UpdateEventVendorRequest = {
				redirect_url: redirectUrl.trim() || undefined,
				poster_url: posterUrl.trim() || undefined,
				qr_url: qrUrl.trim() || undefined,
			};
			await updateVendorMutation.mutateAsync(vendorData);
		} catch (_error) {
			// Error is handled by onError callback
		}
	};

	const handleChange = (field: string, value: string) => {
		if (field === "redirectUrl") setRedirectUrl(value);
		if (field === "posterUrl") setPosterUrl(value);
		if (field === "qrUrl") setQrUrl(value);

		// Clear error for this field when user starts typing
		if (errors[field]) {
			setErrors((prev) => {
				const newErrors = { ...prev };
				delete newErrors[field];
				return newErrors;
			});
		}
	};

	return (
		<div className="w-full">
			<form onSubmit={handleSubmit}>
				<FieldSet>
					<FieldSeparator />
					<FieldGroup>
						{/* Vendor Information Section */}
						<div className="space-y-4">
							<div>
								<h3 className="font-semibold text-lg">Vendor Information</h3>
								<p className="text-muted-foreground text-sm">
									Update the vendor details for this event
								</p>
							</div>

							<div className="grid grid-cols-1 gap-4">
								{/* Vendor Name (Read-only) */}
								<Field orientation="vertical">
									<FieldLabel htmlFor={vendorNameId}>Vendor Name</FieldLabel>
									<Input
										id={vendorNameId}
										value={vendor.vendor.full_name}
										disabled
										className="bg-muted"
									/>
									<FieldDescription>
										Vendor name cannot be changed
									</FieldDescription>
								</Field>

								{/* Redirect URL */}
								<Field orientation="vertical">
									<FieldLabel htmlFor={redirectUrlId}>Redirect URL</FieldLabel>
									{errors.redirectUrl && (
										<FieldError>{errors.redirectUrl}</FieldError>
									)}
									<Input
										id={redirectUrlId}
										type="url"
										placeholder="https://example.com"
										value={redirectUrl}
										onChange={(e) =>
											handleChange("redirectUrl", e.target.value)
										}
										disabled={updateVendorMutation.isPending}
									/>
									<FieldDescription>
										Optional URL to redirect users when they interact with this
										vendor
									</FieldDescription>
								</Field>

								{/* Poster URL */}
								<Field orientation="vertical">
									<FieldLabel htmlFor={posterUrlId}>Poster URL</FieldLabel>
									{errors.posterUrl && (
										<FieldError>{errors.posterUrl}</FieldError>
									)}
									<Input
										id={posterUrlId}
										type="url"
										placeholder="https://example.com/poster.jpg"
										value={posterUrl}
										onChange={(e) => handleChange("posterUrl", e.target.value)}
										disabled={updateVendorMutation.isPending}
									/>
									<FieldDescription>
										Optional URL for the vendor's poster or banner image
									</FieldDescription>
								</Field>

								{/* QR URL */}
								<Field orientation="vertical">
									<FieldLabel htmlFor={qrUrlId}>QR Code URL</FieldLabel>
									{errors.qrUrl && <FieldError>{errors.qrUrl}</FieldError>}
									<Input
										id={qrUrlId}
										type="url"
										placeholder="https://example.com"
										value={qrUrl}
										onChange={(e) => handleChange("qrUrl", e.target.value)}
										disabled={updateVendorMutation.isPending}
									/>
									<FieldDescription>
										URL to be encoded in the QR code (e.g., vendor website,
										social media link)
									</FieldDescription>
								</Field>
							</div>
						</div>

						<FieldSeparator />

						{/* Submit Buttons - Right Aligned */}
						<div className="flex justify-end gap-2">
							<Button
								type="button"
								variant="outline"
								onClick={closeDialog}
								disabled={updateVendorMutation.isPending}
							>
								Cancel
							</Button>
							<Button type="submit" disabled={updateVendorMutation.isPending}>
								{updateVendorMutation.isPending
									? "Updating..."
									: "Update Vendor"}
							</Button>
						</div>
					</FieldGroup>
				</FieldSet>
			</form>
		</div>
	);
}
