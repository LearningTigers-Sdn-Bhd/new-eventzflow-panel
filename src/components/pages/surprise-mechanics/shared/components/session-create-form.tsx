"use client";

import { useForm } from "@tanstack/react-form";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useParams } from "next/navigation";
import { toast } from "sonner";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import {
	Field,
	FieldDescription,
	FieldError,
	FieldLabel,
	FieldSeparator,
	FieldSet,
} from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import { useDialog } from "@/hooks/use-dialog";
import type { DrawStyle, DrawTheme } from "../types";
import {
	DrawStyleField,
	DrawStylePreviewWrapper,
	DrawThemeField,
} from "./form-fields/draw-style-fields";
import {
	DrawDateField,
	LogoField,
	TitleField,
} from "./form-fields/session-basic-fields";

export interface AdditionalFieldConfig {
	type: "boolean" | "number";
	name: string;
	label: string;
	description: string;
	defaultValue: boolean | number;
	renderCondition?: (formValues: Record<string, unknown>) => boolean;
	// biome-ignore lint/suspicious/noExplicitAny: TanStack Form API requires any type
	onChangeCallback?: (checked: boolean, form: any) => void;
}

export interface SessionCreateFormConfig {
	apiFunction: (
		eventId: string,
		data: Record<string, unknown>,
	) => Promise<unknown>;
	queryKey: (eventId: string) => (string | number)[];
	dialogTitle: string;
	dialogDescription: string;
	titlePlaceholder?: string;
	additionalFields?: AdditionalFieldConfig[];
	drawType?: "gifts" | "prizes";
	successMessage?: string;
}

/**
 * Generic create form component for session creation
 * Used by both lucky-draw and roulette
 */
