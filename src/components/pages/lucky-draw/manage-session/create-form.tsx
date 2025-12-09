"use client";

import { useForm } from "@tanstack/react-form";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useParams } from "next/navigation";
import { toast } from "sonner";
import { z } from "zod";
import LogoUpload from "@/components/file-upload/logo-upload";
import { Button } from "@/components/ui/button";
import {
	Field,
	FieldDescription,
	FieldError,
	FieldGroup,
	FieldLabel,
} from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { useDialog } from "@/hooks/use-dialog";
import { createLuckyDrawSession } from "@/lib/api/lucky-draw";

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

type FormValues = z.infer<typeof formSchema>;

type CreateSessionMutationInput = {
	title: string;
	draw_date: string | null;
	draw_styles: {
		style: DrawStyle;
		theme: "wireframe" | "colorful" | "cartoon";
	};
	use_gifts: boolean;
	logo?: File;
};

export default function CreateForm() {
	const { closeDialog } = useDialog();
	const queryClient = useQueryClient();
	const params = useParams();
	const eventId = params.event_id as string;

	const defaultValues: FormValues = {
		title: "",
		draw_date: null,
		draw_style: "wheel",
		draw_theme: "wireframe",
		use_gifts: false,
		logo: null,
	};

	const form = useForm({
		defaultValues,
		validators: {
			onSubmit: formSchema,
		},
		onSubmit: async ({ value }) => {
			const formValue = value as FormValues;
			const dateStr = formValue.draw_date
				? formValue.draw_date.toISOString().split("T")[0]
				: null;

			await mutateAsync({
				title: formValue.title,
				draw_date: dateStr,
				draw_styles: {
					style: formValue.draw_style,
					theme: formValue.draw_theme,
				},
				use_gifts: formValue.use_gifts,
				logo:
					formValue.logo &&
					typeof formValue.logo !== "string" &&
					formValue.logo instanceof File
						? formValue.logo
						: undefined,
			});
		},
	});

	const { mutateAsync, isPending } = useMutation({
		mutationFn: (variables: CreateSessionMutationInput) =>
			createLuckyDrawSession(eventId, variables),
		onSuccess: () => {
			toast.success("Session created successfully");
			queryClient.invalidateQueries({
				queryKey: ["lucky-draw-sessions", eventId],
			});
			closeDialog();
		},
		onError: (error) => {
			const message =
				error instanceof Error ? error.message : "Failed to create session";
			toast.error(message);
		},
	});

	return (
		<form
			onSubmit={(e) => {
				e.preventDefault();
				e.stopPropagation();
				form.handleSubmit();
			}}
			className="flex w-full flex-col items-center justify-center gap-4"
		>
			<FieldGroup>
				<form.Field name="logo">
					{(field) => {
						const isInvalid =
							field.state.meta.isTouched && !field.state.meta.isValid;
						return (
							<Field
								data-invalid={isInvalid}
								className="flex flex-col items-center justify-center gap-2"
							>
								<FieldLabel htmlFor={field.name}>Logo</FieldLabel>
								<div className="aspect-square w-full max-w-[200px]">
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
								{isInvalid && <FieldError errors={field.state.meta.errors} />}
							</Field>
						);
					}}
				</form.Field>

				<form.Field name="title">
					{(field) => {
						const isInvalid =
							field.state.meta.isTouched && !field.state.meta.isValid;
						return (
							<Field data-invalid={isInvalid}>
								<FieldLabel htmlFor={field.name}>Title</FieldLabel>
								<Input
									placeholder="Session title"
									value={field.state.value}
									onBlur={field.handleBlur}
									onChange={(e) => field.handleChange(e.target.value)}
									disabled={isPending}
								/>
								{isInvalid && <FieldError errors={field.state.meta.errors} />}
							</Field>
						);
					}}
				</form.Field>

				<form.Field name="draw_date">
					{(field) => {
						const isInvalid =
							field.state.meta.isTouched && !field.state.meta.isValid;
						return (
							<Field data-invalid={isInvalid}>
								<FieldLabel htmlFor={field.name}>Draw Date</FieldLabel>
								<Input
									type="date"
									value={
										field.state.value
											? new Date(field.state.value).toISOString().split("T")[0]
											: ""
									}
									onBlur={field.handleBlur}
									onChange={(e) =>
										field.handleChange(
											e.target.value ? new Date(e.target.value) : null,
										)
									}
									disabled={isPending}
								/>
								{isInvalid && <FieldError errors={field.state.meta.errors} />}
							</Field>
						);
					}}
				</form.Field>

				<form.Field name="draw_style">
					{(field) => {
						const isInvalid =
							field.state.meta.isTouched && !field.state.meta.isValid;
						return (
							<Field
								data-invalid={isInvalid}
								className="flex flex-row items-center justify-between rounded-lg border p-4"
							>
								<div className="space-y-0.5">
									<FieldLabel htmlFor={field.name}>Draw Style</FieldLabel>
									<FieldDescription>
										Select the style of the draw
									</FieldDescription>
								</div>
								<div className="flex items-center justify-end">
									<Select
										value={field.state.value}
										onValueChange={(value) => {
											field.handleChange(value as DrawStyle);
										}}
										disabled={isPending}
									>
										<SelectTrigger>
											<SelectValue placeholder="Select a style" />
										</SelectTrigger>
										<SelectContent>
											<SelectItem value="wheel">Wheel</SelectItem>
											<SelectItem value="slot">Slot</SelectItem>
											<SelectItem value="box">Box</SelectItem>
										</SelectContent>
									</Select>
								</div>
								{isInvalid && <FieldError errors={field.state.meta.errors} />}
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
								className="flex flex-row items-center justify-between rounded-lg border p-4"
							>
								<div className="space-y-0.5">
									<FieldLabel htmlFor={field.name}>Draw Theme</FieldLabel>
									<FieldDescription>
										Select the theme for the draw style
									</FieldDescription>
								</div>
								<div className="flex items-center justify-end">
									<Select
										value={field.state.value}
										onValueChange={(value) => {
											field.handleChange(value as "wireframe" | "colorful" | "cartoon");
										}}
										disabled={isPending}
									>
										<SelectTrigger>
											<SelectValue placeholder="Select a theme" />
										</SelectTrigger>
										<SelectContent>
											<SelectItem value="wireframe">Wireframe</SelectItem>
											<SelectItem value="colorful">Colorful</SelectItem>
											<SelectItem value="cartoon">Cartoon</SelectItem>
										</SelectContent>
									</Select>
								</div>
								{isInvalid && <FieldError errors={field.state.meta.errors} />}
							</Field>
						);
					}}
				</form.Field>

				<form.Field name="use_gifts">
					{(field) => {
						const isInvalid =
							field.state.meta.isTouched && !field.state.meta.isValid;
						return (
							<Field
								data-invalid={isInvalid}
								className="flex flex-row items-center justify-between rounded-lg border p-4"
							>
								<div className="space-y-0.5">
									<FieldLabel htmlFor={field.name} className="text-base">
										Use Gifts
									</FieldLabel>
									<FieldDescription>
										Enable gift management for this session
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
								{isInvalid && <FieldError errors={field.state.meta.errors} />}
							</Field>
						);
					}}
				</form.Field>
			</FieldGroup>

			<div className="flex w-full items-center justify-end space-x-2">
				<Button
					type="button"
					variant="outline"
					onClick={closeDialog}
					disabled={isPending}
				>
					Cancel
				</Button>
				<Button type="submit" disabled={isPending}>
					{isPending ? "Creating..." : "Create Session"}
				</Button>
			</div>
		</form>
	);
}
