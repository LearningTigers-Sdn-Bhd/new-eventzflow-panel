"use client";

import { useForm } from "@tanstack/react-form";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Pencil, RefreshCw, Star, Trash2 } from "lucide-react";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import z from "zod";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Field, FieldError, FieldLabel } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from "@/components/ui/select";
import { Spinner } from "@/components/ui/spinner";
import {
	type AiModel,
	type AvailableAiModel,
	createAiModel,
	deleteAiModel,
	getAvailableAiModels,
	setDefaultAiModel,
	updateAiModel,
} from "@/lib/api/ai-integration";
import { toAiModelPayload } from "./ai-integration-form-utils";

interface AiModelFormProps {
	integrationId: number;
	model?: AiModel;
	onCancel?: () => void;
}

export function AiModelForm({
	integrationId,
	model,
	onCancel,
}: AiModelFormProps) {
	const queryClient = useQueryClient();
	const [isEditing, setIsEditing] = useState(!model);
	const [availableModels, setAvailableModels] = useState<AvailableAiModel[]>(
		[],
	);
	const [manualModelId, setManualModelId] = useState(false);
	const refresh = () =>
		queryClient.invalidateQueries({ queryKey: ["ai-integrations"] });

	const saveMutation = useMutation({
		mutationFn: (values: { model_id: string; model_name?: string }) =>
			model
				? updateAiModel(integrationId, model.id, values)
				: createAiModel(integrationId, values),
		onSuccess: () => {
			toast.success(model ? "AI model updated" : "AI model added");
			refresh();
			if (model) {
				setIsEditing(false);
			} else {
				onCancel?.();
			}
		},
		onError: (error) => toast.error(error.message || "Failed to save AI model"),
	});

	const deleteMutation = useMutation({
		mutationFn: () => deleteAiModel(integrationId, model?.id ?? 0),
		onSuccess: () => {
			toast.success("AI model deleted");
			refresh();
		},
		onError: (error) =>
			toast.error(error.message || "Failed to delete AI model"),
	});

	const defaultMutation = useMutation({
		mutationFn: () => setDefaultAiModel(integrationId, model?.id ?? 0),
		onSuccess: () => {
			toast.success("Default AI model updated");
			refresh();
		},
		onError: (error) =>
			toast.error(error.message || "Failed to set default AI model"),
	});

	const loadModelsMutation = useMutation({
		mutationFn: () => getAvailableAiModels(integrationId),
		onSuccess: (models) => {
			setAvailableModels(models);
			setManualModelId(models.length === 0);
			if (models.length === 0) {
				toast.info("No models returned; enter a model ID manually");
			}
		},
		onError: (error) => {
			setAvailableModels([]);
			setManualModelId(true);
			toast.error(error.message || "Failed to load available models");
		},
	});

	const form = useForm({
		defaultValues: {
			model_id: model?.model_id ?? "",
			model_name: model?.model_name ?? "",
		},
		validators: {
			onSubmit: z.object({
				model_id: z.string().trim().min(1, "Model ID is required"),
				model_name: z.string().trim(),
			}),
		},
		onSubmit: ({ value }) => saveMutation.mutateAsync(toAiModelPayload(value)),
	});

	const selectModel = (modelId: string) => {
		form.setFieldValue("model_id", modelId);
		const selectedModel = availableModels.find(
			(availableModel) => availableModel.model_id === modelId,
		);
		form.setFieldValue("model_name", selectedModel?.model_name ?? "");
	};

	useEffect(() => {
		if (model) {
			form.reset({
				model_id: model.model_id,
				model_name: model.model_name,
			});
		}
	}, [form, model]);

	if (model && !isEditing) {
		return (
			<div className="space-y-3 border border-dashed p-3">
				<div className="flex flex-wrap items-center justify-end gap-2">
					{model.is_default && (
						<Badge className="rounded-none">
							<Star className="size-3 fill-current" /> Default
						</Badge>
					)}
					{!model.is_default && (
						<Button
							type="button"
							variant="outline"
							onClick={() => defaultMutation.mutate()}
							disabled={defaultMutation.isPending}
							className="rounded-none"
						>
							<Star /> Set Default
						</Button>
					)}
					<Button
						type="button"
						variant="outline"
						onClick={() => setIsEditing(true)}
						className="rounded-none"
					>
						<Pencil /> Edit
					</Button>
					<Button
						type="button"
						variant="destructive"
						onClick={() => deleteMutation.mutate()}
						disabled={deleteMutation.isPending}
						className="rounded-none"
					>
						<Trash2 /> Delete
					</Button>
				</div>

				<dl className="grid gap-3 md:grid-cols-2">
					<div className="border border-dashed p-3">
						<dt className="text-muted-foreground text-xs">Model ID</dt>
						<dd className="mt-1 break-all font-mono text-sm">
							{model.model_id}
						</dd>
					</div>
					<div className="border border-dashed p-3">
						<dt className="text-muted-foreground text-xs">Model Name</dt>
						<dd className="mt-1 font-medium text-sm">
							{model.model_name || "—"}
						</dd>
					</div>
				</dl>
			</div>
		);
	}

	return (
		<form
			onSubmit={(event) => {
				event.preventDefault();
				form.handleSubmit();
			}}
			className="space-y-3 border border-dashed p-3"
		>
			{model?.is_default && (
				<div className="flex justify-end">
					<Badge className="rounded-none">
						<Star className="size-3 fill-current" /> Default
					</Badge>
				</div>
			)}

			<div className="grid gap-3 md:grid-cols-2">
				<form.Field name="model_id">
					{(field) => (
						<Field data-invalid={field.state.meta.errors.length > 0}>
							<FieldLabel
								htmlFor={`${integrationId}-${model?.id ?? "new"}-model-id`}
							>
								Model ID
							</FieldLabel>
							<div className="flex gap-2">
								{availableModels.length > 0 && !manualModelId ? (
									<Select
										value={field.state.value || undefined}
										onValueChange={selectModel}
									>
										<SelectTrigger
											id={`${integrationId}-${model?.id ?? "new"}-model-id`}
											className="min-w-0 flex-1 rounded-none"
										>
											<SelectValue placeholder="Select an available model" />
										</SelectTrigger>
										<SelectContent className="rounded-none">
											{availableModels.map((availableModel) => (
												<SelectItem
													key={availableModel.model_id}
													value={availableModel.model_id}
												>
													{availableModel.model_id}
													{availableModel.model_name
														? ` — ${availableModel.model_name}`
														: ""}
												</SelectItem>
											))}
										</SelectContent>
									</Select>
								) : (
									<Input
										id={`${integrationId}-${model?.id ?? "new"}-model-id`}
										value={field.state.value}
										onBlur={field.handleBlur}
										onChange={(event) => field.handleChange(event.target.value)}
										placeholder="cx/gpt-5.6"
										className="min-w-0 flex-1 rounded-none"
									/>
								)}
								{!model && (
									<Button
										type="button"
										variant="outline"
										onClick={() => loadModelsMutation.mutate()}
										disabled={loadModelsMutation.isPending}
										className="shrink-0 rounded-none"
									>
										<RefreshCw
											className={
												loadModelsMutation.isPending
													? "animate-spin"
													: undefined
											}
										/>
										{availableModels.length > 0 ? "Refresh" : "Load Models"}
									</Button>
								)}
							</div>
							{availableModels.length > 0 && !model && (
								<Button
									type="button"
									variant="ghost"
									size="sm"
									className="h-auto rounded-none px-0 text-muted-foreground text-xs"
									onClick={() => setManualModelId((manual) => !manual)}
								>
									{manualModelId
										? "Select from loaded models"
										: "Enter a model ID manually"}
								</Button>
							)}
							{field.state.meta.errors.length > 0 && (
								<FieldError>{String(field.state.meta.errors[0])}</FieldError>
							)}
						</Field>
					)}
				</form.Field>

				<form.Field name="model_name">
					{(field) => (
						<Field data-invalid={field.state.meta.errors.length > 0}>
							<FieldLabel
								htmlFor={`${integrationId}-${model?.id ?? "new"}-model-name`}
							>
								Model Name (Optional)
							</FieldLabel>
							<Input
								id={`${integrationId}-${model?.id ?? "new"}-model-name`}
								value={field.state.value}
								onBlur={field.handleBlur}
								onChange={(event) => field.handleChange(event.target.value)}
								placeholder="GPT 5.6 (optional)"
								className="rounded-none"
							/>
							{field.state.meta.errors.length > 0 && (
								<FieldError>{String(field.state.meta.errors[0])}</FieldError>
							)}
						</Field>
					)}
				</form.Field>
			</div>

			<div className="flex flex-wrap justify-end gap-2">
				{model && !model.is_default && (
					<Button
						type="button"
						variant="outline"
						onClick={() => defaultMutation.mutate()}
						disabled={defaultMutation.isPending}
						className="rounded-none"
					>
						<Star /> Set Default
					</Button>
				)}
				{model && (
					<Button
						type="button"
						variant="destructive"
						onClick={() => deleteMutation.mutate()}
						disabled={deleteMutation.isPending}
						className="rounded-none"
					>
						<Trash2 /> Delete
					</Button>
				)}
				{(onCancel || model) && (
					<Button
						type="button"
						variant="outline"
						onClick={() => {
							if (model) {
								form.reset();
								setIsEditing(false);
							} else {
								onCancel?.();
							}
						}}
						className="rounded-none"
					>
						Cancel
					</Button>
				)}
				<form.Subscribe>
					{(state) => (
						<Button
							type="submit"
							disabled={!state.canSubmit || state.isSubmitting}
							className="rounded-none"
						>
							{state.isSubmitting ? (
								<Spinner className="size-4" />
							) : model ? (
								"Update Model"
							) : (
								"Add Model"
							)}
						</Button>
					)}
				</form.Subscribe>
			</div>
		</form>
	);
}
