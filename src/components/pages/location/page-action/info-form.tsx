"use client";

import { useForm } from "@tanstack/react-form";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useParams } from "next/navigation";
import { useId } from "react";
import { toast } from "sonner";
import * as z from "zod";
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
import { createLocation } from "@/lib/api/event/location";

const formSchema = z.object({
	name: z.string().min(1, "Name is required"),
	scanLimit: z.number().min(1, "Scan limit is required"),
});

interface InfoFormProps {
	onClose?: () => void;
}

export default function InfoForm({ onClose }: InfoFormProps) {
	const formId = useId();
	const sectionId = useId();
	const params = useParams();
	const eventId = params.event_id as string;
	const { closeDialog } = useDialog();
	const queryClient = useQueryClient();

	// Create location mutation
	const createLocationMutation = useMutation({
		mutationFn: async (values: { name: string; scanLimit: number }) => {
			return await createLocation({
				eventId,
				name: values.name,
				scanLimit: values.scanLimit,
			});
		},
		onSuccess: () => {
			toast.success("Location created successfully");
			// Invalidate and refetch locations
			queryClient.invalidateQueries({
				queryKey: ["event", eventId, "locations"],
			});
			// Close dialog
			closeDialog();
			if (onClose) onClose();
		},
		onError: (error: Error) => {
			toast.error(`Failed to create location: ${error.message}`);
		},
	});

	const form = useForm({
		defaultValues: {
			name: "",
			scanLimit: 1,
		},
		validators: {
			onSubmit: formSchema,
		},
		onSubmit: async ({ value }) => {
			await createLocationMutation.mutateAsync(value);
		},
	});

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
							disabled={createLocationMutation.isPending}
						>
							Cancel
						</Button>
						<Button type="submit" disabled={createLocationMutation.isPending}>
							{createLocationMutation.isPending
								? "Creating..."
								: "Create Location"}
						</Button>
					</div>
				</FieldSet>
			</form>
		</section>
	);
}
