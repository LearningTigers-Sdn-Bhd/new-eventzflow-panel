"use client";

import { useForm } from "@tanstack/react-form";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useParams } from "next/navigation";
import React, { useId } from "react";
import { toast } from "sonner";
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
	FieldLegend,
	FieldSeparator,
	FieldSet,
} from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { NumberInput } from "@/components/ui/number-input";
import { useDialog } from "@/hooks/use-dialog";
import { getLocationById, updateLocation } from "@/lib/api/event/location";

const formSchema = z.object({
	name: z.string().min(1, "Name is required"),
	scanLimit: z.number().min(1, "Scan limit is required"),
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

	// Fetch location data
	const { data: location, isLoading } = useQuery({
		queryKey: ["event", eventId, "location", locationId],
		queryFn: () => getLocationById({ eventId, locationId }),
	});

	// Update location mutation
	const updateLocationMutation = useMutation({
		mutationFn: async (values: { name: string; scanLimit: number }) => {
			return await updateLocation({
				eventId,
				locationId,
				name: values.name,
				scanLimit: values.scanLimit,
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
			scanLimit: location?.scanLimit || 0,
		},
		validators: {
			onSubmit: formSchema,
		},
		onSubmit: async ({ value }) => {
			await updateLocationMutation.mutateAsync(value);
		},
	});

	// Update form values when location data is loaded
	React.useEffect(() => {
		if (location) {
			form.setFieldValue("name", location.name);
			form.setFieldValue("scanLimit", location.scanLimit);
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
			className="w-full"
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
					<FieldLegend className="font-bold text-xl!">
						Location ID: {locationId}
					</FieldLegend>
					<FieldDescription>Manage your location information.</FieldDescription>
					<FieldSeparator />
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
						<form.Field name="scanLimit">
							{(field) => {
								const isInvalid =
									field.state.meta.isTouched && !field.state.meta.isValid;
								return (
									<Field data-invalid={isInvalid}>
										<FieldContent>
											<FieldLabel htmlFor={field.name}>Scan Limit</FieldLabel>
											<FieldDescription>
												Maximum number of scans allowed for this location
											</FieldDescription>
										</FieldContent>
										<NumberInput
											value={field.state.value}
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
				</FieldGroup>
				<div className="mt-4 flex justify-end gap-2 md:mt-6">
					<Button
						type="button"
						variant="outline"
						onClick={() => {
							closeDialog();
							if (onClose) onClose();
						}}
						disabled={updateLocationMutation.isPending}
					>
						Cancel
					</Button>
					<Button type="submit" disabled={updateLocationMutation.isPending}>
						{updateLocationMutation.isPending ? "Updating..." : "Submit"}
					</Button>
				</div>
				</FieldSet>
			</form>
		</section>
	);
}
