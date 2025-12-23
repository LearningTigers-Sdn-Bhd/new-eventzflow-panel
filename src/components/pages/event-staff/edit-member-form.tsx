"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
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
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from "@/components/ui/select";
import { updateTeamMember } from "@/lib/api/team";
import type { EventStaffMember } from "@/lib/api/event/event-staff";

interface EditMemberFormProps {
	member: EventStaffMember;
	onClose: () => void;
}

export default function EditMemberForm({
	member,
	onClose,
}: EditMemberFormProps) {
	const nameId = useId();
	const emailId = useId();
	const phoneId = useId();
	const roleId = useId();
	const passwordId = useId();

	const [formData, setFormData] = useState({
		full_name: member.full_name,
		email: member.email,
		phone: member.phone || "",
		role: member.eventRole,
		newPassword: "",
	});

	const [errors, setErrors] = useState<Record<string, string>>({});

	const queryClient = useQueryClient();
	const updateMemberMutation = useMutation({
		mutationFn: updateTeamMember,
		onSuccess: () => {
			toast.success("Team member updated successfully!");
			// Invalidate and refetch team members query
			queryClient.invalidateQueries({
				queryKey: ["team", "members"],
			});
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
				role: formData.role as "org_owner" | "organizer" | "member",
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
								disabled={updateMemberMutation.isPending}
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
									disabled={updateMemberMutation.isPending}
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
									disabled={updateMemberMutation.isPending}
								/>
							</Field>
						</div>

						<FieldSeparator />

						{/* Role - Full Width */}
						<Field orientation="vertical">
							<FieldLabel htmlFor={roleId}>Role</FieldLabel>
							<Select
								value={formData.role}
								onValueChange={(value) => handleChange("role", value)}
								disabled={
									updateMemberMutation.isPending ||
									member.globalRole === "org_owner"
								}
							>
								<SelectTrigger id={roleId}>
									<SelectValue placeholder="Select role" />
								</SelectTrigger>
								<SelectContent>
									<SelectItem
										value="org_owner"
										disabled={member.globalRole !== "org_owner"}
									>
										Owner
									</SelectItem>
									<SelectItem value="organizer">Organizer</SelectItem>
									<SelectItem value="member">Member</SelectItem>
								</SelectContent>
							</Select>
							<FieldDescription>
								{member.globalRole === "org_owner"
									? "Owner role cannot be changed"
									: "Members have basic access. Organizers can manage events."}
							</FieldDescription>
						</Field>

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
								disabled={updateMemberMutation.isPending}
							/>
						</Field>

						<FieldSeparator />

						{/* Buttons - Right Aligned */}
						<div className="flex justify-end gap-2">
							<Button
								type="button"
								variant="outline"
								onClick={onClose}
								disabled={updateMemberMutation.isPending}
							>
								Cancel
							</Button>
							<Button type="submit" disabled={updateMemberMutation.isPending}>
								{updateMemberMutation.isPending ? "Saving..." : "Save Changes"}
							</Button>
						</div>
					</FieldGroup>
				</FieldSet>
			</form>
		</div>
	);
}
