"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useId, useState } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import {
	Field,
	FieldDescription,
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
import { updateStaffRole } from "@/lib/api/event/event-staff";
import type { EventStaffMember } from "./event-staff-table-columns";

interface EditRoleFormProps {
	member: EventStaffMember;
	eventId: string;
	onClose: () => void;
}

export default function EditRoleForm({
	member,
	eventId,
	onClose,
}: EditRoleFormProps) {
	const roleId = useId();
	const [role, setRole] = useState<"event_admin" | "event_team_member">(
		member.eventRole as "event_admin" | "event_team_member",
	);

	const queryClient = useQueryClient();
	const updateRoleMutation = useMutation({
		mutationFn: updateStaffRole,
		onSuccess: () => {
			toast.success("Staff role updated successfully!");
			// Invalidate and refetch event staff query
			queryClient.invalidateQueries({
				queryKey: ["event", eventId, "staff"],
			});
			onClose();
		},
		onError: (error: Error) => {
			toast.error(error.message || "Failed to update staff role");
		},
	});

	const handleSubmit = async (e: React.FormEvent) => {
		e.preventDefault();

		try {
			await updateRoleMutation.mutateAsync({
				eventId,
				userId: member.id,
				role,
			});
		} catch {
			// Error is handled by onError callback
		}
	};

	return (
		<div className="w-full">
			<form onSubmit={handleSubmit}>
				<FieldSet>
					<FieldSeparator />
					<FieldGroup>
						{/* Member Info */}
						<div className="rounded-lg border bg-muted/50 p-4">
							<div className="space-y-1">
								<p className="font-medium text-sm">{member.full_name}</p>
								<p className="text-muted-foreground text-xs">{member.email}</p>
							</div>
						</div>

						<FieldSeparator />

						{/* Role Selection */}
						<Field orientation="vertical">
							<FieldLabel htmlFor={roleId}>Event Role</FieldLabel>
							<Select
								value={role}
								onValueChange={(value) =>
									setRole(value as "event_admin" | "event_team_member")
								}
								disabled={updateRoleMutation.isPending}
							>
								<SelectTrigger id={roleId}>
									<SelectValue placeholder="Select role" />
								</SelectTrigger>
								<SelectContent>
									<SelectItem value="event_admin">Event Admin</SelectItem>
									<SelectItem value="event_team_member">Team Member</SelectItem>
								</SelectContent>
							</Select>
							<FieldDescription>
								Event Admins can manage all aspects of the event. Team Members
								have limited access.
							</FieldDescription>
						</Field>

						<FieldSeparator />

						{/* Buttons */}
						<div className="flex justify-end gap-2">
							<Button
								type="button"
								variant="outline"
								onClick={onClose}
								disabled={updateRoleMutation.isPending}
							>
								Cancel
							</Button>
							<Button
								type="submit"
								disabled={
									updateRoleMutation.isPending || role === member.eventRole
								}
							>
								{updateRoleMutation.isPending ? "Updating..." : "Update Role"}
							</Button>
						</div>
					</FieldGroup>
				</FieldSet>
			</form>
		</div>
	);
}
