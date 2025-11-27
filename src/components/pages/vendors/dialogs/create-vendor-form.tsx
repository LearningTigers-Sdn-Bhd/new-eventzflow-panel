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
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { createVendor } from "@/lib/api/vendor";
import ImageUpload from "@/components/file-upload/image-upload";

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

interface CreateVendorFormProps {
	onClose: () => void;
}

export default function CreateVendorForm({ onClose }: CreateVendorFormProps) {
	const nameId = useId();
	const emailId = useId();
	const phoneId = useId();
	const passwordId = useId();
	const confirmPasswordId = useId();
	const categoryId = useId();
	const personInChargeId = useId();
	const descriptionId = useId();
	const addressId = useId();
	const notesId = useId();

	const [formData, setFormData] = useState({
		full_name: "",
		email: "",
		phone: "",
		password: "",
		confirmPassword: "",
		category: "",
		customCategory: "",
		person_in_charge: "",
		description: "",
		address: "",
		notes: "",
	});

	const [image, setImage] = useState<File | null>(null);
	const [errors, setErrors] = useState<Record<string, string>>({});

	const queryClient = useQueryClient();
	const createVendorMutation = useMutation({
		mutationFn: createVendor,
		onSuccess: () => {
			toast.success("Vendor created successfully!");
			queryClient.invalidateQueries({ queryKey: ["vendors"] });
			onClose();
		},
		onError: (error: Error) => {
			toast.error(error.message || "Failed to create vendor");
		},
	});

	const handleSubmit = async (e: React.FormEvent) => {
		e.preventDefault();
		setErrors({});

		const newErrors: Record<string, string> = {};

		if (!formData.full_name || formData.full_name.length < 2) {
			newErrors.full_name = "Name must be at least 2 characters";
		}

		if (!formData.email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
			newErrors.email = "Please enter a valid email address";
		}

		if (!formData.password || formData.password.length < 8) {
			newErrors.password = "Password must be at least 8 characters";
		}

		if (formData.password !== formData.confirmPassword) {
			newErrors.confirmPassword = "Passwords do not match";
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

			await createVendorMutation.mutateAsync({
				full_name: formData.full_name,
				email: formData.email,
				phone: formData.phone || undefined,
				password: formData.password,
				vendor_profile_attributes: {
					category: finalCategory || undefined,
					person_in_charge: formData.person_in_charge || undefined,
					description: formData.description || undefined,
					address: formData.address || undefined,
					notes: formData.notes || undefined,
					image: image || undefined,
				},
			});
		} catch {
			// Error is handled by onError callback
		}
	};

	const handleImageChange = (file: File | null) => {
		setImage(file);
	};

	const handleChange = (field: string, value: string) => {
		setFormData((prev) => ({ ...prev, [field]: value }));
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
						<div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
							{/* LEFT COLUMN - Basic Information */}
							<div className="space-y-4">
								<div className="flex items-center gap-2 border-b pb-2">
									<User className="size-5 text-primary" />
									<h3 className="font-semibold text-lg">Basic Information</h3>
								</div>

								<Field orientation="vertical">
									<FieldLabel htmlFor={nameId}>Vendor Name</FieldLabel>
									{errors.full_name && <FieldError>{errors.full_name}</FieldError>}
									<Input
										id={nameId}
										placeholder="John Doe"
										value={formData.full_name}
										onChange={(e) => handleChange("full_name", e.target.value)}
										required
										disabled={createVendorMutation.isPending}
									/>
								</Field>

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
										disabled={createVendorMutation.isPending}
									/>
								</Field>

								<Field orientation="vertical">
									<FieldLabel htmlFor={phoneId}>Phone (Optional)</FieldLabel>
									<Input
										id={phoneId}
										type="tel"
										placeholder="+1234567890"
										value={formData.phone}
										onChange={(e) => handleChange("phone", e.target.value)}
										disabled={createVendorMutation.isPending}
									/>
								</Field>

								<Field orientation="vertical">
									<FieldLabel htmlFor={passwordId}>Password</FieldLabel>
									{errors.password && <FieldError>{errors.password}</FieldError>}
									<Input
										id={passwordId}
										type="password"
										placeholder="Enter password"
										value={formData.password}
										onChange={(e) => handleChange("password", e.target.value)}
										required
										disabled={createVendorMutation.isPending}
									/>
								</Field>

								<Field orientation="vertical">
									<FieldLabel htmlFor={confirmPasswordId}>Confirm Password</FieldLabel>
									{errors.confirmPassword && <FieldError>{errors.confirmPassword}</FieldError>}
									<Input
										id={confirmPasswordId}
										type="password"
										placeholder="Confirm password"
										value={formData.confirmPassword}
										onChange={(e) => handleChange("confirmPassword", e.target.value)}
										required
										disabled={createVendorMutation.isPending}
									/>
								</Field>
							</div>


							{/* RIGHT COLUMN - Profile Information */}
							<div className="space-y-4">
								<div className="flex items-center gap-2 border-b pb-2">
									<Building2 className="size-5 text-primary" />
									<h3 className="font-semibold text-lg">Profile Information</h3>
								</div>

								<div className={`grid gap-4 ${formData.category === "Others" ? "grid-cols-2" : "grid-cols-1"}`}>
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
											disabled={createVendorMutation.isPending}
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
											<FieldLabel htmlFor={`${categoryId}-custom`}>Custom Category</FieldLabel>
											<Input
												id={`${categoryId}-custom`}
												placeholder="Enter custom category"
												value={formData.customCategory}
												onChange={(e) => handleChange("customCategory", e.target.value)}
												disabled={createVendorMutation.isPending}
											/>
										</Field>
									)}
								</div>

								<Field orientation="vertical">
									<FieldLabel htmlFor={personInChargeId}>Person in Charge</FieldLabel>
									<Input
										id={personInChargeId}
										placeholder="Contact person name"
										value={formData.person_in_charge}
										onChange={(e) => handleChange("person_in_charge", e.target.value)}
										disabled={createVendorMutation.isPending}
									/>
								</Field>

								<Field orientation="vertical">
									<FieldLabel>Vendor Image</FieldLabel>
									<ImageUpload
										value={image ?? undefined}
										onChange={handleImageChange}
										disabled={createVendorMutation.isPending}
									/>
								</Field>

								<Field orientation="vertical">
									<FieldLabel htmlFor={descriptionId}>Description</FieldLabel>
									<Textarea
										id={descriptionId}
										placeholder="Vendor description"
										value={formData.description}
										onChange={(e) => handleChange("description", e.target.value)}
										disabled={createVendorMutation.isPending}
										rows={3}
									/>
								</Field>

								<Field orientation="vertical">
									<FieldLabel htmlFor={addressId}>Address</FieldLabel>
									<Textarea
										id={addressId}
										placeholder="Business address"
										value={formData.address}
										onChange={(e) => handleChange("address", e.target.value)}
										disabled={createVendorMutation.isPending}
										rows={2}
									/>
								</Field>

								<Field orientation="vertical">
									<FieldLabel htmlFor={notesId}>Notes</FieldLabel>
									<Textarea
										id={notesId}
										placeholder="Additional notes"
										value={formData.notes}
										onChange={(e) => handleChange("notes", e.target.value)}
										disabled={createVendorMutation.isPending}
										rows={2}
									/>
								</Field>
							</div>
						</div>

						<FieldSeparator />

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
								{createVendorMutation.isPending ? "Creating..." : "Create Vendor"}
							</Button>
						</div>
					</FieldGroup>
				</FieldSet>
			</form>
		</div>
	);
}
