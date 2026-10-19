"use client";

import { useForm } from "@tanstack/react-form";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { AlertTriangle, Users } from "lucide-react";
import { useParams } from "next/navigation";
import { useId, useState } from "react";
import { toast } from "sonner";
import { FormGroupContainer } from "@/components/admin-ui/form/form-group-container";
import { InputLabel } from "@/components/admin-ui/form/input-label";
import { SelectLabel } from "@/components/admin-ui/form/select-label";
import { Button } from "@/components/ui/button";
import { FieldSet } from "@/components/ui/field";
import { useConfirmDialog } from "@/hooks/use-confirm-dialog";
import { useDialog } from "@/hooks/use-dialog";
import { createGuestPasses } from "@/lib/api/ticket";
import { TicketTypeFieldSection } from "./ticket-type-field-section";

// Preset role categories for guest passes. "Other" reveals a free-text input
// so staff can record any role that isn't listed.
const GUEST_PASS_ROLES = [
	{ value: "Sponsor Guest", label: "Sponsor Guest" },
	{ value: "Media", label: "Media" },
	{ value: "VIP", label: "VIP" },
	{ value: "Partner", label: "Partner" },
	{ value: "Crew", label: "Crew" },
	{ value: "Exhibitor", label: "Exhibitor" },
	{ value: "Speaker", label: "Speaker" },
	{ value: "Other", label: "Other (custom)" },
];
const CUSTOM_ROLE = "Other";

/**
 * Guest passes: creates N placeholder tickets named "<label> Pax i/N" for
 * groups whose individual names aren't known (or needed) — sponsor
 * entitlements, media crews, VIP allocations, etc. Passes are paid/purchased
 * and batched; renaming a pass later is optional, never required.
 */
