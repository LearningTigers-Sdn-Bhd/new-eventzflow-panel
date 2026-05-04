"use client";

import { DndContext, type DragEndEvent } from "@dnd-kit/core";
import {
	SortableContext,
	verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Plus } from "lucide-react";
import { useCallback, useId, useState } from "react";
import { toast } from "sonner";
import { InputLabel } from "@/components/admin-ui/form/input-label";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Field, FieldLabel } from "@/components/ui/field";
import { Label } from "@/components/ui/label";
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from "@/components/ui/select";
import {
	type RegistrationForm,
	updateRegistrationForm,
} from "@/lib/api/registration-form";
import { getEventTicketTypes, type TicketType } from "@/lib/api/ticket-type";
import {
	buildCustomLabelsData,
	type CustomLabelInput,
	getInitialCustomLabels,
} from "./custom-labels";
import { SortableCustomLabelItem } from "./sortable-custom-label-item";

interface TicketTypeRuleInput {
	registration_mode: "single" | "group";
	min_attendees: number;
	max_attendees: string;
	custom_labels: CustomLabelInput[];
}

const defaultRule = (): TicketTypeRuleInput => ({
	registration_mode: "single",
	min_attendees: 1,
	max_attendees: "",
	custom_labels: [],
});

interface EditRegistrationFormFormProps {
	registrationForm: RegistrationForm;
	eventId: string;
	onClose: () => void;
}

function reorderByDragEvent<T extends { id: string }>(
	items: T[],
	event: DragEndEvent,
): T[] {
	const { active, over } = event;
	if (!over || active.id === over.id) return items;

	const oldIndex = items.findIndex((item) => item.id === String(active.id));
	const newIndex = items.findIndex((item) => item.id === String(over.id));
	if (oldIndex === -1 || newIndex === -1) return items;

	const result = [...items];
	const [moved] = result.splice(oldIndex, 1);
	result.splice(newIndex, 0, moved);
	return result;
}

