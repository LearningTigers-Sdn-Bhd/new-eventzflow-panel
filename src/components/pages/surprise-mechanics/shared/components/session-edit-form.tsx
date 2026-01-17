"use client";

import { useForm } from "@tanstack/react-form";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { format } from "date-fns";
import { Calendar as CalendarIcon } from "lucide-react";
import { useParams } from "next/navigation";
import { toast } from "sonner";
import { z } from "zod";
import LogoUpload from "@/components/file-upload/logo-upload";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import {
	Field,
	FieldDescription,
	FieldError,
	FieldLabel,
	FieldSeparator,
	FieldSet,
} from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import {
	Popover,
	PopoverContent,
	PopoverTrigger,
} from "@/components/ui/popover";
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { useDialog } from "@/hooks/use-dialog";
import { cn } from "@/lib/utils";
import DrawStylePreview from "../draw-style-preview";
import type { BaseSession, DrawStyle, DrawTheme } from "../types";

export interface AdditionalFieldConfig {
	type: "boolean" | "number";
	name: string;
	label: string;
	description: string;
	getValue: (session: BaseSession) => boolean | number;
	// biome-ignore lint/suspicious/noExplicitAny: TanStack Form API requires any type
	onChangeCallback?: (checked: boolean, form: any) => void;
}

export interface SessionEditFormConfig {
	apiFunction: (
		eventId: string,
		sessionId: number,
		data: Record<string, unknown>,
	) => Promise<unknown>;
	queryKey: (eventId: string) => (string | number)[];
	sessionQueryKey?: (sessionId: number) => (string | number)[];
	dialogTitle: string;
	titlePlaceholder?: string;
	additionalFields?: AdditionalFieldConfig[];
	drawType?: "gifts" | "prizes";
	successMessage?: string;
}

interface SessionEditFormProps<T extends BaseSession> {
	session: T;
	config: SessionEditFormConfig;
}

/**
 * Generic edit form component for session updates
 * Used by both lucky-draw and roulette
 */
