"use client";

import { useForm } from "@tanstack/react-form";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useParams } from "next/navigation";
import React, { useId, useState, useEffect } from "react";
import { toast } from "sonner";
import { Plus, X } from "lucide-react";
import * as z from "zod";
import { ErrorState, LoadingState } from "@/components/data-state";
import { Button } from "@/components/ui/button";
import {
	Field,
	FieldContent,
	FieldDescription,
	FieldError,
	FieldGroup,
	FieldLabel,
	FieldSet,
} from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { NumberInput } from "@/components/ui/number-input";
import { Switch } from "@/components/ui/switch";
import { useDialog } from "@/hooks/use-dialog";
import { getLocationById, updateLocationInfo } from "@/lib/api/event/location";
import { cn } from "@/lib/utils";

const formSchema = z
	.object({
		name: z.string().min(1, "Name is required"),
		floor: z.string().optional(),
		isUnlimited: z.boolean(),
		scanLimit: z.number().min(1, "Scan limit is required").nullable(),
		notes: z.string().optional(),
	})
	.refine((data) => data.isUnlimited || typeof data.scanLimit === "number", {
		message: "Scan limit is required when not unlimited",
		path: ["scanLimit"],
	});

interface InfoFormProps {
	locationId: string;
	onClose?: () => void;
}

