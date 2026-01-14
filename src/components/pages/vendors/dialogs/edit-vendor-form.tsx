"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Building2, Eye, EyeOff, User } from "lucide-react";
import { useEffect, useId, useState } from "react";
import { toast } from "sonner";
import { FormGroupContainer } from "@/components/admin-ui/form/form-group-container";
import { InputActionLabel } from "@/components/admin-ui/form/input-action-label";
import { InputLabel } from "@/components/admin-ui/form/input-label";
import { SelectLabel } from "@/components/admin-ui/form/select-label";
import ImageUpload from "@/components/file-upload/image-upload";
import { Button } from "@/components/ui/button";
import { Field, FieldGroup, FieldLabel, FieldSet } from "@/components/ui/field";
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
	const customCategoryId = useId();
	const personInChargeId = useId();
	const descriptionId = useId();
	const companyProfileId = useId();
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
		company_profile: vendor.vendorProfile?.company_profile || "",
		address: vendor.vendorProfile?.address || "",
		notes: vendor.vendorProfile?.notes || "",
	});

	const [image, setImage] = useState<File | null>(null);
	const [imageUrl, setImageUrl] = useState(vendor.vendorProfile?.image_url || "");
	const [removeImage, setRemoveImage] = useState(false);
	const [errors, setErrors] = useState<Record<string, string>>({});
	const [showPassword, setShowPassword] = useState(false);

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
			company_profile: vendor.vendorProfile?.company_profile || "",
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

	const isPending = updateVendorMutation.isPending;

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
			profileAttributes.company_profile = formData.company_profile;
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

	// Category options for select
	const categoryOptions = VENDOR_CATEGORIES.map((cat) => ({
		value: cat,
		label: cat,
	}));

	return (
		<div className="w-full px-0 pt-0 md:px-4 md:pt-4">
			<form
				onSubmit={handleSubmit}
				className="flex flex-col justify-between gap-4 md:gap-8 md:pb-4"
			>
				<FieldSet>
					{/* Account Information */}
					<FormGroupContainer
						title={{
							icon: User,
							label: "Account Information",
							description: "Login credentials and profile image",
						}}
					>
						<div className="grid grid-cols-1 gap-4 lg:grid-cols-[1fr_auto]">
							{/* Left side - Form fields */}
							<div className="space-y-4">
								<div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
									<InputLabel
										htmlFor={nameId}
										label="Full Name"
										placeholder="John Doe"
										value={formData.full_name}
										onChange={(value) => handleChange("full_name", value)}
										required
										disabled={isPending}
										variant="no-rounded"
										isInvalid={!!errors.full_name}
										errors={errors.full_name ? [{ message: errors.full_name }] : undefined}
									/>
									<InputLabel
										htmlFor={emailId}
										label="Email Address"
										placeholder="vendor@example.com"
										value={formData.email}
										onChange={(value) => handleChange("email", value)}
										required
										disabled={isPending}
										variant="no-rounded"
										isInvalid={!!errors.email}
										errors={errors.email ? [{ message: errors.email }] : undefined}
									/>
								</div>

								<div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
									<InputLabel
										htmlFor={phoneId}
										label="Phone Number"
										placeholder="+60123456789"
										value={formData.phone}
										onChange={(value) => handleChange("phone", value)}
										disabled={isPending}
										variant="no-rounded"
									/>
									<InputActionLabel
										htmlFor={passwordId}
										label="New Password"
										description="Leave blank to keep current password"
										type={showPassword ? "text" : "password"}
										placeholder="Enter new password"
										value={formData.newPassword}
										onChange={(value) => handleChange("newPassword", value)}
										disabled={isPending}
										variant="no-rounded"
										onAction={() => setShowPassword(!showPassword)}
										actionIcon={showPassword ? <EyeOff /> : <Eye />}
										actionLabel={showPassword ? "Hide password" : "Show password"}
									/>
								</div>
							</div>

							{/* Right side - Image upload */}
							<Field orientation="vertical" className="lg:w-100">
								<FieldLabel>Vendor Profile Image</FieldLabel>
								<ImageUpload
									value={image || imageUrl}
									onChange={handleImageChange}
									disabled={isPending}
								/>
							</Field>
						</div>
					</FormGroupContainer>

					{/* Business Details */}
					<FormGroupContainer
						title={{
							icon: Building2,
							label: "Business Details",
							description: "Vendor business information and profile",
						}}
					>
						<div className={`grid grid-cols-1 gap-4 ${formData.category === "Others" ? "sm:grid-cols-3" : "sm:grid-cols-2"}`}>
							<SelectLabel
								htmlFor={categoryId}
								label="Business Category"
								placeholder="Select a category"
								value={formData.category}
								onChange={(value) => {
									handleChange("category", value);
									if (value !== "Others") {
										handleChange("customCategory", "");
									}
								}}
								options={categoryOptions}
								disabled={isPending}
								variant="no-rounded"
							/>
							{formData.category === "Others" && (
								<InputLabel
									htmlFor={customCategoryId}
									label="Custom Category Name"
									placeholder="Enter your category"
									value={formData.customCategory}
									onChange={(value) => handleChange("customCategory", value)}
									disabled={isPending}
									variant="no-rounded"
								/>
							)}
							<InputLabel
								htmlFor={personInChargeId}
								label="Person In Charge"
								placeholder="Contact person name"
								value={formData.person_in_charge}
								onChange={(value) => handleChange("person_in_charge", value)}
								disabled={isPending}
								variant="no-rounded"
							/>
						</div>

						<InputLabel
							htmlFor={descriptionId}
							label="Business Information / Products / Projects / Services to be Exhibited"
							type="textarea"
							placeholder="Describe the products, projects, or services you will be exhibiting..."
							value={formData.description}
							onChange={(value) => handleChange("description", value)}
							disabled={isPending}
							variant="no-rounded"
							rows={3}
						/>

						<InputLabel
							htmlFor={companyProfileId}
							label="Company Profile"
							type="textarea"
							placeholder="Brief description of your company, history, and expertise..."
							value={formData.company_profile}
							onChange={(value) => handleChange("company_profile", value)}
							disabled={isPending}
							variant="no-rounded"
							rows={3}
						/>

						<div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
							<InputLabel
								htmlFor={addressId}
								label="Business Address"
								type="textarea"
								placeholder="Your business address"
								value={formData.address}
								onChange={(value) => handleChange("address", value)}
								disabled={isPending}
								variant="no-rounded"
								rows={2}
							/>
							<InputLabel
								htmlFor={notesId}
								label="Wishing to Connect With (Sector's) / Additional Notes"
								type="textarea"
								placeholder="Sectors or types of businesses you'd like to connect with, or any additional notes..."
								value={formData.notes}
								onChange={(value) => handleChange("notes", value)}
								disabled={isPending}
								variant="no-rounded"
								rows={2}
							/>
						</div>
					</FormGroupContainer>
				</FieldSet>

				{/* Action Buttons */}
				<FieldGroup className="flex flex-col gap-2 md:flex-row md:justify-end">
					<Button
						type="button"
						variant="outline"
						onClick={onClose}
						disabled={isPending}
						className="rounded-none py-6 md:py-2"
					>
						Cancel
					</Button>
					<Button
						type="submit"
						disabled={isPending}
						className="rounded-none py-6 md:py-2"
					>
						{isPending ? "Updating..." : "Update Vendor"}
					</Button>
				</FieldGroup>
			</form>
		</div>
	);
}
