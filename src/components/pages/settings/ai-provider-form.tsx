"use client";

import { useForm } from "@tanstack/react-form";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import {
	ChevronDown,
	ChevronUp,
	Eye,
	EyeOff,
	Pencil,
	Plus,
	Trash2,
} from "lucide-react";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import z from "zod";
import { Button } from "@/components/ui/button";
import {
	Dialog,
	DialogClose,
	DialogContent,
	DialogDescription,
	DialogFooter,
	DialogHeader,
	DialogTitle,
	DialogTrigger,
} from "@/components/ui/dialog";
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
	AI_PROVIDER_PRESETS,
	CUSTOM_AI_PROVIDER_VALUE,
	findAiProviderPreset,
} from "@/lib/ai-providers";
import {
	type AiIntegration,
	createAiIntegration,
	deleteAiIntegration,
	updateAiIntegration,
} from "@/lib/api/ai-integration";
import { toProviderPayload } from "./ai-integration-form-utils";
import { AiModelForm } from "./ai-model-form";
import { AiModelImportForm } from "./ai-model-import-form";

function providerFormValue(providerName?: string) {
	const preset = providerName ? findAiProviderPreset(providerName) : undefined;

	return {
		provider: preset?.value ?? (providerName ? CUSTOM_AI_PROVIDER_VALUE : ""),
		custom_provider_name: preset ? "" : (providerName ?? ""),
	};
}

interface AiProviderFormProps {
	integration?: AiIntegration;
	onCancel?: () => void;
}