export function EditRegistrationFormForm({
	registrationForm,
	eventId,
	onClose,
}: EditRegistrationFormFormProps) {
	const nameId = useId();
	const slugId = useId();
	const descriptionId = useId();

	const [formData, setFormData] = useState({
		name: registrationForm.name,
		slug: registrationForm.slug,
		description: registrationForm.description || "",
		status: registrationForm.status.toString(),
	});
	const [selectedTicketTypeIds, setSelectedTicketTypeIds] = useState<number[]>(
		registrationForm.ticketTypes.map((tt) => tt.id),
	);
	const [ticketTypeRules, setTicketTypeRules] = useState<
		Record<number, TicketTypeRuleInput>
	>(() =>
		registrationForm.ticketTypes.reduce<Record<number, TicketTypeRuleInput>>(
			(acc, ticketType) => {
				acc[ticketType.id] = {
					registration_mode: ticketType.registrationMode,
					min_attendees: ticketType.minAttendees,
					max_attendees: ticketType.maxAttendees?.toString() ?? "",
					custom_labels: getInitialCustomLabels(ticketType.customLabelsData),
				};
				return acc;
			},
			{},
		),
	);
	const [errors, setErrors] = useState<Record<string, string>>({});
	const [customLabels, setCustomLabels] = useState<CustomLabelInput[]>(() =>
		getInitialCustomLabels(registrationForm.customLabelsData),
	);

	const { data: ticketTypes } = useQuery({
		queryKey: ["event", eventId, "ticket-types"],
		queryFn: () => getEventTicketTypes({ eventId }),
	});

	const queryClient = useQueryClient();
	const updateMutation = useMutation({
		mutationFn: updateRegistrationForm,
		onSuccess: () => {
			toast.success("Registration form updated successfully!");
			queryClient.invalidateQueries({
				queryKey: ["event", eventId, "registration-forms"],
			});
			onClose();
		},
		onError: (error: Error) => {
			toast.error(error.message || "Failed to update registration form");
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

		updateMutation.mutate({
			eventId,
			registrationFormId: registrationForm.id.toString(),
			name: formData.name,
			slug: formData.slug,
			description: formData.description || undefined,
			status: Number.parseInt(formData.status, 10),
			custom_labels_data: buildCustomLabelsData(customLabels),
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
					custom_labels_data: buildCustomLabelsData(rule.custom_labels),
				};
			}),
		});
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

	const updateRule = (id: number, patch: Partial<TicketTypeRuleInput>) => {
		setTicketTypeRules((prev) => ({
			...prev,
			[id]: {
				...(prev[id] ?? defaultRule()),
				...patch,
			},
		}));
	};

	const addCustomLabel = () => {
		setCustomLabels((prev) => [
			...prev,
			{ id: crypto.randomUUID(), value: "" },
		]);
	};

	const removeCustomLabel = (id: string) => {
		setCustomLabels((prev) => prev.filter((label) => label.id !== id));
	};

	const updateCustomLabel = (id: string, value: string) => {
		setCustomLabels((prev) =>
			prev.map((label) => (label.id === id ? { ...label, value } : label)),
		);
	};

	const handleCustomLabelDragEnd = useCallback((event: DragEndEvent) => {
		setCustomLabels((prev) => reorderByDragEvent(prev, event));
	}, []);

	const addTicketTypeCustomLabel = (ticketTypeId: number) => {
		updateRule(ticketTypeId, {
			custom_labels: [
				...(ticketTypeRules[ticketTypeId]?.custom_labels ?? []),
				{ id: crypto.randomUUID(), value: "" },
			],
		});
	};

	const removeTicketTypeCustomLabel = (
		ticketTypeId: number,
		labelId: string,
	) => {
		updateRule(ticketTypeId, {
			custom_labels: (
				ticketTypeRules[ticketTypeId]?.custom_labels ?? []
			).filter((label) => label.id !== labelId),
		});
	};

	const updateTicketTypeCustomLabel = (
		ticketTypeId: number,
		labelId: string,
		value: string,
	) => {
		updateRule(ticketTypeId, {
			custom_labels: (ticketTypeRules[ticketTypeId]?.custom_labels ?? []).map(
				(label) => (label.id === labelId ? { ...label, value } : label),
			),
		});
	};

	const handleTicketTypeLabelDragEnd = useCallback(
		(ticketTypeId: number) => (event: DragEndEvent) => {
			setTicketTypeRules((prev) => {
				const rule = prev[ticketTypeId] ?? defaultRule();
				return {
					...prev,
					[ticketTypeId]: {
						...rule,
						custom_labels: reorderByDragEvent(
							rule.custom_labels,
							event,
						),
					},
				};
			});
		},
		[],
	);

	return (
		<div className="h-full w-full p-4 md:p-6">
			<form onSubmit={handleSubmit} className="h-full">
				<div className="flex h-full flex-col justify-between gap-8">
					<div className="space-y-6">
						<div className="grid grid-cols-1 gap-4 md:grid-cols-3">
							<InputLabel
								label="Name"
								htmlFor={nameId}
								value={formData.name}
								onChange={(value) => handleChange("name", value)}
								errors={errors.name ? [{ message: errors.name }] : undefined}
								isInvalid={!!errors.name}
								placeholder="Conference"
								required
								disabled={updateMutation.isPending}
							/>

							<InputLabel
								label="Slug"
								htmlFor={slugId}
								value={formData.slug}
								onChange={(value) => handleChange("slug", value)}
								errors={errors.slug ? [{ message: errors.slug }] : undefined}
								isInvalid={!!errors.slug}
								placeholder="conference"
								required
								disabled={updateMutation.isPending}
							/>

							<Field orientation="vertical">
								<FieldLabel htmlFor="status">Status</FieldLabel>
								<Select
									value={formData.status}
									onValueChange={(value) => handleChange("status", value)}
									disabled={updateMutation.isPending}
								>
									<SelectTrigger id="status" className="w-full rounded-none">
										<SelectValue placeholder="Select status" />
									</SelectTrigger>
									<SelectContent className="rounded-none">
										<SelectItem value="0" className="rounded-none">
											Active
										</SelectItem>
										<SelectItem value="1" className="rounded-none">
											Inactive
										</SelectItem>
									</SelectContent>
								</Select>
							</Field>
						</div>

						<InputLabel
							label="Description"
							htmlFor={descriptionId}
							type="textarea"
							rows={4}
							value={formData.description}
							onChange={(value) => handleChange("description", value)}
							placeholder="Optional description"
							disabled={updateMutation.isPending}
						/>

						<div className="space-y-3 rounded-none border bg-muted/20 p-4 md:p-5">
							<div className="flex items-center justify-between gap-2">
								<div>
									<Label className="font-medium text-sm">
										Additional Registration Fields
									</Label>
									<p className="text-muted-foreground text-xs">
										Shown on public registration form and saved to ticket custom
										labels. Drag to reorder.
									</p>
								</div>
								<Button
									type="button"
									variant="outline"
									onClick={addCustomLabel}
									disabled={updateMutation.isPending}
									className="rounded-none"
								>
									<Plus className="size-4" />
									Add Field
								</Button>
							</div>

							{customLabels.length > 0 ? (
								<DndContext onDragEnd={handleCustomLabelDragEnd}>
									<SortableContext
										items={customLabels.map((l) => l.id)}
										strategy={verticalListSortingStrategy}
									>
										<div className="grid grid-cols-1 gap-3 md:grid-cols-2">
											{customLabels.map((label, index) => (
												<SortableCustomLabelItem
													key={label.id}
													id={label.id}
													label={`Field ${index + 1}`}
													value={label.value}
													onChange={(value) =>
														updateCustomLabel(label.id, value)
													}
													onRemove={() => removeCustomLabel(label.id)}
													placeholder="e.g., Company Name"
													disabled={updateMutation.isPending}
												/>
											))}
										</div>
									</SortableContext>
								</DndContext>
							) : null}
						</div>

						{ticketTypes && ticketTypes.length > 0 && (
							<div className="space-y-3">
								<Label className="font-medium text-sm">Ticket Types</Label>
								<div className="space-y-2">
									{ticketTypes.map((tt: TicketType) => (
										<div
											key={tt.id}
											className={`rounded-none border p-3 ${selectedTicketTypeIds.includes(tt.id) ? "border-primary bg-muted/10" : ""}`}
										>
											<div className="flex items-center gap-3">
												<Checkbox
													checked={selectedTicketTypeIds.includes(tt.id)}
													onCheckedChange={() => toggleTicketType(tt.id)}
													disabled={updateMutation.isPending}
												/>
												<div className="flex-1">
													<span className="font-medium text-sm">{tt.name}</span>
													<span className="ml-2 text-muted-foreground text-xs">
														RM {tt.price.toFixed(2)}
													</span>
												</div>
											</div>

											{selectedTicketTypeIds.includes(tt.id) ? (
												<div className="mt-3 space-y-4 border-t pt-3">
													{(() => {
														const rule =
															ticketTypeRules[tt.id] ?? defaultRule();

														return (
															<div className="space-y-4">
																<div className="grid gap-3 md:grid-cols-3">
																	<div className="space-y-1">
																		<Label htmlFor={`edit-mode-${tt.id}`}>
																			Registration type
																		</Label>
																		<select
																			id={`edit-mode-${tt.id}`}
																			value={rule.registration_mode}
																			onChange={(event) =>
																				updateRule(tt.id, {
																					registration_mode: event.target
																						.value as "single" | "group",
																				})
																			}
																			className="w-full rounded border bg-background px-3 py-2 text-sm"
																		>
																			<option value="single">
																				Single attendee
																			</option>
																			<option value="group">
																				Group registration
																			</option>
																		</select>
																	</div>

																	{rule.registration_mode === "group" ? (
																		<>
																			<div className="space-y-1">
																				<Label htmlFor={`edit-min-${tt.id}`}>
																					Minimum attendees
																				</Label>
																				<input
																					id={`edit-min-${tt.id}`}
																					type="number"
																					min={1}
																					value={rule.min_attendees}
																					onChange={(event) =>
																						updateRule(tt.id, {
																							min_attendees: Math.max(
																								1,
																								Number.parseInt(
																									event.target.value || "1",
																									10,
																								),
																							),
																						})
																					}
																					className="w-full rounded border bg-background px-3 py-2 text-sm"
																				/>
																			</div>

																			<div className="space-y-1">
																				<Label htmlFor={`edit-max-${tt.id}`}>
																					Maximum attendees (optional)
																				</Label>
																				<input
																					id={`edit-max-${tt.id}`}
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

																<div className="space-y-2 rounded-none border bg-muted/20 p-3">
																	<div className="flex items-center justify-between gap-2">
																		<Label className="font-medium text-muted-foreground text-xs uppercase tracking-wider">
																			Ticket-specific fields
																		</Label>
																		<Button
																			type="button"
																			variant="outline"
																			onClick={() =>
																				addTicketTypeCustomLabel(tt.id)
																			}
																			disabled={updateMutation.isPending}
																			className="h-8 rounded-none px-3 text-xs"
																		>
																			<Plus className="size-3" />
																			Add
																		</Button>
																	</div>

																	{(rule.custom_labels ?? []).length > 0 ? (
																		<DndContext
																			onDragEnd={handleTicketTypeLabelDragEnd(
																				tt.id,
																			)}
																		>
																			<SortableContext
																				items={(rule.custom_labels ?? []).map(
																					(l) => l.id,
																				)}
																				strategy={verticalListSortingStrategy}
																			>
																				<div className="grid grid-cols-1 gap-2 md:grid-cols-2">
																					{(rule.custom_labels ?? []).map(
																						(label, index) => (
																							<SortableCustomLabelItem
																								key={label.id}
																								id={label.id}
																								label={`Field ${index + 1}`}
																								htmlFor={`tt-${tt.id}-${label.id}`}
																								value={label.value}
																								onChange={(value) =>
																									updateTicketTypeCustomLabel(
																										tt.id,
																										label.id,
																										value,
																									)
																								}
																								onRemove={() =>
																									removeTicketTypeCustomLabel(
																										tt.id,
																										label.id,
																									)
																								}
																								placeholder="e.g., Member ID"
																								disabled={
																									updateMutation.isPending
																								}
																							/>
																						),
																					)}
																				</div>
																			</SortableContext>
																		</DndContext>
																	) : (
																		<p className="text-muted-foreground text-xs">
																			No ticket-specific fields.
																		</p>
																	)}
																</div>
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
							disabled={updateMutation.isPending}
							className="rounded-none py-6 md:py-4"
						>
							Cancel
						</Button>
						<Button
							type="submit"
							disabled={updateMutation.isPending}
							className="rounded-none py-6 md:py-4"
						>
							{updateMutation.isPending ? "Saving..." : "Save Changes"}
						</Button>
					</div>
				</div>
			</form>
		</div>
	);
}
