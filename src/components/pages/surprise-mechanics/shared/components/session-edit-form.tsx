"use client";

import { useForm } from "@tanstack/react-form";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useParams } from "next/navigation";
import { toast } from "sonner";
import { z } from "zod";
import { useDialog } from "@/hooks/use-dialog";
import type { BaseSession } from "../types";
import {
	type SessionExtraField,
	SessionFormLayout,
} from "./session-form-layout";

export interface AdditionalFieldConfig extends SessionExtraField {
	getValue: (session: BaseSession) => boolean | number | string;
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

	// Build default values from session
	const defaultValues: Record<string, unknown> = {
		title: session.title,
		draw_date: session.draw_date ? new Date(session.draw_date) : null,
		draw_style: session.draw_styles?.style || "wheel",
		draw_theme: session.draw_styles?.theme || "wireframe",
		logo: (session.logo_url || null) as FormValues["logo"],
	};

	for (const field of config.additionalFields ?? []) {
		defaultValues[field.name] = field.getValue(session);
	}

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

			for (const field of config.additionalFields ?? []) {
				mutationInput[field.name] = formValue[field.name as keyof FormValues];
			}

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

	return (
		<SessionFormLayout
			form={form}
			fields={config.additionalFields ?? []}
			isPending={isPending}
			description="Basic details about your session"
			titlePlaceholder={config.titlePlaceholder}
			drawType={config.drawType}
			submitLabel={isPending ? "Updating Session..." : "Update Session"}
			onCancel={closeDialog}
		/>
	);
}