export default function InfoForm({ locationId, onClose }: InfoFormProps) {
	const formId = useId();
	const sectionId = useId();
	const params = useParams();
	const eventId = params.event_id as string;
	const { closeDialog } = useDialog();
	const queryClient = useQueryClient();
	
	// State for dynamic location details
	const [customDetails, setCustomDetails] = useState<Array<{ key: string; value: string }>>([]);

	// Fetch location data
	const { data: location, isLoading } = useQuery({
		queryKey: ["event", eventId, "location", locationId],
		queryFn: () => getLocationById({ eventId, locationId }),
	});

	// Update location mutation
	const updateLocationMutation = useMutation({
		mutationFn: async (values: {
			name: string;
			floor?: string;
			scanLimit: number | null;
			isUnlimited?: boolean;
			notes?: string;
		}) => {
			// Build location details from custom details
			const locationDetails: Record<string, string> = {};
			customDetails.forEach(detail => {
				if (detail.key && detail.value) {
					locationDetails[detail.key] = detail.value;
				}
			});
			
			// Add notes if provided
			if (values.notes) {
				locationDetails.notes = values.notes;
			}
			
			return await updateLocationInfo({
				eventId,
				locationId,
				name: values.name,
				floor: values.floor,
				isUnlimited: values.isUnlimited ?? false,
				scanLimit: values.isUnlimited ? 1 : (values.scanLimit as number),
				locationDetails,
			});
		},
		onSuccess: () => {
			toast.success("Location updated successfully");
			// Invalidate and refetch locations
			queryClient.invalidateQueries({
				queryKey: ["event", eventId, "locations"],
			});
			queryClient.invalidateQueries({
				queryKey: ["event", eventId, "location", locationId],
			});
			// Close dialog
			closeDialog();
			if (onClose) onClose();
		},
		onError: (error: Error) => {
			toast.error(`Failed to update location: ${error.message}`);
		},
	});

	const form = useForm({
		defaultValues: {
			name: location?.name || "",
			floor: location?.floor || "",
			isUnlimited: location?.isUnlimited ?? false,
			scanLimit: location?.scanLimit ?? null,
			notes: location?.locationDetails?.notes || "",
		} as {
			name: string;
			floor?: string;
			isUnlimited: boolean;
			scanLimit: number | null;
			notes?: string;
		},
		validators: {
			onSubmit: formSchema,
		},
		onSubmit: async ({ value }) => {
			await updateLocationMutation.mutateAsync(value);
		},
	});

	// Update form values and custom details when location data is loaded
	React.useEffect(() => {
		if (location) {
			form.setFieldValue("name", location.name);
			form.setFieldValue("floor", location.floor || "");
			form.setFieldValue("isUnlimited", location.isUnlimited ?? false);
			form.setFieldValue("scanLimit", location.scanLimit ?? null);
			form.setFieldValue("notes", location.locationDetails?.notes || "");
			
			// Load existing custom details (excluding notes)
			if (location.locationDetails) {
				const details: Array<{ key: string; value: string }> = [];
				Object.entries(location.locationDetails).forEach(([key, value]) => {
					if (key !== 'notes' && value) {
						details.push({ key, value: String(value) });
					}
				});
				setCustomDetails(details);
			}
		}
	}, [location, form]);

	if (isLoading) {
		return (
			<LoadingState
				title="Loading location data..."
				description="Please wait while we fetch the location information."
				height="h-64"
			/>
		);
	}

	if (!location) {
		return (
			<ErrorState
				title="Location not found"
				description="The requested location could not be found. Please check the location ID and try again."
				height="h-64"
			/>
		);
	}

	return (
		<section
			id={sectionId}
			className="w-full px-8"
			data-section="location-information"
		>
			<form
				id={formId}
				onSubmit={(e) => {
					e.preventDefault();
					e.stopPropagation();
					form.handleSubmit();
				}}
			>
				<FieldSet>
					{/* Two Column Layout - Stack on mobile, side-by-side on desktop */}
					<div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6">
						{/* LEFT COLUMN - Location Info */}
						<div className="space-y-3 md:space-y-4">
							<div className="border-b pb-1.5 md:pb-2">
								<h3 className="font-semibold text-xs md:text-sm uppercase tracking-wide text-muted-foreground">
									Location Info
								</h3>
							</div>

							<FieldGroup>
								<form.Field name="name">
									{(field) => {
										const isInvalid =
											field.state.meta.isTouched && !field.state.meta.isValid;
										return (
											<Field data-invalid={isInvalid}>
												<FieldContent>
													<FieldLabel htmlFor={field.name}>Name</FieldLabel>
													<FieldDescription>
														Provide the location name
													</FieldDescription>
												</FieldContent>
												<Input
													id={field.name}
													name={field.name}
													value={field.state.value}
													onBlur={field.handleBlur}
													onChange={(e) => field.handleChange(e.target.value)}
													aria-invalid={isInvalid}
													placeholder="Main Entrance"
													autoComplete="name"
												/>
												{isInvalid && (
													<FieldError errors={field.state.meta.errors} />
												)}
											</Field>
								);
							}}
						</form.Field>

						<form.Field name="floor">
							{(field) => (
								<Field>
									<FieldContent>
										<FieldLabel htmlFor={field.name}>Floor (Optional)</FieldLabel>
										<FieldDescription>
											e.g., 1, 2, Ground, Basement
										</FieldDescription>
									</FieldContent>
									<Input
										id={field.name}
										name={field.name}
										value={field.state.value || ""}
										onChange={(e) => field.handleChange(e.target.value)}
										placeholder="1"
									/>
								</Field>
							)}
						</form.Field>

						<form.Field name="isUnlimited">
							{(field) => (
								<Field
									orientation="horizontal"
									className={cn(
										"rounded-md border border-primary/30 bg-secondary p-2",
									)}
								>
									<FieldContent>
										<FieldLabel htmlFor={field.name}>Unlimited</FieldLabel>
										<FieldDescription>
											No scan limit for this location
										</FieldDescription>
									</FieldContent>
									<Switch
										className="ring-offset-1 ring-offset-primary data-[state=checked]:bg-green-500 data-[state=unchecked]:bg-red-500"
										checked={!!field.state.value}
										onCheckedChange={(checked) => {
											const value = !!checked;
											field.handleChange(value);
											if (value) {
												form.setFieldValue("scanLimit", 1);
											}
										}}
									/>
								</Field>
							)}
						</form.Field>
						<form.Subscribe selector={(state) => state.values.isUnlimited}>
							{(isUnlimited) =>
								!isUnlimited && (
									<form.Field name="scanLimit">
										{(field) => {
											const isInvalid =
												field.state.meta.isTouched && !field.state.meta.isValid;
											return (
												<Field data-invalid={isInvalid}>
													<FieldContent>
														<FieldLabel htmlFor={field.name}>
															Scan Limit
														</FieldLabel>
														<FieldDescription>
															Maximum number of scans allowed for this location
														</FieldDescription>
													</FieldContent>
													<NumberInput
														value={field.state.value ?? 0}
														onChange={field.handleChange}
														min={1}
														max={9999}
														step={1}
													/>
													{isInvalid && (
														<FieldError errors={field.state.meta.errors} />
													)}
												</Field>
											);
										}}
									</form.Field>
								)
							}
						</form.Subscribe>
							</FieldGroup>
						</div>

						{/* RIGHT COLUMN - Additional Details */}
						<div className="space-y-3 md:space-y-4">
							<div className="border-b pb-1.5 md:pb-2">
								<h3 className="font-semibold text-xs md:text-sm uppercase tracking-wide text-muted-foreground">
									Additional Details
								</h3>
							</div>

							<FieldGroup>
								{/* Default Wing Field */}
								<Field>
									<FieldContent>
										<FieldLabel>Wing (Optional)</FieldLabel>
										<FieldDescription>
											Location wing or section identifier
										</FieldDescription>
									</FieldContent>
									<Input
										placeholder="e.g., A, North, East"
										value={customDetails.find(d => d.key === "Wing")?.value || ""}
										onChange={(e) => {
											const newDetails = [...customDetails];
											const wingIndex = newDetails.findIndex(d => d.key === "Wing");
											if (wingIndex >= 0) {
												newDetails[wingIndex].value = e.target.value;
											} else {
												newDetails.unshift({ key: "Wing", value: e.target.value });
											}
											setCustomDetails(newDetails);
										}}
										className="text-sm"
									/>
								</Field>

								{/* Default Zone Field */}
								<Field>
									<FieldContent>
										<FieldLabel>Zone (Optional)</FieldLabel>
										<FieldDescription>
											Location zone or area designation
										</FieldDescription>
									</FieldContent>
									<Input
										placeholder="e.g., Premium, General, VIP"
										value={customDetails.find(d => d.key === "Zone")?.value || ""}
										onChange={(e) => {
											const newDetails = [...customDetails];
											const zoneIndex = newDetails.findIndex(d => d.key === "Zone");
											if (zoneIndex >= 0) {
												newDetails[zoneIndex].value = e.target.value;
											} else {
												const wingExists = newDetails.findIndex(d => d.key === "Wing");
												if (wingExists >= 0) {
													newDetails.splice(wingExists + 1, 0, { key: "Zone", value: e.target.value });
												} else {
													newDetails.unshift({ key: "Zone", value: e.target.value });
												}
											}
											setCustomDetails(newDetails);
										}}
										className="text-sm"
									/>
								</Field>

								{/* Custom Details - excluding Wing and Zone */}
								{customDetails.filter(d => d.key !== "Wing" && d.key !== "Zone").length > 0 && (
									<div className="space-y-3 pt-2">
										<p className="text-xs font-medium text-muted-foreground">Custom Details</p>
										{customDetails
											.map((detail, index) => ({ detail, index }))
											.filter(({ detail }) => detail.key !== "Wing" && detail.key !== "Zone")
											.map(({ detail, index }) => (
												<div key={index} className="space-y-2 border bg-muted p-2">
													<div className="flex items-center justify-between">
														<div className="grid grid-cols-2 gap-2 flex-1">
															<label className="text-xs font-medium">
																Title
															</label>
															<label className="text-xs font-medium">
																Value
															</label>
														</div>
														<div className="w-9" /> {/* Spacer for delete button */}
													</div>
													<div className="flex gap-2 items-start">
														<div className="flex-1 grid grid-cols-2 gap-2">
															<Input
																placeholder="e.g., Section"
																value={detail.key}
																onChange={(e) => {
																	const newDetails = [...customDetails];
																	newDetails[index].key = e.target.value;
																	setCustomDetails(newDetails);
																}}
																className="text-sm bg-white"
															/>
															<Input
																placeholder="e.g., B"
																value={detail.value}
																onChange={(e) => {
																	const newDetails = [...customDetails];
																	newDetails[index].value = e.target.value;
																	setCustomDetails(newDetails);
																}}
																className="text-sm bg-white"
															/>
														</div>
														<Button
															type="button"
															size="icon"
															variant="ghost"
															onClick={() => {
																setCustomDetails(customDetails.filter((_, i) => i !== index));
															}}
															className="h-9 w-9 text-red-500 hover:text-red-600 hover:bg-red-50"
														>
															<X className="size-4" />
														</Button>
													</div>
												</div>
											))}
									</div>
								)}
								
								<Button
									type="button"
									size="sm"
									variant="outline"
									onClick={() => setCustomDetails([...customDetails, { key: "", value: "" }])}
									className="w-full h-9 text-xs mt-2"
								>
									<Plus className="size-3 mr-1" />
									Add Custom Detail
								</Button>
							</FieldGroup>
						</div>
					</div>

					{/* Notes - Full Width Below */}
					<div className="mt-4 md:mt-6">
						<form.Field name="notes">
							{(field) => (
								<Field>
									<FieldContent>
										<FieldLabel htmlFor={field.name}>Notes</FieldLabel>
										<FieldDescription>
											Additional location information or instructions
										</FieldDescription>
									</FieldContent>
									<Input
										id={field.name}
										name={field.name}
										value={field.state.value || ""}
										onChange={(e) => field.handleChange(e.target.value)}
										placeholder="Near main entrance, accessible via elevator"
									/>
								</Field>
							)}
						</form.Field>
					</div>

					<div className="mt-4 md:mt-6 flex flex-col-reverse sm:flex-row justify-end gap-2">
						<Button
							type="button"
							variant="outline"
							onClick={() => {
								closeDialog();
								if (onClose) onClose();
							}}
							disabled={updateLocationMutation.isPending}
							className="w-full sm:w-auto"
						>
							Cancel
						</Button>
						<Button 
							type="submit" 
							disabled={updateLocationMutation.isPending}
							className="w-full sm:w-auto"
						>
							{updateLocationMutation.isPending
								? "Updating..."
								: "Update Location"}
						</Button>
					</div>
				</FieldSet>
			</form>
		</section>
	);
}
