"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Building2, User } from "lucide-react";
import { useEffect, useId, useState } from "react";
import { toast } from "sonner";
import ImageUpload from "@/components/file-upload/image-upload";
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
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import type { Vendor } from "@/lib/api/vendor";
import { updateVendor } from "@/lib/api/vendor";

const VENDOR_CATEGORIES = [
	"Food & Beverage",
	"Merchandise",
	"Services",
	"Entertainment",
	"Beauty & Wellness",
	"Travel & Transport",
	"Electronics",
	"Fashion & Apparel",
	"Health & Fitness",
	"Education",
	"Photography & Media",
	"Event Services",
	"Others",
] as const;

// Helper to determine if a category is predefined or custom
function getCategoryState(category: string | null | undefined): {
	selected: string;
	custom: string;
} {
	if (!category) return { selected: "", custom: "" };
	const isPredefined = VENDOR_CATEGORIES.includes(
		category as (typeof VENDOR_CATEGORIES)[number],
	);
	return isPredefined
		? { selected: category, custom: "" }
		: { selected: "Others", custom: category };
}

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

	const initialCategoryState = getCategoryState(vendor.vendorProfile?.category);

	const [formData, setFormData] = useState({
		full_name: vendor.full_name,
		email: vendor.email,
		phone: vendor.phone || "",
		newPassword: "",
		// Vendor profile fields
		category: initialCategoryState.selected,
		customCategory: initialCategoryState.custom,
		person_in_charge: vendor.vendorProfile?.person_in_charge || "",
		description: vendor.vendorProfile?.description || "",
		address: vendor.vendorProfile?.address || "",
		notes: vendor.vendorProfile?.notes || "",
	});

	const [image, setImage] = useState<File | null>(null);
	const [imageUrl, setImageUrl] = useState(vendor.vendorProfile?.image_url || "");
	const [removeImage, setRemoveImage] = useState(false);
	const [errors, setErrors] = useState<Record<string, string>>({});

	// Reset form state when vendor prop changes (e.g., after update and reopen)
	useEffect(() => {
		const categoryState = getCategoryState(vendor.vendorProfile?.category);
		setFormData({
			full_name: vendor.full_name,
			email: vendor.email,
			phone: vendor.phone || "",
			newPassword: "",
			category: categoryState.selected,
			customCategory: categoryState.custom,
			person_in_charge: vendor.vendorProfile?.person_in_charge || "",
			description: vendor.vendorProfile?.description || "",
			address: vendor.vendorProfile?.address || "",
			notes: vendor.vendorProfile?.notes || "",
		});
		setImage(null);
		setImageUrl(vendor.vendorProfile?.image_url || "");
		setRemoveImage(false);
		setErrors({});
	}, [vendor]);

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
			// Determine final category value
			const finalCategory = formData.category === "Others"
				? formData.customCategory.trim()
				: formData.category;

			// Build profile attributes - send empty string to clear fields, undefined to keep unchanged
			const profileAttributes: Record<string, string | number | File | boolean | undefined> = {};

			// Include profile id for updates (prevents destroy/recreate)
			if (vendor.vendorProfile?.id) {
				profileAttributes.id = vendor.vendorProfile.id;
			}

			// For text fields: send the value (empty string clears, value updates)
			profileAttributes.category = finalCategory;
			profileAttributes.person_in_charge = formData.person_in_charge;
			profileAttributes.description = formData.description;
			profileAttributes.address = formData.address;
			profileAttributes.notes = formData.notes;


			// Handle image
			if (image) {
				profileAttributes.image = image;
			}
			if (removeImage) {
				profileAttributes.remove_image = true;
			}

			await updateVendorMutation.mutateAsync({
				id: vendor.id,
				full_name: formData.full_name,
				email: formData.email,
				phone: formData.phone || undefined,
				newPassword: formData.newPassword || undefined,
				vendor_profile_attributes: profileAttributes,
			});
		} catch {
			// Error is handled by onError callback
		}
	};

	const handleImageChange = (file: File | null) => {
		setImage(file);
		if (file === null && imageUrl) {
			// User removed the existing image
			setRemoveImage(true);
			setImageUrl("");
		} else if (file !== null) {
			// User uploaded a new image
			setRemoveImage(false);
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
									{errors.full_name && (
										<FieldError>{errors.full_name}</FieldError>
									)}
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
										onChange={(e) =>
											handleChange("newPassword", e.target.value)
										}
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
								<div
									className={`grid gap-4 ${formData.category === "Others" ? "grid-cols-2" : "grid-cols-1"}`}
								>
									<Field orientation="vertical">
										<FieldLabel htmlFor={categoryId}>Category</FieldLabel>
										<Select
											value={formData.category}
											onValueChange={(value) => {
												handleChange("category", value);
												if (value !== "Others") {
													handleChange("customCategory", "");
												}
											}}
											disabled={updateVendorMutation.isPending}
										>
											<SelectTrigger id={categoryId}>
												<SelectValue placeholder="Select a category" />
											</SelectTrigger>
											<SelectContent>
												{VENDOR_CATEGORIES.map((category) => (
													<SelectItem key={category} value={category}>
														{category}
													</SelectItem>
												))}
											</SelectContent>
										</Select>
									</Field>

									{formData.category === "Others" && (
										<Field orientation="vertical">
											<FieldLabel htmlFor={`${categoryId}-custom`}>
												Custom Category
											</FieldLabel>
											<Input
												id={`${categoryId}-custom`}
												placeholder="Enter custom category"
												value={formData.customCategory}
												onChange={(e) =>
													handleChange("customCategory", e.target.value)
												}
												disabled={updateVendorMutation.isPending}
											/>
										</Field>
									)}
								</div>

								{/* Person in Charge */}
								<Field orientation="vertical">
									<FieldLabel htmlFor={personInChargeId}>
										Person in Charge
									</FieldLabel>
									<Input
										id={personInChargeId}
										placeholder="Contact person name"
										value={formData.person_in_charge}
										onChange={(e) =>
											handleChange("person_in_charge", e.target.value)
										}
										disabled={updateVendorMutation.isPending}
									/>
								</Field>

								{/* Vendor Image */}
								<Field orientation="vertical">
									<FieldLabel>Vendor Image</FieldLabel>
									<ImageUpload
										value={image || imageUrl}
										onChange={handleImageChange}
										disabled={updateVendorMutation.isPending}
									/>
								</Field>

								{/* Description */}
								<Field orientation="vertical">
									<FieldLabel htmlFor={descriptionId}>Description</FieldLabel>
									<Textarea
										id={descriptionId}
										placeholder="Vendor description"
										value={formData.description}
										onChange={(e) =>
											handleChange("description", e.target.value)
										}
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
