"use client";

import { useForm } from "@tanstack/react-form";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Shield } from "lucide-react";
import { toast } from "sonner";
import { z } from "zod";
import { FormGroupContainer } from "@/components/admin-ui/form/form-group-container";
import { SelectLabel } from "@/components/admin-ui/form/select-label";
import { SwitchCardInput } from "@/components/admin-ui/form/switch-card-input";
import { Button } from "@/components/ui/button";
import type { ResourcePermission } from "@/lib/api/resource/permission";
import { updateResourcePermissionFull } from "@/lib/api/resource/permission";

interface EditPermissionFormProps {
	permission: ResourcePermission;
	onClose: () => void;
}

const editPermissionSchema = z.object({
	status: z.enum(["base", "partnership"]),
	isOfficial: z.boolean(),
});

export default function EditPermissionForm({
	permission,
	onClose,
}: EditPermissionFormProps) {
	const queryClient = useQueryClient();
	const updatePermissionMutation = useMutation({
		mutationFn: updateResourcePermissionFull,
		onSuccess: () => {
			toast.success("Permission updated successfully!");
			queryClient.invalidateQueries({
				queryKey: ["resource-permissions"],
			});
			onClose();
		},
		onError: (error: Error) => {
			toast.error(error.message || "Failed to update permission");
		},
	});

	const form = useForm({
		defaultValues: {
			status: permission.status as "base" | "partnership",
			isOfficial: permission.isOfficial,
		},
		onSubmit: async ({ value }) => {
			try {
				await updatePermissionMutation.mutateAsync({
					id: permission.id,
					status: value.status,
					isOfficial: value.isOfficial,
				});
			} catch {
				// Error is handled by onError callback
			}
		},
	});

	return (
		<form
			onSubmit={(e) => {
				e.preventDefault();
				e.stopPropagation();
				form.handleSubmit();
			}}
			className="w-full"
		>
			<FormGroupContainer
				title={{
					icon: Shield,
					label: "Edit Permission",
					description: "Update the permission status for this user.",
				}}
			>
				<div className="flex flex-col gap-4">
					{/* User Details (Read-only) */}
					<div className="rounded-md border bg-muted/50 p-3">
						<div className="font-medium text-sm">User</div>
						<div className="font-medium">{permission.user.fullName}</div>
						<div className="text-muted-foreground text-sm">
							{permission.user.email}
						</div>
						{permission.user.phone && (
							<div className="text-muted-foreground text-sm">
								{permission.user.phone}
							</div>
						)}
					</div>

					<form.Field
						name="status"
						validators={{
							onChange: ({ value }) => {
								const result =
									editPermissionSchema.shape.status.safeParse(value);
								if (!result.success) return result.error.issues[0].message;
								return undefined;
							},
						}}
					>
						{(field) => (
							<SelectLabel
								label="Permission Level"
								description="Regular users have basic access. Partnership users have extended permissions."
								value={field.state.value}
								onChange={(value) =>
									field.handleChange(value as "base" | "partnership")
								}
								options={[
									{ value: "base", label: "Regular" },
									{ value: "partnership", label: "Partnership" },
								]}
								disabled={updatePermissionMutation.isPending}
							/>
						)}
					</form.Field>

					<form.Field
						name="isOfficial"
						validators={{
							onChange: ({ value }) => {
								const result =
									editPermissionSchema.shape.isOfficial.safeParse(value);
								if (!result.success) return result.error.issues[0].message;
								return undefined;
							},
						}}
					>
						{(field) => (
							<SwitchCardInput
								label="Official Team Member"
								description="Official members can post content under the organization's brand."
								checked={field.state.value}
								onCheckedChange={(checked) => field.handleChange(checked)}
								disabled={updatePermissionMutation.isPending}
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

					<div className="flex justify-end gap-2 pt-2">
						<Button
							type="button"
							variant="outline"
							onClick={onClose}
							disabled={updatePermissionMutation.isPending}
							className="rounded-none py-6 md:py-2"
						>
							Cancel
						</Button>
						<form.Subscribe
							selector={(state) => [state.canSubmit, state.isSubmitting]}
						>
							{([canSubmit, _isSubmitting]) => (
								<Button
									type="submit"
									disabled={!canSubmit || updatePermissionMutation.isPending}
									className="rounded-none py-6 md:py-2"
								>
									{updatePermissionMutation.isPending
										? "Updating..."
										: "Save Changes"}
								</Button>
							)}
						</form.Subscribe>
					</div>
				</div>
			</FormGroupContainer>
		</form>
	);
}
