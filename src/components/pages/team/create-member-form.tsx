"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Eye, EyeOff, User } from "lucide-react";
import { useId, useState } from "react";
import { toast } from "sonner";
import { FormGroupContainer } from "@/components/admin-ui/form/form-group-container";
import { InputActionLabel } from "@/components/admin-ui/form/input-action-label";
import { InputLabel } from "@/components/admin-ui/form/input-label";
import { SelectLabel } from "@/components/admin-ui/form/select-label";
import { Button } from "@/components/ui/button";
import { FieldGroup, FieldSet } from "@/components/ui/field";
import { useAuth } from "@/hooks/use-auth";
import { createTeamMember } from "@/lib/api/team";

interface CreateMemberFormProps {
	onClose: () => void;
}

export default function CreateMemberForm({ onClose }: CreateMemberFormProps) {
	const { user } = useAuth();
	const nameId = useId();
	const emailId = useId();
	const phoneId = useId();
	const passwordId = useId();
	const confirmPasswordId = useId();
	const roleId = useId();

	const [formData, setFormData] = useState({
		full_name: "",
		email: "",
		phone: "",
		password: "",
		confirmPassword: "",
		role: "member" as "member" | "organizer",
	});

	const [showPassword, setShowPassword] = useState(false);
	const [showConfirmPassword, setShowConfirmPassword] = useState(false);

	const [errors, setErrors] = useState<Record<string, string>>({});

	const queryClient = useQueryClient();
	const createMemberMutation = useMutation({
		mutationFn: createTeamMember,
		onSuccess: () => {
			toast.success("Team member created successfully!");
			// Invalidate and refetch team members query
			queryClient.invalidateQueries({ queryKey: ["team", "members"] });
			onClose();
		},
		onError: (error: Error) => {
			toast.error(error.message || "Failed to create team member");
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
			await createMemberMutation.mutateAsync({
				full_name: formData.full_name,
				email: formData.email,
				phone: formData.phone || undefined,
				password: formData.password,
				role: formData.role,
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
		<div className="w-full px-0 pt-0 md:px-4 md:pt-4">
			<form
				onSubmit={handleSubmit}
				className="flex flex-col justify-between gap-4 md:gap-8 md:pb-4"
			>
				<FieldSet>
					<FormGroupContainer
						title={{
							icon: User,
							label: "Account Information",
							description:
								"Enter the details to create a new account for the member",
						}}
					>
						{/* Name - Full Width */}
						<InputLabel
							htmlFor={nameId}
							label="Name"
							description="Enter the full name of the member"
							placeholder="John Doe"
							value={formData.full_name}
							onChange={(value) => handleChange("full_name", value)}
							required
							disabled={createMemberMutation.isPending}
							variant="no-rounded"
							isInvalid={!!errors.full_name}
							errors={
								errors.full_name ? [{ message: errors.full_name }] : undefined
							}
						/>

						{/* Email and Phone - Two Columns */}
						<div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
							<InputLabel
								htmlFor={emailId}
								label="Email"
								description="Email address for login and notifications"
								type="input"
								placeholder="john.doe@example.com"
								value={formData.email}
								onChange={(value) => handleChange("email", value)}
								required
								disabled={createMemberMutation.isPending}
								variant="no-rounded"
								isInvalid={!!errors.email}
								errors={errors.email ? [{ message: errors.email }] : undefined}
							/>

							<InputLabel
								htmlFor={phoneId}
								label="Phone (Optional)"
								description="Contact number for the member"
								type="input"
								placeholder="+1234567890"
								value={formData.phone}
								onChange={(value) => handleChange("phone", value)}
								disabled={createMemberMutation.isPending}
								variant="no-rounded"
							/>
						</div>

						{/* Password and Confirm Password - Two Columns */}
						<div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
							<InputActionLabel
								htmlFor={passwordId}
								label="Password"
								description="At least 8 characters"
								type={showPassword ? "text" : "password"}
								placeholder="Enter password"
								value={formData.password}
								onChange={(value) => handleChange("password", value)}
								required
								disabled={createMemberMutation.isPending}
								variant="no-rounded"
								isInvalid={!!errors.password}
								errors={
									errors.password ? [{ message: errors.password }] : undefined
								}
								onAction={() => setShowPassword(!showPassword)}
								actionIcon={showPassword ? <EyeOff /> : <Eye />}
								actionLabel={showPassword ? "Hide password" : "Show password"}
							/>

							<InputActionLabel
								htmlFor={confirmPasswordId}
								label="Confirm Password"
								description="Re-enter your password"
								type={showConfirmPassword ? "text" : "password"}
								placeholder="Confirm password"
								value={formData.confirmPassword}
								onChange={(value) => handleChange("confirmPassword", value)}
								required
								disabled={createMemberMutation.isPending}
								variant="no-rounded"
								isInvalid={!!errors.confirmPassword}
								errors={
									errors.confirmPassword
										? [{ message: errors.confirmPassword }]
										: undefined
								}
								onAction={() => setShowConfirmPassword(!showConfirmPassword)}
								actionIcon={showConfirmPassword ? <EyeOff /> : <Eye />}
								actionLabel={
									showConfirmPassword ? "Hide password" : "Show password"
								}
							/>
						</div>
					</FormGroupContainer>

					{/* Role - Only visible for org_owner */}
					{user?.role === "org_owner" && (
						<FormGroupContainer
							title={{
								icon: User,
								label: "Member's Role",
								description:
									"Assign the role to the member for your organization.",
							}}
						>
							<SelectLabel
								htmlFor={roleId}
								label="Role"
								value={formData.role}
								onChange={(value) => handleChange("role", value)}
								options={[
									{ value: "member", label: "Member" },
									{ value: "organizer", label: "Organizer" },
								]}
								disabled={createMemberMutation.isPending}
								variant="no-rounded"
							/>
						</FormGroupContainer>
					)}
				</FieldSet>
				{/* Buttons - Right Aligned */}
				<FieldGroup className="flex flex-col gap-2 md:flex-row md:justify-end">
					<Button
						type="button"
						variant="outline"
						onClick={onClose}
						disabled={createMemberMutation.isPending}
						className="rounded-none py-6 md:py-2"
					>
						Cancel
					</Button>
					<Button
						type="submit"
						disabled={createMemberMutation.isPending}
						className="rounded-none py-6 md:py-2"
					>
						{createMemberMutation.isPending ? "Creating..." : "Create Member"}
					</Button>
				</FieldGroup>
			</form>
		</div>
	);
}