export function SessionEditForm<T extends BaseSession>({
	session,
	config,
}: SessionEditFormProps<T>) {
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
	config.additionalFields?.forEach((field: AdditionalFieldConfig) => {
		if (field.type === "boolean") {
			schemaFields[field.name] = z.boolean();
		} else if (field.type === "number") {
			schemaFields[field.name] = z.number().min(1, "Must be at least 1");
		}
	});

	const formSchema = z.object(schemaFields);
	type FormValues = z.infer<typeof formSchema>;

	// Build default values from session
	const defaultValues: Record<string, unknown> = {
		title: session.title,
		draw_date: session.draw_date ? new Date(session.draw_date) : null,
		draw_style: session.draw_styles?.style || "wheel",
		draw_theme: session.draw_styles?.theme || "wireframe",
		logo: (session.logo_url || null) as FormValues["logo"],
	};

	config.additionalFields?.forEach((field: AdditionalFieldConfig) => {
		defaultValues[field.name] = field.getValue(session);
	});

	const form = useForm({
		defaultValues: defaultValues as Partial<FormValues>,
		validators: {
			onSubmit: formSchema,
		},
		onSubmit: async ({ value }) => {
			const formValue = value as FormValues;
			const dateStr =
				formValue.draw_date && formValue.draw_date instanceof Date
					? formValue.draw_date.toISOString().split("T")[0]
					: null;

			// Handle logo
			let logoFile: File | undefined;
			let removeLogo = false;

			if (
				formValue.logo &&
				typeof formValue.logo !== "string" &&
				formValue.logo instanceof File
			) {
				logoFile = formValue.logo;
			} else if (!formValue.logo && session.logo_url) {
				removeLogo = true;
			}

			// Build mutation input
			const mutationInput: Record<string, unknown> = {
				sessionId: session.id,
				title: formValue.title,
				draw_date: dateStr,
				draw_styles: {
					style: formValue.draw_style,
					theme: formValue.draw_theme,
				},
				logo: logoFile,
				remove_logo: removeLogo,
			};

			// Add additional fields
			config.additionalFields?.forEach((field: AdditionalFieldConfig) => {
				mutationInput[field.name] = formValue[field.name as keyof FormValues];
			});

			await mutateAsync(mutationInput);
		},
	});

	const { mutateAsync, isPending } = useMutation({
		mutationFn: (variables: Record<string, unknown>) => {
			const { sessionId, logo, remove_logo, ...rest } = variables;
			return config.apiFunction(eventId, sessionId as number, {
				...rest,
				logo,
				remove_logo,
			});
		},
		onSuccess: () => {
			toast.success(config.successMessage || "Session updated successfully");
			queryClient.invalidateQueries({
				queryKey: config.queryKey(eventId),
			});
			if (config.sessionQueryKey) {
				queryClient.invalidateQueries({
					queryKey: config.sessionQueryKey(session.id),
				});
			}
			closeDialog();
		},
		onError: (error: unknown) => {
			const message =
				error instanceof Error ? error.message : "Failed to update session";
			toast.error(message);
		},
	});

	const renderAdditionalFields = () => {
		return config.additionalFields?.map((field: AdditionalFieldConfig) => {
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
							// Check render condition - show if the boolean field (is_multiple) is true
							const boolField = config.additionalFields?.find(
								(f: AdditionalFieldConfig) => f.type === "boolean",
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
										Basic details about your session
									</p>
								</div>

								<div className="flex flex-col gap-6 sm:flex-row">
									{/* Logo */}
									<div className="w-full sm:w-auto">
										<form.Field name="logo">
											{(field) => {
												const isInvalid =
													field.state.meta.isTouched &&
													!field.state.meta.isValid;
												return (
													<Field
														data-invalid={isInvalid}
														orientation="vertical"
														className="flex flex-col items-center justify-start gap-2"
													>
														<div className="relative aspect-square w-full max-w-[200px]">
															<LogoUpload
																value={
																	field.state.value === null ||
																	field.state.value === undefined
																		? undefined
																		: (field.state.value as string | File)
																}
																onChange={(file) => {
																	field.handleChange(file ?? null);
																}}
																disabled={isPending}
															/>
														</div>
														<div className="flex flex-col items-center gap-1 text-center">
															<FieldLabel htmlFor={field.name}>
																Session Logo
															</FieldLabel>
															<FieldDescription>
																Upload a logo for this session
															</FieldDescription>
														</div>
														{isInvalid && (
															<FieldError errors={field.state.meta.errors} />
														)}
													</Field>
												);
											}}
										</form.Field>
									</div>

									{/* Title, Date, and Additional Fields Stack */}
									<div className="flex-1 space-y-4">
										<div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
											<form.Field name="title">
												{(field) => {
													const isInvalid =
														field.state.meta.isTouched &&
														!field.state.meta.isValid;
													return (
														<Field
															data-invalid={isInvalid}
															orientation="vertical"
														>
															<FieldLabel htmlFor={field.name}>
																Session Title
															</FieldLabel>
															{isInvalid && (
																<FieldError errors={field.state.meta.errors} />
															)}
															<Input
																placeholder={config.titlePlaceholder}
																value={field.state.value as string}
																onBlur={field.handleBlur}
																onChange={(e) =>
																	field.handleChange(e.target.value)
																}
																disabled={isPending}
																required
															/>
															<FieldDescription>
																Give your session a memorable name
															</FieldDescription>
														</Field>
													);
												}}
											</form.Field>

											<form.Field name="draw_date">
												{(field) => {
													const isInvalid =
														field.state.meta.isTouched &&
														!field.state.meta.isValid;
													return (
														<Field
															data-invalid={isInvalid}
															orientation="vertical"
														>
															<FieldLabel htmlFor={field.name}>
																Draw Date
															</FieldLabel>
															{isInvalid && (
																<FieldError errors={field.state.meta.errors} />
															)}
															<Popover>
																<PopoverTrigger asChild>
																	<Button
																		variant="outline"
																		className={cn(
																			"w-full justify-start text-left font-normal",
																			!field.state.value &&
																				"text-muted-foreground",
																		)}
																		disabled={isPending}
																	>
																		<CalendarIcon className="mr-2 h-4 w-4" />
																		{field.state.value &&
																		field.state.value instanceof Date ? (
																			format(field.state.value, "PPP")
																		) : (
																			<span>Pick a date</span>
																		)}
																	</Button>
																</PopoverTrigger>
																<PopoverContent
																	className="w-auto p-0"
																	align="start"
																>
																	<Calendar
																		mode="single"
																		selected={
																			field.state.value instanceof Date
																				? field.state.value
																				: undefined
																		}
																		onSelect={(date) =>
																			field.handleChange(date || null)
																		}
																		initialFocus
																		disabled={isPending}
																	/>
																</PopoverContent>
															</Popover>
															<FieldDescription>
																When will this draw take place?
															</FieldDescription>
														</Field>
													);
												}}
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
											{(field) => {
												const isInvalid =
													field.state.meta.isTouched &&
													!field.state.meta.isValid;
												return (
													<Field
														data-invalid={isInvalid}
														className="flex flex-col border p-4"
													>
														<div className="mb-2 space-y-0.5">
															<FieldLabel htmlFor={field.name}>
																Draw Style
															</FieldLabel>
															<FieldDescription>
																Choose how winners are selected
															</FieldDescription>
														</div>
														<div className="flex items-center">
															<Select
																value={field.state.value as string}
																onValueChange={(value) => {
																	field.handleChange(value as DrawStyle);
																}}
																disabled={isPending}
															>
																<SelectTrigger className="w-full">
																	<SelectValue placeholder="Select style" />
																</SelectTrigger>
																<SelectContent>
																	<SelectItem value="wheel">
																		🎡 Wheel
																	</SelectItem>
																	<SelectItem value="slot">
																		🎰 Slot Machine
																	</SelectItem>
																	<SelectItem value="box">📦 Box</SelectItem>
																</SelectContent>
															</Select>
														</div>
														{isInvalid && (
															<FieldError errors={field.state.meta.errors} />
														)}
													</Field>
												);
											}}
										</form.Field>

										<form.Field name="draw_theme">
											{(field) => {
												const isInvalid =
													field.state.meta.isTouched &&
													!field.state.meta.isValid;
												return (
													<Field
														data-invalid={isInvalid}
														className="flex flex-col border p-4"
													>
														<div className="mb-2 space-y-0.5">
															<FieldLabel htmlFor={field.name}>
																Draw Theme
															</FieldLabel>
															<FieldDescription>
																Visual style for the draw interface
															</FieldDescription>
														</div>
														<div className="flex items-center">
															<Select
																value={field.state.value as string}
																onValueChange={(value) => {
																	field.handleChange(value as DrawTheme);
																}}
																disabled={isPending}
															>
																<SelectTrigger className="w-full">
																	<SelectValue placeholder="Select theme" />
																</SelectTrigger>
																<SelectContent>
																	<SelectItem value="wireframe">
																		Wireframe
																	</SelectItem>
																	<SelectItem value="colorful">
																		Colorful
																	</SelectItem>
																	<SelectItem value="cartoon">
																		Cartoon
																	</SelectItem>
																</SelectContent>
															</Select>
														</div>
														{isInvalid && (
															<FieldError errors={field.state.meta.errors} />
														)}
													</Field>
												);
											}}
										</form.Field>
									</div>
								</div>
							</div>
						</div>

						{/* Right Column: Preview */}
						<div className="lg:col-span-1">
							<div className="sticky top-6">
								<div className="w-full rounded-lg border bg-muted/10 p-4">
									<form.Subscribe
										selector={(state) => ({
											draw_style: state.values.draw_style,
											draw_theme: state.values.draw_theme,
										})}
									>
										{(values) => {
											const drawType: "participants" | "prizes" | undefined =
												config.drawType === "gifts"
													? "prizes"
													: config.drawType === "prizes"
														? "prizes"
														: undefined;
											return (
												<DrawStylePreview
													style={values.draw_style as DrawStyle}
													theme={values.draw_theme as DrawTheme}
													drawType={drawType}
												/>
											);
										}}
									</form.Subscribe>
								</div>
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
							{isPending ? "Updating Session..." : "Update Session"}
						</Button>
					</div>
				</FieldSet>
			</form>
		</div>
	);
}
