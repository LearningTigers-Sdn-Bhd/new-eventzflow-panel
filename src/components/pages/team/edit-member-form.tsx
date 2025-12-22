"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Eye, EyeOff, Lock, Shield, User } from "lucide-react";
import { useId, useState } from "react";
import { toast } from "sonner";
import { FormGroupContainer } from "@/components/admin-ui/form/form-group-container";
import { InputActionLabel } from "@/components/admin-ui/form/input-action-label";
import { InputLabel } from "@/components/admin-ui/form/input-label";
import { SelectLabel } from "@/components/admin-ui/form/select-label";
import { SwitchCardInput } from "@/components/admin-ui/form/switch-card-input";
import { Button } from "@/components/ui/button";
import { FieldGroup, FieldSet } from "@/components/ui/field";
import { useAuth } from "@/hooks/use-auth";
import { updateTeamMember } from "@/lib/api/team";
import type { TeamMember } from "./team-member-table-columns";

interface EditMemberFormProps {
	member: TeamMember;
	onClose: () => void;
}

export default function EditMemberForm({
	member,
	onClose,
}: EditMemberFormProps) {
	const { user } = useAuth();
	const nameId = useId();
	const emailId = useId();
	const phoneId = useId();
	const passwordId = useId();
	const roleId = useId();
	const verifyId = useId();

	const [formData, setFormData] = useState({
		full_name: member.full_name,
		email: member.email,
		phone: member.phone || "",
		newPassword: "",
		role: member.role,
		emailVerifiedAt: member.emailVerifiedAt,
	});

	const [showPassword, setShowPassword] = useState(false);
	const [errors, setErrors] = useState<Record<string, string>>({});

	const isEmailVerified = !!formData.emailVerifiedAt;

	const queryClient = useQueryClient();
	const updateMemberMutation = useMutation({
		mutationFn: updateTeamMember,
		onSuccess: () => {
			toast.success("Team member updated successfully!");
			// Invalidate and refetch team members queries
			queryClient.invalidateQueries({ queryKey: ["team", "members"] });
			queryClient.invalidateQueries({ queryKey: ["organizer-members"] });
			onClose();
		},
		onError: (error: Error) => {
			toast.error(error.message || "Failed to update team member");
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
			await updateMemberMutation.mutateAsync({
				id: member.id,
				full_name: formData.full_name,
				email: formData.email,
				phone: formData.phone || undefined,
				role: formData.role,
				newPassword: formData.newPassword || undefined,
				email_verified_at: formData.emailVerifiedAt,
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
		<div className="h-full w-full px-4 pt-0 md:px-6">
			<form
				onSubmit={handleSubmit}
				className="flex h-full flex-col justify-between gap-4 md:gap-8 md:pb-4"
			>
				<FieldSet className="grid grid-cols-1 gap-4 md:grid-cols-2">
					<div className="flex flex-col gap-4">
						<FormGroupContainer
							title={{
								icon: User,
								label: "Account Information",
								description: "Update the member's personal details",
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
								disabled={updateMemberMutation.isPending}
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
									description="Email address for login"
									type="input"
									placeholder="john.doe@example.com"
									value={formData.email}
									onChange={(value) => handleChange("email", value)}
									required
									disabled={updateMemberMutation.isPending}
									variant="no-rounded"
									isInvalid={!!errors.email}
									errors={
										errors.email ? [{ message: errors.email }] : undefined
									}
								/>

								<InputLabel
									htmlFor={phoneId}
									label="Phone (Optional)"
									description="Contact number"
									type="input"
									placeholder="+1234567890"
									value={formData.phone}
									onChange={(value) => handleChange("phone", value)}
									disabled={updateMemberMutation.isPending}
									variant="no-rounded"
								/>
							</div>
						</FormGroupContainer>

						{/* Role and Verification - Only visible for org_owner */}
						{user?.role === "org_owner" && member.role !== "org_owner" && (
							<FormGroupContainer
								title={{
									icon: Shield,
									label: "Member's Role",
									description:
										"Assign the role to the member for your organization.",
								}}
							>
								<div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
									<SelectLabel
										htmlFor={roleId}
										label="Role"
										value={formData.role}
										onChange={(value) => handleChange("role", value)}
										options={[
											{ value: "member", label: "Member" },
											{ value: "organizer", label: "Organizer" },
										]}
										disabled={updateMemberMutation.isPending}
										variant="no-rounded"
									/>
								</div>
							</FormGroupContainer>
						)}
					</div>
					<FormGroupContainer
						title={{
							icon: Lock,
							label: "Security & Verification",
							description: "Manage password settings and email verification",
						}}
					>
						<div className="grid grid-cols-1 gap-4">
							<InputActionLabel
								htmlFor={passwordId}
								label="New Password"
								description="Leave blank to keep current"
								type={showPassword ? "text" : "password"}
								placeholder="Enter new password"
								value={formData.newPassword}
								onChange={(value) => handleChange("newPassword", value)}
								disabled={updateMemberMutation.isPending}
								variant="no-rounded"
								onAction={() => setShowPassword(!showPassword)}
								actionIcon={showPassword ? <EyeOff /> : <Eye />}
								actionLabel={showPassword ? "Hide password" : "Show password"}
							/>
							<div className="flex flex-col gap-4">
								<SwitchCardInput
									htmlFor={verifyId}
									label="Email Verification"
									description={isEmailVerified ? "Verified" : "Not Verified"}
									checked={isEmailVerified}
									onCheckedChange={(checked) =>
										setFormData((prev) => ({
											...prev,
											emailVerifiedAt: checked
												? new Date().toISOString()
												: null,
										}))
									}
									disabled={updateMemberMutation.isPending}
									variant="no-rounded"
									border={true}
									className="bg-background"
								/>
							</div>
						</div>
					</FormGroupContainer>
				</FieldSet>

				{/* Buttons - Right Aligned */}
				<FieldGroup className="flex flex-col gap-2 md:flex-row md:justify-end">
					<Button
						type="button"
						variant="outline"
						onClick={onClose}
						disabled={updateMemberMutation.isPending}
						className="rounded-none py-6 md:py-2"
					>
						Cancel
					</Button>
					<Button
						type="submit"
						disabled={updateMemberMutation.isPending}
						className="rounded-none py-6 md:py-2"
					>
						{updateMemberMutation.isPending ? "Saving..." : "Save Changes"}
					</Button>
				</FieldGroup>
			</form>
		</div>
	);
}
