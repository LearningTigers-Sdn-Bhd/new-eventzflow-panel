"use client";

import { DollarSign, FileText, Handshake } from "lucide-react";
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
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { useUpdateEventSponsorship } from "@/hooks/use-event-sponsorships";
import type {
	EventSponsorship,
	EventSponsorshipTier,
} from "@/lib/api/sponsorship/response";
import { SponsorSelect } from "./sponsor-select";

interface EditEventSponsorshipFormProps {
	eventId: string;
	sponsorship: EventSponsorship;
	tiers: EventSponsorshipTier[]; // Pass available tiers for reference/change
	onClose: () => void;
}

export default function EditEventSponsorshipForm({
	eventId,
	sponsorship,
	tiers,
	onClose,
}: EditEventSponsorshipFormProps) {
	const sponsorId = useId();
	const tierId = useId();
	const titleId = useId();
	const amountId = useId();
	const typeId = useId();
	const notesId = useId();
	const statusId = useId();

	const [formData, setFormData] = useState({
		sponsor_id: sponsorship.sponsor_id.toString(),
		event_sponsorship_tier_id: sponsorship.event_sponsorship_tier_id
			? sponsorship.event_sponsorship_tier_id.toString()
			: "none",
		title: sponsorship.title,
		total_sponsor_amount: sponsorship.total_sponsor_amount || "0",
		sponsorship_type: sponsorship.sponsorship_type,
		description: sponsorship.description || "",
		status: sponsorship.status,
	});

	const [errors, setErrors] = useState<Record<string, string>>({});
	const updateMutation = useUpdateEventSponsorship();

	const handleSubmit = async (e: React.FormEvent) => {
		e.preventDefault();
		setErrors({});

		const newErrors: Record<string, string> = {};

		if (!formData.sponsor_id) {
			newErrors.sponsor_id = "Please select a sponsor";
		}
		if (!formData.title) {
			newErrors.title = "Title is required";
		}

		if (Object.keys(newErrors).length > 0) {
			setErrors(newErrors);
			return;
		}

		try {
			await updateMutation.mutateAsync({
				eventId,
				id: sponsorship.id.toString(),
				data: {
					sponsor_id: Number.parseInt(formData.sponsor_id),
					event_sponsorship_tier_id:
						formData.event_sponsorship_tier_id === "none"
							? null
							: Number.parseInt(formData.event_sponsorship_tier_id),
					title: formData.title,
					total_sponsor_amount: formData.total_sponsor_amount || "0",
					sponsorship_type: formData.sponsorship_type as any,
					description: formData.description,
					status: formData.status as any,
				},
			});

			toast.success("Sponsorship updated successfully!");
			onClose();
		} catch (error) {
			const message =
				error instanceof Error ? error.message : "Failed to update sponsorship";
			toast.error(message);
		}
	};

	const handleChange = (field: string, value: string) => {
		setFormData((prev) => ({ ...prev, [field]: value }));
		if (errors[field]) {
			const newErrors = { ...errors };
			delete newErrors[field];
			setErrors(newErrors);
		}
	};

	const handleTierChange = (value: string) => {
		handleChange("event_sponsorship_tier_id", value);
		// Optional: Ask user if they want to update amounts based on new tier?
		// For edit mode, maybe we don't auto-overwrite unless explicitly requested,
		// but simplistic approach is fine.
	};

	return (
		<div className="w-full">
			<form onSubmit={handleSubmit}>
				<FieldSet>
					<FieldSeparator />
					<FieldGroup>
						<div className="grid grid-cols-1 gap-8 md:grid-cols-2">
							<div className="space-y-6">
								<div className="flex items-center gap-2 border-b pb-2">
									<Handshake className="size-5 text-primary" />
									<h3 className="font-semibold text-lg">Sponsorship Details</h3>
								</div>

								<Field orientation="vertical">
									<FieldLabel htmlFor={sponsorId}>Sponsor *</FieldLabel>
									{errors.sponsor_id && (
										<FieldError>{errors.sponsor_id}</FieldError>
									)}
									{/* For edit, maybe disable sponsor change? Or allow it. */}
									<SponsorSelect
										value={formData.sponsor_id}
										onSelect={(s) => {
											handleChange("sponsor_id", s.id?.toString() || "");
										}}
									/>
								</Field>

								<Field orientation="vertical">
									<FieldLabel htmlFor={tierId}>Tier / Package</FieldLabel>
									<Select
										value={formData.event_sponsorship_tier_id}
										onValueChange={handleTierChange}
										disabled={updateMutation.isPending}
									>
										<SelectTrigger id={tierId}>
											<SelectValue placeholder="Select a tier" />
										</SelectTrigger>
										<SelectContent>
											<SelectItem value="none">No Tier (Standalone)</SelectItem>
											{tiers.map((tier) => (
												<SelectItem key={tier.id} value={tier.id.toString()}>
													{tier.name} ({tier.currency_default}{" "}
													{tier.suggested_value})
												</SelectItem>
											))}
										</SelectContent>
									</Select>
								</Field>

								<Field orientation="vertical">
									<FieldLabel htmlFor={titleId}>Title *</FieldLabel>
									{errors.title && <FieldError>{errors.title}</FieldError>}
									<Input
										id={titleId}
										placeholder="e.g. Acme Corp Gold Sponsorship"
										value={formData.title}
										onChange={(e) => handleChange("title", e.target.value)}
										required
										disabled={updateMutation.isPending}
									/>
								</Field>
							</div>

							<div className="space-y-6">
								<div className="flex items-center gap-2 border-b pb-2">
									<DollarSign className="size-5 text-primary" />
									<h3 className="font-semibold text-lg">Value & Terms</h3>
								</div>

								<div className="grid grid-cols-2 gap-4">
									<Field orientation="vertical">
										<FieldLabel htmlFor={amountId}>Total Amount</FieldLabel>
										<Input
											id={amountId}
											type="number"
											placeholder="0.00"
											value={formData.total_sponsor_amount}
											onChange={(e) =>
												handleChange("total_sponsor_amount", e.target.value)
											}
											disabled={updateMutation.isPending}
										/>
									</Field>

									<Field orientation="vertical">
										<FieldLabel htmlFor={typeId}>Type</FieldLabel>
										<Select
											value={formData.sponsorship_type}
											onValueChange={(val) =>
												handleChange("sponsorship_type", val)
											}
											disabled={updateMutation.isPending}
										>
											<SelectTrigger id={typeId}>
												<SelectValue />
											</SelectTrigger>
											<SelectContent>
												<SelectItem value="monetary">Monetary</SelectItem>
												<SelectItem value="in_kind">In-Kind</SelectItem>
												<SelectItem value="mixed">Mixed</SelectItem>
											</SelectContent>
										</Select>
									</Field>
								</div>

								<Field orientation="vertical">
									<FieldLabel htmlFor={statusId}>Status</FieldLabel>
									<Select
										value={formData.status}
										onValueChange={(val) => handleChange("status", val)}
										disabled={updateMutation.isPending}
									>
										<SelectTrigger id={statusId}>
											<SelectValue />
										</SelectTrigger>
										<SelectContent>
											<SelectItem value="pending">Pending</SelectItem>
											<SelectItem value="partially_received">
												Partially Received
											</SelectItem>
											<SelectItem value="received">Received</SelectItem>
											<SelectItem value="cancelled">Cancelled</SelectItem>
										</SelectContent>
									</Select>
								</Field>

								<Field orientation="vertical">
									<FieldLabel htmlFor={notesId}>Description / Notes</FieldLabel>
									<Textarea
										id={notesId}
										placeholder="Additional details..."
										value={formData.description}
										onChange={(e) =>
											handleChange("description", e.target.value)
										}
										disabled={updateMutation.isPending}
										rows={2}
									/>
								</Field>
							</div>
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
								{updateMutation.isPending
									? "Updating..."
									: "Update Sponsorship"}
							</Button>
						</div>
					</FieldGroup>
				</FieldSet>
			</form>
		</div>
	);
}
