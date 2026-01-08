"use client";

import { useForm } from "@tanstack/react-form";
import { Link as LinkIcon, Loader2 } from "lucide-react";
import { z } from "zod";
import { FormGroupContainer } from "@/components/admin-ui/form/form-group-container";
import { InputLabel } from "@/components/admin-ui/form/input-label";
import { SwitchCardInput } from "@/components/admin-ui/form/switch-card-input";
import { Button } from "@/components/ui/button";

const linkSchema = z.object({
	label: z.string().optional(),
	url: z.string().min(1, "URL is required"),
	openInNewTab: z.boolean().default(false),
});

interface LinkFormProps {
	initialData?: {
		label?: string;
		url?: string;
		openInNewTab?: boolean;
	};
	onSubmit: (data: { label: string; url: string; openInNewTab: boolean }) => void;
	onCancel: () => void;
	isPending?: boolean;
}

export function LinkForm({
	initialData,
	onSubmit,
	onCancel,
	isPending = false,
}: LinkFormProps) {
	const form = useForm({
		defaultValues: {
			label: initialData?.label || "",
			url: initialData?.url || "",
			openInNewTab: initialData?.openInNewTab || false,
		},
		onSubmit: async ({ value }) => {
			onSubmit({
				label: value.label.trim(),
				url: value.url.trim(),
				openInNewTab: value.openInNewTab,
			});
		},
	});

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
						icon: LinkIcon,
						label: "URL Link",
						description: "Enter the details for the link.",
					}}
				>
					<div className="flex flex-col gap-4">
						<form.Field name="label">
							{(field) => (
								<InputLabel
									label="Label"
									description="Enter the display text for the link"
									value={field.state.value}
									onChange={(value) => field.handleChange(value)}
									placeholder="e.g. Visit our website"
									disabled={isPending}
								/>
							)}
						</form.Field>

						<form.Field
							name="url"
							validators={{
								onChange: ({ value }) => {
									const result = linkSchema.shape.url.safeParse(value);
									if (!result.success) return result.error.issues[0].message;
									return undefined;
								},
							}}
						>
							{(field) => (
								<InputLabel
									label="URL"
									description="Enter the destination URL"
									value={field.state.value}
									onChange={(value) => field.handleChange(value)}
									placeholder="https://example.com"
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

						<form.Field name="openInNewTab">
							{(field) => (
								<SwitchCardInput
									label="Open in new tab"
									description="Whether the link should open in a new browser tab"
									checked={field.state.value}
									onCheckedChange={(checked) => field.handleChange(checked)}
									disabled={isPending}
									variant="no-rounded"
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
					onClick={onCancel}
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
							{initialData?.url ? "Update Link" : "Add Link"}
						</Button>
					)}
				</form.Subscribe>
			</div>
		</form>
	);
}
