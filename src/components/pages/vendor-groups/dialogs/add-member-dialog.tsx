"use client";

import { useQuery } from "@tanstack/react-query";
import { Users } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import { EmptyState, ErrorState, LoadingState } from "@/components/data-state";
import { Button } from "@/components/ui/button";
import {
	Dialog,
	DialogContent,
	DialogDescription,
	DialogFooter,
	DialogHeader,
	DialogTitle,
} from "@/components/ui/dialog";
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
import { Switch } from "@/components/ui/switch";
import { useAddGroupMember } from "@/hooks/use-group-members";
import { getAvailableGroupMembers } from "@/lib/api/group-member";

interface AddMemberDialogProps {
	groupId: number;
	open: boolean;
	onOpenChange: (open: boolean) => void;
}

export function AddMemberDialog({
	groupId,
	open,
	onOpenChange,
}: AddMemberDialogProps) {
	const [userId, setUserId] = useState("");
	const [hasManagerAccess, setHasManagerAccess] = useState(false);
	const [errors, setErrors] = useState<Record<string, string>>({});

	const addMember = useAddGroupMember();

	// Fetch available members
	const {
		data: availableMembers,
		isLoading,
		error,
	} = useQuery({
		queryKey: ["groups", groupId, "available-members"],
		queryFn: () => getAvailableGroupMembers(groupId),
		enabled: open,
	});

	const handleSubmit = async (e: React.FormEvent) => {
		e.preventDefault();
		setErrors({});

		// Validation
		const newErrors: Record<string, string> = {};

		if (!userId) {
			newErrors.userId = "Please select a member";
		}

		if (Object.keys(newErrors).length > 0) {
			setErrors(newErrors);
			return;
		}

		try {
			await addMember.mutateAsync({
				groupId,
				data: {
					user_id: Number(userId),
					has_manager_access: hasManagerAccess,
				},
			});
			toast.success("Member added successfully");
			onOpenChange(false);
			setUserId("");
			setHasManagerAccess(false);
			setErrors({});
		} catch (error) {
			toast.error("Failed to add member");
		}
	};

	const handleClose = () => {
		onOpenChange(false);
		setUserId("");
		setHasManagerAccess(false);
		setErrors({});
	};

	return (
		<Dialog open={open} onOpenChange={handleClose}>
			<DialogContent className="max-w-md">
				<DialogHeader>
					<DialogTitle>Add Member</DialogTitle>
					<DialogDescription>
						Add a member from your organization to this group.
					</DialogDescription>
				</DialogHeader>

				{isLoading ? (
					<LoadingState
						title="Loading members..."
						description="Please wait..."
						height="h-[200px]"
					/>
				) : error ? (
					<ErrorState
						title="Failed to load members"
						description="Please try again later"
						height="h-[200px]"
					/>
				) : !availableMembers || availableMembers.length === 0 ? (
					<EmptyState
						title="No available members"
						description="All members are already added to this group or no members exist."
						icon={<Users className="size-8" />}
						height="h-[200px]"
					/>
				) : (
					<form onSubmit={handleSubmit}>
						<FieldSet>
							<FieldSeparator />
							<FieldGroup>
								{/* Member Selection */}
								<Field orientation="vertical">
									<FieldLabel htmlFor="memberId">Member</FieldLabel>
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
										disabled={addMember.isPending}
									>
										<SelectTrigger id="memberId" className="rounded-none">
											<SelectValue placeholder="Select a member" />
										</SelectTrigger>
										<SelectContent className="rounded-none">
											{availableMembers.map((member) => (
												<SelectItem
													key={member.id}
													value={member.id.toString()}
													className="rounded-none"
												>
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
										Select a member to add to this group.
									</FieldDescription>
								</Field>

								<FieldSeparator />

								{/* Manager Access Toggle */}
								<div className="flex items-center justify-between">
									<FieldLabel htmlFor="manager">Manager Access</FieldLabel>
									<Switch
										id="manager"
										checked={hasManagerAccess}
										onCheckedChange={setHasManagerAccess}
										disabled={addMember.isPending}
									/>
								</div>

								<FieldSeparator />

								{/* Buttons */}
								<div className="flex justify-end gap-2">
									<Button
										type="button"
										variant="outline"
										onClick={handleClose}
										disabled={addMember.isPending}
									>
										Cancel
									</Button>
									<Button
										type="submit"
										disabled={addMember.isPending}
										className="rounded-none"
									>
										{addMember.isPending ? "Adding..." : "Add Member"}
									</Button>
								</div>
							</FieldGroup>
						</FieldSet>
					</form>
				)}
			</DialogContent>
		</Dialog>
	);
}
