"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
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

	const [formData, setFormData] = useState({
		full_name: vendor.full_name,
		email: vendor.email,
		phone: vendor.phone || "",
		newPassword: "",
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
		<div className="w-full">
			<form onSubmit={handleSubmit}>
				<FieldSet>
					<FieldSeparator />
					<FieldGroup>
						{/* Name - Full Width */}
						<Field orientation="vertical">
							<FieldLabel htmlFor={nameId}>Name</FieldLabel>
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

						<FieldSeparator />

						{/* Email and Phone - Two Columns */}
						<div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
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

							<Field orientation="vertical">
								<FieldLabel htmlFor={phoneId}>Phone (Optional)</FieldLabel>
								<Input
									id={phoneId}
									type="tel"
									placeholder="+1234567890"
									value={formData.phone}
									onChange={(e) => handleChange("phone", e.target.value)}
									disabled={updateVendorMutation.isPending}
								/>
							</Field>
						</div>

						<FieldSeparator />

						{/* New Password - Full Width */}
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
