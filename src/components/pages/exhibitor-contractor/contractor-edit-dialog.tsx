"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Loader2 } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useDialog } from "@/hooks/use-dialog";
import {
	type ExhibitionContractor,
	updateContractor,
} from "@/lib/api/contractor";

interface ContractorEditContentProps {
	contractor: ExhibitionContractor;
}

export function ContractorEditContent({
	contractor,
}: ContractorEditContentProps) {
	const { closeDialog } = useDialog();
	const queryClient = useQueryClient();

	// User fields
	const [fullName, setFullName] = useState(contractor.full_name ?? "");
	const [email, setEmail] = useState(contractor.email ?? "");
	const [phone, setPhone] = useState(contractor.phone ?? "");
	const [newPassword, setNewPassword] = useState("");

	// Profile fields
	const [contactPerson, setContactPerson] = useState(
		contractor.exhibition_contractor_profile?.contact_person ?? "",
	);
	const [contactEmail, setContactEmail] = useState(
		contractor.exhibition_contractor_profile?.contact_email ?? "",
	);
	const [contactPhone, setContactPhone] = useState(
		contractor.exhibition_contractor_profile?.contact_phone ?? "",
	);

	const [errors, setErrors] = useState<Record<string, string>>({});

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

	const validate = () => {
		const newErrors: Record<string, string> = {};

		if (!fullName.trim()) {
			newErrors.full_name = "Full name is required";
		}
		if (!email.trim()) {
			newErrors.email = "Email is required";
		} else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
			newErrors.email = "Must be a valid email address";
		}
		// Password validation (optional for edit)
		if (newPassword && newPassword.length < 6) {
			newErrors.password = "Password must be at least 6 characters";
		}
		// Optional field validations (only validate format if provided)
		if (contactEmail.trim() && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(contactEmail)) {
			newErrors.contact_email = "Must be a valid email address";
		}

		setErrors(newErrors);
		return Object.keys(newErrors).length === 0;
	};

	const handleSubmit = (e: React.FormEvent) => {
		e.preventDefault();
		if (!validate()) return;

		const updateData: Parameters<typeof updateContractor>[1] = {
			full_name: fullName.trim(),
			email: email.trim(),
			phone: phone.trim(),
			exhibition_contractor_profile_attributes: {
				contact_person: contactPerson.trim(),
				contact_email: contactEmail.trim(),
				contact_phone: contactPhone.trim(),
			},
		};

		// Only include password if provided
		if (newPassword) {
			updateData.password = newPassword;
			updateData.password_confirmation = newPassword;
		}

		updateMutation.mutate(updateData);
	};

	return (
		<form onSubmit={handleSubmit} className="space-y-4">
			<div className="grid grid-cols-1 gap-6 md:grid-cols-2">
				{/* Left Column - Account Details */}
				<div className="space-y-4">
					<h4 className="border-b pb-2 font-medium text-muted-foreground text-sm">
						Account Details
					</h4>

					<div className="space-y-2">
						<Label htmlFor="full_name">Full Name</Label>
						<Input
							id="full_name"
							value={fullName}
							onChange={(e) => setFullName(e.target.value)}
							placeholder="Enter full name"
							disabled={isPending}
						/>
						{errors.full_name && (
							<p className="text-destructive text-sm">{errors.full_name}</p>
						)}
					</div>

					<div className="space-y-2">
						<Label htmlFor="email">Email</Label>
						<Input
							id="email"
							type="email"
							value={email}
							onChange={(e) => setEmail(e.target.value)}
							placeholder="Enter email address"
							disabled={isPending}
						/>
						{errors.email && (
							<p className="text-destructive text-sm">{errors.email}</p>
						)}
					</div>

					<div className="space-y-2">
						<Label htmlFor="phone">Phone</Label>
						<Input
							id="phone"
							value={phone}
							onChange={(e) => setPhone(e.target.value)}
							placeholder="Enter phone number"
							disabled={isPending}
						/>
						{errors.phone && (
							<p className="text-destructive text-sm">{errors.phone}</p>
						)}
					</div>

					<div className="space-y-2">
						<Label htmlFor="new_password">New Password (optional)</Label>
						<Input
							id="new_password"
							type="password"
							value={newPassword}
							onChange={(e) => setNewPassword(e.target.value)}
							placeholder="Leave blank to keep current password"
							disabled={isPending}
						/>
						{errors.password && (
							<p className="text-destructive text-sm">{errors.password}</p>
						)}
					</div>
				</div>

				{/* Right Column - Contact Details */}
				<div className="space-y-4">
					<h4 className="border-b pb-2 font-medium text-muted-foreground text-sm">
						Contact Details
					</h4>

					<div className="space-y-2">
						<Label htmlFor="contact_person">Contact Person</Label>
						<Input
							id="contact_person"
							value={contactPerson}
							onChange={(e) => setContactPerson(e.target.value)}
							placeholder="Enter contact person name"
							disabled={isPending}
						/>
						{errors.contact_person && (
							<p className="text-destructive text-sm">
								{errors.contact_person}
							</p>
						)}
					</div>

					<div className="space-y-2">
						<Label htmlFor="contact_email">Contact Email</Label>
						<Input
							id="contact_email"
							type="email"
							value={contactEmail}
							onChange={(e) => setContactEmail(e.target.value)}
							placeholder="Enter contact email"
							disabled={isPending}
						/>
						{errors.contact_email && (
							<p className="text-destructive text-sm">{errors.contact_email}</p>
						)}
					</div>

					<div className="space-y-2">
						<Label htmlFor="contact_phone">Contact Phone</Label>
						<Input
							id="contact_phone"
							value={contactPhone}
							onChange={(e) => setContactPhone(e.target.value)}
							placeholder="Enter contact phone"
							disabled={isPending}
						/>
						{errors.contact_phone && (
							<p className="text-destructive text-sm">{errors.contact_phone}</p>
						)}
					</div>
				</div>
			</div>

			<div className="flex justify-end gap-2 border-t pt-4">
				<Button
					type="button"
					variant="outline"
					onClick={closeDialog}
					disabled={isPending}
				>
					Cancel
				</Button>
				<Button type="submit" disabled={isPending}>
					{isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
					Update
				</Button>
			</div>
		</form>
	);
}
