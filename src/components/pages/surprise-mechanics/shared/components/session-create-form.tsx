"use client";

import { useForm } from "@tanstack/react-form";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useParams } from "next/navigation";
import { toast } from "sonner";
import { z } from "zod";
import { useDialog } from "@/hooks/use-dialog";
import {
	type SessionExtraField,
	SessionFormLayout,
} from "./session-form-layout";

export interface AdditionalFieldConfig extends SessionExtraField {
	defaultValue: boolean | number | string;
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

	for (const field of config.additionalFields ?? []) {
		if (field.type === "boolean") {
			schemaFields[field.name] = z.boolean();
		} else if (field.type === "number") {
			schemaFields[field.name] = z.number().min(1, "Must be at least 1");
		} else {
			schemaFields[field.name] = z.string();
		}
	}

	const formSchema = z.object(schemaFields);
	type FormValues = z.infer<typeof formSchema>;

	const defaultValues: Record<string, unknown> = {
		title: "",
		draw_date: null,
		draw_style: "wheel",
		draw_theme: "wireframe",
		logo: null,
	};

	for (const field of config.additionalFields ?? []) {
		defaultValues[field.name] = field.defaultValue;
	}

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

			for (const field of config.additionalFields ?? []) {
				mutationInput[field.name] = formValue[field.name as keyof FormValues];
			}

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

	return (
		<SessionFormLayout
			form={form}
			fields={config.additionalFields ?? []}
			isPending={isPending}
			description={config.dialogDescription}
			titlePlaceholder={config.titlePlaceholder}
			drawType={config.drawType}
			submitLabel={isPending ? "Creating Session..." : "Create Session"}
			onCancel={closeDialog}
		/>
	);
}
