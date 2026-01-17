"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Eye, EyeOff, Phone, Settings, User } from "lucide-react";
import { useId, useState } from "react";
import { toast } from "sonner";
import { FormGroupContainer } from "@/components/admin-ui/form/form-group-container";
import { InputActionLabel } from "@/components/admin-ui/form/input-action-label";
import { InputLabel } from "@/components/admin-ui/form/input-label";
import { SelectLabel } from "@/components/admin-ui/form/select-label";
import { SwitchCardInput } from "@/components/admin-ui/form/switch-card-input";
import { Button } from "@/components/ui/button";
import { FieldGroup, FieldSet } from "@/components/ui/field";
import { useAuth } from "@/hooks/auth/use-auth";
import { useDialog } from "@/hooks/use-dialog";
import {
	type ExhibitionContractor,
	updateContractor,
} from "@/lib/api/contractor";
import { getTeamMembers } from "@/lib/api/team";

interface ContractorEditContentProps {
	contractor: ExhibitionContractor;
}

export function ContractorEditContent({
	contractor,
}: ContractorEditContentProps) {
	const { closeDialog } = useDialog();
	const queryClient = useQueryClient();
	const { user } = useAuth();
	const isOrgOwner = user?.role === "org_owner";

	// Form IDs
	const fullNameId = useId();
	const emailId = useId();
	const phoneId = useId();
	const passwordId = useId();
	const contactPersonId = useId();
	const contactEmailId = useId();
	const contactPhoneId = useId();
	const createdBySelectId = useId();

	// Form state
	const [formData, setFormData] = useState({
		full_name: contractor.full_name ?? "",
		email: contractor.email ?? "",
		phone: contractor.phone ?? "",
		new_password: "",
		contact_person: contractor.exhibition_contractor_profile?.contact_person ?? "",
		contact_email: contractor.exhibition_contractor_profile?.contact_email ?? "",
		contact_phone: contractor.exhibition_contractor_profile?.contact_phone ?? "",
		allow_printing_services: contractor.exhibition_contractor_profile?.allow_printing_services ?? true,
		created_by_id: contractor.created_by_id?.toString() ?? "",
	});

	const [showPassword, setShowPassword] = useState(false);
	const [errors, setErrors] = useState<Record<string, string>>({});

	// Fetch team members for org_owner
	const { data: teamMembers = [], isLoading: isLoadingOrganizers } = useQuery({
		queryKey: ["team_members"],
		queryFn: () => getTeamMembers(),
		enabled: isOrgOwner,
	});

	// Filter to only show org_owner and organizer roles
	const organizerOptions = [
		...(user && !teamMembers.some((m) => m.id === user.id?.toString())
			? [{ value: user.id?.toString() ?? "", label: `${user.full_name} (${user.role})` }]
			: []),
		...teamMembers
			.filter((member) => member.role === "org_owner" || member.role === "organizer")
			.map((member) => ({
				value: member.id,
				label: `${member.full_name} (${member.role})`,
			})),
	];

	const updateMutation = useMutation({
		mutationFn: (data: Parameters<typeof updateContractor>[1]) =>
			updateContractor(contractor.id, data),
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: ["contractors"] });
			toast.success("Contractor updated successfully");
			closeDialog();
		},
		onError: (error: Error) => {
			toast.error("Failed to update contractor", {
				description: error.message,
			});
		},
	});

	const isPending = updateMutation.isPending;

	const handleChange = (field: string, value: string | boolean) => {
		setFormData((prev) => ({ ...prev, [field]: value }));
		if (errors[field]) {
			setErrors((prev) => {
				const newErrors = { ...prev };
				delete newErrors[field];
				return newErrors;
			});
		}
	};

	const validate = () => {
		const newErrors: Record<string, string> = {};

		if (!formData.full_name.trim()) {
			newErrors.full_name = "Full name is required";
		}
		if (!formData.email.trim()) {
			newErrors.email = "Email is required";
		} else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
			newErrors.email = "Must be a valid email address";
		}
		if (formData.new_password && formData.new_password.length < 6) {
			newErrors.new_password = "Password must be at least 6 characters";
		}
		if (formData.contact_email.trim() && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.contact_email)) {
			newErrors.contact_email = "Must be a valid email address";
		}

		setErrors(newErrors);
		return Object.keys(newErrors).length === 0;
	};

	const handleSubmit = (e: React.FormEvent) => {
		e.preventDefault();
		if (!validate()) return;

		const updateData: Parameters<typeof updateContractor>[1] = {
			full_name: formData.full_name.trim(),
			email: formData.email.trim(),
			phone: formData.phone.trim(),
			exhibition_contractor_profile_attributes: {
				contact_person: formData.contact_person.trim(),
				contact_email: formData.contact_email.trim(),
				contact_phone: formData.contact_phone.trim(),
				allow_printing_services: formData.allow_printing_services,
			},
		};

		if (formData.new_password) {
			updateData.password = formData.new_password;
			updateData.password_confirmation = formData.new_password;
		}

		if (isOrgOwner && formData.created_by_id) {
			updateData.created_by_id = Number.parseInt(formData.created_by_id, 10);
		}

		updateMutation.mutate(updateData);
	};

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
							description: "Login credentials for the contractor",
						}}
					>
						<div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
							<InputLabel
								htmlFor={fullNameId}
								label="Full Name"
								placeholder="Enter contractor's full name"
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
								label="Email"
								placeholder="contractor@example.com"
								value={formData.email}
								onChange={(value) => handleChange("email", value)}
								required
								disabled={isPending}
								variant="no-rounded"
								isInvalid={!!errors.email}
								errors={errors.email ? [{ message: errors.email }] : undefined}
							/>
							<InputLabel
								htmlFor={phoneId}
								label="Phone (Optional)"
								placeholder="+60123456789"
								value={formData.phone}
								onChange={(value) => handleChange("phone", value)}
								disabled={isPending}
								variant="no-rounded"
							/>
						</div>

						<div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
							<InputActionLabel
								htmlFor={passwordId}
								label="New Password (Optional)"
								description="Leave blank to keep current password"
								type={showPassword ? "text" : "password"}
								placeholder="Enter new password"
								value={formData.new_password}
								onChange={(value) => handleChange("new_password", value)}
								disabled={isPending}
								variant="no-rounded"
								isInvalid={!!errors.new_password}
								errors={errors.new_password ? [{ message: errors.new_password }] : undefined}
								onAction={() => setShowPassword(!showPassword)}
								actionIcon={showPassword ? <EyeOff /> : <Eye />}
								actionLabel={showPassword ? "Hide password" : "Show password"}
							/>
						</div>
					</FormGroupContainer>

					{/* Contact Information */}
					<FormGroupContainer
						title={{
							icon: Phone,
							label: "Contact Information",
							description: "Business contact details for the contractor",
						}}
					>
						<div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
							<InputLabel
								htmlFor={contactPersonId}
								label="Contact Person (Optional)"
								placeholder="Enter contact person name"
								value={formData.contact_person}
								onChange={(value) => handleChange("contact_person", value)}
								disabled={isPending}
								variant="no-rounded"
							/>
							<InputLabel
								htmlFor={contactEmailId}
								label="Contact Email (Optional)"
								placeholder="contact@example.com"
								value={formData.contact_email}
								onChange={(value) => handleChange("contact_email", value)}
								disabled={isPending}
								variant="no-rounded"
								isInvalid={!!errors.contact_email}
								errors={errors.contact_email ? [{ message: errors.contact_email }] : undefined}
							/>
							<InputLabel
								htmlFor={contactPhoneId}
								label="Contact Phone (Optional)"
								placeholder="+60123456789"
								value={formData.contact_phone}
								onChange={(value) => handleChange("contact_phone", value)}
								disabled={isPending}
								variant="no-rounded"
							/>
						</div>
					</FormGroupContainer>

					{/* Settings - Org Owner Only */}
					{isOrgOwner && (
						<FormGroupContainer
							title={{
								icon: Settings,
								label: "Settings",
								description: "Permissions and assignment options",
							}}
						>
							<div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
								<SwitchCardInput
									label="Printing Services"
									description="Allow contractor to access printing services"
									checked={formData.allow_printing_services}
									onCheckedChange={(checked) => handleChange("allow_printing_services", checked)}
									disabled={isPending}
									variant="no-rounded"
								/>

								<div className="flex h-full flex-col justify-between rounded-none border p-4">
									<SelectLabel
										htmlFor={createdBySelectId}
										label="Assigned To"
										description="Assign this contractor to an organizer"
										placeholder="Select organizer"
										value={formData.created_by_id}
										onChange={(value) => handleChange("created_by_id", value)}
										options={organizerOptions}
										disabled={isPending}
										variant="no-rounded"
									/>
								</div>
							</div>
						</FormGroupContainer>
					)}
				</FieldSet>

				{/* Action Buttons */}
				<FieldGroup className="flex flex-col gap-2 md:flex-row md:justify-end">
					<Button
						type="button"
						variant="outline"
						onClick={closeDialog}
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
						{isPending ? "Updating..." : "Update Contractor"}
					</Button>
				</FieldGroup>
			</form>
		</div>
	);
}
