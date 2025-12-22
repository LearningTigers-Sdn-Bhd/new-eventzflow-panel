"use client";

import { useForm } from "@tanstack/react-form";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Box, MapPin, Plus, X } from "lucide-react";
import { useParams } from "next/navigation";
import React, { useId, useState } from "react";
import { toast } from "sonner";
import * as z from "zod";
import { FieldSectionLabel } from "@/components/admin-ui/form/field-section-label";
import { FormGroupContainer } from "@/components/admin-ui/form/form-group-container";
import { InputLabel } from "@/components/admin-ui/form/input-label";
import { NumberInputLabel } from "@/components/admin-ui/form/number-input-label";
import { SwitchCardInput } from "@/components/admin-ui/form/switch-card-input";
import { ErrorState, LoadingState } from "@/components/data-state";
import { Button } from "@/components/ui/button";
import { FieldSet } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { useDialog } from "@/hooks/use-dialog";
import { getLocationById, updateLocationInfo } from "@/lib/api/event/location";
import type { BaseLocation } from "../event-location-table-columns";

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

interface LocationSettingsDialogProps {
	location: BaseLocation;
	onClose?: () => void;
}

export default function LocationSettingsDialog({
	location,
	onClose,
}: LocationSettingsDialogProps) {
	const locationId = location.id;
	const formId = useId();
	const sectionId = useId();
	const params = useParams();
	const eventId = params.event_id as string;
	const { closeDialog } = useDialog();
	const queryClient = useQueryClient();

	// State for dynamic location details
	const [customDetails, setCustomDetails] = useState<
		Array<{ key: string; value: string }>
	>([]);

	// Helper function to update a custom detail by key
	const updateCustomDetail = (key: string, value: string) => {
		setCustomDetails((prev) => {
			const newDetails = [...prev];
			const index = newDetails.findIndex((d) => d.key === key);
			if (index >= 0) {
				newDetails[index].value = value;
			} else {
				// Insert Wing at start, Zone after Wing if it exists
				if (key === "Wing") {
					newDetails.unshift({ key, value });
				} else if (key === "Zone") {
					const wingIndex = newDetails.findIndex((d) => d.key === "Wing");
					if (wingIndex >= 0) {
						newDetails.splice(wingIndex + 1, 0, { key, value });
					} else {
						newDetails.unshift({ key, value });
					}
				} else {
					newDetails.push({ key, value });
				}
			}
			return newDetails;
		});
	};

	// Helper function to get a custom detail value by key
	const getCustomDetailValue = (key: string) => {
		return customDetails.find((d) => d.key === key)?.value || "";
	};

	// Fetch location data
	const { data: locationData, isLoading } = useQuery({
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
			customDetails.forEach((detail) => {
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
			name: locationData?.name || "",
			floor: locationData?.floor || "",
			isUnlimited: locationData?.isUnlimited ?? false,
			scanLimit: locationData?.scanLimit ?? null,
			notes: locationData?.locationDetails?.notes || "",
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
		if (locationData) {
			form.setFieldValue("name", locationData.name);
			form.setFieldValue("floor", locationData.floor || "");
			form.setFieldValue("isUnlimited", locationData.isUnlimited ?? false);
			form.setFieldValue("scanLimit", locationData.scanLimit ?? null);
			form.setFieldValue("notes", locationData.locationDetails?.notes || "");

			// Load existing custom details (excluding notes)
			if (locationData.locationDetails) {
				const details: Array<{ key: string; value: string }> = [];
				Object.entries(locationData.locationDetails).forEach(([key, value]) => {
					if (key !== "notes" && value) {
						details.push({ key, value: String(value) });
					}
				});
				setCustomDetails(details);
			}
		}
	}, [locationData, form]);

	if (isLoading) {
		return (
			<div className="flex flex-col gap-4">
				<LoadingState
					title="Loading location data..."
					description="Please wait while we fetch the location information."
					height="h-64"
				/>
			</div>
		);
	}

	if (!locationData) {
		return (
			<div className="flex flex-col gap-4">
				<ErrorState
					title="Location not found"
					description="The requested location could not be found. Please check the location ID and try again."
					height="h-64"
				/>
			</div>
		);
	}

	return (
		<div className="flex flex-col gap-4">
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
						<div className="grid grid-cols-1 gap-4 md:grid-cols-2 md:gap-6">
							<FormGroupContainer
								title={{
									icon: MapPin,
									label: "Location Info",
									description:
										"Fill in required fields to update the location information.",
								}}
							>
								<form.Field name="name">
									{(field) => {
										const isInvalid =
											field.state.meta.isTouched && !field.state.meta.isValid;
										return (
											<InputLabel
												label="Name"
												htmlFor={field.name}
												description="Provide the location name"
												value={field.state.value}
												onChange={field.handleChange}
												onBlur={field.handleBlur}
												errors={field.state.meta.errors}
												isInvalid={isInvalid}
												placeholder="Main Entrance"
												autoComplete="name"
												disabled={updateLocationMutation.isPending}
												required
											/>
										);
									}}
								</form.Field>

								<form.Field name="floor">
									{(field) => (
										<InputLabel
											label="Floor (Optional)"
											htmlFor={field.name}
											description="e.g., 1, 2, Ground, Basement"
											value={field.state.value || ""}
											onChange={field.handleChange}
											placeholder="1"
											disabled={updateLocationMutation.isPending}
										/>
									)}
								</form.Field>

								<form.Field name="isUnlimited">
									{(field) => (
										<SwitchCardInput
											label="Unlimited"
											description="No scan limit for this location"
											htmlFor={field.name}
											checked={!!field.state.value}
											onCheckedChange={(checked) => {
												const value = !!checked;
												field.handleChange(value);
												if (value) {
													form.setFieldValue("scanLimit", 1);
												}
											}}
											disabled={updateLocationMutation.isPending}
											variant="no-rounded"
										/>
									)}
								</form.Field>
								<form.Subscribe selector={(state) => state.values.isUnlimited}>
									{(isUnlimited) =>
										!isUnlimited && (
											<form.Field name="scanLimit">
												{(field) => {
													const isInvalid =
														field.state.meta.isTouched &&
														!field.state.meta.isValid;
													return (
														<NumberInputLabel
															label="Scan Limit"
															htmlFor={field.name}
															description="Maximum number of scans allowed for this location"
															value={field.state.value ?? 0}
															onChange={field.handleChange}
															errors={field.state.meta.errors}
															isInvalid={isInvalid}
															min={1}
															max={9999}
															step={1}
															disabled={updateLocationMutation.isPending}
															required
														/>
													);
												}}
											</form.Field>
										)
									}
								</form.Subscribe>

								<form.Field name="notes">
									{(field) => (
										<InputLabel
											label="Notes"
											htmlFor={field.name}
											description="Additional location information or instructions"
											type="textarea"
											value={field.state.value || ""}
											onChange={field.handleChange}
											placeholder="Near main entrance, accessible via elevator"
											disabled={updateLocationMutation.isPending}
										/>
									)}
								</form.Field>
							</FormGroupContainer>

							{/* RIGHT COLUMN - Additional Details */}
							<FormGroupContainer
								title={{
									icon: Box,
									label: "Additional Details",
									description:
										"Fill in optional fields to update the location additional details.",
								}}
							>
								{/* Default Wing Field */}
								<InputLabel
									label="Wing (Optional)"
									description="Location wing or section identifier"
									value={getCustomDetailValue("Wing")}
									onChange={(value) => updateCustomDetail("Wing", value)}
									placeholder="e.g., A, North, East"
									disabled={updateLocationMutation.isPending}
								/>

								{/* Default Zone Field */}
								<InputLabel
									label="Zone (Optional)"
									description="Location zone or area designation"
									value={getCustomDetailValue("Zone")}
									onChange={(value) => updateCustomDetail("Zone", value)}
									placeholder="e.g., Premium, General, VIP"
									disabled={updateLocationMutation.isPending}
								/>

								<div className="flex flex-col gap-2">
									<FieldSectionLabel
										label="Custom Details"
										description="Fill in optional fields to update the location custom details."
									/>
									{/* Custom Details - excluding Wing and Zone */}
									{customDetails.filter(
										(d) => d.key !== "Wing" && d.key !== "Zone",
									).length > 0 && (
										<div className="space-y-2">
											{customDetails
												.map((detail, index) => ({ detail, index }))
												.filter(
													({ detail }) =>
														detail.key !== "Wing" && detail.key !== "Zone",
												)
												.map(({ detail, index }) => (
													<div
														key={index}
														className="space-y-2 border bg-muted p-2"
													>
														<div className="flex items-center justify-between">
															<div className="grid flex-1 grid-cols-2 gap-2">
																<div className="font-medium text-xs">Title</div>
																<div className="font-medium text-xs">Value</div>
															</div>
															<div className="w-9" />{" "}
															{/* Spacer for delete button */}
														</div>
														<div className="flex items-center gap-2">
															<div className="grid flex-1 grid-cols-2 gap-2">
																<Input
																	placeholder="e.g., Section"
																	value={detail.key}
																	onChange={(e) => {
																		const newDetails = [...customDetails];
																		newDetails[index].key = e.target.value;
																		setCustomDetails(newDetails);
																	}}
																	className="rounded-none bg-white py-5 text-sm"
																/>
																<Input
																	placeholder="e.g., B"
																	value={detail.value}
																	onChange={(e) => {
																		const newDetails = [...customDetails];
																		newDetails[index].value = e.target.value;
																		setCustomDetails(newDetails);
																	}}
																	className="rounded-none bg-white py-5 text-sm"
																/>
															</div>
															<Button
																type="button"
																size="icon"
																variant="destructive"
																onClick={() => {
																	setCustomDetails(
																		customDetails.filter(
																			(_, i) => i !== index,
																		),
																	);
																}}
																className="rounded-none"
															>
																<X className="size-3" />
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
										onClick={() =>
											setCustomDetails([
												...customDetails,
												{ key: "", value: "" },
											])
										}
										className="mt-2 w-full rounded-none py-6 text-xs md:py-2"
									>
										<Plus className="mr-1 size-3" />
										Add Custom Detail
									</Button>
								</div>
							</FormGroupContainer>
						</div>

						<div className="mt-6 flex flex-col-reverse justify-end gap-2 sm:flex-row">
							<Button
								type="button"
								variant="outline"
								onClick={() => {
									closeDialog();
									if (onClose) onClose();
								}}
								disabled={updateLocationMutation.isPending}
								className="w-full rounded-none py-6 sm:w-auto md:py-4"
							>
								Cancel
							</Button>
							<Button
								type="submit"
								disabled={updateLocationMutation.isPending}
								className="w-full rounded-none py-6 sm:w-auto md:py-4"
							>
								{updateLocationMutation.isPending
									? "Updating..."
									: "Update Location"}
							</Button>
						</div>
					</FieldSet>
				</form>
			</section>
		</div>
	);
}