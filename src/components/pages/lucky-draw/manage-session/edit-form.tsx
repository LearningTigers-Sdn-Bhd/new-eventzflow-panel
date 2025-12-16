"use client";

import { useForm } from "@tanstack/react-form";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Calendar as CalendarIcon } from "lucide-react";
import { useParams } from "next/navigation";
import { format } from "date-fns";
import { toast } from "sonner";
import { z } from "zod";
import LogoUpload from "@/components/file-upload/logo-upload";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import {
	Field,
	FieldDescription,
	FieldError,
	FieldGroup,
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
import {
	getLuckyDrawSessionLogoUrl,
	updateLuckyDrawSession,
} from "@/lib/api/lucky-draw";
import type { LuckyDrawSession } from "@/lib/api/lucky-draw/response";
import { cn } from "@/lib/utils";
import DrawStylePreview from "./draw-style-preview";

type DrawStyle = "wheel" | "slot" | "box";

// Form Schema
const formSchema = z.object({
	title: z.string().min(1, "Title is required"),
	draw_date: z.date().nullable(),
	draw_style: z.enum(["wheel", "slot", "box"]),
	draw_theme: z.enum(["wireframe", "colorful", "cartoon"]),
	use_gifts: z.boolean(),
	logo: z.union([z.instanceof(File), z.string(), z.null()]).optional(),
});

interface EditFormProps {
	session: LuckyDrawSession;
}

type FormValues = z.infer<typeof formSchema>;

type UpdateSessionMutationInput = {
	eventId: string;
	sessionId: number;
	title?: string;
	draw_date?: string | null;
	draw_styles?: {
		style: DrawStyle;
		theme: "wireframe" | "colorful" | "cartoon";
	};
	use_gifts?: boolean;
	logo?: File;
	remove_logo?: boolean;
};

export default function EditForm({ session }: EditFormProps) {
	const { closeDialog } = useDialog();
	const queryClient = useQueryClient();
	const params = useParams();
	const eventId = params.event_id as string;

	const form = useForm({
		defaultValues: {
			title: session.title,
			draw_date: session.draw_date ? new Date(session.draw_date) : null,
			draw_style: session.draw_styles?.style || "wheel",
			draw_theme: session.draw_styles?.theme || "wireframe",
			use_gifts: session.use_gifts,
			logo: (session.logo
				? getLuckyDrawSessionLogoUrl(session.logo)
				: null) as FormValues["logo"],
		} satisfies Partial<FormValues>,
		validators: {
			// @ts-expect-error - Zod schema type mismatch with TanStack Form, but works at runtime
			onSubmit: formSchema,
		},
		onSubmit: async ({ value }) => {
			const formValue = value as FormValues;
			const dateStr = formValue.draw_date
				? formValue.draw_date.toISOString().split("T")[0]
				: null;

			let logoFile: File | undefined;
			let removeLogo = false;

			if (
				formValue.logo &&
				typeof formValue.logo !== "string" &&
				formValue.logo instanceof File
			) {
				logoFile = formValue.logo;
			} else if (!formValue.logo && session.logo) {
				removeLogo = true;
			}

			await mutateAsync({
				eventId,
				sessionId: session.id,
				title: formValue.title,
				draw_date: dateStr,
				draw_styles: {
					style: formValue.draw_style,
					theme: formValue.draw_theme,
				},
				use_gifts: formValue.use_gifts,
				logo: logoFile,
				remove_logo: removeLogo,
			});
		},
	});

	const { mutateAsync, isPending } = useMutation({
		mutationFn: (variables: UpdateSessionMutationInput) => {
			const {
				eventId: eventIdValue,
				sessionId,
				logo,
				remove_logo,
				...rest
			} = variables;
			return updateLuckyDrawSession(eventIdValue, sessionId, {
				...rest,
				logo,
				remove_logo,
			});
		},
		onSuccess: () => {
			toast.success("Session updated successfully");
			queryClient.invalidateQueries({
				queryKey: ["lucky-draw-sessions", eventId],
			});
			queryClient.invalidateQueries({
				queryKey: ["lucky-draw-session", eventId, session.id],
			});
			closeDialog();
		},
		onError: (error) => {
			const message =
				error instanceof Error ? error.message : "Failed to update session";
			toast.error(message);
		},
	});

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
							<div className="lg:col-span-2 space-y-8">
								{/* Session Information Section */}
								<div className="space-y-4">
									<div>
										<h3 className="font-semibold text-lg">Session Information</h3>
										<p className="text-muted-foreground text-sm">
											Basic details about your lucky draw session
										</p>
									</div>

									<div className="flex flex-col gap-6 sm:flex-row">
										{/* Logo */}
										<div className="w-full sm:w-auto">
											<form.Field name="logo">
												{(field) => {
													const isInvalid =
														field.state.meta.isTouched && !field.state.meta.isValid;
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

										{/* Title, Date, and Gifts Stack */}
										<div className="flex-1 space-y-4">
											<div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
												<form.Field name="title">
													{(field) => {
														const isInvalid =
															field.state.meta.isTouched && !field.state.meta.isValid;
														return (
															<Field data-invalid={isInvalid} orientation="vertical">
																<FieldLabel htmlFor={field.name}>
																	Session Title
																</FieldLabel>
																{isInvalid && (
																	<FieldError errors={field.state.meta.errors} />
																)}
																<Input
																	placeholder="e.g., Grand Prize Draw 2024"
																	value={field.state.value}
																	onBlur={field.handleBlur}
																	onChange={(e) => field.handleChange(e.target.value)}
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
															field.state.meta.isTouched && !field.state.meta.isValid;
														return (
															<Field data-invalid={isInvalid} orientation="vertical">
																<FieldLabel htmlFor={field.name}>Draw Date</FieldLabel>
																{isInvalid && (
																	<FieldError errors={field.state.meta.errors} />
																)}
																<Popover>
																	<PopoverTrigger asChild>
																		<Button
																			variant="outline"
																			className={cn(
																				"w-full justify-start text-left font-normal",
																				!field.state.value && "text-muted-foreground",
																			)}
																			disabled={isPending}
																		>
																			<CalendarIcon className="mr-2 h-4 w-4" />
																			{field.state.value ? (
																				format(field.state.value, "PPP")
																			) : (
																				<span>Pick a date</span>
																			)}
																		</Button>
																	</PopoverTrigger>
																	<PopoverContent className="w-auto p-0" align="start">
																		<Calendar
																			mode="single"
																			selected={field.state.value || undefined}
																			onSelect={(date) => field.handleChange(date || null)}
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

											<form.Field name="use_gifts">
												{(field) => {
													const isInvalid =
														field.state.meta.isTouched && !field.state.meta.isValid;
													return (
														<Field
															data-invalid={isInvalid}
															className="flex flex-row items-center justify-between border p-4 rounded-md"
														>
															<div className="space-y-0.5">
																<FieldLabel htmlFor={field.name} className="text-base">
																	Enable Gift System
																</FieldLabel>
																<FieldDescription>
																	Allow winners to receive gift items
																</FieldDescription>
															</div>
															<div className="flex items-center justify-end">
																<Switch
																	checked={field.state.value}
																	onCheckedChange={(checked) => {
																		field.handleChange(checked);
																	}}
																	disabled={isPending}
																/>
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

								<FieldSeparator />

								{/* Draw Configuration Section */}
								<div className="space-y-4">
									<div>
										<h3 className="font-semibold text-lg mt-4">Draw Configuration</h3>
										<p className="text-muted-foreground text-sm">
											Customize the appearance and behavior of your lucky draw
										</p>
									</div>

									<div className="grid grid-cols-1 gap-4">
										<div className="grid grid-cols-1 gap-4 md:grid-cols-2">
											<form.Field name="draw_style">
												{(field) => {
													const isInvalid =
														field.state.meta.isTouched && !field.state.meta.isValid;
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
																	value={field.state.value}
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
														field.state.meta.isTouched && !field.state.meta.isValid;
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
																	value={field.state.value}
																	onValueChange={(value) => {
																		field.handleChange(
																			value as "wireframe" | "colorful" | "cartoon",
																		);
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
																		<SelectItem value="cartoon">Cartoon</SelectItem>
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
											selector={(state) => state.values}
											children={(values) => (
												<DrawStylePreview
													style={values.draw_style}
													theme={values.draw_theme}
												/>
											)}
										/>
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
