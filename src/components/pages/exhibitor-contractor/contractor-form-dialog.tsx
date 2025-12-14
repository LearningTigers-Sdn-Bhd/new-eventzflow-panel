"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Loader2 } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useDialog } from "@/hooks/use-dialog";
import { createContractor } from "@/lib/api/contractor";

export function ContractorFormContent() {
	const { closeDialog } = useDialog();
	const queryClient = useQueryClient();

	// User fields
	const [fullName, setFullName] = useState("");
	const [email, setEmail] = useState("");
	const [phone, setPhone] = useState("");
	const [password, setPassword] = useState("");
	const [passwordConfirmation, setPasswordConfirmation] = useState("");

	// Profile fields
	const [companyName, setCompanyName] = useState("");
	const [contactPerson, setContactPerson] = useState("");
	const [contactEmail, setContactEmail] = useState("");
	const [contactPhone, setContactPhone] = useState("");

	const [errors, setErrors] = useState<Record<string, string>>({});

	const createMutation = useMutation({
		mutationFn: createContractor,
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: ["contractors"] });
			toast.success("Contractor created successfully");
			closeDialog();
		},
		onError: (error: Error) => {
			toast.error("Failed to create contractor", {
				description: error.message,
			});
		},
	});

	const isPending = createMutation.isPending;

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
		if (!phone.trim()) {
			newErrors.phone = "Phone is required";
		}
		if (!password) {
			newErrors.password = "Password is required";
		} else if (password.length < 6) {
			newErrors.password = "Password must be at least 6 characters";
		}
		if (!passwordConfirmation) {
			newErrors.password_confirmation = "Password confirmation is required";
		} else if (password !== passwordConfirmation) {
			newErrors.password_confirmation = "Passwords don't match";
		}
		if (!companyName.trim()) {
			newErrors.company_name = "Company name is required";
		}
		if (!contactPerson.trim()) {
			newErrors.contact_person = "Contact person is required";
		}
		if (!contactEmail.trim()) {
			newErrors.contact_email = "Contact email is required";
		} else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(contactEmail)) {
			newErrors.contact_email = "Must be a valid email address";
		}
		if (!contactPhone.trim()) {
			newErrors.contact_phone = "Contact phone is required";
		}

		setErrors(newErrors);
		return Object.keys(newErrors).length === 0;
	};

	const handleSubmit = (e: React.FormEvent) => {
		e.preventDefault();
		if (!validate()) return;

		createMutation.mutate({
			full_name: fullName.trim(),
			email: email.trim(),
			phone: phone.trim(),
			password,
			password_confirmation: passwordConfirmation,
			exhibition_contractor_profile_attributes: {
				company_name: companyName.trim(),
				contact_person: contactPerson.trim(),
				contact_email: contactEmail.trim(),
				contact_phone: contactPhone.trim(),
			},
		});
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

					<div className="grid grid-cols-2 gap-4">
						<div className="space-y-2">
							<Label htmlFor="password">Password</Label>
							<Input
								id="password"
								type="password"
								value={password}
								onChange={(e) => setPassword(e.target.value)}
								placeholder="Enter password"
								disabled={isPending}
							/>
							{errors.password && (
								<p className="text-destructive text-sm">{errors.password}</p>
							)}
						</div>

						<div className="space-y-2">
							<Label htmlFor="password_confirmation">Confirm Password</Label>
							<Input
								id="password_confirmation"
								type="password"
								value={passwordConfirmation}
								onChange={(e) => setPasswordConfirmation(e.target.value)}
								placeholder="Confirm password"
								disabled={isPending}
							/>
							{errors.password_confirmation && (
								<p className="text-destructive text-sm">
									{errors.password_confirmation}
								</p>
							)}
						</div>
					</div>
				</div>

				{/* Right Column - Company Profile */}
				<div className="space-y-4">
					<h4 className="border-b pb-2 font-medium text-muted-foreground text-sm">
						Company Profile
					</h4>

					<div className="space-y-2">
						<Label htmlFor="company_name">
							Company Name <span className="text-destructive">*</span>
						</Label>
						<Input
							id="company_name"
							value={companyName}
							onChange={(e) => setCompanyName(e.target.value)}
							placeholder="Enter company name"
							disabled={isPending}
						/>
						{errors.company_name && (
							<p className="text-destructive text-sm">{errors.company_name}</p>
						)}
					</div>

					<div className="space-y-2">
						<Label htmlFor="contact_person">
							Contact Person <span className="text-destructive">*</span>
						</Label>
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
						<Label htmlFor="contact_email">
							Contact Email <span className="text-destructive">*</span>
						</Label>
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
						<Label htmlFor="contact_phone">
							Contact Phone <span className="text-destructive">*</span>
						</Label>
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
					Create
				</Button>
			</div>
		</form>
	);
}
