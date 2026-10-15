"use client";

import { useMutation } from "@tanstack/react-query";
import { RefreshCw, Trash2 } from "lucide-react";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Spinner } from "@/components/ui/spinner";
import {
	type AvailableAiModel,
	getAvailableAiModels,
	importAiModels,
} from "@/lib/api/ai-integration";

interface AiModelImportFormProps {
	integrationId: number;
	autoLoad?: boolean;
	onComplete: () => void;
	onCancel: () => void;
	onManualAdd: () => void;
}

export function AiModelImportForm({
	integrationId,
	autoLoad = false,
	onComplete,
	onCancel,
	onManualAdd,
}: AiModelImportFormProps) {
	const [models, setModels] = useState<AvailableAiModel[]>([]);
	const [hasLoaded, setHasLoaded] = useState(false);

	const loadMutation = useMutation({
		mutationFn: () => getAvailableAiModels(integrationId),
		onSuccess: (availableModels) => {
			setModels(availableModels);
			setHasLoaded(true);
		},
		onError: () => setHasLoaded(true),
	});

	const importMutation = useMutation({
		mutationFn: () => importAiModels(integrationId, models),
		onSuccess: () => {
			toast.success("AI models added");
			onComplete();
		},
		onError: (error) => toast.error(error.message || "Failed to add AI models"),
	});

	useEffect(() => {
		if (autoLoad) {
			loadMutation.mutate();
		}
	}, [autoLoad, loadMutation.mutate]);

	const updateModelName = (modelId: string, modelName: string) => {
		setModels((currentModels) =>
			currentModels.map((model) =>
				model.model_id === modelId
					? { ...model, model_name: modelName }
					: model,
			),
		);
	};

	return (
		<div className="space-y-4 border border-primary/20 border-dashed p-4">
			<div className="flex flex-wrap items-start justify-between gap-3">
				<div>
					<h4 className="font-semibold text-sm">Available Models</h4>
					<p className="text-muted-foreground text-xs">
						Select the models this provider should make available to AI
						features. Remove rows before adding them; existing saved models stay
						unchanged.
					</p>
				</div>
				<Button
					type="button"
					variant="outline"
					size="sm"
					onClick={() => loadMutation.mutate()}
					disabled={loadMutation.isPending || importMutation.isPending}
					className="rounded-none"
				>
					<RefreshCw
						className={loadMutation.isPending ? "animate-spin" : undefined}
					/>
					{hasLoaded ? "Refresh Models" : "Load Models"}
				</Button>
			</div>

			{loadMutation.isPending && (
				<div className="flex items-center justify-center border border-dashed p-6">
					<Spinner className="size-5" />
				</div>
			)}

			{!loadMutation.isPending && loadMutation.isError && (
				<div className="space-y-3 border border-destructive/40 border-dashed p-4 text-sm">
					<p className="text-destructive">
						{loadMutation.error.message || "Failed to load available models."}
					</p>
					<p className="text-muted-foreground">
						You can retry discovery or add a model ID manually.
					</p>
					<div className="flex flex-wrap gap-2">
						<Button
							type="button"
							variant="outline"
							onClick={() => loadMutation.mutate()}
							disabled={loadMutation.isPending}
							className="rounded-none"
						>
							Retry
						</Button>
						<Button
							type="button"
							variant="outline"
							onClick={onManualAdd}
							className="rounded-none"
						>
							Add Model Manually
						</Button>
					</div>
				</div>
			)}

			{!loadMutation.isPending &&
				!loadMutation.isError &&
				hasLoaded &&
				models.length === 0 && (
					<div className="space-y-3 border border-dashed p-4 text-sm">
						<p className="text-muted-foreground">
							No models are available to add. You can refresh or add one
							manually.
						</p>
						<Button
							type="button"
							variant="outline"
							onClick={onManualAdd}
							className="rounded-none"
						>
							Add Model Manually
						</Button>
					</div>
				)}

			{!loadMutation.isPending &&
				!loadMutation.isError &&
				models.length > 0 && (
					<>
						<div className="space-y-2">
							{models.map((model) => (
								<div
									key={model.model_id}
									className="grid items-end gap-2 border border-dashed p-3 md:grid-cols-[minmax(0,1fr)_minmax(0,1fr)_auto]"
								>
									<div className="min-w-0">
										<p className="text-muted-foreground text-xs">Model ID</p>
										<div
											className="mt-1 flex min-h-9 cursor-not-allowed items-center rounded-none border border-input bg-transparent px-3 py-1 shadow-xs dark:bg-input/30"
											title="Model ID is provided by the provider and cannot be edited."
										>
											<p className="break-all font-mono text-sm">
												{model.model_id}
											</p>
										</div>
									</div>
									<div>
										<label
											className="text-muted-foreground text-xs"
											htmlFor={`${integrationId}-${model.model_id}-name`}
										>
											Model Name (Optional)
										</label>
										<Input
											id={`${integrationId}-${model.model_id}-name`}
											value={model.model_name}
											onChange={(event) =>
												updateModelName(model.model_id, event.target.value)
											}
											placeholder="Display name (optional)"
											className="mt-1 rounded-none"
										/>
									</div>
									<Button
										type="button"
										variant="destructive"
										size="icon"
										onClick={() =>
											setModels((currentModels) =>
												currentModels.filter(
													(currentModel) =>
														currentModel.model_id !== model.model_id,
												),
											)
										}
										disabled={importMutation.isPending}
										aria-label={`Remove ${model.model_id}`}
										className="justify-self-end rounded-none"
									>
										<Trash2 />
									</Button>
								</div>
							))}
						</div>

						<div className="flex flex-wrap justify-end gap-2">
							<Button
								type="button"
								variant="outline"
								onClick={onCancel}
								disabled={importMutation.isPending}
								className="rounded-none"
							>
								Cancel
							</Button>
							<Button
								type="button"
								onClick={() => importMutation.mutate()}
								disabled={importMutation.isPending || models.length === 0}
								className="rounded-none"
							>
								{importMutation.isPending ? (
									<Spinner className="size-4" />
								) : (
									`Add ${models.length} Model${models.length === 1 ? "" : "s"}`
								)}
							</Button>
						</div>
					</>
				)}
		</div>
	);
}
