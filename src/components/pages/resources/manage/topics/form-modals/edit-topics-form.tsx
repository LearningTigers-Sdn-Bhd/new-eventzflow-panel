"use client";

import { useForm } from "@tanstack/react-form";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { FileText, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { z } from "zod";
import { FormGroupContainer } from "@/components/admin-ui/form/form-group-container";
import { IconSelector } from "@/components/admin-ui/form/icon-selector";
import { InputLabel } from "@/components/admin-ui/form/input-label";
import { Button } from "@/components/ui/button";
import { useDialog } from "@/hooks/use-dialog";
import { updateResourceTopic } from "@/lib/api/resource/topic";
import type { ResourceTopic } from "@/lib/api/resource/topic/response";

const editTopicSchema = z.object({
	name: z.string().min(1, "Name is required"),
	description: z.string().optional(),
	logo: z.string().optional(),
});

interface EditTopicsFormProps {
	topic: ResourceTopic;
}

export function EditTopicsForm({ topic }: EditTopicsFormProps) {
	const { closeDialog } = useDialog();
	const queryClient = useQueryClient();

	const updateMutation = useMutation({
		mutationFn: updateResourceTopic,
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: ["resource-topics"] });
			toast.success("Topic updated successfully");
			closeDialog();
		},
		onError: (error: Error) => {
			toast.error("Failed to update topic", {
				description: error.message,
			});
		},
	});

	const form = useForm({
		defaultValues: {
			name: topic.name,
			description: topic.description || "",
			logo: topic.logo || "",
		},
		onSubmit: async ({ value }) => {
			updateMutation.mutate({
				id: topic.id,
				name: value.name.trim(),
				description: value.description?.trim() || undefined,
				logo: value.logo?.trim() || undefined,
			});
		},
	});

	const isPending = updateMutation.isPending;

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
						icon: FileText,
						label: "Topic Information",
						description: "Edit the details of the topic.",
					}}
				>
					<div className="flex flex-col gap-4">
						<form.Field
							name="name"
							validators={{
								onChange: ({ value }) => {
									const result = editTopicSchema.shape.name.safeParse(value);
									if (!result.success) return result.error.issues[0].message;
									return undefined;
								},
							}}
						>
							{(field) => (
								<InputLabel
									label="Name"
									description="Enter the name of the topic"
									value={field.state.value}
									onChange={(value) => field.handleChange(value)}
									placeholder="e.g. Event Marketing"
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

						<form.Field name="description">
							{(field) => (
								<InputLabel
									label="Description"
									description="Enter a brief description of the topic"
									value={field.state.value}
									onChange={(value) => field.handleChange(value)}
									placeholder="e.g. Strategies for promoting events"
									disabled={isPending}
									type="textarea"
								/>
							)}
						</form.Field>

						<form.Field name="logo">
							{(field) => (
								<IconSelector
									label="Icon"
									description="Select an icon for the topic"
									value={field.state.value}
									onChange={(value) => field.handleChange(value)}
									placeholder="Select an icon"
									disabled={isPending}
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
							disabled={!canSubmit || isPending}
							className="w-full rounded-none py-6 md:w-auto md:py-2"
						>
							{isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
							Save Changes
						</Button>
					)}
				</form.Subscribe>
			</div>
		</form>
	);
}
