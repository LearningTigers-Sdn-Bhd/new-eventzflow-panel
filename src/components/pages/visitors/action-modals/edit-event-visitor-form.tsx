"use client";

import { useForm } from "@tanstack/react-form";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { FileText, User } from "lucide-react";
import { useParams } from "next/navigation";
import { useEffect, useId, useState } from "react";
import { toast } from "sonner";
import { FormGroupContainer } from "@/components/admin-ui/form/form-group-container";
import { InputLabel } from "@/components/admin-ui/form/input-label";
import { NumberInputLabel } from "@/components/admin-ui/form/number-input-label";
import { SelectLabel } from "@/components/admin-ui/form/select-label";
import { EmptyState } from "@/components/data-state";
import { Button } from "@/components/ui/button";
import { FieldGroup, FieldSet } from "@/components/ui/field";
import { useDialog } from "@/hooks/use-dialog";
import { getEventById } from "@/lib/api/event";
import {
	type UpdateVisitorRequest,
	updateVisitor,
	type Visitor,
} from "@/lib/api/visitor";

interface EditVisitorFormProps {
	visitor: Visitor;
}

export default function EditEventVisitorForm({
	visitor,
}: EditVisitorFormProps) {
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

	// Custom fields state
	const [customFields, setCustomFields] = useState<
		Array<{ labelKey: string; labelName: string; value: string }>
	>([]);

	// Fetch event details to get labels_data
	const { data: eventData } = useQuery({
		queryKey: ["event", eventId],
		queryFn: () => getEventById(String(eventId)),
		enabled: !!eventId,
	});

	// Initialize custom fields from event labels_data and populate with visitor data
	useEffect(() => {
		if (
			eventData?.labels_data &&
			Object.keys(eventData.labels_data).length > 0
		) {
			const fields = Object.entries(eventData.labels_data).map(
				([key, labelNameValue]) => {
					const currentLabelName = labelNameValue as string;
					const existingValue = visitor.custom_fields_data?.[key] || "";

					return {
						labelKey: key,
						labelName: currentLabelName,
						value: existingValue,
					};
				},
			);
			setCustomFields(fields);
		}
	}, [eventData, visitor.custom_fields_data]);

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

	const form = useForm({
		defaultValues: {
			full_name: visitor.full_name,
			email: visitor.email || "",
			phone: visitor.phone || "",
			gender: visitor.gender || "",
			age: visitor.age?.toString() || "",
		},
		onSubmit: async ({ value }) => {
			// Transform custom fields array to object
			const customFieldsData: Record<string, string> = {};
			customFields.forEach((field) => {
				// We include empty strings if they were cleared, or we can filter them out.
				// Based on edit-ticket, we might want to send them to update.
				// Based on create-visitor, it filters.
				// For update, usually sending empty string clears it.
				customFieldsData[field.labelKey] = field.value.trim();
			});

			await updateVisitorMutation.mutateAsync({
				full_name: value.full_name,
				email: value.email.trim() || undefined,
				phone: value.phone || undefined,
				gender: value.gender || undefined,
				age: value.age ? Number(value.age) : undefined,
				custom_fields_data:
					Object.keys(customFieldsData).length > 0
						? customFieldsData
						: undefined,
			});
		},
	});

	// Custom field handlers
	const updateCustomField = (labelKey: string, newValue: string) => {
		setCustomFields(
			customFields.map((field) =>
				field.labelKey === labelKey ? { ...field, value: newValue } : field,
			),
		);
	};

	return (
		<div className="h-full px-4 md:px-6">
			<form
				onSubmit={(e) => {
					e.preventDefault();
					form.handleSubmit();
				}}
				className="flex h-full flex-col justify-between gap-8"
			>
				<FieldSet className="grid grid-cols-1 gap-x-4 gap-y-8 md:grid-cols-2 md:gap-y-8">
					<FormGroupContainer
						title={{
							icon: User,
							label: "Visitor Information",
							description: "Edit the details of the visitor",
						}}
					>
						{/* Visitor Information Section */}
						<div className="grid grid-cols-1 gap-4">
							<form.Field
								name="full_name"
								validators={{
									onChange: ({ value }) => {
										if (!value.trim() || value.length < 2) {
											return "Name must be at least 2 characters";
										}
										return undefined;
									},
								}}
							>
								{(field) => {
									const isInvalid =
										field.state.meta.isTouched && !field.state.meta.isValid;
									return (
										<InputLabel
											label="Full Name"
											htmlFor={nameId}
											value={field.state.value}
											onChange={field.handleChange}
											onBlur={field.handleBlur}
											errors={field.state.meta.errors.map((error) => ({
												message: String(error),
											}))}
											isInvalid={isInvalid}
											placeholder="John Doe"
											disabled={updateVisitorMutation.isPending}
											required
										/>
									);
								}}
							</form.Field>

							<form.Field
								name="email"
								validators={{
									onChange: ({ value }) => {
										if (
											value.trim() &&
											!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)
										) {
											return "Please enter a valid email address";
										}
										return undefined;
									},
								}}
							>
								{(field) => {
									const isInvalid =
										field.state.meta.isTouched && !field.state.meta.isValid;
									return (
										<InputLabel
											label="Email Address"
											htmlFor={emailId}
											value={field.state.value}
											onChange={field.handleChange}
											onBlur={field.handleBlur}
											errors={field.state.meta.errors.map((error) => ({
												message: String(error),
											}))}
											isInvalid={isInvalid}
											placeholder="john.doe@example.com"
											disabled={updateVisitorMutation.isPending}
										/>
									);
								}}
							</form.Field>

							<form.Field name="phone">
								{(field) => (
									<InputLabel
										label="Phone Number"
										htmlFor={phoneId}
										value={field.state.value}
										onChange={field.handleChange}
										onBlur={field.handleBlur}
										placeholder="+1 234 567 8900"
										disabled={updateVisitorMutation.isPending}
									/>
								)}
							</form.Field>

							<div className="grid grid-cols-2 gap-4">
								<form.Field name="gender">
									{(field) => (
										<SelectLabel
											label="Gender"
											htmlFor={genderId}
											value={field.state.value}
											onChange={field.handleChange}
											disabled={updateVisitorMutation.isPending}
											placeholder="Select gender"
											options={[
												{ value: "male", label: "Male" },
												{ value: "female", label: "Female" },
												{ value: "other", label: "Other" },
												{
													value: "prefer_not_to_say",
													label: "Prefer not to say",
												},
											]}
										/>
									)}
								</form.Field>

								<form.Field name="age">
									{(field) => (
										<NumberInputLabel
											label="Age"
											htmlFor={ageId}
											value={Number(field.state.value)}
											onChange={(val) => field.handleChange(String(val))}
											placeholder="25"
											min={1}
											max={150}
											disabled={updateVisitorMutation.isPending}
										/>
									)}
								</form.Field>
							</div>
						</div>
					</FormGroupContainer>
					<FormGroupContainer
						title={{
							icon: FileText,
							label: "Additional Information",
							description:
								"Fill in the additional information set by the event organizer for the visitor",
						}}
					>
						{customFields.length > 0 ? (
							<div className="grid gap-4 md:grid-cols-3 2xl:grid-cols-5">
								{customFields.map((field) => (
									<InputLabel
										key={field.labelKey}
										label={field.labelName}
										value={field.value}
										onChange={(value) =>
											updateCustomField(field.labelKey, value)
										}
										placeholder={`Enter ${field.labelName.toLowerCase()}`}
										disabled={updateVisitorMutation.isPending}
									/>
								))}
							</div>
						) : (
							<EmptyState
								title="No custom labels"
								description="No custom labels have been configured for this event."
								icon={<FileText />}
								height="h-auto"
							/>
						)}
					</FormGroupContainer>
				</FieldSet>
				<FieldGroup className="flex flex-col justify-end gap-2 md:flex-row">
					<Button
						type="button"
						variant="outline"
						onClick={closeDialog}
						disabled={updateVisitorMutation.isPending}
						className="rounded-none py-6 md:py-4"
					>
						Cancel
					</Button>
					<form.Subscribe>
						{(state) => (
							<Button
								type="submit"
								disabled={
									!state.canSubmit ||
									state.isSubmitting ||
									updateVisitorMutation.isPending
								}
								className="rounded-none py-6 md:py-4"
							>
								{updateVisitorMutation.isPending
									? "Updating..."
									: "Update Visitor"}
							</Button>
						)}
					</form.Subscribe>
				</FieldGroup>
			</form>
		</div>
	);
}
