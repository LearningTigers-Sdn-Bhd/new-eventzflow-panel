"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { User, Building2 } from "lucide-react";
import { useId, useState } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import {
	Field,
	FieldError,
	FieldGroup,
	FieldLabel,
	FieldSeparator,
	FieldSet,
} from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { updateVendor } from "@/lib/api/vendor";
import type { Vendor } from "@/lib/api/vendor";

interface EditVendorFormProps {
	vendor: Vendor;
	onClose: () => void;
}

export default function EditVendorForm({
	vendor,
	onClose,
}: EditVendorFormProps) {
	const nameId = useId();
	const emailId = useId();
	const phoneId = useId();
	const passwordId = useId();
	const categoryId = useId();
	const personInChargeId = useId();
	const descriptionId = useId();
	const addressId = useId();
	const notesId = useId();
	const imagePathId = useId();

	const [formData, setFormData] = useState({
		full_name: vendor.full_name,
		email: vendor.email,
		phone: vendor.phone || "",
		newPassword: "",
		// Vendor profile fields
		category: vendor.vendorProfile?.category || "",
		person_in_charge: vendor.vendorProfile?.person_in_charge || "",
		description: vendor.vendorProfile?.description || "",
		address: vendor.vendorProfile?.address || "",
		notes: vendor.vendorProfile?.notes || "",
		image_path: vendor.vendorProfile?.image_path || "",
	});

	const [errors, setErrors] = useState<Record<string, string>>({});

	const queryClient = useQueryClient();
	const updateVendorMutation = useMutation({
		mutationFn: updateVendor,
		onSuccess: () => {
			toast.success("Vendor updated successfully!");
			queryClient.invalidateQueries({ queryKey: ["vendors"] });
			onClose();
		},
		onError: (error: Error) => {
			toast.error(error.message || "Failed to update vendor");
		},
	});

	const handleSubmit = async (e: React.FormEvent) => {
		e.preventDefault();
		setErrors({});

		// Basic validation
		const newErrors: Record<string, string> = {};

		if (!formData.full_name || formData.full_name.length < 2) {
			newErrors.full_name = "Name must be at least 2 characters";
		}

		if (!formData.email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
			newErrors.email = "Please enter a valid email address";
		}

		if (Object.keys(newErrors).length > 0) {
			setErrors(newErrors);
			return;
		}

		try {
			await updateVendorMutation.mutateAsync({
				id: vendor.id,
				full_name: formData.full_name,
				email: formData.email,
				phone: formData.phone || undefined,
				newPassword: formData.newPassword || undefined,
				vendor_profile_attributes: {
					category: formData.category || undefined,
					person_in_charge: formData.person_in_charge || undefined,
					description: formData.description || undefined,
					address: formData.address || undefined,
					notes: formData.notes || undefined,
					image_path: formData.image_path || undefined,
				},
			});
		} catch {
			// Error is handled by onError callback
		}
	};

	const handleChange = (field: string, value: string) => {
		setFormData((prev) => ({ ...prev, [field]: value }));
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
		<div className="mx-auto w-full max-w-8xl px-8">
			<form onSubmit={handleSubmit}>
				<FieldSet>
					<FieldSeparator />
					<FieldGroup>
						{/* Two Column Layout: Basic Info (Left) | Profile Info (Right) */}
						<div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
							{/* LEFT COLUMN - Basic Information */}
							<div className="space-y-4">
								<div className="flex items-center gap-2 border-b pb-2">
									<User className="size-5 text-primary" />
									<h3 className="font-semibold text-lg">Basic Information</h3>
								</div>

								{/* Name - Full Width */}
								<Field orientation="vertical">
									<FieldLabel htmlFor={nameId}>Vendor Name</FieldLabel>
									{errors.full_name && <FieldError>{errors.full_name}</FieldError>}
									<Input
										id={nameId}
										placeholder="John Doe"
										value={formData.full_name}
										onChange={(e) => handleChange("full_name", e.target.value)}
										required
										disabled={updateVendorMutation.isPending}
									/>
								</Field>

								{/* Email */}
								<Field orientation="vertical">
									<FieldLabel htmlFor={emailId}>Email</FieldLabel>
									{errors.email && <FieldError>{errors.email}</FieldError>}
									<Input
										id={emailId}
										type="email"
										placeholder="john.doe@example.com"
										value={formData.email}
										onChange={(e) => handleChange("email", e.target.value)}
										required
										disabled={updateVendorMutation.isPending}
									/>
								</Field>

								{/* Phone */}
								<Field orientation="vertical">
									<FieldLabel htmlFor={phoneId}>Phone</FieldLabel>
									<Input
										id={phoneId}
										type="tel"
										placeholder="+1234567890"
										value={formData.phone}
										onChange={(e) => handleChange("phone", e.target.value)}
										disabled={updateVendorMutation.isPending}
									/>
								</Field>

								{/* New Password */}
								<Field orientation="vertical">
									<FieldLabel htmlFor={passwordId}>
										New Password (Optional)
									</FieldLabel>
									<Input
										id={passwordId}
										type="password"
										placeholder="Leave blank to keep current password"
										value={formData.newPassword}
										onChange={(e) => handleChange("newPassword", e.target.value)}
										disabled={updateVendorMutation.isPending}
									/>
								</Field>
							</div>

							{/* RIGHT COLUMN - Profile Information */}
							<div className="space-y-4">
								<div className="flex items-center gap-2 border-b pb-2">
									<Building2 className="size-5 text-primary" />
									<h3 className="font-semibold text-lg">Profile Information</h3>
								</div>

								{/* Category */}
								<Field orientation="vertical">
									<FieldLabel htmlFor={categoryId}>Category</FieldLabel>
									<Input
										id={categoryId}
										placeholder="e.g., Food & Beverage, Technology"
										value={formData.category}
										onChange={(e) => handleChange("category", e.target.value)}
										disabled={updateVendorMutation.isPending}
									/>
								</Field>

								{/* Person in Charge */}
								<Field orientation="vertical">
									<FieldLabel htmlFor={personInChargeId}>
										Person in Charge
									</FieldLabel>
									<Input
										id={personInChargeId}
										placeholder="Contact person name"
										value={formData.person_in_charge}
										onChange={(e) => handleChange("person_in_charge", e.target.value)}
										disabled={updateVendorMutation.isPending}
									/>
								</Field>

								{/* Image Path */}
								<Field orientation="vertical">
									<FieldLabel htmlFor={imagePathId}>Image URL</FieldLabel>
									<Input
										id={imagePathId}
										placeholder="https://example.com/image.jpg"
										value={formData.image_path}
										onChange={(e) => handleChange("image_path", e.target.value)}
										disabled={updateVendorMutation.isPending}
									/>
								</Field>

								{/* Description */}
								<Field orientation="vertical">
									<FieldLabel htmlFor={descriptionId}>
										Description
									</FieldLabel>
									<Textarea
										id={descriptionId}
										placeholder="Vendor description"
										value={formData.description}
										onChange={(e) => handleChange("description", e.target.value)}
										disabled={updateVendorMutation.isPending}
										rows={3}
									/>
								</Field>

								{/* Address */}
								<Field orientation="vertical">
									<FieldLabel htmlFor={addressId}>Address</FieldLabel>
									<Textarea
										id={addressId}
										placeholder="Business address"
										value={formData.address}
										onChange={(e) => handleChange("address", e.target.value)}
										disabled={updateVendorMutation.isPending}
										rows={2}
									/>
								</Field>

								{/* Notes */}
								<Field orientation="vertical">
									<FieldLabel htmlFor={notesId}>Notes</FieldLabel>
									<Textarea
										id={notesId}
										placeholder="Additional notes"
										value={formData.notes}
										onChange={(e) => handleChange("notes", e.target.value)}
										disabled={updateVendorMutation.isPending}
										rows={2}
									/>
								</Field>
							</div>
						</div>

						<FieldSeparator />

						{/* Buttons - Right Aligned */}
						<div className="flex justify-end gap-2">
							<Button
								type="button"
								variant="outline"
								onClick={onClose}
								disabled={updateVendorMutation.isPending}
							>
								Cancel
							</Button>
							<Button type="submit" disabled={updateVendorMutation.isPending}>
								{updateVendorMutation.isPending ? "Saving..." : "Save Changes"}
							</Button>
						</div>
					</FieldGroup>
				</FieldSet>
			</form>
		</div>
	);
}
