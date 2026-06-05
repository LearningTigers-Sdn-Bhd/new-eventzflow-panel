"use client";

import { useForm } from "@tanstack/react-form";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { AlertCircle, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { z } from "zod";
import { FormGroupContainer } from "@/components/admin-ui/form/form-group-container";
import { InputLabel } from "@/components/admin-ui/form/input-label";
import { Button } from "@/components/ui/button";
import { useDialog } from "@/hooks/use-dialog";
import { approveResource } from "@/lib/api/resource";
import type { Resource } from "@/lib/api/resource/response";

const rejectResourceSchema = z.object({
	rejectionReason: z
		.string()
		.min(5, "Rejection reason must be at least 5 characters"),
});

interface RejectFormProps {
	resource: Resource;
}

export function RejectForm({ resource }: RejectFormProps) {
	const { closeDialog } = useDialog();
	const queryClient = useQueryClient();

	const rejectMutation = useMutation({
		mutationFn: approveResource,
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: ["resources-approval"] });
			toast.success("Post rejected successfully");
			closeDialog();
		},
		onError: (error: Error) => {
			toast.error("Failed to reject post", {
				description: error.message,
			});
		},
	});

	const form = useForm({
		defaultValues: {
			rejectionReason: "",
		},
		onSubmit: async ({ value }) => {
			rejectMutation.mutate({
				id: resource.id,
				status: "rejected",
				rejection_reason: value.rejectionReason,
			});
		},
	});

	const isPending = rejectMutation.isPending;

	return (
		<form
			onSubmit={(e) => {
				e.preventDefault();
				e.stopPropagation();
				form.handleSubmit();
			}}
			className="flex h-full flex-col justify-between gap-4 px-4 md:px-6"
		>
			<div className="space-y-4">
				<FormGroupContainer
					title={{
						icon: AlertCircle,
						label: "Reasons",
						description: "Please provide a reason for rejecting this post.",
					}}
				>
					<form.Field
						name="rejectionReason"
						validators={{
							onChange: ({ value }) => {
								const result =
									rejectResourceSchema.shape.rejectionReason.safeParse(value);
								if (!result.success) return result.error.issues[0].message;
								return undefined;
							},
						}}
					>
						{(field) => (
							<InputLabel
								label="Description"
								description="Explain why this post is being rejected to the author."
								value={field.state.value}
								onChange={(value) => field.handleChange(value)}
								placeholder="e.g. The content does not meet our guidelines because..."
								type="textarea"
								rows={4}
								disabled={isPending}
								required
								isInvalid={field.state.meta.errors.length > 0}
								errors={
									field.state.meta.errors.length > 0
										? [{ message: String(field.state.meta.errors[0]) }]
										: undefined
								}
							/>
						)}
					</form.Field>
				</FormGroupContainer>
			</div>

			<div className="flex flex-col gap-2 md:flex-row md:justify-end">
				<Button
					type="button"
					variant="outline"
					onClick={closeDialog}
					disabled={isPending}
					className="w-full rounded-none py-6 md:w-auto md:py-2"
				>
					Cancel
				</Button>
				<form.Subscribe
					selector={(state) => [state.canSubmit, state.isSubmitting]}
				>
					{([canSubmit, _isSubmitting]) => (
						<Button
							type="submit"
							variant="destructive"
							disabled={!canSubmit || isPending}
							className="w-full rounded-none py-6 md:w-auto md:py-2"
						>
							{isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
							Reject Post
						</Button>
					)}
				</form.Subscribe>
			</div>
		</form>
	);
}
