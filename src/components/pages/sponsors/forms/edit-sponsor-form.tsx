"use client";

import { FileText, Globe, Handshake, Mail, Phone, User } from "lucide-react";
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
import { Textarea } from "@/components/ui/textarea";
import { useUpdateSponsor } from "@/hooks/use-sponsorships";
import type { Sponsor } from "@/lib/api/sponsorship/response";

interface EditSponsorFormProps {
	sponsor: Sponsor;
	onClose: () => void;
}

export default function EditSponsorForm({
	sponsor,
	onClose,
}: EditSponsorFormProps) {
	const nameId = useId();
	const industryId = useId();
	const websiteId = useId();
	const emailId = useId();
	const contactNameId = useId();
	const contactPositionId = useId();
	const contactWhatsappId = useId();
	const notesId = useId();

	const [formData, setFormData] = useState({
		name: sponsor.name,
		industry: sponsor.industry || "",
		website: sponsor.website || "",
		default_email: sponsor.default_email || "",
		default_contact_name: sponsor.default_contact_name || "",
		default_contact_position: sponsor.default_contact_position || "",
		default_whatsapp: sponsor.default_whatsapp || "",
		notes: sponsor.notes || "",
	});

	const [errors, setErrors] = useState<Record<string, string>>({});

	const updateMutation = useUpdateSponsor();

	const handleSubmit = async (e: React.FormEvent) => {
		e.preventDefault();
		setErrors({});

		const newErrors: Record<string, string> = {};

		if (!formData.name || formData.name.length < 2) {
			newErrors.name = "Name must be at least 2 characters";
		}

		if (Object.keys(newErrors).length > 0) {
			setErrors(newErrors);
			return;
		}

		try {
			await updateMutation.mutateAsync({
				id: sponsor.id.toString(),
				data: {
					name: formData.name,
					industry: formData.industry || undefined,
					website: formData.website || undefined,
					default_email: formData.default_email || undefined,
					default_contact_name: formData.default_contact_name || undefined,
					default_contact_position:
						formData.default_contact_position || undefined,
					default_whatsapp: formData.default_whatsapp || undefined,
					notes: formData.notes || undefined,
				},
			});

			toast.success("Sponsor updated successfully!");
			onClose();
		} catch (error) {
			const message =
				error instanceof Error ? error.message : "Failed to update sponsor";
			toast.error(message);
		}
	};

	const handleChange = (field: string, value: string) => {
		setFormData((prev) => ({ ...prev, [field]: value }));
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
						<div className="grid grid-cols-1 gap-8 md:grid-cols-2">
							{/* LEFT COLUMN - Basic Information */}
							<div className="space-y-6">
								<div className="flex items-center gap-2 border-b pb-2">
									<Handshake className="size-5 text-primary" />
									<h3 className="font-semibold text-lg">Sponsor Details</h3>
								</div>

								<Field orientation="vertical">
									<FieldLabel htmlFor={nameId}>Sponsor Name *</FieldLabel>
									{errors.name && <FieldError>{errors.name}</FieldError>}
									<Input
										id={nameId}
										placeholder="Acme Corp"
										value={formData.name}
										onChange={(e) => handleChange("name", e.target.value)}
										required
										disabled={updateMutation.isPending}
									/>
								</Field>

								<Field orientation="vertical">
									<FieldLabel htmlFor={industryId}>Industry</FieldLabel>
									<Input
										id={industryId}
										placeholder="Technology"
										value={formData.industry}
										onChange={(e) => handleChange("industry", e.target.value)}
										disabled={updateMutation.isPending}
									/>
								</Field>

								<Field orientation="vertical">
									<FieldLabel htmlFor={websiteId}>Website</FieldLabel>
									<div className="relative">
										<Globe className="absolute top-3 left-3 size-4 text-muted-foreground" />
										<Input
											id={websiteId}
											className="pl-9"
											placeholder="https://example.com"
											value={formData.website}
											onChange={(e) => handleChange("website", e.target.value)}
											disabled={updateMutation.isPending}
										/>
									</div>
								</Field>
							</div>

							{/* RIGHT COLUMN - Contact Information */}
							<div className="space-y-6">
								<div className="flex items-center gap-2 border-b pb-2">
									<User className="size-5 text-primary" />
									<h3 className="font-semibold text-lg">Contact Information</h3>
								</div>

								<Field orientation="vertical">
									<FieldLabel htmlFor={contactNameId}>
										Contact Person
									</FieldLabel>
									<Input
										id={contactNameId}
										placeholder="John Doe"
										value={formData.default_contact_name}
										onChange={(e) =>
											handleChange("default_contact_name", e.target.value)
										}
										disabled={updateMutation.isPending}
									/>
								</Field>

								<Field orientation="vertical">
									<FieldLabel htmlFor={contactPositionId}>Position</FieldLabel>
									<Input
										id={contactPositionId}
										placeholder="Marketing Manager"
										value={formData.default_contact_position}
										onChange={(e) =>
											handleChange("default_contact_position", e.target.value)
										}
										disabled={updateMutation.isPending}
									/>
								</Field>

								<Field orientation="vertical">
									<FieldLabel htmlFor={emailId}>Email</FieldLabel>
									<div className="relative">
										<Mail className="absolute top-3 left-3 size-4 text-muted-foreground" />
										<Input
											id={emailId}
											type="email"
											className="pl-9"
											placeholder="contact@example.com"
											value={formData.default_email}
											onChange={(e) =>
												handleChange("default_email", e.target.value)
											}
											disabled={updateMutation.isPending}
										/>
									</div>
								</Field>

								<Field orientation="vertical">
									<FieldLabel htmlFor={contactWhatsappId}>
										WhatsApp / Phone
									</FieldLabel>
									<div className="relative">
										<Phone className="absolute top-3 left-3 size-4 text-muted-foreground" />
										<Input
											id={contactWhatsappId}
											className="pl-9"
											placeholder="+1234567890"
											value={formData.default_whatsapp}
											onChange={(e) =>
												handleChange("default_whatsapp", e.target.value)
											}
											disabled={updateMutation.isPending}
										/>
									</div>
								</Field>
							</div>
						</div>

						<div className="mt-2 space-y-6">
							<div className="flex items-center gap-2 border-b pb-2">
								<FileText className="size-5 text-primary" />
								<h3 className="font-semibold text-lg">Additional Info</h3>
							</div>

							<Field orientation="vertical">
								<FieldLabel htmlFor={notesId}>Notes</FieldLabel>
								<Textarea
									id={notesId}
									placeholder="Internal notes about this sponsor..."
									value={formData.notes}
									onChange={(e) => handleChange("notes", e.target.value)}
									disabled={updateMutation.isPending}
									rows={3}
								/>
							</Field>
						</div>

						<FieldSeparator />

						<div className="flex justify-end gap-3">
							<Button
								type="button"
								variant="outline"
								onClick={onClose}
								disabled={updateMutation.isPending}
							>
								Cancel
							</Button>
							<Button type="submit" disabled={updateMutation.isPending}>
								{updateMutation.isPending ? "Updating..." : "Update Sponsor"}
							</Button>
						</div>
					</FieldGroup>
				</FieldSet>
			</form>
		</div>
	);
}