export function AiProviderForm({ integration, onCancel }: AiProviderFormProps) {
	const queryClient = useQueryClient();
	const initialProvider = providerFormValue(integration?.provider);
	const [addingModel, setAddingModel] = useState(false);
	const [createdIntegration, setCreatedIntegration] = useState<AiIntegration>();
	const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
	const [importingModels, setImportingModels] = useState(false);
	const [isCollapsed, setIsCollapsed] = useState(false);
	const [selectedProvider, setSelectedProvider] = useState(
		initialProvider.provider,
	);
	const [showApiKey, setShowApiKey] = useState(false);
	const [isEditing, setIsEditing] = useState(!integration);
	const activeIntegration = integration ?? createdIntegration;
	const isCustomProvider = selectedProvider === CUSTOM_AI_PROVIDER_VALUE;
	const modelCount = activeIntegration?.models.length ?? 0;
	const refresh = () =>
		queryClient.invalidateQueries({ queryKey: ["ai-integrations"] });
	const finishNewProvider = async () => {
		await refresh();
		onCancel?.();
	};

	const saveMutation = useMutation({
		mutationFn: (values: {
			provider: string;
			api_url: string;
			api_key?: string;
		}) =>
			activeIntegration
				? updateAiIntegration(activeIntegration.id, values)
				: createAiIntegration({ ...values, api_key: values.api_key ?? "" }),
		onSuccess: (savedIntegration) => {
			toast.success(
				activeIntegration ? "AI provider updated" : "AI provider added",
			);
			setShowApiKey(false);
			if (activeIntegration) {
				if (!integration) {
					setCreatedIntegration(savedIntegration);
				}
				void refresh();
				setIsEditing(false);
			} else {
				setCreatedIntegration(savedIntegration);
				setIsEditing(false);
				setImportingModels(true);
			}
		},
		onError: (error) =>
			toast.error(error.message || "Failed to save AI provider"),
	});

	const deleteMutation = useMutation({
		mutationFn: () => deleteAiIntegration(activeIntegration?.id ?? 0),
		onSuccess: () => {
			toast.success("AI provider deleted");
			void refresh();
			setDeleteDialogOpen(false);
			if (!integration) {
				onCancel?.();
			}
		},
		onError: (error) =>
			toast.error(error.message || "Failed to delete AI provider"),
	});

	const form = useForm({
		defaultValues: {
			provider: initialProvider.provider,
			custom_provider_name: initialProvider.custom_provider_name,
			api_url: integration?.api_url ?? "",
			api_key: "",
		},
		validators: {
			onSubmit: z
				.object({
					provider: z.string().trim().min(1, "Provider is required"),
					custom_provider_name: z.string(),
					api_url: z
						.string()
						.trim()
						.url("API URL must be a valid URL")
						.refine(
							(value) => value.startsWith("https://"),
							"API URL must use HTTPS",
						),
					api_key: activeIntegration?.has_api_key
						? z.string()
						: z.string().trim().min(1, "API key is required"),
				})
				.superRefine((value, context) => {
					if (
						value.provider === CUSTOM_AI_PROVIDER_VALUE &&
						!value.custom_provider_name.trim()
					) {
						context.addIssue({
							code: "custom",
							path: ["custom_provider_name"],
							message: "Provider name is required for a custom provider",
						});
					}
				}),
		},
		onSubmit: ({ value }) => {
			const providerName =
				value.provider === CUSTOM_AI_PROVIDER_VALUE
					? value.custom_provider_name
					: AI_PROVIDER_PRESETS.find(
							(provider) => provider.value === value.provider,
						)?.name;

			if (!providerName) {
				return Promise.reject(new Error("Provider is required"));
			}

			return saveMutation.mutateAsync(
				toProviderPayload({
					provider: providerName,
					api_url: value.api_url,
					api_key: value.api_key,
				}),
			);
		},
	});

	useEffect(() => {
		if (integration) {
			const provider = providerFormValue(integration.provider);
			setSelectedProvider(provider.provider);
			form.reset({
				provider: provider.provider,
				custom_provider_name: provider.custom_provider_name,
				api_url: integration.api_url,
				api_key: "",
			});
		}
	}, [form, integration]);

	useEffect(() => {
		if (createdIntegration) {
			const provider = providerFormValue(createdIntegration.provider);
			setSelectedProvider(provider.provider);
			form.reset({
				provider: provider.provider,
				custom_provider_name: provider.custom_provider_name,
				api_url: createdIntegration.api_url,
				api_key: "",
			});
		}
	}, [createdIntegration, form]);

	return (
		<div className="space-y-4 border border-primary/20 bg-background p-4">
			<div className="flex flex-wrap items-center justify-between gap-2">
				<h3 className="font-semibold">
					{activeIntegration
						? `${activeIntegration.provider} (${modelCount} ${modelCount === 1 ? "Model" : "Models"})`
						: "New AI Provider"}
				</h3>
				{activeIntegration && (
					<div className="flex flex-wrap items-center justify-end gap-2">
						<Button
							type="button"
							variant="outline"
							size="sm"
							onClick={() => setIsCollapsed((collapsed) => !collapsed)}
							aria-expanded={!isCollapsed}
							aria-controls={`ai-provider-${activeIntegration.id}-details`}
							className="rounded-none"
						>
							{isCollapsed ? <ChevronDown /> : <ChevronUp />}
							{isCollapsed ? "Show Details" : "Hide Details"}
						</Button>
						{!isEditing && (
							<Button
								type="button"
								variant="outline"
								size="sm"
								onClick={() => {
									setIsEditing(true);
									setIsCollapsed(false);
								}}
								className="rounded-none"
							>
								<Pencil /> Edit
							</Button>
						)}
						<Dialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
							<DialogTrigger asChild>
								<Button
									type="button"
									variant="destructive"
									size="sm"
									className="rounded-none"
								>
									<Trash2 /> Delete Provider
								</Button>
							</DialogTrigger>
							<DialogContent className="rounded-none">
								<DialogHeader>
									<DialogTitle>Delete AI Provider</DialogTitle>
									<DialogDescription>
										This also deletes every model configured for this provider.
									</DialogDescription>
								</DialogHeader>
								<DialogFooter>
									<DialogClose asChild>
										<Button variant="outline" className="rounded-none">
											Cancel
										</Button>
									</DialogClose>
									<Button
										variant="destructive"
										onClick={() => deleteMutation.mutate()}
										disabled={deleteMutation.isPending}
										className="rounded-none"
									>
										{deleteMutation.isPending ? (
											<Spinner className="size-4" />
										) : (
											"Delete"
										)}
									</Button>
								</DialogFooter>
							</DialogContent>
						</Dialog>
					</div>
				)}
			</div>

			<div
				id={`ai-provider-${activeIntegration?.id ?? "new"}-details`}
				hidden={Boolean(activeIntegration && isCollapsed)}
			>
				{activeIntegration && !isEditing && (
					<dl className="grid gap-3 md:grid-cols-2">
						<div className="border border-dashed p-3">
							<dt className="text-muted-foreground text-xs">API URL</dt>
							<dd className="mt-1 break-all font-mono text-sm">
								{activeIntegration.api_url}
							</dd>
						</div>
						<div className="border border-dashed p-3">
							<dt className="text-muted-foreground text-xs">API Key</dt>
							<dd className="mt-1 font-mono text-sm">
								{activeIntegration.has_api_key ? "••••••••" : "—"}
							</dd>
						</div>
					</dl>
				)}

				{(!activeIntegration || isEditing) && (
					<form
						onSubmit={(event) => {
							event.preventDefault();
							form.handleSubmit();
						}}
						className="space-y-4"
					>
						<div className="grid gap-4 md:grid-cols-2">
							<form.Field name="provider">
								{(field) => (
									<Field data-invalid={field.state.meta.errors.length > 0}>
										<FieldLabel
											htmlFor={`${integration?.id ?? "new"}-provider`}
										>
											Provider
										</FieldLabel>
										<Select
											value={field.state.value || undefined}
											onValueChange={(value) => {
												field.handleChange(value);
												setSelectedProvider(value);
												const preset = AI_PROVIDER_PRESETS.find(
													(provider) => provider.value === value,
												);

												if (preset) {
													form.setFieldValue("api_url", preset.apiUrl);
												} else {
													form.setFieldValue("api_url", "");
												}
											}}
										>
											<SelectTrigger
												id={`${integration?.id ?? "new"}-provider`}
												className="w-full rounded-none"
											>
												<SelectValue placeholder="Select a provider" />
											</SelectTrigger>
											<SelectContent className="rounded-none">
												{AI_PROVIDER_PRESETS.map((provider) => (
													<SelectItem
														key={provider.value}
														value={provider.value}
													>
														{provider.name}
													</SelectItem>
												))}
												<SelectItem value={CUSTOM_AI_PROVIDER_VALUE}>
													Custom
												</SelectItem>
											</SelectContent>
										</Select>
										{field.state.meta.errors.length > 0 && (
											<FieldError>
												{String(field.state.meta.errors[0])}
											</FieldError>
										)}
									</Field>
								)}
							</form.Field>

							{isCustomProvider && (
								<form.Field name="custom_provider_name">
									{(field) => (
										<Field data-invalid={field.state.meta.errors.length > 0}>
											<FieldLabel
												htmlFor={`${integration?.id ?? "new"}-custom-provider-name`}
											>
												Provider Name
											</FieldLabel>
											<Input
												id={`${integration?.id ?? "new"}-custom-provider-name`}
												value={field.state.value}
												onBlur={field.handleBlur}
												onChange={(event) =>
													field.handleChange(event.target.value)
												}
												placeholder="e.g. Xavier AI"
												className="rounded-none"
											/>
											{field.state.meta.errors.length > 0 && (
												<FieldError>
													{String(field.state.meta.errors[0])}
												</FieldError>
											)}
										</Field>
									)}
								</form.Field>
							)}
						</div>

						<div className="grid gap-4 md:grid-cols-2">
							<form.Field name="api_url">
								{(field) => (
									<Field data-invalid={field.state.meta.errors.length > 0}>
										<FieldLabel htmlFor={`${integration?.id ?? "new"}-api-url`}>
											API URL {isCustomProvider ? "" : "(automatic)"}
										</FieldLabel>
										<Input
											id={`${integration?.id ?? "new"}-api-url`}
											value={field.state.value}
											onBlur={field.handleBlur}
											onChange={(event) =>
												field.handleChange(event.target.value)
											}
											placeholder="https://api.example.com/v1"
											readOnly={!isCustomProvider}
											title={
												isCustomProvider
													? undefined
													: "This API URL is set by the selected provider."
											}
											className={
												isCustomProvider
													? "rounded-none"
													: "cursor-not-allowed rounded-none bg-muted/20"
											}
										/>
										{field.state.meta.errors.length > 0 && (
											<FieldError>
												{String(field.state.meta.errors[0])}
											</FieldError>
										)}
									</Field>
								)}
							</form.Field>

							<form.Field name="api_key">
								{(field) => (
									<Field data-invalid={field.state.meta.errors.length > 0}>
										<FieldLabel htmlFor={`${integration?.id ?? "new"}-api-key`}>
											API Key
										</FieldLabel>
										<div className="relative">
											<Input
												id={`${integration?.id ?? "new"}-api-key`}
												type={showApiKey ? "text" : "password"}
												value={field.state.value}
												onBlur={field.handleBlur}
												onChange={(event) =>
													field.handleChange(event.target.value)
												}
												placeholder={
													activeIntegration?.has_api_key
														? "Enter a new key to replace the existing key"
														: "Enter API key"
												}
												className="rounded-none pr-10"
											/>
											<Button
												type="button"
												variant="ghost"
												size="icon"
												className="absolute top-1/2 right-1 -translate-y-1/2 rounded-none"
												aria-label={
													showApiKey ? "Hide API key" : "Show API key"
												}
												onClick={() => setShowApiKey((visible) => !visible)}
											>
												{showApiKey ? <EyeOff /> : <Eye />}
											</Button>
										</div>
										{field.state.meta.errors.length > 0 && (
											<FieldError>
												{String(field.state.meta.errors[0])}
											</FieldError>
										)}
									</Field>
								)}
							</form.Field>
						</div>

						<div className="flex justify-end gap-2">
							{(onCancel || activeIntegration) && (
								<Button
									type="button"
									variant="outline"
									onClick={() => {
										if (activeIntegration) {
											const provider = providerFormValue(
												activeIntegration.provider,
											);
											setSelectedProvider(provider.provider);
											form.reset();
											setShowApiKey(false);
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
										) : activeIntegration ? (
											"Update Provider"
										) : (
											"Add Provider"
										)}
									</Button>
								)}
							</form.Subscribe>
						</div>
					</form>
				)}

				{activeIntegration && (
					<div className="space-y-3 border-t border-dashed pt-4">
						<div className="flex items-center justify-between gap-2">
							<div>
								<h4 className="font-semibold text-sm">Models</h4>
								<p className="text-muted-foreground text-xs">
									Model ID is sent to the provider; Model Name is shown to
									users.
								</p>
							</div>
							<div className="flex flex-wrap justify-end gap-2">
								{!importingModels && (
									<Button
										type="button"
										variant="outline"
										size="sm"
										onClick={() => setImportingModels(true)}
										className="rounded-none"
									>
										Refresh Models
									</Button>
								)}
								<Button
									type="button"
									variant="outline"
									size="sm"
									onClick={() => setAddingModel(true)}
									disabled={addingModel || importingModels}
									className="rounded-none"
								>
									<Plus /> Add Model
								</Button>
							</div>
						</div>

						{importingModels && (
							<AiModelImportForm
								integrationId={activeIntegration.id}
								autoLoad
								onComplete={() => {
									setImportingModels(false);
									if (integration) {
										void refresh();
									} else {
										void finishNewProvider();
									}
								}}
								onCancel={() => {
									setImportingModels(false);
									if (integration) {
										return;
									}
									void finishNewProvider();
								}}
								onManualAdd={() => {
									setImportingModels(false);
									if (integration) {
										setAddingModel(true);
										return;
									}
									void finishNewProvider();
								}}
							/>
						)}

						{activeIntegration.models.length === 0 &&
							!addingModel &&
							!importingModels && (
								<p className="border border-dashed p-3 text-muted-foreground text-sm">
									No models configured yet.
								</p>
							)}

						{activeIntegration.models.map((model) => (
							<AiModelForm
								key={model.id}
								integrationId={activeIntegration.id}
								model={model}
							/>
						))}

						{addingModel && (
							<AiModelForm
								integrationId={activeIntegration.id}
								onCancel={() => setAddingModel(false)}
							/>
						)}
					</div>
				)}
			</div>
		</div>
	);
}
