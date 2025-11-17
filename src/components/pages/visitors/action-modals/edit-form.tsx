"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useParams } from "next/navigation";
import { useState, useId } from "react";
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
import { useDialog } from "@/hooks/use-dialog";
import { updateVisitor } from "@/lib/api/visitor";
import type { Visitor, UpdateVisitorRequest } from "@/lib/api/visitor";

interface EditVisitorFormProps {
	visitor: Visitor;
}

export default function EditVisitorForm({ visitor }: EditVisitorFormProps) {
	const { closeDialog } = useDialog();
	const params = useParams();
	const eventId = Number(params.event_id);
	const queryClient = useQueryClient();

	// Generate unique IDs for form fields
	const nameId = useId();
	const emailId = useId();
	const phoneId = useId();
	const genderId = useId();
	const ageId = useId();

	// Form state - Initialize with visitor data
	const [fullName, setFullName] = useState(visitor.full_name);
	const [email, setEmail] = useState(visitor.email || "");
	const [phone, setPhone] = useState(visitor.phone || "");
	const [gender, setGender] = useState<string>(visitor.gender || "");
	const [age, setAge] = useState<string>(visitor.age ? visitor.age.toString() : "");

	// Validation errors
	const [errors, setErrors] = useState<Record<string, string>>({});

	// Update visitor mutation
	const updateVisitorMutation = useMutation({
		mutationFn: (data: UpdateVisitorRequest) =>
			updateVisitor(eventId, visitor.id, data),
		onSuccess: () => {
			toast.success("Visitor updated successfully!");
			// Invalidate the visitors query to refetch the list
			queryClient.invalidateQueries({
				queryKey: ["event", eventId, "visitors"],
			});
			closeDialog();
		},
		onError: (error: Error) => {
			toast.error(error.message || "Failed to update visitor");
		},
	});

	// Handle form submission
	const handleSubmit = async (e: React.FormEvent) => {
		e.preventDefault();
		setErrors({});

		// Validation
		const newErrors: Record<string, string> = {};

		if (!fullName.trim() || fullName.length < 2) {
			newErrors.fullName = "Name must be at least 2 characters";
		}

		if (email.trim() && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
			newErrors.email = "Please enter a valid email address";
		}

		if (Object.keys(newErrors).length > 0) {
			setErrors(newErrors);
			return;
		}

		try {
			const visitorData: UpdateVisitorRequest = {
				full_name: fullName.trim(),
				email: email.trim() || undefined,
				phone: phone.trim() || undefined,
				gender: gender || undefined,
				age: age ? Number.parseInt(age, 10) : undefined,
			};
			await updateVisitorMutation.mutateAsync(visitorData);
		} catch (_error) {
			// Error is handled by onError callback
		}
	};

	const handleChange = (field: string, value: string) => {
		if (field === "fullName") setFullName(value);
		if (field === "email") setEmail(value);
		if (field === "phone") setPhone(value);
		if (field === "gender") setGender(value);
		if (field === "age") setAge(value);

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
						{/* Visitor Information Section */}
						<div className="space-y-4">
							<div>
								<h3 className="font-semibold text-lg">Visitor Information</h3>
								<p className="text-muted-foreground text-sm">
									Update the visitor details
								</p>
							</div>

							<div className="grid grid-cols-1 gap-4 md:grid-cols-2">
								{/* Full Name */}
								<Field orientation="vertical" className="md:col-span-2">
									<FieldLabel htmlFor={nameId}>Full Name *</FieldLabel>
									{errors.fullName && (
										<FieldError>{errors.fullName}</FieldError>
									)}
									<Input
										id={nameId}
										placeholder="John Doe"
										value={fullName}
										onChange={(e) => handleChange("fullName", e.target.value)}
										required
										disabled={updateVisitorMutation.isPending}
									/>
								</Field>

								{/* Email */}
								<Field orientation="vertical">
									<FieldLabel htmlFor={emailId}>Email Address</FieldLabel>
									{errors.email && <FieldError>{errors.email}</FieldError>}
									<Input
										id={emailId}
										type="email"
										placeholder="john.doe@example.com"
										value={email}
										onChange={(e) => handleChange("email", e.target.value)}
										disabled={updateVisitorMutation.isPending}
									/>
									<FieldDescription>
										Optional email address for contact
									</FieldDescription>
								</Field>

								{/* Phone */}
								<Field orientation="vertical">
									<FieldLabel htmlFor={phoneId}>Phone Number</FieldLabel>
									<Input
										id={phoneId}
										type="tel"
										placeholder="+1 234 567 8900"
										value={phone}
										onChange={(e) => handleChange("phone", e.target.value)}
										disabled={updateVisitorMutation.isPending}
									/>
									<FieldDescription>Optional phone number</FieldDescription>
								</Field>

								{/* Gender */}
								<Field orientation="vertical">
									<FieldLabel htmlFor={genderId}>Gender</FieldLabel>
									<Select
										value={gender}
										onValueChange={(value) => handleChange("gender", value)}
										disabled={updateVisitorMutation.isPending}
									>
										<SelectTrigger id={genderId}>
											<SelectValue placeholder="Select gender" />
										</SelectTrigger>
										<SelectContent>
											<SelectItem value="male">Male</SelectItem>
											<SelectItem value="female">Female</SelectItem>
											<SelectItem value="other">Other</SelectItem>
											<SelectItem value="prefer_not_to_say">
												Prefer not to say
											</SelectItem>
										</SelectContent>
									</Select>
									<FieldDescription>
										Optional gender information
									</FieldDescription>
								</Field>

								{/* Age */}
								<Field orientation="vertical">
									<FieldLabel htmlFor={ageId}>Age</FieldLabel>
									<Input
										id={ageId}
										type="number"
										min="1"
										max="150"
										placeholder="25"
										value={age}
										onChange={(e) => handleChange("age", e.target.value)}
										disabled={updateVisitorMutation.isPending}
									/>
									<FieldDescription>Optional age information</FieldDescription>
								</Field>
							</div>
						</div>

						<FieldSeparator />

						{/* Submit Buttons - Right Aligned */}
						<div className="flex justify-end gap-2">
							<Button
								type="button"
								variant="outline"
								onClick={closeDialog}
								disabled={updateVisitorMutation.isPending}
							>
								Cancel
							</Button>
							<Button
								type="submit"
								disabled={updateVisitorMutation.isPending}
							>
								{updateVisitorMutation.isPending
									? "Updating..."
									: "Update Visitor"}
							</Button>
						</div>
					</FieldGroup>
				</FieldSet>
			</form>
		</div>
	);
}
