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

interface ContractorEditProfileContentProps {
	contractor: ExhibitionContractor;
}

export function ContractorEditProfileContent({
	contractor,
}: ContractorEditProfileContentProps) {
	const { closeDialog } = useDialog();
	const queryClient = useQueryClient();

	const profile = contractor.exhibition_contractor_profile;

	// User fields
	const [fullName, setFullName] = useState(contractor.full_name ?? "");
	const [phone, setPhone] = useState(contractor.phone ?? "");

	// Profile fields
	const [contactPerson, setContactPerson] = useState(
		profile?.contact_person ?? "",
	);
	const [contactEmail, setContactEmail] = useState(
		profile?.contact_email ?? "",
	);
	const [contactPhone, setContactPhone] = useState(
		profile?.contact_phone ?? "",
	);

	const [errors, setErrors] = useState<Record<string, string>>({});

	const updateMutation = useMutation({
		mutationFn: (data: Parameters<typeof updateContractor>[1]) =>
			updateContractor(contractor.id, data),
		onSuccess: () => {
			queryClient.invalidateQueries({
				queryKey: ["contractor", contractor.id],
			});
			toast.success("Profile updated successfully");
			closeDialog();
		},
		onError: (error: Error) => {
			toast.error("Failed to update profile", {
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

		// Optional field validations (only validate format if provided)
		if (
			contactEmail.trim() &&
			!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(contactEmail)
		) {
			newErrors.contact_email = "Must be a valid email address";
		}

		setErrors(newErrors);
		return Object.keys(newErrors).length === 0;
	};

	const handleSubmit = (e: React.FormEvent) => {
		e.preventDefault();
		if (!validate()) return;

		updateMutation.mutate({
			full_name: fullName.trim(),
			email: contractor.email, // Keep existing email
			phone: phone.trim() || undefined,
			exhibition_contractor_profile_attributes: {
				contact_person: contactPerson.trim() || undefined,
				contact_email: contactEmail.trim() || undefined,
				contact_phone: contactPhone.trim() || undefined,
			},
		});
	};

	return (
		<form onSubmit={handleSubmit} className="space-y-4">
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
						<p className="text-destructive text-sm">{errors.contact_person}</p>
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
					Save Changes
				</Button>
			</div>
		</form>
	);
}
