"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useForm } from "@tanstack/react-form";
import { Shield, UserPlus } from "lucide-react";
import Link from "next/link";
import { useId } from "react";
import { toast } from "sonner";
import { z } from "zod";
import { FormGroupContainer } from "@/components/admin-ui/form/form-group-container";
import { SelectLabel } from "@/components/admin-ui/form/select-label";
import { SwitchCardInput } from "@/components/admin-ui/form/switch-card-input";
import { EmptyState, ErrorState, LoadingState } from "@/components/data-state";
import { Button } from "@/components/ui/button";
import {
	getResourcePermissions,
	grantResourcePermission,
} from "@/lib/api/resource/permission";
import { getTeamMembers } from "@/lib/api/team";

const createPermissionSchema = z.object({
	userId: z.string().min(1, "Please select a team member"),
	status: z.enum(["base", "partnership"]),
	isOfficial: z.boolean().default(false),
});

interface CreatePermissionFormProps {
	onClose: () => void;
}

export default function CreatePermissionForm({
	onClose,
}: CreatePermissionFormProps) {
	const userIdField = useId();
	const statusField = useId();
	const officialField = useId();

	// Fetch only members who don't have resource permissions yet
	const {
		data: availableMembers,
		isLoading,
		error,
	} = useQuery({
		queryKey: ["team", "members", { excludeResourcePermissions: true }],
		queryFn: () => getTeamMembers({ excludeResourcePermissions: true }),
	});

	const queryClient = useQueryClient();
	const grantPermissionMutation = useMutation({
		mutationFn: grantResourcePermission,
		onSuccess: () => {
			toast.success("Permission granted successfully!");
			queryClient.invalidateQueries({
				queryKey: ["resource-permissions"],
			});
			onClose();
		},
		onError: (error: Error) => {
			toast.error(error.message || "Failed to grant permission");
		},
	});

	const form = useForm({
		defaultValues: {
			userId: "",
			status: "base" as "base" | "partnership",
			isOfficial: false,
		},
		onSubmit: async ({ value }) => {
			try {
				await grantPermissionMutation.mutateAsync({
					userIds: [value.userId],
					status: value.status,
					isOfficial: value.isOfficial,
				});
			} catch {
				// Error is handled by onError callback
			}
		},
	});

	if (isLoading) {
		return (
			<LoadingState
				title="Loading available members..."
				description="Please wait..."
				height="h-[300px]"
			/>
		);
	}

	if (error) {
		return (
			<ErrorState
				title="Failed to load members"
				description="Please try again later"
				height="h-[300px]"
			/>
		);
	}

	if (!availableMembers || availableMembers.length === 0) {
		return (
			<EmptyState
				title="No team members available"
				description="All active team members already have resource permissions."
				icon={<UserPlus className="size-8" />}
				height="h-[300px]"
				action={
					<div className="flex gap-2">
						<Button onClick={onClose} variant="outline">
							Close
						</Button>
						<Button asChild>
							<Link href="/team">Go to Team</Link>
						</Button>
					</div>
				}
			/>
		);
	}

	return (
		<form
			onSubmit={(e) => {
				e.preventDefault();
				e.stopPropagation();
				form.handleSubmit();
			}}
			className="flex h-full flex-col justify-between gap-4 p-0 md:p-4"
		>
			<div className="space-y-4">
				<FormGroupContainer
					title={{
						icon: Shield,
						label: "Permission Details",
						description: "Select a team member and define their resource access level.",
					}}
				>
					<div className="flex flex-col gap-4">
						{/* Team Member Selection */}
						<form.Field
							name="userId"
							validators={{
								onChange: ({ value }) => {
									const result =
										createPermissionSchema.shape.userId.safeParse(value);
									if (!result.success) return result.error.issues[0].message;
									return undefined;
								},
							}}
						>
							{(field) => (
								<SelectLabel
									label="Team Member"
									htmlFor={userIdField}
									description="Select a team member to grant resource permissions."
									value={field.state.value}
									onChange={(value) => field.handleChange(value)}
									options={availableMembers.map((member) => ({
										value: member.id,
										label: `${member.full_name} (${member.email})`,
									}))}
									placeholder="Select a team member"
									disabled={grantPermissionMutation.isPending}
									isInvalid={field.state.meta.errors.length > 0}
									errors={
										field.state.meta.errors.length > 0
											? [{ message: String(field.state.meta.errors[0]) }]
											: undefined
									}
								/>
							)}
						</form.Field>

						{/* Status Selection */}
						<form.Field name="status">
							{(field) => (
								<SelectLabel
									label="Permission Level"
									htmlFor={statusField}
									description="Regular users have basic access. Partnership users have extended permissions."
									value={field.state.value}
									onChange={(value) =>
										field.handleChange(value as "base" | "partnership")
									}
									options={[
										{ value: "base", label: "Regular" },
										{ value: "partnership", label: "Partnership" },
									]}
									placeholder="Select permission level"
									disabled={grantPermissionMutation.isPending}
								/>
							)}
						</form.Field>

						{/* Official Status Switch */}
						<form.Field name="isOfficial">
							{(field) => (
								<SwitchCardInput
									label="Official Team Member"
									htmlFor={officialField}
									description="Official members can post content under the organization's brand."
									checked={field.state.value}
									onCheckedChange={(checked) => field.handleChange(checked)}
									disabled={grantPermissionMutation.isPending}
									variant="no-rounded"
									border={false}
									isInvalid={field.state.meta.errors.length > 0}
									errors={
										field.state.meta.errors.length > 0
											? [{ message: String(field.state.meta.errors[0]) }]
											: undefined
									}
								/>
							)}
						</form.Field>
					</div>
				</FormGroupContainer>
			</div>

			<div className="flex flex-col gap-2 md:flex-row md:justify-end">
				<Button
					type="button"
					variant="outline"
					onClick={onClose}
					disabled={grantPermissionMutation.isPending}
					className="w-full rounded-none py-6 md:w-auto md:py-2"
				>
					Cancel
				</Button>
				<form.Subscribe
					selector={(state) => [state.canSubmit, state.isSubmitting]}
				>
					{([canSubmit, isSubmitting]) => (
						<Button
							type="submit"
							disabled={!canSubmit || grantPermissionMutation.isPending}
							className="w-full rounded-none py-6 md:w-auto md:py-2"
						>
							{grantPermissionMutation.isPending
								? "Granting..."
								: "Grant Permission"}
						</Button>
					)}
				</form.Subscribe>
			</div>
		</form>
	);
}
