"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { UserPlus } from "lucide-react";
import { useId, useState } from "react";
import { toast } from "sonner";
import { EmptyState, ErrorState, LoadingState } from "@/components/data-state";
import { Button } from "@/components/ui/button";
import {
	Field,
	FieldDescription,
	FieldError,
	FieldGroup,
	FieldLabel,
	FieldSeparator,
	FieldSet,
} from "@/components/ui/field";
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from "@/components/ui/select";
import {
	assignStaff,
	getAvailableTeamMembers,
} from "@/lib/api/event/event-staff";

interface AssignStaffFormProps {
	eventId: string;
	onClose: () => void;
}

export default function AssignStaffForm({
	eventId,
	onClose,
}: AssignStaffFormProps) {
	const userIdField = useId();
	const roleIdField = useId();

	const [userId, setUserId] = useState<string>("");
	const [role, setRole] = useState<"event_admin" | "event_team_member">(
		"event_team_member",
	);
	const [errors, setErrors] = useState<Record<string, string>>({});

	// Fetch available team members
	const {
		data: availableMembers,
		isLoading,
		error,
	} = useQuery({
		queryKey: ["event", eventId, "available-staff"],
		queryFn: () => getAvailableTeamMembers({ eventId }),
	});

	const queryClient = useQueryClient();
	const assignStaffMutation = useMutation({
		mutationFn: assignStaff,
		onSuccess: () => {
			toast.success("Staff member assigned successfully!");
			// Invalidate queries
			queryClient.invalidateQueries({
				queryKey: ["event", eventId, "staff"],
			});
			queryClient.invalidateQueries({
				queryKey: ["event", eventId, "available-staff"],
			});
			onClose();
		},
		onError: (error: Error) => {
			toast.error(error.message || "Failed to assign staff member");
		},
	});

	const handleSubmit = async (e: React.FormEvent) => {
		e.preventDefault();
		setErrors({});

		// Validation
		const newErrors: Record<string, string> = {};

		if (!userId) {
			newErrors.userId = "Please select a team member";
		}

		if (Object.keys(newErrors).length > 0) {
			setErrors(newErrors);
			return;
		}

		try {
			await assignStaffMutation.mutateAsync({
				eventId,
				userId,
				role,
			});
		} catch {
			// Error is handled by onError callback
		}
	};

	if (isLoading) {
		return (
			<LoadingState
				title="Loading team members..."
				description="Please wait..."
				height="h-[300px]"
			/>
		);
	}

	if (error) {
		return (
			<ErrorState
				title="Failed to load team members"
				description="Please try again later"
				height="h-[300px]"
			/>
		);
	}

	if (!availableMembers || availableMembers.length === 0) {
		return (
			<EmptyState
				title="No team members available"
				description="All organization members are already assigned to this event or there are no team members to assign."
				icon={<UserPlus className="size-8" />}
				height="h-[300px]"
				action={
					<Button onClick={onClose} variant="outline">
						Close
					</Button>
				}
			/>
		);
	}

	return (
		<div className="min-h-[300px] w-full">
			<form onSubmit={handleSubmit}>
				<FieldSet>
					<FieldSeparator />
					<FieldGroup>
						{/* Team Member Selection */}
						<Field orientation="vertical">
							<FieldLabel htmlFor={userIdField}>Team Member</FieldLabel>
							{errors.userId && <FieldError>{errors.userId}</FieldError>}
							<Select
								value={userId}
								onValueChange={(value) => {
									setUserId(value);
									if (errors.userId) {
										setErrors((prev) => {
											const newErrors = { ...prev };
											delete newErrors.userId;
											return newErrors;
										});
									}
								}}
								disabled={assignStaffMutation.isPending}
							>
								<SelectTrigger id={userIdField}>
									<SelectValue placeholder="Select a team member" />
								</SelectTrigger>
								<SelectContent>
									{availableMembers.map((member) => (
										<SelectItem key={member.id} value={member.id}>
											<div className="flex items-center justify-between gap-2">
												<span>{member.full_name}</span>
												<span className="text-muted-foreground text-xs">
													{member.email}
												</span>
											</div>
										</SelectItem>
									))}
								</SelectContent>
							</Select>
							<FieldDescription>
								Select a team member from your organization to assign to this
								event.
							</FieldDescription>
						</Field>

						<FieldSeparator />

						{/* Role Selection */}
						<Field orientation="vertical">
							<FieldLabel htmlFor={roleIdField}>Event Role</FieldLabel>
							<Select
								value={role}
								onValueChange={(value) =>
									setRole(value as "event_admin" | "event_team_member")
								}
								disabled={assignStaffMutation.isPending}
							>
								<SelectTrigger id={roleIdField}>
									<SelectValue placeholder="Select role" />
								</SelectTrigger>
								<SelectContent>
									<SelectItem value="event_admin">Event Admin</SelectItem>
									<SelectItem value="event_team_member">Team Member</SelectItem>
								</SelectContent>
							</Select>
							<FieldDescription>
								Event Admins can manage all aspects of the event. Team Members
								have limited access to event functions.
							</FieldDescription>
						</Field>

						<FieldSeparator />

						{/* Buttons */}
						<div className="flex justify-end gap-2">
							<Button
								type="button"
								variant="outline"
								onClick={onClose}
								disabled={assignStaffMutation.isPending}
							>
								Cancel
							</Button>
							<Button type="submit" disabled={assignStaffMutation.isPending}>
								{assignStaffMutation.isPending
									? "Assigning..."
									: "Assign Staff"}
							</Button>
						</div>
					</FieldGroup>
				</FieldSet>
			</form>
		</div>
	);
}
