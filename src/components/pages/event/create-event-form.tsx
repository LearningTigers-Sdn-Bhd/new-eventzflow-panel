"use client";

import { useMutation, useQuery } from "@tanstack/react-query";
import { useId, useState } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { DateTimePicker } from "@/components/ui/datetime-picker";
import {
	Field,
	FieldError,
	FieldGroup,
	FieldLabel,
	FieldSeparator,
	FieldSet,
} from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";
import { useAuth } from "@/hooks/use-auth";
import { createEvent } from "@/lib/api/event";
import { getTeamMembers } from "@/lib/api/team";
import { queryClient } from "@/utils/rest-api";

interface CreateEventFormProps {
	onClose: () => void;
}

export default function CreateEventForm({ onClose }: CreateEventFormProps) {
	const { user } = useAuth();
	const titleId = useId();
	const visibilityId = useId();
	const useTicketId = useId();
	const useExhibitorKitId = useId();
	const allowPrintingServicesId = useId();
	const statusId = useId();
	const eventAdminId = useId();
	const descriptionId = useId();
	const startDateId = useId();
	const endDateId = useId();

	const [formData, setFormData] = useState({
		title: "",
		visibility: true,
		use_ticket: true,
		use_exhibitor_kit: false,
		allow_contractor_printing_services: false,
		status: "draft" as "draft" | "published" | "cancelled",
		event_admin_id: undefined as string | undefined,
		description: "",
		start_date: undefined as Date | undefined,
		end_date: undefined as Date | undefined,
	});
	const [errors, setErrors] = useState<Record<string, string>>({});

	// Only org_owner can assign event admin
	const canAssignEventAdmin = user?.role === "org_owner";

	// Fetch team members for event admin selection (only members with role "member")
	// Only fetch if user is org_owner
	const { data: teamMembers = [], isLoading: isLoadingUsers } = useQuery({
		queryKey: ["team-members"],
		queryFn: getTeamMembers,
		enabled: canAssignEventAdmin,
	});

	// Filter only users with role "member" and active status
	const memberUsers = teamMembers.filter(
		(member) => member.role === "member" && member.status === "active",
	);

	const createEventMutation = useMutation({
		mutationFn: createEvent,
		onSuccess: () => {
			toast.success("Event created successfully!");
			// Invalidate and refetch events query
			queryClient.invalidateQueries({
				queryKey: ["events"],
			});
			onClose();
		},
		onError: (error: Error) => {
			toast.error(error.message || "Failed to create event");
		},
	});

	const handleSubmit = async (e: React.FormEvent) => {
		e.preventDefault();
		const newErrors: Record<string, string> = {};

		// Validation
		if (!formData.title || formData.title.trim().length < 3) {
			newErrors.title = "Event name must be at least 3 characters";
		}

		if (!formData.start_date) {
			newErrors.start_date = "Start date is required";
		}

		if (!formData.end_date) {
			newErrors.end_date = "End date is required";
		}

		if (formData.start_date && formData.end_date) {
			if (formData.end_date < formData.start_date) {
				newErrors.end_date = "End date must be after start date";
			}
		}

		if (Object.keys(newErrors).length > 0) {
			setErrors(newErrors);
			return;
		}

		try {
			const payload: {
				title: string;
				visibility: boolean;
				use_ticket: boolean;
				use_exhibitor_kit: boolean;
				allow_contractor_printing_services: boolean;
				status: "draft" | "published" | "cancelled";
				event_admin_id?: number;
				description?: string;
				start_date: string;
				end_date: string;
				multiple_scans: boolean;
			} = {
				title: formData.title.trim(),
				visibility: formData.visibility ?? true,
				use_ticket: formData.use_ticket ?? true,
				use_exhibitor_kit: formData.use_exhibitor_kit ?? false,
				allow_contractor_printing_services: formData.allow_contractor_printing_services ?? false,
				status: formData.status ?? "draft",
				description: formData.description.trim() || undefined,
				start_date: formData.start_date?.toISOString() || "",
				end_date: formData.end_date?.toISOString() || "",
				multiple_scans: false,
			};

			if (formData.event_admin_id) {
				// Convert string ID to number for backend API
				payload.event_admin_id = Number(formData.event_admin_id);
			}

			await createEventMutation.mutateAsync(payload);
		} catch (_error) {
			// Error is handled by onError callback
		}
	};

	const handleChange = (
		field: keyof typeof formData,
		value: string | Date | number | boolean | undefined,
	) => {
		setFormData((prev) => ({ ...prev, [field]: value }));
		// Clear error when user starts typing
		if (errors[field]) {
			setErrors((prev) => {
				const newErrors = { ...prev };
				delete newErrors[field];
				return newErrors;
			});
		}
	};

	return (
		<div className="w-full">
			<form onSubmit={handleSubmit}>
				<FieldSet>
					<FieldSeparator />
					<FieldGroup>
						{/* Row 1: Event Title (Full Width) */}
						<Field orientation="vertical">
							<FieldLabel htmlFor={titleId}>Event Title *</FieldLabel>
							{errors.title && <FieldError>{errors.title}</FieldError>}
							<Input
								id={titleId}
								placeholder="Enter event title"
								value={formData.title}
								onChange={(e) => handleChange("title", e.target.value)}
								required
								disabled={createEventMutation.isPending}
								autoFocus
							/>
						</Field>

						{/* Row 2: All Toggles in one row - dynamically adjust columns based on ticketing and exhibitor kit state */}
						<div className={`grid grid-cols-1 gap-4 ${
							!formData.use_ticket 
								? 'md:grid-cols-2' 
								: formData.use_exhibitor_kit 
									? 'md:grid-cols-4' 
									: 'md:grid-cols-3'
						}`}>
							{/* Visibility */}
							<Field orientation="vertical">
								<FieldLabel htmlFor={visibilityId}>Visibility</FieldLabel>
								<div className="flex h-9 items-center rounded-lg border border-primary/50 p-4">
									<Switch
										id={visibilityId}
										checked={formData.visibility}
										onCheckedChange={(checked) =>
											handleChange("visibility", checked)
										}
										disabled={createEventMutation.isPending}
									/>
									<span className="ml-2 text-muted-foreground text-sm">
										{formData.visibility ? "Visible" : "Hidden"}
									</span>
								</div>
							</Field>

							{/* Ticketing System */}
							<Field orientation="vertical">
								<FieldLabel htmlFor={useTicketId}>Use Ticketing System</FieldLabel>
								<div className="flex h-9 items-center rounded-lg border border-primary/50 p-4">
									<Switch
										id={useTicketId}
										checked={formData.use_ticket}
										onCheckedChange={(checked) => {
											handleChange("use_ticket", checked);
											// Reset exhibitor kit and printing services when ticketing is disabled
											if (!checked) {
												handleChange("use_exhibitor_kit", false);
												handleChange("allow_contractor_printing_services", false);
											}
										}}
										disabled={createEventMutation.isPending}
									/>
									<span className="ml-2 text-muted-foreground text-sm">
										{formData.use_ticket ? "Enabled" : "Disabled"}
									</span>
								</div>
							</Field>

							{/* Exhibitor Kit - only show when ticketing system is enabled */}
							{formData.use_ticket && (
								<Field orientation="vertical">
									<FieldLabel htmlFor={useExhibitorKitId}>Use Exhibitor Kit</FieldLabel>
									<div className="flex h-9 items-center rounded-lg border border-primary/50 p-4">
										<Switch
											id={useExhibitorKitId}
											checked={formData.use_exhibitor_kit}
											onCheckedChange={(checked) => {
												handleChange("use_exhibitor_kit", checked);
												// Reset printing services when exhibitor kit is disabled
												if (!checked) {
													handleChange("allow_contractor_printing_services", false);
												}
											}}
											disabled={createEventMutation.isPending}
										/>
										<span className="ml-2 text-muted-foreground text-sm">
											{formData.use_exhibitor_kit ? "Enabled" : "Disabled"}
										</span>
									</div>
								</Field>
							)}

							{/* Use Printing Services - only show when exhibitor kit is enabled */}
							{formData.use_exhibitor_kit && (
								<Field orientation="vertical">
									<FieldLabel htmlFor={allowPrintingServicesId}>
										Use Printing Services
									</FieldLabel>
									<div className="flex h-9 items-center rounded-lg border border-primary/50 p-4">
										<Switch
											id={allowPrintingServicesId}
											checked={formData.allow_contractor_printing_services}
											onCheckedChange={(checked) =>
												handleChange("allow_contractor_printing_services", checked)
											}
											disabled={createEventMutation.isPending}
										/>
										<span className="ml-2 text-muted-foreground text-sm">
											{formData.allow_contractor_printing_services ? "Enabled" : "Disabled"}
										</span>
									</div>
								</Field>
							)}
						</div>

						{/* Row 3: Event Status and Event Admin */}
						{canAssignEventAdmin ? (
							<div className="grid grid-cols-1 gap-4 md:grid-cols-2">
								{/* Event Status */}
								<Field orientation="vertical">
									<FieldLabel htmlFor={statusId}>Event Status *</FieldLabel>
									{errors.status && <FieldError>{errors.status}</FieldError>}
									<Select
										value={formData.status}
										onValueChange={(value) =>
											handleChange(
												"status",
												value as "draft" | "published" | "cancelled",
											)
										}
										disabled={createEventMutation.isPending}
									>
										<SelectTrigger id={statusId} className="w-full">
											<SelectValue placeholder="Select event status" />
										</SelectTrigger>
										<SelectContent>
											<SelectItem value="draft">Draft</SelectItem>
											<SelectItem value="published">Published</SelectItem>
											<SelectItem value="cancelled">Cancelled</SelectItem>
										</SelectContent>
									</Select>
								</Field>

								{/* Event Admin - Only visible to org_owner */}
								<Field orientation="vertical">
									<FieldLabel htmlFor={eventAdminId}>Event Admin</FieldLabel>
									{errors.event_admin_id && (
										<FieldError>{errors.event_admin_id}</FieldError>
									)}
									<Select
										value={formData.event_admin_id || ""}
										onValueChange={(value) =>
											handleChange("event_admin_id", value || undefined)
										}
										disabled={createEventMutation.isPending || isLoadingUsers}
									>
										<SelectTrigger id={eventAdminId} className="w-full">
											<SelectValue
												placeholder={
													isLoadingUsers
														? "Loading users..."
														: "Select event admin (optional)"
												}
											/>
										</SelectTrigger>
										<SelectContent>
											{memberUsers.length === 0 ? (
												<div className="px-2 py-1.5 text-muted-foreground text-sm">
													{isLoadingUsers
														? "Loading members..."
														: "No active members available"}
												</div>
											) : (
												memberUsers.map((user) => (
													<SelectItem key={user.id} value={user.id}>
														{user.full_name} ({user.email})
													</SelectItem>
												))
											)}
										</SelectContent>
									</Select>
								</Field>
							</div>
						) : (
							/* Event Status - Full width for organizers */
							<Field orientation="vertical">
								<FieldLabel htmlFor={statusId}>Event Status *</FieldLabel>
								{errors.status && <FieldError>{errors.status}</FieldError>}
								<Select
									value={formData.status}
									onValueChange={(value) =>
										handleChange(
											"status",
											value as "draft" | "published" | "cancelled",
										)
									}
									disabled={createEventMutation.isPending}
								>
									<SelectTrigger id={statusId} className="w-full">
										<SelectValue placeholder="Select event status" />
									</SelectTrigger>
									<SelectContent>
										<SelectItem value="draft">Draft</SelectItem>
										<SelectItem value="published">Published</SelectItem>
										<SelectItem value="cancelled">Cancelled</SelectItem>
									</SelectContent>
								</Select>
							</Field>
						)}

						{/* Row 4: Start and End Date */}
						<div className="grid grid-cols-1 gap-4 md:grid-cols-2">
							{/* Start Date */}
							<Field orientation="vertical">
								<FieldLabel htmlFor={startDateId}>Start Date *</FieldLabel>
								{errors.start_date && (
									<FieldError>{errors.start_date}</FieldError>
								)}
								<DateTimePicker
									date={formData.start_date}
									onDateChange={(date) => handleChange("start_date", date)}
									disabled={createEventMutation.isPending}
									placeholder="Pick start date and time"
								/>
							</Field>

							{/* End Date */}
							<Field orientation="vertical">
								<FieldLabel htmlFor={endDateId}>End Date *</FieldLabel>
								{errors.end_date && <FieldError>{errors.end_date}</FieldError>}
								<DateTimePicker
									date={formData.end_date}
									onDateChange={(date) => handleChange("end_date", date)}
									disabled={createEventMutation.isPending}
									placeholder="Pick end date and time"
								/>
							</Field>
						</div>

						{/* Event Description */}
						<Field orientation="vertical">
							<FieldLabel htmlFor={descriptionId}>Description</FieldLabel>
							<Textarea
								id={descriptionId}
								placeholder="Enter event description (optional)"
								value={formData.description}
								onChange={(e) => handleChange("description", e.target.value)}
								disabled={createEventMutation.isPending}
								rows={3}
							/>
						</Field>

						<FieldSeparator />

						{/* Buttons - Right Aligned */}
						<div className="flex justify-end gap-2">
							<Button
								type="button"
								variant="outline"
								onClick={onClose}
								disabled={createEventMutation.isPending}
							>
								Cancel
							</Button>
							<Button type="submit" disabled={createEventMutation.isPending}>
								{createEventMutation.isPending ? "Creating..." : "Create Event"}
							</Button>
						</div>
					</FieldGroup>
				</FieldSet>
			</form>
		</div>
	);
}
