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
import { createVendor } from "@/lib/api/vendor";

interface CreateVendorFormProps {
	onClose: () => void;
}

export default function CreateVendorForm({ onClose }: CreateVendorFormProps) {
	const nameId = useId();
	const emailId = useId();
	const phoneId = useId();
	const passwordId = useId();
	const confirmPasswordId = useId();

	const [formData, setFormData] = useState({
		full_name: "",
		email: "",
		phone: "",
		password: "",
		confirmPassword: "",
	});

	const [errors, setErrors] = useState<Record<string, string>>({});

	const queryClient = useQueryClient();
	const createVendorMutation = useMutation({
		mutationFn: createVendor,
		onSuccess: () => {
			toast.success("Vendor created successfully!");
			// Invalidate and refetch vendors query
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

		// Validation
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
			await createVendorMutation.mutateAsync({
				full_name: formData.full_name,
				email: formData.email,
				phone: formData.phone || undefined,
				password: formData.password,
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
							<FieldLabel htmlFor={nameId}>Full Name</FieldLabel>
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
						</div>

						<FieldSeparator />

						{/* Password and Confirm Password - Two Columns */}
						<div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
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
								<FieldLabel htmlFor={confirmPasswordId}>
									Confirm Password
								</FieldLabel>
								{errors.confirmPassword && (
									<FieldError>{errors.confirmPassword}</FieldError>
								)}
								<Input
									id={confirmPasswordId}
									type="password"
									placeholder="Confirm password"
									value={formData.confirmPassword}
									onChange={(e) =>
										handleChange("confirmPassword", e.target.value)
									}
									required
									disabled={createVendorMutation.isPending}
								/>
							</Field>
						</div>

						<FieldSeparator />

						{/* Buttons - Right Aligned */}
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
								{createVendorMutation.isPending
									? "Creating..."
									: "Create Vendor"}
							</Button>
						</div>
					</FieldGroup>
				</FieldSet>
			</form>
		</div>
	);
}
