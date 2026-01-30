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
import type { SeatSessionRow } from "../seat-session-table-columns";
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

interface SeatSessionEditModalProps {
	session: SeatSessionRow;
}

export default function SeatSessionEditModal({
	session,
}: SeatSessionEditModalProps) {
	const formId = useId();
	const sectionId = useId();
	const { closeDialog } = useDialog();
	const params = useParams();
	const eventId = params.event_id as string;

	const { updateMutation } = useSeatSessionMutation({
		queryKey: ["seat-ticketing", "sessions", eventId],
	});

	const form = useForm({
		defaultValues: {
			name: session.name || "",
			status: (session.status as SessionStatus) ?? SESSION_STATUS.DRAFT,
			location: session.location || "",
			startDate: session.start_datetime
				? new Date(session.start_datetime)
				: undefined,
			endDate: session.end_datetime ? new Date(session.end_datetime) : undefined,
		},
		validators: {
			onSubmit: formSchema,
		},
		onSubmit: async ({ value }) => {
			await updateMutation.mutateAsync({
				sessionId: session.id,
				data: {
					name: value.name.trim(),
					status: value.status,
					location: value.location?.trim() || null,
					start_datetime: value.startDate?.toISOString() ?? null,
					end_datetime: value.endDate?.toISOString() ?? null,
				},
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
							description: "Update session details and schedule.",
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
										disabled={updateMutation.isPending}
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
									disabled={updateMutation.isPending}
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
									disabled={updateMutation.isPending}
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
											disabled={updateMutation.isPending}
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
											disabled={updateMutation.isPending}
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
							disabled={updateMutation.isPending}
							className="w-full rounded-none py-6 sm:w-auto md:py-4"
						>
							Cancel
						</Button>
						<Button
							type="submit"
							disabled={updateMutation.isPending}
							className="w-full rounded-none py-6 sm:w-auto md:py-4"
						>
							{updateMutation.isPending ? "Saving..." : "Save Changes"}
						</Button>
					</div>
				</FieldSet>
			</form>
		</section>
	);
}
