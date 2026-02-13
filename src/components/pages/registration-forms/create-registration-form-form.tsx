"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useId, useState } from "react";
import { toast } from "sonner";
import { InputLabel } from "@/components/admin-ui/form/input-label";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { createRegistrationForm } from "@/lib/api/registration-form";
import { getEventTicketTypes, type TicketType } from "@/lib/api/ticket-type";

interface TicketTypeRuleInput {
	registration_mode: "single" | "group";
	min_attendees: number;
	max_attendees: string;
}

const defaultRule = (): TicketTypeRuleInput => ({
	registration_mode: "single",
	min_attendees: 1,
	max_attendees: "",
});

interface CreateRegistrationFormFormProps {
	eventId: string;
	onClose: () => void;
}

export function CreateRegistrationFormForm({
	eventId,
	onClose,
}: CreateRegistrationFormFormProps) {
	const nameId = useId();
	const slugId = useId();
	const descriptionId = useId();

	const [formData, setFormData] = useState({
		name: "",
		slug: "",
		description: "",
	});
	const [selectedTicketTypeIds, setSelectedTicketTypeIds] = useState<number[]>(
		[],
	);
	const [ticketTypeRules, setTicketTypeRules] = useState<
		Record<number, TicketTypeRuleInput>
	>({});
	const [errors, setErrors] = useState<Record<string, string>>({});

	const { data: ticketTypes } = useQuery({
		queryKey: ["event", eventId, "ticket-types"],
		queryFn: () => getEventTicketTypes({ eventId }),
	});

	const queryClient = useQueryClient();
	const createMutation = useMutation({
		mutationFn: createRegistrationForm,
		onSuccess: () => {
			toast.success("Registration form created successfully!");
			queryClient.invalidateQueries({
				queryKey: ["event", eventId, "registration-forms"],
			});
			onClose();
		},
		onError: (error: Error) => {
			toast.error(error.message || "Failed to create registration form");
		},
	});

	const handleSubmit = async (e: React.FormEvent) => {
		e.preventDefault();
		setErrors({});

		const newErrors: Record<string, string> = {};
		if (!formData.name) newErrors.name = "Name is required";
		if (!formData.slug) newErrors.slug = "Slug is required";

		if (Object.keys(newErrors).length > 0) {
			setErrors(newErrors);
			return;
		}

		createMutation.mutate({
			eventId,
			name: formData.name,
			slug: formData.slug,
			description: formData.description || undefined,
			ticket_type_ids: selectedTicketTypeIds,
			ticket_type_rules: selectedTicketTypeIds.map((ticketTypeId) => {
				const rule = ticketTypeRules[ticketTypeId] ?? defaultRule();
				return {
					ticket_type_id: ticketTypeId,
					registration_mode: rule.registration_mode,
					min_attendees: rule.min_attendees,
					max_attendees: rule.max_attendees
						? Number.parseInt(rule.max_attendees, 10)
						: null,
				};
			}),
		});
	};

	const handleChange = (field: string, value: string) => {
		setFormData((prev) => ({ ...prev, [field]: value }));
		if (field === "name") {
			const slug = value
				.toLowerCase()
				.replace(/[^a-z0-9]+/g, "-")
				.replace(/^-|-$/g, "");
			setFormData((prev) => ({ ...prev, [field]: value, slug }));
		}
		if (errors[field]) {
			setErrors((prev) => {
				const newErrors = { ...prev };
				delete newErrors[field];
				return newErrors;
			});
		}
	};

	const toggleTicketType = (id: number) => {
		setSelectedTicketTypeIds((prev) => {
			if (prev.includes(id)) {
				return prev.filter((tid) => tid !== id);
			}
			return [...prev, id];
		});

		setTicketTypeRules((prev) => {
			if (prev[id]) {
				return prev;
			}
			return {
				...prev,
				[id]: defaultRule(),
			};
		});
	};

	const updateRule = (
		id: number,
		patch: Partial<TicketTypeRuleInput>,
	) => {
		setTicketTypeRules((prev) => ({
			...prev,
			[id]: {
				...(prev[id] ?? defaultRule()),
				...patch,
			},
		}));
	};

	return (
		<div className="h-full w-full p-0 md:p-4">
			<form onSubmit={handleSubmit} className="h-full">
				<div className="flex h-full flex-col justify-between gap-8">
					<div className="space-y-6">
						<InputLabel
							label="Name"
							htmlFor={nameId}
							value={formData.name}
							onChange={(value) => handleChange("name", value)}
							errors={errors.name ? [{ message: errors.name }] : undefined}
							isInvalid={!!errors.name}
							placeholder="Conference"
							required
							disabled={createMutation.isPending}
						/>

						<InputLabel
							label="Slug"
							htmlFor={slugId}
							value={formData.slug}
							onChange={(value) =>
								setFormData((prev) => ({ ...prev, slug: value }))
							}
							errors={errors.slug ? [{ message: errors.slug }] : undefined}
							isInvalid={!!errors.slug}
							placeholder="conference"
							required
							disabled={createMutation.isPending}
						/>

						<InputLabel
							label="Description"
							htmlFor={descriptionId}
							value={formData.description}
							onChange={(value) => handleChange("description", value)}
							placeholder="Optional description"
							disabled={createMutation.isPending}
						/>

						{ticketTypes && ticketTypes.length > 0 && (
							<div className="space-y-3">
								<Label className="text-sm font-medium">Ticket Types</Label>
								<div className="space-y-2">
									{ticketTypes.map((tt: TicketType) => (
										<div
											key={tt.id}
											className={`rounded border p-3 ${selectedTicketTypeIds.includes(tt.id) ? "border-primary" : ""}`}
										>
											<div className="flex items-center gap-3">
												<Checkbox
													checked={selectedTicketTypeIds.includes(tt.id)}
													onCheckedChange={() => toggleTicketType(tt.id)}
													disabled={createMutation.isPending}
												/>
												<div className="flex-1">
													<span className="text-sm font-medium">{tt.name}</span>
													<span className="text-muted-foreground ml-2 text-xs">
														RM {tt.price.toFixed(2)}
													</span>
												</div>
											</div>

											{selectedTicketTypeIds.includes(tt.id) ? (
												<div className="mt-3 space-y-2 border-t pt-3">
													{(() => {
														const rule = ticketTypeRules[tt.id] ?? defaultRule();

														return (
															<div className="grid gap-3 sm:grid-cols-3">
																<div className="space-y-1">
																	<Label htmlFor={`create-mode-${tt.id}`}>Registration type</Label>
																	<select
																		id={`create-mode-${tt.id}`}
																		value={rule.registration_mode}
																		onChange={(event) =>
																			updateRule(tt.id, {
																				registration_mode: event.target.value as "single" | "group",
																			})
																		}
																		className="w-full rounded border bg-background px-3 py-2 text-sm"
																	>
																		<option value="single">Single attendee</option>
																		<option value="group">Group registration</option>
																	</select>
																</div>

																{rule.registration_mode === "group" ? (
																	<>
																		<div className="space-y-1">
																			<Label htmlFor={`create-min-${tt.id}`}>Minimum attendees</Label>
																			<input
																				id={`create-min-${tt.id}`}
																				type="number"
																				min={1}
																				value={rule.min_attendees}
																				onChange={(event) =>
																					updateRule(tt.id, {
																						min_attendees: Math.max(
																							1,
																							Number.parseInt(event.target.value || "1", 10),
																						),
																					})
																				}
																				className="w-full rounded border bg-background px-3 py-2 text-sm"
																			/>
																		</div>

																		<div className="space-y-1">
																			<Label htmlFor={`create-max-${tt.id}`}>Maximum attendees (optional)</Label>
																			<input
																				id={`create-max-${tt.id}`}
																				type="number"
																				min={1}
																				value={rule.max_attendees}
																				onChange={(event) =>
																					updateRule(tt.id, {
																						max_attendees: event.target.value,
																					})
																				}
																				className="w-full rounded border bg-background px-3 py-2 text-sm"
																			/>
																		</div>
																	</>
																) : null}
															</div>
														);
													})()}
												</div>
											) : null}
										</div>
									))}
								</div>
							</div>
						)}
					</div>
					<div className="flex w-full flex-col gap-2 md:flex-row md:justify-end">
						<Button
							type="button"
							variant="outline"
							onClick={onClose}
							disabled={createMutation.isPending}
							className="rounded-none py-6 md:py-4"
						>
							Cancel
						</Button>
						<Button
							type="submit"
							disabled={createMutation.isPending}
							className="rounded-none py-6 md:py-4"
						>
							{createMutation.isPending
								? "Creating..."
								: "Create Registration Form"}
						</Button>
					</div>
				</div>
			</form>
		</div>
	);
}