export function SessionCreateForm({
	config,
}: {
	config: SessionCreateFormConfig;
}) {
	const { closeDialog } = useDialog();
	const queryClient = useQueryClient();
	const params = useParams();
	const eventId = params.event_id as string;

	// Build form schema dynamically
	const schemaFields: Record<string, z.ZodTypeAny> = {
		title: z.string().min(1, "Title is required"),
		draw_date: z.date().nullable(),
		draw_style: z.enum(["wheel", "slot", "box"]),
		draw_theme: z.enum(["wireframe", "colorful", "cartoon"]),
		logo: z.union([z.instanceof(File), z.string(), z.null()]).optional(),
	};

	// Add additional fields to schema
	config.additionalFields?.forEach((field) => {
		if (field.type === "boolean") {
			schemaFields[field.name] = z.boolean();
		} else if (field.type === "number") {
			schemaFields[field.name] = z.number().min(1, "Must be at least 1");
		}
	});

	const formSchema = z.object(schemaFields);
	type FormValues = z.infer<typeof formSchema>;

	// Build default values
	const defaultValues: Record<string, unknown> = {
		title: "",
		draw_date: null,
		draw_style: "wheel",
		draw_theme: "wireframe",
		logo: null,
	};

	config.additionalFields?.forEach((field) => {
		defaultValues[field.name] = field.defaultValue;
	});

	const form = useForm({
		defaultValues: defaultValues as FormValues,
		validators: {
			onSubmit: formSchema,
		},
		onSubmit: async ({ value }) => {
			const formValue = value as FormValues;
			const dateStr =
				formValue.draw_date && formValue.draw_date instanceof Date
					? formValue.draw_date.toISOString().split("T")[0]
					: null;

			// Build mutation input
			const mutationInput: Record<string, unknown> = {
				title: formValue.title,
				draw_date: dateStr,
				draw_styles: {
					style: formValue.draw_style,
					theme: formValue.draw_theme,
				},
			};

			// Add additional fields
			config.additionalFields?.forEach((field) => {
				mutationInput[field.name] = formValue[field.name as keyof FormValues];
			});

			// Handle logo
			if (
				formValue.logo &&
				typeof formValue.logo !== "string" &&
				formValue.logo instanceof File
			) {
				mutationInput.logo = formValue.logo;
			}

			await mutateAsync(mutationInput);
		},
	});

	const { mutateAsync, isPending } = useMutation({
		mutationFn: (variables: Record<string, unknown>) =>
			config.apiFunction(eventId, variables),
		onSuccess: () => {
			toast.success(config.successMessage || "Session created successfully");
			queryClient.invalidateQueries({
				queryKey: config.queryKey(eventId),
			});
			closeDialog();
		},
		onError: (error: unknown) => {
			const message =
				error instanceof Error ? error.message : "Failed to create session";
			toast.error(message);
		},
	});

	const renderAdditionalFields = () => {
		return config.additionalFields?.map((field) => {
			if (field.type === "boolean") {
				return (
					<form.Field key={field.name} name={field.name}>
						{(formField) => {
							const isInvalid =
								formField.state.meta.isTouched && !formField.state.meta.isValid;
							return (
								<Field
									data-invalid={isInvalid}
									className="flex flex-row items-center justify-between rounded-md border p-4"
								>
									<div className="space-y-0.5">
										<FieldLabel htmlFor={formField.name} className="text-base">
											{field.label}
										</FieldLabel>
										<FieldDescription>{field.description}</FieldDescription>
									</div>
									<div className="flex items-center justify-end">
										<Switch
											checked={formField.state.value as boolean}
											onCheckedChange={(checked) => {
												formField.handleChange(checked);
												field.onChangeCallback?.(checked, form);
											}}
											disabled={isPending}
										/>
									</div>
									{isInvalid && (
										<FieldError errors={formField.state.meta.errors} />
									)}
								</Field>
							);
						}}
					</form.Field>
				);
			}

			if (field.type === "number") {
				return (
					<form.Subscribe
						key={field.name}
						selector={(state) => {
							// Check render condition if provided
							if (field.renderCondition) {
								return field.renderCondition(state.values);
							}
							// Default: show if the boolean field (is_multiple) is true
							const boolField = config.additionalFields?.find(
								(f) => f.type === "boolean",
							);
							if (boolField) {
								return state.values[boolField.name] === true;
							}
							return true;
						}}
					>
						{(shouldShow) =>
							shouldShow ? (
								<form.Field name={field.name}>
									{(formField) => {
										const isInvalid =
											formField.state.meta.isTouched &&
											!formField.state.meta.isValid;
										return (
											<Field data-invalid={isInvalid} orientation="vertical">
												<FieldLabel htmlFor={formField.name}>
													{field.label}
												</FieldLabel>
												{isInvalid && (
													<FieldError errors={formField.state.meta.errors} />
												)}
												<Input
													type="number"
													min={1}
													value={formField.state.value as number}
													onBlur={formField.handleBlur}
													onChange={(e) =>
														formField.handleChange(
															Number.parseInt(e.target.value, 10) || 1,
														)
													}
													disabled={isPending}
												/>
												<FieldDescription>{field.description}</FieldDescription>
											</Field>
										);
									}}
								</form.Field>
							) : null
						}
					</form.Subscribe>
				);
			}

			return null;
		});
	};

	return (
		<div className="mx-auto w-full max-w-8xl px-8">
			<form
				onSubmit={(e) => {
					e.preventDefault();
					e.stopPropagation();
					form.handleSubmit();
				}}
			>
				<FieldSet>
					<FieldSeparator />
					<div className="grid grid-cols-1 gap-8 lg:grid-cols-3">
						{/* Left Column: Form Fields */}
						<div className="space-y-8 lg:col-span-2">
							{/* Session Information Section */}
							<div className="space-y-4">
								<div>
									<h3 className="font-semibold text-lg">Session Information</h3>
									<p className="text-muted-foreground text-sm">
										{config.dialogDescription}
									</p>
								</div>

								<div className="flex flex-col gap-6 sm:flex-row">
									{/* Logo */}
									<div className="w-full sm:w-auto">
										<form.Field name="logo">
											{(field) => (
												<LogoField field={field} isPending={isPending} />
											)}
										</form.Field>
									</div>

									{/* Title, Date, and Additional Fields Stack */}
									<div className="flex-1 space-y-4">
										<div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
											<form.Field name="title">
												{(field) => (
													<TitleField
														field={field}
														isPending={isPending}
														placeholder={config.titlePlaceholder}
													/>
												)}
											</form.Field>

											<form.Field name="draw_date">
												{(field) => (
													<DrawDateField field={field} isPending={isPending} />
												)}
											</form.Field>
										</div>

										{/* Additional Fields */}
										{renderAdditionalFields()}
									</div>
								</div>
							</div>

							<FieldSeparator />

							{/* Draw Configuration Section */}
							<div className="space-y-4">
								<div>
									<h3 className="mt-4 font-semibold text-lg">
										Draw Configuration
									</h3>
									<p className="text-muted-foreground text-sm">
										Customize the appearance and behavior of your draw
									</p>
								</div>

								<div className="grid grid-cols-1 gap-4">
									<div className="grid grid-cols-1 gap-4 md:grid-cols-2">
										<form.Field name="draw_style">
											{(field) => (
												<DrawStyleField field={field} isPending={isPending} />
											)}
										</form.Field>

										<form.Field name="draw_theme">
											{(field) => (
												<DrawThemeField field={field} isPending={isPending} />
											)}
										</form.Field>
									</div>
								</div>
							</div>
						</div>

						{/* Right Column: Preview */}
						<div className="lg:col-span-1">
							<div className="sticky top-6">
								<form.Subscribe
									selector={(state) => ({
										draw_style: state.values.draw_style,
										draw_theme: state.values.draw_theme,
									})}
								>
									{(values) => (
										<DrawStylePreviewWrapper
											drawStyle={values.draw_style as DrawStyle}
											drawTheme={values.draw_theme as DrawTheme}
											drawType={
												config.drawType === "gifts" ? "prizes" : config.drawType
											}
										/>
									)}
								</form.Subscribe>
							</div>
						</div>
					</div>

					<FieldSeparator />

					{/* Action Buttons */}
					<div className="flex justify-end gap-2">
						<Button
							type="button"
							variant="outline"
							onClick={closeDialog}
							disabled={isPending}
						>
							Cancel
						</Button>
						<Button type="submit" disabled={isPending}>
							{isPending ? "Creating Session..." : "Create Session"}
						</Button>
					</div>
				</FieldSet>
			</form>
		</div>
	);
}
