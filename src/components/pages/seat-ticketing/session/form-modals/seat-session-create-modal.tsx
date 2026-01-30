"use client";

import { useForm } from "@tanstack/react-form";
import { Calendar } from "lucide-react";
import { useParams } from "next/navigation";
import { useId } from "react";
import { z } from "zod";
import DateTimePickerField from "@/components/admin-ui/form/date-time-picker";
import { FormGroupContainer } from "@/components/admin-ui/form/form-group-container";
import { InputLabel } from "@/components/admin-ui/form/input-label";
import { SelectLabel } from "@/components/admin-ui/form/select-label";
import { Button } from "@/components/ui/button";
import { FieldSet } from "@/components/ui/field";
import { useDialog } from "@/hooks/use-dialog";
import { useSeatSessionMutation } from "@/hooks/seat-ticketing/use-session-mutation";
import { SESSION_STATUS, SESSION_STATUS_OPTIONS, type SessionStatus } from "../utils";

const formSchema = z
	.object({
		name: z.string().min(1, "Session name is required"),
		status: z.enum([
			SESSION_STATUS.DRAFT,
			SESSION_STATUS.PUBLISHED,
			SESSION_STATUS.CANCELLED,
		]),
		location: z.string(),
		startDate: z.date({ required_error: "Start date is required" }),
		endDate: z.date({ required_error: "End date is required" }),
	})
	.refine(
		(data) => {
			return data.endDate >= data.startDate;
		},
		{
			message: "End date must be after start date",
			path: ["endDate"],
		},
	);

export default function SeatSessionCreateModal() {
	const formId = useId();
	const sectionId = useId();
	const { closeDialog } = useDialog();
	const params = useParams();
	const eventId = params.event_id as string;

	const { createMutation } = useSeatSessionMutation({
		queryKey: ["seat-ticketing", "sessions", eventId],
	});

	const form = useForm({
		defaultValues: {
			name: "",
			status: SESSION_STATUS.DRAFT as SessionStatus,
			location: "",
			startDate: undefined as Date | undefined,
			endDate: undefined as Date | undefined,
		},
		validators: {
			onSubmit: formSchema,
		},
		onSubmit: async ({ value }) => {
			await createMutation.mutateAsync({
				event_id: Number(eventId),
				name: value.name.trim(),
				status: value.status,
				location: value.location?.trim() || null,
				start_datetime: value.startDate?.toISOString() ?? null,
				end_datetime: value.endDate?.toISOString() ?? null,
			});
		},
	});

	return (
		<section id={sectionId} className="w-full px-6">
			<form
				id={formId}
				onSubmit={(e) => {
					e.preventDefault();
					e.stopPropagation();
					form.handleSubmit();
				}}
			>
				<FieldSet>
					<FormGroupContainer
						title={{
							icon: Calendar,
							label: "Session Details",
							description: "Provide session details and schedule.",
						}}
					>
					<form.Field name="name">
							{(field) => {
								const isInvalid =
									field.state.meta.isTouched && !field.state.meta.isValid;
								return (
									<InputLabel
										label="Session Name"
										htmlFor={field.name}
										value={field.state.value}
										onChange={field.handleChange}
										onBlur={field.handleBlur}
										errors={field.state.meta.errors}
										isInvalid={isInvalid}
										placeholder="VIP Session"
										disabled={createMutation.isPending}
										required
									/>
								);
							}}
					</form.Field>

					<form.Field name="status">
						{(field) => {
							const isInvalid =
								field.state.meta.isTouched && !field.state.meta.isValid;
							return (
								<SelectLabel
									label="Session Status"
									htmlFor={field.name}
									value={field.state.value}
									onChange={(value) =>
										field.handleChange(value as SessionStatus)
									}
									onBlur={field.handleBlur}
									options={SESSION_STATUS_OPTIONS}
									errors={field.state.meta.errors}
									isInvalid={isInvalid}
									placeholder="Select status"
									disabled={createMutation.isPending}
									required
								/>
							);
						}}
					</form.Field>

						<form.Field name="location">
							{(field) => (
								<InputLabel
									label="Location"
									htmlFor={field.name}
									value={field.state.value || ""}
									onChange={field.handleChange}
									placeholder="Hall A"
									disabled={createMutation.isPending}
								/>
							)}
						</form.Field>

						<div className="grid grid-cols-1 gap-4 md:grid-cols-2">
							<form.Field name="startDate">
								{(field) => {
									const isInvalid =
										field.state.meta.isTouched &&
										!field.state.meta.isValid;
									return (
										<DateTimePickerField
											label="Start Date"
											htmlFor={field.name}
											value={field.state.value}
											onChange={(date) =>
												field.handleChange(date || undefined)
											}
											errors={field.state.meta.errors.map((error) => ({
												message:
													typeof error === "string"
														? error
														: String(error),
											}))}
											isInvalid={isInvalid}
											placeholder="Select start"
											disabled={createMutation.isPending}
										/>
									);
								}}
							</form.Field>

							<form.Field name="endDate">
								{(field) => {
									const isInvalid =
										field.state.meta.isTouched &&
										!field.state.meta.isValid;
									return (
										<DateTimePickerField
											label="End Date"
											htmlFor={field.name}
											value={field.state.value}
											onChange={(date) =>
												field.handleChange(date || undefined)
											}
											errors={field.state.meta.errors.map((error) => ({
												message:
													typeof error === "string"
														? error
														: String(error),
											}))}
											isInvalid={isInvalid}
											placeholder="Select end"
											disabled={createMutation.isPending}
										/>
									);
								}}
							</form.Field>
						</div>
					</FormGroupContainer>

					<div className="mt-6 flex flex-col-reverse justify-end gap-2 sm:flex-row">
						<Button
							type="button"
							variant="outline"
							onClick={closeDialog}
							disabled={createMutation.isPending}
							className="w-full rounded-none py-6 sm:w-auto md:py-4"
						>
							Cancel
						</Button>
						<Button
							type="submit"
							disabled={createMutation.isPending}
							className="w-full rounded-none py-6 sm:w-auto md:py-4"
						>
							{createMutation.isPending ? "Creating..." : "Create Session"}
						</Button>
					</div>
				</FieldSet>
			</form>
		</section>
	);
}