export default function GuestPassesForm() {
	const { closeDialog } = useDialog();
	const { openConfirm } = useConfirmDialog();
	const params = useParams();
	const eventId = params.event_id as string;
	const queryClient = useQueryClient();

	const labelId = useId();
	const quantityId = useId();
	const roleId = useId();
	const customRoleId = useId();
	const emailId = useId();
	const phoneId = useId();

	// Custom role text, kept outside the form since it only applies when the
	// role dropdown is set to "Other".
	const [customRole, setCustomRole] = useState("");

	const createGuestPassesMutation = useMutation({
		mutationFn: createGuestPasses,
		onSuccess: (result) => {
			toast.success(
				`Created ${result.quantity} guest passes for "${result.label}"`,
			);
			queryClient.invalidateQueries({
				queryKey: ["event", eventId, "tickets"],
			});
			closeDialog();
		},
		onError: (error: Error) => {
			toast.error(error.message || "Failed to create guest passes");
		},
	});

	const form = useForm({
		defaultValues: {
			label: "",
			quantity: "1",
			ticket_type_id: null as number | null,
			role: "Sponsor Guest",
			attendee_email: "",
			attendee_phone: "",
		},
		onSubmit: async ({ value }) => {
			if (!value.ticket_type_id) {
				toast.error("Please select a ticket type");
				return;
			}

			const quantity = Math.max(1, Number.parseInt(value.quantity, 10) || 1);

			// Above 50, confirm before firing — large batches are usually
			// intentional (big sponsor/media allocations) but worth a second look.
			if (quantity > 50) {
				openConfirm({
					title: "Create many guest passes?",
					message: `You're about to create ${quantity} guest passes for "${value.label.trim()}". This creates ${quantity} separate tickets. Continue?`,
					confirmLabel: `Create ${quantity} Passes`,
					cancelLabel: "Back",
					type: "warning",
					icon: "alert",
					onConfirm: () => submitGuestPasses(value),
				});
				return;
			}

			await submitGuestPasses(value);
		},
	});

	async function submitGuestPasses(value: {
		label: string;
		quantity: string;
		ticket_type_id: number | null;
		role: string;
		attendee_email: string;
		attendee_phone: string;
	}) {
		if (!value.ticket_type_id) {
			return;
		}

		const role = value.role === CUSTOM_ROLE ? customRole.trim() : value.role;

		await createGuestPassesMutation.mutateAsync({
			eventId,
			label: value.label.trim(),
			quantity: Math.max(1, Number.parseInt(value.quantity, 10) || 1),
			ticket_type_id: value.ticket_type_id,
			attendee_email: value.attendee_email.trim() || null,
			attendee_phone: value.attendee_phone.trim() || undefined,
			role: role || undefined,
		});
	}

	return (
		<div className="h-full px-4 md:px-6">
			<form
				onSubmit={(e) => {
					e.preventDefault();
					form.handleSubmit();
				}}
				className="flex h-full flex-col justify-between gap-8"
			>
				<FieldSet className="grid grid-cols-1 gap-x-4 gap-y-8 md:gap-y-8">
					<FormGroupContainer
						title={{
							icon: Users,
							label: "Guest Passes",
							description:
								"Placeholder passes for groups whose individual names aren't known or needed",
						}}
					>
						<div className="grid grid-cols-1 gap-4">
							<form.Field
								name="label"
								validators={{
									onChange: ({ value }) => {
										if (!value.trim() || value.trim().length < 2) {
											return "Label must be at least 2 characters";
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
											label="Guest Label"
											htmlFor={labelId}
											value={field.state.value}
											onChange={field.handleChange}
											onBlur={field.handleBlur}
											errors={field.state.meta.errors.map((error) => ({
												message: String(error),
											}))}
											isInvalid={isInvalid}
											placeholder="e.g. Acme Corp"
											description="Passes are named '<label> Pax 1/N', '<label> Pax 2/N', …"
											disabled={createGuestPassesMutation.isPending}
											required
										/>
									);
								}}
							</form.Field>

							<div className="grid grid-cols-2 gap-4">
								<form.Field
									name="quantity"
									validators={{
										onChange: ({ value }) => {
											const parsed = Number.parseInt(value, 10);
											if (!Number.isFinite(parsed) || parsed < 1) {
												return "Quantity must be at least 1";
											}
											if (parsed > 500) {
												return "Quantity cannot exceed 500";
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
												label="Number of Passes"
												htmlFor={quantityId}
												inputType="number"
												value={field.state.value}
												onChange={field.handleChange}
												onBlur={field.handleBlur}
												min={1}
												max={500}
												errors={field.state.meta.errors.map((error) => ({
													message: String(error),
												}))}
												isInvalid={isInvalid}
												disabled={createGuestPassesMutation.isPending}
												required
											/>
										);
									}}
								</form.Field>

								<form.Subscribe selector={(state) => state.values.role}>
									{(role) => (
										<>
											<form.Field name="role">
												{(field) => (
													<SelectLabel
														label="Role"
														htmlFor={roleId}
														value={field.state.value}
														onChange={field.handleChange}
														onBlur={field.handleBlur}
														options={GUEST_PASS_ROLES}
														disabled={createGuestPassesMutation.isPending}
													/>
												)}
											</form.Field>

											{role === CUSTOM_ROLE && (
												<InputLabel
													label="Custom Role"
													htmlFor={customRoleId}
													value={customRole}
													onChange={setCustomRole}
													placeholder="e.g. Volunteer"
													disabled={createGuestPassesMutation.isPending}
													required
												/>
											)}
										</>
									)}
								</form.Subscribe>
							</div>

							<form.Subscribe selector={(state) => state.values.quantity}>
								{(quantity) => {
									const n = Number.parseInt(quantity, 10);
									if (!Number.isFinite(n) || n <= 50) {
										return null;
									}
									return (
										<div className="flex items-center gap-2 border-l-4 border-l-amber-500 bg-amber-50 px-3 py-2.5 dark:bg-amber-950/30">
											<AlertTriangle className="h-4 w-4 shrink-0 text-amber-600 dark:text-amber-400" />
											<span className="text-amber-900 text-sm dark:text-amber-100">
												You're creating <strong>{n}</strong> passes at once —
												we'll ask you to confirm before they're created.
											</span>
										</div>
									);
								}}
							</form.Subscribe>

							<div className="grid grid-cols-2 gap-4">
								<form.Field
									name="attendee_email"
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
												label="Contact Email (optional)"
												htmlFor={emailId}
												value={field.state.value}
												onChange={field.handleChange}
												onBlur={field.handleBlur}
												errors={field.state.meta.errors.map((error) => ({
													message: String(error),
												}))}
												isInvalid={isInvalid}
												placeholder="contact@example.com"
												description="Shared by all passes in this batch"
												disabled={createGuestPassesMutation.isPending}
											/>
										);
									}}
								</form.Field>

								<form.Field name="attendee_phone">
									{(field) => (
										<InputLabel
											label="Contact Phone (optional)"
											htmlFor={phoneId}
											value={field.state.value}
											onChange={field.handleChange}
											onBlur={field.handleBlur}
											placeholder="+60 12 345 6789"
											disabled={createGuestPassesMutation.isPending}
										/>
									)}
								</form.Field>
							</div>
						</div>

						<form.Field
							name="ticket_type_id"
							validators={{
								onChange: ({ value }) => {
									if (!value || value <= 0) {
										return "Please select a ticket type";
									}
									return undefined;
								},
							}}
						>
							{(field) => (
								<TicketTypeFieldSection
									field={field}
									eventId={eventId}
									disabled={createGuestPassesMutation.isPending}
								/>
							)}
						</form.Field>
					</FormGroupContainer>

					<div className="flex justify-end gap-2">
						<Button
							type="button"
							variant="outline"
							onClick={closeDialog}
							disabled={createGuestPassesMutation.isPending}
							className="w-auto rounded-none px-6 py-6 md:py-4"
						>
							Cancel
						</Button>
						<form.Subscribe
							selector={(state) => [state.canSubmit, state.isSubmitting]}
						>
							{([canSubmit, isSubmitting]) => (
								<Button
									type="submit"
									disabled={
										!canSubmit ||
										isSubmitting ||
										createGuestPassesMutation.isPending
									}
									className="w-auto rounded-none px-6 py-6 md:py-4"
								>
									{createGuestPassesMutation.isPending
										? "Creating..."
										: "Create Guest Passes"}
								</Button>
							)}
						</form.Subscribe>
					</div>
				</FieldSet>
			</form>
		</div>
	);
}
